#!/usr/bin/env python3
"""Add temporary debug logging to loadMallData for category diagnosis"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\mall\index.vue'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find "// 分类列表" and add debug before it
for i, line in enumerate(lines):
    if '// \u5206\u7c7b\u5217\u8868' in line and i > 250:
        # Insert debug lines before this
        indent = '\t\t\t\t'
        debug = [
            f'{indent}console.log("[MALL] catRes:", JSON.stringify({{status: catRes.status, code: catRes.value?.code, dataLen: catRes.value?.data?.length, reason: catRes.reason?.message}}))\n',
        ]
        for j, dl in enumerate(debug):
            lines.insert(i + j, dl)
        print(f"Added debug at line {i+1}")
        break

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Done - check browser console for [MALL] catRes log")
