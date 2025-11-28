'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const DatabaseCartContext = createContext()

export const useCart = () => {
  const context = useContext(DatabaseCartContext)
  if (!context) {
    throw new Error('useCart must be used within a DatabaseCartProvider')
  }
  return context
}

export const DatabaseCartProvider = ({ children }) => {
  const { data: session, status } = useSession()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch cart items from database
  const fetchCartItems = async () => {
    if (!session?.user?.id) {
      console.log('DatabaseCartContext - No session or user ID, clearing cart')
      setCartItems([])
      return
    }

    try {
      console.log('DatabaseCartContext - Fetching cart for user:', session.user.id)
      setLoading(true)
      const response = await fetch('/api/cart')
      console.log('DatabaseCartContext - Cart API response status:', response.status)
      
      if (response.ok) {
        const items = await response.json()
        console.log('DatabaseCartContext - Cart items received:', items.length)
        setCartItems(items)
      } else {
        let errorData = {}
        try {
          errorData = await response.json()
        } catch (e) {
          console.error('DatabaseCartContext - Could not parse error response')
        }
        console.error('DatabaseCartContext - Failed to fetch cart items:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        setCartItems([])
      }
    } catch (error) {
      console.error('DatabaseCartContext - Error fetching cart items:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  // Load cart items when user session changes
  useEffect(() => {
    console.log('DatabaseCartContext - useEffect triggered, status:', status, 'session:', !!session)
    
    if (status === 'loading') {
      console.log('DatabaseCartContext - Still loading session')
      return
    }
    
    if (session?.user?.id) {
      console.log('DatabaseCartContext - User authenticated, fetching cart')
      fetchCartItems()
    } else {
      console.log('DatabaseCartContext - No user session, clearing cart')
      setCartItems([])
    }
  }, [session?.user?.id, status]) // Only depend on user ID, not entire session object

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to add items to cart')
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        }),
      })

      if (response.ok) {
        // Optimistically update cart instead of refetching
        const newItem = await response.json()
        setCartItems(prev => [...prev, newItem])
        toast.success(`${product.name} added to cart!`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  // Update item quantity
  const updateQuantity = async (cartItemId, quantity) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })

      if (response.ok) {
        // Optimistically update cart
        setCartItems(prev => 
          prev.map(item => 
            item.id === cartItemId 
              ? { ...item, quantity }
              : item
          )
        )
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update quantity')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Optimistically update cart
        setCartItems(prev => prev.filter(item => item.id !== cartItemId))
        toast.success('Item removed from cart')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('Failed to remove item')
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      })

      if (response.ok) {
        setCartItems([])
        toast.success('Cart cleared')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to clear cart')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
    }
  }

  // Calculate total items
  const total = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  // Get cart items with product details
  const items = cartItems.map(item => ({
    id: item.product.id,
    name: item.product.name,
    price: item.product.price,
    image: item.product.images[0],
    quantity: item.quantity,
    cartItemId: item.id,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      storeId: item.product.storeId,
      images: item.product.images
    }
  }))

  const value = {
    cartItems: items,
    total,
    totalPrice,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCartItems
  }

  return (
    <DatabaseCartContext.Provider value={value}>
      {children}
    </DatabaseCartContext.Provider>
  )
}
