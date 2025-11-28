const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    const email = 'test@example.com'
    const password = 'test123'
    const name = 'Test User'
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    })
    
    if (existingUser) {
      console.log('❌ User already exists!')
      return
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create the user
    const newUser = await prisma.user.create({
      data: {
        id: `user_${Date.now()}`,
        email,
        name,
        image: '/assets/default-avatar.png',
        password: hashedPassword
      }
    })
    
    console.log('✅ Test user created successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`👤 Name: ${name}`)
    console.log(`🆔 ID: ${newUser.id}`)
    
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()