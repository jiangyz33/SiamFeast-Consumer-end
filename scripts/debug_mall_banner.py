#!/usr/bin/env python3
"""Add debug logging to mall banner loading"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\mall\index.vue'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the banner result handling
for i, line in enumerate(lines):
    if '// 轮播图' in line and i < 300:
        # Check next line is the if statement
        if i + 1 < len(lines) and 'bannerRes.status' in lines[i + 1]:
            # Add debug log before the if
            indent = '\t\t\t\t\t'
            debug_lines = [
                f'{indent}console.log("[MALL DEBUG] bannerRes status:", bannerRes.status)\n',
                f'{indent}if (bannerRes.status === "fulfilled") {{\n',
                f'{indent}\tconsole.log("[MALL DEBUG] bannerRes.value:", JSON.stringify(bannerRes.value))\n',
                f'{indent}}}\n',
            ]
            for j, dl in enumerate(debug_lines):
                lines.insert(i + 1 + j, dl)
            print(f"Added debug logging at line {i+2}")
            break

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done! Check browser console for [MALL DEBUG] logs.")
