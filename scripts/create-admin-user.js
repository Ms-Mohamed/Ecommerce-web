const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');

    const adminUser = await prisma.user.upsert({
      where: { id: 'admin_user_123' },
      update: {},
      create: {
        id: 'admin_user_123',
        name: 'Admin User',
        email: 'admin@example.com',
        image: '/assets/gs_logo.jpg',
        cart: {},
        // In a real app, you'd hash a proper password
        // For now, NextAuth CredentialsProvider accepts any password for this user
      },
    });

    console.log('✅ Admin user created:', adminUser.email);
    console.log('🔑 You can now login as admin with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: (any password for now)');
    console.log('');
    console.log('🚀 Access admin panel at: http://localhost:3000/admin');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
