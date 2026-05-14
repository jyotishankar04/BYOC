# BYOC Backend — Implementation Plan

> Modular Monolith architecture, ready for microservice extraction.  
> Stack: Express v5 + TypeScript + PostgreSQL + Redis + better-auth  
> Date: 2026-05-10

---

## Architecture Layers

Each module is split into exactly four layers. Nothing crosses layer boundaries except downward:

```
Router → Controller → Service → Repository
```

| Layer | Responsibility | Knows about |
|-------|---------------|-------------|
| **Router** | Mount URL + method to a controller method. Nothing else. | Express Router, Controller |
| **Controller** | Parse req, validate with zod, call service, send res. No SQL, no business logic. | Service, schemas, HTTP |
| **Service** | Business logic, orchestration, permission checks, notifications, activity logging. No SQL, no HTTP. | Repository, other Services |
| **Repository** | All SQL queries. Returns typed domain objects. No business logic, no HTTP. | db (pg Pool) |

Cross-cutting concerns that don't belong in any one module live in `shared/`:
- Middleware (auth, workspace RBAC, error handler, rate limiter)
- Storage provider abstraction (`IStorageProvider` + implementations)
- Infrastructure libs (db, redis, crypto, logger, mailer)

---

## Folder Structure

```
server/
├── src/
│   ├── modules/                              # Domain boundaries (future microservice seams)
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.config.ts               # better-auth instance — only file that imports betterAuth()
│   │   │   ├── auth.router.ts               # mounts /me, /api-keys routes to controller
│   │   │   ├── auth.controller.ts           # parse req → call service → send res
│   │   │   ├── auth.service.ts              # API key hashing, session helpers, onUserCreated hook
│   │   │   ├── auth.repository.ts           # SQL for api_keys table
│   │   │   ├── auth.schema.ts               # zod schemas for auth routes
│   │   │   ├── auth.middleware.ts           # requireAuth — sets req.userId + req.sessionId
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── onboarding/
│   │   │   ├── onboarding.router.ts
│   │   │   ├── onboarding.controller.ts
│   │   │   ├── onboarding.service.ts
│   │   │   └── onboarding.schema.ts
│   │   │
│   │   ├── workspace/
│   │   │   ├── workspace.router.ts
│   │   │   ├── workspace.controller.ts
│   │   │   ├── workspace.service.ts
│   │   │   ├── workspace.repository.ts
│   │   │   ├── workspace.schema.ts
│   │   │   └── workspace.types.ts
│   │   │
│   │   ├── members/
│   │   │   ├── members.router.ts
│   │   │   ├── members.controller.ts
│   │   │   ├── members.service.ts
│   │   │   ├── members.repository.ts
│   │   │   ├── members.schema.ts
│   │   │   └── members.types.ts
│   │   │
│   │   ├── provider/
│   │   │   ├── provider.router.ts
│   │   │   ├── provider.controller.ts
│   │   │   ├── provider.service.ts          # credential encrypt/decrypt lives here
│   │   │   ├── provider.repository.ts
│   │   │   ├── provider.schema.ts
│   │   │   └── provider.types.ts
│   │   │
│   │   ├── folders/
│   │   │   ├── folders.router.ts
│   │   │   ├── folders.controller.ts
│   │   │   ├── folders.service.ts
│   │   │   ├── folders.repository.ts
│   │   │   ├── folders.schema.ts
│   │   │   └── folders.types.ts
│   │   │
│   │   ├── files/
│   │   │   ├── files.router.ts
│   │   │   ├── files.controller.ts
│   │   │   ├── files.service.ts
│   │   │   ├── files.repository.ts
│   │   │   ├── files.schema.ts
│   │   │   └── files.types.ts
│   │   │
│   │   ├── upload/
│   │   │   ├── upload.router.ts
│   │   │   ├── upload.controller.ts
│   │   │   ├── upload.service.ts
│   │   │   ├── upload.repository.ts         # upload_sessions CRUD
│   │   │   ├── upload.schema.ts
│   │   │   └── upload.types.ts
│   │   │
│   │   ├── share-links/
│   │   │   ├── share-links.router.ts
│   │   │   ├── share-links.controller.ts
│   │   │   ├── share-links.service.ts
│   │   │   ├── share-links.repository.ts
│   │   │   ├── share-links.schema.ts
│   │   │   └── share-links.types.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.router.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts     # also used by other services to create notifs
│   │   │   ├── notifications.repository.ts
│   │   │   └── notifications.types.ts
│   │   │
│   │   ├── activity/
│   │   │   ├── activity.router.ts
│   │   │   ├── activity.controller.ts
│   │   │   ├── activity.service.ts          # also used by other services to log activity
│   │   │   ├── activity.repository.ts
│   │   │   └── activity.types.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── analytics.router.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.repository.ts      # aggregation queries
│   │   │
│   │   ├── events/
│   │   │   ├── events.router.ts
│   │   │   ├── events.controller.ts
│   │   │   └── events.service.ts            # in-memory client registry + broadcast()
│   │   │
│   │   ├── billing/
│   │   │   ├── billing.router.ts
│   │   │   ├── billing.controller.ts
│   │   │   └── billing.service.ts           # no repository — plan data is static config
│   │   │
│   │   └── users/
│   │       ├── users.router.ts
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       ├── users.repository.ts
│   │       ├── users.schema.ts
│   │       └── users.types.ts
│   │
│   ├── shared/                              # Shared kernel — modules import from here, never from each other
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts           # requireAuth (re-exported from auth module for convenience)
│   │   │   ├── workspace.middleware.ts      # requireWorkspaceMember, requireRole, requirePermission
│   │   │   ├── validate.middleware.ts       # zod validation wrapper — validateBody(schema), validateQuery(schema)
│   │   │   ├── error.middleware.ts          # global Express error handler
│   │   │   └── rate-limit.middleware.ts     # Redis-backed rate limiter factory
│   │   │
│   │   ├── storage/                         # Provider abstraction — only provider.service.ts uses this
│   │   │   ├── storage.interface.ts         # IStorageProvider interface
│   │   │   ├── providers/
│   │   │   │   ├── aws-s3.provider.ts       # live implementation
│   │   │   │   ├── r2.provider.ts           # stub (throws "coming soon")
│   │   │   │   └── b2.provider.ts           # stub
│   │   │   └── storage.factory.ts           # getProvider(type, decryptedCreds, bucket, region)
│   │   │
│   │   ├── lib/
│   │   │   ├── db.ts                        # exports pg Pool — the single DB connection pool
│   │   │   ├── redis.ts                     # exports ioredis client
│   │   │   ├── crypto.ts                    # AES-256-GCM encrypt / decrypt
│   │   │   ├── logger.ts                    # pino with sensitive field redaction
│   │   │   └── mailer.ts                    # send transactional email
│   │   │
│   │   ├── errors/
│   │   │   ├── AppError.ts                  # base class: new AppError("WORKSPACE_NOT_FOUND", 404, "...")
│   │   │   └── errors.ts                    # typed error factory functions (notFound, forbidden, etc.)
│   │   │
│   │   └── types/
│   │       ├── express.d.ts                 # req.userId, req.workspaceId, req.membership
│   │       └── pagination.types.ts          # PaginatedResult<T>, PaginationQuery
│   │
│   ├── db/
│   │   ├── migrations/
│   │   │   └── 001_initial.sql
│   │   └── schema.ts                        # column name constants — avoids magic strings in repositories
│   │
│   ├── config/
│   │   └── env.ts                           # zod-parsed env, process.exit(1) if invalid on startup
│   │
│   ├── jobs/
│   │   ├── upload-cleanup.job.ts
│   │   ├── link-expiry.job.ts
│   │   ├── storage-snapshot.job.ts
│   │   ├── provider-health.job.ts
│   │   ├── notification-cleanup.job.ts
│   │   ├── activity-cleanup.job.ts
│   │   └── jobs.ts                          # registers all cron schedules
│   │
│   └── app.ts                               # assembles Express app (no listen())
│
├── index.ts                                 # calls app.ts then server.listen()
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Layer Contracts (what each layer may and may not do)

### Router
```typescript
// workspace.router.ts
import { Router } from "express"
import { requireAuth } from "@/shared/middleware/auth.middleware"
import { requireWorkspaceMember, requirePermission } from "@/shared/middleware/workspace.middleware"
import { WorkspaceController } from "./workspace.controller"

const router = Router()
const ctrl = new WorkspaceController()

router.get("/",          requireAuth,                                   ctrl.list)
router.post("/",         requireAuth,                                   ctrl.create)
router.get("/:wid",      requireAuth, requireWorkspaceMember,           ctrl.getOne)
router.patch("/:wid",    requireAuth, requireWorkspaceMember,           ctrl.update)
router.delete("/:wid",   requireAuth, requireWorkspaceMember,           ctrl.delete)

export default router

// Rules:
// ✅ Mount URL+method to controller method
// ✅ Attach middleware
// ❌ No req/res parsing
// ❌ No business logic
// ❌ No SQL
```

### Controller
```typescript
// workspace.controller.ts
import { Request, Response, NextFunction } from "express"
import { createWorkspaceSchema } from "./workspace.schema"
import { WorkspaceService } from "./workspace.service"

