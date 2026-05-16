import { describe, it, expect, vi, beforeEach } from "vitest";
import { FilesRepository } from "./files.repository";

const mockPrisma = {
  folder: {
    findFirst: vi.fn(),
  },
  file: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  shareLink: {
    updateMany: vi.fn(),
  },
};

describe("FilesRepository.findFolderById", () => {
  let repo: FilesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new FilesRepository(mockPrisma as any);
  });

  it("scopes query to workspaceId when provided (IDOR prevention)", async () => {
    mockPrisma.folder.findFirst.mockResolvedValue(null);
    await repo.findFolderById("folder-123", "workspace-abc");

    expect(mockPrisma.folder.findFirst).toHaveBeenCalledWith({
      where: { id: "folder-123", workspaceId: "workspace-abc" },
      select: expect.any(Object),
    });
  });

  it("omits workspaceId from query when not provided (breadcrumb walk)", async () => {
    mockPrisma.folder.findFirst.mockResolvedValue(null);
    await repo.findFolderById("folder-123");

    expect(mockPrisma.folder.findFirst).toHaveBeenCalledWith({
      where: { id: "folder-123" },
      select: expect.any(Object),
    });
  });

  it("returns null when folder belongs to different workspace", async () => {
    mockPrisma.folder.findFirst.mockResolvedValue(null);
    const result = await repo.findFolderById("folder-from-other-workspace", "my-workspace");
    expect(result).toBeNull();
  });
});
