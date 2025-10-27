// apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo',
      email: 'demo@example.com',
      role: 'customer',
      passwordHash: 'demo', // NOTE: demo only
      phone: '555-0100',
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: user.id,
      make: 'Tesla',
      model: 'Model Y',
      year: 2022,
      trim: 'LR',
      tireSize: '255/45R19',
    },
  });

  const slotStart = new Date(Date.now() + 5 * 24 * 3600 * 1000);
  const slotEnd = new Date(slotStart.getTime() + 90 * 60 * 1000);

  const appt = await prisma.appointment.create({
    data: {
      userId: user.id,
      vehicleId: vehicle.id,
      address: '1234 Anywhere St, Toronto, ON',
      slotStart,
      slotEnd,
      scheduleState: 'DRAFT',
      dispatchStatus: 'UNASSIGNED',
      schedulingMode: 'WINDOW',
      services: {
        create: [
          {
            kind: 'MOUNT_BALANCE',
            name: 'Mount & Balance 4 tires',
            qty: 1,
            unitPrice: 12000,
          },
        ],
      },
    },
    include: { user: true, vehicle: true, services: true },
  });

  console.log('Seed OK:', appt.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
