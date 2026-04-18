#!/usr/bin/env python3
"""Remove leftover campaigns code from mall page"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\mall\index.vue'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove leftover campaigns block (between notice block closing and "// 分类列表")
start = -1
end = -1
for i, line in enumerate(lines):
    if '// \u62fc\u63a5\u6240\u6709\u6d3b\u52a8\u63cf\u8ff0' in line:
        start = i
    if start > 0 and i > start and '// \u5206\u7c7b\u5217\u8868' in line:
        # Go back to include empty lines before this
        end = i
        # Also remove trailing } and blank line before 分类列表
        while end > start and lines[end - 1].strip() in ('', '}'):
            end -= 1
        break

if start >= 0 and end >= 0:
    # Remove lines from start to end (before 分类列表)
    del lines[start:end]
    print(f"Removed leftover campaigns code from line {start+1} to {end}")
else:
    print(f"Could not find block: start={start}, end={end}")
    # Print context around line 282 for debugging
    for i in range(278, min(300, len(lines))):
        print(f"  {i+1}: {lines[i].rstrip()}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done!")
