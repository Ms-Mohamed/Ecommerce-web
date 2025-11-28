'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'
import ProductAnalytics from '@/components/admin/ProductAnalytics'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, BarChart3 } from 'lucide-react'

export default function AdminAnalytics() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        orders: [],
        products: []
    })
    const [productAnalytics, setProductAnalytics] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [timePeriod, setTimePeriod] = useState('day') // 'day', 'week', 'month'

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true)
            
            // Fetch all data in parallel (already optimized with caching)
            const [ordersRes, productsRes, usersRes, productAnalyticsRes] = await Promise.all([
                fetch('/api/admin/orders'),
                fetch('/api/products?limit=1000'), // Limit products for analytics
                fetch('/api/admin/users'),
                fetch('/api/admin/analytics/products')
            ])

            const orders = ordersRes.ok ? await ordersRes.json() : []
            const productsData = productsRes.ok ? await productsRes.json() : { products: [] }
            const users = usersRes.ok ? await usersRes.json() : []
            const productAnalyticsData = productAnalyticsRes.ok ? await productAnalyticsRes.json() : null

            // Calculate analytics
            const ordersArray = Array.isArray(orders) ? orders : []
            const productsArray = Array.isArray(productsData.products) ? productsData.products : []
            const usersArray = Array.isArray(users) ? users : []
            
            const totalRevenue = ordersArray.reduce((sum, order) => sum + (order.total || 0), 0)
            const totalOrders = ordersArray.length
            const totalUsers = usersArray.length
            const totalProducts = productsArray.length

            // Generate sales data based on selected time period
            const salesData = generateSalesData(ordersArray, timePeriod)
            const categoryData = generateCategoryData(productsArray)

            setAnalytics({
                totalRevenue,
                totalOrders,
                totalUsers,
                totalProducts,
                orders: ordersArray,
                products: productsArray,
                salesData,
                categoryData
            })

            setProductAnalytics(productAnalyticsData)

        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }, [timePeriod])

    useEffect(() => {
        if (status === 'loading') return
        
        if (!session) {
            router.push('/auth/signin')
            return
        }

        if (session.user.email !== 'admin@example.com') {
            router.push('/')
            return
        }

        fetchAnalytics()
    }, [session, status, router, fetchAnalytics])

    useEffect(() => {
        if (analytics.orders.length > 0) {
            // Regenerate sales data when time period changes
            const salesData = generateSalesData(analytics.orders, timePeriod)
            setAnalytics(prev => ({
                ...prev,
                salesData
            }))
        }
    }, [timePeriod, analytics.orders])

    const generateSalesData = (orders, period = 'day') => {
        const data = []
        
        if (period === 'day') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                
                const dayOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt)
                    return orderDate.toDateString() === date.toDateString()
                })
                
                const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0)
                
                data.push({
                    period: dayName,
                    revenue: dayRevenue,
                    orders: dayOrders.length,
                    date: date.toISOString().split('T')[0]
                })
            }
        } else if (period === 'week') {
            // Last 8 weeks
            for (let i = 7; i >= 0; i--) {
                const endDate = new Date()
                endDate.setDate(endDate.getDate() - (i * 7))
                const startDate = new Date(endDate)
                startDate.setDate(startDate.getDate() - 6)
                
                const weekLabel = `Week ${8 - i}`
                
                const weekOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt)
                    return orderDate >= startDate && orderDate <= endDate
                })
                
                const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0)
                
                data.push({
                    period: weekLabel,
                    revenue: weekRevenue,
                    orders: weekOrders.length,
                    date: startDate.toISOString().split('T')[0]
                })
            }
        } else if (period === 'month') {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date()
                date.setMonth(date.getMonth() - i)
                const monthName = date.toLocaleDateString('en-US', { month: 'short' })
                
                const monthOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt)
                    return orderDate.getMonth() === date.getMonth() && 
                           orderDate.getFullYear() === date.getFullYear()
                })
                
                const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0)
                
                data.push({
                    period: monthName,
                    revenue: monthRevenue,
                    orders: monthOrders.length,
                    date: date.toISOString().split('T')[0]
                })
            }
        }
        
        return data
    }

    const generateCategoryData = (products) => {
        const categories = {}
        products.forEach(product => {
            const categoryName = product.category?.name || 'No Category'
            categories[categoryName] = (categories[categoryName] || 0) + 1
        })
        
        const categoryEntries = Object.entries(categories)
        return categoryEntries.map(([name, value], index) => ({
            name,
            value,
            color: getUniqueColor(index)
        }))
    }

    const getUniqueColor = (index) => {
        const colors = [
            '#8884d8', // Purple
            '#82ca9d', // Green
            '#ffc658', // Yellow
            '#ff7300', // Orange
            '#00C950', // Bright Green
            '#FF6B6B', // Red
            '#4FC3F7', // Light Blue
            '#BA68C8', // Light Purple
            '#FFB74D', // Light Orange
            '#81C784', // Light Green
            '#F06292', // Pink
            '#64B5F6', // Blue
            '#FFD54F', // Amber
            '#A5D6A7', // Light Green
            '#CE93D8', // Light Purple
            '#FFAB91', // Light Orange
            '#90CAF9', // Light Blue
            '#C5E1A5', // Light Green
            '#F8BBD9', // Light Pink
            '#B39DDB'  // Light Purple
        ]
        return colors[index % colors.length]
    }

    // Memoize stats cards to prevent unnecessary re-renders
    const statsCards = useMemo(() => [
        { title: 'Total Revenue', value: `$${analytics.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'green' },
        { title: 'Total Orders', value: analytics.totalOrders.toString(), icon: ShoppingCart, color: 'blue' },
        { title: 'Total Users', value: analytics.totalUsers.toString(), icon: Users, color: 'purple' },
        { title: 'Total Products', value: analytics.totalProducts.toString(), icon: Package, color: 'orange' },
    ], [analytics])

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                
                {/* Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                            activeTab === 'overview'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                            activeTab === 'products'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <BarChart3 size={16} className="inline mr-2" />
                        Product Analytics
                    </button>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsCards.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                                        <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Orders / {timePeriod === 'day' ? 'Day' : timePeriod === 'week' ? 'Week' : 'Month'}
                                </h3>
                                
                                {/* Time Period Selector */}
                                <div className="flex bg-gray-100 rounded-lg p-1 border-2 border-gray-300 shadow-sm">
                                    <button
                                        onClick={() => {
                                            console.log('Clicked Per Day button')
                                            setTimePeriod('day')
                                        }}
                                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                                            timePeriod === 'day'
                                                ? 'bg-white text-gray-900 shadow-md border border-gray-300'
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        📅 Per Day
                                    </button>
                                    <button
                                        onClick={() => {
                                            console.log('Clicked Per Week button')
                                            setTimePeriod('week')
                                        }}
                                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                                            timePeriod === 'week'
                                                ? 'bg-white text-gray-900 shadow-md border border-gray-300'
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        📊 Per Week
                                    </button>
                                    <button
                                        onClick={() => {
                                            console.log('Clicked Per Month button')
                                            setTimePeriod('month')
                                        }}
                                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                                            timePeriod === 'month'
                                                ? 'bg-white text-gray-900 shadow-md border border-gray-300'
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        📈 Per Month
                                    </button>
                                </div>
                            </div>
                            
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={analytics.salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value, name) => [
                                            name === 'orders' ? value : `$${value.toFixed(2)}`, 
                                            name === 'orders' ? 'Orders' : 'Revenue'
                                        ]}
                                        labelFormatter={(label) => `Period: ${label}`}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="orders" 
                                        stroke="#8884d8" 
                                        fill="#8884d8" 
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Product Categories */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analytics.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {analytics.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {analytics.orders.slice(0, 5).map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order.id.slice(-8)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.user?.name || 'Guest'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${order.total.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Product Analytics Tab */}
            {activeTab === 'products' && productAnalytics && (
                <ProductAnalytics 
                    products={productAnalytics.products} 
                    overallStats={productAnalytics.overallStats} 
                />
            )}
        </div>
    )
}
