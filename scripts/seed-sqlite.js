const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding SQLite database...\n');

    // Clear existing data
    await prisma.stockMovement.deleteMany();
    await prisma.stockInfo.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.product.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    await prisma.store.deleteMany();

    console.log('✅ Cleared existing data');

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        id: 'admin_user_123',
        name: 'Admin User',
        email: 'admin@example.com',
        image: '/assets/gs_logo.jpg'
      }
    });

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        id: 'test_user_123',
        name: 'Test User',
        email: 'test@example.com',
        image: '/assets/profile_pic1.jpg'
      }
    });

    console.log('✅ Created users');

    // Create store
    const store = await prisma.store.create({
      data: {
        id: 'test_store_123',
        userId: adminUser.id,
        name: 'GoCart Electronics',
        description: 'Your one-stop shop for electronics',
        username: 'gocart_electronics',
        address: '123 Electronics Street, Tech City',
        status: 'approved',
        isActive: true,
        logo: '/assets/gs_logo.jpg',
        email: 'contact@gocart.com',
        contact: '+1-555-0123'
      }
    });

    console.log('✅ Created store');

    // Create addresses
    const adminAddress = await prisma.address.create({
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

    const testAddress = await prisma.address.create({
      data: {
        id: 'test_address_456',
        userId: testUser.id,
        name: 'Test Address',
        email: testUser.email,
        phone: '0987654321',
        street: '456 Test Street',
        city: 'Test City',
        state: 'Test State',
        zip: '54321',
        country: 'Test Country'
      }
    });

    console.log('✅ Created addresses');

    // Create products
    const products = [
      {
        id: 'product_1',
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced features',
        mrp: 999.99,
        price: 899.99,
        images: '/assets/product_img1.png',
        category: 'Phones',
        storeId: store.id
      },
      {
        id: 'product_2',
        name: 'MacBook Pro M3',
        description: 'Powerful laptop for professionals',
        mrp: 1999.99,
        price: 1799.99,
        images: '/assets/product_img2.png',
        category: 'Laptops',
        storeId: store.id
      },
      {
        id: 'product_3',
        name: 'Mechanical Keyboard',
        description: 'High-quality mechanical keyboard',
        mrp: 199.99,
        price: 149.99,
        images: '/assets/product_img3.png',
        category: 'Keyboards',
        storeId: store.id
      },
      {
        id: 'product_4',
        name: 'Gaming Mouse',
        description: 'Precision gaming mouse',
        mrp: 99.99,
        price: 79.99,
        images: '/assets/product_img4.png',
        category: 'Mice',
        storeId: store.id
      }
    ];

    for (const productData of products) {
      const product = await prisma.product.create({
        data: productData
      });

      // Create stock info for each product
      await prisma.stockInfo.create({
        data: {
          productId: product.id,
          quantity: Math.floor(Math.random() * 50) + 10, // Random quantity between 10-60
          minLevel: 5,
          maxLevel: 100,
          location: 'main_warehouse'
        }
      });
    }

    console.log('✅ Created products with stock info');

    // Create a test order
    const order = await prisma.order.create({
      data: {
        id: 'test_order_123',
        total: 1049.98,
        status: 'ORDER_PLACED',
        userId: testUser.id,
        storeId: store.id,
        addressId: testAddress.id,
        isPaid: false,
        paymentMethod: 'COD',
        isCouponUsed: false,
        coupon: '{}'
      }
    });

    // Create order items
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: 'product_1',
        quantity: 1,
        price: 899.99
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: 'product_3',
        quantity: 1,
        price: 149.99
      }
    });

    console.log('✅ Created test order');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Users: 2 (admin@example.com, test@example.com)`);
    console.log(`   • Store: 1 (GoCart Electronics)`);
    console.log(`   • Products: ${products.length}`);
    console.log(`   • Orders: 1`);
    console.log(`   • Stock Info: ${products.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@example.com (NextAuth will handle authentication)');
    console.log('   User: test@example.com (NextAuth will handle authentication)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
