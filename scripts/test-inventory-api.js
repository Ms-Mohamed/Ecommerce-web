const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInventoryAPI() {
  try {
    console.log('🧪 Testing inventory API logic...\n');

    // Test the same logic as the API endpoint
    const where = {}
    
    // Get inventory with product details
    let inventory = await prisma.stockInfo.findMany({
      where,
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
    })

    console.log(`✅ Found ${inventory.length} inventory items`);

    // Test low stock filtering
    const lowStockItems = inventory.filter(item => item.quantity <= item.minLevel);
    console.log(`⚠️  Found ${lowStockItems.length} low stock items`);

    // Get inventory statistics
    const stats = await prisma.stockInfo.aggregate({
      _sum: {
        quantity: true
      },
      _avg: {
        quantity: true
      }
    })

    const totalProducts = await prisma.stockInfo.count()
    
    // Get all stock info to calculate low stock count
    const allStockInfo = await prisma.stockInfo.findMany()
    const lowStockCount = allStockInfo.filter(stock => stock.quantity <= stock.minLevel).length

    const outOfStockCount = await prisma.stockInfo.count({
      where: {
        quantity: 0
      }
    })

    console.log('\n📊 Inventory Statistics:');
    console.log(`Total products: ${totalProducts}`);
    console.log(`Total stock: ${stats._sum.quantity}`);
    console.log(`Average stock: ${Math.round(stats._avg.quantity)}`);
    console.log(`Low stock count: ${lowStockCount}`);
    console.log(`Out of stock count: ${outOfStockCount}`);

    console.log('\n📦 Sample inventory items:');
    inventory.slice(0, 3).forEach(item => {
      console.log(`  - ${item.product.name}: ${item.quantity} units (min: ${item.minLevel})`);
    });

    console.log('\n✅ Inventory API logic test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing inventory API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInventoryAPI();
