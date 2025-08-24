#!/usr/bin/env python3
"""
Script to replace inline CSS with external minified CSS file
"""

import os
import re
import glob

def externalize_css():
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
            
            # Find and replace inline <style> blocks with external CSS link
            style_pattern = r'<style>.*?</style>'
            
            # Determine the correct path prefix for CSS
            if file_path.startswith('blog/') or file_path.startswith('guides/'):
                css_path = "../styles.min.css"
            else:
                css_path = "styles.min.css"
            
            # Replace inline styles with external CSS link
            css_link = f'<link rel="stylesheet" href="{css_path}">'
            content = re.sub(style_pattern, css_link, content, flags=re.DOTALL)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_files.append(file_path)
                print(f"Externalized CSS: {file_path}")
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return updated_files

if __name__ == "__main__":
    print("Externalizing CSS...")
    updated = externalize_css()
    print(f"\nUpdated {len(updated)} files with external CSS:")
    for file in updated:
        print(f"  - {file}")
    print("\nCSS externalization complete!")