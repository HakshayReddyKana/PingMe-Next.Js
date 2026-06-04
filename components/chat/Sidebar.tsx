'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatUser, Conversation } from '@/types';
import { UserAvatar } from './UserAvatar';
import { ConversationList } from './ConversationList';

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;
const DEFAULT_WIDTH = 300;

interface SidebarProps {
  className?: string;
  me: ChatUser;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  onLogout: () => void;
}

export function Sidebar({
  className = '',
  me,
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  onLogout,
}: SidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_WIDTH);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;
    setIsDragging(true);
  }, [width]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidth.current + delta));
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  return (
    <aside
      className={`flex-col ${className}`}
      style={{
        width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : width,
        flexShrink: 0,
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: 'none',
        position: 'relative',
        transition: isDragging ? 'none' : 'width 0.05s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 14px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* App name */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            PingMe
          </span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2, paddingLeft: 1 }}>
            by Hakshay
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {conversations.reduce((a, c) => a + c.unreadCount, 0) > 0
              ? `${conversations.reduce((a, c) => a + c.unreadCount, 0)} unread`
              : 'All caught up ✓'}
          </span>
        </div>

        {/* New chat button */}
        <button
          onClick={onNewConversation}
          title="New conversation"
          style={{
            background: 'var(--accent-dim)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--accent)',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s ease, transform 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)';
            (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1={12} y1={5} x2={12} y2={19} />
            <line x1={5} y1={12} x2={19} y2={12} />
          </svg>
        </button>
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ConversationList
          conversations={conversations}
          me={me}
          activeId={activeId}
          onSelect={onSelect}
        />
      </div>

      {/* Footer — current user */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <UserAvatar user={me} size="sm" showStatus />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {me.displayName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--online)' }}>● Online</div>
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
            borderRadius: 6,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1={21} y1={12} x2={9} y2={12} />
          </svg>
        </button>
      </div>

      {/* ── Resize handle ── */}
      <div
        className="hidden md:flex"
        onMouseDown={onMouseDown}
        title="Drag to resize"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 5,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Visible track */}
        <div
          style={{
            width: 1,
            height: '100%',
            background: isDragging ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.15s ease',
            position: 'relative',
          }}
        >
          {/* Grip dots — visible on hover/drag */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              opacity: isDragging ? 1 : 0,
              transition: 'opacity 0.15s ease',
            }}
          >
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Wider invisible hover zone to make grabbing easy */}
      <div
        className="hidden md:block"
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          right: -4,
          width: 10,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 11,
        }}
        onMouseEnter={e => {
          const track = (e.currentTarget.previousSibling as HTMLElement)?.querySelector('div') as HTMLElement;
          if (track) track.style.background = 'var(--accent)';
        }}
        onMouseLeave={e => {
          if (isDragging) return;
          const track = (e.currentTarget.previousSibling as HTMLElement)?.querySelector('div') as HTMLElement;
          if (track) track.style.background = 'var(--border)';
        }}
      />
    </aside>
  );
}