export class WorkspaceController {
  private service = new WorkspaceService()

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaces = await this.service.listWorkspaces(req.userId)
      res.json({ workspaces })
    } catch (err) { next(err) }
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createWorkspaceSchema.parse(req.body)   // throws ZodError → caught by error middleware
      const workspace = await this.service.createWorkspace(req.userId, body)
      res.status(201).json({ workspace })
    } catch (err) { next(err) }
  }
}

// Rules:
// ✅ Parse and validate req.body / req.params / req.query
// ✅ Call exactly one service method per handler
// ✅ Pass errors to next(err)
// ✅ Format and send res
// ❌ No SQL
// ❌ No business logic (if/else decisions beyond "parse → call → respond")
// ❌ No direct DB or Redis access
```

### Service
```typescript
// workspace.service.ts
import { WorkspaceRepository } from "./workspace.repository"
import { NotificationService } from "@/modules/notifications/notifications.service"
import { ActivityService } from "@/modules/activity/activity.service"
import { forbidden, conflict } from "@/shared/errors/errors"

export class WorkspaceService {
  private repo = new WorkspaceRepository()
  private notifService = new NotificationService()
  private activityService = new ActivityService()

  async createWorkspace(userId: string, data: CreateWorkspaceData) {
    const existing = await this.repo.findBySlug(data.slug)
    if (existing) throw conflict("SLUG_TAKEN", "This slug is already in use.")

    const count = await this.repo.countByUser(userId)
    if (count >= planLimits[plan].maxWorkspaces) throw forbidden("PLAN_LIMIT", "Upgrade to create more workspaces.")

    const workspace = await this.repo.create(userId, data)
    await this.repo.createDefaultPermissions(workspace.id)
    await this.repo.createDefaultSecurity(workspace.id)

    await this.activityService.log({ workspaceId: workspace.id, action: "workspace_created" })
    return workspace
  }
}

// Rules:
// ✅ Business logic, decisions, orchestration
// ✅ Call one or more repositories
// ✅ Call other services (notifications, activity)
// ✅ Throw AppErrors
// ❌ No req / res / next — zero HTTP awareness
// ❌ No raw SQL
// ❌ No res.json()
```

### Repository
```typescript
// workspace.repository.ts
import { db } from "@/shared/lib/db"
import type { Workspace } from "./workspace.types"

export class WorkspaceRepository {
  async findBySlug(slug: string): Promise<Workspace | null> {
    const { rows } = await db.query(
      `SELECT * FROM workspaces WHERE slug = $1 LIMIT 1`,
      [slug]
    )
    return rows[0] ?? null
  }

