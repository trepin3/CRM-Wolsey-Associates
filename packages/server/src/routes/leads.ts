import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// GET /leads - list leads for the authenticated user's agency (supports cursor pagination)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.agencyId) return res.status(403).json({ ok: false, error: 'No agency assigned' });

    const querySchema = z.object({
      limit: z.preprocess((v) => parseInt(String(v || '0'), 10), z.number().int().positive()).optional(),
      cursor: z.string().optional(),
    });

    const qp = querySchema.safeParse(req.query);
    if (!qp.success) return res.status(400).json({ ok: false, error: 'Invalid query parameters' });

    const limit = Math.min(qp.data.limit || 20, 100);
    const cursor = qp.data.cursor;

    const where: any = { agencyId: user.agencyId };
    if (cursor) {
      // cursor is ISO timestamp string; fetch leads created before the cursor
      const cursorDate = new Date(cursor);
      where.createdAt = { lt: cursorDate };
    }

    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit + 1 });

    let nextCursor: string | null = null;
    if (leads.length > limit) {
      const last = leads[limit - 1];
      nextCursor = last.createdAt.toISOString();
      leads.splice(limit, 1);
    }

    res.json({ ok: true, leads, nextCursor });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /leads - create a new lead (assigns to user's agency)
const LeadCreateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  age: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().int().positive()).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.agencyId) return res.status(403).json({ ok: false, error: 'No agency assigned' });
    const parsed = LeadCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: 'Invalid lead payload' });
    const { firstName, lastName, email, address, age, source, notes } = parsed.data;

    const lead = await prisma.lead.create({ data: { firstName, lastName, email, address, age: age || null, source, notes, agencyId: user.agencyId } });
    res.status(201).json({ ok: true, lead });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PATCH /leads/:id - update lead fields (only within same agency)
const LeadUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  age: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().int().positive()).optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  pdfUrl: z.string().url().optional(),
  source: z.string().optional(),
}).partial();

router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.agencyId) return res.status(403).json({ ok: false, error: 'No agency assigned' });

    const { id } = req.params;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing || existing.agencyId !== user.agencyId) return res.status(404).json({ ok: false, error: 'Lead not found' });
    const parsed = LeadUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: 'Invalid update payload' });
    const data = parsed.data as any;

    const updated = await prisma.lead.update({ where: { id }, data });
    res.json({ ok: true, lead: updated });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /leads/:id - delete lead (admin or founder only)
router.delete('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Lead not found' });
    await prisma.lead.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
