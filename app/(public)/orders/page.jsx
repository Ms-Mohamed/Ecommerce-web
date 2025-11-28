'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Loading from '@/components/Loading'
import PageTitle from '@/components/PageTitle'
import OrderItem from '@/components/OrderItem'
import RatingModal from '@/components/RatingModal'

export default function Orders() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingModal, setRatingModal] = useState(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[80vh] mx-6 flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] mx-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your orders</h1>
          <a href="/auth/signin" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mx-6 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <PageTitle heading="My Orders" text={`${orders.length} orders found`} linkText="Continue Shopping" />

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">No orders yet</h2>
            <p className="text-gray-500 mb-8">Start shopping to see your orders here!</p>
            <a href="/shop" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm font-medium text-gray-500">
                  <th className="px-6 py-3">Order Details</th>
                  <th className="px-6 py-3 max-md:hidden">Total</th>
                  <th className="px-6 py-3 max-md:hidden">Address</th>
                  <th className="px-6 py-3 max-md:hidden">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderItem 
                    key={order.id} 
                    order={order} 
                    ratingModal={ratingModal}
                    setRatingModal={setRatingModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
      </div>
    </div>
  )
}