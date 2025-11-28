import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        await handlePaymentSuccess(paymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('Payment failed:', failedPayment.id)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent) {
  try {
    const { userId, items } = paymentIntent.metadata
    
    // Parse items from metadata
    const orderItems = JSON.parse(items)
    
    // Get the first item to determine storeId (assuming all items are from same store)
    const firstProduct = await prisma.product.findUnique({
      where: { id: orderItems[0].productId },
      include: { store: true }
    })

    if (!firstProduct) {
      throw new Error('Product not found')
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        total: paymentIntent.amount / 100, // Convert from cents
        userId: userId,
        storeId: firstProduct.storeId,
        addressId: 'temp-address', // We'll need to handle addresses properly
        paymentMethod: 'STRIPE',
        isPaid: true,
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
        user: true
      }
    })

    console.log('Order created successfully:', order.id)
    
    // Clear the user's cart after successful payment
    await prisma.cart.deleteMany({
      where: { userId: userId }
    })
    
    console.log('Cart cleared for user:', userId)
    
    // Here you could send confirmation emails, update inventory, etc.
    
  } catch (error) {
    console.error('Error handling payment success:', error)
    throw error
  }
}
