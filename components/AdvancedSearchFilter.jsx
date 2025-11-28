'use client'
import { useState, useEffect } from 'react'
import { SearchIcon, FilterIcon, XIcon, SlidersHorizontalIcon, SortAscIcon, SortDescIcon } from 'lucide-react'

const AdvancedSearchFilter = ({ 
  onFiltersChange, 
  initialFilters = {},
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    inStock: 'true',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  })

  const [availableCategories, setAvailableCategories] = useState([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })

  // Fetch filter options when component mounts
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/products?limit=1')
      if (response.ok) {
        const data = await response.json()
        setAvailableCategories(data.filters?.categories || [])
        setPriceRange(data.filters?.priceRange || { min: 0, max: 1000 })
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const handleFilterChange = (key, value, immediate = false) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Show typing indicator for text inputs
    if (!immediate && (key === 'search' || key === 'minPrice' || key === 'maxPrice')) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 500)
    }
    
    if (immediate) {
      // For dropdowns and checkboxes, update immediately
      onFiltersChange(newFilters)
    } else {
      // For text inputs, let the parent component handle debouncing
      onFiltersChange(newFilters)
    }
  }

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      category: 'all',
      minPrice: '',
      maxPrice: '',
      inStock: 'true',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = () => {
    return filters.search || 
           filters.category !== 'all' || 
           filters.minPrice || 
           filters.maxPrice || 
           filters.inStock !== 'true' ||
           filters.sortBy !== 'createdAt' ||
           filters.sortOrder !== 'desc'
  }

  const getSortLabel = () => {
    const sortLabels = {
      createdAt: 'Plus récent',
      price: 'Prix',
      name: 'Nom',
      rating: 'Note'
    }
    const orderLabels = {
      asc: 'Croissant',
      desc: 'Décroissant'
    }
    
    if (filters.sortBy === 'createdAt') {
      return filters.sortOrder === 'desc' ? 'Plus récent en premier' : 'Plus ancien en premier'
    }
    
    return `${sortLabels[filters.sortBy]} (${orderLabels[filters.sortOrder]})`
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des produits, catégories ou boutiques..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {isTyping && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {filters.search && !isTyping && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <SlidersHorizontalIcon className="w-4 h-4" />
            Filtres
            {hasActiveFilters() && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Actif
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <SortAscIcon className="w-4 h-4 text-gray-400" />
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                const newFilters = { ...filters, sortBy, sortOrder }
                setFilters(newFilters)
                onFiltersChange(newFilters)
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="createdAt-desc">Plus récent en premier</option>
              <option value="createdAt-asc">Plus ancien en premier</option>
              <option value="price-asc">Prix : Croissant</option>
              <option value="price-desc">Prix : Décroissant</option>
              <option value="name-asc">Nom : A à Z</option>
              <option value="name-desc">Nom : Z à A</option>
              <option value="rating-desc">Plus populaire</option>
            </select>
          </div>
        </div>

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <XIcon className="w-4 h-4" />
            Tout effacer
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value, true)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Toutes les catégories</option>
                {Array.isArray(availableCategories) && availableCategories.map((category) => (
                  <option key={category.id || category} value={category.name || category}>
                    {category.name || category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plage de prix
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  max={priceRange.max}
                />
                <span className="flex items-center text-gray-500">à</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  max={priceRange.max}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Range: ${priceRange.min} - ${priceRange.max}
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilité
              </label>
              <select
                value={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.value, true)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="true">En stock uniquement</option>
                <option value="false">Rupture de stock uniquement</option>
                <option value="all">Tous les produits</option>
              </select>
            </div>
          </div>

          {/* Quick Price Filters */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtres de prix rapides
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Moins de 100$', min: 0, max: 100 },
                { label: '100$ - 500$', min: 100, max: 500 },
                { label: '500$ - 1000$', min: 500, max: 1000 },
                { label: 'Plus de 1000$', min: 1000, max: priceRange.max }
              ].map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => {
                    const newFilters = { 
                      ...filters, 
                      minPrice: filter.min.toString(), 
                      maxPrice: filter.max.toString() 
                    }
                    setFilters(newFilters)
                    onFiltersChange(newFilters)
                  }}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearchFilter
