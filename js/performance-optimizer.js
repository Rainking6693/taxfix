/**
 * Performance Optimization Script for TaxFix
 * Handles lazy loading, image optimization, and performance enhancements
 */

class PerformanceOptimizer {
    constructor() {
        this.lazyImages = [];
        this.lazyImageObserver = null;
        this.isInitialized = false;
        
        // Performance metrics
        this.metrics = {
            imagesLoaded: 0,
            totalImages: 0,
            loadStartTime: performance.now()
        };
    }

    init() {
        if (this.isInitialized) return;
        
        document.addEventListener('DOMContentLoaded', () => {
            this.setupLazyLoading();
            this.optimizeImages();
            this.enableResourceHints();
            this.setupServiceWorker();
            this.measurePerformance();
        });
        
        this.isInitialized = true;
    }

    /**
     * Set up lazy loading for images below the fold
     */
    setupLazyLoading() {
        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            this.loadAllImages();
            return;
        }

        // Find all images that should be lazy loaded
        this.lazyImages = Array.from(document.querySelectorAll('img[data-src], iframe[data-src]'));
        this.metrics.totalImages = this.lazyImages.length;

        if (this.lazyImages.length === 0) return;

        // Create intersection observer
        this.lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    this.loadImage(element);
                    observer.unobserve(element);
                }
            });
        }, {
            // Load images when they're 100px away from entering the viewport
            rootMargin: '100px 0px',
            threshold: 0.01
        });

        // Start observing lazy images
        this.lazyImages.forEach(img => {
            this.lazyImageObserver.observe(img);
        });

        // Add loading placeholder styles
        this.addLazyLoadingStyles();
    }

    /**
     * Load a single image
     */
    loadImage(element) {
        const src = element.dataset.src;
        if (!src) return;

        // Add loading class for smooth transition
        element.classList.add('loading');

        if (element.tagName === 'IMG') {
            // Handle image loading
            element.onload = () => {
                element.classList.remove('loading');
                element.classList.add('loaded');
                this.metrics.imagesLoaded++;
                this.trackImageLoad(element);
            };
            
            element.onerror = () => {
                element.classList.remove('loading');
                element.classList.add('error');
                console.warn('Failed to load image:', src);
            };
            
            element.src = src;
        } else if (element.tagName === 'IFRAME') {
            // Handle iframe loading
            element.onload = () => {
                element.classList.remove('loading');
                element.classList.add('loaded');
            };
            
            element.src = src;
        }

        // Remove data-src attribute
        element.removeAttribute('data-src');
    }

    /**
     * Load all images immediately (fallback for older browsers)
     */
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src], iframe[data-src]');
        lazyImages.forEach(element => {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        });
    }

    /**
     * Optimize existing images
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach((img, index) => {
            // Add responsive image attributes if missing
            if (!img.sizes && img.clientWidth) {
                img.sizes = `(max-width: 768px) 100vw, ${img.clientWidth}px`;
            }

            // Add loading="lazy" for below-fold images (native lazy loading)
            if (index > 2 && !img.loading) {
                img.loading = 'lazy';
            }

            // Add decode="async" for better performance
            if (!img.decode) {
                img.decoding = 'async';
            }

            // Optimize logo and critical images
            if (img.alt && img.alt.toLowerCase().includes('logo')) {
                img.loading = 'eager';
                img.fetchPriority = 'high';
            }
        });
    }

    /**
     * Enable resource hints for better performance
     */
    enableResourceHints() {
        const head = document.head;

        // DNS prefetch for external resources
        const externalDomains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'www.googletagmanager.com',
            'analytics.tiktok.com',
            'taxtok.gumroad.com',
            'calendar.app.google'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            head.appendChild(link);
        });

        // Preconnect to critical resources
        const preconnectDomains = [
            'https://fonts.gstatic.com',
            'https://www.googletagmanager.com'
        ];

        preconnectDomains.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = href;
            link.crossOrigin = 'anonymous';
            head.appendChild(link);
        });
    }

    /**
     * Set up service worker for caching
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('Service Worker registered successfully');
                    })
                    .catch(error => {
                        console.log('Service Worker registration failed');
                    });
            });
        }
    }

    /**
     * Add CSS for lazy loading animations
     */
    addLazyLoadingStyles() {
        const styleId = 'lazy-loading-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            <style id="${styleId}">
                img[data-src], iframe[data-src] {
                    background: #f1f5f9;
                    transition: opacity 0.3s ease;
                }
                
                img.loading, iframe.loading {
                    opacity: 0.7;
                    filter: blur(2px);
                }
                
                img.loaded, iframe.loaded {
                    opacity: 1;
                    filter: none;
                }
                
                img.error {
                    opacity: 0.5;
                    background: #fee2e2;
                }
                
                /* Skeleton loader for images */
                img[data-src]::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }
                
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                img.loaded::before {
                    display: none;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * Track image loading performance
     */
    trackImageLoad(img) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'image_lazy_loaded', {
                'event_category': 'performance',
                'event_label': img.alt || img.src,
                'images_loaded': this.metrics.imagesLoaded,
                'total_images': this.metrics.totalImages
            });
        }
    }

    /**
     * Measure and report performance metrics
     */
    measurePerformance() {
        // Wait for page to load completely
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.reportVitals();
            }, 0);
        });

        // Report Core Web Vitals if available
        if ('PerformanceObserver' in window) {
            this.measureCoreWebVitals();
        }
    }

    /**
     * Measure Core Web Vitals
     */
    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                    'event_category': 'performance',
                    'event_label': 'LCP',
                    'value': Math.round(lastEntry.startTime)
                });
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'web_vitals', {
                        'event_category': 'performance',
                        'event_label': 'FID',
                        'value': Math.round(entry.processingStart - entry.startTime)
                    });
                }
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                    'event_category': 'performance',
                    'event_label': 'CLS',
                    'value': Math.round(clsValue * 1000)
                });
            }
        }).observe({ entryTypes: ['layout-shift'] });
    }

    /**
     * Report performance vitals
     */
    reportVitals() {
        if (!performance || !performance.timing) return;

        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0];

        const metrics = {
            // Page load metrics
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            pageLoad: timing.loadEventEnd - timing.navigationStart,
            firstPaint: this.getFirstPaint(),
            
            // Network metrics
            dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
            tcpConnection: timing.connectEnd - timing.connectStart,
            serverResponse: timing.responseStart - timing.requestStart,
            
            // Custom metrics
            imagesLoaded: this.metrics.imagesLoaded,
            totalImages: this.metrics.totalImages,
            loadDuration: performance.now() - this.metrics.loadStartTime
        };

        // Log performance metrics
        console.log('Performance Metrics:', metrics);

        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metrics', {
                'event_category': 'performance',
                'dom_content_loaded': metrics.domContentLoaded,
                'page_load': metrics.pageLoad,
                'images_loaded': metrics.imagesLoaded,
                'custom_metric_value': Math.round(metrics.loadDuration)
            });
        }
    }

    /**
     * Get First Paint timing
     */
    getFirstPaint() {
        if (!performance || !performance.getEntriesByType) return null;
        
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        
        return firstPaint ? Math.round(firstPaint.startTime) : null;
    }

    /**
     * Convert images to use lazy loading
     */
    convertToLazyLoading(selector = 'img') {
        const images = document.querySelectorAll(selector);
        
        images.forEach((img, index) => {
            // Skip first 3 images (above the fold)
            if (index < 3) return;
            
            // Skip if already has data-src
            if (img.dataset.src) return;
            
            // Move src to data-src
            if (img.src && img.src !== window.location.href) {
                img.dataset.src = img.src;
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg==';
                img.loading = 'lazy';
            }
        });
        
        // Reinitialize lazy loading for converted images
        this.setupLazyLoading();
    }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();
performanceOptimizer.init();

// Export for manual use
window.PerformanceOptimizer = PerformanceOptimizer;
window.performanceOptimizer = performanceOptimizer;