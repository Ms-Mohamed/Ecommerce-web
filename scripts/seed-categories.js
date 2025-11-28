const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('🌱 Seeding categories...\n');

  const defaultCategories = [
    { name: 'Electronics', description: 'Electronic devices and gadgets' },
    { name: 'Clothing', description: 'Fashion and apparel' },
    { name: 'Home & Kitchen', description: 'Home improvement and kitchen items' },
    { name: 'Beauty & Health', description: 'Beauty products and health items' },
    { name: 'Toys & Games', description: 'Toys, games, and entertainment' },
    { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
    { name: 'Books & Media', description: 'Books, movies, and media' },
    { name: 'Food & Drink', description: 'Food and beverage items' },
    { name: 'Hobbies & Crafts', description: 'Craft supplies and hobby materials' },
    { name: 'Others', description: 'Miscellaneous items' }
  ];

  try {
    for (const categoryData of defaultCategories) {
      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({
        where: { name: categoryData.name }
      });

      if (!existingCategory) {
        const category = await prisma.category.create({
          data: categoryData
        });
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${categoryData.name}`);
      }
    }

    console.log('\n🎉 Category seeding completed!');
    
    // Display all categories
    const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 All categories:');
    allCategories.forEach(category => {
      console.log(`  - ${category.name} (ID: ${category.id})`);
    });

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
