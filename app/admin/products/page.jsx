'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, SearchIcon, FilterIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'

export default function AdminProducts() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [stockFilter, setStockFilter] = useState('')
    const [categories, setCategories] = useState([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        mrp: '',
        categoryId: '',
        images: [],
        inStock: true,
        stockQuantity: 0
    })

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/products')
            const data = await response.json()
            setProducts(data.products || [])
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to fetch products')
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch('/api/categories')
            if (response.ok) {
                const data = await response.json()
                if (Array.isArray(data)) {
                    setCategories(data)
                } else {
                    console.error('Categories data is not an array:', data)
                    setCategories([])
                }
            } else {
                toast.error('Failed to fetch categories')
                setCategories([])
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Error fetching categories')
            setCategories([])
        } finally {
            setCategoriesLoading(false)
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

        // Fetch in parallel
        fetchProducts()
        fetchCategories()
    }, [session, status, router, fetchProducts, fetchCategories])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                mrp: parseFloat(formData.mrp),
                stockQuantity: parseInt(formData.stockQuantity) || 0,
                images: formData.images,
                storeId: 'cmgjcptbp0001vt40le7ox6we' // Electronics Hub store ID
            }

            const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
            const method = editingProduct ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            })

            if (response.ok) {
                toast.success(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
                setShowAddForm(false)
                setEditingProduct(null)
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    mrp: '',
                    categoryId: '',
                    images: [],
                    inStock: true,
                    stockQuantity: 0
                })
                fetchProducts()
            } else {
                toast.error('Failed to save product')
            }
        } catch (error) {
            console.error('Error saving product:', error)
            toast.error('Failed to save product')
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            mrp: product.mrp.toString(),
            categoryId: product.categoryId || product.category?.id || '',
            images: product.images || [],
            inStock: product.inStock,
            stockQuantity: product.stockInfo?.quantity || 0
        })
        setShowAddForm(true)
    }

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Product deleted successfully!')
                fetchProducts()
            } else {
                toast.error('Failed to delete product')
            }
        } catch (error) {
            console.error('Error deleting product:', error)
            toast.error('Failed to delete product')
        }
    }


    // Memoize filtered products to avoid recalculation on every render
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = !categoryFilter || product.category?.name === categoryFilter || product.category === categoryFilter
            const matchesStock = !stockFilter || 
                                (stockFilter === 'inStock' && product.inStock) ||
                                (stockFilter === 'outOfStock' && !product.inStock)
            
            return matchesSearch && matchesCategory && matchesStock
        })
    }, [products, searchTerm, categoryFilter, stockFilter])

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
                <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
                <button
                    onClick={() => {
                        setShowAddForm(true)
                        setEditingProduct(null)
                        setFormData({
                            name: '',
                            description: '',
                            price: '',
                            mrp: '',
                            category: '',
                            images: [],
                            inStock: true,
                            stockQuantity: 0
                        })
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                    <PlusIcon size={20} />
                    Add Product
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="md:w-48">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Categories</option>
                            {Array.isArray(categories) && categories.map((category) => (
                                <option key={category.id} value={category.name}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Stock Filter */}
                    <div className="md:w-48">
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Stock</option>
                            <option value="inStock">In Stock</option>
                            <option value="outOfStock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mt-3 text-sm text-gray-600">
                    Showing {filteredProducts.length} of {products.length} products
                </div>
            </div>

            {/* Add/Edit Product Form */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.mrp}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mrp: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                    disabled={categoriesLoading}
                                >
                                    <option value="">{categoriesLoading ? 'Loading categories...' : 'Select Category'}</option>
                                    {Array.isArray(categories) && categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>

                            <ImageUpload
                                images={formData.images}
                                onImagesChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))}
                                maxImages={5}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter stock quantity"
                                    required
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    checked={formData.inStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                                    className="mr-2"
                                />
                                <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                                    In Stock
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                                >
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false)
                                        setEditingProduct(null)
                                    }}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-10 w-10 rounded-lg object-cover mr-3"
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || 'No category'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                            {product.stockInfo && (
                                                <span className="text-xs text-gray-500">
                                                    Qty: {product.stockInfo.quantity}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.push(`/product/${product.id}`)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Product"
                                            >
                                                <EyeIcon size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Edit Product"
                                            >
                                                <EditIcon size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Product"
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <PackageIcon size={48} className="text-gray-300 mb-2" />
                                        <p className="text-lg font-medium">No products found</p>
                                        <p className="text-sm">Try adjusting your search or filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
