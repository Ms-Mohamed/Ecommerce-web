'use client'
import Link from "next/link"

const StoreNavbar = () => {


    return (
        <div className="flex items-center justify-between px-12 py-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 border-b border-yellow-300/20 transition-all">
            <Link href="/" className="flex items-center">
                <img 
                    src="/uploads/logo.png" 
                    alt="VAL DE SEINE SERVICE" 
                    className="h-12 w-auto"
                />
            </Link>
            <div className="flex items-center gap-3">
                <p className="text-gray-900 font-medium">Hi, Seller</p>
            </div>
        </div>
    )
}

export default StoreNavbar