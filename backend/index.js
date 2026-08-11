import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock database / state for GitForge
const repositoryData = {
  name: "GitForge",
  owner: "Pawar-Sudharshan",
  url: "https://github.com/Pawar-Sudharshan/GitForge",
  description: "Next-Generation Open Source Developer Collaboration Platform & Code Forge",
  stars: 142,
  forks: 28,
  watchers: 35,
  defaultBranch: "main",
  branches: ["main", "feature/frontend-ui", "feature/backend-api", "fix/auth-flow"],
  tags: ["v1.0.0", "v0.9.0-beta"],
  latestCommit: {
    hash: "0de3996",
    message: "Initial project setup & directory structure (frontend + backend)",
    author: "Pawar-Sudharshan",
    date: "Just now"
  }
};

const mockIssues = [
  { id: 1, title: "Add authentication middleware in backend", author: "Pawar-Sudharshan", status: "open", labels: ["enhancement", "backend"], comments: 4, createdAt: "2 hours ago" },
  { id: 2, title: "Dark mode theme toggle flickering on initial render", author: "alex_dev", status: "open", labels: ["bug", "frontend"], comments: 2, createdAt: "5 hours ago" },
  { id: 3, title: "Setup automated CI/CD workflow pipeline", author: "devops_pro", status: "closed", labels: ["devops", "ci/cd"], comments: 7, createdAt: "1 day ago" }
];

const mockPullRequests = [
  { id: 101, title: "feat: Initialize React Vite frontend & Express backend", author: "Pawar-Sudharshan", branch: "feature/frontend-ui", target: "main", status: "open", reviews: "Approved", createdAt: "Just now" },
  { id: 102, title: "refactor: Modernize UI layout with glassmorphism design system", author: "designer_ui", branch: "feature/glass-ui", target: "main", status: "merged", reviews: "Approved", createdAt: "Yesterday" }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GitForge API is running smoothly 🚀', timestamp: new Date() });
});

app.get('/api/repo', (req, res) => {
  res.json(repositoryData);
});

app.get('/api/issues', (req, res) => {
  res.json(mockIssues);
});

app.get('/api/pull-requests', (req, res) => {
  res.json(mockPullRequests);
});

app.listen(PORT, () => {
  console.log(`⚡ GitForge Backend Server listening on http://localhost:${PORT}`);
});
