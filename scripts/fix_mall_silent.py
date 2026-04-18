#!/usr/bin/env python3
"""
Fix mall page:
1. Remove debug log
2. Add silent option to notice and stores calls to prevent error toast
3. Ensure categories use fallback correctly
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\mall\index.vue'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove debug console.log
content = content.replace(
    '\t\t\t\tconsole.log("[MALL] catRes:", JSON.stringify({status: catRes.status, code: catRes.value?.code, dataLen: catRes.value?.data?.length, reason: catRes.reason?.message}))\n',
    ''
)

# 2. Remove any other debug lines
lines = content.split('\n')
cleaned = [l for l in lines if '[MALL DEBUG]' not in l and '[BANNER API]' not in l]
content = '\n'.join(cleaned)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed debug logs")
print("Done!")
