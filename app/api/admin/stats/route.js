import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/stats - Get dashboard statistics (optimized single endpoint)
async function getStats(request) {
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

    // Use parallel queries for better performance
    const [ordersCount, productsCount, usersCount, storesCount, revenueResult, recentOrders] = await Promise.all([
      // Count orders
      prisma.order.count(),
      
      // Count products
      prisma.product.count(),
      
      // Count users
      prisma.user.count(),
      
      // Count stores
      prisma.store.count(),
      
      // Get total revenue (only sum, no full data)
      prisma.order.aggregate({
        _sum: {
          total: true
        }
      }),
      
      // Get recent orders for chart (limited, selective fields only)
      prisma.order.findMany({
        select: {
          id: true,
          total: true,
          createdAt: true,
          status: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to recent 100 orders for dashboard
      })
    ])

    const stats = {
      products: productsCount,
      revenue: revenueResult._sum.total || 0,
      orders: ordersCount,
      stores: storesCount,
      recentOrders: recentOrders // For chart data
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    )
  }
}

// Export handler directly (caching temporarily disabled for stability)
export async function GET(request) {
  return await getStats(request)
}

