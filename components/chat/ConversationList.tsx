'use client';

import { useState, useMemo } from 'react';
import type { Conversation, ChatUser } from '@/types';
import { ConversationItem } from './ConversationItem';
import { SearchBar } from './SearchBar';
import { getConversationName } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  me: ChatUser;
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, me, activeId, onSelect }: ConversationListProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(c => {
      const name = getConversationName(c, me.id).toLowerCase();
      const lastMsg = c.lastMessage?.content.toLowerCase() ?? '';
      return name.includes(q) || lastMsg.includes(q);
    });
  }, [conversations, me, query]);

  const pinned = filtered.filter(c => c.isPinned);
  const unpinned = filtered.filter(c => !c.isPinned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search */}
      <div style={{ padding: '12px 12px 8px' }}>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px' }}>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              padding: '32px 16px',
            }}
          >
            No conversations found
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <SectionLabel label="Pinned" />
                {pinned.map(c => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    me={me}
                    isActive={c.id === activeId}
                    onClick={() => onSelect(c.id)}
                  />
                ))}
              </>
            )}

            {unpinned.length > 0 && (
              <>
                {pinned.length > 0 && <SectionLabel label="All Messages" />}
                {unpinned.map(c => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    me={me}
                    isActive={c.id === activeId}
                    onClick={() => onSelect(c.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        padding: '10px 10px 4px',
      }}
    >
      {label}
    </div>
  );
}
