import React, { useState } from 'react';
import {
  GitBranchIcon,
  TagIcon,
  HistoryIcon,
  CheckIcon,
  TriangleDownIcon,
  FileDirectoryFillIcon,
  FileIcon,
  BookIcon,
  DownloadIcon,
  CopyIcon
} from '@primer/octicons-react';

export const RepoCodeView = ({
  repo,
  onSelectFile,
  onViewCommits
}) => {
  const [currentFolder, setCurrentFolder] = useState('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  const headCommit = repo.commits[0];

  // Helper to get nodes at current folder level
  const currentNodes = (() => {
    if (!currentFolder) return repo.fileTree;
    const parts = currentFolder.split('/');
    let current = repo.fileTree;
    for (const part of parts) {
      const match = current.find((n) => n.name === part && n.type === 'directory');
      if (match && match.children) current = match.children;
      else return [];
    }
    return current;
  })();

  const cloneCommand = `git clone http://localhost:5000/repos/${repo.name}.git`;

  const copyClone = () => {
    navigator.clipboard?.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      {/* Top Toolbar: Branch dropdown, Tags, Go to file, Code green button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        {/* Left: Branch dropdown and Branch/Tag stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="gh-btn" style={{ fontWeight: 600 }}>
            <GitBranchIcon size={16} style={{ color: 'var(--gh-fg-muted)' }} />
            <span>{repo.defaultBranch}</span>
            <TriangleDownIcon size={14} style={{ color: 'var(--gh-fg-muted)' }} />
          </button>

          <button
            onClick={onViewCommits}
            className="gh-btn"
            style={{ color: 'var(--gh-fg-muted)' }}
          >
            <GitBranchIcon size={14} />
            <span style={{ fontWeight: 600, color: 'var(--gh-fg-default)' }}>1</span> branch
          </button>

          <button className="gh-btn" style={{ color: 'var(--gh-fg-muted)' }}>
            <TagIcon size={14} />
            <span style={{ fontWeight: 600, color: 'var(--gh-fg-default)' }}>0</span> tags
          </button>
        </div>

        {/* Right: Go to file, Add file, Code Green Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <button className="gh-btn">Go to file</button>
          <button className="gh-btn">Add file <TriangleDownIcon size={12} /></button>

          {/* Green Code Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsCodeModalOpen(!isCodeModalOpen)}
              className="gh-btn gh-btn-primary"
            >
              <span>Code</span>
              <TriangleDownIcon size={14} />
            </button>

            {isCodeModalOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '320px',
                  backgroundColor: 'var(--gh-bg-default)',
                  border: '1px solid var(--gh-border-default)',
                  borderRadius: '6px',
                  boxShadow: '0 8px 24px rgba(1,4,9,0.25)',
                  padding: '16px',
                  zIndex: 200
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Clone with ApnaGit / HTTPS
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--gh-border-default)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    backgroundColor: 'var(--gh-bg-subtle)',
                    fontSize: '12px',
                    fontFamily: 'var(--github-font-mono)'
                  }}
                >
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cloneCommand}
                  </span>
                  <button
                    onClick={copyClone}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gh-fg-muted)' }}
                    title="Copy clone command"
                  >
                    <CopyIcon size={14} />
                  </button>
                </div>
                {copiedClone && (
                  <div style={{ color: 'var(--gh-success-hover)', fontSize: '11px', marginTop: '4px' }}>
                    Copied to clipboard!
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--gh-border-muted)', marginTop: '12px', paddingTop: '10px' }}>
                  <button
                    className="gh-btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setIsCodeModalOpen(false)}
                  >
                    <DownloadIcon size={14} />
                    <span>Download ZIP archive</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GitHub File Table Box */}
      <div
        style={{
          border: '1px solid var(--gh-border-default)',
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: 'var(--gh-bg-default)',
          marginBottom: '24px'
        }}
      >
        {/* Latest Commit Bar (Table Header) */}
        <div
          style={{
            backgroundColor: 'var(--gh-bg-subtle)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--gh-border-default)',
            fontSize: '13px',
            color: 'var(--gh-fg-default)'
          }}
        >
          {/* Left: Author + Commit Message + Verified */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {/* Avatar */}
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#30363d',
                color: '#fff',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              S
            </div>

            <span style={{ fontWeight: 600, color: 'var(--gh-fg-default)' }}>
              {headCommit?.author.split('<')[0].trim()}
            </span>

            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'var(--gh-fg-muted)'
              }}
            >
              {headCommit?.message}
            </span>

            {/* Verified Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                border: '1px solid rgba(46, 160, 67, 0.4)',
                borderRadius: '2em',
                padding: '0 6px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#3fb950',
                lineHeight: '16px'
              }}
            >
              <CheckIcon size={12} />
              Verified
            </span>
          </div>

          {/* Right: Commit Hash + Time + Total Commits Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <span
              className="gh-mono"
              style={{ color: 'var(--gh-fg-muted)', fontSize: '12px' }}
            >
              {headCommit?.shortId}
            </span>

            <span style={{ color: 'var(--gh-fg-muted)', fontSize: '12px' }}>
              2 hours ago
            </span>

            <button
              onClick={onViewCommits}
              className="gh-btn gh-btn-sm"
              style={{ fontWeight: 600 }}
            >
              <HistoryIcon size={14} />
              <span>{repo.commits.length} commits</span>
            </button>
          </div>
        </div>

        {/* Directory Navigation Up Row (if in subfolder) */}
        {currentFolder && (
          <div
            onClick={() => {
              const parts = currentFolder.split('/');
              parts.pop();
              setCurrentFolder(parts.join('/'));
            }}
            className="gh-table-row"
            style={{ cursor: 'pointer', color: 'var(--gh-accent)', fontWeight: 600 }}
          >
            ..
          </div>
        )}

        {/* File / Directory Rows */}
        {currentNodes.map((node) => {
          const isDir = node.type === 'directory';
          return (
            <div
              key={node.path}
              className="gh-table-row"
              onClick={() => {
                if (isDir) {
                  setCurrentFolder(currentFolder ? `${currentFolder}/${node.name}` : node.name);
                } else {
                  onSelectFile(node);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Icon + Name */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '35%',
                  minWidth: '200px'
                }}
              >
                {isDir ? (
                  <FileDirectoryFillIcon size={16} style={{ color: '#54aeff' }} />
                ) : (
                  <FileIcon size={16} style={{ color: 'var(--gh-fg-muted)' }} />
                )}
                <span style={{ color: 'var(--gh-fg-default)' }}>
                  {node.name}
                </span>
              </div>

              {/* Commit Message Snippet */}
              <div
                style={{
                  flex: 1,
                  color: 'var(--gh-fg-muted)',
                  fontSize: '13px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {headCommit?.message}
              </div>

              {/* Relative Time */}
              <div style={{ color: 'var(--gh-fg-muted)', fontSize: '12px', textAlign: 'right' }}>
                2 hours ago
              </div>
            </div>
          );
        })}
      </div>

      {/* GitHub README Preview Box */}
      <div
        style={{
          border: '1px solid var(--gh-border-default)',
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: 'var(--gh-bg-default)'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--gh-bg-subtle)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--gh-border-default)',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <BookIcon size={16} style={{ color: 'var(--gh-fg-muted)' }} />
          <span>README.md</span>
        </div>

        <div style={{ padding: '32px', lineHeight: 1.6 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, borderBottom: '1px solid var(--gh-border-muted)', paddingBottom: '8px', marginBottom: '16px' }}>
            {repo.name}
          </h1>
          <p style={{ color: 'var(--gh-fg-muted)', marginBottom: '16px' }}>
            {repo.description}
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '20px', marginBottom: '8px' }}>
            Architectural Guarantees
          </h3>
          <ul style={{ paddingLeft: '24px', color: 'var(--gh-fg-default)' }}>
            <li><strong>Deterministic Full-Tree Snapshots</strong>: Captures the entire repository manifest per commit.</li>
            <li><strong>Parent Commit Lineage (DAG)</strong>: Strict ancestry verification via explicit <code>parentCommit</code> hashes.</li>
            <li><strong>Safe Revert</strong>: Preserves untracked and unrelated workspace files by default.</li>
            <li><strong>Path Traversal Defense</strong>: Comprehensive sanitization against <code>..</code>, UNC paths, and symlink escapes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
