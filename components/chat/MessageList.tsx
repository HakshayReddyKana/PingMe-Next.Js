'use client';

import { useEffect, useRef } from 'react';
import type { Message, ChatUser } from '@/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { formatDateDivider, isSameDay } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  senderMap: Record<string, ChatUser>; // userId → ChatUser
  me: ChatUser;
  typingNames: string[];
}

export function MessageList({ messages, senderMap, me, typingNames }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingNames.length]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: 14,
          fontStyle: 'italic',
        }}
      >
        No messages yet. Say hello! 👋
      </div>
    );
  }

  // Build render list with date dividers
  const items: Array<{ type: 'date'; label: string } | { type: 'message'; message: Message; showAvatar: boolean; showTimestamp: boolean }> = [];

  messages.forEach((msg, idx) => {
    const prev = messages[idx - 1];
    const next = messages[idx + 1];

    // Date divider
    if (!prev || !isSameDay(prev.timestamp, msg.timestamp)) {
      items.push({ type: 'date', label: formatDateDivider(msg.timestamp) });
    }

    // Group consecutive messages from same sender (within 3 minutes)
    const isSameSenderAsPrev =
      prev && msg.senderId && prev.senderId === msg.senderId &&
      msg.timestamp.getTime() - prev.timestamp.getTime() < 3 * 60_000;

    const isSameSenderAsNext =
      next && msg.senderId && next.senderId === msg.senderId &&
      next.timestamp.getTime() - msg.timestamp.getTime() < 3 * 60_000;

    items.push({
      type: 'message',
      message: msg,
      showAvatar: !isSameSenderAsPrev,
      showTimestamp: !isSameSenderAsNext,
    });
  });

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 12,
        paddingBottom: 4,
      }}
    >
      {items.map((item, idx) => {
        if (item.type === 'date') {
          return <DateDivider key={`date-${idx}`} label={item.label} />;
        }
        const { message, showAvatar, showTimestamp } = item;
        const sender = senderMap[message.senderId];
        if (!sender) return null;
        return (
          <MessageBubble
            key={message.id}
            message={message}
            sender={sender}
            me={me}
            showAvatar={showAvatar}
            showTimestamp={showTimestamp}
          />
        );
      })}

      {/* Typing indicator */}
      {typingNames.length > 0 && (
        <div style={{ paddingLeft: 56 }}>
          <TypingIndicator names={typingNames} />
        </div>
      )}

      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 24px 8px',
      }}
    >
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}
