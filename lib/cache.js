import { NextResponse } from 'next/server'

// Simple in-memory cache for API responses
class Cache {
  constructor() {
    this.cache = new Map()
    this.ttl = new Map() // Time to live
  }

  set(key, value, ttlSeconds = 300) { // Default 5 minutes
    this.cache.set(key, value)
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000))
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null
    }

    const expiry = this.ttl.get(key)
    if (Date.now() > expiry) {
      this.cache.delete(key)
      this.ttl.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  delete(key) {
    this.cache.delete(key)
    this.ttl.delete(key)
  }

  clear() {
    this.cache.clear()
    this.ttl.clear()
  }

  // Generate cache key from request parameters
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${prefix}:${sortedParams}`
  }
}

// Create singleton instance
const cache = new Cache()

export default cache

// Cache middleware for API routes
export function withCache(handler, options = {}) {
  const { ttl = 300, keyGenerator } = options

  return async (request, context) => {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return handler(request, context)
    }

    // Generate cache key
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const cacheKey = keyGenerator 
      ? keyGenerator(params, context)
      : cache.generateKey(url.pathname, params)

    // Try to get from cache
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
        },
      })
    }

    // Execute handler and cache result
    try {
      const response = await handler(request, context)
      
      // Check if response is ok and is a NextResponse
      if (response && response.ok && response.status < 400) {
        try {
          // Clone the response to read it without consuming the original
          const clonedResponse = response.clone()
          
          // Read the response body as JSON
          const data = await clonedResponse.json()
          
          // Cache the data
          cache.set(cacheKey, data, ttl)
          
          // Add cache headers to the original response
          const headers = new Headers(response.headers)
          headers.set('X-Cache', 'MISS')
          headers.set('Cache-Control', `public, max-age=${ttl}`)
          
          // Return the original response with new headers
          return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
          })
        } catch (error) {
          console.error('Cache error (non-fatal):', error)
          // If we can't cache, just return the original response
          return response
        }
      }

      return response
    } catch (error) {
      console.error('Handler error:', error)
      // If handler throws, let it propagate
      throw error
    }
  }
}
