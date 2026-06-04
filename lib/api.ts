export const API_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  STATUS: '/api/auth/status',
  GUEST: '/api/guest',
  HELLO: '/api/hello',
  ROOT: '/api/root',
} as const;

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Guard against HTML error pages (404, 500, etc.) being parsed as JSON
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      if (!response.ok) {
        return { error: `Request failed with status ${response.status}` };
      }
      // Non-JSON success (e.g. plain text) — return empty data
      return { data: undefined };
    }

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || result.message || 'Something went wrong' };
    }

    return { data: result };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error. Please try again.' };
  }
}
