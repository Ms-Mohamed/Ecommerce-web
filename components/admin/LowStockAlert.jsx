'use client'
import { useState, useEffect } from 'react'
import { AlertTriangleIcon, PackageIcon } from 'lucide-react'
import Link from 'next/link'

const LowStockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLowStockProducts()
  }, [])

  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch('/api/inventory?lowStock=true')
      if (response.ok) {
        const data = await response.json()
        setLowStockProducts(data.inventory.slice(0, 5)) // Show top 5 low stock items
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <PackageIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">Stock Status</h3>
        </div>
        <div className="text-center py-4">
          <div className="text-green-600 text-sm font-medium">All products are well stocked!</div>
          <p className="text-gray-500 text-xs mt-1">No low stock alerts at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertTriangleIcon className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
        </div>
        <Link 
          href="/admin/inventory" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-3">
        {lowStockProducts.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
              <p className="text-xs text-gray-600">{item.product.category?.name || 'No category'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-yellow-700">
                {item.quantity} / {item.minLevel}
              </p>
              <p className="text-xs text-yellow-600">units left</p>
            </div>
          </div>
        ))}
      </div>
      
      {lowStockProducts.length >= 5 && (
        <div className="mt-4 text-center">
          <Link 
            href="/admin/inventory" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View {lowStockProducts.length - 5} more low stock items →
          </Link>
        </div>
      )}
    </div>
  )
}

export default LowStockAlert
