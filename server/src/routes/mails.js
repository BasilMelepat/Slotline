import { Router } from 'express';
import mongoose from 'mongoose';
import Mail from '../models/Mail.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Validates a request body and returns only the fields a client may set. */
function clean(body) {
  const mail = String(body?.mail ?? '').trim();
  if (!EMAIL_RE.test(mail) || mail.length > 254) return { error: 'Enter a full mail id, like name@company.com.' };

  const activeNow = body.activeNow === true;
  const start = activeNow ? '' : String(body.start ?? '');
  if (!activeNow && !TIME_RE.test(start)) return { error: 'Enter a valid start time.' };

  const at = activeNow ? 0 : Number(body.at);
  if (!activeNow && !Number.isFinite(at)) return { error: 'Missing countdown time.' };

  const seen = new Set();
  const projects = [];
  for (const p of Array.isArray(body.projects) ? body.projects.slice(0, 50) : []) {
    const name = String(p?.name ?? '').trim().slice(0, 60);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    projects.push({ name, active: p.active === true });
  }

  return {
    value: {
      mail,
      mailKey: mail.toLowerCase(),
      start,
      at,
      activeNow,
      note: String(body.note ?? '').trim().slice(0, 500),
      projects,
    },
  };
}

function badId(id) {
  return !mongoose.isValidObjectId(id);
}

router.get('/', async (req, res, next) => {
  try {
    const items = await Mail.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { value, error } = clean(req.body);
    if (error) return res.status(400).json({ error });
    const item = await Mail.create({ ...value, user: req.userId });
    res.status(201).json({ item });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'This mail id is already in your list.' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ error: 'Mail not found.' });
    const { value, error } = clean(req.body);
    if (error) return res.status(400).json({ error });
    const item = await Mail.findOneAndUpdate({ _id: req.params.id, user: req.userId }, value, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Mail not found.' });
    res.json({ item });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'This mail id is already in your list.' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ error: 'Mail not found.' });
    const gone = await Mail.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!gone) return res.status(404).json({ error: 'Mail not found.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/** Uploads a list saved on the device. Mail ids already in the account are skipped. */
router.post('/bulk', async (req, res, next) => {
  try {
    const incoming = Array.isArray(req.body?.items) ? req.body.items.slice(0, 500) : [];
    let created = 0;
    let skipped = 0;
    for (const raw of incoming) {
      const { value } = clean(raw);
      if (!value) { skipped++; continue; }
      try {
        await Mail.create({ ...value, user: req.userId });
        created++;
      } catch (err) {
        if (err?.code === 11000) skipped++;
        else throw err;
      }
    }
    const items = await Mail.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json({ created, skipped, items });
  } catch (err) {
    next(err);
  }
});

export default router;
