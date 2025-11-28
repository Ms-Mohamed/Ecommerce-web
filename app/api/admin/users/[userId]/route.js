import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// DELETE /api/admin/users/[userId] - Delete a user (admin only)
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

    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent deleting the admin user itself
    if (userId === 'admin_user_123' || userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete the primary admin user or yourself' },
        { status: 403 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ratings: true,
        Address: true,
        store: true,
        buyerOrders: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete related records first to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete user's ratings
      if (user.ratings.length > 0) {
        await tx.rating.deleteMany({
          where: { userId: userId }
        })
      }

      // Delete user's addresses
      if (user.Address.length > 0) {
        await tx.address.deleteMany({
          where: { userId: userId }
        })
      }

      // Delete user's orders and order items
      if (user.buyerOrders.length > 0) {
        for (const order of user.buyerOrders) {
          // Delete order items first
          await tx.orderItem.deleteMany({
            where: { orderId: order.id }
          })
          // Then delete the order
          await tx.order.delete({
            where: { id: order.id }
          })
        }
      }

      // Delete user's store if it exists
      if (user.store) {
        // Delete products in the store first
        await tx.product.deleteMany({
          where: { storeId: user.store.id }
        })
        // Then delete the store
        await tx.store.delete({
          where: { id: user.store.id }
        })
      }

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json(
      { error: `Failed to delete user: ${error.message}` },
      { status: 500 }
    )
  }
}