  async create(ownerId: string, data: CreateWorkspaceData): Promise<Workspace> {
    const { rows } = await db.query(
      `INSERT INTO workspaces (id, name, slug, type, owner_id)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.slug, data.type, ownerId]
    )
    return rows[0]
  }

  async createDefaultPermissions(workspaceId: string): Promise<void> {
    await db.query(
      `INSERT INTO workspace_permissions (workspace_id) VALUES ($1)`,
      [workspaceId]
    )
  }
}

// Rules:
// ✅ All SQL lives here
// ✅ Return typed domain objects (map snake_case → camelCase if needed)
// ❌ No business logic
// ❌ No AppErrors — throw raw DB errors, let service handle them
// ❌ No imports from service or controller
```

---

## Inter-Service Communication Rule

Services may call other services for cross-domain operations. They must **never** import a repository from another module — only that module's service.

```
✅ files.service.ts → import { NotificationService } from "@/modules/notifications/notifications.service"
✅ files.service.ts → import { ActivityService } from "@/modules/activity/activity.service"
❌ files.service.ts → import { NotificationRepository } from "@/modules/notifications/notifications.repository"
```

This is the microservice seam: when extracting a module to its own service, you replace the in-process service call with an HTTP/gRPC call — the import path is the only thing that changes.

---

## Phase 0 — Project Bootstrap

### Steps

- [ ] `pnpm init` inside `server/`, set `"type": "module"` in `package.json`
- [ ] Install core deps:
  ```
  better-auth @better-auth/redis-storage
  express cors helmet
  pg ioredis
  zod
  pino pino-pretty
  node-cron
  @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
  bcryptjs
  nanoid
  ```
- [ ] Install dev deps:
  ```
  typescript tsx @types/express @types/pg @types/bcryptjs @types/node-cron
  ```
- [ ] Create `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "outDir": "dist",
      "rootDir": "src",
      "strict": true,
      "paths": { "@/*": ["./src/*"] }
    }
  }
  ```
- [ ] Create `src/config/env.ts` — parse and validate all env vars with zod:
  ```
  DATABASE_URL, REDIS_URL,
  BETTER_AUTH_SECRET, BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  CRED_ENCRYPTION_KEY,
  FRONTEND_URL
  ```
- [ ] Create `src/shared/lib/db.ts` — export a `pg.Pool` using `DATABASE_URL`
- [ ] Create `src/shared/lib/redis.ts` — export ioredis instance
- [ ] Create `src/shared/lib/logger.ts` — pino with redaction paths: `["password","secret","secretAccessKey","accessKey","token","authorization","cookie"]`
- [ ] Create `src/shared/types/express.d.ts`:
  ```typescript
  declare namespace Express {
    interface Request {
      userId: string
      sessionId: string
      workspaceId: string
      membership: { role: "Owner"|"Admin"|"Member"|"Viewer"; permissions: WorkspacePermissions }
    }
  }
  ```
- [ ] Create `src/app.ts` skeleton (empty Express app)
- [ ] Create `index.ts` entry point
- [ ] Add `package.json` scripts: `dev: tsx watch index.ts`, `build: tsc`, `start: node dist/index.js`
- [ ] Verify: `pnpm dev` starts without errors

---

## Phase 1 — Database Schema

### Steps

- [ ] Create PostgreSQL database and user
- [ ] Create `src/db/migrations/001_initial.sql` with all custom tables:

  **better-auth manages:** `user`, `session`, `account`, `verification` — let the CLI generate these.

  **Custom tables to write manually:**

  ```sql
  -- Workspace
  CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Personal','Student','Startup','Team')),
    plan VARCHAR(20) NOT NULL DEFAULT 'Free' CHECK (plan IN ('Free','Pro','Team')),
    color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    owner_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- WorkspaceMember
  CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Owner','Admin','Member','Viewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    invited_by TEXT REFERENCES "user"(id),
    UNIQUE(workspace_id, user_id)
  );

  -- WorkspacePermissions
  CREATE TABLE workspace_permissions (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    can_upload VARCHAR(20) NOT NULL DEFAULT 'Member',
    can_create_folders VARCHAR(20) NOT NULL DEFAULT 'Member',
    can_share_files VARCHAR(20) NOT NULL DEFAULT 'Member',
    can_delete_files VARCHAR(20) NOT NULL DEFAULT 'Admin',
    can_manage_billing VARCHAR(20) NOT NULL DEFAULT 'Owner'
  );

  -- WorkspaceSecurity
  CREATE TABLE workspace_security (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    require_password_for_public_links BOOLEAN NOT NULL DEFAULT FALSE,
    disable_public_sharing BOOLEAN NOT NULL DEFAULT FALSE,
    allow_private_invite_sharing BOOLEAN NOT NULL DEFAULT TRUE,
    enable_activity_logs BOOLEAN NOT NULL DEFAULT TRUE
  );

  -- StorageProvider
  CREATE TABLE storage_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    provider_type VARCHAR(30) NOT NULL,
    bucket VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    endpoint_url VARCHAR(500),
    access_key_id_hint VARCHAR(10),
    encrypted_creds TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Unchecked',
    last_checked TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Folders
  CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    created_by TEXT NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Files
  CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(20),
    mime_type VARCHAR(100),
    size BIGINT NOT NULL DEFAULT 0,
    kind VARCHAR(20) NOT NULL DEFAULT 'other',
    storage_path TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'uploading',
    uploaded_by TEXT NOT NULL REFERENCES "user"(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    doc_type VARCHAR(20),
    resolution VARCHAR(10),
    duration_secs INTEGER,
    aspect FLOAT,
    pages INTEGER
  );
  CREATE INDEX idx_files_workspace ON files(workspace_id);
  CREATE INDEX idx_files_folder ON files(folder_id);
  CREATE INDEX idx_files_kind ON files(workspace_id, kind);
  CREATE INDEX idx_files_status ON files(workspace_id, status);

  -- UploadSessions
  CREATE TABLE upload_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id),
    provider_upload_id TEXT NOT NULL,
    bucket VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    total_size BIGINT NOT NULL,
    chunk_size INTEGER NOT NULL,
    total_chunks INTEGER NOT NULL,
    completed_chunks JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ShareLinks
  CREATE TABLE share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    slug VARCHAR(20) UNIQUE NOT NULL,
    access_type VARCHAR(25) NOT NULL CHECK (access_type IN ('Public','PasswordProtected','Private')),
    password_hash TEXT,
    expires_at TIMESTAMPTZ,
    allow_download BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    visits INTEGER NOT NULL DEFAULT 0,
    created_by TEXT NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_share_links_slug ON share_links(slug);
  CREATE INDEX idx_share_links_workspace ON share_links(workspace_id, status);

  -- ShareLinkVisits
  CREATE TABLE share_link_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_link_id UUID NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash VARCHAR(64),
    user_agent TEXT
  );

  -- ActivityLogs
  CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_activity_workspace ON activity_logs(workspace_id, created_at DESC);
  CREATE INDEX idx_activity_file ON activity_logs(file_id, created_at DESC);

  -- Notifications
  CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    actor_id TEXT REFERENCES "user"(id),
    related_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    related_link_id UUID REFERENCES share_links(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_notifications_user ON notifications(user_id, dismissed, created_at DESC);
  CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE dismissed = FALSE;

  -- Invites
  CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    invited_by TEXT NOT NULL REFERENCES "user"(id),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- StorageSnapshots (for analytics trend)
  CREATE TABLE storage_snapshots (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_bytes BIGINT NOT NULL DEFAULT 0,
    image_bytes BIGINT NOT NULL DEFAULT 0,
    video_bytes BIGINT NOT NULL DEFAULT 0,
    document_bytes BIGINT NOT NULL DEFAULT 0,
    other_bytes BIGINT NOT NULL DEFAULT 0,
    file_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (workspace_id, date)
  );

  -- UserPreferences
  CREATE TABLE user_preferences (
    user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    theme VARCHAR(20) NOT NULL DEFAULT 'system',
    compact_mode BOOLEAN NOT NULL DEFAULT FALSE,
    date_format VARCHAR(20) NOT NULL DEFAULT 'MM/DD/YYYY',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    email_file_shared BOOLEAN NOT NULL DEFAULT TRUE,
    email_member_joined BOOLEAN NOT NULL DEFAULT TRUE,
    email_storage_alert BOOLEAN NOT NULL DEFAULT TRUE,
    email_weekly_digest BOOLEAN NOT NULL DEFAULT FALSE,
    email_security_alert BOOLEAN NOT NULL DEFAULT TRUE,
    email_link_expiry BOOLEAN NOT NULL DEFAULT FALSE,
    inapp_badge BOOLEAN NOT NULL DEFAULT TRUE,
    inapp_sound BOOLEAN NOT NULL DEFAULT FALSE,
    usage_analytics BOOLEAN NOT NULL DEFAULT TRUE,
    crash_reports BOOLEAN NOT NULL DEFAULT TRUE,
    public_profile BOOLEAN NOT NULL DEFAULT FALSE
  );

  -- ApiKeys
  CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    key_hash TEXT NOT NULL,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- S3 sync columns on storage_providers
  -- sync_status tracks the initial and manual sync lifecycle
  ALTER TABLE storage_providers ADD COLUMN sync_status VARCHAR(20) NOT NULL DEFAULT 'pending';
  -- values: pending | syncing | completed | failed
  ALTER TABLE storage_providers ADD COLUMN last_synced_at TIMESTAMPTZ;
  ALTER TABLE storage_providers ADD COLUMN sync_total_objects INTEGER;
  ALTER TABLE storage_providers ADD COLUMN sync_completed_objects INTEGER;

  -- source column on files — tracks whether a file was uploaded through BYOC or imported from S3
  ALTER TABLE files ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'byoc';
  -- values: byoc | s3_import
  ```

- [ ] Run `001_initial.sql` against the database
- [ ] Checkpoint: `\dt` in psql shows all tables

---

## Phase 2 — better-auth Setup

> better-auth handles: user table (with custom extra fields), session table, account table (for OAuth), verification table. We extend the user table with our custom fields via `additionalFields`.

### Steps

- [ ] Create `src/modules/auth/auth.config.ts`:

  ```typescript
  import { betterAuth } from "better-auth"
  import { Pool } from "pg"
  import { redisStorage } from "@better-auth/redis-storage"
  import { twoFactor } from "better-auth/plugins"
  import { redis } from "@/shared/lib/redis"
  import { db } from "@/shared/lib/db"
  import { env } from "@/config/env"
  import { onUserCreated } from "./auth.service"

  export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,

    database: db,  // the pg Pool instance

    secondaryStorage: redisStorage({ client: redis, keyPrefix: "ba:" }),

    emailAndPassword: { enabled: true },

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        prompt: "select_account",
      },
    },

    plugins: [
      twoFactor(),
    ],

    // Extend the built-in user table with our app fields
    user: {
      additionalFields: {
        username:  { type: "string",  required: false, defaultValue: null, input: true  },
        bio:       { type: "string",  required: false, defaultValue: null, input: false },
        location:  { type: "string",  required: false, defaultValue: null, input: false },
        website:   { type: "string",  required: false, defaultValue: null, input: false },
        avatarKey: { type: "string",  required: false, defaultValue: null, input: false },
        onboarded: { type: "boolean", required: false, defaultValue: false, input: false },
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,         // 7 days
      updateAge:  60 * 60 * 24,             // refresh session if older than 1 day
    },

    // After a new user is created → bootstrap their account
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await onUserCreated(user)
          },
        },
      },
    },

    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },
  })

  export type Auth = typeof auth
  ```

- [ ] Run `npx auth@latest generate` to create better-auth's own tables (user, session, account, verification) with the additionalFields columns included

- [ ] Create `src/modules/auth/auth.service.ts`:
  - `onUserCreated(user)` — called from databaseHooks after:
    - Creates a default Personal workspace
    - Creates workspace_members row (role = Owner)
    - Creates workspace_permissions row (defaults)
    - Creates workspace_security row (defaults)
    - Creates user_preferences row (defaults)
  - `hashApiKey(key: string)` → bcrypt hash
  - `verifyApiKey(key: string, hash: string)` → boolean
  - `getSessionFromRequest(req)` → calls `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })`

- [ ] Create `src/modules/auth/auth.middleware.ts`:
  ```typescript
  // requireAuth middleware:
  // 1. Check for Bearer token → API key path
  // 2. Check for session cookie → session path
  // 3. Set req.userId and req.sessionId
  // 4. Call next() or return 401
  ```

- [ ] Create `src/modules/auth/auth.router.ts` — custom routes (NOT handled by better-auth):
  ```
  GET  /api/v1/auth/me           → return current user + workspaces list
  GET  /api/v1/auth/api-keys     → list user's API keys
  POST /api/v1/auth/api-keys     → generate new key (show once)
  DELETE /api/v1/auth/api-keys/:keyId → revoke key
  ```

- [ ] Wire in `src/app.ts`:
  ```typescript
  // MUST be before express.json()
  app.all("/api/auth/*splat", toNodeHandler(auth))
  app.use(express.json())
  app.use("/api/v1/auth", authRouter)
  ```

- [ ] Checkpoint: `GET /api/auth/ok` returns `{ ok: true }`
- [ ] Checkpoint: Google OAuth full round-trip works (redirect → callback → session cookie set)
- [ ] Checkpoint: `GET /api/v1/auth/me` with valid session cookie returns user object
- [ ] Checkpoint: New user registration triggers `onUserCreated` → workspace + permissions rows created in DB
- [ ] Checkpoint: Email + password signup and login works
- [ ] Checkpoint: API key generate → returned once → subsequent `GET /api/v1/auth/api-keys` shows only prefix
- [ ] Checkpoint: API key in `Authorization: Bearer byoc_xxx` header authenticates a request

---

## Phase 3 — Workspace Middleware (Core of Every Route)

> This phase must be complete before any workspace-scoped routes because they all depend on it.

### Steps

- [ ] Create `src/shared/middleware/workspace.middleware.ts` with three middleware functions:

  **`requireWorkspaceMember`**
  - Reads `req.params.workspaceId`
  - Queries `workspace_members` for `(workspaceId, req.userId)`
  - If not found → 403
  - Queries `workspace_permissions` for the workspace
  - Sets `req.workspaceId` and `req.membership = { role, permissions }`
  - Calls `next()`

  **`requireRole(minimumRole)`** — factory returning middleware
  - Checks `req.membership.role >= minimumRole` (Owner=4, Admin=3, Member=2, Viewer=1)
  - If fails → 403 with `{ code: "INSUFFICIENT_ROLE" }`

  **`requirePermission(action)`** — factory returning middleware
  - Reads `req.membership.permissions[action]` → gets the minimum role string for that action
  - Checks `req.membership.role >= that minimum role`
  - If fails → 403 with `{ code: "PERMISSION_DENIED", action }`

- [ ] Create `src/shared/middleware/error.middleware.ts` — global Express error handler:
  - Catches all errors thrown or passed via `next(err)`
  - Maps to standard `{ error: { code, message, details } }` shape
  - Logs error with pino
  - Never leaks stack traces in production

- [ ] Create `src/shared/types/express.d.ts` with the full type augmentations

- [ ] Checkpoint: A test route at `/api/v1/workspaces/:workspaceId/ping` returns 403 for non-members, 200 for members, with `req.membership.role` populated correctly

---

## Phase 4 — Workspace CRUD Routes

### Routes

```
GET    /api/v1/workspaces
POST   /api/v1/workspaces
GET    /api/v1/workspaces/:workspaceId
PATCH  /api/v1/workspaces/:workspaceId
DELETE /api/v1/workspaces/:workspaceId
POST   /api/v1/workspaces/:workspaceId/transfer
```

### Steps

- [ ] Create `src/modules/workspace/workspace.schema.ts` (zod):
  - `createWorkspaceSchema`: `{ name: string (3-100), slug: string (3-50, lowercase alphanum+hyphen), type: enum }`
  - `updateWorkspaceSchema`: partial of the above
  - `transferSchema`: `{ newOwnerId: string }`

- [ ] Create `src/modules/workspace/workspace.service.ts`:
  - `listWorkspaces(userId)` → joins workspaces + members + storage_providers + permissions + security
  - `createWorkspace(userId, data)`:
    - Validate slug unique
    - Validate plan allows another workspace (Free: max 1, Pro: max 3, Team: unlimited)
    - Insert workspace + member (Owner) + permissions + security
  - `getWorkspace(workspaceId)` → full detail with members array, storage summary, permissions, security
  - `updateWorkspace(workspaceId, data)`:
    - If slug changing → validate unique
  - `deleteWorkspace(workspaceId, userId)`:
    - Verify caller is Owner
    - Cascade deletes handled by FK ON DELETE CASCADE
    - Enqueue background job to delete S3 objects (Phase 10)
  - `transferOwnership(workspaceId, currentOwnerId, newOwnerId)`:
    - Verify new owner is a member
    - UPDATE member role: current → Admin, new → Owner

- [ ] Create `src/modules/workspace/workspace.router.ts` wiring routes to service methods

- [ ] Wire router into `app.ts`

- [ ] Checkpoint: `POST /api/v1/workspaces` creates workspace + default rows
- [ ] Checkpoint: `GET /api/v1/workspaces` returns all workspaces for the user with nested data
- [ ] Checkpoint: Slug uniqueness validation rejects duplicates
- [ ] Checkpoint: Free plan user cannot create a second workspace
- [ ] Checkpoint: `DELETE` with wrong user returns 403
- [ ] Checkpoint: Transfer changes both role rows correctly

---

## Phase 5 — Member Management Routes

### Routes

```
GET    /api/v1/workspaces/:workspaceId/members
POST   /api/v1/workspaces/:workspaceId/members/invite
PATCH  /api/v1/workspaces/:workspaceId/members/:memberId
DELETE /api/v1/workspaces/:workspaceId/members/:memberId
GET    /api/v1/workspaces/:workspaceId/members/invites
DELETE /api/v1/workspaces/:workspaceId/members/invites/:inviteId
GET    /invite/:token
POST   /invite/:token/accept
```

### Steps

- [ ] Create `src/modules/members/members.service.ts`:
  - `listMembers(workspaceId)` → workspace_members + user join
  - `inviteMember(workspaceId, invitedBy, { email, role })`:
    - Require Admin+
    - Cannot invite with role higher than caller's own role
    - If user exists → create workspace_member directly + notification
    - If user doesn't exist → create invite row with 72-hour expiring token + send invite email
  - `changeMemberRole(workspaceId, callerId, memberId, newRole)`:
    - Cannot elevate above own role
    - Cannot change Owner role
  - `removeMember(workspaceId, callerId, memberId)`:
    - Admin can remove Member/Viewer
    - Only Owner can remove Admin
  - `listInvites(workspaceId)` → pending invites
  - `cancelInvite(workspaceId, inviteId)`
  - `acceptInvite(token, userId)`:
    - Validate token not expired
    - Create workspace_member row
    - Mark invite accepted_at
    - Create `member_joined` notification for workspace owner

- [ ] Create `src/modules/members/members.router.ts`

- [ ] Create `src/shared/lib/mailer.ts` — send invite email with accept link

- [ ] Checkpoint: Invite flow (both paths: existing user and new user)
- [ ] Checkpoint: Role change rejects elevation above caller's role
- [ ] Checkpoint: Token acceptance creates member row and marks invite
- [ ] Checkpoint: Expired token returns 410

---

## Phase 6 — Workspace Settings Routes

### Routes

```
PATCH  /api/v1/workspaces/:workspaceId/permissions
PATCH  /api/v1/workspaces/:workspaceId/security
```

### Steps

- [ ] `updatePermissions(workspaceId, data)`:
  - Require Admin+
  - Validate all values are valid PermissionLevel enum members
  - UPDATE workspace_permissions row
  - Log activity: `settings_changed`

- [ ] `updateSecurity(workspaceId, data)`:
  - Require Admin+
  - If `disablePublicSharing` becomes true → UPDATE share_links SET status='Disabled' WHERE access_type='Public' AND workspace_id=? AND status='Active'
  - Send `link_disabled` notifications to affected link creators
  - Log activity: `settings_changed`

- [ ] Checkpoint: Non-admin cannot change permissions
- [ ] Checkpoint: Enabling `disablePublicSharing` disables all active Public links

---

## Phase 7 — Storage Provider Routes

### Routes

```
GET    /api/v1/workspaces/:workspaceId/provider
POST   /api/v1/workspaces/:workspaceId/provider
PATCH  /api/v1/workspaces/:workspaceId/provider
DELETE /api/v1/workspaces/:workspaceId/provider
POST   /api/v1/workspaces/:workspaceId/provider/health-check
POST   /api/v1/workspaces/:workspaceId/provider/sync       ← manual re-sync trigger
GET    /api/v1/workspaces/:workspaceId/provider/sync/status ← poll sync progress
POST   /api/v1/onboard/provider
```

### Steps

- [ ] Create `src/shared/storage/storage.interface.ts`:
  ```typescript
  interface IStorageProvider {
    verifyConnection(): Promise<{ ok: boolean; error?: string }>
    initiateMultipartUpload(key: string, contentType: string): Promise<string>
    generateUploadPartUrl(key: string, uploadId: string, partNumber: number): Promise<string>
    completeMultipartUpload(key: string, uploadId: string, parts: Part[]): Promise<void>
    abortMultipartUpload(key: string, uploadId: string): Promise<void>
    generateGetPresignedUrl(key: string, expirySeconds: number, disposition?: string): Promise<string>
    generatePutPresignedUrl(key: string, contentType: string, expirySeconds: number): Promise<string>
    headObject(key: string): Promise<{ size: number; contentType: string; lastModified: Date }>
    deleteObject(key: string): Promise<void>
    deleteObjects(keys: string[]): Promise<void>
  }
  ```

- [ ] Create `src/shared/storage/aws-s3.provider.ts` implementing the interface using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`

- [ ] Create `src/shared/storage/storage.factory.ts`:
  ```typescript
  export function getProvider(type: string, creds: DecryptedCreds, bucket: string, region?: string): IStorageProvider
  ```

- [ ] Create `src/shared/lib/crypto.ts`:
  - `encrypt(plaintext: string): string` → AES-256-GCM, returns JSON string with `{ version, iv, tag, ciphertext }`
  - `decrypt(blob: string): string` → reverse
  - Key loaded from `env.CRED_ENCRYPTION_KEY`, must be 32 bytes (256-bit)

- [ ] Create `src/modules/provider/provider.service.ts`:
  - `getProvider(workspaceId)` → storage_providers row (no credentials field returned)
  - `connectProvider(workspaceId, data, callerId)`:
    - Require Owner or Admin
    - Decrypt never needed here — we encrypt:
      1. Build `decryptedCreds = { accessKeyId, secretAccessKey, endpointUrl }`
      2. Call `verifyConnection()` — if fails → return 422 with provider error
      3. `encrypt(JSON.stringify(decryptedCreds))` → store in `encrypted_creds`
      4. Store `accessKeyId.slice(-4)` in `access_key_id_hint`
      5. INSERT or UPSERT storage_providers
  - `updateProvider(workspaceId, newCreds)`:
    - Verify new creds before persisting
    - Re-encrypt and UPDATE
  - `disconnectProvider(workspaceId)`:
    - Require Owner
    - UPDATE status = 'Disconnected' (do NOT delete metadata)
  - `healthCheck(workspaceId)`:
    - Decrypt creds → call `verifyConnection()`
    - UPDATE status + last_checked
    - Return `{ status, latencyMs, lastChecked }`
  - `getDecryptedProvider(workspaceId)` — internal use only, never called by route handlers directly:
    - Returns `IStorageProvider` instance ready to use
    - Decrypted creds are held in-scope only, never returned from this function

- [ ] Create `src/modules/provider/provider.router.ts`

- [ ] **Bucket Sync — `src/jobs/bucket-sync.job.ts`**

  This job runs in two scenarios: (a) automatically after a provider is first connected, (b) manually when the user triggers re-sync. It is the same code path both times.

  **Principle: S3 is the source of truth. The DB is a metadata cache. When they conflict, S3 wins.**

  **Initial sync trigger** — called at the end of `connectProvider` and `onboard/provider`, fire-and-forget:
  ```typescript
  // provider.service.ts — after INSERT storage_providers succeeds:
  await db.query(`UPDATE storage_providers SET sync_status = 'pending' WHERE workspace_id = $1`, [workspaceId])
  enqueueSyncJob(workspaceId)   // does NOT await — respond 201 immediately
  ```

  **Sync job algorithm:**
  ```
  1. UPDATE sync_status = 'syncing', sync_total_objects = 0, sync_completed_objects = 0
  2. Paginate listObjects(bucket, prefix='', maxKeys=1000):
     For each page:
       a. For each object key:
            - Parse key into path segments: "photos/2024/beach.jpg" → ["photos", "2024", "beach.jpg"]
            - Walk segments left to right, UPSERT folder records for each prefix:
                "photos/"        → folder row { name:"photos", parent:null, source:'s3_import' }
                "photos/2024/"   → folder row { name:"2024",   parent:photos, source:'s3_import' }
            - Map object to file row:
                name        = last segment ("beach.jpg")
                extension   = file extension
                storage_path = full S3 key (the original key, not our BYOC key pattern)
                size        = object.Size
                last_modified = object.LastModified
                mime_type   = inferred from extension (use mime-types package)
                kind        = inferred from mime_type
                status      = 'ready'
                source      = 's3_import'
                uploaded_by = workspace owner id
            - INSERT file row — skip if storage_path already exists in this workspace (idempotent)
       b. UPDATE sync_completed_objects += page.length
       c. Persist continuationToken to Redis (key: sync:{workspaceId}:token) for crash resume
  3. On completion: UPDATE sync_status = 'completed', last_synced_at = now()
  4. On error: UPDATE sync_status = 'failed'
  ```

  **Key implementation details:**
  - Folder UPSERT must check existence by `(workspace_id, path)` before inserting — prevents duplicates across pages
  - File INSERT uses `ON CONFLICT (workspace_id, storage_path) DO NOTHING` — makes the job idempotent (safe to re-run)
  - Persist pagination token to Redis after each page so a crash mid-sync can resume from the last checkpoint, not from zero
  - Update `sync_completed_objects` after every page so the frontend progress bar reflects real progress

  **Sync status endpoint** — `GET /provider/sync/status`:
  ```json
  {
    "syncStatus": "syncing",
    "syncTotalObjects": 4820,
    "syncCompletedObjects": 2000,
    "lastSyncedAt": null
  }
  ```
  Frontend polls this every 3 seconds while `syncStatus === 'syncing'` and shows a banner: "Syncing existing files from your bucket (2,000 / 4,820)…"

  **Manual re-sync** — `POST /provider/sync`:
  - Require Admin+
  - If `sync_status === 'syncing'` already → return 409
  - Else set `sync_status = 'pending'` and enqueue job
  - Return 202

- [ ] **Lazy Validation on presigned URL generation** — in `files.service.ts`, `getPreviewUrl` and `getDownloadUrl`:
  ```typescript
  try {
    const url = await provider.generateGetPresignedUrl(file.storagePath, 60)
    return url
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      // S3 says the object is gone — auto-heal the DB
      await filesRepo.markDeleted(file.id)
      throw notFound("FILE_NOT_IN_STORAGE", "This file no longer exists in your bucket.")
    }
    throw err
  }
  ```
  This self-heals stale DB records on access without needing a full scan.

- [ ] **Periodic diff job** — `src/jobs/bucket-diff.job.ts` — runs daily at 02:00 UTC:
  ```
  For each workspace with sync_status = 'completed':
    1. Collect all storage_paths from DB for this workspace (WHERE status = 'ready')
    2. Paginate full listObjects from S3, build a Set of all current S3 keys
    3. DB keys not in S3 Set  → mark status = 'deleted' (user deleted directly from S3)
    4. S3 keys not in DB Set  → run the same insert logic as the sync job (user added directly to S3)
  ```
  This is the safety net for workspaces that haven't configured S3 event notifications.

- [ ] **S3 Event Notifications (optional, user-configured)** — `POST /api/v1/webhooks/s3`:
  - Public endpoint (no auth cookie) — authenticated by signature verification (HMAC or AWS SNS signature)
  - Handles two event types:
    - `ObjectCreated` → insert file record (same logic as sync job for one object)
    - `ObjectRemoved` → `UPDATE files SET status = 'deleted' WHERE workspace_id = ? AND storage_path = ?`
  - In the integrations settings page, show guided setup instructions:
    - Which IAM permissions to add
    - How to configure S3 → SQS/SNS → this webhook endpoint
    - Show current status: "Real-time sync: Not configured [Set up guide →]"

- [ ] Create `src/modules/auth/onboard.router.ts` — `POST /api/v1/onboard/provider`:
  - Same logic as `connectProvider` but also creates the default workspace if this is first-time onboarding
  - Sets `user.onboarded = true` via better-auth's `updateUser`

- [ ] Checkpoint: Valid AWS credentials connect and `status = Connected`
- [ ] Checkpoint: Invalid credentials return `{ code: "PROVIDER_AUTH_ERROR" }` 422
- [ ] Checkpoint: `GET /provider` never returns accessKeyId or secretAccessKey fields
- [ ] Checkpoint: `access_key_id_hint` stores only last 4 chars
- [ ] Checkpoint: Health check updates `last_checked` timestamp
- [ ] Checkpoint: Encrypting then decrypting produces identical credentials
- [ ] Checkpoint: Connecting a provider with existing objects triggers sync job — `sync_status` transitions `pending → syncing → completed`
- [ ] Checkpoint: `GET /provider/sync/status` returns live progress (`syncCompletedObjects` increments per page)
- [ ] Checkpoint: Sync job is idempotent — running it twice on the same bucket produces no duplicate file records
- [ ] Checkpoint: Keys like `photos/2024/beach.jpg` produce folder records for `photos/` and `photos/2024/` with correct parent linkage
- [ ] Checkpoint: `s3_import` files have `source = 's3_import'`, BYOC-uploaded files have `source = 'byoc'`
- [ ] Checkpoint: Sync job crash mid-page resumes from Redis-persisted continuation token, not from page 1
- [ ] Checkpoint: Lazy validation — accessing a deleted S3 object via preview-url returns 404 and marks file `status = deleted` in DB
- [ ] Checkpoint: Periodic diff job detects a file deleted directly from S3 and soft-deletes the DB record
- [ ] Checkpoint: Periodic diff job detects a file added directly to S3 and inserts a new DB record
- [ ] Checkpoint: `POST /provider/sync` while already syncing returns 409
- [ ] Checkpoint: S3 webhook `ObjectRemoved` event marks the correct file as deleted by `storage_path`

---

## Phase 8 — Folder Management Routes

### Routes

```
POST   /api/v1/workspaces/:workspaceId/folders
PATCH  /api/v1/workspaces/:workspaceId/folders/:folderId
DELETE /api/v1/workspaces/:workspaceId/folders/:folderId
PATCH  /api/v1/workspaces/:workspaceId/folders/:folderId/move
```

### Steps

- [ ] Create `src/modules/folders/folders.service.ts`:
  - `createFolder(workspaceId, userId, { name, parentId })`:
    - `requirePermission("canCreateFolders")`
    - Validate name: no `/`, no null bytes, max 255 chars
    - Compute `path`: parent's path + `name + "/"`
    - INSERT folder
    - Log activity: `folder_created`
  - `renameFolder(workspaceId, folderId, name)`:
    - UPDATE folder name and path
    - Cascade update path for all descendants using recursive CTE:
      ```sql
      WITH RECURSIVE sub AS (
        SELECT id, path FROM folders WHERE id = $folderId
        UNION ALL
        SELECT f.id, replace(f.path, old_path, new_path)
        FROM folders f JOIN sub ON f.parent_id = sub.id
      )
      UPDATE folders SET path = sub.path FROM sub WHERE folders.id = sub.id
      ```
  - `deleteFolder(workspaceId, folderId)`:
    - `requirePermission("canDeleteFiles")`
    - Fetch all file IDs in this folder and all descendants (recursive CTE)
    - Mark files as `status = 'deleted'`
    - Enqueue background S3 delete jobs for each file
    - DELETE folder (cascades to children via FK)
    - Log activity: `deleted`
  - `moveFolder(workspaceId, folderId, targetParentId)`:
    - Validate target is not a descendant (cycle prevention)
    - UPDATE parent_id and recompute paths

- [ ] Create `src/modules/folders/folders.router.ts`

- [ ] Checkpoint: Create folder at root (parentId = null)
- [ ] Checkpoint: Create nested folder — path computed correctly
- [ ] Checkpoint: Rename folder cascades path update to all descendants
- [ ] Checkpoint: Moving folder to its own descendant returns 422
- [ ] Checkpoint: Delete folder soft-deletes all files inside

---

## Phase 9 — File Metadata Routes

### Routes

```
GET    /api/v1/workspaces/:workspaceId/files
GET    /api/v1/workspaces/:workspaceId/files/:fileId
PATCH  /api/v1/workspaces/:workspaceId/files/:fileId
PATCH  /api/v1/workspaces/:workspaceId/files/:fileId/move
DELETE /api/v1/workspaces/:workspaceId/files/:fileId
GET    /api/v1/workspaces/:workspaceId/files/:fileId/preview-url
GET    /api/v1/workspaces/:workspaceId/files/:fileId/download-url
```

### Steps

- [ ] Create `src/modules/files/files.service.ts`:
  - `listFiles(workspaceId, query)`:
    - WHERE clause includes `workspaceId` and `status = 'ready'` always
    - Apply optional `folderId`, `kind`, `search` (ILIKE), `sortBy`, `sortOrder`
    - Also query folders at the same level for the explorer tree
    - Return `{ files, folders, breadcrumb, total, page, limit }`
    - Breadcrumb: walk from requested folderId up to root
  - `getFile(workspaceId, fileId)`:
    - Always include `(workspaceId, fileId)` pair in WHERE — prevents IDOR
    - Return file + last 20 activity entries for this file + share link if exists
  - `renameFile(workspaceId, fileId, name)`:
    - Validate name
    - UPDATE name + last_modified
    - Log activity: `renamed`
  - `moveFile(workspaceId, fileId, targetFolderId)`:
    - Validate target folder belongs to same workspace
    - UPDATE folder_id
    - Log activity: `moved`
  - `deleteFile(workspaceId, fileId, userId)`:
    - `requirePermission("canDeleteFiles")`
    - UPDATE status = 'deleted'
    - Enqueue S3 delete job
    - Disable associated share links
    - Log activity: `deleted`
    - Create notification for file uploader (if not self)
  - `getPreviewUrl(workspaceId, fileId)`:
    - Verify file status = 'ready'
    - Decrypt provider creds
    - Generate presigned GET URL (60s expiry)
    - Log activity: `previewed`
  - `getDownloadUrl(workspaceId, fileId)`:
    - Generate presigned GET URL with Content-Disposition: attachment (300s expiry)
    - Log activity: `downloaded`

- [ ] Create `src/modules/files/files.router.ts`

- [ ] Checkpoint: `GET /files` with `kind=image` returns only images
- [ ] Checkpoint: `GET /files` with `search=logo` returns ILIKE matches
- [ ] Checkpoint: Breadcrumb array is correct for a 3-level deep folder
- [ ] Checkpoint: Accessing file from a different workspace returns 404
- [ ] Checkpoint: Preview URL has <60s expiry and is a valid S3 URL
- [ ] Checkpoint: Download URL includes Content-Disposition header encoded in presigned URL

---

## Phase 10 — Multipart Upload System

### Routes

```
POST   /api/v1/workspaces/:workspaceId/upload/presign          (small files < 5MB)
POST   /api/v1/workspaces/:workspaceId/upload/initiate         (large files)
GET    /api/v1/workspaces/:workspaceId/upload/:sessionId
PATCH  /api/v1/workspaces/:workspaceId/upload/:sessionId/progress
POST   /api/v1/workspaces/:workspaceId/upload/:sessionId/complete
POST   /api/v1/workspaces/:workspaceId/upload/:sessionId/abort
POST   /api/v1/workspaces/:workspaceId/upload/:sessionId/refresh-urls
POST   /api/v1/workspaces/:workspaceId/upload/:fileId/confirm  (confirm small file)
```

### Steps

- [ ] Create `src/modules/upload/upload.service.ts`:

  **Small file flow (`/upload/presign`)**:
  - `requirePermission("canUpload")`
  - Validate: size < 5MB, name, mimeType
  - Generate `storagePath = {workspaceId}/{folderId|root}/{uuid}/{sanitized-filename}`
  - INSERT file row with `status = 'uploading'`
  - Generate presigned PUT URL (15-min expiry) with Content-Type constraint
  - Return `{ fileId, presignedPutUrl, expiresAt }`

  **Small file confirm (`/upload/:fileId/confirm`)**:
  - Call `headObject` on provider to get confirmed size
  - UPDATE file: `status = 'ready'`, `size`, `last_modified`
  - Log activity: `uploaded`

  **Multipart initiate (`/upload/initiate`)**:
  - `requirePermission("canUpload")`
  - For each file in request:
    1. Validate size >= 5MB, enforce max concurrent sessions (10 per workspace)
    2. Generate `storagePath`
    3. Call `initiateMultipartUpload(storagePath, mimeType)` → get `providerUploadId`
    4. Calculate `totalChunks = ceil(size / chunkSize)` (default chunkSize = 10MB)
    5. Batch-generate presigned upload part URLs for all parts (1-hour expiry)
    6. INSERT file row (`status = 'uploading'`)
    7. INSERT upload_sessions row (`status = 'pending'`, `expires_at = now + 24h`)
  - Return array of `{ sessionId, fileId, fileName, parts[{partNumber, presignedUrl}], expiresAt }`

  **Progress update (`/upload/:sessionId/progress`)**:
  - Verify session belongs to this workspace and user
  - Merge `completedChunks` JSONB (upsert by partNumber)
  - UPDATE status = 'in_progress'

  **Complete (`/upload/:sessionId/complete`)**:
  - Verify session
  - Verify all parts present (`parts.length === session.total_chunks`)
  - Call `completeMultipartUpload(storagePath, providerUploadId, parts)`
  - Call `headObject` to confirm final size
  - UPDATE file: `status = 'ready'`, `size`, `last_modified`
  - UPDATE session: `status = 'completed'`
  - Log activity: `uploaded`
  - Create `file_uploaded` notifications for workspace owners/admins (async)
  - Return full FileItem

  **Abort (`/upload/:sessionId/abort`)**:
  - Call `abortMultipartUpload`
  - UPDATE session: `status = 'aborted'`
  - UPDATE file: `status = 'failed'`

  **Refresh URLs (`/upload/:sessionId/refresh-urls`)**:
  - Find incomplete parts (not in `completed_chunks`)
  - Generate fresh presigned URLs for those parts only
  - Return new `parts` array

- [ ] Create `src/modules/upload/upload.router.ts`

- [ ] **Upload progress tracking — client side only, no backend involvement**

  Because files upload **browser → S3 directly** via presigned URLs, the backend never sees a byte. Progress is tracked entirely on the frontend using XHR `upload.onprogress`. Use XHR (not fetch) for each part PUT:

  ```typescript
  // One XHR per part. Track bytes uploaded per part in a Map.
  const partProgress = new Map<number, number>()  // partNumber → bytesUploaded so far

  function uploadPart(url: string, chunk: Blob, partNumber: number, onTotalProgress: () => void) {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("PUT", url)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          partProgress.set(partNumber, e.loaded)
          onTotalProgress()   // re-aggregate and update React state
        }
      }
      xhr.onload = () => xhr.status === 200
        ? resolve(xhr.getResponseHeader("ETag")!)
        : reject(new Error(`${xhr.status}`))
      xhr.onerror = () => reject(new Error("network"))
      xhr.send(chunk)
    })
  }

  // Aggregate across all parts for a single file:
  const percentDone = Math.round(
    [...partProgress.values()].reduce((a, b) => a + b, 0) / file.size * 100
  )

  // Aggregate across all files for the overall progress bar:
  const overallPercent = Math.round(
    allFiles.reduce((sum, f) => sum + f.uploadedBytes, 0) /
    allFiles.reduce((sum, f) => sum + f.size, 0) * 100
  )
  ```

  Upload parts **in parallel** (e.g. 3 concurrent parts per file) using a concurrency limiter — uploading all parts simultaneously saturates the connection and gives worse throughput than controlled concurrency.

  The `PATCH /upload/:sessionId/progress` backend call is made **after each part completes** (not during it) — its purpose is resume checkpointing, not UI updates.

- [ ] Checkpoint: Small file presign → PUT to presigned URL → confirm → file `status = ready`
- [ ] Checkpoint: Multipart initiate for 50MB file creates session + file rows
- [ ] Checkpoint: Parts are generated with correct content-type constraint
- [ ] Checkpoint: Complete with wrong part count returns 422
- [ ] Checkpoint: Abort calls S3 `AbortMultipartUpload` and marks session aborted
- [ ] Checkpoint: Refresh-URLs returns only URLs for incomplete parts
- [ ] Checkpoint: Concurrent session limit (11th session returns 429)
- [ ] Checkpoint: XHR progress events fire during part upload and React state updates correctly
- [ ] Checkpoint: Progress bar reaches 100% before the `complete` call is made (S3 received all bytes)

---

## Phase 10.5 — Server-Sent Events (SSE)

> SSE is **not** used for upload progress (that is client-side XHR). SSE is used for pushing workspace-level events to all connected clients so the UI updates live without polling.

### Route

```
GET  /api/v1/workspaces/:workspaceId/events    ← persistent SSE stream, one per browser tab
```

### Why SSE over polling or WebSockets

- **Polling**: wastes requests when nothing has changed, delayed feedback, wakes the server on a schedule
- **WebSockets**: bidirectional — overkill here since all updates flow server → client only
- **SSE**: one persistent HTTP connection, server pushes when something happens, auto-reconnects on drop, works over HTTP/1.1, no protocol upgrade needed

### Event types pushed on this stream

```typescript
type SSEEvent =
  | { type: "file.uploaded";     payload: FileItem }
  | { type: "file.deleted";      payload: { fileId: string } }
  | { type: "file.renamed";      payload: { fileId: string; name: string } }
  | { type: "member.joined";     payload: WorkspaceMember }
  | { type: "member.removed";    payload: { memberId: string } }
  | { type: "notification.new";  payload: Notification }
  | { type: "provider.status";   payload: { status: string; lastChecked: string } }
  | { type: "sync.progress";     payload: { completed: number; total: number; status: string } }
  | { type: "link.expired";      payload: { linkId: string } }
  | { type: "ping";              payload: null }   // keepalive every 30s
