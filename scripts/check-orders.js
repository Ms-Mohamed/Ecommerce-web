const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  try {
    console.log('📦 Checking all orders in database...');

    const orders = await prisma.order.findMany({
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${orders.length} orders:`);
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   User: ${order.user?.name || 'No user'} (${order.user?.email || 'No email'})`);
      console.log(`   Total: $${order.total}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Method: ${order.paymentMethod}`);
      console.log(`   Created: ${order.createdAt}`);
      console.log(`   Items: ${order.orderItems.length}`);
      order.orderItems.forEach((item, itemIndex) => {
        console.log(`     ${itemIndex + 1}. ${item.product?.name || 'Unknown product'} x${item.quantity} - $${item.price}`);
      });
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ Error checking orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
