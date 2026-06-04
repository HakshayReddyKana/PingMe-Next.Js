'use client';

export function EmptyState() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        gap: 20,
        textAlign: 'center',
      }}
    >
      {/* Illustration */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'var(--accent-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 42,
          marginBottom: 8,
          border: '1px solid var(--border)',
        }}
      >
        💬
      </div>

      <div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}
        >
          Your messages
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          Select a conversation from the sidebar to start chatting, or create a new one.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 8,
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        <Feature icon="🔒" text="End-to-end encrypted (coming soon)" />
        <Feature icon="⚡" text="Real-time via WebSocket + Kafka" />
        <Feature icon="👁️" text="Typing indicators & read receipts" />
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
