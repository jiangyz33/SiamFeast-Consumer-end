#!/usr/bin/env python3
"""Remaining indentation fixes for order-detail/index.vue"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\order-detail\index.vue'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def dedent(line, n=1):
    for _ in range(n):
        if line.startswith('\t'):
            line = line[1:]
    return line

changes = 0

# Fix 1: computed }, at line 270 has 3 tabs -> should be 2 tabs
for i, line in enumerate(lines):
    if 'statusText()' in line and i > 200:
        # Next lines: return, then },
        for k in range(i, i+5):
            if lines[k].strip() == '},' and lines[k].startswith('\t\t\t'):
                lines[k] = '\t\t},\n'
                print(f"Fixed computed }}, at line {k+1}: 3t -> 2t")
                changes += 1
        break

# Fix 2: getItemName has 3 tabs -> 2 tabs
for i, line in enumerate(lines):
    if 'getItemName(item)' in line and i > 200:
        for k in range(i, i+7):
            lines[k] = dedent(lines[k], 1)
        print(f"Fixed getItemName indentation: 3t -> 2t (lines {i+1}-{i+7})")
        changes += 1
        break

# Fix 3: hasSpecs has 3 tabs -> 2 tabs
for i, line in enumerate(lines):
    if 'hasSpecs(item)' in line and i > 200:
        for k in range(i, i+4):
            lines[k] = dedent(lines[k], 1)
        print(f"Fixed hasSpecs indentation: 3t -> 2t (lines {i+1}-{i+4})")
        changes += 1
        break

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"Done! {changes} indentation fixes applied.")
