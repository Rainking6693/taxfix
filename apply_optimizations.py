#!/usr/bin/env python3
"""
Script to apply performance and accessibility optimizations to all HTML files
"""

import os
import re
import glob

def apply_optimizations():
    # Find all HTML files
    html_files = []
    for pattern in ['*.html', 'blog/*.html', 'guides/*.html']:
        html_files.extend(glob.glob(pattern))
    
    updated_files = []
    
    for file_path in html_files:
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Skip if already optimized
            if 'js/optimized-analytics.min.js' in content:
                continue
            
            # Replace Google Tag Manager, Analytics, and TikTok scripts with optimized version
            gtm_pattern = r'<!-- Google Tag Manager -->.*?</script>'
            ga_pattern = r'<!-- Google Analytics -->.*?</script>'
            tiktok_pattern = r'<!-- TikTok Pixel -->.*?</script>'
            ga4_pattern = r'<!-- GA4 Event Tracking -->.*?</script>'
            
            # Remove blocking scripts and replace with DNS prefetch and optimized analytics
            replacement_head = '''<!-- DNS Prefetch for performance -->
    <link rel="dns-prefetch" href="//www.googletagmanager.com">
    <link rel="dns-prefetch" href="//analytics.tiktok.com">
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    
    <!-- Preconnect to critical resources -->
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>

    <!-- Optimized Analytics (loads after page load) -->
    <script defer src="js/optimized-analytics.min.js"></script>'''
            
            # Replace all tracking scripts with optimized version
            content = re.sub(gtm_pattern, replacement_head, content, flags=re.DOTALL)
            content = re.sub(ga_pattern, '', content, flags=re.DOTALL)
            content = re.sub(tiktok_pattern, '', content, flags=re.DOTALL)
            content = re.sub(ga4_pattern, '', content, flags=re.DOTALL)
            
            # Fix accessibility contrast issues
            content = content.replace('color: #9ca3af', 'color: #4b5563')
            
            # Add defer to JavaScript files
            content = re.sub(r'<script src="js/([^"]+)"', r'<script defer src="js/\1', content)
            
            # Replace with minified versions
            js_replacements = [
                ('js/performance-optimizer.js', 'js/performance-optimizer.min.js'),
                ('js/google-reviews-widget.js', 'js/google-reviews-widget.min.js'),
                ('js/optimized-analytics.js', 'js/optimized-analytics.min.js')
            ]
            
            for old_js, new_js in js_replacements:
                content = content.replace(old_js, new_js)
            
            # Remove inline gtag calls
            content = re.sub(r'gtag\([^)]+\);?\s*', '// Handled by optimized analytics ', content)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_files.append(file_path)
                print(f"Optimized: {file_path}")
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return updated_files

if __name__ == "__main__":
    print("Applying performance and accessibility optimizations...")
    updated = apply_optimizations()
    print(f"\nOptimized {len(updated)} additional files:")
    for file in updated:
        print(f"  - {file}")
    print("\nOptimizations complete!")