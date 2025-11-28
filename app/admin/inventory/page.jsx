'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import InventoryManager from '@/components/admin/InventoryManager'
import Loading from '@/components/Loading'

export default function AdminInventory() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.email !== 'admin@example.com') {
      router.push('/')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <Loading />
  }

  if (!session || session.user.email !== 'admin@example.com') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-red-500">Access Denied: Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage product stock levels</p>
        </div>
        
        <InventoryManager />
      </div>
    </div>
  )
}