```

`sync.progress` is the one case where SSE acts as a live progress bar — the initial bucket sync runs on the backend and the client has no other way to receive updates without polling.

### Steps

- [ ] Create `src/modules/events/events.service.ts` — in-memory SSE client registry:
  ```typescript
  // Map of workspaceId → Set of active Response objects
  const clients = new Map<string, Set<Response>>()

  export function addClient(workspaceId: string, res: Response) {
    if (!clients.has(workspaceId)) clients.set(workspaceId, new Set())
    clients.get(workspaceId)!.add(res)
  }

  export function removeClient(workspaceId: string, res: Response) {
    clients.get(workspaceId)?.delete(res)
  }

  export function broadcast(workspaceId: string, event: SSEEvent) {
    const data = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`
    clients.get(workspaceId)?.forEach((res) => {
      try { res.write(data) } catch { /* client disconnected */ }
    })
  }
  ```

- [ ] Create `src/modules/events/events.controller.ts`:
  ```typescript
  subscribe = (req: Request, res: Response) => {
    res.setHeader("Content-Type",  "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection",    "keep-alive")
    res.flushHeaders()

    addClient(req.workspaceId, res)

    // Keepalive ping every 30s to prevent proxy timeouts
    const ping = setInterval(() => {
      res.write("event: ping\ndata: null\n\n")
    }, 30_000)

    req.on("close", () => {
      clearInterval(ping)
      removeClient(req.workspaceId, res)
    })
  }
  ```

- [ ] Create `src/modules/events/events.router.ts`:
  ```
  GET /api/v1/workspaces/:workspaceId/events  → requireAuth → requireWorkspaceMember → ctrl.subscribe
  ```

- [ ] Call `broadcast()` from every service that mutates shared state:
  - `upload.service.ts` — after `complete()` → broadcast `file.uploaded`
  - `files.service.ts` — after `deleteFile()` → broadcast `file.deleted`
  - `files.service.ts` — after `renameFile()` → broadcast `file.renamed`
  - `members.service.ts` — after member added/removed → broadcast `member.joined` / `member.removed`
  - `notifications.service.ts` — after `createNotification()` → broadcast `notification.new`
  - `provider.service.ts` — after `healthCheck()` → broadcast `provider.status`
  - `bucket-sync.job.ts` — after each page → broadcast `sync.progress`
  - `share-links.service.ts` — after link auto-expires → broadcast `link.expired`

- [ ] Add `src/modules/events/` to the folder structure
- [ ] Add `events.service.ts` to the shared services that other modules import — it follows the same inter-service rule: services call `broadcast()` directly, never the controller

- [ ] Checkpoint: Opening `/events` returns `Content-Type: text/event-stream` with 200
- [ ] Checkpoint: Uploading a file from one browser tab triggers a `file.uploaded` event in another tab in the same workspace
- [ ] Checkpoint: Bucket sync broadcasts `sync.progress` events with incrementing `completed` count
- [ ] Checkpoint: Client disconnecting removes it from the registry (no memory leak)
- [ ] Checkpoint: Ping events fire every 30 seconds on idle connections
- [ ] Checkpoint: User in workspace A does not receive events from workspace B

---

## Phase 11 — Share Links System

### Routes

```
GET    /api/v1/workspaces/:workspaceId/share-links
POST   /api/v1/workspaces/:workspaceId/share-links
GET    /api/v1/workspaces/:workspaceId/share-links/:linkId
PATCH  /api/v1/workspaces/:workspaceId/share-links/:linkId
DELETE /api/v1/workspaces/:workspaceId/share-links/:linkId
POST   /api/v1/workspaces/:workspaceId/share-links/:linkId/invite
GET    /s/:slug      (public, no auth)
```

### Steps

- [ ] Create `src/modules/share-links/share-links.service.ts`:
  - `createShareLink(workspaceId, userId, data)`:
    - `requirePermission("canShareFiles")`
    - Check `disablePublicSharing` policy if `accessType === 'Public'`
    - Check `requirePasswordForPublicLinks` policy
    - Check plan quota: Free = max 5 active links
    - Hash password if provided (bcrypt)
    - Generate slug: `nanoid(10)`, retry on collision (max 3 retries)
    - INSERT share_links
    - Log activity: `shared`
    - Create `link_created` notification
    - Return link with `shareUrl = ${FRONTEND_URL}/s/${slug}`
  - `listShareLinks(workspaceId, query)`:
    - Filter by status, accessType, search
    - Sort by createdAt, visits, expiresAt
    - Also return aggregate stats (active count, expired count, total visits, password-protected count)
  - `getShareLink(workspaceId, linkId)`:
    - Return link + last 20 visit records
  - `updateShareLink(workspaceId, linkId, data)`:
    - Re-validate security policies if accessType changing
  - `deleteShareLink(workspaceId, linkId)`:
    - DELETE link (cascades visit records)
    - UPDATE file.share_link = null if this was the file's link
    - Log activity: `unshared`
  - `accessPublicLink(slug, passwordAttempt?, ip, userAgent)` — unauthenticated:
    - Look up by slug
    - Check status
    - Check expiry → auto-expire if past
    - Check accessType: Public / PasswordProtected / Private handling
    - Verify password hash if needed
    - INSERT share_link_visits, increment visits counter
    - Decrypt provider creds, generate presigned URL (2 min for preview, 5 min for download)
    - Return `{ fileName, fileType, allowDownload, previewUrl, downloadUrl? }`

- [ ] Create `src/modules/share-links/share-links.router.ts`
- [ ] Mount public route `GET /s/:slug` BEFORE auth middleware (no auth required)

- [ ] Checkpoint: Creating Public link on workspace with `disablePublicSharing = true` returns 403
- [ ] Checkpoint: Free plan quota — 6th link returns 403
- [ ] Checkpoint: Public link access records visit + increments counter
- [ ] Checkpoint: Expired link returns 410 and updates status in DB
- [ ] Checkpoint: Password-protected link rejects wrong password
- [ ] Checkpoint: Private link returns 403 to unauthenticated request
- [ ] Checkpoint: `GET /share-links` stats object counts are accurate

---

## Phase 12 — Notifications & Activity

### Routes

```
GET    /api/v1/users/me/notifications
PATCH  /api/v1/users/me/notifications/:id/read
PATCH  /api/v1/users/me/notifications/read-all
DELETE /api/v1/users/me/notifications/:id
DELETE /api/v1/users/me/notifications
GET    /api/v1/users/me/notifications/count
GET    /api/v1/workspaces/:workspaceId/activity
```

### Steps

- [ ] Create `src/modules/notifications/notifications.service.ts`:
  - `listNotifications(userId, filter, page, limit)`:
    - Filter tabs: `all | unread | files | members | security | system`
    - Map filter to type groups:
      - `files` → `file_shared, file_uploaded, file_deleted, link_expired, link_created`
      - `members` → `member_joined`
      - `security` → `security`
      - `system` → `system`
    - WHERE `dismissed = false`
    - ORDER BY `created_at DESC`
  - `getUnreadCount(userId)` → single count query, cache in Redis (30s TTL, invalidate on new notification or mark-read)
  - `markRead(userId, notifId)` → UPDATE read = true WHERE id = ? AND user_id = ?
  - `markAllRead(userId, filter?)` → batch UPDATE
  - `dismiss(userId, notifId)` → UPDATE dismissed = true
  - `dismissAll(userId, filter?)` → batch UPDATE dismissed = true
  - `createNotification(data)` — internal use by other services:
    - INSERT notification
    - Invalidate Redis unread count for the user

- [ ] Create `src/modules/activity/activity.service.ts`:
  - `logActivity(data)` — called by every service that mutates data:
    - Check `workspace_security.enable_activity_logs` first
    - INSERT activity_logs
  - `listActivity(workspaceId, query)`:
    - Verify `enable_activity_logs` is true → else 403
    - Filter by fileId, userId, action
    - Paginate

- [ ] Create `src/modules/notifications/notifications.router.ts`
- [ ] Create `src/modules/activity/activity.router.ts`

- [ ] Checkpoint: Creating a share link creates a notification for the file owner
- [ ] Checkpoint: Unread count endpoint returns correct number
- [ ] Checkpoint: Marking one notification read doesn't affect others
- [ ] Checkpoint: `GET /activity` with `enableActivityLogs = false` returns 403
- [ ] Checkpoint: `dismissAll?filter=files` only dismisses file-type notifications

---

## Phase 13 — Dashboard & Analytics Routes

### Routes

```
GET    /api/v1/workspaces/:workspaceId/dashboard
GET    /api/v1/workspaces/:workspaceId/analytics?days=30
```

### Steps

- [ ] Create `src/modules/analytics/analytics.service.ts`:
  - `getDashboardData(workspaceId)`:
    - Run these queries in parallel:
      1. Total file count + total size (WHERE status = 'ready')
      2. Active share links count
      3. Uploads this week count
      4. Storage by kind (GROUP BY kind, SUM(size))
      5. Recent files (last 5, status = 'ready', ORDER BY uploaded_at DESC)
      6. Recent activity (last 10 from activity_logs)
      7. Provider health (read last_checked + status from storage_providers)
    - Cache result for 2 minutes in Redis: key `ws:{workspaceId}:dashboard`
  - `getAnalytics(workspaceId, days)`:
    - Storage trend: SELECT from storage_snapshots for last N days
    - Storage breakdown by kind
    - Upload/download activity from activity_logs (GROUP BY DATE(created_at), action)
    - Top shared links: GROUP BY share_link_id from share_link_visits, ORDER BY COUNT DESC LIMIT 10
    - Recent activity: last 20 activity_logs

- [ ] Create `src/modules/analytics/analytics.router.ts`

- [ ] Checkpoint: Dashboard returns in <200ms (indexes + parallel queries)
- [ ] Checkpoint: Analytics storage trend shows correct daily snapshots
- [ ] Checkpoint: Top shared links sorted by visit count

---

## Phase 14 — User Profile & Settings Routes

### Routes

```
GET    /api/v1/users/me
PATCH  /api/v1/users/me
POST   /api/v1/users/me/avatar
DELETE /api/v1/users/me/avatar
POST   /api/v1/users/me/email/change-request
POST   /api/v1/users/me/email/verify
GET    /api/v1/users/me/notification-preferences
PATCH  /api/v1/users/me/notification-preferences
PATCH  /api/v1/users/me/preferences
PATCH  /api/v1/users/me/privacy
POST   /api/v1/users/me/export
POST   /api/v1/users/me/deactivate
DELETE /api/v1/users/me
```

### Steps

- [ ] Create `src/modules/users/users.service.ts`:
  - `getProfile(userId)` — return user + preferences + account overview stats (files, storage, share links, workspaces counts)
  - `updateProfile(userId, data)`:
    - Validate username uniqueness
    - Use better-auth's `auth.api.updateUser()` for name/email fields
    - Direct DB UPDATE for `username, bio, location, website` (additionalFields)
  - `uploadAvatar(userId, fileBuffer, mimeType)`:
    - Resize to 256×256 using sharp (add `sharp` dependency)
    - Upload to internal BYOC bucket (separate provider config for platform files)
    - UPDATE user.avatarKey
  - `changeEmailRequest(userId, newEmail, currentPassword)`:
    - Verify current password
    - Generate verification token
    - Store in `verification` table (better-auth's table)
    - Send email
  - `changeEmailVerify(token)`:
    - Verify token
    - UPDATE user.email
  - `getNotificationPreferences(userId)` → SELECT from user_preferences
  - `updateNotificationPreferences(userId, data)` → UPSERT user_preferences
  - `updatePreferences(userId, data)` → UPSERT user_preferences
  - `updatePrivacy(userId, data)` → UPSERT user_preferences
  - `requestDataExport(userId)` → enqueue export job
  - `deleteAccount(userId, confirmEmail)`:
    - Verify confirmEmail matches user.email
    - Revoke all sessions via better-auth
    - Hard DELETE user record (FK cascades handle the rest)

- [ ] Create `src/modules/users/users.router.ts`

- [ ] Checkpoint: Username change validates uniqueness
- [ ] Checkpoint: Avatar upload resizes and stores in internal bucket
- [ ] Checkpoint: Preference changes persist across requests
- [ ] Checkpoint: Account delete requires matching email confirmation

---

## Phase 15 — Billing Routes

### Routes

```
GET    /api/v1/billing/plans
GET    /api/v1/workspaces/:workspaceId/billing
POST   /api/v1/workspaces/:workspaceId/billing/upgrade
```

### Steps

- [ ] Create static plan data in `src/modules/billing/billing.service.ts`:
  ```typescript
  const PLANS = {
    free:  { id: "free",  name: "Free",  price: 0,    maxWorkspaces: 1,  maxShareLinks: 5 },
    pro:   { id: "pro",   name: "Pro",   price: 800,  maxWorkspaces: 3,  maxShareLinks: -1 },
    team:  { id: "team",  name: "Team",  price: 2400, maxWorkspaces: -1, maxShareLinks: -1 },
  }
  ```

- [ ] `getBillingInfo(workspaceId)`:
  - Require `canManageBilling` permission
  - Return plan details + usage stats (from files/share-links/members counts)
  - Estimated cost: compute from total storage bytes * AWS S3 pricing constants

- [ ] `requestUpgrade(workspaceId, planId)`:
  - Send email to admin with upgrade request details
  - Return `{ message: "Upgrade request received." }`

- [ ] Checkpoint: `GET /billing` requires `canManageBilling` permission
- [ ] Checkpoint: Usage counts are accurate

---

## Phase 16 — Background Jobs

### Steps

- [ ] Install `node-cron`

- [ ] Create `src/jobs/upload-cleanup.job.ts` — runs every 30 min:
  - Find upload_sessions WHERE `expires_at < now()` AND `status IN ('pending','in_progress')`
  - For each: call `abortMultipartUpload`, UPDATE session + file status

- [ ] Create `src/jobs/link-expiry.job.ts` — runs every hour:
  - Find share_links WHERE `expires_at < now()` AND `status = 'Active'`
  - Batch UPDATE status = 'Expired'
  - Create `link_expired` notifications for link creators (respect `email_link_expiry` preference)

- [ ] Create `src/jobs/storage-snapshot.job.ts` — runs daily at midnight UTC:
  - For each workspace with a connected provider:
    - Aggregate SUM(size) GROUP BY kind FROM files WHERE status = 'ready'
    - UPSERT into storage_snapshots for today's date

- [ ] Create `src/jobs/provider-health.job.ts` — runs every 6 hours:
  - For each connected provider:
    - Call `verifyConnection()`
    - UPDATE status + last_checked
    - If status changed to 'Error': create `storage_warning` notification for workspace owner

- [ ] Create `src/jobs/notification-cleanup.job.ts` — runs daily:
  - DELETE notifications WHERE `created_at < now() - 90 days`
  - DELETE WHERE `created_at < now() - 30 days` AND (`read = true` OR `dismissed = true`)

- [ ] Create `src/jobs/activity-cleanup.job.ts` — runs daily:
  - DELETE activity_logs based on plan retention limits per workspace

- [ ] Create `src/jobs/bucket-diff.job.ts` — runs daily at 02:00 UTC:
  - For each workspace with `sync_status = 'completed'`:
    1. Collect all `storage_path` values from `files` WHERE `status = 'ready'`
    2. Paginate full `listObjects` from S3, build a Set of all current keys
    3. DB paths not in S3 → `UPDATE files SET status = 'deleted'` (deleted directly from S3)
    4. S3 keys not in DB → insert new file records with `source = 's3_import'` (added directly to S3)
  - This is the safety net for workspaces without S3 event notifications configured

- [ ] Create `src/jobs/jobs.ts` — register all cron schedules

- [ ] Wire `jobs.ts` into `index.ts` after server start

- [ ] Add public webhook route to `app.ts` (before auth middleware):
  ```
  POST /api/v1/webhooks/s3   ← S3 event notifications (ObjectCreated / ObjectRemoved)
  ```
  - Verify AWS SNS signature before processing
  - `ObjectCreated` → insert file record using same logic as sync job
  - `ObjectRemoved` → soft-delete file by `storage_path`

- [ ] Checkpoint: Upload cleanup job aborts real in-progress S3 multipart uploads
- [ ] Checkpoint: Link expiry job updates status and creates notifications
- [ ] Checkpoint: Storage snapshot job creates rows for each active workspace
- [ ] Checkpoint: Bucket diff job runs without error on an empty workspace and a populated workspace
- [ ] Checkpoint: S3 webhook rejects requests with invalid SNS signatures

---

## Phase 17 — Integration Tests & Hardening

### Steps

- [ ] Add `zod` validation middleware wrapper for all request bodies and query params
- [ ] Verify all workspace-scoped routes use `(workspaceId, resourceId)` pair — never `resourceId` alone
- [ ] Add `helmet()` middleware to `app.ts`
- [ ] Configure CORS to `FRONTEND_URL` only with `credentials: true`
- [ ] Implement rate limiting middleware using Redis:
  - Auth endpoints: 10 req / 15 min per IP+email
  - General API: 300 req / 1 min per userId
  - Upload initiate: 20 per hour per userId
  - Public share link access: 60 req / 1 min per IP
- [ ] Verify pino redaction masks all sensitive fields in logs
- [ ] Verify no presigned URLs or credentials appear in any 5xx error responses
- [ ] Checkpoint: Attempt to access workspace resource with another workspace's token → 404 (not 403)
- [ ] Checkpoint: SQLi attempt in search param is safely parameterized
- [ ] Checkpoint: 11th concurrent upload session returns 429
- [ ] Checkpoint: Rate limiter blocks 11th login attempt

---

## Environment Variables Reference

```env
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/byoc

# Redis
REDIS_URL=redis://localhost:6379

# Better Auth
BETTER_AUTH_SECRET=<random 32+ char string>
BETTER_AUTH_URL=http://localhost:4000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Encryption
CRED_ENCRYPTION_KEY=<exactly 32 bytes hex encoded>

# Internal BYOC storage (for avatars, exports)
INTERNAL_BUCKET=byoc-platform-files
INTERNAL_BUCKET_REGION=us-east-1
INTERNAL_BUCKET_ACCESS_KEY_ID=
INTERNAL_BUCKET_SECRET_ACCESS_KEY=

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@byoc.app
```

---

## Implementation Order Summary

| Phase | What | Dependency |
|-------|------|------------|
| 0 | Bootstrap + config | — |
| 1 | Database schema (incl. sync columns) | Phase 0 |
| 2 | better-auth + auth routes | Phase 1 |
| 3 | Workspace middleware | Phase 2 |
| 4 | Workspace CRUD | Phase 3 |
| 5 | Member management | Phase 4 |
| 6 | Workspace settings (permissions/security) | Phase 4 |
| 7 | Storage provider + crypto + **bucket sync** | Phase 4 |
| 8 | Folder management | Phase 7 |
| 9 | File metadata routes + **lazy S3 validation** | Phase 7, 8 |
| 10 | Multipart upload (XHR progress client-side) | Phase 7, 9 |
| 10.5 | SSE — workspace live events + sync progress | Phase 10 |
| 11 | Share links | Phase 9 |
| 12 | Notifications + activity | Phase 9, 11 |
| 13 | Dashboard + analytics | Phase 9, 12 |
| 14 | User profile + settings | Phase 2 |
| 15 | Billing | Phase 4 |
| 16 | Background jobs + **bucket diff** + **S3 webhook** | Phase 10, 11, 12 |
| 17 | Tests + hardening | All |
