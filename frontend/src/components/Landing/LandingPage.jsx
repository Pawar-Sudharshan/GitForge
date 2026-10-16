import React from 'react';
import { GitForgeLogo } from '../Brand/Logo';
import {
  IconSnapshot,
  IconLineage,
  IconRevert,
  IconTerminal,
  IconCheck,
  IconOffline,
  IconRepo
} from '../Common/Icons';

export const LandingPage = ({ onEnterWorkbench }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-canvas)',
        overflowY: 'auto'
      }}
    >
      {/* Top Minimalist Header */}
      <nav
        style={{
          height: '56px',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <GitForgeLogo />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="badge badge-local">
            <IconOffline size={12} />
            <span>LOCAL_ONLY MODE</span>
          </span>
          <button onClick={onEnterWorkbench} className="btn btn-primary font-mono btn-sm">
            <span>ENTER WORKBENCH</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          maxWidth: '920px',
          margin: '0 auto',
          padding: '60px 32px 40px',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="badge badge-copper">ARCHITECTURE // PHASE 2 ENGINE</span>
          <span className="badge badge-neutral">NODE.JS ES MODULES</span>
        </div>

        <h1
          style={{
            fontSize: '34px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15
          }}
        >
          The Local-First Distributed Version Control System.
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            marginTop: '16px',
            lineHeight: 1.6,
            maxWidth: '720px'
          }}
        >
          GitForge (ApnaGit) is engineered around <strong>deterministic full-tree snapshots</strong>,
          explicit <strong>parent commit lineage</strong>, and <strong>safe atomic revert</strong> that
          respects untracked workspace files. Built from first principles without black-box abstractions.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
          <button
            onClick={onEnterWorkbench}
            className="btn btn-primary font-mono"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <span>LAUNCH WORKBENCH</span>
          </button>
          <a
            href="#cli-guide"
            className="btn btn-secondary font-mono"
            style={{ padding: '8px 18px', fontSize: '13px', textDecoration: 'none' }}
          >
            <IconTerminal size={14} />
            <span>CLI SPECIFICATION</span>
          </a>
        </div>

        {/* Honest Architecture Notice */}
        <div
          style={{
            marginTop: '32px',
            padding: '14px 18px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <IconOffline size={18} style={{ color: 'var(--color-warning)', marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              LOCAL-FIRST OPERATION NOTICE
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.5 }}>
              AWS S3 remote synchronization is currently decoupled. GitForge executes purely on your local
              filesystem under <code>.apnaGit/</code>. Snapshots, staging, parent lineage trees, and reversions
              are 100% functional, deterministic, and offline.
            </div>
          </div>
        </div>

        {/* 4 Architectural Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginTop: '48px'
          }}
        >
          {/* Pillar 1 */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-copper)' }}>
              <IconSnapshot size={18} />
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                01 // FULL-TREE SNAPSHOTS
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.5 }}>
              Each commit materializes a complete, content-addressed snapshot manifest. No fragile delta chains
              that corrupt upon missing intermediate deltas.
            </p>
          </div>

          {/* Pillar 2 */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-copper)' }}>
              <IconLineage size={18} />
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                02 // EXPLICIT PARENT DAG
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.5 }}>
              Every commit points directly to its <code>parentCommit</code> hash. Enables fast-forward validation,
              branch diverge detection, and transparent lineage audits.
            </p>
          </div>

          {/* Pillar 3 */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-copper)' }}>
              <IconRevert size={18} />
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                03 // SAFE ATOMIC REVERT
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.5 }}>
              Revert restores the exact target snapshot while explicitly preserving untracked and unrelated
              workspace files. No accidental destruction of active edits.
            </p>
          </div>

          {/* Pillar 4 */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-copper)' }}>
              <IconCheck size={18} />
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                04 // PATH SECURITY
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.5 }}>
              Hardened against directory traversal attempts (<code>..</code>), Windows drive-letter escapes, UNC
              paths, and external symbolic link escapes.
            </p>
          </div>
        </div>

        {/* CLI Reference Section */}
        <div id="cli-guide" style={{ marginTop: '56px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <IconTerminal size={16} style={{ color: 'var(--accent-copper)' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              ApnaGit CLI Workflow
            </h2>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden'
            }}
          >
            <table className="table-dense font-mono" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>COMMAND</th>
                  <th>DVCS BEHAVIOR</th>
                  <th style={{ width: '180px' }}>STORAGE EFFECT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--accent-copper)' }}>node index.js init</td>
                  <td>Initializes <code>.apnaGit/</code>, creates staging directory and empty HEAD pointer</td>
                  <td>Creates .apnaGit/head.json</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--accent-copper)' }}>node index.js add &lt;file&gt;</td>
                  <td>Validates relative path against traversal; copies file into staging area</td>
                  <td>.apnaGit/staging/&lt;path&gt;</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--accent-copper)' }}>node index.js rm &lt;file&gt;</td>
                  <td>Stages deletion tombstone and removes working file from workspace</td>
                  <td>.apnaGit/staging/&lt;path&gt;.deleted</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--accent-copper)' }}>node index.js commit &lt;msg&gt;</td>
                  <td>Materializes full-tree snapshot from parent + staging, updates HEAD pointer</td>
                  <td>.apnaGit/commits/&lt;hash&gt;/</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--accent-copper)' }}>node index.js revert &lt;commitId&gt;</td>
                  <td>Restores target snapshot while preserving untracked workspace files</td>
                  <td>Atomic workspace overwrite</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
