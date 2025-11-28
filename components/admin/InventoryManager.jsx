'use client'
import { useState, useEffect } from 'react'
import { PackageIcon, AlertTriangleIcon, TrendingUpIcon, TrendingDownIcon, PlusIcon, MinusIcon, EditIcon, EyeIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const InventoryManager = () => {
  const [inventory, setInventory] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'INBOUND',
    quantity: 0,
    reason: ''
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        setInventory(data.inventory)
        setStats(data.stats)
      } else {
        toast.error('Failed to fetch inventory')
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to fetch inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleStockAdjustment = async (productId, adjustment) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          type: adjustment.type,
          quantity: adjustment.quantity,
          reason: adjustment.reason || `${adjustment.type.toLowerCase()} adjustment`
        }),
      })

      if (response.ok) {
        toast.success('Stock updated successfully!')
        fetchInventory()
        setShowAdjustmentModal(false)
        setAdjustmentData({ type: 'INBOUND', quantity: 0, reason: '' })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update stock')
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      toast.error('Failed to update stock')
    }
  }

  const getStockStatus = (quantity, minLevel) => {
    if (quantity === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-100' }
    if (quantity <= minLevel) return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const getStockStatusText = (status) => {
    switch (status) {
      case 'out': return 'Out of Stock'
      case 'low': return 'Low Stock'
      case 'good': return 'In Stock'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <PackageIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertTriangleIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingDownIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Inventory Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => {
                const stockStatus = getStockStatus(item.quantity, item.minLevel)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${item.product.price}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.product.category?.name || 'No category'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.minLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                        {getStockStatusText(stockStatus.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(item)
                          setShowStockModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(item)
                          setShowAdjustmentModal(true)
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Adjust Stock - {selectedProduct.product.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Movement Type
                </label>
                <select
                  value={adjustmentData.type}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="INBOUND">Add Stock (Inbound)</option>
                  <option value="OUTBOUND">Remove Stock (Outbound)</option>
                  <option value="ADJUSTMENT">Direct Adjustment</option>
                  <option value="DAMAGE">Damage/Loss</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  placeholder="e.g., Restock, Customer return, etc."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAdjustmentModal(false)
                  setAdjustmentData({ type: 'INBOUND', quantity: 0, reason: '' })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStockAdjustment(selectedProduct.productId, adjustmentData)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryManager
