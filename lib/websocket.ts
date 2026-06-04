/**
 * WebSocket client — connects browser directly to Spring Boot STOMP endpoint.
 * SockJS sends the auth_token cookie automatically on the HTTP upgrade request.
 * Spring Boot's HandshakeInterceptor reads and validates it server-side.
 *
 * Usage:
 *   import { ws } from '@/lib/websocket';
 *   ws.connect();
 *   const unsub = ws.subscribe('/topic/conversation/123', (msg) => { ... });
 *   ws.send('/app/chat/123/send', { content: 'hello' });
 *   unsub();
 *   ws.disconnect();
 */

import { Client, type StompSubscription, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type MessageCallback = (body: unknown) => void;

class WebSocketManager {
  private client: Client | null = null;
  private subscriptions = new Map<string, StompSubscription>();
  private pendingSubscriptions: Array<{ topic: string; callback: MessageCallback; id: string }> = [];
  private connected = false;
  private onConnectCallbacks: Array<() => void> = [];
  private onDisconnectCallbacks: Array<() => void> = [];

  /** Connect to the Spring Boot STOMP endpoint. Call once after auth. */
  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      // 1. Fetch the HttpOnly token securely from our Next.js API
      const res = await fetch('/api/auth/token');
      if (!res.ok) throw new Error('Failed to fetch auth token');
      const { token } = await res.json();
      if (!token) throw new Error('No auth token found');

      // 2. Establish connection directly to the Spring Boot backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL ?? 'https://localhost:8443';

      return new Promise((resolve, reject) => {
        this.client = new Client({
          webSocketFactory: () => new SockJS(`${backendUrl}/ws`),
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },

        onConnect: () => {
          this.connected = true;
          // Drain pending subscriptions
          for (const { topic, callback, id } of this.pendingSubscriptions) {
            this._subscribe(topic, callback, id);
          }
          this.pendingSubscriptions = [];
          this.onConnectCallbacks.forEach(cb => cb());
          resolve();
        },

        onStompError: (frame) => {
          console.error('STOMP error', frame);
          reject(new Error(frame.headers?.message ?? 'STOMP connection error'));
        },

        onDisconnect: () => {
          this.connected = false;
          this.subscriptions.clear();
          this.onDisconnectCallbacks.forEach(cb => cb());
        },

        onWebSocketClose: () => {
          this.connected = false;
        },
      });

      this.client.activate();
    });
    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }
  }

  /** Subscribe to a STOMP topic. Returns unsubscribe function. */
  subscribe(topic: string, callback: MessageCallback): () => void {
    const id = `sub-${topic}-${Date.now()}`;

    if (this.connected) {
      this._subscribe(topic, callback, id);
    } else {
      this.pendingSubscriptions.push({ topic, callback, id });
    }

    return () => {
      const sub = this.subscriptions.get(id);
      if (sub) {
        sub.unsubscribe();
        this.subscriptions.delete(id);
      } else {
        this.pendingSubscriptions = this.pendingSubscriptions.filter(p => p.id !== id);
      }
    };
  }

  private _subscribe(topic: string, callback: MessageCallback, id: string) {
    if (!this.client) return;
    const sub = this.client.subscribe(topic, (frame: IMessage) => {
      try {
        const body = JSON.parse(frame.body);
        callback(body);
      } catch {
        callback(frame.body);
      }
    }, { id });
    this.subscriptions.set(id, sub);
  }

  /** Send a message to a STOMP destination. */
  send(destination: string, body: unknown): void {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected — message dropped:', destination);
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  /** Gracefully disconnect. */
  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
    this.connected = false;
    this.subscriptions.clear();
    this.pendingSubscriptions = [];
  }

  get isConnected(): boolean {
    return this.connected;
  }

  onConnect(cb: () => void) { this.onConnectCallbacks.push(cb); }
  onDisconnect(cb: () => void) { this.onDisconnectCallbacks.push(cb); }
}

/** Singleton WS manager — import this everywhere */
export const ws = new WebSocketManager();
