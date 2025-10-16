#!/usr/bin/env ts-node

/**
 * Complete Database Seeding Script
 * 
 * This script seeds all database tables with realistic test data.
 * Run with: npm run seed:all
 */

import { execSync } from 'child_process';
import { join } from 'path';

async function runSeeding() {
  console.log('🌱 Starting complete database seeding...\n');

  try {
    // Run the main seeding script
    const seedScriptPath = join(__dirname, '../prisma/seeds/index.ts');
    
    console.log('📝 Running database seeding...');
    execSync(`npx ts-node "${seedScriptPath}"`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n🎯 Next steps:');
    console.log('   1. Start the application: npm run start:dev');
    console.log('   2. Visit Swagger docs: http://localhost:3000/api');
    console.log('   3. Test the Booking APIs with the seeded data');
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('   Super Admin: admin@shopapp.com / Admin123!');
    console.log('   Admin: admin2@shopapp.com / Admin123!');
    console.log('   Staff: staff@shopapp.com / Staff123!');
    console.log('   User: john.doe@example.com / User123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  runSeeding();
}

export { runSeeding };



