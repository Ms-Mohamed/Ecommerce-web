'use client'
import React from 'react'

const ProductSkeleton = ({ count = 4 }) => {
  return (
    <div className='px-6 my-30 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <div className='h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse'></div>
        <div className='h-4 bg-gray-200 rounded w-32 animate-pulse'></div>
      </div>
      
      <div className='grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className='bg-white border border-gray-200 rounded-lg p-4 animate-pulse'>
            <div className='bg-gray-200 h-48 rounded-lg mb-4'></div>
            <div className='h-4 bg-gray-200 rounded mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
            <div className='h-6 bg-gray-200 rounded w-1/2'></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductSkeleton
