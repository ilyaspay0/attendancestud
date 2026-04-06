import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const DATA_FILE = path.join(process.cwd(), 'data.json');

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }
  return { students: [], sessions: [], modules: [] };
}

function saveData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  let { students, sessions, modules } = loadData();

  // API Routes
  app.get('/api/students', (req, res) => {
    res.json(students);
  });

  app.post('/api/students', (req, res) => {
    students = req.body;
    saveData({ students, sessions, modules });
    res.json({ success: true });
  });

  app.get('/api/sessions', (req, res) => {
    res.json(sessions);
  });

  app.get('/api/sessions/:id', (req, res) => {
    const session = sessions.find(s => s.id === req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  });

  app.post('/api/sessions', (req, res) => {
    const newSession = req.body;
    sessions.push(newSession);
    saveData({ students, sessions, modules });
    res.json(newSession);
  });

  app.put('/api/sessions/:id', (req, res) => {
    const { id } = req.params;
    const updatedSession = req.body;
    sessions = sessions.map(s => s.id === id ? updatedSession : s);
    saveData({ students, sessions, modules });
    res.json(updatedSession);
  });

  app.get('/api/modules', (req, res) => {
    res.json(modules || []);
  });

  app.post('/api/modules', (req, res) => {
    modules = req.body;
    saveData({ students, sessions, modules });
    res.json({ success: true });
  });

  app.post('/api/check-in', (req, res) => {
    const { sessionId, fullName } = req.body;
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.isFinalized) {
      return res.status(400).json({ error: 'Session is already finalized' });
    }

    if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
      return res.status(400).json({ error: 'Session has expired' });
    }

    // Find student by name within the session's group
    const student = students.find(s => 
      s.name.toLowerCase() === fullName.toLowerCase() && 
      s.group.toLowerCase() === session.group.toLowerCase()
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found in this group' });
    }

    if (!session.presentStudents.includes(student.id)) {
      session.presentStudents.push(student.id);
      saveData({ students, sessions, modules });
    }

    res.json({ success: true, session });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
