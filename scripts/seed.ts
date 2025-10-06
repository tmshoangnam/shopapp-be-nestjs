#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import { join } from 'path';

/**
 * Database seeding script
 * This script runs the seeding process for the application
 */

const projectRoot = join(__dirname, '..');

function runCommand(command: string, description: string) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { 
      cwd: projectRoot, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    console.log(`✅ ${description} completed!`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error);
    process.exit(1);
  }
}

async function main() {
  console.log('🌱 Starting database seeding process...\n');

  try {
    // Generate Prisma client
    runCommand('npx prisma generate', 'Generating Prisma client');

    // Run seeding
    runCommand('npx ts-node prisma/seeds/index.ts', 'Running database seeding');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start your application: npm run start:dev');
    console.log('   2. Check the database to verify seeded data');
    console.log('   3. Test the API endpoints with the new data');

  } catch (error) {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

export { main as runSeeding };
