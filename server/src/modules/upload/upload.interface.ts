import type { File, UploadSession } from "@/generated/prisma/client";
import type {
  PresignDto,
  InitiateDto,
  ProgressDto,
  CompleteDto,
} from "./upload.schema";

export type { PresignDto, InitiateDto, ProgressDto, CompleteDto };

export interface IUploadRepository {
  createFile(data: any): Promise<File>;
  findFileById(id: string): Promise<File | null>;
  updateFile(id: string, data: any): Promise<File>;
  deleteFile(id: string): Promise<void>;
  createUploadSession(data: any): Promise<UploadSession>;
  findUploadSessionById(id: string): Promise<UploadSession | null>;
  updateUploadSession(id: string, data: any): Promise<UploadSession>;
  countActiveUploadSessions(workspaceId: string): Promise<number>;
}
