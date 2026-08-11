import React, { useState } from 'react';
import { Disc, MessageSquare, Plus, CheckCircle2, Clock, Tag, Search, Filter } from 'lucide-react';

export default function IssuesTab({ issues = [] }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const displayIssues = issues.length > 0 ? issues : [
    { id: 1, title: "Add authentication middleware in backend", author: "Pawar-Sudharshan", status: "open", labels: ["enhancement", "backend"], comments: 4, createdAt: "2 hours ago" },
    { id: 2, title: "Dark mode theme toggle flickering on initial render", author: "alex_dev", status: "open", labels: ["bug", "frontend"], comments: 2, createdAt: "5 hours ago" },
    { id: 3, title: "Setup automated CI/CD workflow pipeline", author: "devops_pro", status: "closed", labels: ["devops", "ci/cd"], comments: 7, createdAt: "1 day ago" }
  ];

  const filtered = displayIssues.filter(i => {
    if (filter === 'open') return i.status === 'open';
    if (filter === 'closed') return i.status === 'closed';
    return true;
  }).filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
      
      {/* Search & Filter Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '3px', borderRadius: '8px', border: 'var(--glass-border)' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{ padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, background: filter === 'all' ? 'var(--primary)' : 'transparent', color: '#fff' }}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('open')}
              style={{ padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, background: filter === 'open' ? 'var(--primary)' : 'transparent', color: '#fff' }}
            >
              Open
            </button>
            <button 
              onClick={() => setFilter('closed')}
              style={{ padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, background: filter === 'closed' ? 'var(--primary)' : 'transparent', color: '#fff' }}
            >
              Closed
            </button>
          </div>
        </div>

        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          <Plus size={16} />
          <span>New Issue</span>
        </button>
      </div>

      {/* Issues Table Panel */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderBottom: 'var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 600 }}>
            <Disc size={16} /> 2 Open
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} color="var(--text-dim)" /> 1 Closed
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map(issue => (
            <div 
              key={issue.id}
              style={{
                padding: '1rem 1.25rem',
                borderBottom: 'var(--glass-border)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                transition: 'background 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Disc size={18} color={issue.status === 'open' ? '#34d399' : '#a855f7'} style={{ marginTop: '3px' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {issue.title}
                    </span>
                    {issue.labels.map((label, lIdx) => (
                      <span 
                        key={lIdx}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '10px',
                          background: label.includes('bug') ? 'rgba(244,63,94,0.2)' : 'rgba(99,102,241,0.2)',
                          color: label.includes('bug') ? '#fb7185' : '#818cf8',
                          border: label.includes('bug') ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(99,102,241,0.3)',
                          fontWeight: 500
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>#{issue.id} opened {issue.createdAt} by <strong>{issue.author}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <MessageSquare size={14} />
                <span>{issue.comments}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
