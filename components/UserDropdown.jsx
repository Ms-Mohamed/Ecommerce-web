'use client'
import { useState, useRef, useEffect } from 'react'
import { User, Package, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

const UserDropdown = ({ user, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Name Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium group"
      >
        <User size={18} className="text-gray-500 group-hover:text-gray-700" />
        <span className="hidden sm:block">{user.name}</span>
        <ChevronDown 
          size={14} 
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200"
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/orders"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <Package size={16} className="text-gray-400" />
              <span>Mes commandes</span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={16} className="text-gray-400" />
              <span>Modifier le profil</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} className="text-gray-400" />
                <span>Panneau d'administration</span>
              </Link>
            )}

            <hr className="my-1 border-gray-100" />

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 w-full text-left"
            >
              <LogOut size={16} className="text-gray-400" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDropdown
