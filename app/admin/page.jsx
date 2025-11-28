'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import LowStockAlert from "@/components/admin/LowStockAlert"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon } from "lucide-react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        allOrders: [],
    })

    // Optimized: Single API call instead of 3 separate calls
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true)
            
            // Single optimized endpoint for dashboard stats
            const response = await fetch('/api/admin/stats')
            if (response.ok) {
                const stats = await response.json()
                setDashboardData({
                    products: stats.products || 0,
                    revenue: stats.revenue || 0,
                    orders: stats.orders || 0,
                    stores: stats.stores || 0,
                    allOrders: stats.recentOrders || [],
                })
            } else {
                console.error('Failed to fetch dashboard stats')
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Memoize dashboard cards data
    const dashboardCardsData = useMemo(() => [
        { title: 'Total Products', value: dashboardData.products, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: currency + dashboardData.revenue.toFixed(2), icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon },
        { title: 'Total Stores', value: dashboardData.stores, icon: StoreIcon },
    ], [dashboardData, currency])

    useEffect(() => {
        if (status === 'loading') return
        
        if (!session) {
            router.push('/auth/signin')
            return
        }

        // Simple admin check - in production, you'd check user roles
        if (session.user.email !== 'admin@example.com') {
            router.push('/')
            return
        }

        fetchDashboardData()
    }, [session, status, router, fetchDashboardData])

    if (status === 'loading' || loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Area Chart */}
            <OrdersAreaChart allOrders={dashboardData.allOrders} />

            {/* Low Stock Alert */}
            <div className="mt-8">
                <LowStockAlert />
            </div>
        </div>
    )
}