'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {
    const [products, setProducts] = useState([])
    const [currentProductIndex, setCurrentProductIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [progressKey, setProgressKey] = useState(0)
    const router = useRouter()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    useEffect(() => {
        fetchProducts()
        
        // Refresh products every 30 seconds to catch new additions
        const refreshInterval = setInterval(() => {
            fetchProducts()
        }, 30000)
        
        return () => clearInterval(refreshInterval)
    }, [])

    useEffect(() => {
        if (products.length > 1) {
            const interval = setInterval(() => {
                setIsTransitioning(true)
                
                // Start transition
                setTimeout(() => {
                    setCurrentProductIndex((prevIndex) => 
                        (prevIndex + 1) % products.length
                    )
                    
                    // End transition and reset progress bar
                    setTimeout(() => {
                        setIsTransitioning(false)
                        setProgressKey(prev => prev + 1) // Reset progress bar animation
                    }, 250) // Half of the transition duration
                }, 250) // Half of the transition duration
            }, 5000) // Change product every 5 seconds

            return () => clearInterval(interval)
        }
    }, [products])

    const fetchProducts = async () => {
        try {
            // Fetch ALL products for rotation (no featured filter)
            const response = await fetch('/api/products?limit=20')
            if (response.ok) {
                const data = await response.json()
                if (data.products && data.products.length > 0) {
                    setProducts(data.products)
                    setProgressKey(0) // Reset progress bar when products load
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLearnMore = () => {
        const currentProduct = products[currentProductIndex]
        if (currentProduct) {
            router.push(`/product/${currentProduct.id}`)
        }
    }

    const currentProduct = products[currentProductIndex]

    return (
        <>
            <style jsx>{`
                @keyframes progress {
                    0% { width: 100%; }
                    100% { width: 0%; }
                }
                
                @keyframes fadeInUp {
                    0% { 
                        opacity: 0; 
                        transform: translateY(20px); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                
                @keyframes slideInRight {
                    0% { 
                        opacity: 0; 
                        transform: translateX(30px) scale(0.9); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateX(0) scale(1); 
                    }
                }
                
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out;
                }
                
                .animate-slide-in-right {
                    animation: slideInRight 0.5s ease-out;
                }
                
            `}</style>
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className={`relative flex-1 flex flex-col rounded-3xl xl:min-h-100 group shadow-lg overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-600 transition-all duration-500 ease-in-out ${
                    isTransitioning ? 'shadow-2xl shadow-orange-500/20' : 'shadow-lg'
                }`}>
                    {/* Background Icons */}
                    <div className='absolute inset-0 pointer-events-none opacity-10'>
                        {/* Code brackets icon */}
                        <div className='absolute top-10 left-10 text-6xl text-white font-bold'>&lt; / &gt;</div>
                        
                        {/* Shield icon */}
                        <div className='absolute top-10 right-10 w-16 h-16 border-4 border-white rounded-lg'></div>
                        
                        {/* Wrench/Spanner icon */}
                        <div className='absolute bottom-10 left-10 w-12 h-12 border-4 border-white rounded-full'></div>
                        
                        {/* Headphone icon */}
                        <div className='absolute bottom-10 right-10 w-14 h-14 border-4 border-white rounded-full'></div>
                        
                        {/* Circle with number */}
                        <div className='absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-12 h-12 border-4 border-white rounded-full flex items-center justify-center'>
                            <span className='text-white text-xl font-bold'>0</span>
                        </div>
                        
                        {/* Additional tech icons */}
                        <div className='absolute top-1/3 right-1/4 w-8 h-8 border-2 border-white rounded'></div>
                        <div className='absolute top-1/2 left-1/4 w-6 h-6 border-2 border-white rounded-full'></div>
                        <div className='absolute bottom-1/4 right-1/3 w-10 h-10 border-2 border-white rounded-lg'></div>
                    </div>
                    
                    <div className='relative z-10 p-5 sm:p-16 flex items-center justify-between'>
                        <div className='flex-1'>
                            <div className='inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white pr-4 p-1 rounded-full text-xs sm:text-sm mb-4'>
                                <span className='bg-white/30 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>ACTUALITÉS</span> Livraison gratuite pour les commandes de plus de 50$ ! <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                            </div>
                            <h2 className={`text-3xl sm:text-5xl leading-[1.2] my-3 font-medium text-white max-w-xs sm:max-w-md transition-all duration-500 ease-in-out transform ${
                                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                            }`}>
                                {loading ? 'Chargement...' : (currentProduct?.name || 'Produit vedette')}
                        </h2>
                            <div className={`text-white/90 text-sm font-medium mt-4 sm:mt-8 transition-all duration-500 ease-in-out transform ${
                                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                            }`}>
                                <p>Prix :</p>
                                <p className={`text-3xl text-white transition-all duration-500 ease-in-out transform ${
                                    isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                                }`}>
                                    {loading ? '...' : (currentProduct ? `${currency}${currentProduct.price}` : `${currency}0.00`)}
                                </p>
                            </div>
                            <button 
                                onClick={handleLearnMore}
                                disabled={!currentProduct}
                                className={`bg-white text-orange-600 text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-white/90 hover:scale-103 active:scale-95 transition-all duration-300 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform ${
                                    isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                                }`}
                            >
                                EN SAVOIR PLUS
                            </button>
                            
                            {/* Progress Bar for Product Rotation */}
                            {products.length > 1 && (
                                <div className={`mt-4 w-full bg-white/20 rounded-full h-1 overflow-hidden transition-all duration-500 ease-in-out transform ${
                                    isTransitioning ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                                }`}>
                                    <div 
                                        key={progressKey}
                                        className='bg-white h-full rounded-full transition-all duration-100 ease-linear'
                                        style={{
                                            width: '100%',
                                            animation: isTransitioning ? 'none' : 'progress 5s linear'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Product Image Field */}
                        <div className='hidden sm:flex items-center justify-center w-1/2'>
                            <div className='relative'>
                                {/* Product Counter Indicator */}
                                {products.length > 1 && (
                                    <div className={`absolute -top-2 -right-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-medium z-20 transition-all duration-500 ease-in-out transform ${
                                        isTransitioning ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                                    }`}>
                                        {currentProductIndex + 1} / {products.length}
                                    </div>
                                )}
                                {/* Image Container */}
                                <div className={`w-64 h-64 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl shadow-lg relative overflow-hidden hover:scale-105 transition-all duration-500 ease-in-out transform ${
                                    isTransitioning ? 'opacity-0 scale-95 rotate-2' : 'opacity-100 scale-100 rotate-0'
                                }`}>
                                    {/* Product Image */}
                                    {loading ? (
                                        <div className='w-full h-full flex items-center justify-center bg-white/20 rounded-2xl'>
                                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
                                        </div>
                                    ) : currentProduct?.images && currentProduct.images.length > 0 ? (
                                        <Image 
                                            src={currentProduct.images[0]} 
                                            alt={currentProduct.name || "Featured Product"} 
                                            fill
                                            className={`object-cover rounded-2xl transition-all duration-500 ease-in-out transform ${
                                                isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
                                            }`}
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center bg-white/20 rounded-2xl transition-all duration-500 ease-in-out transform ${
                                            isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
                                        }`}>
                                            <div className='text-center text-white'>
                                                <div className='text-4xl mb-2'>📦</div>
                                                <div className='text-sm font-medium'>{currentProduct?.name || 'Produit'}</div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Image Overlay Effects */}
                                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent'></div>
                                    
                                    {/* Floating particles around the image */}
                                    <div className='absolute -top-2 -left-2 w-2 h-2 bg-white/30 rounded-full animate-bounce' style={{animationDelay: '0s', animationDuration: '2s'}}></div>
                                    <div className='absolute -bottom-2 -right-2 w-1 h-1 bg-white/40 rounded-full animate-bounce' style={{animationDelay: '1s', animationDuration: '2.5s'}}></div>
                                    <div className='absolute top-1/2 -right-4 w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce' style={{animationDelay: '0.5s', animationDuration: '3s'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600 animate-fade-in-up' style={{animationDelay: '0.3s'}}>
                    <div 
                        onClick={() => router.push('/shop?newArrivals=true')}
                        className='flex-1 flex items-center justify-between w-full bg-orange-200 rounded-3xl p-6 px-8 group hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer'
                    >
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40'>Nouveautés</p>
                            <p className='flex items-center gap-1 mt-4 group-hover:text-slate-700 transition-colors duration-200'>Voir plus <ArrowRightIcon className='group-hover:ml-1 transition-all duration-200' size={18} /> </p>
                        </div>
                        <div className='group-hover:scale-105 transition-transform duration-200 ease-in-out'>
                            <Image className='w-35' src={assets.hero_product_img1} alt="" />
                        </div>
                    </div>
                    <div 
                        onClick={() => router.push('/shop?discounted=true')}
                        className='flex-1 flex items-center justify-between w-full bg-blue-200 rounded-3xl p-6 px-8 group hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer'
                    >
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40'>20% de réduction</p>
                            <p className='flex items-center gap-1 mt-4 group-hover:text-slate-700 transition-colors duration-200'>Voir plus <ArrowRightIcon className='group-hover:ml-1 transition-all duration-200' size={18} /> </p>
                        </div>
                        <div className='group-hover:scale-105 transition-transform duration-200 ease-in-out'>
                            <Image className='w-35' src={assets.hero_product_img2} alt="" />
                        </div>
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>
        </>
    )
}

export default Hero