import React from 'react';
import { Star, GitFork, Eye, Code, Disc, GitPullRequest, History, ExternalLink, ShieldAlert, Sparkles, FolderGit2 } from 'lucide-react';

export default function RepoHeader({ activeTab, setActiveTab, repoInfo }) {
  const tabs = [
    { id: 'code', label: 'Code', icon: Code },
    { id: 'issues', label: 'Issues', icon: Disc, count: 3 },
    { id: 'prs', label: 'Pull Requests', icon: GitPullRequest, count: 2 },
    { id: 'commits', label: 'Commits', icon: History, count: 1 },
    { id: 'backend', label: 'Backend API', icon: FolderGit2 }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto 1.5rem auto', padding: '0 1.5rem' }}>
      
      {/* Title + Badges Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Pawar-Sudharshan</span>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-main)' }}>
              GitForge
            </h1>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.15rem 0.6rem', 
              borderRadius: '12px', 
              background: 'rgba(255, 255, 255, 0.08)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}>
              Public
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {repoInfo?.description || "Next-Generation Open Source Developer Collaboration Platform & Code Forge"}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'var(--glass-border)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            <Eye size={15} color="#06b6d4" />
            <span>Watch</span>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
              {repoInfo?.watchers || 35}
            </span>
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'var(--glass-border)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            <GitFork size={15} color="#a855f7" />
            <span>Fork</span>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
              {repoInfo?.forks || 28}
            </span>
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <Star size={15} fill="#fff" />
            <span>Star</span>
            <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
              {repoInfo?.stars || 142}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  fontSize: '0.75rem',
                  color: isActive ? '#c7d2fe' : 'var(--text-muted)'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
