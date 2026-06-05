/**
 * Utility helpers — no mock data, pure functions.
 */

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateDivider(date: Date): string {
  const now = new Date();
  if (isSameDay(now, date)) return 'Today';
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(yesterday, date)) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function getConversationName(conv: { type: string; name?: string; participants: Array<{ id: string; displayName: string }> }, meId: string): string {
  if (conv.type === 'group') return conv.name ?? 'Group';
  const other = conv.participants.find(p => p.id !== meId);
  return other?.displayName ?? 'Unknown';
}

export function getConversationOtherUser<T extends { id: string }>(conv: { type: string; participants: T[] }, meId: string): T | null {
  if (conv.type === 'group') return null;
  return conv.participants.find(p => p.id !== meId) ?? null;
}
