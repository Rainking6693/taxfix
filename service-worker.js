/**
 * Service Worker for TaxFix Website
 * Handles caching for improved performance
 */

const CACHE_NAME = 'taxfix-v1.3';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Assets to cache on install
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/TaxFixLogo-optimized.webp',
    '/TaxFixLogo-optimized.png',
    '/styles.min.css',
    '/js/performance-optimizer.min.js',
    '/js/google-reviews-widget.min.js',
    '/js/optimized-analytics.min.js'
];

// Assets to cache on first request
const CACHE_PATTERNS = [
    /\.(?:css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2)$/,
    /\/blog\//,
    /\/hiddenprofitfinder/
];

// Assets to never cache (always fetch fresh)
const NEVER_CACHE = [
    /\/api\//,
    /analytics/,
    /gtag/,
    /googletagmanager/,
    /tiktok/
];

// Install event - cache core assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log('Core assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache core assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                const deletePromises = cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    });
                
                return Promise.all(deletePromises);
            })
            .then(() => {
                console.log('Old caches cleaned up');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or fetch from network
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests (except for same-origin or specific allowed domains)
    if (url.origin !== location.origin && !isAllowedDomain(url.origin)) {
        return;
    }
    
    // Never cache certain resources
    if (shouldNeverCache(request.url)) {
        return;
    }
    
    // Handle different types of requests
    if (shouldCacheFirst(request.url)) {
        event.respondWith(cacheFirst(request));
    } else if (shouldNetworkFirst(request.url)) {
        event.respondWith(networkFirst(request));
    } else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

// Cache first strategy (for static assets)
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            // Check if cache is still valid
            const cacheDate = cachedResponse.headers.get('sw-cache-date');
            if (cacheDate && Date.now() - parseInt(cacheDate) < CACHE_DURATION) {
                return cachedResponse;
            }
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the response
            const cache = await caches.open(CACHE_NAME);
            const responseClone = networkResponse.clone();
            
            // Add cache date header
            const headers = new Headers(responseClone.headers);
            headers.set('sw-cache-date', Date.now().toString());
            
            const cachedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
            });
            
            await cache.put(request, cachedResponse);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        
        // Return cached version as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page or error response
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network first strategy (for dynamic content)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the response
            const cache = await caches.open(CACHE_NAME);
            const responseClone = networkResponse.clone();
            
            // Add cache date header
            const headers = new Headers(responseClone.headers);
            headers.set('sw-cache-date', Date.now().toString());
            
            const cachedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
            });
            
            await cache.put(request, cachedResponse);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('Network first strategy failed:', error);
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return error response
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stale while revalidate strategy (for balanced approach)
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Start fetch in background
    const fetchPromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.ok) {
                // Update cache in background
                const responseClone = networkResponse.clone();
                const headers = new Headers(responseClone.headers);
                headers.set('sw-cache-date', Date.now().toString());
                
                const updatedResponse = new Response(responseClone.body, {
                    status: responseClone.status,
                    statusText: responseClone.statusText,
                    headers: headers
                });
                
                cache.put(request, updatedResponse);
            }
            return networkResponse;
        })
        .catch(error => {
            console.error('Background fetch failed:', error);
            return null;
        });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Otherwise wait for network
    return fetchPromise;
}

// Helper functions
function shouldCacheFirst(url) {
    return CACHE_PATTERNS.some(pattern => pattern.test(url)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('logo') ||
           url.includes('/fonts/');
}

function shouldNetworkFirst(url) {
    return url.includes('/api/') ||
           url.includes('/form') ||
           url === location.origin ||
           url === location.origin + '/';
}

function shouldNeverCache(url) {
    return NEVER_CACHE.some(pattern => pattern.test(url));
}

function isAllowedDomain(origin) {
    const allowedDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
    ];
    return allowedDomains.includes(origin);
}

// Handle messages from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME)
            .then(() => {
                event.ports[0].postMessage({ success: true });
            })
            .catch(error => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
    }
});