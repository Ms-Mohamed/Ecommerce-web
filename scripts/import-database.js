const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📥 Importing GoCart database...\n');
    
    // Read export file
    const exportPath = path.join(__dirname, '..', 'database-export.json');
    
    if (!fs.existsSync(exportPath)) {
      console.error('❌ database-export.json not found!');
      console.log('   Please copy the export file to the project root directory.');
      return;
    }
    
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    console.log(`📊 Importing data from: ${exportData.exportedAt}`);
    console.log(`📦 Version: ${exportData.version}\n`);
    
    // Import in correct order (respecting foreign key constraints)
    console.log('🔄 Importing users...');
    for (const user of exportData.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`✅ Imported ${exportData.users.length} users`);
    
    console.log('🔄 Importing categories...');
    for (const category of exportData.categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    console.log(`✅ Imported ${exportData.categories.length} categories`);
    
    console.log('🔄 Importing stores...');
    for (const store of exportData.stores) {
      await prisma.store.upsert({
        where: { id: store.id },
        update: store,
        create: store
      });
    }
    console.log(`✅ Imported ${exportData.stores.length} stores`);
    
    console.log('🔄 Importing products...');
    for (const product of exportData.products) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`✅ Imported ${exportData.products.length} products`);
    
    console.log('🔄 Importing addresses...');
    for (const address of exportData.addresses) {
      await prisma.address.upsert({
        where: { id: address.id },
        update: address,
        create: address
      });
    }
    console.log(`✅ Imported ${exportData.addresses.length} addresses`);
    
    console.log('🔄 Importing orders...');
    for (const order of exportData.orders) {
      await prisma.order.upsert({
        where: { id: order.id },
        update: order,
        create: order
      });
    }
    console.log(`✅ Imported ${exportData.orders.length} orders`);
    
    console.log('🔄 Importing order items...');
    for (const orderItem of exportData.orderItems) {
      await prisma.orderItem.upsert({
        where: { 
          orderId_productId: {
            orderId: orderItem.orderId,
            productId: orderItem.productId
          }
        },
        update: orderItem,
        create: orderItem
      });
    }
    console.log(`✅ Imported ${exportData.orderItems.length} order items`);
    
    console.log('🔄 Importing ratings...');
    for (const rating of exportData.ratings) {
      await prisma.rating.upsert({
        where: { id: rating.id },
        update: rating,
        create: rating
      });
    }
    console.log(`✅ Imported ${exportData.ratings.length} ratings`);
    
    console.log('🔄 Importing cart items...');
    for (const cartItem of exportData.cart) {
      await prisma.cart.upsert({
        where: { id: cartItem.id },
        update: cartItem,
        create: cartItem
      });
    }
    console.log(`✅ Imported ${exportData.cart.length} cart items`);
    
    console.log('🔄 Importing coupons...');
    for (const coupon of exportData.coupons) {
      await prisma.coupon.upsert({
        where: { code: coupon.code },
        update: coupon,
        create: coupon
      });
    }
    console.log(`✅ Imported ${exportData.coupons.length} coupons`);
    
    console.log('🔄 Importing coupon usages...');
    for (const couponUsage of exportData.couponUsages) {
      await prisma.couponUsage.upsert({
        where: { id: couponUsage.id },
        update: couponUsage,
        create: couponUsage
      });
    }
    console.log(`✅ Imported ${exportData.couponUsages.length} coupon usages`);
    
    console.log('🔄 Importing stock info...');
    for (const stockInfo of exportData.stockInfo) {
      await prisma.stockInfo.upsert({
        where: { productId: stockInfo.productId },
        update: stockInfo,
        create: stockInfo
      });
    }
    console.log(`✅ Imported ${exportData.stockInfo.length} stock info records`);
    
    console.log('🔄 Importing stock movements...');
    for (const stockMovement of exportData.stockMovements) {
      await prisma.stockMovement.upsert({
        where: { id: stockMovement.id },
        update: stockMovement,
        create: stockMovement
      });
    }
    console.log(`✅ Imported ${exportData.stockMovements.length} stock movements`);
    
    console.log('\n🎉 Database import completed successfully!');
    console.log('\n📊 Import Summary:');
    console.log(`   - Users: ${exportData.users.length}`);
    console.log(`   - Categories: ${exportData.categories.length}`);
    console.log(`   - Stores: ${exportData.stores.length}`);
    console.log(`   - Products: ${exportData.products.length}`);
    console.log(`   - Orders: ${exportData.orders.length}`);
    console.log(`   - Coupons: ${exportData.coupons.length}`);
    
    console.log('\n✅ Your database is now ready on the new PC!');
    
  } catch (error) {
    console.error('❌ Error importing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importDatabase();
