import { prisma } from './prisma'

// Database utility functions for common operations
export class DatabaseUtils {
  // Optimized product queries
  static async getProductsOptimized(params = {}) {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      storeId,
      includeRatings = false
    } = params

    const skip = (page - 1) * limit
    const where = {}

    // Build optimized where clause
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        where.categoryId = category
      } else {
        where.category = { name: category }
      }
    }

    if (search && search.trim()) {
      const searchTerm = search.trim()
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    if (minPrice !== null && !isNaN(minPrice)) {
      where.price = { ...where.price, gte: minPrice }
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      where.price = { ...where.price, lte: maxPrice }
    }

    if (inStock !== null && inStock !== undefined) {
      where.inStock = inStock === 'true'
    }

    if (storeId) {
      where.storeId = storeId
    }

    // Optimized include options
    const includeOptions = {
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
          quantity: true
        }
      }
    }

    if (includeRatings) {
      includeOptions.rating = {
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          user: {
            select: {
              name: true
            }
          }
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      }
    }

    return await prisma.product.findMany({
      where,
      include: includeOptions,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }

  // Optimized cart queries
  static async getCartOptimized(userId) {
    return await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            inStock: true,
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
  }

  // Batch operations for better performance
  static async batchUpdateStock(productUpdates) {
    const operations = productUpdates.map(update => 
      prisma.stockInfo.update({
        where: { productId: update.productId },
        data: { quantity: update.quantity }
      })
    )
    
    return await prisma.$transaction(operations)
  }

  // Get categories with product counts
  static async getCategoriesWithCounts() {
    return await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: {
              where: { inStock: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  }
}

// Connection health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'connected', timestamp: new Date().toISOString() }
  } catch (error) {
    return { status: 'disconnected', error: error.message, timestamp: new Date().toISOString() }
  }
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  try {
    await prisma.$disconnect()
    console.log('Database connection closed gracefully')
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}
