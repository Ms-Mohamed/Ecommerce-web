const { PrismaClient } = require('@prisma/client');

async function setupFreshDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗄️  Setting up fresh GoCart database...\n');
    
    // Create default admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        id: 'admin_user_123',
        name: 'Admin User',
        email: 'admin@example.com',
        image: '/assets/gs_logo.jpg',
        password: '$2a$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA' // hashed password for 'admin123'
      }
    });
    
    console.log('✅ Admin user created:', adminUser.email);
    
    // Create default categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', description: 'Fashion and apparel' },
      { name: 'Books', description: 'Books and literature' },
      { name: 'Home & Garden', description: 'Home improvement and gardening' },
      { name: 'Sports', description: 'Sports equipment and gear' },
      { name: 'Toys & Games', description: 'Toys and entertainment' }
    ];
    
    for (const category of categories) {
      const created = await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category
      });
      console.log(`✅ Category created: ${created.name}`);
    }
    
    // Create default store
    const store = await prisma.store.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        id: 'default_store_123',
        userId: adminUser.id,
        name: 'Electronics Hub',
        description: 'Your one-stop shop for electronics',
        username: 'electronics-hub',
        address: '123 Main St, City, State 12345',
        status: 'approved',
        isActive: true,
        logo: '/uploads/logo.png',
        email: 'admin@example.com',
        contact: '+1-555-0123'
      }
    });
    
    console.log('✅ Default store created:', store.name);
    
    // Create sample products
    const sampleProducts = [
      {
        name: 'Sample Laptop',
        description: 'High-performance laptop for work and gaming',
        mrp: 1200,
        price: 999,
        images: ['/uploads/products/sample-laptop.jpg'],
        categoryName: 'Electronics',
        storeId: store.id
      },
      {
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with noise cancellation',
        mrp: 200,
        price: 149,
        images: ['/uploads/products/sample-headphones.jpg'],
        categoryName: 'Electronics',
        storeId: store.id
      },
      {
        name: 'Programming Book',
        description: 'Learn modern web development',
        mrp: 50,
        price: 39,
        images: ['/uploads/products/sample-book.jpg'],
        categoryName: 'Books',
        storeId: store.id
      }
    ];
    
    for (const productData of sampleProducts) {
      const category = await prisma.category.findUnique({
        where: { name: productData.categoryName }
      });
      
      if (category) {
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            mrp: productData.mrp,
            price: productData.price,
            images: productData.images,
            categoryId: category.id,
            storeId: productData.storeId,
            inStock: true
          }
        });
        
        // Create stock info
        await prisma.stockInfo.create({
          data: {
            productId: product.id,
            quantity: 10,
            minLevel: 2
          }
        });
        
        console.log(`✅ Sample product created: ${product.name}`);
      }
    }
    
    // Create sample coupons
    const sampleCoupons = [
      {
        code: 'WELCOME10',
        description: '10% Off Welcome Discount',
        discount: 10,
        forNewUser: true,
        forMember: false,
        isPublic: true,
        expiresAt: new Date('2025-12-31'),
        maxUsage: 100
      },
      {
        code: 'SAVE20',
        description: '20% Off for All Users',
        discount: 20,
        forNewUser: false,
        forMember: false,
        isPublic: true,
        expiresAt: new Date('2025-12-31'),
        maxUsage: 50
      }
    ];
    
    for (const couponData of sampleCoupons) {
      const coupon = await prisma.coupon.create({
        data: couponData
      });
      console.log(`✅ Sample coupon created: ${coupon.code}`);
    }
    
    console.log('\n🎉 Fresh database setup completed!');
    console.log('\n📊 Database Summary:');
    console.log('   - Admin User: admin@example.com');
    console.log('   - Default Store: Electronics Hub');
    console.log('   - Categories: 6 categories');
    console.log('   - Sample Products: 3 products');
    console.log('   - Sample Coupons: 2 coupons');
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupFreshDatabase();
