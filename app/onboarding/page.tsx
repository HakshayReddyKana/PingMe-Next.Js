'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { fetchApi } from '@/lib/api';

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

export default function OnboardingPage() {
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[5]); // Default indigo

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Generate a random secure password for the backend since OAuth users don't need one
    const dummyPassword = crypto.randomUUID();

    const { error: apiError } = await fetchApi('/api/users/oauth-register', {
      method: 'POST',
      body: JSON.stringify({ 
        password: dummyPassword,
        displayName: displayName || 'Anonymous',
        bio,
        avatarColor
      }),
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    // Successfully created the user in the DB, head to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 flex justify-center items-start overflow-y-auto">
      <div className="w-full max-w-md my-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome! Please provide a few details to finish setting up your account.
          </p>
        </div>

        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Display Name"
              type="text"
              placeholder="How should people call you?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
            />

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

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Saving...' : 'Finish Setup'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
