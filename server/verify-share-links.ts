import { db } from "./src/config/db.config.js";
import { ShareLinksService } from "./src/modules/share-links/share-links.service.js";

async function test() {
  const service = new ShareLinksService(db);

  // 1. Get a workspace and user
  const workspace = await db.workspace.findFirst({
    include: { files: true, security: true }
  });

  if (!workspace || workspace.files.length === 0) {
    console.log("No workspace or files found to test.");
    return;
  }

  const file = workspace.files[0];
  const userId = workspace.ownerId;

  console.log(`Testing with Workspace: ${workspace.name}, File: ${file.name}`);

  // 2. Create Public Link
  console.log("\n--- Creating Public Link ---");
  try {
    const link = await service.createShareLink({
      fileId: file.id,
      workspaceId: workspace.id,
      userId,
      accessType: "Public"
    });
    console.log("Link created:", link.shareUrl);

    // Test access
    console.log("Accessing public link...");
    const access = await service.accessPublicLink(link.slug, {});
    console.log("Access result:", access.fileName, access.previewUrl ? "URL OK" : "URL FAIL");
  } catch (err: any) {
    console.error("Error creating/accessing public link:", err.message);
  }

  // 3. Create Password Protected Link
  console.log("\n--- Creating Password Protected Link ---");
  try {
    const link = await service.createShareLink({
      fileId: file.id,
      workspaceId: workspace.id,
      userId,
      accessType: "PasswordProtected",
      password: "secretpassword"
    });
    console.log("Link created:", link.shareUrl);

    // Test access wrong password
    console.log("Accessing with WRONG password...");
    try {
      await service.accessPublicLink(link.slug, { password: "wrong" });
    } catch (err: any) {
      console.log("Caught expected error:", err.message);
    }

    // Test access correct password
    console.log("Accessing with CORRECT password...");
    const access = await service.accessPublicLink(link.slug, { password: "secretpassword" });
    console.log("Access result:", access.fileName, "URL OK");
  } catch (err: any) {
    console.error("Error with password link:", err.message);
  }

  // 4. Test Workspace Security: disablePublicSharing
  console.log("\n--- Testing disablePublicSharing policy ---");
  await db.workspaceSecurity.update({
    where: { workspaceId: workspace.id },
    data: { disablePublicSharing: true }
  });

  try {
    console.log("Attempting to create public link with policy disabled...");
    await service.createShareLink({
      fileId: file.id,
      workspaceId: workspace.id,
      userId,
      accessType: "Public"
    });
  } catch (err: any) {
    console.log("Caught expected error:", err.message);
  } finally {
    // Reset policy
    await db.workspaceSecurity.update({
      where: { workspaceId: workspace.id },
      data: { disablePublicSharing: false }
    });
  }

  // 5. List links
  console.log("\n--- Listing Links ---");
  const list = await service.listShareLinks(workspace.id, {});
  console.log(`Found ${list.links.length} links for workspace.`);
  console.log("Stats:", list.stats);

  console.log("\nVerification complete.");
}

test().catch(console.error).finally(() => db.$disconnect());
