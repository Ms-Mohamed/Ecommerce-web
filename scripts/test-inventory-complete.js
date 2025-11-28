const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInventoryComplete() {
  try {
    console.log('🧪 Complete Inventory System Test\n');

    // Test 1: Check if admin user exists
    console.log('1️⃣ Testing admin user...');
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });

    if (adminUser) {
      console.log('✅ Admin user exists:', adminUser.email);
    } else {
      console.log('❌ Admin user not found. Creating admin user...');
      const newAdmin = await prisma.user.create({
        data: {
          id: 'admin-user-id',
          name: 'Admin User',
          email: 'admin@example.com',
          image: '/assets/profile_pic1.jpg'
        }
      });
      console.log('✅ Admin user created:', newAdmin.email);
    }

    // Test 2: Check stock info
    console.log('\n2️⃣ Testing stock information...');
    const stockCount = await prisma.stockInfo.count();
    console.log(`✅ Found ${stockCount} products with stock info`);

    if (stockCount === 0) {
      console.log('❌ No stock info found. Run: node scripts/initialize-stock.js');
      return;
    }

    // Test 3: Check stock movements
    console.log('\n3️⃣ Testing stock movements...');
    const movementCount = await prisma.stockMovement.count();
    console.log(`✅ Found ${movementCount} stock movements`);

    // Test 4: Test inventory query (same as API)
    console.log('\n4️⃣ Testing inventory query...');
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

    console.log(`✅ Successfully queried ${inventory.length} inventory items`);

    // Test 5: Test low stock filtering
    console.log('\n5️⃣ Testing low stock filtering...');
    const lowStockItems = inventory.filter(item => item.quantity <= item.minLevel);
    console.log(`✅ Found ${lowStockItems.length} low stock items`);

    // Test 6: Test statistics
    console.log('\n6️⃣ Testing inventory statistics...');
    const stats = await prisma.stockInfo.aggregate({
      _sum: { quantity: true },
      _avg: { quantity: true }
    });

    const totalProducts = await prisma.stockInfo.count();
    const allStockInfo = await prisma.stockInfo.findMany();
    const lowStockCount = allStockInfo.filter(stock => stock.quantity <= stock.minLevel).length;
    const outOfStockCount = await prisma.stockInfo.count({
      where: { quantity: 0 }
    });

    console.log('✅ Inventory Statistics:');
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Total stock: ${stats._sum.quantity}`);
    console.log(`   Average stock: ${Math.round(stats._avg.quantity)}`);
    console.log(`   Low stock count: ${lowStockCount}`);
    console.log(`   Out of stock count: ${outOfStockCount}`);

    // Test 7: Test stock adjustment
    console.log('\n7️⃣ Testing stock adjustment...');
    const firstProduct = inventory[0];
    if (firstProduct) {
      const originalQuantity = firstProduct.quantity;
      
      // Create test movement
      const movement = await prisma.stockMovement.create({
        data: {
          productId: firstProduct.productId,
          type: 'INBOUND',
          quantity: 1,
          reason: 'Test adjustment',
          reference: 'TEST'
        }
      });

      // Update stock
      await prisma.stockInfo.update({
        where: { productId: firstProduct.productId },
        data: {
          quantity: originalQuantity + 1,
          lastUpdated: new Date()
        }
      });

      console.log(`✅ Stock adjustment successful: ${originalQuantity} → ${originalQuantity + 1}`);

      // Revert changes
      await prisma.stockInfo.update({
        where: { productId: firstProduct.productId },
        data: {
          quantity: originalQuantity,
          lastUpdated: new Date()
        }
      });

      await prisma.stockMovement.delete({
        where: { id: movement.id }
      });

      console.log('✅ Test changes reverted');
    }

    console.log('\n🎉 All inventory tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Make sure you are logged in as admin@example.com');
    console.log('2. Navigate to http://localhost:3000/admin/inventory');
    console.log('3. The inventory management page should load successfully');
    console.log('4. You should see all products with their stock levels');

  } catch (error) {
    console.error('❌ Error in complete inventory test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInventoryComplete();
