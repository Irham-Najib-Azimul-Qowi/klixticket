import os
import shutil
import re

base_dir = r"c:\Users\ACER\MyTimeinUnivecity\karier\ticket\backend"
internal_dir = os.path.join(base_dir, "internal")

mapping = {
    "handlers": "controllers",
    "repository": "repositories",
    "services": "services",
    "middlewares": "middlewares",
    "models": "models",
    "dto": "dto",
}

# 1. Ensure root folders exist
for _, target in mapping.items():
    p = os.path.join(base_dir, target)
    if not os.path.exists(p):
        os.makedirs(p)
    elif os.path.isfile(p):
        os.remove(p)
        os.makedirs(p)

# 2. Move files from internal
if os.path.exists(internal_dir):
    for root, dirs, files in os.walk(internal_dir):
        parent_name = os.path.basename(root)
        if parent_name in mapping:
            target_folder = mapping[parent_name]
            dst_dir = os.path.join(base_dir, target_folder)
            for file in files:
                if file.endswith(".go"):
                    src = os.path.join(root, file)
                    dst = os.path.join(dst_dir, file)
                    print(f"Moving {src} -> {dst}")
                    shutil.move(src, dst)

# 3. GLOBAL REFACTOR (In the whole backend)
folders = ["controllers", "repositories", "services", "middlewares", "models", "config", "routes", "pkg", "dto"]
files_to_check = [os.path.join(base_dir, "main.go")]

for folder in folders:
    folder_path = os.path.join(base_dir, folder)
    if os.path.exists(folder_path):
        for root, _, files in os.walk(folder_path):
            for file in files:
                if file.endswith(".go"):
                    files_to_check.append(os.path.join(root, file))

replacements = [
    (r"package handlers", "package controllers"),
    (r"package repository", "package repositories"),
    (r"package middleware", "package middlewares"),
    (r"package dto", "package dto"),
    (r"mastutik-api/internal/handlers", "mastutik-api/controllers"),
    (r"mastutik-api/internal/models", "mastutik-api/models"),
    (r"mastutik-api/internal/repository", "mastutik-api/repositories"),
    (r"mastutik-api/internal/services", "mastutik-api/services"),
    (r"mastutik-api/internal/middlewares", "mastutik-api/middlewares"),
    (r"mastutik-api/internal/dto", "mastutik-api/dto"),
    # Usages:
    (r"\bhandlers\.", "controllers."),
    (r"\brepository\.", "repositories."),
    (r"\bmiddleware\.", "middlewares."),
    (r"\bdto\.", "dto."),
]

for file_path in files_to_check:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = re.sub(old, new, new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")

print("Refactor complete.")
