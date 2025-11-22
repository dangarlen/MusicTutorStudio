import os
import re
import sys
from datetime import datetime
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

def find_js_files(root):
    js_files = set()
    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if f.endswith(".js"):
                full_path = os.path.relpath(os.path.join(dirpath, f), root)
                js_files.add(full_path.replace("\\", "/"))
    return js_files

def find_json_files(root):
    json_files = set()
    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if f.endswith(".json"):
                full_path = os.path.relpath(os.path.join(dirpath, f), root)
                json_files.add(full_path.replace("\\", "/"))
    return json_files

def find_html_script_refs(root):
    script_refs = defaultdict(set)
    part1 = r'<script\s+[^>]*src='
    part2 = r'["\']([^"\']+)["\']'
    pattern = re.compile(part1 + part2, re.IGNORECASE)

    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if f.endswith(".html"):
                html_path = os.path.relpath(os.path.join(dirpath, f), root).replace("\\", "/")
                with open(os.path.join(dirpath, f), encoding="utf-8") as file:
                    matches = pattern.findall(file.read())
                    for match in matches:
                        ref = match.strip().lstrip("./")
                        script_refs[ref].add(html_path)
    return script_refs

def find_js_imports(root):
    import_refs = set()
    part1 = r'(?:import|require)\s*'
    part2 = r'(?:.*from\s*)?[\'"]([^\'"]+\.js)[\'"]'
    pattern = re.compile(part1 + part2)

    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if f.endswith(".js"):
                with open(os.path.join(dirpath, f), encoding="utf-8") as file:
                    matches = pattern.findall(file.read())
                    for match in matches:
                        resolved = os.path.normpath(os.path.join(dirpath, match)).replace("\\", "/")
                        rel_path = os.path.relpath(resolved, root).replace("\\", "/")
                        import_refs.add(rel_path)
    return import_refs

def extract_function_context(lines):
    context_map = {}
    current_function = "global"
    part1 = r'function\s+([a-zA-Z0-9_$]+)\s*\('
    part2 = r'([a-zA-Z0-9_$]+)\s*=\s*\(?.*?\)?\s*=>'
    func_pattern = re.compile(part1 + r'|' + part2)

    for i, line in enumerate(lines):
        match = func_pattern.search(line)
        if match:
            current_function = match.group(1) or match.group(2) or "anonymous"
        context_map[i] = current_function
    return context_map

def scan_line_for_json_refs(line, line_index, patterns, context_map, referrer, json_refs):
    for pattern in patterns:
        match = pattern.search(line)
        if match:
            ref = match.group(1).strip().lstrip("./")
            context = context_map.get(line_index, "global")
            json_refs[ref].add(f"{referrer} > {context}")

def find_json_references(root):
    json_refs = defaultdict(set)

    import_pattern = re.compile("import" + r'\s+[^\n]*?[\'"]([^\'"]+\.json)[\'"]')
    require_pattern = re.compile("require" + r'\s*\(?[\'"]([^\'"]+\.json)[\'"]\)?')
    fetch_pattern = re.compile("fetch" + r'\s*\(?[\'"]([^\'"]+\.json)[\'"]\)?')
    patterns = [import_pattern, require_pattern, fetch_pattern]

    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if not f.endswith(".js") and not f.endswith(".html"):
                continue

            referrer = os.path.relpath(os.path.join(dirpath, f), root).replace("\\", "/")
            with open(os.path.join(dirpath, f), encoding="utf-8") as file:
                lines = file.readlines()

            context_map = extract_function_context(lines)

            for i, line in enumerate(lines):
                scan_line_for_json_refs(line, i, patterns, context_map, referrer, json_refs)

    return json_refs

def generate_directory_tree(root, prefix="", output=None, include_root=True):
    if output is None:
        output = []

    root_name = os.path.basename(os.path.abspath(root))
    if include_root:
        output.append(f"{prefix}{root_name}")
        prefix += "│   "

    entries = sorted(e for e in os.listdir(root) if not e.startswith("."))
    last_index = len(entries) - 1

    for i, entry in enumerate(entries):
        full_path = os.path.join(root, entry)
        connector = "└──" if i == last_index else "├──"
        line = f"{prefix}{connector} {entry}"
        output.append(line)
        if os.path.isdir(full_path):
            extension = "    " if i == last_index else "│   "
            generate_directory_tree(full_path, prefix + extension, output, include_root=False)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scan-orphans.py <folder>")
        sys.exit(1)

    root = os.path.abspath(sys.argv[1])

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    filename_stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    output_lines = [f"Scan Timestamp: {timestamp}", "\nCurrent Directory Tree:"]

    generate_directory_tree(root, output=output_lines, include_root=True)

    all_js = find_js_files(root)
    all_json = find_json_files(root)
    html_refs_map = find_html_script_refs(root)
    js_refs = find_js_imports(root)
    json_refs_map = find_json_references(root)

    html_refs = set(html_refs_map.keys())
    referenced_js = html_refs.union(js_refs)
    orphaned_js = sorted(all_js - referenced_js)

    referenced_json = set(json_refs_map.keys())
    orphaned_json = sorted(all_json - referenced_json)

    output_lines.append("\nJS files referenced by HTML:")
    for js in sorted(all_js & html_refs):
        sources = ", ".join(sorted(html_refs_map[js]))
        output_lines.append(f"  - {js} <- {sources}")

    output_lines.append("\nJS files referenced by JS imports:")
    for f in sorted(all_js & js_refs):
        output_lines.append(f"  - {f}")

    output_lines.append("\nPotentially orphaned JS files:")
    for f in orphaned_js:
        output_lines.append(f"  - {f}")

    output_lines.append("\nJSON files referenced (with function context):")
    for json_file, sources in sorted(json_refs_map.items()):
        source_list = ", ".join(sorted(sources))
        output_lines.append(f"  - {json_file} <- {source_list}")

    output_lines.append("\nPotentially orphaned JSON files:")
    for f in orphaned_json:
        output_lines.append(f"  - {f}")

    for line in output_lines:
        print(line)

    output_path = os.path.join(root, "scan.txt")

    with open(output_path, "w", encoding="utf-8") as file:
        file.write("\n".join(output_lines))
