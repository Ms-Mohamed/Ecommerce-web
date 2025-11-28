const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📤 Exporting GoCart database...\n');
    
    // Export all data
    const exportData = {
      users: await prisma.user.findMany(),
      categories: await prisma.category.findMany(),
      stores: await prisma.store.findMany(),
      products: await prisma.product.findMany(),
      orders: await prisma.order.findMany(),
      orderItems: await prisma.orderItem.findMany(),
      ratings: await prisma.rating.findMany(),
      addresses: await prisma.address.findMany(),
      cart: await prisma.cart.findMany(),
      coupons: await prisma.coupon.findMany(),
      couponUsages: await prisma.couponUsage.findMany(),
      stockInfo: await prisma.stockInfo.findMany(),
      stockMovements: await prisma.stockMovement.findMany(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // Save to file
    const exportPath = path.join(__dirname, '..', 'database-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log('✅ Database exported successfully!');
    console.log(`📁 Export file: ${exportPath}`);
    console.log(`📊 Records exported:`);
    console.log(`   - Users: ${exportData.users.length}`);
    console.log(`   - Categories: ${exportData.categories.length}`);
    console.log(`   - Stores: ${exportData.stores.length}`);
    console.log(`   - Products: ${exportData.products.length}`);
    console.log(`   - Orders: ${exportData.orders.length}`);
    console.log(`   - Coupons: ${exportData.coupons.length}`);
    
    console.log('\n📋 To import on new PC:');
    console.log('   1. Copy database-export.json to new PC');
    console.log('   2. Run: node scripts/import-database.js');
    
  } catch (error) {
    console.error('❌ Error exporting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase();
