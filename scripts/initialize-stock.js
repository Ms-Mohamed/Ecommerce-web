const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initializeStock() {
  try {
    console.log('🏪 Initializing stock information for existing products...');

    // Get all products that don't have stock info
    const productsWithoutStock = await prisma.product.findMany({
      where: {
        stockInfo: null
      },
      include: {
        stockInfo: true
      }
    });

    console.log(`📦 Found ${productsWithoutStock.length} products without stock information`);

    if (productsWithoutStock.length === 0) {
      console.log('✅ All products already have stock information');
      return;
    }

    // Initialize stock for each product
    for (const product of productsWithoutStock) {
      // Set initial stock based on product category
      let initialStock = 10; // Default stock
      let minLevel = 5;
      let maxLevel = 50;

      // Category-specific stock levels
      switch (product.category) {
        case 'Phones':
          initialStock = 15;
          minLevel = 3;
          maxLevel = 30;
          break;
        case 'Laptops':
          initialStock = 8;
          minLevel = 2;
          maxLevel = 20;
          break;
        case 'Keyboards':
          initialStock = 25;
          minLevel = 5;
          maxLevel = 50;
          break;
        case 'Mice':
          initialStock = 20;
          minLevel = 5;
          maxLevel = 40;
          break;
        case 'Earbuds':
          initialStock = 30;
          minLevel = 10;
          maxLevel = 60;
          break;
        case 'Tablets':
          initialStock = 12;
          minLevel = 3;
          maxLevel = 25;
          break;
      }

      // Create stock info
      const stockInfo = await prisma.stockInfo.create({
        data: {
          productId: product.id,
          quantity: initialStock,
          reserved: 0,
          minLevel: minLevel,
          maxLevel: maxLevel,
          location: 'main_warehouse'
        }
      });

      // Create initial stock movement record
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'INBOUND',
          quantity: initialStock,
          reason: 'Initial stock setup',
          reference: 'SYSTEM_INIT'
        }
      });

      console.log(`✅ Initialized stock for ${product.name}: ${initialStock} units`);
    }

    console.log(`🎉 Successfully initialized stock for ${productsWithoutStock.length} products!`);

    // Show summary
    const totalStock = await prisma.stockInfo.aggregate({
      _sum: {
        quantity: true
      }
    });

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

    console.log(`\n📊 Stock Summary:`);
    console.log(`   Total inventory value: ${totalStock._sum.quantity} units`);
    console.log(`   Products with low stock: ${lowStockProducts.length}`);
    
    if (lowStockProducts.length > 0) {
      console.log(`   Low stock products:`);
      lowStockProducts.forEach(item => {
        console.log(`     - ${item.product.name}: ${item.quantity}/${item.minLevel} (needs restocking)`);
      });
    }

  } catch (error) {
    console.error('❌ Error initializing stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeStock();
