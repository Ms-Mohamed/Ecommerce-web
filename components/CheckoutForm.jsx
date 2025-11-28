'use client'
import { useState, useEffect } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { useCart } from '@/lib/contexts/DatabaseCartContext'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
}

// Stripe-enabled checkout form
function StripeCheckoutForm({ totalPrice, coupon }) {
  const stripe = useStripe()
  const elements = useElements()
  const { cartItems, clearCart } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stripeReady, setStripeReady] = useState(false)

  useEffect(() => {
    if (stripe && elements) {
      setStripeReady(true)
    }
  }, [stripe, elements])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements || !session) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: totalPrice,
          coupon: coupon ? {
            code: coupon.code,
            discount: coupon.discount,
            description: coupon.description
          } : null,
        }),
      })

      const { clientSecret, error: apiError } = await response.json()

      if (apiError) {
        throw new Error(apiError)
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: session.user.name,
              email: session.user.email,
            },
          },
        }
      )

      if (stripeError) {
        setError(stripeError.message)
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful! Your order has been placed.')
        clearCart()
        router.push('/orders')
      }
    } catch (err) {
      setError(err.message)
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please sign in to continue with payment</p>
        <a href="/auth/signin" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
          Sign In
        </a>
      </div>
    )
  }

  if (!stripeReady) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="p-3 border border-gray-300 rounded-md bg-white">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Test Card:</strong> 4242 4242 4242 4242<br/>
            <strong>Expiry:</strong> Any future date<br/>
            <strong>CVC:</strong> Any 3 digits
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
        </button>
      </div>
    </form>
  )
}

// COD fallback form
function CODCheckoutForm({ totalPrice }) {
  const { cartItems, clearCart } = useCart()
  const { data: session } = useSession()
  const router = useRouter()

  const handleCODOrder = async () => {
    try {
      // Get the store ID from the first cart item
      const storeId = cartItems.length > 0 ? cartItems[0].product?.storeId : null;
      
      if (!storeId) {
        toast.error('No store information found. Please try again.');
        return;
      }

      // Create COD order
      const orderData = {
        total: totalPrice,
        storeId: storeId,
        addressId: 'temp-address', // This should be replaced with proper address selection
        paymentMethod: 'COD',
        orderItems: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        toast.success('Order placed successfully! You will pay on delivery.')
        clearCart()
        router.push('/orders')
      } else {
        toast.error('Failed to place order. Please try again.')
      }
    } catch (error) {
      console.error('Error placing COD order:', error)
      toast.error('Failed to place order. Please try again.')
    }
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please sign in to continue with payment</p>
        <a href="/auth/signin" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
          Sign In
        </a>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Stripe Not Configured</h3>
      <p className="text-yellow-700 mb-4">
        To enable card payments, you need to set up Stripe keys in your environment variables.
      </p>
      <div className="bg-yellow-100 p-3 rounded text-sm text-yellow-800 mb-4">
        <p className="font-medium mb-2">For now, you can:</p>
        <p>• Use Cash on Delivery (COD) option</p>
        <p>• Set up Stripe keys to enable card payments</p>
      </div>
      <button 
        onClick={handleCODOrder}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition"
      >
        Place Order (COD) - ${totalPrice.toFixed(2)}
      </button>
    </div>
  )
}

// Main checkout form component
export default function CheckoutForm({ totalPrice, coupon }) {
  // Check if Stripe is properly configured
  const isStripeConfigured = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('your_publishable_key_here')

  if (isStripeConfigured) {
    return <StripeCheckoutForm totalPrice={totalPrice} coupon={coupon} />
  } else {
    return <CODCheckoutForm totalPrice={totalPrice} />
  }
}
