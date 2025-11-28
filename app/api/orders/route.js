import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/orders - Get user's orders (requires authentication)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        store: true,
        address: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create a new order
export async function POST(request) {
  try {
    console.log('🔍 Orders API - Starting POST request...')
    
    const session = await getServerSession(authOptions)
    console.log('🔍 Orders API - Session:', session ? 'Found' : 'Not found')
    console.log('🔍 Orders API - User ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('❌ Orders API - Unauthorized: No session or user ID')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('🔍 Orders API - Request body:', JSON.stringify(body, null, 2))
    
    const { 
      total, 
      storeId, 
      addressId, 
      paymentMethod, 
      orderItems, 
      isCouponUsed = false, 
      coupon = {} 
    } = body

    console.log('🔍 Orders API - Extracted fields:', {
      total,
      storeId,
      addressId,
      paymentMethod,
      orderItemsLength: orderItems?.length,
      isCouponUsed,
      coupon
    })

    if (!total || !storeId || !paymentMethod || !orderItems?.length) {
      console.log('❌ Orders API - Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Handle temporary address case
    let finalAddressId = addressId;
    if (addressId === 'temp-address') {
      console.log('🔍 Orders API - Creating temporary address for user')
      try {
        const tempAddress = await prisma.address.create({
          data: {
            userId: session.user.id,
            name: 'Temporary Address',
            email: session.user.email || 'temp@example.com',
            street: 'Temporary Street',
            city: 'Temporary City',
            state: 'Temporary State',
            zip: '00000',
            country: 'Temporary Country',
            phone: '000-000-0000'
          }
        })
        finalAddressId = tempAddress.id;
        console.log('✅ Orders API - Temporary address created:', finalAddressId)
      } catch (error) {
        console.error('❌ Orders API - Failed to create temporary address:', error)
        return NextResponse.json(
          { error: 'Failed to create address' },
          { status: 500 }
        )
      }
    }

    // Create order and update stock in a transaction
    console.log('🔍 Orders API - Starting database transaction...')
    const order = await prisma.$transaction(async (tx) => {
      console.log('🔍 Orders API - Checking stock availability...')
      // Check stock availability for all items
      for (const item of orderItems) {
        console.log(`🔍 Orders API - Checking stock for product ${item.productId}, quantity needed: ${item.quantity}`)
        const stockInfo = await tx.stockInfo.findUnique({
          where: { productId: item.productId }
        })
        console.log(`🔍 Orders API - Stock info for product ${item.productId}:`, stockInfo)
        
        if (!stockInfo || stockInfo.quantity < item.quantity) {
          console.log(`❌ Orders API - Insufficient stock for product ${item.productId}`)
          throw new Error(`Insufficient stock for product ${item.productId}`)
        }
      }

      // Create the order
      console.log('🔍 Orders API - Creating order...')
      const newOrder = await tx.order.create({
        data: {
          total: parseFloat(total),
          userId: session.user.id,
          storeId,
          addressId: finalAddressId,
          paymentMethod,
          isCouponUsed,
          coupon,
          orderItems: {
            create: orderItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          store: true,
          address: true
        }
      })
      console.log('✅ Orders API - Order created successfully:', newOrder.id)

      // Update stock for each item
      for (const item of orderItems) {
        await tx.stockInfo.update({
          where: { productId: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            },
            lastUpdated: new Date()
          }
        })

        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUTBOUND',
            quantity: item.quantity,
            reason: 'Order placed',
            reference: newOrder.id
          }
        })

        // Update product inStock status
        const updatedStock = await tx.stockInfo.findUnique({
          where: { productId: item.productId }
        })
        
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inStock: updatedStock.quantity > 0
          }
        })
      }

      return newOrder
    })

    // Order created successfully
    console.log('✅ Order created successfully:', order.id)

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('❌ Orders API - Error creating order:', error)
    console.error('❌ Orders API - Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
