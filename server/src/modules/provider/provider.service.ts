import {
  StorageProviderStatus,
  type PrismaClient,
} from "@/generated/prisma/client";
import { AppError } from "@/core/errors";
import { encrypt, decrypt } from "@/shared/lib/crypto";
import {
  getProvider,
  type DecryptedCreds,
} from "@/shared/storage/storage.factory";
import { ProviderRepository } from "./provider.repository";
import type {
  ConnectProviderDto,
  UpdateProviderDto,
  ProviderRow,
} from "./provider.interface";
import type { IStorageProvider } from "@/shared/storage/storage.interface";
import { enqueueSyncJob } from "@/jobs/bucket-sync.job";
import { broadcast } from "@/modules/events/events.service";
import { SubscriptionSnapshotService } from "@/modules/billing/subscription-snapshot.service";
import { assertProviderAccess } from "@/modules/billing/subscription-access";
import { cache } from "@/shared/cache/cache.service";

export class ProviderService {
  private repository: ProviderRepository;

  constructor(private prisma: PrismaClient) {
    this.repository = new ProviderRepository(prisma);
  }

  async getProvider(workspaceId: string): Promise<ProviderRow | null> {
    const row = await this.repository.findUnique(workspaceId);
    if (!row) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { encryptedCreds: _, ...safe } = row;
    return safe;
  }

  async connectProvider(
    workspaceId: string,
    dto: ConnectProviderDto,
  ): Promise<ProviderRow> {
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getWorkspaceSnapshot(workspaceId);
    assertProviderAccess(snapshot.plan, dto.providerType);

    const creds: DecryptedCreds = {
      accessKeyId: dto.accessKeyId,
      secretAccessKey: dto.secretAccessKey,
      endpointUrl: dto.endpointUrl,
    };

    const result = await getProvider(
      dto.providerType,
      creds,
      dto.bucket,
      dto.region,
    ).verifyConnection();

    if (!result.ok) {
      throw new AppError(
        result.error ?? "Provider connection failed",
        422,
        "PROVIDER_AUTH_ERROR",
      );
    }

    const encryptedCreds = encrypt(JSON.stringify(creds));
    const accessKeyIdHint = dto.accessKeyId.slice(-4);

    const row = await this.repository.upsert(workspaceId, {
      providerType: dto.providerType,
      bucket: dto.bucket,
      region: dto.region ?? null,
      endpointUrl: dto.endpointUrl ?? null,
      accessKeyIdHint,
      encryptedCreds,
      status: StorageProviderStatus.Active,
      syncStatus: "pending",
      lastChecked: new Date(),
    });

    await cache.del(`provider:${workspaceId}`);
    enqueueSyncJob(workspaceId);

    broadcast(workspaceId, {
      type: "provider.status",
      payload: { status: StorageProviderStatus.Active, lastChecked: row.lastChecked!.toISOString() },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { encryptedCreds: _, ...safe } = row;
    return safe;
  }

  async updateProvider(
    workspaceId: string,
    dto: UpdateProviderDto,
  ): Promise<ProviderRow> {
    const existing = await this.repository.findUnique(workspaceId);
    if (!existing) throw new AppError("No provider connected", 404, "NOT_FOUND");
    const nextProviderType = dto.providerType ?? existing.providerType;
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getWorkspaceSnapshot(workspaceId);
    assertProviderAccess(snapshot.plan, nextProviderType);

    const prevCreds = JSON.parse(decrypt(existing.encryptedCreds)) as DecryptedCreds;
    const newCreds: DecryptedCreds = {
      accessKeyId: dto.accessKeyId ?? prevCreds.accessKeyId,
      secretAccessKey: dto.secretAccessKey ?? prevCreds.secretAccessKey,
      endpointUrl: dto.endpointUrl ?? prevCreds.endpointUrl,
    };

    const bucket = dto.bucket ?? existing.bucket;
    const region = dto.region ?? existing.region ?? undefined;
    const providerType = nextProviderType;

    const result = await getProvider(
      providerType,
      newCreds,
      bucket,
      region,
    ).verifyConnection();

    if (!result.ok) {
      throw new AppError(
        result.error ?? "Provider connection failed",
        422,
        "PROVIDER_AUTH_ERROR",
      );
    }

    const encryptedCreds = encrypt(JSON.stringify(newCreds));
    const accessKeyIdHint = newCreds.accessKeyId.slice(-4);

    const row = await this.repository.update(workspaceId, {
      providerType,
      bucket,
      region: region ?? null,
      endpointUrl: newCreds.endpointUrl ?? null,
      accessKeyIdHint,
      encryptedCreds,
      status: StorageProviderStatus.Active,
      lastChecked: new Date(),
    });

    await cache.del(`provider:${workspaceId}`);

    broadcast(workspaceId, {
      type: "provider.status",
      payload: { status: StorageProviderStatus.Active, lastChecked: row.lastChecked!.toISOString() },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { encryptedCreds: _, ...safe } = row;
    return safe;
  }

  async disconnectProvider(workspaceId: string): Promise<void> {
    const existing = await this.repository.findUnique(workspaceId);
    if (!existing) throw new AppError("No provider connected", 404, "NOT_FOUND");

    await this.repository.update(workspaceId, {
      status: StorageProviderStatus.Invalid,
    });
  }

  async healthCheck(workspaceId: string): Promise<{
    status: StorageProviderStatus;
    latencyMs: number;
    lastChecked: Date;
  }> {
    const row = await this.repository.findUnique(workspaceId);
    if (!row) throw new AppError("No provider connected", 404, "NOT_FOUND");

    const creds = JSON.parse(decrypt(row.encryptedCreds)) as DecryptedCreds;
    const provider = getProvider(row.providerType, creds, row.bucket, row.region ?? undefined);

    const start = Date.now();
    const result = await provider.verifyConnection();
    const latencyMs = Date.now() - start;

    const status = result.ok
      ? StorageProviderStatus.Active
      : StorageProviderStatus.Error;
    const lastChecked = new Date();

    await this.repository.update(workspaceId, { status, lastChecked });

    broadcast(workspaceId, {
      type: "provider.status",
      payload: { status, lastChecked: lastChecked.toISOString() },
    });

    return { status, latencyMs, lastChecked };
  }

  async getDecryptedProvider(workspaceId: string): Promise<IStorageProvider> {
    type CachedRow = { providerType: string; encryptedCreds: string; bucket: string; region: string | null; status: string };
    const row = await cache.wrap<CachedRow | null>(`provider:${workspaceId}`, 600, () =>
      this.repository.findUnique(workspaceId) as Promise<CachedRow | null>,
    );
    if (!row) throw new AppError("No provider connected", 404, "NOT_FOUND");
    if (row.status === StorageProviderStatus.Invalid) {
      throw new AppError("Provider is disconnected", 409, "PROVIDER_DISCONNECTED");
    }

    const creds = JSON.parse(decrypt(row.encryptedCreds)) as DecryptedCreds;
    return getProvider(row.providerType as never, creds, row.bucket, row.region ?? undefined);
  }
}
