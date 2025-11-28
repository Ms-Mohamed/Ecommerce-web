'use client'
import { useState, useRef, useEffect } from 'react'
import { Star, TrendingUp, TrendingDown, Package, DollarSign, Users, Eye, Filter, Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const ProductAnalytics = ({ products, overallStats }) => {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [sortBy, setSortBy] = useState('totalRevenue')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  // Sort products based on selected criteria
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'totalRevenue':
        return b.salesAnalytics.totalRevenue - a.salesAnalytics.totalRevenue
      case 'totalSold':
        return b.salesAnalytics.totalSold - a.salesAnalytics.totalSold
      case 'averageRating':
        return b.ratingAnalytics.averageRating - a.ratingAnalytics.averageRating
      case 'totalRatings':
        return b.ratingAnalytics.totalRatings - a.ratingAnalytics.totalRatings
      case 'profitMargin':
        return b.profitMargin - a.profitMargin
      case 'recentSales':
        return b.salesAnalytics.recentSales - a.salesAnalytics.recentSales
      default:
        return 0
    }
  })

  // Filter products for charts (no search filter)
  const chartFilteredProducts = sortedProducts.filter(product => {
    switch (filterBy) {
      case 'lowStock':
        return product.stockAnalytics.isLowStock
      case 'outOfStock':
        return product.stockAnalytics.isOutOfStock
      case 'highRated':
        return product.ratingAnalytics.averageRating >= 4
      case 'topSelling':
        return product.salesAnalytics.totalSold > 0
      case 'noSales':
        return product.salesAnalytics.totalSold === 0
      default:
        return true
    }
  })

  // Filter products for display (with search filter)
  const filteredProducts = chartFilteredProducts.filter(product => {
    // Apply search filter only for product names
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  // Generate search suggestions
  const searchSuggestions = searchQuery.length > 0 
    ? products
        .filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          product.name.toLowerCase() !== searchQuery.toLowerCase()
        )
        .slice(0, 5) // Show max 5 suggestions
    : []

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Generate charts data (using chartFilteredProducts, not search-filtered)
  const topProductsData = chartFilteredProducts.slice(0, 10).map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    revenue: product.salesAnalytics.totalRevenue,
    sold: product.salesAnalytics.totalSold,
    rating: product.ratingAnalytics.averageRating
  }))

  const ratingDistributionData = chartFilteredProducts.reduce((acc, product) => {
    product.ratingAnalytics.ratingDistribution.forEach(dist => {
      const existing = acc.find(item => item.stars === dist.stars)
      if (existing) {
        existing.count += dist.count
      } else {
        acc.push({ stars: dist.stars, count: dist.count })
      }
    })
    return acc
  }, [])

  const stockStatusData = [
    { name: 'In Stock', value: chartFilteredProducts.filter(p => !p.stockAnalytics.isLowStock && !p.stockAnalytics.isOutOfStock).length, color: '#10B981' },
    { name: 'Low Stock', value: chartFilteredProducts.filter(p => p.stockAnalytics.isLowStock && !p.stockAnalytics.isOutOfStock).length, color: '#F59E0B' },
    { name: 'Out of Stock', value: chartFilteredProducts.filter(p => p.stockAnalytics.isOutOfStock).length, color: '#EF4444' }
  ]

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{product.category?.name || 'No Category'}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">${product.price}</span>
            {product.mrp > product.price && (
              <span className="text-sm text-gray-500 line-through">${product.mrp}</span>
            )}
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.stockAnalytics.isOutOfStock 
            ? 'bg-red-100 text-red-800' 
            : product.stockAnalytics.isLowStock 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {product.stockAnalytics.isOutOfStock ? 'Out of Stock' : 
           product.stockAnalytics.isLowStock ? 'Low Stock' : 'In Stock'}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={`${
                star <= product.ratingAnalytics.averageRating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {product.ratingAnalytics.averageRating.toFixed(1)} ({product.ratingAnalytics.totalRatings} reviews)
        </span>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{product.salesAnalytics.totalSold}</p>
          <p className="text-xs text-gray-500">Total Sold</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">${product.salesAnalytics.totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-500">Revenue</p>
        </div>
      </div>

      {/* Stock Info */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Stock: <span className="font-medium">{product.stockAnalytics.quantity}</span> units
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedProduct(product)}
          className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition"
        >
          <Eye size={16} className="inline mr-1" />
          View Details
        </button>
      </div>
    </div>
  )

  const ProductDetailsModal = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-gray-600">{product.category?.name || 'No Category'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{product.salesAnalytics.totalSold}</p>
              <p className="text-sm text-gray-600">Total Sold</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">${product.salesAnalytics.totalRevenue.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">{product.ratingAnalytics.averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">{product.ratingAnalytics.totalRatings}</p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {product.ratingAnalytics.ratingDistribution.map((dist) => (
                <div key={dist.stars} className="flex items-center gap-3">
                  <span className="w-8 text-sm">{dist.stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${dist.percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm text-gray-600">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
            <div className="space-y-3">
              {product.ratingAnalytics.recentReviews.map((review) => (
                <div key={review.id} className="bg-white p-3 rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`${
                            star <= review.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.userName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.review}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Sales by Order Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(product.salesAnalytics.salesByStatus).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Product Analytics</h2>
        <p className="text-gray-600">Detailed insights into product performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {filterBy !== 'all' ? 'Filtered Products' : 'Total Products'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{chartFilteredProducts.length}</p>
              {filterBy !== 'all' && (
                <p className="text-xs text-gray-500">of {overallStats.totalProducts} total</p>
              )}
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {filterBy !== 'all' ? 'Filtered Revenue' : 'Total Revenue'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${chartFilteredProducts.reduce((sum, p) => sum + p.salesAnalytics.totalRevenue, 0).toFixed(0)}
              </p>
              {filterBy !== 'all' && (
                <p className="text-xs text-gray-500">of ${overallStats.totalRevenue.toFixed(0)} total</p>
              )}
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {filterBy !== 'all' ? 'Filtered Sold' : 'Total Sold'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {chartFilteredProducts.reduce((sum, p) => sum + p.salesAnalytics.totalSold, 0)}
              </p>
              {filterBy !== 'all' && (
                <p className="text-xs text-gray-500">of {overallStats.totalSold} total</p>
              )}
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {filterBy !== 'all' ? 'Filtered Avg Rating' : 'Avg Rating'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {chartFilteredProducts.length > 0 
                  ? (chartFilteredProducts.reduce((sum, p) => sum + p.ratingAnalytics.averageRating, 0) / chartFilteredProducts.length).toFixed(1)
                  : '0.0'
                }
              </p>
              {filterBy !== 'all' && (
                <p className="text-xs text-gray-500">of {overallStats.averageRating.toFixed(1)} total</p>
              )}
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Revenue */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Top Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Stock Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stockStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Search Products</h3>
              <p className="text-sm text-gray-600">Find specific products by name</p>
            </div>
            
            {/* Search Field with Suggestions */}
            <div ref={searchRef} className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for a product..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchSuggestions.map((product, index) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSearchQuery(product.name)
                        setShowSuggestions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        {product.category?.name || 'No Category'} • {product.salesAnalytics.totalSold} sold
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Controls and Search Results */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="totalRevenue">Sort by Revenue</option>
              <option value="totalSold">Sort by Units Sold</option>
              <option value="averageRating">Sort by Rating</option>
              <option value="totalRatings">Sort by Review Count</option>
              <option value="profitMargin">Sort by Profit Margin</option>
              <option value="recentSales">Sort by Recent Sales</option>
            </select>
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Products</option>
              <option value="lowStock">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="highRated">High Rated (4+ stars)</option>
              <option value="topSelling">Top Selling</option>
              <option value="noSales">No Sales</option>
            </select>
            
            {/* Search Results Count */}
            {searchQuery && (
              <div className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-md text-sm">
                <Search className="h-4 w-4 mr-2" />
                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
              </div>
            )}
            
            {/* Clear Search Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No products found' : 'No products match the current filters'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? `No products match your search for "${searchQuery}". Try adjusting your search terms or filters.`
              : 'Try adjusting your filters to see more products.'
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

export default ProductAnalytics
