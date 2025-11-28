'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Add custom CSS for smooth marquee animation
const marqueeStyles = `
    @keyframes marqueeScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }
`

const CategoriesMarquee = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories')
            if (response.ok) {
                const data = await response.json()
                if (Array.isArray(data)) {
                    // Filter to show only categories that have products
                    const categoriesWithProducts = data.filter(category => 
                        category._count && category._count.products > 0
                    )
                    setCategories(categoriesWithProducts)
                } else {
                    console.error('Categories data is not an array:', data)
                    setCategories([])
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCategoryClick = (categoryName) => {
        // Navigate to shop page with category filter
        router.push(`/shop?category=${encodeURIComponent(categoryName)}`)
    }

    // Create enough categories for smooth marquee effect
    const displayCategories = categories.length > 0 ? [...categories, ...categories, ...categories, ...categories, ...categories, ...categories] : []

    return (
        <>
            <style jsx>{marqueeStyles}</style>
            <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
            <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
            <div className="flex animate-[marqueeScroll_10s_linear_infinite] sm:animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-4" style={{width: 'max-content'}}>
                {loading ? (
                    // Loading state
                    Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="px-5 py-2 bg-slate-100 rounded-lg text-slate-300 text-xs sm:text-sm animate-pulse">
                            Loading...
                        </div>
                    ))
                ) : displayCategories.length > 0 ? (
                    displayCategories.map((category, index) => (
                        <button 
                            key={`${category.id}-${index}`} 
                            onClick={() => handleCategoryClick(category.name)}
                            className="px-5 py-2 bg-slate-100 rounded-lg text-slate-500 text-xs sm:text-sm hover:bg-slate-600 hover:text-white active:scale-95 transition-all duration-300 cursor-pointer"
                        >
                            {category.name}
                        </button>
                    ))
                ) : (
                    // Fallback if no categories
                    <div className="px-5 py-2 bg-slate-100 rounded-lg text-slate-400 text-xs sm:text-sm">
                        No categories available
                    </div>
                )}
            </div>
            <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
        </div>
        </>
    );
};

export default CategoriesMarquee;