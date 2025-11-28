import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PATCH /api/admin/orders/[orderId] - Update order status (admin only)
export async function PATCH(request, { params }) {
  try {
    console.log('🔍 Admin Orders API - Starting PATCH request...')
    
    const session = await getServerSession(authOptions)
    console.log('🔍 Admin Orders API - Session:', session ? 'Found' : 'Not found')
    console.log('🔍 Admin Orders API - User email:', session?.user?.email)

    if (!session?.user?.id) {
      console.log('❌ Admin Orders API - Unauthorized: No session or user ID')
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    if (session.user.email !== 'admin@example.com') {
      console.log('❌ Admin Orders API - Unauthorized: Not admin user')
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { orderId } = await params
    const { status } = await request.json()
    
    console.log('🔍 Admin Orders API - Order ID:', orderId)
    console.log('🔍 Admin Orders API - New Status:', status)

    if (!orderId) {
      console.log('❌ Admin Orders API - Missing order ID')
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      console.log('❌ Admin Orders API - Missing status')
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status and handle stock changes
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Get current order with items
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true
            }
          },
          store: true,
          address: true
        }
      })

      // Handle stock changes based on status transition
      const oldStatus = currentOrder.status
      const newStatus = status

      // If order was cancelled and is now being processed/shipped, reduce stock
      if ((oldStatus === 'CANCELLED' || oldStatus === 'ORDER_PLACED') && 
          (newStatus === 'PROCESSING' || newStatus === 'SHIPPED' || newStatus === 'DELIVERED')) {
        
        for (const orderItem of currentOrder.orderItems) {
          const stockInfo = await tx.stockInfo.findUnique({
            where: { productId: orderItem.productId }
          })

          if (stockInfo && stockInfo.quantity >= orderItem.quantity) {
            // Reduce stock
            await tx.stockInfo.update({
              where: { productId: orderItem.productId },
              data: {
                quantity: stockInfo.quantity - orderItem.quantity,
                lastUpdated: new Date()
              }
            })

            // Create stock movement record
            await tx.stockMovement.create({
              data: {
                productId: orderItem.productId,
                type: 'OUTBOUND',
                quantity: orderItem.quantity,
                reason: `Order ${orderId} status changed to ${newStatus}`,
                reference: orderId
              }
            })

            // Update product inStock status
            const updatedStock = await tx.stockInfo.findUnique({
              where: { productId: orderItem.productId }
            })
            
            await tx.product.update({
              where: { id: orderItem.productId },
              data: {
                inStock: updatedStock.quantity > 0
              }
            })
          }
        }
      }

      // If order is being cancelled, restore stock
      if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
        for (const orderItem of currentOrder.orderItems) {
          const stockInfo = await tx.stockInfo.findUnique({
            where: { productId: orderItem.productId }
          })

          if (stockInfo) {
            // Restore stock
            await tx.stockInfo.update({
              where: { productId: orderItem.productId },
              data: {
                quantity: stockInfo.quantity + orderItem.quantity,
                lastUpdated: new Date()
              }
            })

            // Create stock movement record
            await tx.stockMovement.create({
              data: {
                productId: orderItem.productId,
                type: 'RETURN',
                quantity: orderItem.quantity,
                reason: `Order ${orderId} cancelled - stock restored`,
                reference: orderId
              }
            })

            // Update product inStock status
            await tx.product.update({
              where: { id: orderItem.productId },
              data: {
                inStock: true
              }
            })
          }
        }
      }

      return updatedOrder
    })

    // Order status updated successfully
    console.log('✅ Admin Orders API - Order status updated to:', status)

    return NextResponse.json({ 
      message: 'Order status updated successfully',
      order: updatedOrder 
    }, { status: 200 })
  } catch (error) {
    console.error('❌ Admin Orders API - Error updating order status:', error)
    console.error('❌ Admin Orders API - Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        error: 'Failed to update order status',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/orders/[orderId] - Delete an order (admin only)
export async function DELETE(request, { params }) {
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

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Delete order items first, then the order, and restore stock
    await prisma.$transaction(async (tx) => {
      // Get order items to restore stock
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: orderId },
        include: {
          product: true
        }
      })

      // Restore stock for each item
      for (const orderItem of orderItems) {
        const stockInfo = await tx.stockInfo.findUnique({
          where: { productId: orderItem.productId }
        })

        if (stockInfo) {
          // Restore stock
          await tx.stockInfo.update({
            where: { productId: orderItem.productId },
            data: {
              quantity: stockInfo.quantity + orderItem.quantity,
              lastUpdated: new Date()
            }
          })

          // Create stock movement record
          await tx.stockMovement.create({
            data: {
              productId: orderItem.productId,
              type: 'RETURN',
              quantity: orderItem.quantity,
              reason: `Order ${orderId} deleted - stock restored`,
              reference: orderId
            }
          })

          // Update product inStock status
          await tx.product.update({
            where: { id: orderItem.productId },
            data: {
              inStock: true
            }
          })
        }
      }

      // Delete order items
      await tx.orderItem.deleteMany({
        where: { orderId: orderId }
      })
      
      // Delete the order
      await tx.order.delete({
        where: { id: orderId }
      })
    })

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
