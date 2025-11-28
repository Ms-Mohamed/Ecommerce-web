'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, TicketPercentIcon, PackageIcon, ShoppingCartIcon, UsersIcon, BarChart3Icon, WarehouseIcon, TagIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"

const AdminSidebar = () => {

    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Tableau de bord', href: '/admin', icon: HomeIcon },
        { name: 'Analytiques', href: '/admin/analytics', icon: BarChart3Icon },
        { name: 'Produits', href: '/admin/products', icon: PackageIcon },
        { name: 'Catégories', href: '/admin/categories', icon: TagIcon },
        { name: 'Inventaire', href: '/admin/inventory', icon: WarehouseIcon },
        { name: 'Commandes', href: '/admin/orders', icon: ShoppingCartIcon },
        { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
        { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon  },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Image className="w-40 h-16" src="/uploads/logo.png" alt="Logo" width={160} height={64} />
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {pathname === link.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default AdminSidebar