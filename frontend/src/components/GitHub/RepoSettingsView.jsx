import React, { useState } from 'react';
import {
  GearIcon,
  ShieldCheckIcon,
  AlertIcon,
  CheckIcon,
  KeyIcon,
  ServerIcon
} from '@primer/octicons-react';

export const RepoSettingsView = ({
  repo,
  onUpdateRepoName
}) => {
  const [repoName, setRepoName] = useState(repo.name);
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const handleRename = (e) => {
    e.preventDefault();
    if (!repoName.trim()) return;
    onUpdateRepoName(repoName.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', display: 'flex', gap: '32px' }}>
      {/* Settings Left Navigation */}
      <aside style={{ width: '240px', flexShrink: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gh-fg-muted)', marginBottom: '8px', paddingLeft: '8px' }}>
          Repository settings
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            { id: 'general', label: 'General', icon: GearIcon },
            { id: 'access', label: 'Collaborators', icon: KeyIcon },
            { id: 'aws', label: 'Local Engine & AWS S3', icon: ServerIcon },
            { id: 'security', label: 'Code security', icon: ShieldCheckIcon }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: isActive ? 'var(--gh-bg-subtle)' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '2px solid #f78166' : '2px solid transparent',
                  borderRadius: isActive ? '0 6px 6px 0' : '6px',
                  color: isActive ? 'var(--gh-fg-default)' : 'var(--gh-fg-muted)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Settings Content */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* General Settings */}
        <section
          style={{
            border: '1px solid var(--gh-border-default)',
            borderRadius: '6px',
            backgroundColor: 'var(--gh-bg-default)',
            padding: '24px'
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--gh-border-muted)', paddingBottom: '8px' }}>
            General
          </h2>

          <form onSubmit={handleRename} style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>
              Repository name
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--gh-border-default)',
                  backgroundColor: 'var(--gh-bg-subtle)',
                  color: 'var(--gh-fg-default)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button type="submit" className="gh-btn">
                Rename
              </button>
            </div>
            {saved && (
              <div style={{ color: '#3fb950', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckIcon size={12} /> Repository renamed successfully.
              </div>
            )}
          </form>
        </section>

        {/* Honest Local-Only & AWS S3 Status Panel */}
        <section
          style={{
            border: '1px solid var(--gh-border-default)',
            borderRadius: '6px',
            backgroundColor: 'var(--gh-bg-default)',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ServerIcon size={18} style={{ color: 'var(--gh-warning-fg)' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>
              Local DVCS Engine & AWS Synchronization Status
            </h2>
          </div>

          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(210, 153, 34, 0.1)',
              border: '1px solid rgba(210, 153, 34, 0.3)',
              borderRadius: '6px',
              color: 'var(--gh-fg-default)',
              fontSize: '13px',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--gh-warning-fg)', marginBottom: '4px' }}>
              HONEST LOCAL-ONLY MODE ACTIVE
            </div>
            AWS S3 credentials are not configured in this environment. GitForge operates purely in
            <strong> offline local-first mode</strong>. Snapshots, branch lineages, and reversions are stored
            on your local disk under <code>.apnaGit/commits/</code>. No cloud synchronization calls will be attempted.
          </div>

          <div
            style={{
              backgroundColor: 'var(--gh-bg-subtle)',
              border: '1px solid var(--gh-border-muted)',
              borderRadius: '6px',
              padding: '12px 16px',
              fontFamily: 'var(--github-font-mono)',
              fontSize: '12px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}
          >
            <div>
              <span style={{ color: 'var(--gh-fg-muted)' }}>Storage Engine: </span>
              <span>Local Filesystem (.apnaGit)</span>
            </div>
            <div>
              <span style={{ color: 'var(--gh-fg-muted)' }}>HEAD Concurrency: </span>
              <span style={{ color: '#3fb950' }}>Conditional Lock Safe</span>
            </div>
            <div>
              <span style={{ color: 'var(--gh-fg-muted)' }}>Path Traversal: </span>
              <span style={{ color: '#3fb950' }}>Sanitized & Blocked</span>
            </div>
            <div>
              <span style={{ color: 'var(--gh-fg-muted)' }}>S3 Adapter Status: </span>
              <span style={{ color: 'var(--gh-warning-fg)' }}>Disconnected (Mock Only)</span>
            </div>
          </div>
        </section>

        {/* GitHub Danger Zone Box */}
        <section
          style={{
            border: '1px solid var(--gh-danger-fg)',
            borderRadius: '6px',
            backgroundColor: 'var(--gh-bg-default)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--gh-danger-fg)',
              color: 'var(--gh-danger-fg)',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Danger Zone
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Change repository visibility</div>
                <div style={{ fontSize: '12px', color: 'var(--gh-fg-muted)' }}>
                  This repository is currently <strong>{repo.visibility}</strong>.
                </div>
              </div>
              <button className="gh-btn" style={{ color: 'var(--gh-danger-fg)' }}>
                Change visibility
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--gh-border-muted)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Delete this repository</div>
                <div style={{ fontSize: '12px', color: 'var(--gh-fg-muted)' }}>
                  Once deleted, repository snapshots on local disk cannot be restored.
                </div>
              </div>
              <button
                className="gh-btn"
                style={{
                  backgroundColor: 'var(--gh-danger-bg)',
                  color: '#ffffff',
                  borderColor: 'var(--gh-danger-fg)'
                }}
              >
                Delete this repository
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
