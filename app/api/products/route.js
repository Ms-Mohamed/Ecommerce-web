import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withCache } from '@/lib/cache'
import { withPerformanceMonitoring } from '@/lib/performance'
import { warmupDatabase } from '@/lib/db-warmup'

// GET /api/products - Get all products with advanced filtering
async function getProducts(request) {
  try {
    // Warm up database connection on first request
    await warmupDatabase()
    
    const { searchParams } = new URL(request.url)
    
    // Basic pagination
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 12
    const skip = (page - 1) * limit
    
    // Search and filter parameters
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const minPrice = parseFloat(searchParams.get('minPrice'))
    const maxPrice = parseFloat(searchParams.get('maxPrice'))
    const inStock = searchParams.get('inStock')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const storeId = searchParams.get('storeId')
    const featured = searchParams.get('featured')
    const discounted = searchParams.get('discounted')
    const newArrivals = searchParams.get('newArrivals')

    // Build where clause
    const where = {}

    // Stock filter
    if (inStock !== null && inStock !== undefined) {
      where.inStock = inStock === 'true'
    }
    // Remove the default filter - show both in-stock and out-of-stock products

    // Category filter - now supports both category name and categoryId
    if (category && category !== 'all') {
      // Check if it's a category ID (UUID format) or category name
      if (category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        where.categoryId = category
      } else {
        where.category = { name: category }
      }
    }

    // Price range filter
    if (minPrice !== null && !isNaN(minPrice)) {
      where.price = { ...where.price, gte: minPrice }
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      where.price = { ...where.price, lte: maxPrice }
    }

    // Store filter
    if (storeId) {
      where.storeId = storeId
    }

    // Search filter (enhanced)
    if (search && search.trim()) {
      const searchTerm = search.trim()
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { store: { name: { contains: searchTerm, mode: 'insensitive' } } }
      ]
    }

    // Featured filter - for now, we'll use products with higher ratings or newer products
    if (featured === 'true') {
      // For featured products, we'll prioritize products with images and in stock
      where.inStock = true
      where.images = { isEmpty: false } // Products with images
    }

    // Discounted filter - show products where MRP > price (actual discounts)
    if (discounted === 'true') {
      // We'll need to use raw SQL for this comparison since Prisma doesn't support field comparisons directly
      // For now, we'll filter this in the application logic after fetching
    }

    // Build orderBy clause
    let orderBy = {}

    // New Arrivals filter - show products from the last 7 days
    if (newArrivals === 'true') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      where.createdAt = { gte: sevenDaysAgo }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder }
        break
      case 'name':
        orderBy = { name: sortOrder }
        break
      case 'createdAt':
        orderBy = { createdAt: sortOrder }
        break
      case 'rating':
        // For rating, we'll sort by the number of ratings (popularity)
        // Note: This requires a different approach since we can't directly sort by relation count
        orderBy = { createdAt: 'desc' } // Fallback to date sorting for now
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Optimize includes based on what's actually needed
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
          quantity: true,
          minLevel: true,
          maxLevel: true
        }
      }
    }

    // Only include ratings if specifically requested or for detailed views
    if (searchParams.get('includeRatings') === 'true') {
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
        take: 5, // Limit to recent ratings
        orderBy: {
          createdAt: 'desc'
        }
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: includeOptions,
        skip,
        take: limit,
        orderBy
      }),
      prisma.product.count({ where })
    ])

    // Filter for discounted products if requested
    let filteredProducts = products
    let filteredTotal = total
    
    if (discounted === 'true') {
      filteredProducts = products.filter(product => product.mrp > product.price)
      // For now, we'll use the filtered products length as total
      // In a production app, you'd want to use raw SQL for accurate counting
      filteredTotal = filteredProducts.length
    }

    // Get available categories and price ranges for filter options (cached)
    const [categories, priceStats] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.product.aggregate({
        where: { inStock: true }, // Only include in-stock products for price range
        _min: { price: true },
        _max: { price: true }
      })
    ])

    return NextResponse.json({
      products: filteredProducts,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        pages: Math.ceil(filteredTotal / limit)
      },
      filters: {
        categories: categories.map(c => ({ id: c.id, name: c.name })),
        priceRange: {
          min: priceStats._min.price || 0,
          max: priceStats._max.price || 1000
        }
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// Export with caching and performance monitoring
export const GET = withPerformanceMonitoring(
  withCache(getProducts, {
    ttl: 60, // 1 minute cache for faster initial loads
    keyGenerator: (params) => `products:${JSON.stringify(params)}`
  }),
  'GET /api/products'
)

// POST /api/products - Create a new product (requires authentication)
export async function POST(request) {
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

    const body = await request.json()
    const { name, description, mrp, price, images, categoryId, storeId, inStock, stockQuantity } = body

    console.log('Product creation request:', { name, description, mrp, price, images, categoryId, storeId, inStock, stockQuantity })

    if (!name || !description || !mrp || !price || !categoryId || !storeId) {
      console.log('Missing required fields:', { name: !!name, description: !!description, mrp: !!mrp, price: !!price, categoryId: !!categoryId, storeId: !!storeId })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ensure images is an array (for PostgreSQL compatibility)
    const imageArray = Array.isArray(images) ? images.filter(img => img && img.trim() !== '') : [images].filter(img => img && img.trim() !== '')
    
    // If no valid images, use a default placeholder
    const finalImages = imageArray.length > 0 ? imageArray : ['/assets/product_img1.png']

    // Create product and stock info in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the product
      const product = await tx.product.create({
        data: {
          name,
          description,
          mrp: parseFloat(mrp),
          price: parseFloat(price),
          images: finalImages,
          categoryId,
          storeId,
          inStock: inStock !== undefined ? inStock : true
        },
        include: {
          store: true,
          category: true
        }
      })

      // Create stock information
      const stockQuantityValue = stockQuantity ? parseInt(stockQuantity) : 0
      await tx.stockInfo.create({
        data: {
          productId: product.id,
          quantity: stockQuantityValue,
          reserved: 0,
          minLevel: 5,
          maxLevel: 100,
          location: 'main_warehouse'
        }
      })

      return product
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    )
  }
}
