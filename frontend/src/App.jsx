import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RepoHeader from './components/RepoHeader';
import CodeExplorer from './components/CodeExplorer';
import IssuesTab from './components/IssuesTab';
import PullRequestsTab from './components/PullRequestsTab';
import BackendStatusCard from './components/BackendStatusCard';

export default function App() {
  const [activeTab, setActiveTab] = useState('code');
  const [backendOnline, setBackendOnline] = useState(false);
  const [repoInfo, setRepoInfo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [prs, setPrs] = useState([]);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/health');
      if (res.ok) {
        setBackendOnline(true);
        // Fetch repo info, issues, prs from Express API
        const repoRes = await fetch('http://localhost:5000/api/repo');
        if (repoRes.ok) setRepoInfo(await repoRes.ok ? await repoRes.json() : null);

        const issuesRes = await fetch('http://localhost:5000/api/issues');
        if (issuesRes.ok) setIssues(await issuesRes.json());

        const prsRes = await fetch('http://localhost:5000/api/pull-requests');
        if (prsRes.ok) setPrs(await prsRes.json());
      } else {
        setBackendOnline(false);
      }
    } catch (err) {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} backendOnline={backendOnline} />
      
      <RepoHeader activeTab={activeTab} setActiveTab={setActiveTab} repoInfo={repoInfo} />

      <main style={{ flex: 1 }}>
        {activeTab === 'code' && <CodeExplorer repoInfo={repoInfo} />}
        {activeTab === 'issues' && <IssuesTab issues={issues} />}
        {activeTab === 'prs' && <PullRequestsTab prs={prs} />}
        {activeTab === 'commits' && <CodeExplorer repoInfo={repoInfo} />}
        {activeTab === 'backend' && <BackendStatusCard backendOnline={backendOnline} checkBackendHealth={checkBackendHealth} />}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.85rem',
        color: 'var(--text-dim)',
        marginTop: 'auto'
      }}>
        GitForge &copy; 2026 Pawar-Sudharshan. Built with React, Vite & Node.js Express.
      </footer>
    </div>
  );
}
