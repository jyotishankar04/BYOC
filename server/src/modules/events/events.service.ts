import type { Response } from "express";

export type SSEEvent =
  | { type: "file.uploaded"; payload: unknown }
  | { type: "file.deleted"; payload: { fileId: string } }
  | { type: "file.renamed"; payload: { fileId: string; name: string } }
  | { type: "member.joined"; payload: unknown }
  | { type: "member.removed"; payload: { memberId: string } }
  | { type: "notification.new"; payload: unknown }
  | { type: "provider.status"; payload: { status: string; lastChecked: string } }
  | { type: "sync.progress"; payload: { completed: number; total: number; status: string } }
  | { type: "link.expired"; payload: { linkId: string } }
  | { type: "ping"; payload: null };

const clients = new Map<string, Set<Response>>();

export function addClient(workspaceId: string, res: Response): void {
  if (!clients.has(workspaceId)) {
    clients.set(workspaceId, new Set());
  }
  clients.get(workspaceId)!.add(res);
}

export function removeClient(workspaceId: string, res: Response): void {
  const workspaceClients = clients.get(workspaceId);
  if (!workspaceClients) return;

  workspaceClients.delete(res);
  if (workspaceClients.size === 0) {
    clients.delete(workspaceId);
  }
}

export function broadcast(workspaceId: string, event: SSEEvent): void {
  const workspaceClients = clients.get(workspaceId);
  if (!workspaceClients || workspaceClients.size === 0) return;

  const data = `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;

  for (const res of workspaceClients) {
    try {
      res.write(data);
    } catch {
      removeClient(workspaceId, res);
    }
  }
}
