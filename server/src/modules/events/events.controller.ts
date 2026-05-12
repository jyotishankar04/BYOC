import type { Request, Response } from "express";
import { addClient, removeClient } from "./events.service";

export class EventsController {
  subscribe = (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    res.write(": connected\n\n");
    addClient(workspaceId, res);

    const ping = setInterval(() => {
      try {
        res.write("event: ping\ndata: null\n\n");
      } catch {
        clearInterval(ping);
        removeClient(workspaceId, res);
      }
    }, 30_000);

    req.on("close", () => {
      clearInterval(ping);
      removeClient(workspaceId, res);
    });
  };
}
