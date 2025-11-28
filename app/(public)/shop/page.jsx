'use client'
import { Suspense, useState, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import Loading from "@/components/Loading"
import AdvancedSearchFilter from "@/components/AdvancedSearchFilter"
import { MoveLeftIcon, GridIcon, ListIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

function ShopContent() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({})
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        minPrice: '',
        maxPrice: '',
        inStock: 'true',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        discounted: false,
        newArrivals: false
    })

    // Get initial search, category, discounted, and newArrivals from URL params
    const searchParams = useSearchParams()
    const initialSearch = searchParams.get('search')
    const initialCategory = searchParams.get('category')
    const initialDiscounted = searchParams.get('discounted')
    const initialNewArrivals = searchParams.get('newArrivals')
    const router = useRouter()

    // Initialize filters with URL params if present and fetch products
    useEffect(() => {
        const newFilters = { ...filters }
        let hasChanges = false
        
        if (initialSearch) {
            newFilters.search = initialSearch
            hasChanges = true
        }
        if (initialCategory) {
            newFilters.category = initialCategory
            hasChanges = true
        }
        if (initialDiscounted === 'true') {
            newFilters.discounted = true
            hasChanges = true
        }
        if (initialNewArrivals === 'true') {
            newFilters.newArrivals = true
            hasChanges = true
        }
        
        if (hasChanges) {
            setFilters(newFilters)
            // Fetch products immediately with the new filters
            fetchProducts(newFilters)
        }
        // Don't fetch here if no changes - let the initial load useEffect handle it
    }, [initialSearch, initialCategory, initialDiscounted, initialNewArrivals])

    // Only fetch products on initial load if no URL parameters
    useEffect(() => {
        // Only fetch if we don't have URL parameters (to avoid double fetch)
        if (!initialSearch && !initialCategory && !initialDiscounted && !initialNewArrivals) {
            fetchProducts()
        }
    }, []) // Empty dependency array - only run once on mount

    // Debounce search and price inputs to avoid too many API calls
    useEffect(() => {
        // Check if we have text inputs that need debouncing
        const hasTextInputs = filters.search || filters.minPrice || filters.maxPrice
        
        if (hasTextInputs) {
            // Debounce text inputs
            const timeoutId = setTimeout(() => {
                fetchProducts()
            }, 500) // 500ms delay for text inputs

            return () => clearTimeout(timeoutId)
        } else {
            // Immediate update for dropdowns and other non-text filters
            fetchProducts()
        }
    }, [filters])

    const fetchProducts = async (customFilters = null) => {
        try {
            setLoading(true)
            
            // Use custom filters if provided, otherwise use state filters
            const activeFilters = customFilters || filters
            
            // Build query string from filters
            const queryParams = new URLSearchParams()
            
            Object.entries(activeFilters).forEach(([key, value]) => {
                if (value && value !== 'all' && value !== '') {
                    queryParams.append(key, value)
                }
            })

            const url = `/api/products?${queryParams.toString()}`
            const response = await fetch(url)
            const data = await response.json()
            
            setProducts(data.products || [])
            setPagination(data.pagination || {})
        } catch (error) {
            console.error('Error fetching products:', error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters)
    }

    const hasActiveFilters = () => {
        return filters.search || 
               filters.category !== 'all' || 
               filters.minPrice || 
               filters.maxPrice || 
               filters.inStock !== 'true'
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] mx-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center py-20">
                        <Loading />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl text-slate-500 my-6 flex items-center gap-2">
                        {initialSearch && <MoveLeftIcon size={20} />}  
                        {filters.discounted ? (
                            <>
                                <span className="text-slate-700 font-medium">Produits</span> en réduction
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
                                    Offres spéciales
                                </span>
                            </>
                        ) : filters.newArrivals ? (
                            <>
                                <span className="text-slate-700 font-medium">Nouveautés</span>
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
                                    Nouvellement ajouté
                                </span>
                            </>
                        ) : (
                            <>
                                Tous les <span className="text-slate-700 font-medium">produits</span>
                            </>
                        )}
                        {pagination.total && (
                            <span className="text-sm text-gray-500 ml-2">
                                ({pagination.total} {pagination.total === 1 ? 'produit' : 'produits'})
                            </span>
                        )}
                    </h1>
                    {(filters.discounted || filters.newArrivals) && (
                        <div className="mt-2">
                            <button
                                onClick={() => {
                                    setFilters(prev => ({ ...prev, discounted: false, newArrivals: false }))
                                    router.push('/shop')
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                ← View All Products
                            </button>
                        </div>
                    )}
                </div>

                {/* Advanced Search and Filter */}
                <div className="mb-6">
                    <AdvancedSearchFilter 
                        onFiltersChange={handleFiltersChange}
                        initialFilters={filters}
                    />
                </div>

                {/* Results Header */}
                {!loading && (
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-sm text-gray-600">
                            {hasActiveFilters() ? (
                                <span>Résultats filtrés : {products.length} produits</span>
                            ) : (
                                <span>Affichage de tous les produits</span>
                            )}
                        </div>
                        
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Vue :</span>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <GridIcon size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <ListIcon size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Products Grid/List */}
                {products.length > 0 ? (
                    <div className={`${
                        viewMode === 'grid' 
                            ? 'grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12' 
                            : 'space-y-4'
                    } mb-32`}>
                        {products.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
                        {hasActiveFilters() && (
                            <p className="text-gray-400 mt-2">Essayez d\'ajuster vos filtres ou termes de recherche</p>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-2 mb-8">
                        <button
                            disabled={pagination.page === 1}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Précédent
                        </button>
                        
                        <span className="px-4 py-2 text-sm text-gray-600">
                            Page {pagination.page} sur {pagination.pages}
                        </span>
                        
                        <button
                            disabled={pagination.page === pagination.pages}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Chargement de la boutique...</div>}>
      <ShopContent />
    </Suspense>
  );
}