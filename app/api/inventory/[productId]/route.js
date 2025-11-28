import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/inventory/[productId] - Get stock info for a specific product
export async function GET(request, { params }) {
  try {
    const { productId } = await params

    const stockInfo = await prisma.stockInfo.findUnique({
      where: { productId },
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
      }
    })

    if (!stockInfo) {
      return NextResponse.json(
        { error: 'Stock information not found for this product' },
        { status: 404 }
      )
    }

    // Get recent stock movements
    const recentMovements = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      stock: stockInfo,
      recentMovements
    })

  } catch (error) {
    console.error('Error fetching product stock:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product stock' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/[productId] - Update stock settings for a product
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

    const { productId } = await params
    const body = await request.json()
    const { minLevel, maxLevel, location } = body

    const updatedStock = await prisma.stockInfo.update({
      where: { productId },
      data: {
        ...(minLevel !== undefined && { minLevel }),
        ...(maxLevel !== undefined && { maxLevel }),
        ...(location && { location })
      },
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
      }
    })

    return NextResponse.json(updatedStock)

  } catch (error) {
    console.error('Error updating stock settings:', error)
    return NextResponse.json(
      { error: 'Failed to update stock settings' },
      { status: 500 }
    )
  }
}
