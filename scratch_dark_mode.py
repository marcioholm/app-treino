import os

def walk_dir(d):
    results = []
    for root, dirs, files in os.walk(d):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.next' in dirs:
            dirs.remove('.next')
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                results.append(os.path.join(root, f))
    return results

files = walk_dir('./src')

replacements = [
    # Backgrounds
    ("bg-white", "bg-[#111111]"),
    ("bg-gray-50", "bg-black"),
    ("bg-gray-100", "bg-[#1a1a1a]"),
    ("bg-gray-200", "bg-[#333333]"),
    ("bg-gray-300", "bg-[#444444]"),
    
    # Texts
    ("text-gray-900", "text-white"),
    ("text-gray-800", "text-gray-100"),
    ("text-gray-700", "text-gray-300"),
    ("text-gray-600", "text-gray-400"),
    ("text-gray-500", "text-gray-400"),
    
    # Borders
    ("border-gray-100", "border-[#333333]"),
    ("border-gray-200", "border-[#333333]"),
    ("border-gray-300", "border-[#444444]"),
    
    # Accents (Pink)
    ("focus:ring-blue-500", "focus:ring-[#D4537E]"),
    ("text-blue-600", "text-[#D4537E]"),
    ("text-blue-500", "text-[#ED93B1]"),
    ("bg-blue-600", "bg-[#D4537E]"),
    ("bg-blue-50", "bg-[#D4537E]/10"),
    ("bg-blue-100", "bg-[#D4537E]/20"),
    ("bg-blue-700", "bg-[#993556]"),
    ("hover:bg-blue-700", "hover:bg-[#993556]"),
    ("hover:bg-blue-50", "hover:bg-[#1a1a1a]"),
    ("accent-blue-600", "accent-[#D4537E]"),
]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    orig = content
    for old, new in replacements:
        content = content.replace(old, new)
        
    if content != orig:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated {f}")
