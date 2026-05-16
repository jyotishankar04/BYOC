import type { PrismaClient, ShareAccessType, ShareLinkStatus } from "@/generated/prisma/client";
import { AppError } from "@/core/errors";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { ActivityService } from "@/modules/activity/activity.service";
import { ShareLinksRepository, type ShareLinkListQuery } from "./share-links.repository";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { getProvider } from "@/shared/storage/storage.factory";
import { decrypt } from "@/shared/lib/crypto";
import env from "@/config/env";
import { SubscriptionSnapshotService } from "@/modules/billing/subscription-snapshot.service";
import { assertFeatureAccess, assertQuotaAvailable, buildQuotaSummary } from "@/modules/billing/subscription-access";
import { appSettings } from "@/config/app-settings";
import { EmailQueueService } from "@/core/mail/mail.queue";

export class ShareLinksService {
  private repo: ShareLinksRepository;
  private notificationsService: NotificationsService;
  private activityService: ActivityService;

  constructor(private prisma: PrismaClient) {
    this.repo = new ShareLinksRepository(prisma);
    this.notificationsService = new NotificationsService(prisma);
    this.activityService = new ActivityService(prisma);
  }

  async createShareLink(data: {
    fileId?: string;
    folderId?: string;
    workspaceId: string;
    userId: string;
    accessType: ShareAccessType;
    password?: string;
    expiresAt?: Date | null;
    allowDownload?: boolean;
  }) {
    const { fileId, folderId, workspaceId, userId, accessType, password, expiresAt, allowDownload } = data;

    // 1. Check target existence
    const file = fileId ? await this.repo.findFileById(fileId, workspaceId) : null;
    const folder = folderId ? await this.repo.findFolderById(folderId, workspaceId) : null;
    if (fileId && !file) {
      throw new AppError("File not found", 404, "NOT_FOUND");
    }
    if (folderId && !folder) {
      throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
    }

    // 2. Check workspace security policies
    const security = await this.repo.findWorkspaceSecurity(workspaceId);
    if (security?.disablePublicSharing && accessType === "Public") {
      throw new AppError("Public sharing is disabled for this workspace", 403, "FORBIDDEN");
    }
    if (security?.requirePasswordForPublicLinks && accessType === "Public" && !password) {
      throw new AppError("Password is required for public links", 400, "BAD_REQUEST");
    }

    // 3. Check plan features and quotas
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getWorkspaceSnapshot(workspaceId);
    const activeLinkQuota = buildQuotaSummary(
      snapshot.limits.maxActiveShareLinks,
      snapshot.usage.activeLinksCount,
    );
    assertQuotaAvailable(
      activeLinkQuota,
      "Active share link limit reached for this workspace plan",
      "SHARE_LINK_LIMIT_REACHED",
    );

    if (accessType === "PasswordProtected") {
      if (!appSettings.getConfig().features.passwordProtectedLinks) {
        throw new AppError(
          "Password-protected links are currently disabled on this platform",
          403,
          "FEATURE_DISABLED",
        );
      }
      assertFeatureAccess(
        snapshot.plan,
        "passwordProtectedLinks",
        "Upgrade to Pro to create password-protected share links",
        "PASSWORD_PROTECTED_LINKS_LOCKED",
      );
    }

    if (accessType === "Private") {
      assertFeatureAccess(
        snapshot.plan,
        "teamManagement",
        "Team plan required for private invite-only sharing",
        "PRIVATE_SHARING_LOCKED",
      );
    }

    // 4. Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // 5. Generate slug with collision retry
    let slug: string = "";
    for (let i = 0; i < 3; i++) {
      const candidate = nanoid(10);
      const existing = await this.repo.findBySlug(candidate);
      if (!existing) {
        slug = candidate;
        break;
      }
    }
    if (!slug) throw new AppError("Failed to generate unique share slug", 500);

    // 6. Create link
    const shareLink = await this.repo.createShareLink({
      fileId,
      folderId,
      workspaceId,
      userId,
      slug,
      accessType,
      passwordHash,
      expiresAt,
      allowDownload,
    });

    // 7. Log activity and notify
    await this.activityService.logActivity({
      workspaceId,
      userId,
      action: "SHARE_LINK_CREATE",
      details: `Created ${accessType} share link for ${file?.name ?? folder?.name ?? "item"}`,
    });

    if (file && file.uploadedById !== userId) {
      await this.notificationsService.createNotification({
        userId: file.uploadedById,
        workspaceId,
        type: "FILE_SHARED",
        title: "File Shared",
        message: `Your file "${file.name}" was shared by another user.`,
      });

      const [fileOwner, sharer] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: file.uploadedById }, select: { email: true, name: true } }),
        this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      ]);
      if (fileOwner?.email) {
        EmailQueueService.enqueue({
          type: "share_link_created",
          to: fileOwner.email,
          ownerName: fileOwner.name,
          sharerName: sharer?.name ?? "A workspace member",
          fileName: file.name,
          linkUrl: `${env.FRONTEND_URL}/s/${slug}`,
        });
      }
    }

    return {
      ...shareLink,
      shareUrl: `${env.FRONTEND_URL}/s/${slug}`,
    };
  }

  async listShareLinks(workspaceId: string, query: ShareLinkListQuery) {
    const result = await this.repo.listShareLinks(workspaceId, query);
    return {
      ...result,
      links: result.links.map((link) => ({
        ...link,
        shareUrl: `${env.FRONTEND_URL}/s/${link.slug}`,
      })),
    };
  }

  async getShareLink(workspaceId: string, linkId: string) {
    const link = await this.repo.findById(linkId, workspaceId);
    if (!link) throw new AppError("Share link not found", 404);
    return {
      ...link,
      shareUrl: `${env.FRONTEND_URL}/s/${link.slug}`,
    };
  }

  async updateShareLink(workspaceId: string, linkId: string, data: any) {
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getWorkspaceSnapshot(workspaceId);

    // Re-validate security if accessType changes
    if (data.accessType) {
      const security = await this.repo.findWorkspaceSecurity(workspaceId);
      if (security?.disablePublicSharing && data.accessType === "Public") {
        throw new AppError("Public sharing is disabled", 403);
      }

      if (data.accessType === "PasswordProtected") {
        assertFeatureAccess(
          snapshot.plan,
          "passwordProtectedLinks",
          "Upgrade to Pro to create password-protected share links",
          "PASSWORD_PROTECTED_LINKS_LOCKED",
        );
      }

      if (data.accessType === "Private") {
        assertFeatureAccess(
          snapshot.plan,
          "teamManagement",
          "Team plan required for private invite-only sharing",
          "PRIVATE_SHARING_LOCKED",
        );
      }
    }

    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    const updated = await this.repo.updateShareLink(linkId, workspaceId, data);
    return {
      ...updated,
      shareUrl: `${env.FRONTEND_URL}/s/${updated.slug}`,
    };
  }

  async deleteShareLink(workspaceId: string, linkId: string, userId: string) {
    const link = await this.repo.findShareLinkWithFile(linkId, workspaceId);
    if (!link) throw new AppError("Share link not found", 404);

    await this.repo.deleteShareLink(linkId, workspaceId);

    await this.activityService.logActivity({
      workspaceId,
      userId,
      action: "SHARE_LINK_DELETE",
      details: `Deleted share link for ${link.file?.name ?? "item"}`,
    });
  }

  async accessPublicLink(slug: string, options: { password?: string | undefined; ip?: string | undefined; userAgent?: string | undefined; userId?: string | undefined }) {
    const link = await this.repo.findBySlug(slug);
    if (!link) throw new AppError("Link not found", 404);

    // 1. Check status
    if (link.status !== "Active") {
      throw new AppError(`This link is ${link.status.toLowerCase()}`, 410);
    }

    // 2. Check expiry
    if (link.expiresAt && link.expiresAt < new Date()) {
      await this.repo.updateStatus(link.id, "Expired");
      throw new AppError("This link has expired", 410);
    }

    // 3. Check password
    if (link.accessType === "PasswordProtected") {
      if (!options.password) {
        throw new AppError("Password required", 401, "PASSWORD_REQUIRED");
      }
      const match = await bcrypt.compare(options.password, link.passwordHash!);
      if (!match) {
        throw new AppError("Invalid password", 401, "INVALID_PASSWORD");
      }
    }

    // 4. Private links — only workspace members can access
    if (link.accessType === "Private") {
      const workspaceId = link.workspaceId;
      if (!options.userId) {
        throw new AppError("Authentication required to access private links", 401, "AUTH_REQUIRED");
      }
      const member = await this.prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: options.userId } },
        select: { id: true },
      });
      if (!member) {
        throw new AppError("You don't have access to this private link", 403, "FORBIDDEN");
      }
    }

    // 5. Record visit (skip for private links since they're authenticated)
    if (link.accessType !== "Private") {
      await this.repo.recordVisit(link.id, { ipAddress: options.ip, userAgent: options.userAgent });
    }

    // 6. Generate presigned URLs
    const file = link.file;
    if (file) {
      const providerRecord = file.workspace.storageProvider;
      if (!providerRecord) throw new AppError("Storage provider not configured", 500);

      const decrypted = JSON.parse(decrypt(providerRecord.encryptedCreds));
      const provider = getProvider(
        providerRecord.providerType,
        decrypted,
        providerRecord.bucket,
        providerRecord.region || undefined
      );

      const previewUrl = await provider.generateGetPresignedUrl(file.storagePath, 120, "inline");
      let downloadUrl: string | undefined;

      if (link.allowDownload) {
        downloadUrl = await provider.generateGetPresignedUrl(file.storagePath, 300, `attachment; filename="${file.name}"`);
      }

      return {
        kind: "file" as const,
        fileName: file.name,
        fileType: file.mimeType,
        fileSize: file.size,
        allowDownload: link.allowDownload,
        previewUrl,
        downloadUrl,
      };
    }

    const folder = (link as typeof link & { folder: NonNullable<typeof link.folder> }).folder;
    if (!folder) throw new AppError("Shared item no longer exists", 404);

    const providerRecord = folder.workspace.storageProvider;
    if (!providerRecord) throw new AppError("Storage provider not configured", 500);

    const decrypted = JSON.parse(decrypt(providerRecord.encryptedCreds));
    const provider = getProvider(
      providerRecord.providerType,
      decrypted,
      providerRecord.bucket,
      providerRecord.region || undefined
    );

    const files = await this.repo.findFolderFiles(
      folder.id,
      folder.path,
      link.workspaceId,
    );

    const items = await Promise.all(
      files.map(async (folderFile) => ({
        id: folderFile.id,
        name: folderFile.name,
        size: folderFile.size,
        mimeType: folderFile.mimeType,
        relativePath:
          folderFile.folder && folderFile.folder.path.startsWith(folder.path)
            ? `${folderFile.folder.path.slice(folder.path.length)}${folderFile.name}`
            : folderFile.name,
        downloadUrl: link.allowDownload
          ? await provider.generateGetPresignedUrl(
              folderFile.storagePath,
              300,
              `attachment; filename="${folderFile.name}"`,
            )
          : undefined,
      })),
    );

    return {
      kind: "folder" as const,
      folderName: folder.name,
      itemCount: items.length,
      allowDownload: link.allowDownload,
      items,
    };
  }
}
