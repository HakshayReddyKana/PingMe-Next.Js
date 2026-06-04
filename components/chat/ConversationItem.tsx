'use client';

import type { Conversation, ChatUser } from '@/types';
import { UserAvatar, GroupAvatar } from './UserAvatar';
import {
  getConversationName,
  getConversationOtherUser,
  formatTimestamp,
} from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  me: ChatUser;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, me, isActive, onClick }: ConversationItemProps) {
  const name = getConversationName(conversation, me.id);
  const avatarUser = getConversationOtherUser(conversation, me.id);
  const hasUnread = conversation.unreadCount > 0;
  const lastMsg = conversation.lastMessage;
  const isFromMe = lastMsg?.senderId === me.id;

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s ease',
        background: isActive
          ? 'var(--accent-dim)'
          : 'transparent',
        outline: 'none',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* Avatar */}
      <div style={{ flexShrink: 0 }}>
        {conversation.type === 'direct' && avatarUser ? (
          <UserAvatar user={avatarUser} size="md" showStatus />
        ) : (
          <GroupAvatar
            users={conversation.participants.filter(p => p.id !== me.id)}
            size="md"
          />
        )}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: hasUnread ? 700 : 500,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {conversation.isPinned && (
              <span style={{ marginRight: 4, fontSize: 11, opacity: 0.6 }}>📌</span>
            )}
            {name}
          </span>
          {lastMsg && (
            <span
              style={{
                fontSize: 11,
                color: hasUnread ? 'var(--accent)' : 'var(--text-muted)',
                flexShrink: 0,
                fontWeight: hasUnread ? 600 : 400,
              }}
            >
              {formatTimestamp(lastMsg.timestamp)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              color: hasUnread ? 'var(--text-secondary)' : 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              fontWeight: hasUnread ? 500 : 400,
            }}
          >
            {lastMsg
              ? `${isFromMe ? 'You: ' : ''}${lastMsg.content}`
              : 'No messages yet'}
          </span>

          {hasUnread && (
            <span
              style={{
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5px',
                flexShrink: 0,
              }}
            >
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
