'use client'
import { Search, ShoppingCart, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/contexts/DatabaseCartContext";
import UserDropdown from "./UserDropdown";

const Navbar = () => {

    const router = useRouter();
    const { data: session, status } = useSession();
    const { total: cartCount } = useCart();

    const [search, setSearch] = useState('')

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' })
    }

    return (
        <nav className="relative bg-white border-b border-gray-200">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="flex items-center">
                        <img 
                            src="/uploads/logo.png" 
                            alt="VAL DE SEINE SERVICE" 
                            className="h-12 w-auto"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8">
                        <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium">Accueil</Link>
                        <Link href="/shop" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium">Boutique</Link>
                        <Link href="/about" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium">À propos</Link>
                        <Link href="/contact" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-gray-100 px-4 py-3 rounded-full border border-gray-200">
                            <Search size={18} className="text-gray-500" />
                            <input className="w-full bg-transparent outline-none placeholder-gray-400 text-gray-700" type="text" placeholder="Rechercher des produits" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium">
                            <ShoppingCart size={18} />
                            Panier
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-gradient-to-r from-red-500 to-orange-500 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {session ? (
                            <div className="flex items-center gap-4">
                                <UserDropdown 
                                    user={session.user} 
                                    isAdmin={session.user.email === 'admin@example.com'} 
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link 
                                    href="/auth/signin"
                                    className="px-6 py-2 text-gray-700 hover:text-gray-900 transition font-medium"
                                >
                                    Se connecter
                                </Link>
                                <Link 
                                    href="/auth/signup"
                                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition text-white rounded-full font-medium shadow-lg hover:shadow-xl"
                                >
                                    S'inscrire
                                </Link>
                            </div>
                        )}

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        {session ? (
                            <UserDropdown 
                                user={session.user} 
                                isAdmin={session.user.email === 'admin@example.com'} 
                            />
                        ) : (
                            <Link 
                                href="/auth/signin"
                                className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-sm transition text-white rounded-full font-medium"
                            >
                                Se connecter
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-200" />
        </nav>
    )
}

export default Navbar