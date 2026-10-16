import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@primer/react';
import { MOCK_REPOSITORIES, MOCK_ISSUES } from './data/mockData';
import { GitHubHeader } from './components/GitHub/GitHubHeader';
import { RepoHeader } from './components/GitHub/RepoHeader';
import { RepoCodeView } from './components/GitHub/RepoCodeView';
import { FileViewer } from './components/GitHub/FileViewer';
import { CommitHistoryView } from './components/GitHub/CommitHistoryView';
import { IssuesView } from './components/GitHub/IssuesView';
import { RepoSettingsView } from './components/GitHub/RepoSettingsView';
import { SnapshotInspector } from './components/GitHub/SnapshotInspector';
import { DashboardView } from './components/GitHub/DashboardView';
import { SafeRevertDialog } from './components/GitHub/SafeRevertDialog';
import { NewRepoDialog } from './components/GitHub/NewRepoDialog';

export default function App() {
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'light'
  const [currentView, setCurrentView] = useState('repo'); // 'dashboard' | 'repo' | 'issues' | 'lineage'
  const [activeRepoTab, setActiveRepoTab] = useState('code'); // 'code' | 'issues' | 'lineage' | 'snapshots' | 'settings'
  const [selectedFile, setSelectedFile] = useState(null);

  const [repositories, setRepositories] = useState(MOCK_REPOSITORIES);
  const [currentRepo, setCurrentRepo] = useState(MOCK_REPOSITORIES[0]);
  const [issues, setIssues] = useState(MOCK_ISSUES);

  // Dialog states
  const [isNewRepoOpen, setIsNewRepoOpen] = useState(false);
  const [isRevertOpen, setIsRevertOpen] = useState(false);
  const [revertTargetCommit, setRevertTargetCommit] = useState(null);

  const [user] = useState({
    username: 'sudharshan',
    email: 'sudharshan@gitforge.local'
  });

  // Keep body data-color-mode synced
  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectRepo = (repo) => {
    setCurrentRepo(repo);
    setSelectedFile(null);
    setActiveRepoTab('code');
    setCurrentView('repo');
  };

  const handleOpenRevert = (commit) => {
    setRevertTargetCommit(commit || currentRepo.commits[0]);
    setIsRevertOpen(true);
  };

  const handleConfirmRevert = (commit) => {
    setRepositories((prev) =>
      prev.map((r) =>
        r.id === currentRepo.id
          ? { ...r, headCommitId: commit.id, lastModified: new Date().toISOString() }
          : r
      )
    );
    setCurrentRepo((prev) => ({
      ...prev,
      headCommitId: commit.id,
      lastModified: new Date().toISOString()
    }));
  };

  const handleCreateRepo = (newRepo) => {
    setRepositories((prev) => [newRepo, ...prev]);
    setCurrentRepo(newRepo);
    setSelectedFile(null);
    setActiveRepoTab('code');
    setCurrentView('repo');
  };

  const handleCreateIssue = (newIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
  };

  const handleRenameRepo = (newName) => {
    setRepositories((prev) =>
      prev.map((r) => (r.id === currentRepo.id ? { ...r, name: newName } : r))
    );
    setCurrentRepo((prev) => ({ ...prev, name: newName }));
  };

  return (
    <ThemeProvider colorMode={themeMode === 'dark' ? 'night' : 'day'}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--gh-bg-default)' }}>
        {/* GitHub Global Header */}
        <GitHubHeader
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            if (view === 'issues') setActiveRepoTab('issues');
            if (view === 'lineage') setActiveRepoTab('lineage');
          }}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          onOpenNewRepo={() => setIsNewRepoOpen(true)}
          user={user}
        />

        {/* Global Dashboard View */}
        {currentView === 'dashboard' && (
          <DashboardView
            repositories={repositories}
            onSelectRepo={handleSelectRepo}
            onOpenNewRepo={() => setIsNewRepoOpen(true)}
          />
        )}

        {/* Repository Context View (Code, Issues, Lineage, Snapshots, Settings) */}
        {currentView !== 'dashboard' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <RepoHeader
              currentRepo={currentRepo}
              activeTab={activeRepoTab}
              onTabChange={(tab) => {
                setActiveRepoTab(tab);
                setSelectedFile(null);
                setCurrentView('repo');
              }}
              issuesCount={issues.filter((i) => i.status === 'open').length}
            />

            <div style={{ flex: 1 }}>
              {activeRepoTab === 'code' && (
                selectedFile ? (
                  <FileViewer
                    file={selectedFile}
                    repoName={currentRepo.name}
                    onBack={() => setSelectedFile(null)}
                  />
                ) : (
                  <RepoCodeView
                    repo={currentRepo}
                    onSelectFile={(f) => setSelectedFile(f)}
                    onViewCommits={() => setActiveRepoTab('lineage')}
                  />
                )
              )}

              {activeRepoTab === 'issues' && (
                <IssuesView
                  issues={issues}
                  onCreateIssue={handleCreateIssue}
                />
              )}

              {activeRepoTab === 'lineage' && (
                <CommitHistoryView
                  repo={currentRepo}
                  onBrowseSnapshot={(commit) => {
                    setActiveRepoTab('code');
                    setSelectedFile(null);
                  }}
                  onRevertCommit={handleOpenRevert}
                />
              )}

              {activeRepoTab === 'snapshots' && (
                <SnapshotInspector
                  repo={currentRepo}
                  onOpenRevert={handleOpenRevert}
                />
              )}

              {activeRepoTab === 'settings' && (
                <RepoSettingsView
                  repo={currentRepo}
                  onUpdateRepoName={handleRenameRepo}
                />
              )}
            </div>
          </div>
        )}

        {/* GitHub Global Dialogs */}
        <SafeRevertDialog
          isOpen={isRevertOpen}
          commit={revertTargetCommit}
          onClose={() => setIsRevertOpen(false)}
          onConfirmRevert={handleConfirmRevert}
        />

        <NewRepoDialog
          isOpen={isNewRepoOpen}
          onClose={() => setIsNewRepoOpen(false)}
          onCreateRepo={handleCreateRepo}
        />
      </div>
    </ThemeProvider>
  );
}
