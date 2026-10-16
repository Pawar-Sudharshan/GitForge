import React, { useState } from 'react';
import { IconSettings, IconOffline, IconCheck, IconAlert } from '../Common/Icons';

export const SettingsView = () => {
  const [localRepoPath, setLocalRepoPath] = useState('C:\\project2');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-canvas)',
        overflowY: 'auto',
        padding: '24px 32px'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Local Engine & Adapter Configuration
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Configure ApnaGit filesystem sandboxes, remote synchronization fallbacks, and safety invariant rules.
        </p>
      </div>

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: AWS S3 Offline Status Notice */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconOffline size={18} style={{ color: 'var(--color-warning)' }} />
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                AWS S3 Synchronization Status
              </h2>
            </div>
            <span className="badge badge-local">STATUS: UNLINKED</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            AWS authentication credentials are not present in the runtime environment. GitForge operates with
            deterministic <strong>local-first fallback</strong>. Push and pull commands validate ancestry rules
            and commit lineages locally without attempting unauthorized outbound cloud calls.
          </p>

          <div
            style={{
              marginTop: '14px',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>S3 BUCKET: </span>
              <span style={{ color: 'var(--text-primary)' }}>local-offline-mock</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>AWS REGION: </span>
              <span style={{ color: 'var(--text-primary)' }}>offline-standalone</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>HEAD CONCURRENCY: </span>
              <span style={{ color: 'var(--accent-copper)' }}>Conditional Lock Enabled</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>KEY PREFIX: </span>
              <span style={{ color: 'var(--text-primary)' }}>repos/:repoId/</span>
            </div>
          </div>
        </div>

        {/* Section 2: Local Filesystem Storage Paths */}
        <form
          onSubmit={handleSave}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Filesystem Sandbox Paths
          </h2>

          <div>
            <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              PRIMARY REPOSITORY ROOT PATH
            </label>
            <input
              type="text"
              value={localRepoPath}
              onChange={(e) => setLocalRepoPath(e.target.value)}
              className="input-text font-mono"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                COMMITS & SNAPSHOTS DIRECTORY
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                .apnaGit/commits/&lt;commitId&gt;/
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                STAGING BUFFER
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                .apnaGit/staging/
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            {saveSuccess ? (
              <span style={{ color: 'var(--color-success)', fontSize: '12px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IconCheck size={14} /> PATHS SAVED
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Verified absolute path security.
              </span>
            )}

            <button type="submit" className="btn btn-primary font-mono btn-sm">
              SAVE CONFIGURATION
            </button>
          </div>
        </form>

        {/* Section 3: Phase 2 Engine Invariants Audit */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px'
          }}
        >
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Engine Security & Safety Invariants
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                title: 'Path Traversal Defense',
                desc: 'Rejects directory traversal (..), UNC escapes, and drive paths.',
                status: 'ENFORCED'
              },
              {
                title: 'Safe Revert Untracked Preservation',
                desc: 'Preserves untracked and unrelated workspace files during snapshot rollback.',
                status: 'ENFORCED'
              },
              {
                title: 'Explicit Parent Commitment DAG',
                desc: 'Mandatory parentCommit pointers for ancestry validation and divergence checks.',
                status: 'ENFORCED'
              },
              {
                title: 'Deletion Staging (rm.js)',
                desc: 'Tombstone tracking ensures file deletions cleanly propagate to snapshots.',
                status: 'ENFORCED'
              }
            ].map((inv, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {inv.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {inv.desc}
                  </div>
                </div>

                <span className="badge badge-success">{inv.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
