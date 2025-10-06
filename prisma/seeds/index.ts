import { PrismaClient } from '@prisma/client';
import { seedPartners } from './partner.seed';
import { seedUsers } from './user.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // Seed users first (partners might reference users)
    await seedUsers();
    
    // Seed partners
    await seedPartners();
    
    console.log('\n✨ All seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Database seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}

export { main as seedDatabase };
