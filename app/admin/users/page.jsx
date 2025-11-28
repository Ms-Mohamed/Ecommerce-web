'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'
import { UserIcon, MailIcon, CalendarIcon, TrashIcon, EyeIcon, XIcon, MapPinIcon, PhoneIcon, ShoppingBagIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [showUserDetails, setShowUserDetails] = useState(false)

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

        fetchUsers()
    }, [session, status, router])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(Array.isArray(data) ? data : [])
            } else {
                console.error('Failed to fetch users:', response.statusText)
                setUsers([])
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Failed to fetch users')
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    const deleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('User deleted successfully!')
                fetchUsers()
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to delete user')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('Failed to delete user')
        }
    }

    const viewUserDetails = async (user) => {
        try {
            // Fetch detailed user information including addresses and orders
            const [addressesResponse, ordersResponse] = await Promise.all([
                fetch(`/api/admin/users/${user.id}/addresses`),
                fetch(`/api/admin/users/${user.id}/orders`)
            ])

            const addresses = addressesResponse.ok ? await addressesResponse.json() : []
            const orders = ordersResponse.ok ? await ordersResponse.json() : []

            setSelectedUser({
                ...user,
                addresses: addresses,
                orders: orders
            })
            setShowUserDetails(true)
        } catch (error) {
            console.error('Error fetching user details:', error)
            // Fallback to basic user info
            setSelectedUser(user)
            setShowUserDetails(true)
        }
    }

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
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <div className="text-sm text-gray-500">
                    Total Users: {users.length}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length > 0 ? users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            src={user.image}
                                            alt={user.name}
                                            className="h-10 w-10 rounded-full object-cover mr-3"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">ID: {user.id.slice(-8)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.email === 'admin@example.com' 
                                            ? 'bg-purple-100 text-purple-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.email === 'admin@example.com' ? 'Admin' : 'Customer'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2 items-center">
                                        <button
                                            onClick={() => viewUserDetails(user)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                            title="View Details"
                                        >
                                            <EyeIcon size={16} />
                                        </button>
                                        {user.email !== 'admin@example.com' && (
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Delete User"
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <UserIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Admins</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(user => user.email === 'admin@example.com').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <UserIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Customers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(user => user.email !== 'admin@example.com').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                            <button
                                onClick={() => setShowUserDetails(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XIcon size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Info */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">User Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={selectedUser.image}
                                                alt={selectedUser.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-medium">{selectedUser.name}</p>
                                                <p className="text-gray-500">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <p><span className="font-medium">User ID:</span> {selectedUser.id}</p>
                                        <p><span className="font-medium">Role:</span> 
                                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                selectedUser.email === 'admin@example.com' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {selectedUser.email === 'admin@example.com' ? 'Admin' : 'Customer'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Addresses */}
                                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <MapPinIcon size={16} />
                                            Addresses ({selectedUser.addresses.length})
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedUser.addresses.map((address, index) => (
                                                <div key={index} className="bg-white p-3 rounded border text-sm">
                                                    <p className="font-medium">{address.name}</p>
                                                    <p className="text-gray-600">{address.street}</p>
                                                    <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
                                                    <p className="text-gray-600">{address.country}</p>
                                                    {address.phone && (
                                                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                                                            <PhoneIcon size={12} />
                                                            {address.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Orders and Activity */}
                            <div className="space-y-4">
                                {/* Orders */}
                                {selectedUser.orders && selectedUser.orders.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <ShoppingBagIcon size={16} />
                                            Orders ({selectedUser.orders.length})
                                        </h3>
                                        <div className="space-y-3 max-h-60 overflow-y-auto">
                                            {selectedUser.orders.map((order) => (
                                                <div key={order.id} className="bg-white p-3 rounded border text-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                            order.status === 'ORDER_PLACED' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                                            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {order.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600">Total: ${order.total.toFixed(2)}</p>
                                                    <p className="text-gray-600">Items: {order.orderItems?.length || 0}</p>
                                                    <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Account Stats */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Account Statistics</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Total Orders:</span>
                                            <span className="font-medium">{selectedUser.orders?.length || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Spent:</span>
                                            <span className="font-medium">
                                                ${selectedUser.orders?.reduce((sum, order) => sum + order.total, 0).toFixed(2) || '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Addresses:</span>
                                            <span className="font-medium">{selectedUser.addresses?.length || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Account Status:</span>
                                            <span className="font-medium text-green-600">Active</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Actions</h3>
                                    <div className="space-y-2">
                                        {selectedUser.email !== 'admin@example.com' && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this user?')) {
                                                        deleteUser(selectedUser.id)
                                                        setShowUserDetails(false)
                                                    }
                                                }}
                                                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded transition"
                                            >
                                                Delete User Account
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowUserDetails(false)}
                                            className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                                        >
                                            Close Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
