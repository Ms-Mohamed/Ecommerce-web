import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST /api/orders/[orderId]/stock - Update stock based on order status change
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    if (session.user.email !== 'admin@example.com') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { orderId } = await params
    const { action, reason } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (restore, reduce, or adjust)' },
        { status: 400 }
      )
    }

    // Get the order with its items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const results = await prisma.$transaction(async (tx) => {
      const stockUpdates = []

      for (const orderItem of order.orderItems) {
        const stockInfo = await tx.stockInfo.findUnique({
          where: { productId: orderItem.productId }
        })

        if (!stockInfo) {
          throw new Error(`Stock info not found for product ${orderItem.productId}`)
        }

        let newQuantity = stockInfo.quantity
        let movementType = 'ADJUSTMENT'
        let movementReason = reason || 'Stock adjustment'

        switch (action) {
          case 'restore':
            // Restore stock (for cancelled orders)
            newQuantity = stockInfo.quantity + orderItem.quantity
            movementType = 'RETURN'
            movementReason = reason || 'Order cancelled - stock restored'
            break

          case 'reduce':
            // Reduce stock (for confirmed orders)
            if (stockInfo.quantity < orderItem.quantity) {
              throw new Error(`Insufficient stock for ${orderItem.product.name}`)
            }
            newQuantity = stockInfo.quantity - orderItem.quantity
            movementType = 'OUTBOUND'
            movementReason = reason || 'Order confirmed - stock reduced'
            break

          case 'adjust':
            // Direct adjustment
            const { quantity } = await request.json()
            if (quantity === undefined) {
              throw new Error('Quantity is required for adjust action')
            }
            newQuantity = quantity
            movementType = 'ADJUSTMENT'
            movementReason = reason || 'Manual stock adjustment'
            break

          default:
            throw new Error('Invalid action. Use: restore, reduce, or adjust')
        }

        // Update stock info
        const updatedStock = await tx.stockInfo.update({
          where: { productId: orderItem.productId },
          data: {
            quantity: newQuantity,
            lastUpdated: new Date()
          }
        })

        // Create stock movement record
        const movement = await tx.stockMovement.create({
          data: {
            productId: orderItem.productId,
            type: movementType,
            quantity: Math.abs(newQuantity - stockInfo.quantity),
            reason: movementReason,
            reference: orderId
          }
        })

        // Update product inStock status
        await tx.product.update({
          where: { id: orderItem.productId },
          data: {
            inStock: newQuantity > 0
          }
        })

        stockUpdates.push({
          product: orderItem.product.name,
          oldQuantity: stockInfo.quantity,
          newQuantity: newQuantity,
          movement: movement
        })
      }

      return stockUpdates
    })

    return NextResponse.json({
      success: true,
      message: `Stock ${action} completed successfully`,
      updates: results
    })

  } catch (error) {
    console.error('Error updating stock:', error)
    return NextResponse.json(
      { error: 'Failed to update stock', details: error.message },
      { status: 500 }
    )
  }
}
