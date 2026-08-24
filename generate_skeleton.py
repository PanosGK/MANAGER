import os, re

# Folders to completely skip
IGNORE_DIRS = {
    'node_modules', '.git', 'dist', 'build', '__pycache__', 
    '.venv', 'venv', 'vendor', 'coverage', '.idea', '.vscode'
}

# File extensions that contain actual code logic
CODE_EXTS = {'.js', '.ts', '.jsx', '.tsx', '.py', '.php', '.java', '.c', '.cpp', '.cs', '.go', '.rs'}

# Strict patterns to only catch high-level classes and functions
CLASS_PAT = re.compile(r'^\s*(?:export\s+)?(?:class|interface)\s+([a-zA-Z0-9_]+)')
FUNC_PAT = re.compile(r'^\s*(?:export\s+)?(?:async\s+)?(?:function|def)\s+([a-zA-Z0-9_]+)')

def create_tight_skeleton(root_dir):
    skeleton = []
    
    for root, dirs, files in os.walk(root_dir):
        # Filter directories in-place to stop scanning build/dep folders
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]
        
        for file in files:
            # Skip hidden files and map files
            if file.startswith('.') or file.endswith('.map') or file == 'SKELETON.md':
                continue

            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, root_dir)
            ext = os.path.splitext(file)[1].lower()

            skeleton.append(f"\n📁 {rel_path}")

            # If it's not a primary code file (e.g., HTML, JSON, assets), just state the file name
            if ext not in CODE_EXTS:
                continue

            # Parse code files with a strict limit of max 15 items per file
            items_found = 0
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        if items_found >= 15:
                            skeleton.append("   ... (more functions truncated)")
                            break

                        class_match = CLASS_PAT.search(line)
                        if class_match:
                            skeleton.append(f"   ├─ class {class_match.group(1)}")
                            items_found += 1
                            continue

                        func_match = FUNC_PAT.search(line)
                        if func_match:
                            skeleton.append(f"   ├─ fn {func_match.group(1)}")
                            items_found += 1
            except Exception:
                pass

    output_content = "\n".join(skeleton)
    
    with open("SKELETON.md", "w", encoding="utf-8") as out:
        out.write(output_content)

    print(f"Success! Generated SKELETON.md ({len(skeleton)} total lines)")

if __name__ == "__main__":
    create_tight_skeleton(".")