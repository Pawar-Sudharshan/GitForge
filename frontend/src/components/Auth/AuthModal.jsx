import React, { useState } from 'react';
import { GitForgeSymbol } from '../Brand/Logo';
import { IconUser, IconCheck } from '../Common/Icons';

export const AuthModal = ({ isOpen, onClose, user, onLogin, onLogout }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    onLogin({
      username: username.trim(),
      email: email.trim() || `${username.trim()}@gitforge.local`,
      role: 'developer'
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 19, 22, 0.8)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 120,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        {/* Header with Forge Symbol */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitForgeSymbol size={24} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user ? 'Developer Profile' : mode === 'login' ? 'Sign In to Workbench' : 'Create Developer Account'}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Local & distributed repository authority.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm font-mono">
            ✕
          </button>
        </div>

        {user ? (
          /* Profile Active View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                ACTIVE DEVELOPER SESSION
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-copper)', marginTop: '4px' }}>
                {user.username}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {user.email}
              </div>
              <div style={{ marginTop: '8px' }}>
                <span className="badge badge-success">LOCAL_AUTHORITY: GRANTED</span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="btn btn-secondary font-mono"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              DISCONNECT SESSION
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Mode switch */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-canvas)',
                padding: '3px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  flex: 1,
                  background: mode === 'login' ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: 'none',
                  color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
                  padding: '5px 0',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{
                  flex: 1,
                  background: mode === 'signup' ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: 'none',
                  color: mode === 'signup' ? 'var(--text-primary)' : 'var(--text-muted)',
                  padding: '5px 0',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                REGISTER
              </button>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                USERNAME
              </label>
              <input
                type="text"
                required
                placeholder="sudharshan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-text font-mono"
                style={{ width: '100%' }}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  DEVELOPER EMAIL
                </label>
                <input
                  type="email"
                  placeholder="dev@gitforge.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-text font-mono"
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                PASSPHRASE / KEY
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-text font-mono"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <input type="checkbox" id="localAuth" defaultChecked style={{ accentColor: 'var(--accent-copper)' }} />
              <label htmlFor="localAuth" style={{ fontSize: '11px', color: 'var(--text-secondary)', userSelect: 'none' }}>
                Store credentials locally on disk (offline sandbox)
              </label>
            </div>

            <button type="submit" className="btn btn-primary font-mono" style={{ width: '100%', marginTop: '6px' }}>
              {mode === 'login' ? 'AUTHORIZE WORKBENCH' : 'INITIALIZE ACCOUNT'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
