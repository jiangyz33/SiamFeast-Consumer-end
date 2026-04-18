#!/usr/bin/env python3
"""Remove last stray closing brace"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\mall\index.vue'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the stray } between notice block and 分类列表
for i, line in enumerate(lines):
    if line.strip() == '}' and i > 0:
        # Check if next non-empty line is 分类列表
        for j in range(i+1, min(i+3, len(lines))):
            if '// \u5206\u7c7b\u5217\u8868' in lines[j]:
                del lines[i]
                print(f"Removed stray brace at line {i+1}")
                break
        else:
            continue
        break

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Done!")
