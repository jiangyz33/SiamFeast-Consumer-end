#!/usr/bin/env python3
"""Fix remaining order-detail changes using line-by-line approach"""
import re

filepath = r'D:\project\SiamFeast\pages\order-detail\index.vue'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

def find_line(text, start=0):
    for i in range(start, len(lines)):
        if text in lines[i]:
            return i
    return -1

# 1. Find "商品列表" line
idx = find_line('商品列表')
print(f"Found '商品列表' at line {idx+1}: {repr(lines[idx][:60])}")

# Check the preceding line - should be divider
idx_divider = idx - 1
print(f"Line before: {repr(lines[idx_divider][:60])}")

# We need to insert order_type section before the products section
# Replace from the divider before products to end of products section
# Find the divider before products
insert_point = idx_divider  # line with <!-- 分隔线 -->

# Build the new content to insert
order_type_section = [
    '\t\t\t\t<!-- 订单类型 -->',
    '\t\t\t\t<view class="order-type-section" v-if="orderData.order_type">',
    '\t\t\t\t\t<view class="section-card">',
    '\t\t\t\t\t\t<view class="order-type-row">',
    '\t\t\t\t\t\t\t<text class="order-type-label">订单类型</text>',
    '\t\t\t\t\t\t\t<text class="order-type-value">{{ formatOrderType(orderData.order_type) }}</text>',
    '\t\t\t\t\t\t</view>',
    '\t\t\t\t\t</view>',
    '\t\t\t\t</view>',
    '',
    '\t\t\t\t<!-- 分隔线 -->',
    '\t\t\t\t<view class="divider"></view>',
    '',
]

# Find end of products section (the closing </view> after products)
idx_product_end = find_line('</view>', idx)
# Actually we need to find the right closing - count opening/closing
depth = 0
for i in range(idx, len(lines)):
    depth += lines[i].count('<view') - lines[i].count('</view>')
    if depth <= 0 and '</view>' in lines[i]:
        idx_product_end = i
        break
print(f"Products section ends at line {idx_product_end+1}")

# Now modify the product items
# Replace item.item_name with getItemName(item)
# Replace specs_config check with hasSpecs(item)
for i in range(idx, idx_product_end + 1):
    if '{{ item.item_name }}' in lines[i]:
        lines[i] = lines[i].replace('{{ item.item_name }}', '{{ getItemName(item) }}')
        print(f"  Replaced item_name at line {i+1}")
    if 'item.specs_config && Object.keys(item.specs_config).length > 0' in lines[i]:
        lines[i] = lines[i].replace('item.specs_config && Object.keys(item.specs_config).length > 0', 'hasSpecs(item)')
        print(f"  Replaced specs_config check at line {i+1}")
    if 'formatSpecs(item.specs_config)' in lines[i]:
        lines[i] = lines[i].replace('formatSpecs(item.specs_config)', 'formatSpecs(item.specs || item.specs_config)')
        print(f"  Replaced formatSpecs call at line {i+1}")

# Find the product-footer and add subtotal
idx_footer = find_line('product-footer', idx)
print(f"Product footer at line {idx_footer+1}")
# Find the </view> closing product-footer
idx_footer_close = idx_footer + 1
for i in range(idx_footer, idx_footer + 5):
    if '</view>' in lines[i] and 'product-footer' not in lines[i]:
        idx_footer_close = i
        break
print(f"Footer close at line {idx_footer_close+1}: {repr(lines[idx_footer_close][:60])}")

# Add subtotal line before the closing
subtotal_line = '\t\t\t\t\t\t\t\t\t\t<text class="product-subtotal" v-if="item.subtotal">\u0e3f{{ item.subtotal }}</text>'
lines.insert(idx_footer_close, subtotal_line)

# Now insert order_type section before products
# Find the divider line before products
divider_idx = find_line('分隔线', idx - 5)
if divider_idx >= 0:
    print(f"Found divider before products at line {divider_idx+1}")
    # Replace divider + empty line + products comment with order_type + divider + products
    insert_start = divider_idx
    # Insert our order_type section before this divider
    for j, line in enumerate(order_type_section):
        lines.insert(insert_start + j, line)
    print(f"  Inserted order_type section at line {insert_start+1}")
else:
    print("No divider before products, inserting at products line")
    for j, line in enumerate(order_type_section):
        lines.insert(idx_divider + j, line)

