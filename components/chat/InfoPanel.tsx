'use client';

import type { Conversation, ChatUser } from '@/types';
import { UserAvatar } from './UserAvatar';
import { getConversationName } from '@/lib/utils';

interface InfoPanelProps {
  className?: string;
  conversation: Conversation;
  me: ChatUser;
  onClose: () => void;
}

const statusLabel: Record<ChatUser['status'], string> = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
};
const statusColor: Record<ChatUser['status'], string> = {
  online: 'var(--online)',
  away: 'var(--away)',
  offline: 'var(--offline)',
};

export function InfoPanel({ className = '', conversation, me, onClose }: InfoPanelProps) {
  const name = getConversationName(conversation, me.id);
  const isGroup = conversation.type === 'group';
  const members = conversation.participants;

  return (
    <aside
      className={`animate-slide-in-right ${className}`}
      style={{
        width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'var(--info-w)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {isGroup ? 'Group Info' : 'Contact Info'}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 8,
            padding: 4,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
          </svg>
        </button>
      </div>

      {/* Avatar + name section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '28px 20px 20px',
          gap: 12,
          borderBottom: '1px solid var(--border)',
        }}
      >
        {isGroup ? (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent)88, var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            👥
          </div>
        ) : (
          (() => {
            const other = members.find(p => p.id !== me.id);
            return other ? <UserAvatar user={other} size="xl" showStatus /> : null;
          })()
        )}

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
          {!isGroup && (() => {
            const other = members.find(p => p.id !== me.id);
            return other ? (
              <>
                <div style={{ fontSize: 13, color: statusColor[other.status], marginTop: 4 }}>
                  {statusLabel[other.status]}
                </div>
                {other.bio && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                    {other.bio}
                  </div>
                )}
              </>
            ) : null;
          })()}
          {isGroup && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {members.length} members
            </div>
          )}
        </div>
      </div>

      {/* Members section */}
      <div style={{ padding: '16px 16px 8px', flexShrink: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 10,
          }}
        >
          {isGroup ? `Members (${members.length})` : 'Participant'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {members.map(member => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 8px',
                borderRadius: 10,
                background: member.id === me.id ? 'var(--accent-dim)' : 'transparent',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => {
                if (member.id !== me.id) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={e => {
                if (member.id !== me.id) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <UserAvatar user={member} size="sm" showStatus />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {member.displayName}
                  {member.id === me.id && (
                    <span style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 6, fontWeight: 700 }}>
                      YOU
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: statusColor[member.status] }}>
                  {statusLabel[member.status]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ActionButton icon="🔇" label={conversation.isMuted ? 'Unmute' : 'Mute notifications'} />
        {isGroup && <ActionButton icon="🚪" label="Leave group" danger />}
        {!isGroup && <ActionButton icon="🚫" label="Block user" danger />}
      </div>
    </aside>
  );
}

function ActionButton({ icon, label, danger }: { icon: string; label: string; danger?: boolean }) {
  return (
    <button
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        background: 'var(--bg-elevated)',
        border: `1px solid ${danger ? 'rgba(248,113,113,0.2)' : 'var(--border)'}`,
        borderRadius: 10,
        cursor: 'pointer',
        color: danger ? 'var(--danger)' : 'var(--text-secondary)',
        fontSize: 13,
        fontWeight: 500,
        transition: 'background 0.15s ease',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = danger ? 'rgba(248,113,113,0.1)' : 'var(--bg-hover)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </button>
  );
}
