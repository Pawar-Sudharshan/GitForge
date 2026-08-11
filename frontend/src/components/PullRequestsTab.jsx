import React from 'react';
import { GitPullRequest, GitMerge, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react';

export default function PullRequestsTab({ prs = [] }) {
  const displayPrs = prs.length > 0 ? prs : [
    { id: 101, title: "feat: Initialize React Vite frontend & Express backend", author: "Pawar-Sudharshan", branch: "feature/frontend-ui", target: "main", status: "open", reviews: "Approved", createdAt: "Just now" },
    { id: 102, title: "refactor: Modernize UI layout with glassmorphism design system", author: "designer_ui", branch: "feature/glass-ui", target: "main", status: "merged", reviews: "Approved", createdAt: "Yesterday" }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Pull Requests
        </h2>

        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}>
          <GitPullRequest size={16} />
          <span>New Pull Request</span>
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderBottom: 'var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontWeight: 600 }}>
            <GitPullRequest size={16} /> 1 Open
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <GitMerge size={16} color="#a855f7" /> 1 Merged
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {displayPrs.map(pr => (
            <div 
              key={pr.id}
              style={{
                padding: '1.2rem 1.25rem',
                borderBottom: 'var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                {pr.status === 'open' ? (
                  <GitPullRequest size={20} color="#818cf8" style={{ marginTop: '2px' }} />
                ) : (
                  <GitMerge size={20} color="#a855f7" style={{ marginTop: '2px' }} />
                )}

                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    {pr.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>#{pr.id} opened {pr.createdAt} by <strong>{pr.author}</strong></span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                      <span>{pr.branch}</span>
                      <ArrowRight size={12} />
                      <span>{pr.target}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <CheckCircle size={12} /> {pr.reviews}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
