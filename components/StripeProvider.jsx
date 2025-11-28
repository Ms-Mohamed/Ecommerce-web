'use client'
import { Elements } from '@stripe/react-stripe-js'
import getStripe from '@/lib/stripe'

export default function StripeProvider({ children }) {
  const stripePromise = getStripe()

  // If Stripe isn't configured, just render children without Elements wrapper
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('your_publishable_key_here')) {
    return <>{children}</>
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}
