export interface User {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  username?: string;
}

// ─── Chat Domain Types ────────────────────────────────────────────

export type UserStatus = 'online' | 'away' | 'offline';

export interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string; // tailwind bg color for initials avatar
  status: UserStatus;
  lastSeen?: Date;
  bio?: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  editedAt?: Date;
  replyToId?: string;
}

export type ConversationType = 'direct' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string; // only for group
  participants: ChatUser[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  createdAt: Date;
  status?: 'pending' | 'accepted' | 'rejected';
  initiatorId?: string;
}

export interface TypingState {
  conversationId: string;
  userIds: string[];
}
