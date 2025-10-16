import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const serviceData = [
  // Hair Services
  {
    name: 'Hair Cut & Style',
    description: 'Professional hair cutting and styling service with consultation',
    category: 'Hair Services',
    duration: 60,
    price: 150000,
    image: 'https://example.com/services/hair-cut.jpg',
    isActive: true,
  },
  {
    name: 'Hair Coloring',
    description: 'Professional hair coloring with premium products',
    category: 'Hair Services',
    duration: 120,
    price: 300000,
    image: 'https://example.com/services/hair-coloring.jpg',
    isActive: true,
  },
  {
    name: 'Hair Perming',
    description: 'Chemical hair perming for curly or wavy styles',
    category: 'Hair Services',
    duration: 180,
    price: 400000,
    image: 'https://example.com/services/hair-perming.jpg',
    isActive: true,
  },
  {
    name: 'Hair Straightening',
    description: 'Professional hair straightening treatment',
    category: 'Hair Services',
    duration: 150,
    price: 350000,
    image: 'https://example.com/services/hair-straightening.jpg',
    isActive: true,
  },
  {
    name: 'Hair Treatment',
    description: 'Deep conditioning and repair treatment',
    category: 'Hair Services',
    duration: 90,
    price: 200000,
    image: 'https://example.com/services/hair-treatment.jpg',
    isActive: true,
  },

  // Nail Services
  {
    name: 'Manicure',
    description: 'Classic manicure with nail shaping and polish',
    category: 'Nail Services',
    duration: 45,
    price: 80000,
    image: 'https://example.com/services/manicure.jpg',
    isActive: true,
  },
  {
    name: 'Pedicure',
    description: 'Foot care and nail treatment with massage',
    category: 'Nail Services',
    duration: 60,
    price: 120000,
    image: 'https://example.com/services/pedicure.jpg',
    isActive: true,
  },
  {
    name: 'Gel Manicure',
    description: 'Long-lasting gel nail polish application',
    category: 'Nail Services',
    duration: 75,
    price: 150000,
    image: 'https://example.com/services/gel-manicure.jpg',
    isActive: true,
  },
  {
    name: 'Nail Art',
    description: 'Creative nail art designs and decorations',
    category: 'Nail Services',
    duration: 90,
    price: 200000,
    image: 'https://example.com/services/nail-art.jpg',
    isActive: true,
  },
  {
    name: 'French Manicure',
    description: 'Classic French manicure with white tips',
    category: 'Nail Services',
    duration: 60,
    price: 100000,
    image: 'https://example.com/services/french-manicure.jpg',
    isActive: true,
  },

  // Facial Services
  {
    name: 'Basic Facial',
    description: 'Deep cleansing facial with extraction and mask',
    category: 'Facial Services',
    duration: 60,
    price: 180000,
    image: 'https://example.com/services/basic-facial.jpg',
    isActive: true,
  },
  {
    name: 'Anti-Aging Facial',
    description: 'Advanced facial treatment for mature skin',
    category: 'Facial Services',
    duration: 90,
    price: 350000,
    image: 'https://example.com/services/anti-aging-facial.jpg',
    isActive: true,
  },
  {
    name: 'Acne Treatment',
    description: 'Specialized treatment for acne-prone skin',
    category: 'Facial Services',
    duration: 75,
    price: 250000,
    image: 'https://example.com/services/acne-treatment.jpg',
    isActive: true,
  },
  {
    name: 'Hydrating Facial',
    description: 'Intensive moisturizing treatment for dry skin',
    category: 'Facial Services',
    duration: 60,
    price: 200000,
    image: 'https://example.com/services/hydrating-facial.jpg',
    isActive: true,
  },
  {
    name: 'Brightening Facial',
    description: 'Treatment to reduce dark spots and brighten skin',
    category: 'Facial Services',
    duration: 75,
    price: 280000,
    image: 'https://example.com/services/brightening-facial.jpg',
    isActive: true,
  },

  // Massage Services
  {
    name: 'Swedish Massage',
    description: 'Relaxing full-body massage with essential oils',
    category: 'Massage Services',
    duration: 60,
    price: 250000,
    image: 'https://example.com/services/swedish-massage.jpg',
    isActive: true,
  },
  {
    name: 'Deep Tissue Massage',
    description: 'Therapeutic massage for muscle tension relief',
    category: 'Massage Services',
    duration: 90,
    price: 350000,
    image: 'https://example.com/services/deep-tissue-massage.jpg',
    isActive: true,
  },
  {
    name: 'Hot Stone Massage',
    description: 'Relaxing massage with heated stones',
    category: 'Massage Services',
    duration: 75,
    price: 300000,
    image: 'https://example.com/services/hot-stone-massage.jpg',
    isActive: true,
  },
  {
    name: 'Aromatherapy Massage',
    description: 'Massage with custom essential oil blends',
    category: 'Massage Services',
    duration: 60,
    price: 280000,
    image: 'https://example.com/services/aromatherapy-massage.jpg',
    isActive: true,
  },
  {
    name: 'Foot Massage',
    description: 'Reflexology and foot pressure point massage',
    category: 'Massage Services',
    duration: 45,
    price: 150000,
    image: 'https://example.com/services/foot-massage.jpg',
    isActive: true,
  },

  // Eyebrow & Eyelash Services
  {
    name: 'Eyebrow Shaping',
    description: 'Professional eyebrow shaping and styling',
    category: 'Eyebrow & Eyelash',
    duration: 30,
    price: 60000,
    image: 'https://example.com/services/eyebrow-shaping.jpg',
    isActive: true,
  },
  {
    name: 'Eyebrow Tinting',
    description: 'Eyebrow color enhancement with safe dyes',
    category: 'Eyebrow & Eyelash',
    duration: 45,
    price: 80000,
    image: 'https://example.com/services/eyebrow-tinting.jpg',
    isActive: true,
  },
  {
    name: 'Eyelash Extensions',
    description: 'Individual eyelash extensions for fuller lashes',
    category: 'Eyebrow & Eyelash',
    duration: 120,
    price: 400000,
    image: 'https://example.com/services/eyelash-extensions.jpg',
    isActive: true,
  },
  {
    name: 'Eyelash Tinting',
    description: 'Eyelash color enhancement treatment',
    category: 'Eyebrow & Eyelash',
    duration: 30,
    price: 70000,
    image: 'https://example.com/services/eyelash-tinting.jpg',
    isActive: true,
  },
  {
    name: 'Microblading',
    description: 'Semi-permanent eyebrow tattooing technique',
    category: 'Eyebrow & Eyelash',
    duration: 150,
    price: 800000,
    image: 'https://example.com/services/microblading.jpg',
    isActive: true,
  },

  // Body Treatments
  {
    name: 'Body Scrub',
    description: 'Exfoliating body treatment with natural scrubs',
    category: 'Body Treatments',
    duration: 60,
    price: 200000,
    image: 'https://example.com/services/body-scrub.jpg',
    isActive: true,
  },
  {
    name: 'Body Wrap',
    description: 'Detoxifying body wrap treatment',
    category: 'Body Treatments',
    duration: 90,
    price: 300000,
    image: 'https://example.com/services/body-wrap.jpg',
    isActive: true,
  },
  {
    name: 'Cellulite Treatment',
    description: 'Specialized treatment to reduce cellulite',
    category: 'Body Treatments',
    duration: 75,
    price: 350000,
    image: 'https://example.com/services/cellulite-treatment.jpg',
    isActive: true,
  },
  {
    name: 'Tanning',
    description: 'Professional spray tanning service',
    category: 'Body Treatments',
    duration: 30,
    price: 120000,
    image: 'https://example.com/services/tanning.jpg',
    isActive: true,
  },

  // Barber Services
  {
    name: 'Men\'s Haircut',
    description: 'Professional men\'s haircut and styling',
    category: 'Barber Services',
    duration: 45,
    price: 100000,
    image: 'https://example.com/services/mens-haircut.jpg',
    isActive: true,
  },
  {
    name: 'Beard Trim',
    description: 'Professional beard trimming and shaping',
    category: 'Barber Services',
    duration: 30,
    price: 80000,
    image: 'https://example.com/services/beard-trim.jpg',
    isActive: true,
  },
  {
    name: 'Hot Towel Shave',
    description: 'Traditional hot towel shaving service',
    category: 'Barber Services',
    duration: 45,
    price: 120000,
    image: 'https://example.com/services/hot-towel-shave.jpg',
    isActive: true,
  },
  {
    name: 'Hair Wash & Style',
    description: 'Hair washing and professional styling',
    category: 'Barber Services',
    duration: 30,
    price: 60000,
    image: 'https://example.com/services/hair-wash-style.jpg',
    isActive: true,
  },
];

