'use client';

import type { ChatUser, UserStatus } from '@/types';

interface UserAvatarProps {
  user: ChatUser;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { avatar: 30, font: 11, dot: 8, dotBorder: 1.5 },
  md: { avatar: 38, font: 14, dot: 10, dotBorder: 2 },
  lg: { avatar: 46, font: 17, dot: 12, dotBorder: 2 },
  xl: { avatar: 64, font: 24, dot: 14, dotBorder: 2.5 },
};

const statusColor: Record<UserStatus, string> = {
  online: 'var(--online)',
  away:   'var(--away)',
  offline: 'var(--offline)',
};

export function UserAvatar({ user, size = 'md', showStatus = false, className = '' }: UserAvatarProps) {
  const { avatar, font, dot, dotBorder } = sizeMap[size];
  const safeDisplayName = user.displayName || user.username || '?';
  const safeColor = user.avatarColor || '#6c63ff';

  const initials = safeDisplayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`} style={{ width: avatar, height: avatar }}>
      <div
        style={{
          width: avatar,
          height: avatar,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${safeColor}cc, ${safeColor})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: font,
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '0.02em',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {initials}
      </div>

      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: dot,
            height: dot,
            borderRadius: '50%',
            background: statusColor[user.status],
            border: `${dotBorder}px solid var(--bg-base)`,
            boxShadow: user.status === 'online' ? `0 0 6px ${statusColor[user.status]}88` : 'none',
          }}
        />
      )}
    </div>
  );
}

// Group avatar for group conversations (stacked avatars)
interface GroupAvatarProps {
  users: ChatUser[];
  size?: 'sm' | 'md' | 'lg';
}

export function GroupAvatar({ users, size = 'md' }: GroupAvatarProps) {
  const { avatar } = sizeMap[size];
  const smallSize = Math.round(avatar * 0.65);
  const offset = Math.round(smallSize * 0.45);
  const total = avatar + offset * 0.5;
  const displayed = users.slice(0, 2);

  return (
    <div style={{ position: 'relative', width: total, height: avatar, flexShrink: 0 }}>
      {displayed.map((u, i) => {
        const safeName = u.displayName || u.username || '?';
        const safeColor = u.avatarColor || '#6c63ff';
        return (
          <div
            key={u.id}
            style={{
              position: 'absolute',
              bottom: i === 0 ? 0 : undefined,
              top: i === 1 ? 0 : undefined,
              left: i === 0 ? 0 : undefined,
              right: i === 1 ? 0 : undefined,
              width: smallSize,
              height: smallSize,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${safeColor}cc, ${safeColor})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.round(smallSize * 0.37),
              fontWeight: 700,
              color: '#fff',
              border: '2px solid var(--bg-surface)',
              userSelect: 'none',
              zIndex: i === 1 ? 1 : 0,
            }}
          >
            {safeName[0].toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}
