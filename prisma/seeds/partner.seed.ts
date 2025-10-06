import { PrismaClient, PartnerStatus } from '@prisma/client';

const prisma = new PrismaClient();

const partnerData = [
  {
    name: 'Beauty Salon Elegance',
    description: 'Premium beauty salon offering luxurious spa treatments and professional beauty services in the heart of the city.',
    email: 'info@elegance-salon.com',
    phone: '+1-555-0101',
    address: '123 Luxury Avenue, Downtown District, City 10001',
    website: 'https://www.elegance-salon.com',
    logo: 'https://example.com/logos/elegance-salon.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 15.5,
  },
  {
    name: 'Urban Nail Studio',
    description: 'Modern nail art studio specializing in creative nail designs, gel manicures, and nail care treatments.',
    email: 'hello@urbannail.com',
    phone: '+1-555-0102',
    address: '456 Creative Street, Arts Quarter, City 10002',
    website: 'https://www.urbannail.com',
    logo: 'https://example.com/logos/urban-nail.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 12.0,
  },
  {
    name: 'Hair Masters Academy',
    description: 'Professional hair salon and training academy offering cutting-edge hairstyles, coloring, and styling services.',
    email: 'contact@hairmasters.com',
    phone: '+1-555-0103',
    address: '789 Style Boulevard, Fashion District, City 10003',
    website: 'https://www.hairmasters.com',
    logo: 'https://example.com/logos/hair-masters.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 18.0,
  },
  {
    name: 'Zen Wellness Spa',
    description: 'Holistic wellness center providing therapeutic massages, facial treatments, and relaxation therapies.',
    email: 'wellness@zenspa.com',
    phone: '+1-555-0104',
    address: '321 Peace Lane, Wellness District, City 10004',
    website: 'https://www.zenspa.com',
    logo: 'https://example.com/logos/zen-spa.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 20.0,
  },
  {
    name: 'Glow Skin Clinic',
    description: 'Advanced dermatology and aesthetic clinic specializing in skin treatments, laser therapy, and anti-aging solutions.',
    email: 'info@glowskin.com',
    phone: '+1-555-0105',
    address: '654 Beauty Plaza, Medical District, City 10005',
    website: 'https://www.glowskin.com',
    logo: 'https://example.com/logos/glow-skin.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 25.0,
  },
  {
    name: 'Classic Barber Shop',
    description: 'Traditional barbershop offering classic cuts, beard grooming, and traditional shaving services for gentlemen.',
    email: 'cuts@classicbarber.com',
    phone: '+1-555-0106',
    address: '987 Heritage Street, Old Town, City 10006',
    website: 'https://www.classicbarber.com',
    logo: 'https://example.com/logos/classic-barber.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 10.0,
  },
  {
    name: 'Luxe Eyebrow Studio',
    description: 'Specialized eyebrow and eyelash studio offering microblading, lash extensions, and eyebrow shaping services.',
    email: 'brows@luxestudio.com',
    phone: '+1-555-0107',
    address: '147 Precision Avenue, Beauty District, City 10007',
    website: 'https://www.luxestudio.com',
    logo: 'https://example.com/logos/luxe-studio.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 22.0,
  },
  {
    name: 'Tropical Tan Studio',
    description: 'Professional tanning salon offering spray tans, tanning beds, and sunless tanning solutions.',
    email: 'tan@tropicalstudio.com',
    phone: '+1-555-0108',
    address: '258 Sunshine Road, Beach District, City 10008',
    website: 'https://www.tropicalstudio.com',
    logo: 'https://example.com/logos/tropical-tan.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 14.0,
  },
  {
    name: 'Permanent Makeup Studio',
    description: 'Expert permanent makeup artists specializing in microblading, lip blushing, and cosmetic tattooing.',
    email: 'permanent@makeupstudio.com',
    phone: '+1-555-0109',
    address: '369 Art Street, Creative District, City 10009',
    website: 'https://www.makeupstudio.com',
    logo: 'https://example.com/logos/permanent-makeup.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 30.0,
  },
  {
    name: 'Family Hair Care',
    description: 'Family-friendly hair salon providing services for all ages, from children\'s cuts to senior styling.',
    email: 'family@haircare.com',
    phone: '+1-555-0110',
    address: '741 Family Lane, Residential District, City 10010',
    website: 'https://www.haircare.com',
    logo: 'https://example.com/logos/family-hair.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 8.5,
  },
  {
    name: 'Mobile Beauty Services',
    description: 'On-demand beauty services bringing professional treatments directly to your home or office.',
    email: 'mobile@beautyservices.com',
    phone: '+1-555-0111',
    address: '852 Service Drive, Mobile District, City 10011',
    website: 'https://www.beautyservices.com',
    logo: 'https://example.com/logos/mobile-beauty.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 16.0,
  },
  {
    name: 'Luxury Spa Resort',
    description: 'Exclusive resort spa offering premium treatments, wellness programs, and luxury accommodations.',
    email: 'luxury@sparesort.com',
    phone: '+1-555-0112',
    address: '963 Resort Boulevard, Luxury District, City 10012',
    website: 'https://www.sparesort.com',
    logo: 'https://example.com/logos/luxury-spa.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 35.0,
  },
  {
    name: 'Budget Beauty Center',
    description: 'Affordable beauty services providing quality treatments at budget-friendly prices for everyone.',
    email: 'budget@beautycenter.com',
    phone: '+1-555-0113',
    address: '159 Value Street, Budget District, City 10013',
    website: 'https://www.beautycenter.com',
    logo: 'https://example.com/logos/budget-beauty.png',
    status: PartnerStatus.INACTIVE,
    commissionRate: 5.0,
  },
  {
    name: 'Eco-Friendly Spa',
    description: 'Sustainable wellness center using organic products and eco-friendly practices for all treatments.',
    email: 'eco@greenwellness.com',
    phone: '+1-555-0114',
    address: '357 Green Avenue, Eco District, City 10014',
    website: 'https://www.greenwellness.com',
    logo: 'https://example.com/logos/eco-spa.png',
    status: PartnerStatus.ACTIVE,
    commissionRate: 18.5,
  },
  {
    name: 'Quick Cuts Express',
    description: 'Fast-service hair salon specializing in quick cuts, styling, and basic beauty treatments for busy professionals.',
    email: 'express@quickcuts.com',
    phone: '+1-555-0115',
    address: '468 Speed Lane, Business District, City 10015',
    website: 'https://www.quickcuts.com',
    logo: 'https://example.com/logos/quick-cuts.png',
    status: PartnerStatus.SUSPENDED,
    commissionRate: 7.0,
  },
];