# 2. Add coins_used display to fee section
idx_coin = find_line('coin_deduct_amount > 0')
print(f"\nCoin deduct row at line {idx_coin+1}")
if idx_coin >= 0:
    # Find the next closing </view> for this row
    for i in range(idx_coin + 1, idx_coin + 4):
        if '</view>' in lines[i]:
            idx_coin_close = i
            break
    print(f"Coin deduct close at line {idx_coin_close+1}")

    # Replace the coin_deduct row content
    old_coin_line = lines[idx_coin + 1]  # The <text> with coin_deduct_amount
    new_coin_line = '\t\t\t\t\t\t\t\t<text class="info-value discount">-\u0e3f{{ orderData.coin_deduct_amount }}<text v-if="orderData.coins_used"> ({{ orderData.coins_used }}\u4e2a\u91d1\u5e01)</text></text>'
    lines[idx_coin + 1] = new_coin_line
    print("  Updated coin deduct line with coins_used")

    # Add member_settlement rows after
    member_lines = [
        '\t\t\t\t\t\t\t<view class="info-row" v-if="memberSettlement && memberSettlement.coins_earned > 0">',
        '\t\t\t\t\t\t\t\t<text class="info-label">\u83b7\u5f97\u91d1\u5e01</text>',
        '\t\t\t\t\t\t\t\t<text class="info-value">+{{ memberSettlement.coins_earned }}\u4e2a</text>',
        '\t\t\t\t\t\t\t</view>',
        '\t\t\t\t\t\t\t<view class="info-row" v-if="memberSettlement && memberSettlement.points_earned > 0">',
        '\t\t\t\t\t\t\t\t<text class="info-label">\u83b7\u5f97\u79ef\u5206</text>',
        '\t\t\t\t\t\t\t\t<text class="info-value">+{{ memberSettlement.points_earned }}\u5206</text>',
        '\t\t\t\t\t\t\t</view>',
    ]
    for j, ml in enumerate(member_lines):
        lines.insert(idx_coin_close + 1 + j, ml)
    print("  Added member_settlement rows")

# 3. Add memberSettlement computed
idx_status_text = find_line('statusText()')
print(f"\nstatusText computed at line {idx_status_text+1}")
if idx_status_text >= 0:
    # Find the closing of this computed property
    for i in range(idx_status_text + 1, idx_status_text + 5):
        if lines[i].strip() == '}' or (lines[i].strip().startswith('}') and lines[i].strip().endswith(',')):
            idx_st_close = i
            break
    print(f"statusText close at line {idx_st_close+1}: {repr(lines[idx_st_close][:40])}")

    member_computed = [
        ',',
        '\t\t\tmemberSettlement() {',
        '\t\t\t\tconst extra = this.orderData.extra_data',
        '\t\t\t\tif (extra && extra.member_settlement) {',
        '\t\t\t\t\treturn extra.member_settlement',
        '\t\t\t\t}',
        '\t\t\t\treturn null',
        '\t\t\t}',
    ]
    # Replace the closing of statusText with statusText + memberSettlement
    lines[idx_st_close] = ''  # Remove the old closing
    for j, ml in enumerate(member_computed):
        lines.insert(idx_st_close + 1 + j, ml)
    print("  Added memberSettlement computed")

# 4. Add new methods before goBack
idx_goback = find_line('goBack()')
print(f"\ngoBack at line {idx_goback+1}")
if idx_goback >= 0:
    new_methods = [
        '\t\t\tgetItemName(item) {',
        '\t\t\t\tconst lang = i18n.getLanguage()',
        '\t\t\t\tconst name = lang === \'en\' ? (item.item_name_en || item.item_name)',
        '\t\t\t\t\t: lang === \'th\' ? (item.item_name_th || item.item_name)',
        '\t\t\t\t\t: item.item_name',
        '\t\t\t\treturn name || \'\'',
        '\t\t\t},',
        '',
        '\t\t\thasSpecs(item) {',
        '\t\t\t\tconst specs = item.specs || item.specs_config',
        '\t\t\t\treturn specs && Object.keys(specs).length > 0',
        '\t\t\t},',
        '',
        '\t\t\tformatOrderType(type) {',
        '\t\t\t\treturn ORDER_TYPE_MAP[type] || type || \'\'',
        '\t\t\t},',
        '',
    ]
    for j, ml in enumerate(new_methods):
        lines.insert(idx_goback + j, ml)
    print("  Added getItemName, hasSpecs, formatOrderType methods")

# Write back
content = '\n'.join(lines)
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! All changes applied.")
