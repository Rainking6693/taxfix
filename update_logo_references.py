#!/usr/bin/env python3
"""
Script to update all logo references to use optimized responsive images
"""

import os
import re
import glob

def update_logo_references():
    # Pattern to match img tags with the old logo
    old_logo_patterns = [
        r'<img\s+src="TaxFixLogoTealFinalNowebsite\.png"([^>]*?)class="logo"([^>]*?)>',
        r'<img\s+src="\.\./TaxFixLogoTealFinalNowebsite\.png"([^>]*?)class="logo"([^>]*?)>',
        r'<img\s+src="/TaxFixLogoTealFinalNowebsite\.png"([^>]*?)class="logo"([^>]*?)>'
    ]
    
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
            
            # Update each pattern
            for pattern in old_logo_patterns:
                def replace_match(match):
                    attributes1 = match.group(1) if match.group(1) else ""
                    attributes2 = match.group(2) if match.group(2) else ""
                    
                    # Determine the correct path prefix
                    if file_path.startswith('blog/') or file_path.startswith('guides/'):
                        webp_src = "../TaxFixLogo-optimized.webp"
                        png_src = "../TaxFixLogo-optimized.png"
                    else:
                        webp_src = "TaxFixLogo-optimized.webp"
                        png_src = "TaxFixLogo-optimized.png"
                    
                    # Extract alt text if present
                    alt_match = re.search(r'alt="([^"]*)"', attributes1 + attributes2)
                    alt_text = alt_match.group(1) if alt_match else "TaxFix Logo"
                    
                    return f'''<picture>
                        <source srcset="{webp_src}" type="image/webp">
                        <img src="{png_src}" alt="{alt_text}" class="logo" width="170" height="80" loading="eager" fetchpriority="high">
                    </picture>'''
                
                content = re.sub(pattern, replace_match, content)
            
            # Also update any remaining direct references
            content = re.sub(r'TaxFixLogoTealFinalNowebsite\.png', 'TaxFixLogo-optimized.png', content)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_files.append(file_path)
                print(f"Updated: {file_path}")
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return updated_files

if __name__ == "__main__":
    print("Updating logo references...")
    updated = update_logo_references()
    print(f"\nUpdated {len(updated)} files:")
    for file in updated:
        print(f"  - {file}")
    print("\nLogo optimization complete!")