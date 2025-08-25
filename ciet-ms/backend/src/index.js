import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { nanoid } from 'nanoid';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// ---- In-memory stores (replace with a real DB) ----
const db = {
  projects: [],       // {id, name, code, program, address:{city,zone,woreda}, directorName, active, siteUrl, credentials}
  caregivers: [],     // {id, fullName, gender, dob, childName, childProjectNumber, address, contact, photoUrl, projectId, uniqueId}
  funds: [],          // {id, projectId, caregiverId, amount, currency, purpose, allocatedAt}
  activities: []      // {id, caregiverId, projectId, title, description, evidenceUrls, amountSpent, status, reportedAt}
};

// ---- Simple role middleware (demo only) ----
function requireRole(roles) {
  return (req, res, next) => {
    const role = (req.headers['x-user-role'] || 'guest').toLowerCase();
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// ---- Helpers ----
function findProject(id) {
  return db.projects.find(p => p.id === id);
}

// ---- Routes ----
app.get('/api/health', (_, res) => res.json({ ok: true }));

// Projects
app.post('/api/projects', requireRole(['admin']), (req, res) => {
  const { name, code, program, address = {}, directorName } = req.body || {};
  if (!name || !code) return res.status(400).json({ error: 'name and code are required' });
  const exists = db.projects.some(p => p.code === code);
  if (exists) return res.status(409).json({ error: 'Project code already exists' });

  const project = {
    id: nanoid(12),
    name, code, program: program || null,
    address: {
      city: address.city || null,
      zone: address.zone || address.subcity || null,
      woreda: address.woreda || null
    },
    directorName: directorName || null,
    active: true,
    siteUrl: `https://portal.ciet.example/${code}`,
    credentials: {
      username: `${code.toLowerCase()}_admin`,
      // NEVER store plain text passwords in real apps.
      password: nanoid(10)
    }
  };
  db.projects.push(project);
  res.status(201).json(project);
});

app.get('/api/projects', requireRole(['admin', 'director', 'employee']), (req, res) => {
  const { active } = req.query;
  let items = db.projects;
  if (active === 'true') items = items.filter(p => p.active);
  if (active === 'false') items = items.filter(p => !p.active);
  res.json(items);
});

app.patch('/api/projects/:id/status', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  const p = findProject(id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  p.active = !!active;
  res.json({ id: p.id, active: p.active });
});

// Caregivers
app.post('/api/caregivers', requireRole(['director', 'employee']), (req, res) => {
  const { fullName, gender, dob, childName, childProjectNumber, address = {}, contact = {}, photoUrl, projectId } = req.body || {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  const proj = findProject(projectId);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  if (!proj.active) return res.status(403).json({ error: 'Project is inactive' });
  if (!fullName) return res.status(400).json({ error: 'fullName is required' });

  const caregiver = {
    id: nanoid(12),
    uniqueId: `CG-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
    projectId,
    fullName, gender: gender || null, dob: dob || null,
    childName: childName || null, childProjectNumber: childProjectNumber || null,
    address: {
      city: address.city || null,
      zone: address.zone || address.subcity || null,
      woreda: address.woreda || null
    },
    contact: {
      phone: contact.phone || null,
      email: contact.email || null
    },
    photoUrl: photoUrl || null
  };
  db.caregivers.push(caregiver);
  res.status(201).json(caregiver);
});

app.get('/api/caregivers', requireRole(['admin', 'director', 'employee']), (req, res) => {
  const { projectId } = req.query;
  let items = db.caregivers;
  if (projectId) items = items.filter(c => c.projectId === projectId);
  res.json(items);
});

// Funds
app.post('/api/funds', requireRole(['director', 'employee']), (req, res) => {
  const { projectId, caregiverId, amount, currency = 'ETB', purpose } = req.body || {};
  const proj = findProject(projectId);
  const cg = db.caregivers.find(c => c.id === caregiverId);
  if (!proj || !cg) return res.status(404).json({ error: 'Project or Caregiver not found' });
  if (!proj.active) return res.status(403).json({ error: 'Project is inactive' });
  if (!amount || amount <= 0) return res.status(400).json({ error: 'amount must be > 0' });

  const fund = {
    id: nanoid(12),
    projectId, caregiverId, amount, currency, purpose: purpose || null,
    allocatedAt: new Date().toISOString()
  };
  db.funds.push(fund);
  res.status(201).json(fund);
});

app.get('/api/funds', requireRole(['admin', 'director', 'employee']), (req, res) => {
  const { projectId, caregiverId } = req.query;
  let items = db.funds;
  if (projectId) items = items.filter(x => x.projectId === projectId);
  if (caregiverId) items = items.filter(x => x.caregiverId === caregiverId);
  res.json(items);
});

// Activities
app.post('/api/activities', requireRole(['director', 'employee']), (req, res) => {
  const { projectId, caregiverId, title, description, evidenceUrls = [], amountSpent = 0, status = 'Submitted' } = req.body || {};
  const proj = findProject(projectId);
  const cg = db.caregivers.find(c => c.id === caregiverId);
  if (!proj || !cg) return res.status(404).json({ error: 'Project or Caregiver not found' });
  if (!title) return res.status(400).json({ error: 'title is required' });

  const act = {
    id: nanoid(12),
    projectId, caregiverId, title, description: description || null,
    evidenceUrls, amountSpent, status, reportedAt: new Date().toISOString()
  };
  db.activities.push(act);
  res.status(201).json(act);
});

app.get('/api/activities', requireRole(['admin', 'director', 'employee']), (req, res) => {
  const { projectId, caregiverId } = req.query;
  let items = db.activities;
  if (projectId) items = items.filter(x => x.projectId === projectId);
  if (caregiverId) items = items.filter(x => x.caregiverId === caregiverId);
  res.json(items);
});

// Simple dashboard summary
app.get('/api/dashboard/summary', requireRole(['admin']), (req, res) => {
  const totalProjects = db.projects.length;
  const activeProjects = db.projects.filter(p => p.active).length;
  const totalCaregivers = db.caregivers.length;
  const totalEmployees = 0; // left for future implementation
  res.json({ totalProjects, activeProjects, totalCaregivers, totalEmployees });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
