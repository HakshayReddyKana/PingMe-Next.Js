'use client';

import type { Conversation, ChatUser } from '@/types';
import { UserAvatar, GroupAvatar } from './UserAvatar';
import { getConversationName, getConversationOtherUser } from '@/lib/utils';

interface ChatHeaderProps {
  conversation: Conversation;
  me: ChatUser;
  isInfoOpen: boolean;
  onToggleInfo: () => void;
}

export function ChatHeader({ conversation, me, isInfoOpen, onToggleInfo }: ChatHeaderProps) {
  const name = getConversationName(conversation, me.id);
  const isGroup = conversation.type === 'group';

  const otherUser = getConversationOtherUser(conversation, me.id);

  const onlineCount = conversation.participants.filter(p => p.status === 'online').length;

  const subtitle = isGroup
    ? `${conversation.participants.length} members · ${onlineCount} online`
    : otherUser?.status === 'online'
      ? '● Online'
      : otherUser?.status === 'away'
        ? '◐ Away'
        : 'Last seen recently';

  const subtitleColor = !isGroup && otherUser?.status === 'online'
    ? 'var(--online)'
    : !isGroup && otherUser?.status === 'away'
      ? 'var(--away)'
      : 'var(--text-muted)';

  return (
    <div
      style={{
        height: 62,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}
    >
      {/* Avatar */}
      {isGroup ? (
        <GroupAvatar
          users={conversation.participants.filter(p => p.id !== me.id)}
          size="md"
        />
      ) : otherUser ? (
        <UserAvatar user={otherUser} size="md" showStatus />
      ) : null}

      {/* Name + status */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: subtitleColor,
            marginTop: 1,
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Search in conversation (placeholder) */}
        <HeaderIconButton title="Search messages (coming soon)" onClick={() => {}}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx={11} cy={11} r={8} />
            <line x1={21} y1={21} x2={16.65} y2={16.65} />
          </svg>
        </HeaderIconButton>

        {/* Info panel toggle */}
        <HeaderIconButton
          title={isInfoOpen ? 'Close info panel' : 'Open info panel'}
          onClick={onToggleInfo}
          active={isInfoOpen}
        >
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx={12} cy={12} r={10} />
            <line x1={12} y1={16} x2={12} y2={12} />
            <line x1={12} y1={8} x2={12.01} y2={8} />
          </svg>
        </HeaderIconButton>
      </div>
    </div>
  );
}

function HeaderIconButton({
  children,
  onClick,
  title,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: 'none',
        background: active ? 'var(--accent-dim)' : 'none',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)';
        (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = active ? 'var(--accent-dim)' : 'none';
        (e.currentTarget as HTMLElement).style.color = active ? 'var(--accent)' : 'var(--text-muted)';
      }}
    >
      {children}
    </button>
  );
}
