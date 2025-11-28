const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create a test user
    const user = await prisma.user.upsert({
      where: { id: 'user_test_123' },
      update: {},
      create: {
        id: 'user_test_123',
        name: 'Test User',
        email: 'test@example.com',
        image: '/assets/gs_logo.jpg',
        cart: {}
      }
    });

    console.log('✅ User created:', user.email);

    // Create a test store
    const store = await prisma.store.upsert({
      where: { username: 'electronics-store' },
      update: {},
      create: {
        userId: user.id,
        name: 'Electronics Hub',
        description: 'Your one-stop shop for the latest electronics, phones, laptops, and accessories.',
        username: 'electronics-store',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        status: 'approved',
        isActive: true,
        logo: '/assets/gs_logo.jpg',
        email: 'contact@electronics-hub.com',
        contact: '+1 (555) 123-4567'
      }
    });

    console.log('✅ Store created:', store.name);

    // Create electronics products using local images
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Perfect for professionals and tech enthusiasts.',
        mrp: 999,
        price: 899,
        images: ['/assets/product_img1.png', '/assets/product_img2.png'],
        category: 'Phones',
        storeId: store.id
      },
      {
        name: 'MacBook Pro M3',
        description: 'Powerful laptop with M3 chip, 14-inch Liquid Retina XDR display, and all-day battery life. Ideal for creative professionals.',
        mrp: 1999,
        price: 1799,
        images: ['/assets/product_img3.png', '/assets/product_img4.png'],
        category: 'Laptops',
        storeId: store.id
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with Cherry MX switches, perfect for gaming and programming. Durable and responsive.',
        mrp: 149,
        price: 119,
        images: ['/assets/product_img5.png', '/assets/product_img6.png'],
        category: 'Keyboards',
        storeId: store.id
      },
      {
        name: 'Wireless Gaming Mouse',
        description: 'High-precision wireless gaming mouse with 25,600 DPI sensor, RGB lighting, and ergonomic design for long gaming sessions.',
        mrp: 89,
        price: 69,
        images: ['/assets/product_img7.png', '/assets/product_img8.png'],
        category: 'Mice',
        storeId: store.id
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Flagship Android smartphone with AI-powered camera, 120Hz display, and all-day battery life. Premium build quality.',
        mrp: 799,
        price: 699,
        images: ['/assets/product_img9.png', '/assets/product_img10.png'],
        category: 'Phones',
        storeId: store.id
      },
      {
        name: 'Dell XPS 13',
        description: 'Ultra-thin laptop with 13.4-inch InfinityEdge display, Intel Core i7 processor, and premium build quality.',
        mrp: 1299,
        price: 1099,
        images: ['/assets/product_img11.png', '/assets/product_img12.png'],
        category: 'Laptops',
        storeId: store.id
      },
      {
        name: 'AirPods Pro 2',
        description: 'Wireless earbuds with active noise cancellation, spatial audio, and adaptive transparency mode.',
        mrp: 249,
        price: 199,
        images: ['/assets/product_img1.png', '/assets/product_img2.png'],
        category: 'Earbuds',
        storeId: store.id
      },
      {
        name: 'iPad Air M2',
        description: 'Powerful tablet with M2 chip, 10.9-inch Liquid Retina display, and Apple Pencil support. Perfect for creativity and productivity.',
        mrp: 599,
        price: 499,
        images: ['/assets/product_img3.png', '/assets/product_img4.png'],
        category: 'Tablets',
        storeId: store.id
      }
    ];

    for (const productData of products) {
      const product = await prisma.product.create({
        data: productData
      });
      console.log(`✅ Product created: ${product.name}`);
    }

    // Create a test address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        name: 'John Doe',
        email: user.email,
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'USA',
        phone: '+1 (555) 123-4567'
      }
    });

    console.log('✅ Address created for user');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created: 1 user, 1 store, ${products.length} products, 1 address`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
