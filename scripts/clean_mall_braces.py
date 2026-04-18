#!/usr/bin/env python3
"""Remove stray closing braces between notice block and categories"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\mall\index.vue'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find: after notice block closing "}" (line 281 area), there are stray braces before "// 分类列表"
start = -1
end = -1
for i, line in enumerate(lines):
    if line.strip() == '}' and i > 0 and lines[i-1].strip() == '}':
        # Check if this is between notice block and 分类列表
        for j in range(i+1, min(i+5, len(lines))):
            if '// \u5206\u7c7b\u5217\u8868' in lines[j]:
                start = i
                end = j
                break
        if start >= 0:
            break

if start >= 0:
    del lines[start:end]
    print(f"Removed stray braces at line {start+1}")
else:
    print("No stray braces found")

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Done!")
