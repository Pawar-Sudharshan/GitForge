import React, { useState, useMemo } from 'react';
import {
  IconFolder,
  IconFolderOpen,
  IconFile,
  IconChevronRight,
  IconChevronDown,
  IconCopy,
  IconCheck,
  IconRevert,
  IconSnapshot,
  IconInfo
} from '../Common/Icons';

export const RepoExplorer = ({ repo, onRevertToCommit }) => {
  const [selectedFilePath, setSelectedFilePath] = useState('backend/controllers/commit.js');
  const [expandedFolders, setExpandedFolders] = useState({
    'backend': true,
    'backend/controllers': true,
    'backend/utils': true,
    'src': true
  });
  const [copied, setCopied] = useState(false);

  // Flatten and search file tree for the currently selected file
  const activeFile = useMemo(() => {
    function findFile(nodes) {
      for (const node of nodes) {
        if (node.type === 'file' && node.path === selectedFilePath) {
          return node;
        }
        if (node.children) {
          const match = findFile(node.children);
          if (match) return match;
        }
      }
      return null;
    }
    return findFile(repo.fileTree) || {
      name: 'commit.js',
      path: 'backend/controllers/commit.js',
      size: '6.1 KB',
      language: 'javascript',
      content: '// Select a file to inspect full-tree snapshot contents'
    };
  }, [repo, selectedFilePath]);

  const activeCommit = repo.commits[0]; // Head commit

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const copyCode = () => {
    if (activeFile?.content) {
      navigator.clipboard?.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Recursive tree renderer
  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node) => {
      const isDir = node.type === 'directory';
      const isExpanded = expandedFolders[node.path];
      const isSelected = selectedFilePath === node.path;

      return (
        <div key={node.path} style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            onClick={() => {
              if (isDir) toggleFolder(node.path);
              else setSelectedFilePath(node.path);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: `4px 8px 4px ${12 + depth * 14}px`,
              cursor: 'pointer',
              backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'transparent',
              color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderLeft: isSelected ? '2px solid var(--accent-copper)' : '2px solid transparent',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isDir ? (
              <>
                {isExpanded ? (
                  <IconChevronDown size={11} style={{ color: 'var(--text-muted)' }} />
                ) : (
                  <IconChevronRight size={11} style={{ color: 'var(--text-muted)' }} />
                )}
                {isExpanded ? (
                  <IconFolderOpen size={14} style={{ color: 'var(--accent-copper)' }} />
                ) : (
                  <IconFolder size={14} style={{ color: 'var(--text-secondary)' }} />
                )}
              </>
            ) : (
              <>
                <span style={{ width: 11 }} />
                <IconFile size={13} style={{ color: 'var(--text-muted)' }} />
              </>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node.name}
            </span>
          </div>

          {isDir && isExpanded && node.children && renderTree(node.children, depth + 1)}
        </div>
      );
    });
  };

  const codeLines = (activeFile?.content || '').split('\n');

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-canvas)',
        overflow: 'hidden'
      }}
    >
      {/* PANE 1: File Tree (280px) */}
      <aside
        style={{
          width: 'var(--tree-width)',
          borderRight: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          <span>TREE SNAPSHOT // HEAD</span>
          <span className="badge badge-neutral">{repo.trackedFilesCount} FILES</span>
        </div>

        {/* Scrollable Directory Hierarchy */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {renderTree(repo.fileTree)}
        </div>

        {/* Bottom Local Storage Stats */}
        <div
          style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>HEAD: {repo.headCommitId.substring(0, 8)}</span>
          <span>{(repo.snapshotSizeBytes / 1024).toFixed(1)} KB</span>
        </div>
      </aside>

      {/* PANE 2: Center Code Canvas */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: 'var(--bg-canvas)',
          overflow: 'hidden'
        }}
      >
        {/* Code Canvas Toolbar */}
        <div
          style={{
            height: '38px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
            flexShrink: 0
          }}
        >
          {/* Breadcrumb path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-muted)' }}>{repo.name}</span>
            <span style={{ color: 'var(--border-strong)' }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeFile.path}</span>
          </div>

          {/* Right meta tags and copy button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-neutral">{activeFile.size || '3.2 KB'}</span>
            <span className="badge badge-neutral">{codeLines.length} LINES</span>
            <span className="badge badge-copper">{activeFile.language || 'code'}</span>

            <button
              onClick={copyCode}
              className="btn btn-ghost btn-sm font-mono"
              title="Copy file contents"
              style={{ padding: '3px 7px' }}
            >
              {copied ? (
                <>
                  <IconCheck size={12} style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-success)', fontSize: '11px' }}>COPIED</span>
                </>
              ) : (
                <>
                  <IconCopy size={12} />
                  <span style={{ fontSize: '11px' }}>COPY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Viewport with Line Numbers */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 0',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            lineHeight: '1.65'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {codeLines.map((line, idx) => (
                <tr
                  key={idx}
                  style={{
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Line Number */}
                  <td
                    style={{
                      width: '46px',
                      padding: '0 12px 0 10px',
                      textAlign: 'right',
                      color: 'var(--text-muted)',
                      userSelect: 'none',
                      verticalAlign: 'top',
                      borderRight: '1px solid var(--border-subtle)',
                      fontSize: '11px'
                    }}
                  >
                    {idx + 1}
                  </td>
                  {/* Line Content */}
                  <td
                    style={{
                      padding: '0 16px',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre',
                      wordBreak: 'normal',
                      verticalAlign: 'top'
                    }}
                  >
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* PANE 3: Right Snapshot & Commit Inspector (320px) */}
      <aside
        style={{
          width: 'var(--inspector-width)',
          borderLeft: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: 'auto'
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <IconSnapshot size={13} style={{ color: 'var(--accent-copper)' }} />
          <span>SNAPSHOT INSPECTOR</span>
        </div>

        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Commit Message Box */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
              COMMIT MESSAGE
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-primary)',
                lineHeight: 1.4,
                backgroundColor: 'var(--bg-surface-elevated)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {activeCommit.message}
            </div>
          </div>

          {/* Hashes: Commit and Parent Lineage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                SNAPSHOT HASH (HEAD)
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  color: 'var(--accent-copper)',
                  wordBreak: 'break-all',
                  marginTop: '2px'
                }}
              >
                {activeCommit.id}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                PARENT COMMIT LINEAGE
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  color: activeCommit.parentCommit ? 'var(--text-secondary)' : 'var(--text-muted)',
                  wordBreak: 'break-all',
                  marginTop: '2px'
                }}
              >
                {activeCommit.parentCommit || '(None — Initial Root Baseline)'}
              </div>
            </div>
          </div>

          {/* Author & Timestamp */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              AUTHOR
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px' }}>
              {activeCommit.author}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {new Date(activeCommit.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Manifest Integrity */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)'
              }}
            >
              <span>MANIFEST MANIFESTATION</span>
              <span style={{ color: 'var(--color-success)' }}>VERIFIED</span>
            </div>
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {activeCommit.treeSnapshot.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: item === activeFile.path ? 'var(--accent-copper)' : 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  * {item}
                </div>
              ))}
            </div>
          </div>

          {/* Revert Action */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <button
              onClick={() => onRevertToCommit(activeCommit)}
              className="btn btn-secondary font-mono"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <IconRevert size={13} style={{ color: 'var(--accent-copper)' }} />
              <span>REVERT WORKSPACE TO THIS</span>
            </button>
            <p
              style={{
                fontSize: '10.5px',
                color: 'var(--text-muted)',
                lineHeight: 1.35,
                marginTop: '6px',
                textAlign: 'center'
              }}
            >
              Preserves uncommitted & untracked files outside snapshot manifest.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};
