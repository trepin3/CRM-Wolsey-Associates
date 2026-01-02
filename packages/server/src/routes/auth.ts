import express from 'express';
import { registerUser, authenticateUser, refreshTokens } from '../auth/auth.service';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, agencyId } = req.body;
    const user = await registerUser(email, password, role, agencyId);
    res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const auth = await authenticateUser(email, password);
    if (!auth) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    res.json({ ok: true, user: { id: auth.user.id, email: auth.user.email, role: auth.user.role }, tokens: { access: auth.accessToken, refresh: auth.refreshToken } });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshTokens(refreshToken);
    res.json({ ok: true, tokens });
  } catch (err: any) {
    res.status(401).json({ ok: false, error: err.message });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ ok: false, error: 'Not authenticated' });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    const { id, email, role, agencyId, createdAt, lastLogin } = user;
    res.json({ ok: true, user: { id, email, role, agencyId, createdAt, lastLogin } });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
