
// Enhanced performance monitoring
(function() {
    function measureCoreWebVitals() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime + 'ms');
            }).observe({entryTypes: ['largest-contentful-paint']});
            
            // First Input Delay
            new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime + 'ms');
                });
            }).observe({entryTypes: ['first-input']});
            
            // Cumulative Layout Shift
            let clsValue = 0;
            new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('CLS:', clsValue);
            }).observe({entryTypes: ['layout-shift']});
        }
        
        // Page Load Performance
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            console.log('Performance Metrics:');
            console.log('Page Load Time:', pageLoadTime + 'ms');
            console.log('DOM Content Loaded:', domContentLoadedTime + 'ms');
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', measureCoreWebVitals);
    } else {
        measureCoreWebVitals();
    }
})();