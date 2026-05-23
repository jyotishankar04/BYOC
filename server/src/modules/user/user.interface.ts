export interface IUserRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  findByEmail(email: string): Promise<Record<string, unknown> | null>;
  update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  findPreferences(userId: string): Promise<Record<string, unknown> | null>;
  upsertPreferences(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  listMyInvites(userId: string): Promise<Record<string, unknown>[]>;
  listAccounts(userId: string): Promise<Record<string, unknown>[]>;
  listSessions(userId: string): Promise<Record<string, unknown>[]>;
  findSessionById(
    userId: string,
    sessionId: string,
  ): Promise<Record<string, unknown> | null>;
  deleteSession(sessionId: string): Promise<void>;
  deleteSessionsExcept(userId: string, sessionId: string): Promise<void>;
}

export interface IUserService {
  getProfile(userId: string): Promise<Record<string, unknown>>;
  updateProfile(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  getPreferences(userId: string): Promise<Record<string, unknown>>;
  updatePreferences(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  presignAvatarUpload(userId: string, contentType: string): Promise<{ uploadUrl: string; key: string }>;
  confirmAvatarUpload(userId: string, key: string): Promise<string>;
  listMyInvites(userId: string): Promise<Record<string, unknown>[]>;
  listAccounts(userId: string): Promise<Record<string, unknown>[]>;
  listSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<Record<string, unknown>[]>;
  revokeSession(userId: string, sessionId: string): Promise<void>;
  revokeOtherSessions(userId: string, currentSessionId: string): Promise<void>;
}
