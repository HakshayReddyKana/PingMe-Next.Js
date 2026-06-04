'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: 'Smileys',
    emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😇','😈','😉','😊','😋','😌','😍','🥰','😎','😏','😐','😑','😒','😓','😔','😕','🙃','🤑','🤔','🤗','🤭','🤫','🤥','😶','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤯','🤠','🥳','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😱','😨','😰','😥','😢','😭','😤','😠','😡','🤬','😈','👿'],
  },
  {
    label: 'Gestures',
    emojis: ['👍','👎','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👋','🤚','🖐️','✋','🖖','👏','🙌','🤲','🤝','🙏','💪','🦾','✍️'],
  },
  {
    label: 'People',
    emojis: ['👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🧕','👮','💂','🕵️','👩‍⚕️','👨‍⚕️','👩‍🎓','👨‍🎓','👩‍🏫','👨‍🏫','👩‍💻','👨‍💻','🧑‍💻'],
  },
  {
    label: 'Hearts',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','❤️‍🔥','❤️‍🩹','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟'],
  },
  {
    label: 'Objects',
    emojis: ['🔥','⭐','🌟','✨','💥','💫','🎉','🎊','🎈','🎁','🏆','🥇','🎯','💡','🔑','💎','📱','💻','⌨️','🖥️','🖨️','📷','📸','🎵','🎶','🔔','📢','📣'],
  },
  {
    label: 'Food',
    emojis: ['🍕','🍔','🌮','🍜','🍣','🍩','🍪','🎂','🍺','🍻','☕','🧋','🥤','🍷','🥂'],
  },
  {
    label: 'Animals',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐙','🦋','🐝','🦄','🐲'],
  },
  {
    label: 'Symbols',
    emojis: ['✅','❌','⚠️','🔴','🟡','🟢','🔵','⬆️','⬇️','⬅️','➡️','↩️','🔄','💯','🆗','🆙','🆒','🆕','🔞','⁉️','❓','❗','💬','👁️‍🗨️','🗨️','💭'],
  },
];

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, onTyping, disabled, placeholder = 'Type a message...' }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPanelRef = useRef<HTMLDivElement>(null);

  // Close emoji panel on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      if (!emojiPanelRef.current?.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  const insertEmoji = useCallback((emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const newVal = value.slice(0, start) + emoji + value.slice(end);
    setValue(newVal);
    // Restore cursor after emoji
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    });
  }, [value]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    setShowEmoji(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') setShowEmoji(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onTyping?.();
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0, position: 'relative' }}>

      {/* ── Emoji panel ── */}
      {showEmoji && (
        <div
          ref={emojiPanelRef}
          className="animate-fade-in"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 16,
            width: 320,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          {/* Category tabs */}
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              padding: '8px 8px 0',
              gap: 2,
              borderBottom: '1px solid var(--border)',
            }}
          >
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(i)}
                style={{
                  background: activeCategory === i ? 'var(--accent-dim)' : 'none',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  padding: '5px 10px',
                  fontSize: 12,
                  fontWeight: activeCategory === i ? 700 : 400,
                  color: activeCategory === i ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                  transition: 'background 0.1s ease, color 0.1s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 2,
              padding: 10,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {EMOJI_CATEGORIES[activeCategory].emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1,
                  transition: 'background 0.1s ease, transform 0.1s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '8px 8px 8px 14px',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
        onFocusCapture={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-focus)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px var(--accent-dim)';
        }}
        onBlurCapture={e => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        {/* Emoji toggle */}
        <IconButton
          title="Emoji"
          onClick={() => setShowEmoji(v => !v)}
          active={showEmoji}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <circle cx={12} cy={12} r={10} />
            <path d="M8 13s1.5 2 4 2 4-2 4-2" />
            <line x1={9} y1={9} x2={9.01} y2={9} strokeWidth={2.5} />
            <line x1={15} y1={9} x2={15.01} y2={9} strokeWidth={2.5} />
          </svg>
        </IconButton>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: 14,
            lineHeight: 1.5,
            resize: 'none',
            height: 'auto',
            minHeight: 24,
            maxHeight: 120,
            overflowY: 'auto',
            fontFamily: 'inherit',
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          title="Send (Enter)"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: 'none',
            background: canSend ? 'var(--accent)' : 'var(--bg-overlay)',
            color: canSend ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease',
            flexShrink: 0,
            boxShadow: canSend ? '0 2px 8px var(--accent-glow)' : 'none',
          }}
          onMouseEnter={e => { if (canSend) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      {/* Hint */}
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', paddingRight: 4 }}>
        <kbd style={{ fontFamily: 'inherit', opacity: 0.7 }}>Enter</kbd> to send · <kbd style={{ fontFamily: 'inherit', opacity: 0.7 }}>Shift+Enter</kbd> for new line
      </div>
    </div>
  );
}

function IconButton({ children, onClick, title, active = false }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'var(--accent-dim)' : 'none',
        border: 'none',
        cursor: 'pointer',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 8,
        flexShrink: 0,
        transition: 'color 0.15s ease, background 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
        (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = active ? 'var(--accent)' : 'var(--text-muted)';
        (e.currentTarget as HTMLElement).style.background = active ? 'var(--accent-dim)' : 'none';
      }}
    >
      {children}
    </button>
  );
}
