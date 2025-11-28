'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'

export default function OrdersAreaChart({ allOrders }) {
    const [timePeriod, setTimePeriod] = useState('day') // 'day', 'week', 'month'
    const [chartData, setChartData] = useState([])

    // Generate chart data based on time period
    const generateChartData = (orders, period) => {
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
                
                data.push({
                    period: dayName,
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
                
                data.push({
                    period: weekLabel,
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
                
                data.push({
                    period: monthName,
                    orders: monthOrders.length,
                    date: date.toISOString().split('T')[0]
                })
            }
        }
        
        return data
    }

    useEffect(() => {
        if (allOrders.length > 0) {
            const data = generateChartData(allOrders, timePeriod)
            setChartData(data)
        }
    }, [allOrders, timePeriod])

    return (
        <div className="w-full max-w-4xl h-[300px] text-xs">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                    <span className='text-slate-500'>Orders /</span> {timePeriod === 'day' ? 'Day' : timePeriod === 'week' ? 'Week' : 'Month'}
                </h3>
                
                {/* Time Period Selector */}
                <div className="flex bg-gray-100 rounded-lg p-1 border-2 border-gray-300 shadow-sm">
                    <button
                        onClick={() => {
                            console.log('Dashboard: Clicked Per Day button')
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
                            console.log('Dashboard: Clicked Per Week button')
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
                            console.log('Dashboard: Clicked Per Month button')
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
            
            <ResponsiveContainer width="100%" height="100%"> 
                <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis allowDecimals={false} label={{ value: 'Orders', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                        formatter={(value, name) => [value, 'Orders']}
                        labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Area type="monotone" dataKey="orders" stroke="#4f46e5" fill="#8884d8" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
