import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const userData = [
  // Admin users
  {
    email: 'admin@shopapp.com',
    password: 'Admin123!',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+1-555-0001',
    role: Role.SUPER_ADMIN,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'admin2@shopapp.com',
    password: 'Admin123!',
    firstName: 'John',
    lastName: 'Admin',
    phone: '+1-555-0002',
    role: Role.ADMIN,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'staff@shopapp.com',
    password: 'Staff123!',
    firstName: 'Jane',
    lastName: 'Staff',
    phone: '+1-555-0003',
    role: Role.STAFF,
    isActive: true,
    isVerified: true,
  },

  // Regular users
  {
    email: 'john.doe@example.com',
    password: 'User123!',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-0101',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'jane.smith@example.com',
    password: 'User123!',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1-555-0102',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'mike.johnson@example.com',
    password: 'User123!',
    firstName: 'Mike',
    lastName: 'Johnson',
    phone: '+1-555-0103',
    role: Role.USER,
    isActive: true,
    isVerified: false,
  },
  {
    email: 'sarah.wilson@example.com',
    password: 'User123!',
    firstName: 'Sarah',
    lastName: 'Wilson',
    phone: '+1-555-0104',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'david.brown@example.com',
    password: 'User123!',
    firstName: 'David',
    lastName: 'Brown',
    phone: '+1-555-0105',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'lisa.garcia@example.com',
    password: 'User123!',
    firstName: 'Lisa',
    lastName: 'Garcia',
    phone: '+1-555-0106',
    role: Role.USER,
    isActive: true,
    isVerified: false,
  },
  {
    email: 'robert.miller@example.com',
    password: 'User123!',
    firstName: 'Robert',
    lastName: 'Miller',
    phone: '+1-555-0107',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'emily.davis@example.com',
    password: 'User123!',
    firstName: 'Emily',
    lastName: 'Davis',
    phone: '+1-555-0108',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'chris.rodriguez@example.com',
    password: 'User123!',
    firstName: 'Chris',
    lastName: 'Rodriguez',
    phone: '+1-555-0109',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'amanda.martinez@example.com',
    password: 'User123!',
    firstName: 'Amanda',
    lastName: 'Martinez',
    phone: '+1-555-0110',
    role: Role.USER,
    isActive: true,
    isVerified: false,
  },
  {
    email: 'james.hernandez@example.com',
    password: 'User123!',
    firstName: 'James',
    lastName: 'Hernandez',
    phone: '+1-555-0111',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'jessica.lopez@example.com',
    password: 'User123!',
    firstName: 'Jessica',
    lastName: 'Lopez',
    phone: '+1-555-0112',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'daniel.gonzalez@example.com',
    password: 'User123!',
    firstName: 'Daniel',
    lastName: 'Gonzalez',
    phone: '+1-555-0113',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'ashley.wilson@example.com',
    password: 'User123!',
    firstName: 'Ashley',
    lastName: 'Wilson',
    phone: '+1-555-0114',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'matthew.anderson@example.com',
    password: 'User123!',
    firstName: 'Matthew',
    lastName: 'Anderson',
    phone: '+1-555-0115',
    role: Role.USER,
    isActive: true,
    isVerified: false,
  },
  {
    email: 'sophia.thomas@example.com',
    password: 'User123!',
    firstName: 'Sophia',
    lastName: 'Thomas',
    phone: '+1-555-0116',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'william.taylor@example.com',
    password: 'User123!',
    firstName: 'William',
    lastName: 'Taylor',
    phone: '+1-555-0117',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'olivia.moore@example.com',
    password: 'User123!',
    firstName: 'Olivia',
    lastName: 'Moore',
    phone: '+1-555-0118',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },

  // Inactive users
  {
    email: 'inactive.user@example.com',
    password: 'User123!',
    firstName: 'Inactive',
    lastName: 'User',
    phone: '+1-555-0199',
    role: Role.USER,
    isActive: false,
    isVerified: true,
  },
  {
    email: 'suspended.user@example.com',
    password: 'User123!',
    firstName: 'Suspended',
    lastName: 'User',
    phone: '+1-555-0198',
    role: Role.USER,
    isActive: false,
    isVerified: false,
  },

  // OAuth users (without passwords)
  {
    email: 'google.user@gmail.com',
    password: null,
    firstName: 'Google',
    lastName: 'User',
    phone: '+1-555-0201',
    googleId: 'google_oauth_id_123',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'facebook.user@facebook.com',
    password: null,
    firstName: 'Facebook',
    lastName: 'User',
    phone: '+1-555-0202',
    facebookId: 'facebook_oauth_id_123',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
  {
    email: 'github.user@github.com',
    password: null,
    firstName: 'GitHub',
    lastName: 'User',
    phone: '+1-555-0203',
    githubId: 'github_oauth_id_123',
    role: Role.USER,
    isActive: true,
    isVerified: true,
  },
];

export async function seedUsers() {
  console.log('🌱 Starting user seeding...');

  try {
    // Clear existing users (optional - remove if you want to keep existing data)
    await prisma.user.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Hash passwords for users that have them
    const usersWithHashedPasswords = await Promise.all(
      userData.map(async (user) => {
        if (user.password) {
          const hashedPassword = await bcrypt.hash(user.password, 12);
          return {
            ...user,
            password: hashedPassword,
          };
        }
        return user;
      }),
    );

    // Create users
    const createdUsers = await prisma.user.createMany({
      data: usersWithHashedPasswords,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${createdUsers.count} users successfully!`);

    // Display summary
    const userStats = await prisma.user.groupBy({
      by: ['role', 'isActive', 'isVerified'],
      _count: {
        id: true,
      },
    });

    console.log('\n📊 User Summary:');
    
    const roleCounts = await Promise.all([
      prisma.user.count({ where: { role: Role.SUPER_ADMIN } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { role: Role.STAFF } }),
      prisma.user.count({ where: { role: Role.USER } }),
    ]);

    console.log(`   Super Admin: ${roleCounts[0]}`);
    console.log(`   Admin: ${roleCounts[1]}`);
    console.log(`   Staff: ${roleCounts[2]}`);
    console.log(`   Users: ${roleCounts[3]}`);

    const statusCounts = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { isVerified: false } }),
    ]);

    console.log(`   Active: ${statusCounts[0]}`);
    console.log(`   Inactive: ${statusCounts[1]}`);
    console.log(`   Verified: ${statusCounts[2]}`);
    console.log(`   Unverified: ${statusCounts[3]}`);

    const oauthCounts = await Promise.all([
      prisma.user.count({ where: { googleId: { not: null } } }),
      prisma.user.count({ where: { facebookId: { not: null } } }),
      prisma.user.count({ where: { githubId: { not: null } } }),
    ]);

    console.log(`   Google OAuth: ${oauthCounts[0]}`);
    console.log(`   Facebook OAuth: ${oauthCounts[1]}`);
    console.log(`   GitHub OAuth: ${oauthCounts[2]}`);

    // Show sample users
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        googleId: true,
        facebookId: true,
        githubId: true,
      },
    });

    console.log('\n🎯 Sample Users:');
    sampleUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Active: ${user.isActive}, Verified: ${user.isVerified}`);
      if (user.googleId) console.log(`      OAuth: Google`);
      if (user.facebookId) console.log(`      OAuth: Facebook`);
      if (user.githubId) console.log(`      OAuth: GitHub`);
    });

    // Show login credentials for testing
    console.log('\n🔐 Test Login Credentials:');
    console.log('   Super Admin: admin@shopapp.com / Admin123!');
    console.log('   Admin: admin2@shopapp.com / Admin123!');
    console.log('   Staff: staff@shopapp.com / Staff123!');
    console.log('   User: john.doe@example.com / User123!');
    console.log('   User: jane.smith@example.com / User123!');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('🎉 User seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 User seeding failed:', error);
      process.exit(1);
    });
}
