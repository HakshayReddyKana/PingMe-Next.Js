'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { API_ENDPOINTS, fetchApi } from '@/lib/api';

const AVATAR_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login / Common state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register specific state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[5]); // Default indigo

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for OAuth callback errors and clear any stuck cookies
  useEffect(() => {
    // Force clear the auth token so we don't get stuck in a redirect loop
    document.cookie = 'auth_token=; Max-Age=0; path=/';

    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'no_token': 'OAuth authentication failed: No token received',
        'callback_failed': 'OAuth callback failed. Please try again.',
        'invalid_state': 'Invalid OAuth state. Please try again.',
      };
      setError(errorMessages[errorParam] || 'OAuth authentication failed');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.REGISTER;
    
    // Include extra fields if registering
    const payload = mode === 'register' 
      ? { username, password, displayName: displayName || username, bio, avatarColor }
      : { username, password };

    const { data, error: apiError } = await fetchApi<{ token?: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    // If the backend returned a JWT in the JSON body, manually set it as a cookie
    // so that the Next.js proxy can attach it to future requests!
    if (data && data.token) {
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
    }

    if (mode === 'register') {
      setMode('login');
      setPassword('');
      setError('');
      alert('Registration successful! Please login.');
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 flex justify-center items-start overflow-y-auto">
      <div className="w-full max-w-md my-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to PingMe
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'login' ? 'Sign in to your account' : 'Set up your profile'}
          </p>
        </div>

        {/* Main Card */}
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <Input
                label="Display Name"
                type="text"
                placeholder="How should people call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
              />
            )}

            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />

            {mode === 'register' && (
              <>
                <Input
                  label="Bio (Optional)"
                  type="text"
                  placeholder="A short sentence about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                />

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {AVATAR_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAvatarColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                          avatarColor === color ? 'ring-2 ring-gray-900 dark:ring-white scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            <Input
              label="Password"
              type="password"
              placeholder={mode === 'register' ? "Choose a strong password" : "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              disabled={loading}
            >
              {mode === 'login' 
                ? "Don't have an account? Register" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>

        {/* OAuth Section (Only show on login screen) */}
        {mode === 'login' && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Or continue with</p>
            <div className="space-y-3">
              <a
                href="/oauth2/authorization/google"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </a>
              <a
                href="/oauth2/authorization/github"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
