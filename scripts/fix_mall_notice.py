#!/usr/bin/env python3
"""
Refactor mall page:
1. Replace campaigns-based promo bar with global notice
2. Remove debug logging
3. Remove discountProduct/groupProduct dependency on campaigns
4. Add getGlobalNotice API call
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\mall\index.vue'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_line(text, start=0):
    for i in range(start, len(lines)):
        if text in lines[i]:
            return i
    return -1

def find_block(start_text, end_text, start_from=0):
    s = find_line(start_text, start_from)
    if s < 0:
        return -1, -1
    e = find_line(end_text, s + 1)
    return s, e

changes = []

# 1. Replace import: getActiveCampaigns -> getGlobalNotice
idx = find_line('getActiveCampaigns')
if idx >= 0:
    lines[idx] = lines[idx].replace(
        "import { getActiveCampaigns } from '@/api/services/campaign.js'",
        "import { getGlobalNotice } from '@/api/services/notice.js'"
    )
    changes.append(f"Line {idx+1}: Replaced getActiveCampaigns import with getGlobalNotice")

# 2. Replace data field name: activePromoText -> noticeText
idx = find_line('activePromoText')
while idx >= 0:
    lines[idx] = lines[idx].replace('activePromoText', 'noticeText')
    next_idx = find_line('activePromoText', idx + 1)
    idx = next_idx

# Also in template
for i, line in enumerate(lines):
    if 'activePromoText' in line:
        lines[i] = line.replace('activePromoText', 'noticeText')

changes.append("Renamed activePromoText -> noticeText throughout")

# 3. In loadMallData, replace the 4 API calls with 5 (add notice, remove campaign)
idx_api_start = find_line('const [bannerRes, campaignRes, catRes, storesRes]')
if idx_api_start >= 0:
    lines[idx_api_start] = '\t\t\t\tconst [bannerRes, noticeRes, catRes, storesRes] = await Promise.allSettled([\n'
    # Next lines: the API calls
    idx_api_end = find_line('])', idx_api_start)
    if idx_api_end >= 0:
        # Replace the block between [ and ]
        new_api_block = [
            '\t\t\t\t\tgetMallBanners(),\n',
            '\t\t\t\t\tgetGlobalNotice(),\n',
            '\t\t\t\t\tgetConsumerCategories(storeId),\n',
            '\t\t\t\t\tgetStores()\n',
        ]
        lines[idx_api_start + 1: idx_api_end] = new_api_block
        changes.append(f"Lines {idx_api_start+2}-{idx_api_end}: Replaced API calls block")

# 4. Remove debug logging
debug_start = find_line('[MALL DEBUG]')
while debug_start >= 0:
    # Remove 3 debug lines
    if debug_start >= 0 and 'bannerRes status' in lines[debug_start]:
        # Find the closing brace of the if block
        debug_end = debug_start
        brace_count = 0
        for k in range(debug_start, min(debug_start + 10, len(lines))):
            if '{' in lines[k]:
                brace_count += lines[k].count('{')
            if '}' in lines[k]:
                brace_count -= lines[k].count('}')
            debug_end = k
            if brace_count <= 0:
                break
        del lines[debug_start:debug_end + 1]
        changes.append(f"Removed debug logging at line {debug_start+1}")
    debug_start = find_line('[MALL DEBUG]')

# 5. Replace campaigns processing with notice processing
# Find "活动信息" comment block
idx_campaign_start = find_line('// 活动信息')
if idx_campaign_start < 0:
    idx_campaign_start = find_line('campaignRes.status')

if idx_campaign_start >= 0:
    # Find end of campaigns block (before "// 分类列表")
    idx_campaign_end = find_line('// 分类列表', idx_campaign_start)
    if idx_campaign_end >= 0:
        new_notice_block = [
            '\t\t\t\t// 全局公告通知\n',
            '\t\t\t\tif (noticeRes.status === "fulfilled" && noticeRes.value.code === 0 && noticeRes.value.data) {\n',
            '\t\t\t\t\tconst notice = noticeRes.value.data\n',
            '\t\t\t\t\tif (notice && notice.content) {\n',
            '\t\t\t\t\t\tthis.noticeText = notice.content\n',
            '\t\t\t\t\t}\n',
            '\t\t\t\t}\n',
            '\n',
        ]
        lines[idx_campaign_start: idx_campaign_end] = new_notice_block
        changes.append(f"Lines {idx_campaign_start+1}-{idx_campaign_end}: Replaced campaigns block with notice block")

# 6. Remove discountProduct and groupProduct data fields (no longer from campaigns)
# Actually keep them as null - they can be populated from other sources later

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

for c in changes:
    print(c)

print("\nDone! Mall page updated to use global notice.")
