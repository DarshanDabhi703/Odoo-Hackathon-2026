import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TransitOps database…');

  // ── Users ────────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'fleet@transitops.com' },
    update: {},
    create: { name: 'Fleet Manager', email: 'fleet@transitops.com', passwordHash: password, role: 'FleetManager' },
  });

  await prisma.user.upsert({
    where: { email: 'driver@transitops.com' },
    update: {},
    create: { name: 'Driver One', email: 'driver@transitops.com', passwordHash: password, role: 'Driver' },
  });

  await prisma.user.upsert({
    where: { email: 'safety@transitops.com' },
    update: {},
    create: { name: 'Safety Officer', email: 'safety@transitops.com', passwordHash: password, role: 'SafetyOfficer' },
  });

  await prisma.user.upsert({
    where: { email: 'finance@transitops.com' },
    update: {},
    create: { name: 'Financial Analyst', email: 'finance@transitops.com', passwordHash: password, role: 'FinancialAnalyst' },
  });

  console.log('✅ Seed complete! Default password for all: password123');
  console.log('');
  console.log('Accounts created:');
  console.log('  fleet@transitops.com    — FleetManager');
  console.log('  driver@transitops.com   — Driver');
  console.log('  safety@transitops.com   — SafetyOfficer');
  console.log('  finance@transitops.com  — FinancialAnalyst');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
