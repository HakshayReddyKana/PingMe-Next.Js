'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Conversation, Message, ChatUser } from '@/types';
import { API_ENDPOINTS, fetchApi } from '@/lib/api';
import { ws } from '@/lib/websocket';
import {
  getMe,
  getAllUsers,
  getConversations,
  getMessages,
  createConversation,
  markAsRead,
  getPresence,
  sendMessageRest,
  normaliseMessage,
} from '@/lib/chat-api';

import { Sidebar } from '@/components/chat/Sidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { EmptyState } from '@/components/chat/EmptyState';
import { InfoPanel } from '@/components/chat/InfoPanel';
import { NewConversationModal } from '@/components/chat/NewConversationModal';

export default function DashboardPage() {
  const router = useRouter();

  // ── Auth & Global State ───────────────────────────────────────
  const [me, setMe] = useState<ChatUser | null>(null);
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Conversations state ───────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // ── Messages state ────────────────────────────────────────────
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>({});

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const activeMessages = useMemo(
    () => (activeId ? messagesByConv[activeId] ?? [] : []),
    [activeId, messagesByConv]
  );

  // ── Sender lookup map ────────────────────────────────────────
  const senderMap: Record<string, ChatUser> = useMemo(() => {
    const map: Record<string, ChatUser> = {};
    allUsers.forEach(u => { map[u.id] = u; });
    if (me) map[me.id] = me;
    return map;
  }, [allUsers, me]);

  // ── Load Initial Data ────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const { data: status, error } = await fetchApi<{ isAuthenticated: boolean }>(API_ENDPOINTS.STATUS);
        if (error || !status?.isAuthenticated) {
          router.push('/');
          return;
        }

        const [meData, usersData, convsData] = await Promise.all([
          getMe(),
          getAllUsers(),
          getConversations(),
        ]);

        if (!mounted) return;

        setMe(meData);
        setAllUsers(usersData);
        setConversations(convsData);

        // Connect to WebSocket server (non-blocking)
        ws.connect().catch(err => console.warn('WebSocket not ready yet:', err));
        
        setIsInitializing(false);
        setIsInitializing(false);
      } catch (err: any) {
        console.error('Initialization failed:', err);
        
        // If the error indicates the user isn't found (e.g. they need to onboard)
        if (err.message?.includes('404') || err.message?.includes('Failed to load user') || err.message?.includes('Failed to load conversations')) {
           router.push('/onboarding');
           return;
        }

        document.cookie = 'auth_token=; Max-Age=0; path=/';
        setError('Session expired, please login again.');
        setIsInitializing(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
      ws.disconnect();
    };
  }, [router]);

  // ── Presence Polling ─────────────────────────────────────────
  useEffect(() => {
    if (!me || allUsers.length === 0) return;

    const pollPresence = async () => {
      try {
        const ids = allUsers.map(u => u.id);
        const presenceMap = await getPresence(ids);
        
        setAllUsers(prev => prev.map(u => {
          const newStatus = presenceMap[u.id];
          if (newStatus && newStatus !== u.status) {
            return { ...u, status: newStatus as any };
          }
          return u;
        }));
      } catch (err) {
        console.error('Failed to poll presence:', err);
      }
    };

    // Poll every 10 seconds
    pollPresence();
    const interval = setInterval(pollPresence, 10000);
    return () => clearInterval(interval);
  }, [me, allUsers.length]); // Re-bind if allUsers array length changes

  // ── Global WebSocket Subscriptions ───────────────────────────
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!me || conversations.length === 0) return;

    let mounted = true;
    const unsubs: (() => void)[] = [];

    // We subscribe to EVERY conversation so the sidebar is fully realtime!
    conversations.forEach(conv => {
      const unsub = ws.subscribe(`/topic/conversation/${conv.id}`, (body: any) => {
        if (!mounted) return;
        const newMsg = normaliseMessage(body);

        // If we are actively looking at this chat and receive a message from someone else, auto-read!
        if (activeIdRef.current === conv.id && newMsg.senderId !== me.id) {
          markAsRead(conv.id).catch(console.error);
        }

        // Always append to messages state (even if not active, it caches it)
        setMessagesByConv(prev => {
          const existing = prev[conv.id] ?? [];
          if (existing.some(m => m.id === newMsg.id)) return prev; // Deduplicate
          return { ...prev, [conv.id]: [...existing, newMsg] };
        });

        // Always update conversation's last message and bring to top of sidebar
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id === conv.id) {
              const shouldIncrement = activeIdRef.current !== conv.id && newMsg.senderId !== me.id;
              return { 
                ...c, 
                lastMessage: newMsg,
                unreadCount: shouldIncrement ? (c.unreadCount || 0) + 1 : c.unreadCount
              };
            }
            return c;
          });
          return updated.sort((a, b) => {
            const aTime = a.lastMessage?.timestamp.getTime() ?? a.createdAt.getTime();
            const bTime = b.lastMessage?.timestamp.getTime() ?? b.createdAt.getTime();
            return bTime - aTime;
          });
        });
      });
      unsubs.push(unsub);
      
      // Also subscribe to read receipts globally
      const unsubReceipts = ws.subscribe(`/topic/conversation/${conv.id}/receipts`, (body: any) => {
        if (!mounted) return;
        setMessagesByConv(prev => {
          const msgs = prev[conv.id] ?? [];
          const updated = msgs.map(m => 
            m.senderId === me.id && m.status !== 'read' ? { ...m, status: 'read' as const } : m
          );
          return { ...prev, [conv.id]: updated };
        });
      });
      unsubs.push(unsubReceipts);
    });

    return () => {
      mounted = false;
      unsubs.forEach(fn => fn());
    };
  }, [me, conversations.map(c => c.id).join(',')]); // Re-subscribe only if conversation list changes

  // Sync presence to conversations so sidebar updates
  useEffect(() => {
    setConversations(prev => prev.map(conv => {
      let changed = false;
      const newParticipants = conv.participants.map(p => {
        const globalUser = allUsers.find(u => u.id === p.id);
        if (globalUser && globalUser.status !== p.status) {
          changed = true;
          return { ...p, status: globalUser.status };
        }
        return p;
      });
      return changed ? { ...conv, participants: newParticipants } : conv;
    }));
  }, [allUsers]);

  // ── Active Conversation History Load ─────────────────────────
  useEffect(() => {
    if (!activeId || !me) return;

    let mounted = true;

    // Load message history via REST
    getMessages(activeId).then(history => {
      if (!mounted) return;
      setMessagesByConv(prev => ({ ...prev, [activeId]: history }));
    }).catch(err => console.error('Failed to load messages:', err));

    // Clear unread count
    markAsRead(activeId).catch(console.error);
    setConversations(prev =>
      prev.map(c => c.id === activeId ? { ...c, unreadCount: 0 } : c)
    );

    return () => {
      mounted = false;
    };
  }, [activeId, me]);

  // ── Typing Indicator ─────────────────────────────────────────
  const [typingNames, setTypingNames] = useState<string[]>([]);
  
  useEffect(() => {
    if (!activeId) {
      setTypingNames([]);
      return;
    }

    let timeouts = new Map<string, ReturnType<typeof setTimeout>>();

    const unsubTyping = ws.subscribe(`/topic/conversation/${activeId}/typing`, (body: any) => {
      // Body example: { userId: string, isTyping: boolean }
      const { userId, isTyping } = body;
      if (userId === me?.id) return;
      
      const user = senderMap[userId];
      if (!user) return;

      if (isTyping) {
        setTypingNames(prev => prev.includes(user.displayName) ? prev : [...prev, user.displayName]);
        
        // Auto-clear after 3s if no new typing events arrive
        if (timeouts.has(userId)) clearTimeout(timeouts.get(userId)!);
        timeouts.set(userId, setTimeout(() => {
          setTypingNames(prev => prev.filter(n => n !== user.displayName));
          timeouts.delete(userId);
        }, 3000));
      } else {
        setTypingNames(prev => prev.filter(n => n !== user.displayName));
        if (timeouts.has(userId)) {
          clearTimeout(timeouts.get(userId)!);
          timeouts.delete(userId);
        }
      }
    });

    return () => {
      unsubTyping();
      timeouts.forEach(clearTimeout);
    };
  }, [activeId, senderMap, me]);

  const handleTyping = useCallback(() => {
    if (!activeId) return;
    ws.send(`/app/chat/${activeId}/typing`, { userId: me?.id, isTyping: true });
  }, [activeId, me]);

  // ── Send message ──────────────────────────────────────────────
  const handleSend = useCallback(async (content: string) => {
    if (!activeId || !me) return;

    try {
      // Send via REST API
      const msg = await sendMessageRest(activeId, content, 'text');
      
      // Instantly append to our own screen (don't wait for WebSocket echo)
      setMessagesByConv(prev => {
        const existing = prev[activeId] ?? [];
        if (existing.some(m => m.id === msg.id)) return prev;
        return { ...prev, [activeId]: [...existing, msg] };
      });
      
      // Bring conversation to top locally
      setConversations(prev => {
        const updated = prev.map(c => c.id === activeId ? { ...c, lastMessage: msg } : c);
        return updated.sort((a, b) => {
          const aTime = a.lastMessage?.timestamp.getTime() ?? a.createdAt.getTime();
          const bTime = b.lastMessage?.timestamp.getTime() ?? b.createdAt.getTime();
          return bTime - aTime;
        });
      });
      
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    
    // Stop typing indicator (this stays on WS)
    ws.send(`/app/chat/${activeId}/typing`, { userId: me.id, isTyping: false });
  }, [activeId, me]);

  // ── UI States ────────────────────────────────────────────────
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateConversation = useCallback(async (userIds: string[], groupName?: string) => {
    try {
      const type = userIds.length > 1 ? 'group' : 'direct';
      const newConv = await createConversation(userIds, type, groupName);
      
      setConversations(prev => {
        if (prev.some(c => c.id === newConv.id)) return prev;
        return [newConv, ...prev];
      });
      setActiveId(newConv.id);
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    ws.disconnect();
    await fetchApi(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    router.push('/');
  }, [router]);

  // ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: '#ef4444', fontSize: 16, marginBottom: 16 }}>{error}</div>
        <button 
          onClick={async () => { 
            // Call our new Next.js endpoint to destroy HttpOnly cookies
            await fetch('/api/auth/clear', { method: 'POST' }).catch(() => {});
            window.location.href = '/'; 
          }}
          style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', borderRadius: 4, cursor: 'pointer' }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (isInitializing || !me) {
    return (
      <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Connecting to chat server...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg-base)]">
      {/* Sidebar */}
      <Sidebar
        className={`${activeId ? 'hidden md:flex' : 'flex w-full'} md:w-auto flex-shrink-0`}
        me={me}
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNewConversation={() => setIsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main area */}
      <main className={`${!activeId ? 'hidden md:flex' : 'flex w-full'} flex-col min-w-0 overflow-hidden flex-1`}>
        {activeConversation ? (
          <>
            <ChatHeader
              conversation={activeConversation}
              me={me}
              isInfoOpen={isInfoOpen}
              onToggleInfo={() => setIsInfoOpen(v => !v)}
              onBack={() => setActiveId(null)}
            />
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'var(--bg-base)',
              }}
            >
              <MessageList
                messages={activeMessages}
                senderMap={senderMap}
                me={me}
                typingNames={typingNames}
              />
              <MessageInput
                onSend={handleSend}
                onTyping={handleTyping}
              />
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Info panel */}
      {isInfoOpen && activeConversation && (
        <InfoPanel
          className="fixed inset-0 z-50 md:relative md:inset-auto md:z-auto"
          conversation={activeConversation}
          me={me}
          onClose={() => setIsInfoOpen(false)}
        />
      )}

      {/* New conversation modal */}
      {isModalOpen && (
        <NewConversationModal
          allUsers={allUsers}
          me={me}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateConversation}
        />
      )}
    </div>
  );
}
