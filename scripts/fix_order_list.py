#!/usr/bin/env python3
"""Fix order list page - show order_type, coins_used, use detail_items for reorder"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\order\index.vue'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_line(text, start=0):
    for i in range(start, len(lines)):
        if text in lines[i]:
            return i
    return -1

# Fix 1: Add ORDER_TYPE_MAP constant after STATUS_MAP
idx_status_map_end = -1
for i, line in enumerate(lines):
    if 'CANCELLED' in line and 'text' in line and 'color' in line:
        idx_status_map_end = i
        break

if idx_status_map_end >= 0:
    # Find the closing }
    for i in range(idx_status_map_end, idx_status_map_end + 3):
        if lines[i].strip() == '}':
            idx_status_map_close = i
            break

    order_type_map = [
        "\n",
        "const ORDER_TYPE_MAP = {\n",
        "\t'SINEFOOD_NOODLE': '\u6cf0\u5f0f\u6d77\u9c9c\u9762',\n",
        "\t'HOTPOT': '\u706b\u9505',\n",
        "\t'MALATANG': '\u9ebb\u8fa3\u70eb',\n",
        "\t'BBQ': '\u70e7\u70e4',\n",
        "\t'SEAFOOD_NOODLE': '\u6cf0\u5f0f\u6d77\u9c9c\u9762',\n",
        "\t'DINE_IN': '\u5802\u98df',\n",
        "\t'TAKEAWAY': '\u5916\u5356',\n",
        "\t'DELIVERY': '\u914d\u9001'\n",
        "}\n",
    ]
    for j, l in enumerate(order_type_map):
        lines.insert(idx_status_map_close + 1 + j, l)
    print(f"Added ORDER_TYPE_MAP after line {idx_status_map_close+1}")

# Fix 2: Update order card header to show order_type + store_name
idx_order_type_text = find_line('order.order_type_text')
if idx_order_type_text >= 0:
    # Replace with proper display: show order_type as tag, store_name as title
    lines[idx_order_type_text] = '\t\t\t\t\t\t\t<text class="shop-name">{{ order.store_name || order.order_type_text }}</text>\n'
    print(f"Fixed order header display at line {idx_order_type_text+1}")

# Fix 3: Add order_type tag after shop name
idx_shop_info_close = find_line('order.order_type_text')  # already changed
if idx_shop_info_close >= 0:
    # Insert order_type tag after this line if not already present
    next_line = lines[idx_shop_info_close + 1]
    if 'order_type_tag' not in next_line:
        tag_line = '\t\t\t\t\t\t\t<text class="order-type-tag" v-if="order.order_type && order.order_type !== \'DINE_IN\'">{{ formatOrderType(order.order_type) }}</text>\n'
        lines.insert(idx_shop_info_close + 1, tag_line)
        print(f"Added order_type tag at line {idx_shop_info_close+2}")

# Fix 4: Add coins_used to order summary section
idx_summary = find_line('order-summary')
if idx_summary >= 0:
    # Find the summary-text line with formatTime
    idx_format_time = find_line('formatTime(order.created_at)', idx_summary)
    if idx_format_time >= 0:
        # Add coins_used line after
        coins_line = '\t\t\t\t\t<text class="summary-text coins" v-if="order.coins_used">\u4f7f\u7528{{ order.coins_used }}\u4e2a\u91d1\u5e01</text>\n'
        lines.insert(idx_format_time + 1, coins_line)
        print(f"Added coins_used display at line {idx_format_time+2}")

# Fix 5: Fix handleReorder to use detail_items
idx_reorder = find_line('handleReorder(order)')
if idx_reorder >= 0:
    # Find the items check
    idx_items_check = find_line('order.items && order.items.length', idx_reorder)
    if idx_items_check >= 0:
        lines[idx_items_check] = '\t\t\t\tif (order.detail_items && order.detail_items.length > 0) {\n'
        print(f"Fixed handleReorder to use detail_items at line {idx_items_check+1}")

        # Fix the items.map line
        idx_items_map = find_line('order.items.map', idx_items_check)
        if idx_items_map >= 0:
            lines[idx_items_map] = '\t\t\t\t\tconst products = order.detail_items.map(item => ({\n'
            print(f"Fixed items.map to detail_items.map at line {idx_items_map+1}")

# Fix 6: Add formatOrderType method
idx_status_text = find_line('statusText(status)')
if idx_status_text >= 0:
    # Find closing of statusText method
    for k in range(idx_status_text, idx_status_text + 5):
        if lines[k].strip() == '},':
            idx_st_close = k
            break

    new_method = [
        '\n',
        '\t\t\tformatOrderType(type) {\n',
        "\t\t\t\treturn ORDER_TYPE_MAP[type] || type || ''\n",
        '\t\t\t},\n',
    ]
    for j, l in enumerate(new_method):
        lines.insert(idx_st_close + 1 + j, l)
    print(f"Added formatOrderType method at line {idx_st_close+2}")

# Fix 7: Add CSS for order_type_tag and coins_used
idx_order_status_css = find_line('.order-status {')
if idx_order_status_css >= 0:
    new_css = [
        '\n',
        '.order-type-tag {\n',
        '\tfont-size: 10px;\n',
        '\tcolor: #F2B131;\n',
        '\tbackground-color: #FFF8E1;\n',
        '\tpadding: 2px 6px;\n',
        '\tborder-radius: 4px;\n',
        '\tmargin-left: 6px;\n',
        '}\n',
        '\n',
        '.summary-text.coins {\n',
        '\tcolor: #F2B131;\n',
        '}\n',
    ]
    for j, l in enumerate(new_css):
        lines.insert(idx_order_status_css + j, l)
    print(f"Added CSS for order_type_tag and coins")

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("\nDone! Order list page updated.")
