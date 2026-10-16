import React, { useState } from 'react';
import {
  AlertIcon,
  CheckIcon,
  HistoryIcon
} from '@primer/octicons-react';

export const SafeRevertDialog = ({
  isOpen,
  commit,
  onClose,
  onConfirmRevert
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !commit) return null;

  const handleExecute = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onConfirmRevert(commit);
        onClose();
      }, 1200);
    }, 700);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(1, 4, 9, 0.75)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 350,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--gh-bg-default)',
          border: '1px solid var(--gh-border-default)',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(1,4,9,0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--gh-bg-subtle)',
            padding: '14px 18px',
            borderBottom: '1px solid var(--gh-border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HistoryIcon size={16} />
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              Confirm Safe Revert to Snapshot
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--gh-fg-muted)', cursor: 'pointer' }}
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '13px', color: 'var(--gh-fg-default)' }}>
            Are you sure you want to revert your working directory to snapshot{' '}
            <strong className="gh-mono">{commit.shortId}</strong>?
          </div>

          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--gh-bg-subtle)',
              border: '1px solid var(--gh-border-default)',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'var(--github-font-mono)'
            }}
          >
            <div>Message: "{commit.message}"</div>
            <div style={{ color: 'var(--gh-fg-muted)', marginTop: '4px' }}>
              Timestamp: {new Date(commit.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Phase 2 Safety Guarantee Box */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(56, 139, 253, 0.1)',
              border: '1px solid rgba(56, 139, 253, 0.3)',
              borderRadius: '6px',
              fontSize: '12px',
              lineHeight: 1.5,
              color: 'var(--gh-fg-default)'
            }}
          >
            <div style={{ fontWeight: 600, color: '#58a6ff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertIcon size={14} />
              <span>Phase 2 DVCS Safety Guarantee</span>
            </div>
            <ul style={{ paddingLeft: '16px', margin: 0 }}>
              <li>Untracked workspace files are <strong>strictly preserved</strong>.</li>
              <li>Only files present in the snapshot manifest will be restored.</li>
              <li>Local HEAD pointer will be updated to <code>{commit.shortId}</code>.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--gh-border-muted)', paddingTop: '14px' }}>
            <button
              onClick={onClose}
              className="gh-btn"
              disabled={isProcessing}
            >
              Cancel
            </button>

            <button
              onClick={handleExecute}
              className="gh-btn gh-btn-primary"
              disabled={isProcessing || success}
            >
              {success ? (
                <>
                  <CheckIcon size={14} />
                  <span>Revert complete</span>
                </>
              ) : isProcessing ? (
                <span>Restoring snapshot...</span>
              ) : (
                <span>Revert to this snapshot</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
