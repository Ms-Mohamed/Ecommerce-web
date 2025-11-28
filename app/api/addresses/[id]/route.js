import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/addresses/[id] - Get a specific address
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const address = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id // Ensure user can only access their own addresses
      }
    })

    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(address)
  } catch (error) {
    console.error('Error fetching address:', error)
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    )
  }
}

// PUT /api/addresses/[id] - Update a specific address
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, street, city, state, zip, country, phone } = body

    if (!name || !email || !street || !city || !state || !zip || !country || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if address exists and belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    const updatedAddress = await prisma.address.update({
      where: { id: id },
      data: {
        name,
        email,
        street,
        city,
        state,
        zip,
        country,
        phone
      }
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

// DELETE /api/addresses/[id] - Delete a specific address
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if address exists and belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    await prisma.address.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}
