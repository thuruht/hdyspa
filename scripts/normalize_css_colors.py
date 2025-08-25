#!/usr/bin/env python3
import re
import sys
from pathlib import Path

def expand_3_to_6(m):
    return (m.group(1)*2 + m.group(2)*2 + m.group(3)*2).upper()

def process_chunk(chunk):
    # Replace named colors first (word boundaries)
    chunk = re.sub(r"\bwhite\b", "#FFFFFFFF", chunk, flags=re.IGNORECASE)
    chunk = re.sub(r"\bblack\b", "#000000FF", chunk, flags=re.IGNORECASE)
    chunk = re.sub(r"\btransparent\b", "#00000000", chunk, flags=re.IGNORECASE)
    # Expand 3-digit hex (#abc) to 6-digit then append FF, but avoid matching 4/5/7/8 length
    chunk = re.sub(r"#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])(?![0-9a-fA-F])",
                   lambda m: "#" + expand_3_to_6(m) + "FF",
                   chunk)
    # For 6-digit hex that are NOT followed by 2 hex chars (i.e. not already 8-digit), append FF
    chunk = re.sub(r"#([0-9a-fA-F]{6})(?![0-9a-fA-F])",
                   lambda m: "#" + m.group(1).upper() + "FF",
                   chunk)
    return chunk


def normalize_file(path: Path):
    txt = path.read_text(encoding='utf-8')
    # Split into comment and non-comment parts so comments are left untouched
    parts = re.split(r'(/\*.*?\*/)', txt, flags=re.S)
    out_parts = []
    for p in parts:
        if p.startswith('/*') and p.endswith('*/'):
            out_parts.append(p)
        else:
            out_parts.append(process_chunk(p))
    new_txt = ''.join(out_parts)
    if new_txt != txt:
        path.write_text(new_txt, encoding='utf-8')
        return True
    return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: normalize_css_colors.py <path-to-css>')
        sys.exit(2)
    p = Path(sys.argv[1])
    if not p.exists():
        print('File not found:', p)
        sys.exit(2)
    changed = normalize_file(p)
    print('Updated' if changed else 'No changes')
