'use client';

import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search conversations...' }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Search icon */}
      <svg
        style={{
          position: 'absolute',
          left: 10,
          width: 15,
          height: 15,
          color: focused ? 'var(--accent)' : 'var(--text-muted)',
          transition: 'color 0.15s ease',
          pointerEvents: 'none',
          flexShrink: 0,
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={11} cy={11} r={8} />
        <line x1={21} y1={21} x2={16.65} y2={16.65} />
      </svg>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 32px 8px 32px',
          background: 'var(--bg-overlay)',
          border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border)'}`,
          borderRadius: 10,
          color: 'var(--text-primary)',
          fontSize: 13,
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: focused ? '0 0 0 3px var(--accent-dim)' : 'none',
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            borderRadius: 4,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1={18} y1={6} x2={6} y2={18} />
            <line x1={6} y1={6} x2={18} y2={18} />
          </svg>
        </button>
      )}
    </div>
  );
}
