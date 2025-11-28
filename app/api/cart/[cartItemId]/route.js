import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT /api/cart/[cartItemId] - Update cart item quantity
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { cartItemId } = await params
    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      )
    }

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cart.findFirst({
      where: {
        id: cartItemId,
        userId: session.user.id
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    const updatedCartItem = await prisma.cart.update({
      where: { id: cartItemId },
      data: { quantity: quantity },
      include: {
        product: true
      }
    })

    return NextResponse.json(updatedCartItem)
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[cartItemId] - Remove item from cart
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { cartItemId } = await params

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cart.findFirst({
      where: {
        id: cartItemId,
        userId: session.user.id
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    await prisma.cart.delete({
      where: { id: cartItemId }
    })

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}
