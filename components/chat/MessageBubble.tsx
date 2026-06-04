'use client';

import type { Message, ChatUser } from '@/types';
import { UserAvatar } from './UserAvatar';
import { formatFullTimestamp } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  sender: ChatUser;
  me: ChatUser;
  showAvatar: boolean; // false when consecutive messages from same sender
  showTimestamp: boolean; // last in a sequence
}

function ReadReceipt({ status }: { status: Message['status'] }) {
  if (status === 'sending') {
    return (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} opacity={0.5}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (status === 'sent') {
    return (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} opacity={0.7}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (status === 'delivered') {
    return (
      <span style={{ fontSize: 11, opacity: 0.7 }}>✓✓</span>
    );
  }
  // read
  return (
    <span style={{ fontSize: 11, color: 'var(--accent)' }}>✓✓</span>
  );
}

export function MessageBubble({ message, sender, me, showAvatar, showTimestamp }: MessageBubbleProps) {
  const isMe = sender.id === me.id;
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 12,
          padding: '6px 24px',
          fontStyle: 'italic',
        }}
      >
        {message.content}
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        padding: showAvatar ? '2px 16px 2px' : '1px 16px 1px',
        marginTop: showAvatar ? 8 : 0,
      }}
    >
      {/* Avatar placeholder space */}
      <div style={{ width: 32, flexShrink: 0 }}>
        {!isMe && showAvatar && (
          <UserAvatar user={sender} size="sm" />
        )}
      </div>

      {/* Bubble + meta */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMe ? 'flex-end' : 'flex-start',
          maxWidth: 'min(520px, 65%)',
          gap: 3,
        }}
      >
        {/* Sender name for incoming group messages */}
        {!isMe && showAvatar && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: sender.avatarColor,
              paddingLeft: 4,
            }}
          >
            {sender.displayName}
          </span>
        )}

        {/* Bubble */}
        <div
          style={{
            padding: '9px 13px',
            borderRadius: isMe
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            background: isMe
              ? 'var(--accent)'
              : 'var(--bg-elevated)',
            color: isMe ? '#fff' : 'var(--text-primary)',
            fontSize: 14,
            lineHeight: 1.5,
            wordBreak: 'break-word',
            boxShadow: isMe
              ? '0 2px 8px var(--accent-glow)'
              : 'var(--shadow-sm)',
            position: 'relative',
          }}
        >
          {message.content}
        </div>

        {/* Timestamp + read receipt */}
        {showTimestamp && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: 'var(--text-muted)',
              paddingLeft: isMe ? 0 : 4,
              paddingRight: isMe ? 4 : 0,
            }}
          >
            <span>{formatFullTimestamp(message.timestamp)}</span>
            {isMe && <ReadReceipt status={message.status} />}
          </div>
        )}
      </div>
    </div>
  );
}
