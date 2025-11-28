const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInventory() {
  try {
    console.log('🧪 Testing inventory system...\n');

    // Test 1: Check stock info for all products
    console.log('📦 Test 1: Checking stock information for all products');
    const productsWithStock = await prisma.product.findMany({
      include: {
        stockInfo: true
      }
    });

    console.log(`Found ${productsWithStock.length} products with stock info:`);
    productsWithStock.forEach(product => {
      const stock = product.stockInfo;
      if (stock) {
        console.log(`  - ${product.name}: ${stock.quantity} units (min: ${stock.minLevel}, max: ${stock.maxLevel})`);
      } else {
        console.log(`  - ${product.name}: No stock info`);
      }
    });

    // Test 2: Check low stock products
    console.log('\n⚠️  Test 2: Checking for low stock products');
    const lowStockProducts = await prisma.stockInfo.findMany({
      where: {
        quantity: {
          lte: prisma.stockInfo.fields.minLevel
        }
      },
      include: {
        product: true
      }
    });

    if (lowStockProducts.length > 0) {
      console.log(`Found ${lowStockProducts.length} products with low stock:`);
      lowStockProducts.forEach(item => {
        console.log(`  - ${item.product.name}: ${item.quantity}/${item.minLevel} (needs restocking)`);
      });
    } else {
      console.log('✅ No low stock products found');
    }

    // Test 3: Check stock movements
    console.log('\n📊 Test 3: Checking recent stock movements');
    const recentMovements = await prisma.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true }
        }
      }
    });

    console.log(`Found ${recentMovements.length} recent stock movements:`);
    recentMovements.forEach(movement => {
      console.log(`  - ${movement.product.name}: ${movement.type} ${movement.quantity} units (${movement.reason})`);
    });

    // Test 4: Inventory statistics
    console.log('\n📈 Test 4: Inventory statistics');
    const stats = await prisma.stockInfo.aggregate({
      _sum: { quantity: true },
      _avg: { quantity: true },
      _min: { quantity: true },
      _max: { quantity: true }
    });

    const totalProducts = await prisma.stockInfo.count();
    const outOfStock = await prisma.stockInfo.count({
      where: { quantity: 0 }
    });

    console.log(`Total products in inventory: ${totalProducts}`);
    console.log(`Total stock units: ${stats._sum.quantity}`);
    console.log(`Average stock per product: ${Math.round(stats._avg.quantity)}`);
    console.log(`Lowest stock: ${stats._min.quantity}`);
    console.log(`Highest stock: ${stats._max.quantity}`);
    console.log(`Out of stock products: ${outOfStock}`);

    // Test 5: Test stock adjustment (simulate adding stock)
    console.log('\n🔧 Test 5: Testing stock adjustment');
    const firstProduct = productsWithStock[0];
    if (firstProduct && firstProduct.stockInfo) {
      const originalQuantity = firstProduct.stockInfo.quantity;
      const adjustmentQuantity = 5;

      console.log(`Adding ${adjustmentQuantity} units to ${firstProduct.name} (current: ${originalQuantity})`);

      // Create a stock movement
      const movement = await prisma.stockMovement.create({
        data: {
          productId: firstProduct.id,
          type: 'INBOUND',
          quantity: adjustmentQuantity,
          reason: 'Test stock adjustment',
          reference: 'TEST_ADJUSTMENT'
        }
      });

      // Update stock info
      const updatedStock = await prisma.stockInfo.update({
        where: { productId: firstProduct.id },
        data: {
          quantity: originalQuantity + adjustmentQuantity,
          lastUpdated: new Date()
        }
      });

      console.log(`✅ Stock updated: ${originalQuantity} → ${updatedStock.quantity}`);

      // Revert the change
      await prisma.stockInfo.update({
        where: { productId: firstProduct.id },
        data: {
          quantity: originalQuantity,
          lastUpdated: new Date()
        }
      });

      await prisma.stockMovement.delete({
        where: { id: movement.id }
      });

      console.log(`🔄 Reverted test change`);
    }

    console.log('\n✅ All inventory tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing inventory:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInventory();
