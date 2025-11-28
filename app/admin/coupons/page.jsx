'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { DeleteIcon, RefreshCwIcon, EyeIcon, EyeOffIcon } from "lucide-react"

export default function AdminCoupons() {

    const [coupons, setCoupons] = useState([])

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: new Date(),
        maxUsage: ''
    })
    const [loading, setLoading] = useState(true)
    const [showUsageDetails, setShowUsageDetails] = useState(false)

    const fetchCoupons = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/coupons?includeUsage=true')
            if (response.ok) {
                const data = await response.json()
                setCoupons(data)
            } else {
                toast.error('Failed to fetch coupons')
            }
        } catch (error) {
            console.error('Error fetching coupons:', error)
            toast.error('Failed to fetch coupons')
        } finally {
            setLoading(false)
        }
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCoupon),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Coupon added successfully!')
                setNewCoupon({
                    code: '',
                    description: '',
                    discount: '',
                    forNewUser: false,
                    forMember: false,
                    isPublic: false,
                    expiresAt: new Date(),
                    maxUsage: ''
                })
                fetchCoupons() // Refresh the list
            } else {
                toast.error(data.error || 'Failed to add coupon')
            }
        } catch (error) {
            console.error('Error adding coupon:', error)
            toast.error('Failed to add coupon')
        }
    }

    const handleChange = (e) => {
        setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
    }

    const deleteCoupon = async (code) => {
        try {
            const response = await fetch(`/api/coupons/${code}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Coupon deleted successfully!')
                fetchCoupons() // Refresh the list
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to delete coupon')
            }
        } catch (error) {
            console.error('Error deleting coupon:', error)
            toast.error('Failed to delete coupon')
        }
    }

    const reactivateCoupon = async (code, resetUsage = false) => {
        try {
            const response = await fetch(`/api/coupons/${code}/reactivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resetUsageCount: resetUsage }),
            })

            if (response.ok) {
                toast.success('Coupon reactivated successfully!')
                fetchCoupons() // Refresh the list
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to reactivate coupon')
            }
        } catch (error) {
            console.error('Error reactivating coupon:', error)
            toast.error('Failed to reactivate coupon')
        }
    }

    useEffect(() => {
        fetchCoupons();
    }, [])

    return (
        <div className="text-slate-500 mb-40">

            {/* Add Coupon */}
            <form onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: "Adding coupon..." })} className="max-w-sm text-sm">
                <h2 className="text-2xl">Add <span className="text-slate-800 font-medium">Coupons</span></h2>
                <div className="flex gap-2 max-sm:flex-col mt-2">
                    <input type="text" placeholder="Coupon Code" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="code" value={newCoupon.code} onChange={handleChange} required
                    />
                    <input type="number" placeholder="Coupon Discount (%)" min={1} max={100} className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="discount" value={newCoupon.discount} onChange={handleChange} required
                    />
                </div>
                <input type="number" placeholder="Max Usage (optional - leave empty for unlimited)" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                    name="maxUsage" value={newCoupon.maxUsage} onChange={handleChange}
                />
                <input type="text" placeholder="Coupon Description" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                    name="description" value={newCoupon.description} onChange={handleChange} required
                />

                <label>
                    <p className="mt-3">Coupon Expiry Date</p>
                    <input type="date" placeholder="Coupon Expires At" className="w-full mt-1 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="expiresAt" value={format(newCoupon.expiresAt, 'yyyy-MM-dd')} onChange={handleChange}
                    />
                </label>

                <div className="mt-5">
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input type="checkbox" className="sr-only peer"
                                name="forNewUser" checked={newCoupon.forNewUser}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                        <p>For New User</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input type="checkbox" className="sr-only peer"
                                name="forMember" checked={newCoupon.forMember}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                        <p>For Member</p>
                    </div>
                </div>
                <button className="mt-4 p-2 px-10 rounded bg-slate-700 text-white active:scale-95 transition">Add Coupon</button>
            </form>

            {/* List Coupons */}
            <div className="mt-14">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl">List <span className="text-slate-800 font-medium">Coupons</span></h2>
                    <button
                        onClick={() => setShowUsageDetails(!showUsageDetails)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition text-sm"
                    >
                        {showUsageDetails ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        {showUsageDetails ? 'Hide Usage' : 'Show Usage'}
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200 max-w-6xl">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Code</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Description</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Discount</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Expires At</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Status</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Usage</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">New User</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">For Member</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.code} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium text-slate-800">{coupon.code}</td>
                                        <td className="py-3 px-4 text-slate-800">{coupon.description}</td>
                                        <td className="py-3 px-4 text-slate-800">{coupon.discount}%</td>
                                        <td className="py-3 px-4 text-slate-800">{format(new Date(coupon.expiresAt), 'yyyy-MM-dd')}</td>
                                        <td className="py-3 px-4 text-slate-800">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                coupon.isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-800">
                                            {coupon.usageCount}{coupon.maxUsage ? `/${coupon.maxUsage}` : ''}
                                        </td>
                                        <td className="py-3 px-4 text-slate-800">{coupon.forNewUser ? 'Yes' : 'No'}</td>
                                        <td className="py-3 px-4 text-slate-800">{coupon.forMember ? 'Yes' : 'No'}</td>
                                        <td className="py-3 px-4 text-slate-800">
                                            <div className="flex gap-2">
                                                {!coupon.isActive && (
                                                    <RefreshCwIcon 
                                                        onClick={() => toast.promise(reactivateCoupon(coupon.code), { loading: "Reactivating coupon..." })} 
                                                        className="w-5 h-5 text-green-500 hover:text-green-800 cursor-pointer" 
                                                        title="Reactivate"
                                                    />
                                                )}
                                                <DeleteIcon 
                                                    onClick={() => toast.promise(deleteCoupon(coupon.code), { loading: "Deleting coupon..." })} 
                                                    className="w-5 h-5 text-red-500 hover:text-red-800 cursor-pointer" 
                                                    title="Delete"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {showUsageDetails && (
                            <div className="mt-6 p-4 bg-slate-50">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Usage Details</h3>
                                {coupons.map((coupon) => (
                                    coupon.couponUsages && coupon.couponUsages.length > 0 && (
                                        <div key={coupon.code} className="mb-4 p-3 bg-white rounded border">
                                            <h4 className="font-medium text-slate-800">{coupon.code} - {coupon.usageCount} uses</h4>
                                            <div className="mt-2 space-y-1">
                                                {coupon.couponUsages.map((usage) => (
                                                    <div key={usage.id} className="text-sm text-slate-600">
                                                        {usage.user.name} ({usage.user.email}) - {format(new Date(usage.usedAt), 'yyyy-MM-dd HH:mm')}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}