export async function seedServices() {
  console.log('🌱 Starting service seeding...');

  try {
    // Get all partners to assign services to them
    const partners = await prisma.partner.findMany({
      select: { id: true, name: true },
    });

    if (partners.length === 0) {
      console.log('⚠️  No partners found. Please seed partners first.');
      return;
    }

    // Clear existing services (optional - remove if you want to keep existing data)
    await prisma.service.deleteMany({});
    console.log('🗑️  Cleared existing services');

    // Create services and assign them to partners
    const createdServices = [];
    
    for (let i = 0; i < serviceData.length; i++) {
      const service = serviceData[i];
      
      // Assign service to a partner (round-robin assignment)
      const partnerIndex = i % partners.length;
      const assignedPartner = partners[partnerIndex];

      const createdService = await prisma.service.create({
        data: {
          ...service,
          partnerId: assignedPartner.id,
        },
      });

      createdServices.push(createdService);
    }

    console.log(`✅ Created ${createdServices.length} services successfully!`);

    // Display summary by category
    const categoryStats = await prisma.service.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      _avg: {
        price: true,
        duration: true,
      },
    });

    console.log('\n📊 Service Summary by Category:');
    // categoryStats.forEach((stat) => {
    //   console.log(`   ${stat.category}:`);
    //   console.log(`     Count: ${stat._count.id}`);
    //   console.log(`     Avg Price: ${Math.round(stat._avg.price || 0).toLocaleString()} VND`);
    //   console.log(`     Avg Duration: ${Math.round(stat._avg.duration || 0)} minutes`);
    // });

    // Display summary by partner
    const partnerStats = await prisma.service.groupBy({
      by: ['partnerId'],
      _count: {
        id: true,
      },
    });

    console.log('\n🏢 Services per Partner:');
    for (const stat of partnerStats) {
      const partner = partners.find(p => p.id === stat.partnerId);
      console.log(`   ${partner?.name}: ${stat._count.id} services`);
    }

    // Show sample services
    const sampleServices = await prisma.service.findMany({
      take: 5,
      include: {
        partner: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log('\n🎯 Sample Services:');
    sampleServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name}`);
      console.log(`      Category: ${service.category}`);
      console.log(`      Duration: ${service.duration} minutes`);
      console.log(`      Price: ${service.price.toLocaleString()} VND`);
      console.log(`      Partner: ${service.partner?.name}`);
    });

  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedServices()
    .then(() => {
      console.log('🎉 Service seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Service seeding failed:', error);
      process.exit(1);
    });
}



