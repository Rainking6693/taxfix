#!/usr/bin/env python3
"""
Final Core Web Vitals optimization script
"""

import os
import re

def optimize_core_web_vitals():
    print("Applying Core Web Vitals optimizations...")
    
    # Critical CSS for above-the-fold content
    critical_css = """
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;color:#374151;}
    .container{max-width:1200px;margin:0 auto;padding:0 1rem;}
    .header-main{background:#f8f9fa;color:#333;padding:1.25rem 0;border-bottom:1px solid #e5e7eb;}
    .header-content{display:flex;justify-content:space-between;align-items:center;}
    .logo{height:80px;width:auto;max-width:280px;}
    .hero-section{background:linear-gradient(180deg,#e0f8ff 0%,white 100%);padding:4rem 0;text-align:center;}
    .hero-title{font-size:2.5rem;font-weight:700;color:#1f2937;margin-bottom:1rem;}
    .hero-description{font-size:1.25rem;color:#6b7280;margin-bottom:2rem;}
    .btn-primary-gradient{background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);color:#1f2937;padding:1rem 2rem;border-radius:0.75rem;font-weight:700;text-decoration:none;display:inline-block;}
    @media(min-width:768px){.hero-title{font-size:3.5rem;}.logo{height:100px;}}
    """
    
    # Font optimization
    font_optimization = """
    <!-- Font Display Optimization -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"></noscript>"""
    
    # Update main pages with critical CSS and font optimization
    main_pages = ['index.html', 'pricing.html', 'hiddenprofitfinder.html', 'checklist.html']
    
    for page in main_pages:
        if not os.path.exists(page):
            continue
            
        try:
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Add critical CSS inline in head
            head_insertion_point = '<link rel="stylesheet" href="styles.min.css">'
            critical_css_block = f'<style>{critical_css}</style>\\n    {head_insertion_point}'
            content = content.replace(head_insertion_point, critical_css_block)
            
            # Add font optimization
            dns_prefetch_point = '<link rel="dns-prefetch" href="//fonts.gstatic.com">'
            content = content.replace(dns_prefetch_point, dns_prefetch_point + '\\n    ' + font_optimization)
            
            # Add lazy loading to images (except hero images)
            content = re.sub(
                r'<img([^>]*)src="(?!TaxFixLogo)([^"]+)"([^>]*)>',
                r'<img\\1src="\\2"\\3 loading="lazy">',
                content
            )
            
            # Optimize largest contentful paint
            # Set fetchpriority="high" on hero images
            content = re.sub(
                r'(<img[^>]*class="[^"]*hero[^"]*"[^>]*)>',
                r'\\1 fetchpriority="high">',
                content
            )
            
            with open(page, 'w', encoding='utf-8') as f:
                f.write(content)
                
            print(f"Core Web Vitals optimized: {page}")
            
        except Exception as e:
            print(f"Error optimizing {page}: {e}")
    
    # Create performance monitoring script
    performance_monitor = """
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
})();"""
    
    with open('js/performance-monitor.js', 'w', encoding='utf-8') as f:
        f.write(performance_monitor)
    
    print("\\nCore Web Vitals optimizations applied!")
    print("- Critical CSS inlined for faster FCP")
    print("- Font loading optimized with preload + display=swap")
    print("- Lazy loading added to non-critical images")
    print("- Performance monitoring script created")
    
    return True

if __name__ == "__main__":
    optimize_core_web_vitals()