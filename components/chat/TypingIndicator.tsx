'use client';

interface TypingIndicatorProps {
  names: string[]; // display names of users who are typing
}

export function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  const label =
    names.length === 1 ? `${names[0]} is typing` :
    names.length === 2 ? `${names[0]} and ${names[1]} are typing` :
    `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        color: 'var(--text-secondary)',
        fontSize: 13,
      }}
    >
      {/* Bouncing dots */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
              animation: `typing-bounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span style={{ fontStyle: 'italic' }}>{label}</span>
    </div>
  );
}
