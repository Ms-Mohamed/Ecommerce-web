const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setAdminPassword() {
  try {
    const adminEmail = 'admin@example.com'
    const newPassword = 'admin123' // You can change this password
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // First find the user by email
    const user = await prisma.user.findFirst({
      where: { email: adminEmail }
    })
    
    if (!user) {
      console.log('❌ Admin user not found!')
      return
    }
    
    // Update the admin user with the hashed password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Admin password set successfully!')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${newPassword}`)
    console.log(`👤 User: ${updatedUser.name}`)
    
  } catch (error) {
    console.error('❌ Error setting admin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminPassword()
