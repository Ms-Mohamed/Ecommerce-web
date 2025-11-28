const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data for stock management...\n');

    // 1. Ensure admin user exists
    console.log('1️⃣ Setting up admin user...');
    let adminUser = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          id: 'admin_user_123',
          name: 'Admin User',
          email: 'admin@example.com',
          image: '/assets/gs_logo.jpg'
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // 2. Ensure store exists
    console.log('\n2️⃣ Setting up store...');
    let store = await prisma.store.findFirst();

    if (!store) {
      store = await prisma.store.create({
        data: {
          id: 'cmgjcptbp0001vt40le7ox6we',
          name: 'Electronics Hub',
          description: 'Premium electronics store',
          image: '/assets/happy_store.webp',
          userId: adminUser.id
        }
      });
      console.log('✅ Store created');
    } else {
      console.log('✅ Store already exists');
    }

    // 3. Ensure address exists for admin user
    console.log('\n3️⃣ Setting up address...');
    let address = await prisma.address.findFirst({
      where: { userId: adminUser.id }
    });

    if (!address) {
      address = await prisma.address.create({
        data: {
          id: 'test_address_123',
          userId: adminUser.id,
          name: 'Admin Address',
          email: adminUser.email,
          phone: '1234567890',
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          zip: '12345',
          country: 'Admin Country'
        }
      });
      console.log('✅ Address created');
    } else {
      console.log('✅ Address already exists');
    }

    // 4. Verify stock info exists
    console.log('\n4️⃣ Verifying stock information...');
    const stockCount = await prisma.stockInfo.count();
    if (stockCount === 0) {
      console.log('❌ No stock info found. Run: node scripts/initialize-stock.js');
      return;
    }
    console.log(`✅ Found ${stockCount} products with stock info`);

    console.log('\n🎉 Test data setup completed!');
    console.log('\n📋 Available for testing:');
    console.log(`- Admin user: ${adminUser.email}`);
    console.log(`- Store: ${store.name}`);
    console.log(`- Address: ${address.name}`);
    console.log(`- Products with stock: ${stockCount}`);

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
