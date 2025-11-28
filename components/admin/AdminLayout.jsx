'use client'
import { useEffect, useState } from "react"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"

const AdminLayout = ({ children }) => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'loading') return
        
        if (!session) {
            router.push('/auth/signin')
            return
        }

        // Simple admin check - in production, you'd check user roles
        if (session.user.email !== 'admin@example.com') {
            setLoading(false)
            return
        }

        setLoading(false)
    }, [session, status, router])

    if (status === 'loading' || loading) {
        return <Loading />
    }

    // Check if user is admin
    if (!session || session.user.email !== 'admin@example.com') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
                <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                    Go to home <ArrowRightIcon size={18} />
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen">
            <AdminNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AdminLayout