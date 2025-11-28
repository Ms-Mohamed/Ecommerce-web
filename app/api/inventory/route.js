import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/inventory - Get inventory overview
export async function GET(request) {
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

    const { searchParams } = new URL(request.url)
    const lowStock = searchParams.get('lowStock') === 'true'
    const category = searchParams.get('category')

    // Build where clause
    const where = {}
    if (category && category !== 'all') {
      where.product = {
        category: category
      }
    }

    // Get inventory with product details
    let inventory = await prisma.stockInfo.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            inStock: true
          }
        }
      },
      orderBy: {
        quantity: 'asc'
      }
    })

    // Filter for low stock if requested
    if (lowStock) {
      inventory = inventory.filter(item => item.quantity <= item.minLevel)
    }

    // Get inventory statistics
    const stats = await prisma.stockInfo.aggregate({
      _sum: {
        quantity: true
      },
      _avg: {
        quantity: true
      }
    })

    const totalProducts = await prisma.stockInfo.count()
    
    // Get all stock info to calculate low stock count
    const allStockInfo = await prisma.stockInfo.findMany()
    const lowStockCount = allStockInfo.filter(stock => stock.quantity <= stock.minLevel).length

    const outOfStockCount = await prisma.stockInfo.count({
      where: {
        quantity: 0
      }
    })

    return NextResponse.json({
      inventory,
      stats: {
        totalProducts,
        totalStock: stats._sum.quantity || 0,
        averageStock: Math.round(stats._avg.quantity || 0),
        lowStockCount,
        outOfStockCount
      }
    })

  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

// POST /api/inventory - Update stock levels
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
    const { productId, quantity, type, reason, reference } = body

    if (!productId || quantity === undefined || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, quantity, type' },
        { status: 400 }
      )
    }

    // Get current stock info
    const currentStock = await prisma.stockInfo.findUnique({
      where: { productId }
    })

    if (!currentStock) {
      return NextResponse.json(
        { error: 'Product not found in inventory' },
        { status: 404 }
      )
    }

    // Calculate new quantity based on movement type
    let newQuantity = currentStock.quantity
    switch (type) {
      case 'INBOUND':
      case 'RETURN':
        newQuantity += quantity
        break
      case 'OUTBOUND':
      case 'DAMAGE':
        newQuantity -= quantity
        break
      case 'ADJUSTMENT':
        newQuantity = quantity // Direct adjustment
        break
      default:
        return NextResponse.json(
          { error: 'Invalid movement type' },
          { status: 400 }
        )
    }

    // Ensure quantity doesn't go below 0
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Insufficient stock for this operation' },
        { status: 400 }
      )
    }

    // Update stock info and create movement record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update stock info
      const updatedStock = await tx.stockInfo.update({
        where: { productId },
        data: {
          quantity: newQuantity,
          lastUpdated: new Date()
        }
      })

      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity: Math.abs(quantity),
          reason: reason || `Stock ${type.toLowerCase()}`,
          reference: reference || null
        }
      })

      // Update product inStock status
      await tx.product.update({
        where: { id: productId },
        data: {
          inStock: newQuantity > 0
        }
      })

      return { updatedStock, movement }
    })

    return NextResponse.json({
      success: true,
      stock: result.updatedStock,
      movement: result.movement
    })

  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}
