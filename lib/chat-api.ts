/**
 * Chat REST API — all calls go through our own Next.js API routes,
 * which proxy to Spring Boot server-side (so the HttpOnly JWT cookie
 * is forwarded securely and never exposed to client JS).
 */

import { fetchApi } from './api';
import type { ChatUser, Conversation, Message } from '@/types';

// ─── Users ────────────────────────────────────────────────────────

export async function getMe(): Promise<ChatUser> {
  const { data, error } = await fetchApi<ChatUser>('/api/users/me');
  if (error || !data) throw new Error(error ?? 'Failed to load user');
  return data;
}

export async function searchUsers(query: string): Promise<ChatUser[]> {
  const { data, error } = await fetchApi<ChatUser[]>(`/api/users/search?q=${encodeURIComponent(query)}`);
  if (error) throw new Error(error);
  return data || [];
}

export async function getPresence(userIds: string[]): Promise<Record<string, ChatUser['status']>> {
  const { data, error } = await fetchApi<Record<string, ChatUser['status']>>(
    `/api/users/presence?ids=${userIds.join(',')}`
  );
  if (error || !data) return {};
  return data;
}

// ─── Conversations ────────────────────────────────────────────────

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await fetchApi<Conversation[]>('/api/conversations');
  if (error || !data) throw new Error(error ?? 'Failed to load conversations');
  // Normalise timestamps from ISO strings to Date objects
  return data.map(normaliseConversation);
}

export async function createConversation(
  participantIds: string[],
  type: 'direct' | 'group',
  name?: string
): Promise<Conversation> {
  const { data, error } = await fetchApi<Conversation>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ participantIds, type, name }),
  });
  if (error || !data) throw new Error(error ?? 'Failed to create conversation');
  return normaliseConversation(data);
}

// ─── Messages ─────────────────────────────────────────────────────

export async function getMessages(conversationId: string, page = 0, size = 50): Promise<Message[]> {
  const { data, error } = await fetchApi<{ content: Message[]; totalPages: number }>(
    `/api/conversations/${conversationId}/messages?page=${page}&size=${size}`
  );
  if (error || !data) throw new Error(error ?? 'Failed to load messages');
  return data.content.map(normaliseMessage).reverse(); // API returns newest-first; reverse for display
}

export async function sendMessageRest(conversationId: string, content: string, type: 'text' | 'system' = 'text'): Promise<Message> {
  const { data, error } = await fetchApi<Message>(
    `/api/conversations/${conversationId}/messages`,
    { method: 'POST', body: JSON.stringify({ content, type }) }
  );
  if (error || !data) throw new Error(error ?? 'Failed to send message');
  return normaliseMessage(data);
}

export async function markAsRead(conversationId: string): Promise<void> {
  await fetchApi(`/api/conversations/${conversationId}/messages/read`, { method: 'POST' });
}

// ─── Normalisers (ISO strings → Date objects) ─────────────────────

export function normaliseMessage(m: any): Message {
  return {
    ...m,
    id: m.id,
    conversationId: m.conversationId || m.conversation?.id,
    senderId: m.senderId || m.sender?.id,
    timestamp: new Date(m.timestamp || m.createdAt),
    editedAt: m.editedAt ? new Date(m.editedAt) : undefined,
  };
}

function normaliseConversation(c: Conversation): Conversation {
  return {
    ...c,
    createdAt: new Date(c.createdAt as unknown as string),
    lastMessage: c.lastMessage ? normaliseMessage(c.lastMessage) : undefined,
  };
}
