'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'
import { CheckIcon, XIcon, TruckIcon, PackageIcon, EditIcon, EyeIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminOrders() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showOrderDetails, setShowOrderDetails] = useState(false)

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/orders')
            if (response.ok) {
                const data = await response.json()
                setOrders(Array.isArray(data) ? data : [])
            } else {
                console.error('Failed to fetch orders:', response.statusText)
                setOrders([])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to fetch orders')
            setOrders([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === 'loading') return
        
        if (!session) {
            router.push('/auth/signin')
            return
        }

        // Simple admin check
        if (session.user.email !== 'admin@example.com') {
            router.push('/')
            return
        }

        fetchOrders()
    }, [session, status, router, fetchOrders])

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            console.log('🔍 Frontend - Updating order status:', { orderId, newStatus })
            
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            })

            console.log('🔍 Frontend - Response status:', response.status)
            console.log('🔍 Frontend - Response ok:', response.ok)

            if (response.ok) {
                const responseData = await response.json()
                console.log('✅ Frontend - Success response:', responseData)
                toast.success('Order status updated successfully!')
                fetchOrders()
            } else {
                const errorData = await response.json()
                console.error('❌ Frontend - Error response:', errorData)
                toast.error(errorData.error || 'Failed to update order status')
            }
        } catch (error) {
            console.error('❌ Frontend - Error updating order status:', error)
            toast.error('Failed to update order status')
        }
    }

    const handleStatusChange = (orderId, newStatus) => {
        if (confirm(`Are you sure you want to change the order status to ${newStatus.replace('_', ' ')}?`)) {
            updateOrderStatus(orderId, newStatus)
        }
    }

    const viewOrderDetails = (order) => {
        setSelectedOrder(order)
        setShowOrderDetails(true)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return 'bg-yellow-100 text-yellow-800'
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800'
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800'
            case 'DELIVERED':
                return 'bg-green-100 text-green-800'
            case 'CANCELLED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ORDER_PLACED':
                return <PackageIcon size={16} />
            case 'PROCESSING':
                return <PackageIcon size={16} />
            case 'SHIPPED':
                return <TruckIcon size={16} />
            case 'DELIVERED':
                return <CheckIcon size={16} />
            case 'CANCELLED':
                return <XIcon size={16} />
            default:
                return <PackageIcon size={16} />
        }
    }

    // Memoize filtered orders to avoid recalculation on every render
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (filter === 'all') return true
            return order.status === filter
        })
    }, [orders, filter])

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading />
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
                
                {/* Filter Buttons */}
                <div className="flex gap-2">
                    {['all', 'ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                filter === status
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {status === 'all' ? 'All Orders' : status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{order.id.slice(-8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{order.user?.name || 'Guest'}</div>
                                    <div className="text-sm text-gray-500">{order.user?.email || 'No email'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.orderItems?.length || 0} items
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${order.total.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <span className="ml-1">{order.status}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2 items-center">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                                        >
                                            <option value="ORDER_PLACED">Order Placed</option>
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                        <button
                                            onClick={() => viewOrderDetails(order)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                            title="View Details"
                                        >
                                            <EyeIcon size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    No orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                            <button
                                onClick={() => setShowOrderDetails(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XIcon size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order Info */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Order ID:</span> #{selectedOrder.id.slice(-8)}</p>
                                        <p><span className="font-medium">Status:</span> 
                                            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                                                {getStatusIcon(selectedOrder.status)}
                                                <span className="ml-1">{selectedOrder.status.replace('_', ' ')}</span>
                                            </span>
                                        </p>
                                        <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                        <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                                        <p><span className="font-medium">Total:</span> ${selectedOrder.total.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Name:</span> {selectedOrder.user?.name || 'Guest'}</p>
                                        <p><span className="font-medium">Email:</span> {selectedOrder.user?.email || 'No email'}</p>
                                    </div>
                                </div>

                                {/* Address Info */}
                                {selectedOrder.address && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-medium">Street:</span> {selectedOrder.address.street}</p>
                                            <p><span className="font-medium">City:</span> {selectedOrder.address.city}</p>
                                            <p><span className="font-medium">State:</span> {selectedOrder.address.state}</p>
                                            <p><span className="font-medium">ZIP:</span> {selectedOrder.address.zip}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Order Items</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.orderItems?.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                    <PackageIcon size={20} className="text-gray-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{item.product?.name || 'Product'}</p>
                                                    <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                                    <p className="text-xs text-gray-500">Price: ${item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Management */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Update Status</h3>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => {
                                            handleStatusChange(selectedOrder.id, e.target.value)
                                            setShowOrderDetails(false)
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                                    >
                                        <option value="ORDER_PLACED">Order Placed</option>
                                        <option value="PROCESSING">Processing</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
