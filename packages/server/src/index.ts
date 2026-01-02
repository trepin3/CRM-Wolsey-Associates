import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/ping-db', async (_req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as pong`;
    res.json({ db: true, result });
  } catch (err) {
    res.status(500).json({ db: false, error: String(err) });
  }
});

app.use('/auth', authRoutes);
app.use('/leads', leadsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
