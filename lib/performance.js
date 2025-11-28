// Performance monitoring and optimization utilities

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.isEnabled = process.env.NODE_ENV === 'development'
  }

  // Start timing a function or operation
  startTimer(name) {
    if (!this.isEnabled) return
    this.metrics.set(name, { start: performance.now() })
  }

  // End timing and log the result
  endTimer(name, logResult = true) {
    if (!this.isEnabled) return 0
    
    const metric = this.metrics.get(name)
    if (!metric) return 0

    const duration = performance.now() - metric.start
    this.metrics.delete(name)

    if (logResult) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  // Measure function execution time
  async measureAsync(name, fn) {
    this.startTimer(name)
    try {
      const result = await fn()
      this.endTimer(name)
      return result
    } catch (error) {
      this.endTimer(name)
      throw error
    }
  }

  // Measure synchronous function execution time
  measureSync(name, fn) {
    this.startTimer(name)
    try {
      const result = fn()
      this.endTimer(name)
      return result
    } catch (error) {
      this.endTimer(name)
      throw error
    }
  }

  // Log memory usage
  logMemoryUsage(label = 'Memory Usage') {
    if (!this.isEnabled || typeof process === 'undefined') return

    const memUsage = process.memoryUsage()
    console.log(`🧠 ${label}:`, {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
    })
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor()

// Higher-order function to wrap API routes with performance monitoring
export function withPerformanceMonitoring(handler, routeName) {
  return async (request, context) => {
    const startTime = performance.now()
    
    try {
      const result = await handler(request, context)
      const duration = performance.now() - startTime
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${routeName}: ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`❌ ${routeName} failed after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  }
}

// Debounce utility for search and filter inputs
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle utility for scroll and resize events
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Lazy loading utility for images
export function createImageObserver(callback, options = {}) {
  if (typeof window === 'undefined') return null

  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Preload critical resources
export function preloadResource(href, as = 'script') {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Batch DOM updates
export function batchDOMUpdates(updates) {
  if (typeof window === 'undefined') {
    updates.forEach(update => update())
    return
  }

  requestAnimationFrame(() => {
    updates.forEach(update => update())
  })
}

export default performanceMonitor
