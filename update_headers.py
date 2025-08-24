import os
import re

def update_header_styles(file_path):
    """Update header styles in HTML files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Update header-main background
        content = re.sub(
            r'\.header-main\s*\{[^}]*background:\s*linear-gradient\([^}]*\}',
            '.header-main {\n            background: #f8f9fa;\n            color: #333;\n            padding: 1.25rem 0;\n            border-bottom: 1px solid #e5e7eb;\n        }',
            content,
            flags=re.DOTALL
        )
        
        # Update nav-link styles (basic version)
        content = re.sub(
            r'(\.nav-link\s*\{[^}]*color:\s*)white([^}]*\})',
            r'\1#333\2',
            content,
            flags=re.DOTALL
        )
        
        # Update nav-link hover color
        content = re.sub(
            r'(\.nav-link:hover\s*\{[^}]*color:\s*)#e0f2fe([^}]*\})',
            r'\1#5DADE2\2',
            content,
            flags=re.DOTALL
        )
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        return True
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

# Get all HTML files
html_files = [f for f in os.listdir('.') if f.endswith('.html') and f not in ['index.html', 'resources.html']]

updated_files = []
for html_file in html_files:
    if update_header_styles(html_file):
        updated_files.append(html_file)
        print(f"Updated: {html_file}")

print(f"\nUpdated {len(updated_files)} files total")
print("Files updated:", updated_files[:10])  # Show first 10
if len(updated_files) > 10:
    print("... and more")