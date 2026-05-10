import type { StorageProvider } from "@/generated/prisma/client";
import type {
  ConnectProviderDto,
  UpdateProviderDto,
} from "./provider.schema";

export type { ConnectProviderDto, UpdateProviderDto };

export type ProviderRow = Omit<StorageProvider, "encryptedCreds">;

export interface IProviderRepository {
  findUnique(workspaceId: string): Promise<StorageProvider | null>;
  upsert(workspaceId: string, data: any): Promise<StorageProvider>;
  update(workspaceId: string, data: any): Promise<StorageProvider>;
}
