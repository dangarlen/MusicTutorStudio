import os
from datetime import datetime

def get_timestamp():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def sanitize_filename(substring):
    return ''.join(c if c.isalnum() or c in "-_" else "_" for c in substring)

def scan_for_substring(root, substring):
    results = []
    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            full_path = os.path.join(dirpath, f)
            try:
                with open(full_path, encoding="utf-8") as file:
                    for i, line in enumerate(file, start=1):
                        if substring in line:
                            rel_path = os.path.relpath(full_path, root).replace("\\", "/")
                            results.append(f"{rel_path} [Ln {i}]: {line.strip()}")
            except Exception:
                continue
    return results

if __name__ == "__main__":
    substring = input("Enter substring to search for: ").strip()
    root = os.getcwd()
    timestamp = get_timestamp()
    safe_name = sanitize_filename(substring)
    output_file = f"found[{safe_name}].txt"

    header = f"Scan Timestamp: {timestamp}\nSearch Substring: \"{substring}\"\nRoot Directory: {root}\n\n"
    matches = scan_for_substring(root, substring)
    body = "\n".join(matches) if matches else "No matches found."

    with open(output_file, "w", encoding="utf-8") as out:
        out.write(header + body)

    print(f"Scan complete. Results saved to {output_file}")
