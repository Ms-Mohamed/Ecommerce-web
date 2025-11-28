const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('👥 Checking all users in database...');

    const users = await prisma.user.findMany({
      orderBy: { id: 'desc' }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Cart: ${JSON.stringify(user.cart)}`);
      console.log(`   Image: ${user.image}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
