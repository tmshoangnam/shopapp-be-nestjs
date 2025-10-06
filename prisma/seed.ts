import { PrismaClient } from '@prisma/client';
import { seedPartners } from './seeds/partner.seed';
import { seedUsers } from './seeds/user.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma seeding...\n');

  try {
    // Seed users first (partners might reference users)
    await seedUsers();
    
    // Seed partners
    await seedPartners();
    
    console.log('\n✨ Prisma seeding completed successfully!');
  } catch (error) {
    console.error('💥 Prisma seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  });
