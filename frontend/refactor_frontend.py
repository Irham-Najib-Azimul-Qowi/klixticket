import os
import re

base_dir = r"c:\Users\ACER\MyTimeinUnivecity\karier\ticket\frontend\src"
files_to_check = []

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith((".tsx", ".ts", ".css")):
            files_to_check.append(os.path.join(root, file))

replacements = [
    (r"@/lib/api", "@/services/api"),
    (r"from '../lib/api'", "from '../services/api'"),
    (r"from '../../lib/api'", "from '../../services/api'"),
]

for file_path in files_to_check:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")
