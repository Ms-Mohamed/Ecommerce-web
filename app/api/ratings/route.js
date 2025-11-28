import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/ratings - Get all ratings for a specific product or user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')

    const where = {}
    
    if (productId) {
      where.productId = productId
    }
    
    if (userId) {
      where.userId = userId
    }
    
    if (orderId) {
      where.orderId = orderId
    }

    const ratings = await prisma.rating.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(ratings)
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}

// POST /api/ratings - Create a new rating
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { rating, review, productId, orderId } = body

    // Validate required fields
    if (!rating || !productId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: rating, productId, orderId' },
        { status: 400 }
      )
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has already rated this product for this order
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_productId_orderId: {
          userId: session.user.id,
          productId: productId,
          orderId: orderId
        }
      }
    })

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this product for this order' },
        { status: 400 }
      )
    }

    // Verify that the order belongs to the user and contains the product
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        orderItems: {
          some: {
            productId: productId
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or does not contain this product' },
        { status: 404 }
      )
    }

    // Create the rating
    const newRating = await prisma.rating.create({
      data: {
        rating: parseInt(rating),
        review: review || '',
        userId: session.user.id,
        productId: productId,
        orderId: orderId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json(newRating, { status: 201 })
  } catch (error) {
    console.error('Error creating rating:', error)
    return NextResponse.json(
      { error: 'Failed to create rating', details: error.message },
      { status: 500 }
    )
  }
}
