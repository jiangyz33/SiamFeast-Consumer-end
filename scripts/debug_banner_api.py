#!/usr/bin/env python3
"""Add debug logging to banner.js getMallBanners"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\api\services\banner.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add debug logging to getMallBanners
old = """export function getMallBanners() {
\tif (USE_MOCK) {
\t\treturn mockGetMallBanners()
\t}
\treturn get('/banners', { position: 'MALL' })"""

new = """export function getMallBanners() {
\tconsole.log('[BANNER API] getMallBanners called, USE_MOCK:', USE_MOCK)
\tif (USE_MOCK) {
\t\treturn mockGetMallBanners()
\t}
\tconsole.log('[BANNER API] calling GET /banners with position=MALL')
\treturn get('/banners', { position: 'MALL' })"""

if old in content:
    content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added debug logging to getMallBanners")
else:
    print("Could not find target code - may already be modified")
    # Let's see what's there
    for line in content.split('\n'):
        if 'getMallBanners' in line or 'MALL' in line or 'USE_MOCK' in line:
            print(f"  Found: {line}")

print("Done")
