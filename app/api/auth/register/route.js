import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { name, email, password, phone, address } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and address in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          email,
          image: '/assets/gs_logo.jpg',
          password: hashedPassword,
          cart: {}
        }
      })

      // Create address if provided
      let userAddress = null
      if (address && phone) {
        userAddress = await tx.address.create({
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: phone,
            street: address.street,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: address.country || 'United States'
          }
        })
      }

      return { user, address: userAddress }
    })

    console.log('User created:', result.user.email, 'Password hash:', hashedPassword)
    if (result.address) {
      console.log('Address created:', result.address.id)
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        image: result.user.image
      },
      address: result.address
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
