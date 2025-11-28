import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/cart - Get user's cart items
export async function GET(request) {
  try {
    console.log('Cart API - Getting session...')
    const session = await getServerSession(authOptions)
    console.log('Cart API - Session:', session)

    if (!session?.user?.id) {
      console.log('Cart API - No session or user ID')
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    console.log('Cart API - Fetching cart for user:', session.user.id)
    const cartItems = await prisma.cart.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            store: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Cart API - Found cart items:', cartItems.length)
    console.log('Cart API - Sample cart item:', cartItems[0] ? {
      productId: cartItems[0].product?.id,
      productName: cartItems[0].product?.name,
      storeId: cartItems[0].product?.storeId,
      storeName: cartItems[0].product?.store?.name
    } : 'No items')
    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        stockInfo: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check stock availability
    if (product.stockInfo && product.stockInfo.quantity < quantity) {
      return NextResponse.json(
        { error: `Only ${product.stockInfo.quantity} units available in stock` },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    })

    if (existingCartItem) {
      // Update quantity
      const updatedCartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: {
          product: true
        }
      })
      return NextResponse.json(updatedCartItem)
    } else {
      // Create new cart item
      const newCartItem = await prisma.cart.create({
        data: {
          userId: session.user.id,
          productId: productId,
          quantity: quantity
        },
        include: {
          product: true
        }
      })
      return NextResponse.json(newCartItem, { status: 201 })
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.cart.deleteMany({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ message: 'Cart cleared successfully' })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
