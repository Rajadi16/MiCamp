import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { LiveLocationPayload, LiveLocationSnapshot } from '../types/map';

interface EventStreamClient {
  id: string;
  response: Response;
}

export class LiveLocationService {
  private readonly locations = new Map<string, LiveLocationSnapshot>();
  private readonly clients = new Map<string, EventStreamClient>();
  private readonly ttlMs: number;
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(ttlMinutes = 5) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.cleanupInterval = setInterval(() => this.pruneExpiredLocations(), 15 * 1000);
  }

  public dispose() {
    clearInterval(this.cleanupInterval);
    this.clients.forEach(({ response }) => response.end());
    this.clients.clear();
  }

  public getAllLocations(): LiveLocationSnapshot[] {
    return Array.from(this.locations.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  public getLocation(userId: string): LiveLocationSnapshot | undefined {
    return this.locations.get(userId);
  }

  public updateLocation(payload: LiveLocationPayload): LiveLocationSnapshot {
    const snapshot: LiveLocationSnapshot = {
      ...payload,
      displayName: payload.displayName ?? payload.userId,
      accuracy: payload.accuracy ?? 15,
      updatedAt: new Date().toISOString(),
    };

    this.locations.set(payload.userId, snapshot);
    this.broadcast({
      type: 'update',
      payload: [snapshot],
    });
    return snapshot;
  }

  public registerClient(response: Response): string {
    const clientId = randomUUID();

    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    response.write(`data: ${JSON.stringify({ type: 'sync', payload: this.getAllLocations() })}\n\n`);

    this.clients.set(clientId, { id: clientId, response });
    return clientId;
  }

  public removeClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.response.end();
      this.clients.delete(clientId);
    }
  }

  private broadcast(event: Record<string, unknown>) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    this.clients.forEach(({ response }) => {
      response.write(payload);
    });
  }

  private pruneExpiredLocations() {
    const threshold = Date.now() - this.ttlMs;
    let removed = false;

    this.locations.forEach((location, userId) => {
      if (new Date(location.updatedAt).getTime() < threshold) {
        this.locations.delete(userId);
        removed = true;
      }
    });

    if (removed) {
      this.broadcast({ type: 'sync', payload: this.getAllLocations() });
    }
  }
}

