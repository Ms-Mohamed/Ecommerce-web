'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product, viewMode = 'grid' }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // calculate the average rating of the product
    const rating = product.rating && product.rating.length > 0 
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0;

    // Get stock status
    const getStockStatus = () => {
        if (!product.stockInfo) return { status: 'unknown', text: 'Stock inconnu', color: 'text-gray-500' }
        if (product.stockInfo.quantity === 0) return { status: 'out', text: 'Rupture de stock', color: 'text-red-500' }
        if (product.stockInfo.quantity <= product.stockInfo.minLevel) return { status: 'low', text: 'Stock faible', color: 'text-yellow-500' }
        return { status: 'good', text: 'En stock', color: 'text-green-500' }
    }

    const stockStatus = getStockStatus()

    if (viewMode === 'list') {
        return (
            <Link href={`/product/${product.id}`} className='group block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex gap-4'>
                    <div className='bg-[#F5F5F5] w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <Image 
                            width={80} 
                            height={80} 
                            className='max-h-20 w-auto group-hover:scale-105 transition duration-300' 
                            src={product.images[0]} 
                            alt={product.name} 
                        />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='text-lg font-medium text-slate-800 group-hover:text-green-600 transition-colors truncate'>
                            {product.name}
                        </h3>
                        <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                            {product.description}
                        </p>
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='flex'>
                                {Array(5).fill('').map((_, index) => (
                                    <StarIcon 
                                        key={index} 
                                        size={14} 
                                        className='text-transparent' 
                                        fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} 
                                    />
                                ))}
                            </div>
                            <span className='text-xs text-gray-500'>
                                ({product.rating?.length || 0} avis)
                            </span>
                        </div>
                        <div className='flex items-center justify-between mt-2'>
                            <span className={`text-xs font-medium ${stockStatus.color}`}>
                                {stockStatus.text}
                            </span>
                            {product.stockInfo && (
                                <span className='text-xs text-gray-500'>
                                    {product.stockInfo.quantity} unités
                                </span>
                            )}
                        </div>
                        <div className='flex items-center justify-between mt-3'>
                            <div className='flex items-center gap-2'>
                                <span className='text-lg font-semibold text-slate-800'>
                                    {currency}{product.price}
                                </span>
                                {product.mrp > product.price && (
                                    <span className='text-sm text-gray-500 line-through'>
                                        {currency}{product.mrp}
                                    </span>
                                )}
                            </div>
                            <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                                {product.category?.name || 'Aucune catégorie'}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        )
    }

    // Grid view (default)
    return (
        <Link href={`/product/${product.id}`} className='group max-xl:mx-auto'>
            <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center'>
                <Image 
                    width={500} 
                    height={500} 
                    className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300' 
                    src={product.images[0]} 
                    alt={product.name} 
                />
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p className='font-medium'>{product.name}</p>
                    <div className='flex items-center gap-1'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon 
                                key={index} 
                                size={14} 
                                className='text-transparent mt-0.5' 
                                fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} 
                            />
                        ))}
                        <span className='text-xs text-gray-500 ml-1'>
                            ({product.rating?.length || 0})
                        </span>
                    </div>
                    <div className='flex items-center gap-2 mt-1'>
                        <span className={`text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.text}
                        </span>
                        {product.stockInfo && (
                            <span className='text-xs text-gray-500'>
                                    {product.stockInfo.quantity} unités
                            </span>
                        )}
                    </div>
                </div>
                <div className='text-right'>
                    <p className='font-semibold'>{currency}{product.price}</p>
                    {product.mrp > product.price && (
                        <p className='text-xs text-gray-500 line-through'>
                            {currency}{product.mrp}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard