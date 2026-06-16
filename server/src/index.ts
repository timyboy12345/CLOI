import express from 'express';
import cors from 'cors';
import multer from 'multer';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { Issuer, Strategy, Client } from 'openid-client';
import db from './db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'photo-viewer-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));

// Placeholder OIDC Config (Should be moved to .env)
const OIDC_ISSUER = process.env.OIDC_ISSUER || 'https://accounts.google.com';
const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID || 'your-client-id';
const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET || 'your-client-secret';
const REDIRECT_URI = 'http://localhost:3001/api/auth/callback';

let client: Client;

// Initialize OIDC Client
async function initOidc() {
  try {
    const issuer = await Issuer.discover(OIDC_ISSUER);
    client = new issuer.Client({
      client_id: OIDC_CLIENT_ID,
      client_secret: OIDC_CLIENT_SECRET,
      redirect_uris: [REDIRECT_URI],
      response_types: ['code'],
    });
    console.log('OIDC Client initialized');
  } catch (err) {
    console.error('OIDC Initialization failed:', err);
  }
}

initOidc();

// Auth Middleware
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if ((req.session as any).user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// --- Auth Routes ---
app.get('/api/auth/login', (req, res) => {
  if (!client) return res.status(500).send('OIDC not initialized');
  const url = client.authorizationUrl({
    scope: 'openid email profile',
  });
  res.redirect(url);
});

app.get('/api/auth/callback', async (req, res) => {
  if (!client) return res.status(500).send('OIDC not initialized');
  const params = client.callbackParams(req);
  try {
    const tokenSet = await client.callback(REDIRECT_URI, params);
    const userinfo = await client.userinfo(tokenSet);
    (req.session as any).user = userinfo;
    res.redirect('http://localhost:5173/admin');
  } catch (err) {
    console.error('Auth callback failed:', err);
    res.status(500).send('Authentication failed');
  }
});

app.get('/api/auth/me', (req, res) => {
  res.json((req.session as any).user || null);
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// --- Gallery Routes ---
app.get('/api/albums', (req, res) => {
  const albums = db.prepare('SELECT * FROM albums ORDER BY date DESC').all();
  res.json(albums);
});

app.get('/api/albums/:id', (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id);
  const photos = db.prepare('SELECT * FROM photos WHERE album_id = ?').all(req.params.id);
  res.json({ album, photos });
});

// --- Protected Routes ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.post('/api/albums', isAuthenticated, (req, res) => {
  const { name } = req.body;
  const info = db.prepare('INSERT INTO albums (name) VALUES (?)').run(name);
  res.json({ id: info.lastInsertRowid, name });
});

app.post('/api/albums/:id/upload', isAuthenticated, upload.array('photos'), (req, res) => {
  const albumId = req.params.id;
  const files = req.files as Express.Multer.File[];
  
  const insert = db.prepare('INSERT INTO photos (album_id, filename) VALUES (?, ?)');
  const transaction = db.transaction((photos: any[]) => {
    for (const photo of photos) insert.run(albumId, photo.filename);
  });

  transaction(files);
  res.json({ success: true, count: files.length });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
