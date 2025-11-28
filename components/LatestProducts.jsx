'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import Loading from './Loading'
import ProductSkeleton from './ProductSkeleton'

const LatestProducts = () => {
    const [products, setProducts] = useState([])
    const [totalProducts, setTotalProducts] = useState(0)
    const [loading, setLoading] = useState(true)
    const displayQuantity = 4

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch('/api/products?limit=8')
            const data = await response.json()
            setProducts(data.products || [])
            setTotalProducts(data.pagination?.total || 0)
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    // Memoize sorted products to avoid recalculation on every render
    const sortedProducts = useMemo(() => {
        return products
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, displayQuantity)
    }, [products, displayQuantity])

    if (loading) {
        return <ProductSkeleton count={4} />
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Derniers produits' description={`Affichage de ${products.length < displayQuantity ? products.length : displayQuantity} sur ${totalProducts} produits`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts