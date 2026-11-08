import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import mailRoutes from './routes/mails.js';

const { MONGODB_URI, JWT_SECRET, PORT = 5000, CLIENT_ORIGIN = '', NODE_ENV } = process.env;

if (!MONGODB_URI) throw new Error('MONGODB_URI is not set. Copy server/.env.example to server/.env and fill it in.');
if (!JWT_SECRET || JWT_SECRET === 'change-me') {
  if (NODE_ENV === 'production') throw new Error('Set a long random JWT_SECRET before running in production.');
  console.warn('Warning: JWT_SECRET is missing or still "change-me". Set a real secret in server/.env.');
  process.env.JWT_SECRET ||= 'change-me';
}

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));

const origins = CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
if (origins.length) app.use('/api', cors({ origin: origins }));

const { version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

app.get('/api/health', (_req, res) => res.json({ ok: true, version }));
app.use('/api/auth', authRoutes);
app.use('/api/mails', mailRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// In production the server also serves the built client.
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(dist, 'index.html'));
  });
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

await mongoose.connect(MONGODB_URI);
app.listen(PORT, () => console.log(`Slotline API listening on http://localhost:${PORT}`));
