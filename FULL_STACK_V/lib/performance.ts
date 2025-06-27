// Performance monitoring utilities

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private observers: PerformanceObserver[] = []

  startTimer(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    })
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name)
    if (!metric) return null

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`, metric.metadata)
    }

    return metric.duration
  }

  getMetric(name: string): PerformanceMetric | null {
    return this.metrics.get(name) || null
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  clearMetrics(): void {
    this.metrics.clear()
  }

  // Monitor Core Web Vitals
  startWebVitalsMonitoring(): void {
    if (typeof window === 'undefined') return

    // Monitor LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('📊 LCP:', lastEntry.startTime)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // Monitor FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        console.log('📊 FID:', entry.processingStart - entry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Monitor CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      console.log('📊 CLS:', clsValue)
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    this.observers.push(lcpObserver, fidObserver, clsObserver)
  }

  // Monitor API calls
  async measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name, metadata)
    try {
      const result = await apiCall()
      this.endTimer(name)
      return result
    } catch (error) {
      this.endTimer(name)
      throw error
    }
  }

  // Monitor component render time
  measureComponentRender(componentName: string, renderFn: () => void): void {
    this.startTimer(`render-${componentName}`)
    renderFn()
    this.endTimer(`render-${componentName}`)
  }

  // Get performance report
  getReport(): Record<string, any> {
    const metrics = this.getAllMetrics()
    const completedMetrics = metrics.filter(m => m.duration !== undefined)

    return {
      totalMetrics: metrics.length,
      completedMetrics: completedMetrics.length,
      averageDuration: completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / completedMetrics.length,
      slowestOperation: completedMetrics.reduce((slowest, m) => 
        (m.duration || 0) > (slowest.duration || 0) ? m : slowest
      ),
      metrics: completedMetrics
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// React hook for measuring component performance
export function usePerformanceMeasure(componentName: string) {
  return {
    startMeasure: () => performanceMonitor.startTimer(`render-${componentName}`),
    endMeasure: () => performanceMonitor.endTimer(`render-${componentName}`),
    measureApiCall: <T>(name: string, apiCall: () => Promise<T>) => 
      performanceMonitor.measureApiCall(name, apiCall)
  }
}

// HOC for measuring component performance
export function withPerformanceMeasure<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMeasuredComponent(props: P) {
    const { startMeasure, endMeasure } = usePerformanceMeasure(componentName)
    
    React.useEffect(() => {
      startMeasure()
      return () => endMeasure()
    })

    return <Component {...props} />
  }
} 