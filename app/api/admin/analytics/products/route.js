import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/analytics/products - Get detailed product analytics - Optimized
async function getProductAnalytics(request) {
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

    // Optimized: Use parallel queries and selective fields
    const [products, orderItemsData, ratingsData] = await Promise.all([
      // Get products with minimal includes
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          mrp: true,
          images: true,
          inStock: true,
          createdAt: true,
          updatedAt: true,
          store: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          stockInfo: {
            select: {
              quantity: true,
              reserved: true,
              minLevel: true,
              maxLevel: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      
      // Get order items separately (more efficient)
      // Note: OrderItem has composite key [orderId, productId], no id field
      prisma.orderItem.findMany({
        select: {
          orderId: true,
          productId: true,
          quantity: true,
          price: true,
          order: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              total: true
            }
          }
        }
      }),
      
      // Get ratings separately (more efficient)
      prisma.rating.findMany({
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          productId: true,
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    // Create lookup maps for efficient data access
    const orderItemsByProduct = new Map()
    orderItemsData.forEach(item => {
      if (!orderItemsByProduct.has(item.productId)) {
        orderItemsByProduct.set(item.productId, [])
      }
      orderItemsByProduct.get(item.productId).push(item)
    })

    const ratingsByProduct = new Map()
    ratingsData.forEach(rating => {
      if (!ratingsByProduct.has(rating.productId)) {
        ratingsByProduct.set(rating.productId, [])
      }
      ratingsByProduct.get(rating.productId).push(rating)
    })

    // Calculate analytics for each product
    const productsWithAnalytics = products.map(product => {
      // Get ratings for this product
      const ratings = ratingsByProduct.get(product.id) || []
      const totalRatings = ratings.length
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : 0
      
      // Get order items for this product
      const orderItems = orderItemsByProduct.get(product.id) || []
      const totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      // Calculate sales by status
      const salesByStatus = orderItems.reduce((acc, item) => {
        const status = item.order.status
        acc[status] = (acc[status] || 0) + item.quantity
        return acc
      }, {})
      
      // Calculate recent sales (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentSales = orderItems.filter(item => 
        new Date(item.order.createdAt) >= thirtyDaysAgo
      ).reduce((sum, item) => sum + item.quantity, 0)
      
      // Calculate stock status
      const stockInfo = product.stockInfo
      const stockStatus = stockInfo ? {
        quantity: stockInfo.quantity,
        reserved: stockInfo.reserved,
        available: stockInfo.quantity - stockInfo.reserved,
        minLevel: stockInfo.minLevel,
        maxLevel: stockInfo.maxLevel,
        isLowStock: stockInfo.quantity <= stockInfo.minLevel,
        isOutOfStock: stockInfo.quantity === 0
      } : {
        quantity: 0,
        reserved: 0,
        available: 0,
        minLevel: 0,
        maxLevel: 0,
        isLowStock: true,
        isOutOfStock: true
      }
      
      // Calculate profit margin
      const profitMargin = product.mrp > 0 
        ? ((product.mrp - product.price) / product.mrp * 100).toFixed(2)
        : 0
      
      // Get recent reviews (last 5)
      const recentReviews = ratings.slice(0, 5).map(rating => ({
        id: rating.id,
        rating: rating.rating,
        review: rating.review,
        userName: rating.user.name,
        createdAt: rating.createdAt
      }))
      
      // Calculate rating distribution
      const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
        stars: star,
        count: ratings.filter(r => r.rating === star).length,
        percentage: totalRatings > 0 
          ? (ratings.filter(r => r.rating === star).length / totalRatings * 100).toFixed(1)
          : 0
      }))
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        mrp: product.mrp,
        profitMargin: parseFloat(profitMargin),
        images: product.images,
        inStock: product.inStock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        
        // Store information
        store: product.store,
        
        // Category information
        category: product.category,
        
        // Rating analytics
        ratingAnalytics: {
          totalRatings,
          averageRating: parseFloat(averageRating.toFixed(2)),
          ratingDistribution,
          recentReviews
        },
        
        // Sales analytics
        salesAnalytics: {
          totalSold,
          totalRevenue,
          recentSales,
          salesByStatus,
          orderCount: orderItems.length
        },
        
        // Stock analytics
        stockAnalytics: stockStatus,
        
        // Performance metrics
        performance: {
          conversionRate: totalSold > 0 ? (totalRatings / totalSold * 100).toFixed(2) : 0,
          revenuePerSale: totalSold > 0 ? (totalRevenue / totalSold).toFixed(2) : 0,
          daysSinceCreated: Math.floor((new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24))
        }
      }
    })

    // Calculate overall statistics
    const overallStats = {
      totalProducts: products.length,
      totalRevenue: productsWithAnalytics.reduce((sum, p) => sum + p.salesAnalytics.totalRevenue, 0),
      totalSold: productsWithAnalytics.reduce((sum, p) => sum + p.salesAnalytics.totalSold, 0),
      totalRatings: productsWithAnalytics.reduce((sum, p) => sum + p.ratingAnalytics.totalRatings, 0),
      averageRating: productsWithAnalytics.length > 0 
        ? productsWithAnalytics.reduce((sum, p) => sum + p.ratingAnalytics.averageRating, 0) / productsWithAnalytics.length
        : 0,
      lowStockProducts: productsWithAnalytics.filter(p => p.stockAnalytics.isLowStock).length,
      outOfStockProducts: productsWithAnalytics.filter(p => p.stockAnalytics.isOutOfStock).length
    }

    return NextResponse.json({
      products: productsWithAnalytics,
      overallStats,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching product analytics:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: 'Failed to fetch product analytics', details: error.message },
      { status: 500 }
    )
  }
}

// Export handler directly (caching temporarily disabled for stability)
export async function GET(request) {
  return await getProductAnalytics(request)
}
