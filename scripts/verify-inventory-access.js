const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyInventoryAccess() {
  try {
    console.log('🔍 Verifying Inventory System Access\n');

    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('Creating admin user...');
      
      const newAdmin = await prisma.user.create({
        data: {
          id: 'admin-user-id',
          name: 'Admin User',
          email: 'admin@example.com',
          image: '/assets/profile_pic1.jpg'
        }
      });
      console.log('✅ Admin user created:', newAdmin.email);
    } else {
      console.log('✅ Admin user exists:', adminUser.email);
    }

    // Check inventory data
    const stockCount = await prisma.stockInfo.count();
    console.log(`✅ Found ${stockCount} products with stock info`);

    if (stockCount === 0) {
      console.log('❌ No stock info found!');
      console.log('Run: node scripts/initialize-stock.js');
      return;
    }

    // Test the exact API query
    console.log('\n🧪 Testing API query...');
    const inventory = await prisma.stockInfo.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            inStock: true
          }
        }
      },
      orderBy: {
        quantity: 'asc'
      }
    });

    console.log(`✅ API query successful: ${inventory.length} items`);

    // Show sample data
    console.log('\n📦 Sample inventory data:');
    inventory.slice(0, 3).forEach(item => {
      console.log(`  - ${item.product.name}: ${item.quantity} units (min: ${item.minLevel})`);
    });

    console.log('\n🌐 Access Instructions:');
    console.log('1. Make sure your server is running on port 3000');
    console.log('2. Open browser and go to: http://localhost:3000');
    console.log('3. Click "Sign In" and login with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: any password (authentication is simplified)');
    console.log('4. After login, go to: http://localhost:3000/admin/inventory');
    console.log('5. You should see the inventory management page');

    console.log('\n⚠️  Important Notes:');
    console.log('- Make sure you are using port 3000');
    console.log('- You must be logged in as admin@example.com');
    console.log('- The API returns 401 if not authenticated (this is normal)');

  } catch (error) {
    console.error('❌ Error verifying inventory access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyInventoryAccess();
