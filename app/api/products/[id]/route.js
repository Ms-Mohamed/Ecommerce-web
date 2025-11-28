import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/products/[id] - Get a single product by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
        category: true,
        rating: {
          include: {
            user: true
          },
          orderBy: { createdAt: 'desc' }
        },
        stockInfo: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(request, { params }) {
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

    const { id } = await params
    const body = await request.json()
    const { name, description, mrp, price, images, categoryId, inStock, stockQuantity } = body

    console.log('🔍 Products API - Updating product:', { id, stockQuantity, categoryId, body })

    // Update product and stock info in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the product
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(mrp && { mrp: parseFloat(mrp) }),
          ...(price && { price: parseFloat(price) }),
          ...(images && { images: Array.isArray(images) ? images : [images] }),
          ...(categoryId && { categoryId }),
          ...(inStock !== undefined && { inStock })
        },
        include: {
          store: true,
          category: true,
          stockInfo: true
        }
      })

      // Update stock information if stockQuantity is provided
      if (stockQuantity !== undefined) {
        const stockQuantityValue = parseInt(stockQuantity) || 0
        
        // Check if stock info exists
        const existingStockInfo = await tx.stockInfo.findUnique({
          where: { productId: id }
        })

        if (existingStockInfo) {
          // Update existing stock info
          await tx.stockInfo.update({
            where: { productId: id },
            data: {
              quantity: stockQuantityValue,
              lastUpdated: new Date()
            }
          })
          console.log('✅ Products API - Updated existing stock info')
        } else {
          // Create new stock info
          await tx.stockInfo.create({
            data: {
              productId: id,
              quantity: stockQuantityValue,
              reserved: 0,
              minLevel: 5,
              maxLevel: 100,
              location: 'main_warehouse'
            }
          })
          console.log('✅ Products API - Created new stock info')
        }

        // Update product inStock status based on quantity
        await tx.product.update({
          where: { id },
          data: {
            inStock: stockQuantityValue > 0
          }
        })
        console.log('✅ Products API - Updated product inStock status')
      }

      return product
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request, { params }) {
  try {
    console.log('🔍 Products API - Starting DELETE request...')
    
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log('❌ Products API - Unauthorized: No session or user ID')
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    if (session.user.email !== 'admin@example.com') {
      console.log('❌ Products API - Unauthorized: Not admin user')
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    console.log('🔍 Products API - Deleting product ID:', id)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        stockInfo: true,
        cart: true,
        orderItems: true,
        rating: true
      }
    })

    if (!existingProduct) {
      console.log('❌ Products API - Product not found')
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete related records first, then the product
    await prisma.$transaction(async (tx) => {
      // Delete cart items
      if (existingProduct.cart.length > 0) {
        await tx.cart.deleteMany({
          where: { productId: id }
        })
        console.log('✅ Products API - Deleted cart items')
      }

      // Delete ratings
      if (existingProduct.rating.length > 0) {
        await tx.rating.deleteMany({
          where: { productId: id }
        })
        console.log('✅ Products API - Deleted ratings')
      }

      // Delete stock info
      if (existingProduct.stockInfo) {
        await tx.stockInfo.delete({
          where: { productId: id }
        })
        console.log('✅ Products API - Deleted stock info')
      }

      // Delete stock movements
      await tx.stockMovement.deleteMany({
        where: { productId: id }
      })
      console.log('✅ Products API - Deleted stock movements')

      // Delete order items (these will cascade from orders, but let's be explicit)
      await tx.orderItem.deleteMany({
        where: { productId: id }
      })
      console.log('✅ Products API - Deleted order items')

      // Finally delete the product
      await tx.product.delete({
        where: { id }
      })
      console.log('✅ Products API - Deleted product')
    })

    console.log('✅ Products API - Product deleted successfully')
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('❌ Products API - Error deleting product:', error)
    console.error('❌ Products API - Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        error: 'Failed to delete product',
        details: error.message
      },
      { status: 500 }
    )
  }
}