export async function seedPartners() {
  console.log('🌱 Starting partner seeding...');

  try {
    // Clear existing partners (optional - remove if you want to keep existing data)
    await prisma.partner.deleteMany({});
    console.log('🗑️  Cleared existing partners');

    // Create partners
    const createdPartners = await prisma.partner.createMany({
      data: partnerData,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${createdPartners.count} partners successfully!`);

    // Display summary
    const activePartners = await prisma.partner.count({
      where: { status: PartnerStatus.ACTIVE },
    });

    const inactivePartners = await prisma.partner.count({
      where: { status: PartnerStatus.INACTIVE },
    });

    const suspendedPartners = await prisma.partner.count({
      where: { status: PartnerStatus.SUSPENDED },
    });

    console.log('\n📊 Partner Summary:');
    console.log(`   Active: ${activePartners}`);
    console.log(`   Inactive: ${inactivePartners}`);
    console.log(`   Suspended: ${suspendedPartners}`);
    console.log(`   Total: ${activePartners + inactivePartners + suspendedPartners}`);

    // Show sample partners
    const samplePartners = await prisma.partner.findMany({
      take: 3,
      select: {
        name: true,
        email: true,
        status: true,
        commissionRate: true,
      },
    });

    console.log('\n🎯 Sample Partners:');
    samplePartners.forEach((partner, index) => {
      console.log(`   ${index + 1}. ${partner.name}`);
      console.log(`      Email: ${partner.email}`);
      console.log(`      Status: ${partner.status}`);
      console.log(`      Commission: ${partner.commissionRate}%`);
    });

  } catch (error) {
    console.error('❌ Error seeding partners:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedPartners()
    .then(() => {
      console.log('🎉 Partner seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Partner seeding failed:', error);
      process.exit(1);
    });
}
