import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Find existing agency by name, create if not found. `name` is not a unique field
  // in the schema, so using `upsert` with `where: { name }` is invalid.
  let agency = await prisma.agency.findFirst({ where: { name: 'Wolsey & Associates' } });
  if (!agency) {
    agency = await prisma.agency.create({ data: { name: 'Wolsey & Associates', ownerId: 'seed-owner' } });
  }

  const plainPassword = process.env.SEED_PASSWORD || 'password123';
  const saltRounds = 10;
  const hashed = await bcrypt.hash(plainPassword, saltRounds);

  await prisma.user.upsert({
    where: { email: 'founder@wolsey.test' },
    update: { passwordHash: hashed },
    create: { email: 'founder@wolsey.test', passwordHash: hashed, role: 'founder', agencyId: agency.id }
  });

  console.log('Seed complete (founder@wolsey.test). Password:', process.env.SEED_PASSWORD ? '(from SEED_PASSWORD)' : plainPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
