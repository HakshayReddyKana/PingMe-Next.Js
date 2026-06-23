'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { API_ENDPOINTS, fetchApi } from '@/lib/api';

const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

// ─── Floating Particle ────────────────────────────────────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="landing-particle" style={style} />;
}

// ─── Tech Badge ───────────────────────────────────────────────────────────────
function TechBadge({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div className="tech-badge">
      <span className="tech-badge-icon">{icon}</span>
      <div>
        <div className="tech-badge-label">{label}</div>
        <div className="tech-badge-sub">{sub}</div>
      </div>
    </div>
  );
}

// ─── Architecture Flow Node ───────────────────────────────────────────────────
function ArchNode({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div className="arch-node" style={{ borderColor: color, boxShadow: `0 0 20px ${color}40` }}>
      <span style={{ fontSize: '1.6rem' }}>{icon}</span>
      <span className="arch-node-label">{label}</span>
    </div>
  );
}

// ─── Auth Form ────────────────────────────────────────────────────────────────
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[5]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.cookie = 'auth_token=; Max-Age=0; path=/';
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const msgs: Record<string, string> = {
        'no_token': 'OAuth authentication failed: No token received',
        'callback_failed': 'OAuth callback failed. Please try again.',
        'invalid_state': 'Invalid OAuth state. Please try again.',
      };
      setError(msgs[errorParam] || 'OAuth authentication failed');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    const endpoint = mode === 'login' ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.REGISTER;
    const payload = mode === 'register'
      ? { username, password, displayName: displayName || username, bio, avatarColor }
      : { username, password };
    const { data, error: apiError } = await fetchApi<{ token?: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (apiError) { setError(apiError); return; }
    if (data?.token) {
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
    }
    if (mode === 'register') {
      setMode('login');
      setPassword('');
      setError('');
      setSuccessMessage('Registration successful! Please sign in to continue.');
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {mode === 'login' ? 'Welcome to PingMe! 👋' : 'Join PingMe 🚀'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {mode === 'login' ? 'Sign in to continue chatting' : 'Create your free account today'}
        </p>
      </div>

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
              {successMessage}
            </div>
          )}
          {mode === 'register' && (
            <Input label="Display Name" type="text" placeholder="How should people call you?"
              value={displayName} onChange={e => setDisplayName(e.target.value)} required disabled={loading} />
          )}
          <Input label="Username" type="text" placeholder="Enter your username"
              value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} />
          {mode === 'register' && (
            <>
              <Input label="Bio (Optional)" type="text" placeholder="A short sentence about yourself"
                value={bio} onChange={e => setBio(e.target.value)} disabled={loading} />
              <div className="pt-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Avatar Color</label>
                <div className="flex gap-3 flex-wrap">
                  {AVATAR_COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setAvatarColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ${avatarColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </>
          )}
          <Input label="Password" type="password"
            placeholder={mode === 'register' ? 'Choose a strong password' : 'Enter your password'}
            value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
              {error}
            </div>
          )}
          <div className="pt-2">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccessMessage(''); }}
            className="text-sm font-medium transition-colors" style={{ color: 'var(--accent)' }}
            disabled={loading}>
            {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
          </button>
        </div>
      </Card>

      {mode === 'login' && (
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Or continue with</p>
          <div className="space-y-3">
            <a href="/oauth2/authorization/google" className="oauth-btn">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
            <a href="/oauth2/authorization/github" className="oauth-btn">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable Architecture SVG Component (Aligned, Symmetric Coordinates) ───
function ArchitectureSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 920 460" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <marker id="arrow-neutral" markerWidth="6" markerHeight="4.5" refX="5" refY="2.25" orient="auto">
          <polygon points="0 0, 6 2.25, 0 4.5" fill="#ffffff" />
        </marker>
      </defs>

      {/* CI/CD Panel */}
      <rect x="30" y="215" width="110" height="75" rx="8" fill="#14141b" stroke="#ffffff" strokeWidth={2} />
      <g transform="translate(69, 227)">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 7.08 4.59 13.08 10.96 15.2.8.15 1.1-.35 1.1-.78 0-.38-.01-1.4-.02-2.75-4.45.97-5.39-2.15-5.39-2.15-.73-1.85-1.78-2.35-1.78-2.35-1.45-1 .11-.98.11-.98 1.61.12 2.46 1.66 2.46 1.66 1.43 2.44 3.75 1.74 4.66 1.33.15-1.04.56-1.74 1.02-2.14-3.55-.4-7.29-1.78-7.29-7.91 0-1.75.62-3.17 1.65-4.29-.17-.4-.71-2.03.16-4.23 0 0 1.34-.43 4.4 1.64a15.3 15.3 0 018 0c3.06-2.07 4.4-1.64 4.4-1.64.87 2.2.33 3.83.16 4.23 1.03 1.12 1.65 2.54 1.65 4.29 0 6.15-3.75 7.5-7.32 7.9.57.5 1.08 1.48 1.08 2.99 0 2.16-.02 3.9-.02 4.4 0 .43.29.94 1.1.78C27.42 29.07 32 23.07 32 16c0-8.84-7.16-16-16-16z" fill="#ffffff" />
      </g>
      <text x="85" y="269" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="bold">GitHub Actions</text>
      <text x="85" y="281" textAnchor="middle" fill="#e2e8f0" fontSize="8.5">CI/CD Pipeline</text>

      {/* AWS ECR Panel */}
      <rect x="210" y="215" width="110" height="75" rx="8" fill="#14141b" stroke="#ffffff" strokeWidth={2} />
      <image href="https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v14.0/dist/Containers/ElasticContainerRegistry.png" x="249" y="227" width="32" height="32" />
      <text x="265" y="269" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="bold">AWS ECR</text>
      <text x="265" y="281" textAnchor="middle" fill="#e2e8f0" fontSize="8.5">Docker Registry</text>

      {/* Internet Users Panel */}
      <rect x="495" y="20" width="110" height="50" rx="8" fill="#14141b" stroke="#ffffff" strokeWidth={2} />
      <g transform="translate(538, 25) scale(0.75)">
        <circle cx="16" cy="16" r="13" fill="none" stroke="#ffffff" strokeWidth={1.8} />
        <ellipse cx="16" cy="16" rx="5" ry="13" fill="none" stroke="#ffffff" strokeWidth={1.2} />
        <line x1="3" y1="16" x2="29" y2="16" stroke="#ffffff" strokeWidth={1.2} />
        <line x1="16" y1="3" x2="16" y2="29" stroke="#ffffff" strokeWidth={1.2} />
      </g>
      <text x="550" y="61" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">Internet Users</text>

      {/* AWS ALB Panel */}
      <rect x="495" y="95" width="110" height="75" rx="8" fill="#14141b" stroke="#ffffff" strokeWidth={2} />
      <image href="https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v14.0/dist/NetworkingContentDelivery/ElasticLoadBalancingApplicationLoadBalancer.png" x="534" y="107" width="32" height="32" />
      <text x="550" y="149" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="bold">AWS ALB</text>
      <text x="550" y="161" textAnchor="middle" fill="#e2e8f0" fontSize="8.5">SSL &amp; Balancing</text>

      {/* Auto Scaling Group (ASG) Box */}
      <rect x="390" y="195" width="320" height="130" rx="10" fill="none" stroke="#ffffff" strokeWidth={2.5} strokeDasharray="8,5" />
      <text x="550" y="209" textAnchor="middle" fill="#ffffff" fontSize="8.5" letterSpacing="0.05em" fontWeight="bold">AUTO SCALING GROUP (ASG)</text>

      {/* EC2 Instance 1 */}
      <rect x="410" y="220" width="110" height="80" rx="8" fill="#0d0d15" stroke="#ffffff" strokeWidth={2} />
      <image href="https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v14.0/dist/Compute/EC2.png" x="449" y="230" width="32" height="32" />
      <image href="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" x="469" y="246" width="16" height="16" />
      <text x="465" y="274" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">EC2 Instance 1</text>
      <text x="465" y="286" textAnchor="middle" fill="#e2e8f0" fontSize="8.5">Spring Boot · Docker</text>

      {/* EC2 Instance 2 */}
      <rect x="580" y="220" width="110" height="80" rx="8" fill="#0d0d15" stroke="#ffffff" strokeWidth={2} />
      <image href="https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v14.0/dist/Compute/EC2.png" x="619" y="230" width="32" height="32" />
      <image href="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" x="639" y="246" width="16" height="16" />
      <text x="635" y="274" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">EC2 Instance 2</text>
      <text x="635" y="286" textAnchor="middle" fill="#e2e8f0" fontSize="8.5">Spring Boot · Docker</text>

      {/* Redis Pub/Sub indicator (No arrows touching instances) */}
      <g transform="translate(530, 235)">
        <image href="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" x="12" y="5" width="16" height="16" />
        <text x="20" y="32" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold">Redis Sync</text>
      </g>

      {/* Secrets Manager Panel */}
      <rect x="780" y="215" width="110" height="75" rx="8" fill="#14141b" stroke="#ffffff" strokeWidth={2} />
      <image href="https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v14.0/dist/SecurityIdentityCompliance/SecretsManager.png" x="819" y="227" width="32" height="32" />
      <text x="835" y="269" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="bold">Secrets Manager</text>
      <text x="835" y="281" textAnchor="middle" fill="#e2e8f0" fontSize="8.5">Credentials API</text>

      {/* AWS RDS PostgreSQL Panel */}
      <rect x="410" y="365" width="110" height="75" rx="8" fill="#14141b" stroke="#ffffff" strokeWidth={2} />
      <image href="https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v14.0/dist/Database/RDS.png" x="449" y="377" width="32" height="32" />
      <image href="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" x="469" y="393" width="16" height="16" />
      <text x="465" y="419" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="bold">AWS RDS</text>
      <text x="465" y="431" textAnchor="middle" fill="#e2e8f0" fontSize="8.5">PostgreSQL Database</text>

      {/* AWS ElastiCache Panel */}
      <rect x="580" y="365" width="110" height="75" rx="8" fill="#14141b" stroke="#ffffff" strokeWidth={2} />
      <image href="https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v14.0/dist/Database/ElastiCache.png" x="619" y="377" width="32" height="32" />
      <image href="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" x="639" y="393" width="16" height="16" />
      <text x="635" y="419" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="bold">ElastiCache Redis</text>
      <text x="635" y="431" textAnchor="middle" fill="#e2e8f0" fontSize="8.5">Message Broker</text>

      {/* Connections (Wiring) */}
      {/* GitHub Actions -> AWS ECR */}
      <line x1="140" y1="252.5" x2="205" y2="252.5" stroke="#ffffff" strokeWidth={2} markerEnd="url(#arrow-neutral)" />
      <text x="172.5" y="243" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">docker push</text>

      {/* AWS ECR -> ASG boundary */}
      <line x1="320" y1="252.5" x2="385" y2="252.5" stroke="#ffffff" strokeWidth={2} markerEnd="url(#arrow-neutral)" />
      <text x="352.5" y="243" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">pull on boot</text>

      {/* Internet Users -> ALB */}
      <line x1="550" y1="70" x2="550" y2="90" stroke="#ffffff" strokeWidth={2} markerEnd="url(#arrow-neutral)" />
      <text x="558" y="80" fill="#ffffff" fontSize="8" fontWeight="bold" dominantBaseline="middle">HTTPS / WSS</text>

      {/* ALB -> ASG boundary */}
      <line x1="550" y1="170" x2="550" y2="190" stroke="#ffffff" strokeWidth={2} markerEnd="url(#arrow-neutral)" />

      {/* Secrets Manager -> ASG boundary */}
      <line x1="780" y1="252.5" x2="715" y2="252.5" stroke="#ffffff" strokeWidth={2} strokeDasharray="6,4" markerEnd="url(#arrow-neutral)" />
      <text x="747.5" y="243" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">secrets</text>

      {/* ASG boundary -> RDS */}
      <line x1="465" y1="327" x2="465" y2="360" stroke="#ffffff" strokeWidth={2} markerEnd="url(#arrow-neutral)" />

      {/* ASG boundary -> ElastiCache */}
      <line x1="635" y1="327" x2="635" y2="360" stroke="#ffffff" strokeWidth={2} markerEnd="url(#arrow-neutral)" />
    </svg>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomeContent() {
  const authRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isArchZoomed, setIsArchZoomed] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsArchZoomed(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const scrollToAuth = () => {
    authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Generate fixed particles on mount only
  const particles = Array.from({ length: 18 }, (_, i) => ({
    width: `${4 + (i * 7) % 8}px`,
    height: `${4 + (i * 7) % 8}px`,
    left: `${(i * 17 + 5) % 95}%`,
    top: `${(i * 23 + 10) % 90}%`,
    animationDelay: `${(i * 0.4) % 5}s`,
    animationDuration: `${6 + (i * 1.3) % 6}s`,
    opacity: 0.15 + (i * 0.03) % 0.2,
  }));

  return (
    <div className="landing-root">
      {/* ── Navbar ── */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav-scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">💬</span>
            <span>PingMe</span>
          </div>
          <div className="landing-nav-right">
            <div className="landing-nav-links">
              <a href="#architecture">Architecture</a>
              <a href="#features">Features</a>
            </div>
            <button onClick={scrollToAuth} className="landing-nav-cta">Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        {/* Particles */}
        <div className="landing-particles" aria-hidden>
          {particles.map((p, i) => (
            <Particle key={i} style={p} />
          ))}
        </div>

        {/* Glow blobs */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />

        <div className="landing-hero-content">
          <h2 className="hero-greeting-large">Welcome to PingMe! 👋</h2>

          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Enterprise-Grade Distributed Architecture
          </div>

          <h1 className="hero-heading">
            Chat Without
            <br />
            <span className="hero-heading-accent">Interruption</span>
          </h1>

          <p className="hero-sub">
            PingMe is a real-time distributed chat platform built with enterprise cloud infrastructure.
            Horizontally scalable, zero-downtime deployments, and end-to-end encrypted.
          </p>

          <div className="hero-actions">
            <button onClick={scrollToAuth} className="hero-cta-primary">
              Start Chatting
              <span>→</span>
            </button>
            <a href="#architecture" className="hero-cta-secondary">
              View Architecture
            </a>
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {[
              { val: '< 50ms', label: 'Message latency' },
              { val: '∞', label: 'Horizontal scale' },
              { val: '100%', label: 'Zero downtime' },
              { val: 'WSS', label: 'Encrypted transport' },
            ].map(s => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-val">{s.val}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock chat UI */}
        <div className="hero-mockup" aria-hidden>
          <div className="mockup-window">
            <div className="mockup-titlebar">
              <div className="mockup-dot" style={{ background: '#f87171' }} />
              <div className="mockup-dot" style={{ background: '#fbbf24' }} />
              <div className="mockup-dot" style={{ background: '#34d399' }} />
              <span className="mockup-title">PingMe</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                {['🧑 Alex', '💁 Sofia', '🧔 Jordan', '👩 Maya'].map((u, i) => (
                  <div key={u} className={`mockup-user ${i === 0 ? 'mockup-user-active' : ''}`}>
                    <span>{u}</span>
                    {i === 0 && <span className="mockup-online-dot" />}
                  </div>
                ))}
              </div>
              <div className="mockup-chat">
                <div className="mockup-msg mockup-msg-left">
                  <div className="mockup-bubble mockup-bubble-left">Hey! Got your message 👋</div>
                  <div className="mockup-time">10:41 AM · Server 1</div>
                </div>
                <div className="mockup-msg mockup-msg-right">
                  <div className="mockup-bubble mockup-bubble-right">Redis delivered it instantly ⚡</div>
                  <div className="mockup-time" style={{ textAlign: 'right' }}>10:41 AM · Server 2</div>
                </div>
                <div className="mockup-msg mockup-msg-left">
                  <div className="mockup-bubble mockup-bubble-left">Cross-server pub/sub is wild 🔥</div>
                  <div className="mockup-time">10:42 AM</div>
                </div>
                <div className="mockup-typing">
                  <span className="mockup-typing-dot" />
                  <span className="mockup-typing-dot" />
                  <span className="mockup-typing-dot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section id="architecture" className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <div className="section-header">
            <div className="section-label">Architecture</div>
            <h2 className="section-title">Under the Hood</h2>
            <p className="section-sub">
              A fully distributed AWS architecture with automated deployments, horizontal scaling, and cross-server WebSocket synchronization.
            </p>
          </div>

          {/* Compact click-to-enlarge diagram container */}
          <div className="arch-diagram-wrap" onClick={() => setIsArchZoomed(true)}>
            <div className="arch-expand-badge">
              <span>🔍</span> Click to Expand
            </div>
            <ArchitectureSvg style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          {/* Tech stack grid */}
          <div className="tech-grid">
            <TechBadge icon="☕" label="Java 21 + Spring Boot" sub="Core application runtime" />
            <TechBadge icon="🔌" label="STOMP / WebSockets" sub="Real-time bidirectional comms" />
            <TechBadge icon="⚡" label="Redis Pub/Sub" sub="Cross-server message sync" />
            <TechBadge icon="🐳" label="Docker + ECR" sub="Containerized deployments" />
            <TechBadge icon="⚖️" label="AWS ALB + ASG" sub="Load balancing & auto scaling" />
            <TechBadge icon="🔒" label="JWT + ACM SSL" sub="Auth & end-to-end encryption" />
            <TechBadge icon="🗄️" label="PostgreSQL (RDS)" sub="Managed relational database" />
            <TechBadge icon="🚀" label="GitHub Actions" sub="Zero-downtime CI/CD pipeline" />
            <TechBadge icon="🔑" label="AWS Secrets Manager" sub="Credential rotation & security" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-section">
        <div className="landing-section-inner">
          <div className="section-header">
            <div className="section-label">Features</div>
            <h2 className="section-title">Everything you expect, nothing you don't</h2>
            <p className="section-sub">Built from the ground up with production cloud infrastructure on AWS.</p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: '⚡',
                title: 'Real-Time Messaging',
                desc: 'Persistent WebSocket connections using the STOMP protocol over SockJS, delivering messages in milliseconds.',  
                tags: ['WebSockets', 'STOMP', 'SockJS'],
                color: '#fbbf24',
              },
              {
                icon: '🔒',
                title: 'Enterprise Security',
                desc: 'Stateless JWT authentication, Spring Security CORS policies, and end-to-end WSS encryption via AWS ACM SSL certificates.',  
                tags: ['JWT', 'Spring Security', 'SSL/TLS'],
                color: '#34d399',
              },
              {
                icon: '🌐',
                title: 'Infinite Scalability',
                desc: 'AWS Auto Scaling Group dynamically provisions new EC2 servers under load. Redis Pub/Sub synchronizes WebSocket state across all servers.',  
                tags: ['AWS ASG', 'Redis Pub/Sub', 'Zero Downtime'],
                color: '#6c63ff',
              },
              {
                icon: '🔑',
                title: 'OAuth 2.0 SSO',
                desc: 'One-click login with Google or GitHub via Spring OAuth2 Resource Server. No passwords to forget, no accounts to manage.',
                tags: ['Google OAuth', 'GitHub OAuth', 'Spring OAuth2'],
                color: '#ec4899',
              },
              {
                icon: '🐳',
                title: 'Containerized Deployment',
                desc: 'Every server runs an identical Docker container pulled from AWS ECR. Zero config drift, zero "works on my machine" bugs.',
                tags: ['Docker', 'AWS ECR', 'Reproducible'],
                color: '#38bdf8',
              },
              {
                icon: '🚀',
                title: 'Zero-Downtime CI/CD',
                desc: 'GitHub Actions builds and pushes Docker images to ECR on every commit. ASG rolling refresh orchestrates a live deployment without a single dropped request.',
                tags: ['GitHub Actions', 'Rolling Deploy', 'CI/CD'],
                color: '#f97316',
              },
            ].map(f => (
              <div key={f.title} className="feature-card glass">
                <div className="feature-icon" style={{ background: `${f.color}18`, color: f.color }}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-tags">
                  {f.tags.map(t => (
                    <span key={t} className="feature-tag" style={{ borderColor: `${f.color}40`, color: f.color }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Auth Section ── */}
      <section ref={authRef} id="auth" className="landing-section landing-auth-section">
        <div className="landing-section-inner">
          <Suspense fallback={<div className="text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</div>}>
            <AuthForm />
          </Suspense>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <p>
          Built with ❤️ by <strong>Hakshay Reddy</strong> ·{' '}
          <a href="https://github.com/HakshayReddyKana/PingMe-Next.Js" target="_blank" rel="noopener noreferrer">
            Frontend Repo
          </a>{' '}
          ·{' '}
          <a href="https://github.com/HakshayReddyKana" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
        <p className="footer-stack">Java · Spring Boot · Docker · AWS · Redis · Next.js</p>
      </footer>

      {/* ── Zoom Modal overlay ── */}
      {isArchZoomed && (
        <div className="arch-modal-overlay" onClick={() => setIsArchZoomed(false)}>
          <div className="arch-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="arch-modal-close" onClick={() => setIsArchZoomed(false)} aria-label="Close modal">
              &times;
            </button>
            <div className="arch-modal-title">System Architecture</div>
            <div className="arch-modal-svg-wrap">
              <ArchitectureSvg style={{ width: '100%', maxHeight: '80vh', display: 'block' }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ── Specific Spacing & Typography Overrides ── */
        #architecture {
          padding: 4rem 2rem 2rem;
        }
        #architecture .section-header {
          margin-bottom: 1.5rem;
        }
        #architecture .section-label {
          font-size: 1.15rem;
          letter-spacing: 0.12em;
          margin-bottom: 1rem;
        }
        #architecture .section-title {
          font-size: clamp(2.25rem, 5vw, 3.25rem);
        }

        /* ── Root ── */
        .landing-root {
          min-height: 100vh;
          background: var(--bg-base);
          color: var(--text-primary);
          overflow-x: hidden;
        }

        /* ── Navbar ── */
        .landing-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          padding: 1.1rem 2rem;
          background: rgba(15, 15, 25, 0.4);
          backdrop-filter: blur(16px) saturate(190%);
          -webkit-backdrop-filter: blur(16px) saturate(190%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
          transition: background 0.4s cubic-bezier(0.16, 1, 0.3, 1), padding 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .landing-nav-scrolled {
          background: rgba(15, 15, 25, 0.55);
          padding: 0.8rem 2rem;
          border-bottom: 1px solid rgba(108, 99, 255, 0.25);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.05) inset;
        }
        .landing-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .landing-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .landing-logo-icon { font-size: 1.5rem; }
        .landing-nav-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .landing-nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .landing-nav-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .landing-nav-links a:hover { color: var(--text-primary); }
        .landing-nav-cta {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .landing-nav-cta:hover { background: var(--accent-hover); transform: translateY(-1px); }

        @media (max-width: 768px) {
          .landing-nav-links {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .landing-nav {
            padding: 0.85rem 1.25rem;
          }
          .landing-nav-scrolled {
            padding: 0.7rem 1.25rem;
          }
          .landing-logo {
            font-size: 1.15rem;
          }
          .landing-nav-cta {
            padding: 0.4rem 1rem;
            font-size: 0.85rem;
          }
        }

        /* ── Hero ── */
        .landing-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4rem;
          padding: 8rem 2rem 4rem;
          max-width: 1300px;
          margin: 0 auto;
          position: relative;
          flex-wrap: wrap;
        }
        .landing-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .landing-particle {
          position: absolute;
          border-radius: 50%;
          background: var(--accent);
          animation: float-particle var(--dur, 8s) ease-in-out infinite alternate;
        }
        @keyframes float-particle {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(-24px) scale(1.2); opacity: 0.05; }
        }
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .hero-blob-1 {
          width: 500px; height: 500px;
          background: rgba(108,99,255,0.18);
          top: -100px; left: -100px;
        }
        .hero-blob-2 {
          width: 400px; height: 400px;
          background: rgba(236,72,153,0.1);
          bottom: 0; right: -80px;
        }
        .hero-greeting-large {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
          animation: fade-in 0.6s var(--ease-out) both;
          background: linear-gradient(135deg, #6c63ff, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .landing-hero-content {
          flex: 1;
          min-width: 320px;
          max-width: 600px;
          z-index: 1;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(108,99,255,0.12);
          border: 1px solid rgba(108,99,255,0.3);
          color: #a8a0ff;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 1.5rem;
          animation: fade-in 0.6s var(--ease-out) both;
        }
        .hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #34d399;
          animation: pulse-ring 1.5s ease-out infinite;
          box-shadow: 0 0 0 0 rgba(52,211,153,0.4);
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          50% { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
        }
        .hero-heading {
          font-size: clamp(3rem, 7vw, 5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          animation: fade-in 0.7s 0.1s var(--ease-out) both;
        }
        .hero-heading-accent {
          background: linear-gradient(135deg, #6c63ff, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 1.1rem;
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          animation: fade-in 0.7s 0.2s var(--ease-out) both;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
          animation: fade-in 0.7s 0.3s var(--ease-out) both;
        }
        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 0.85rem 1.75rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 0 0 var(--accent-glow);
        }
        .hero-cta-primary:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px var(--accent-glow);
        }
        .hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          padding: 0.85rem 1.75rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid var(--border);
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .hero-cta-secondary:hover {
          border-color: var(--accent);
          color: var(--text-primary);
          transform: translateY(-2px);
        }
        .hero-stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          animation: fade-in 0.7s 0.4s var(--ease-out) both;
        }
        .hero-stat-val {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .hero-stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
        }

        /* ── Mock Chat UI ── */
        .hero-mockup {
          flex: 1;
          min-width: 300px;
          max-width: 440px;
          z-index: 1;
          animation: fade-in 0.8s 0.2s var(--ease-out) both;
        }
        .mockup-window {
          background: var(--bg-surface);
          border-radius: 16px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: var(--shadow-lg), 0 0 60px rgba(108,99,255,0.15);
        }
        .mockup-titlebar {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.75rem 1rem;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border);
        }
        .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mockup-title {
          margin-left: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .mockup-body { display: flex; height: 260px; }
        .mockup-sidebar {
          width: 110px;
          border-right: 1px solid var(--border);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .mockup-user {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.5rem;
          border-radius: 8px;
          font-size: 0.72rem;
          color: var(--text-secondary);
          cursor: default;
        }
        .mockup-user-active {
          background: var(--accent-dim);
          color: var(--text-primary);
        }
        .mockup-online-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--online);
        }
        .mockup-chat {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow: hidden;
        }
        .mockup-msg-left { display: flex; flex-direction: column; align-items: flex-start; }
        .mockup-msg-right { display: flex; flex-direction: column; align-items: flex-end; }
        .mockup-bubble {
          padding: 0.5rem 0.85rem;
          border-radius: 12px;
          font-size: 0.78rem;
          max-width: 90%;
        }
        .mockup-bubble-left { background: var(--bg-overlay); color: var(--text-primary); }
        .mockup-bubble-right { background: var(--accent); color: #fff; }
        .mockup-time { font-size: 0.65rem; color: var(--text-muted); margin-top: 0.2rem; }
        .mockup-typing {
          display: flex;
          gap: 4px;
          padding: 0.5rem 0.85rem;
          background: var(--bg-overlay);
          border-radius: 12px;
          width: fit-content;
        }
        .mockup-typing-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: typing-bounce 1.2s ease-in-out infinite;
        }
        .mockup-typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .mockup-typing-dot:nth-child(3) { animation-delay: 0.3s; }

        /* ── Sections ── */
        .landing-section {
          padding: 6rem 2rem;
        }
        .landing-section-alt {
          background: rgba(255,255,255,0.018);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .landing-auth-section {
          padding: 6rem 2rem;
        }
        .landing-section-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .section-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.75rem;
        }
        .section-title {
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .section-sub {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Features Grid ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          padding: 1.75rem;
          border-radius: 16px;
          transition: transform 0.25s var(--ease-out), box-shadow 0.25s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .feature-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .feature-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.6rem;
        }
        .feature-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .feature-tags {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .feature-tag {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          border: 1px solid;
          background: transparent;
          letter-spacing: 0.02em;
        }

        .arch-diagram-wrap {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.15);
          margin: 0 auto 3rem;
          background: #0d0d11;
          box-shadow: var(--shadow-lg), 0 0 60px rgba(108,99,255,0.08);
          max-width: 740px;
          padding: 1.5rem;
          cursor: zoom-in;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .arch-diagram-wrap:hover {
          transform: scale(1.025);
          border-color: #6c63ff;
          box-shadow: 0 0 45px rgba(108,99,255,0.3), var(--shadow-lg);
        }
        .arch-expand-badge {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 0.72rem;
          color: #ffffff;
          background: rgba(108,99,255,0.9);
          padding: 5px 12px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.25);
          pointer-events: none;
          font-weight: 700;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 10;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .arch-diagram-wrap:hover .arch-expand-badge {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Zoom Modal Styles ── */
        .arch-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 5, 8, 0.94);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: archFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .arch-modal-content {
          position: relative;
          background: #0c0c10;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          width: 100%;
          max-width: 1180px;
          padding: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(108, 99, 255, 0.15);
          animation: archScaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .arch-modal-close {
          position: absolute;
          top: 1rem;
          right: 1.5rem;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 2rem;
          cursor: pointer;
          transition: color 0.15s ease;
          line-height: 1;
        }
        .arch-modal-close:hover {
          color: #ffffff;
        }
        .arch-modal-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 1.5rem;
          text-align: center;
          letter-spacing: -0.01em;
        }
        .arch-modal-svg-wrap {
          width: 100%;
          background: #0c0c10;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        @keyframes archFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes archScaleUp {
          from { transform: scale(0.96) translateY(8px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }
        .tech-badge {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.1rem;
          border-radius: 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          transition: border-color 0.2s, transform 0.2s;
        }
        .tech-badge:hover {
          border-color: rgba(108,99,255,0.4);
          transform: translateY(-2px);
        }
        .tech-badge-icon { font-size: 1.4rem; }
        .tech-badge-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .tech-badge-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
        }

        /* ── OAuth buttons ── */
        .oauth-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .oauth-btn:hover {
          background: var(--bg-overlay);
          border-color: rgba(255,255,255,0.15);
          color: var(--text-primary);
        }

        /* ── Footer ── */
        .landing-footer {
          text-align: center;
          padding: 2.5rem 2rem;
          border-top: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .landing-footer a {
          color: var(--accent);
          text-decoration: none;
        }
        .landing-footer a:hover { text-decoration: underline; }
        .footer-stack {
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
