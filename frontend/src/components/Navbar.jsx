import React from 'react';
import { GitBranch, Search, Terminal, Code2, Activity, ShieldCheck, Sparkles, Server } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendOnline }) {
  return (
    <header className="glass-panel" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '0.85rem 1.5rem', marginBottom: '1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <GitBranch size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                GitForge
              </span>
              <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 600 }}>
                v1.0.0
              </span>
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div style={{ position: 'relative', width: '320px', display: 'none', mdDisplay: 'block' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search code, issues, PRs..." 
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.2rem',
              borderRadius: '8px',
              border: 'var(--glass-border)',
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Navigation & Backend Live Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Live Backend Connection Chip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            background: backendOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            border: backendOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: backendOnline ? '#34d399' : '#fb7185'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: backendOnline ? '#10b981' : '#f43f5e',
              boxShadow: backendOnline ? '0 0 8px #10b981' : '0 0 8px #f43f5e'
            }} />
            <Server size={14} />
            <span>Backend: {backendOnline ? 'Online (Port 5000)' : 'Offline'}</span>
          </div>

          <a 
            href="https://github.com/Pawar-Sudharshan/GitForge" 
            target="_blank" 
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'var(--glass-border)',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              transition: 'all 0.2s'
            }}
          >
            <Code2 size={16} />
            <span>GitHub Repo</span>
          </a>
        </div>
      </div>
    </header>
  );
}
