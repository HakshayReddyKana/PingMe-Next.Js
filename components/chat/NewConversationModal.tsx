'use client';

import { useState, useMemo } from 'react';
import type { ChatUser } from '@/types';
import { UserAvatar } from './UserAvatar';

interface NewConversationModalProps {
  allUsers: ChatUser[];
  me: ChatUser;
  onClose: () => void;
  onCreate: (userIds: string[], groupName?: string) => void;
}

export function NewConversationModal({ allUsers, me, onClose, onCreate }: NewConversationModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const others = useMemo(() =>
    allUsers.filter(u => u.id !== me.id),
    [allUsers, me.id]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return others.filter(u => {
      const d = u.displayName || u.username || '';
      const n = u.username || '';
      return d.toLowerCase().includes(q) || n.toLowerCase().includes(q);
    });
  }, [others, query]);

  const isGroup = selected.length > 1;

  const toggleUser = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (selected.length === 0) return;
    onCreate(selected, isGroup ? groupName || 'New Group' : undefined);
    onClose();
  };

  return (
    <>
      {/* Backdrop + Container */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 100,
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* Modal */}
        <div
          className="animate-scale-in"
          onClick={e => e.stopPropagation()}
          style={{
            width: 420,
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              New Conversation
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {isGroup ? 'Creating a group chat' : 'Select a person to message'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', borderRadius: 8, padding: 4,
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </button>
        </div>

        {/* Group name input (only shown when >1 selected) */}
        {isGroup && (
          <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Group name (optional)"
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border-focus)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        )}

        {/* Selected chips */}
        {selected.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '12px 20px 0', flexShrink: 0, maxHeight: 110, overflowY: 'auto' }}>
            {selected.map(id => {
              const user = others.find(u => u.id === id)!;
              return (
                <button
                  key={id}
                  onClick={() => toggleUser(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px 4px 6px',
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--border-focus)',
                    borderRadius: 99,
                    cursor: 'pointer',
                    color: 'var(--accent)',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                  }}
                >
                  <UserAvatar user={user} size="sm" />
                  {user.displayName}
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
                  </svg>
                </button>
              );
            })}
          </div>
        )}

        {/* Search */}
        <div style={{ padding: '12px 20px', flexShrink: 0 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search people..."
            autoFocus
            style={{
              width: '100%',
              padding: '9px 12px',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--border-focus)'}
            onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border)'}
          />
        </div>

        {/* User list */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 12px 12px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '32px 0' }}>
              No users found
            </div>
          ) : (
            filtered.map(user => {
              const isSelected = selected.includes(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 10px',
                    borderRadius: 12,
                    border: 'none',
                    background: isSelected ? 'var(--accent-dim)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <UserAvatar user={user} size="md" showStatus />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.displayName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{user.username}</div>
                  </div>
                  {isSelected && (
                    <div
                      style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selected.length === 0}
            style={{
              padding: '9px 20px',
              background: selected.length > 0 ? 'var(--accent)' : 'var(--bg-overlay)',
              border: 'none',
              borderRadius: 10,
              color: selected.length > 0 ? '#fff' : 'var(--text-muted)',
              fontSize: 14,
              fontWeight: 700,
              cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              boxShadow: selected.length > 0 ? '0 2px 12px var(--accent-glow)' : 'none',
              transition: 'background 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            {isGroup ? '👥 Create Group' : '💬 Start Chat'}
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
