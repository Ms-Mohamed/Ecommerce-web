const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCategoriesAPI() {
  console.log('🧪 Testing Categories API...\n');

  try {
    // Test 1: Fetch all categories
    console.log('1️⃣ Testing GET /api/categories...');
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(category => {
      console.log(`  - ${category.name} (${category._count.products} products)`);
    });

    // Test 2: Create a test category
    console.log('\n2️⃣ Testing category creation...');
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'A test category for API testing'
      }
    });
    console.log(`✅ Created test category: ${testCategory.name} (ID: ${testCategory.id})`);

    // Test 3: Update the test category
    console.log('\n3️⃣ Testing category update...');
    const updatedCategory = await prisma.category.update({
      where: { id: testCategory.id },
      data: {
        name: 'Updated Test Category',
        description: 'Updated description'
      }
    });
    console.log(`✅ Updated category: ${updatedCategory.name}`);

    // Test 4: Delete the test category
    console.log('\n4️⃣ Testing category deletion...');
    await prisma.category.delete({
      where: { id: testCategory.id }
    });
    console.log(`✅ Deleted test category`);

    console.log('\n🎉 All category API tests passed!');

  } catch (error) {
    console.error('❌ Error testing categories API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategoriesAPI();
