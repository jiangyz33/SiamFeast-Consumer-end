#!/usr/bin/env python3
"""Add coupon selection UI to checkout page"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\checkout\index.vue'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_line(text, start=0):
    for i in range(start, len(lines)):
        if text in lines[i]:
            return i
    return -1

# 1. Add coupon selection section in template (after payment section divider, before coin section)
# Find the divider before coin section
idx_coin_divider = -1
for i, line in enumerate(lines):
    if 'class="divider"' in line:
        # Check if next non-empty line is coin section
        j = i + 1
        while j < len(lines) and lines[j].strip() == '':
            j += 1
        if j < len(lines) and 'coin-section' in lines[j]:
            idx_coin_divider = i
            break

if idx_coin_divider >= 0:
    coupon_section = [
        '\t\t\t\t<!-- \u4f18\u60e0\u5238\u9009\u62e9 -->\n',
        '\t\t\t\t<view class="coupon-section" v-if="availableCoupons.length > 0">\n',
        '\t\t\t\t\t<view class="section-card">\n',
        '\t\t\t\t\t\t<view class="coupon-row" @click="showCouponPicker = true">\n',
        '\t\t\t\t\t\t\t<view class="coupon-left">\n',
        '\t\t\t\t\t\t\t\t<text class="coupon-label">\u4f18\u60e0\u5238</text>\n',
        '\t\t\t\t\t\t\t\t<text class="coupon-count">{{ availableCoupons.length }}\u5f20\u53ef\u7528</text>\n',
        '\t\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t\t\t<view class="coupon-right">\n',
        '\t\t\t\t\t\t\t\t<text class="coupon-selected" v-if="selectedCoupon">-\u0e3f{{ selectedCoupon.amount.toFixed(2) }}</text>\n',
        '\t\t\t\t\t\t\t\t<text class="coupon-hint" v-else>\u8bf7\u9009\u62e9</text>\n',
        '\t\t\t\t\t\t\t\t<image class="arrow-icon-small" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>\n',
        '\t\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t\t\t<view class="coupon-selected-info" v-if="selectedCoupon">\n',
        '\t\t\t\t\t\t\t\t<text class="coupon-name">{{ selectedCoupon.name }}</text>\n',
        '\t\t\t\t\t\t\t\t<text class="coupon-remove" @click.stop="clearCoupon">\u00d7</text>\n',
        '\t\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t</view>\n',
        '\t\t\t\t</view>\n',
        '\n',
        '\t\t\t\t<!-- \u5206\u9694\u7ebf -->\n',
        '\t\t\t\t<view class="divider"></view>\n',
        '\n',
    ]
    for j, cl in enumerate(coupon_section):
        lines.insert(idx_coin_divider + j, cl)
    print(f"Added coupon selection UI at line {idx_coin_divider+1}")

# 2. Add coupon picker popup (before bottom-bar)
idx_bottom_bar = find_line('class="bottom-bar"')
if idx_bottom_bar >= 0:
    # Go back to find the comment or the view
    for i in range(idx_bottom_bar - 1, max(0, idx_bottom_bar - 10), -1):
        if '<!-- ' in lines[i] or '<view' in lines[i]:
            insert_point = i
            break

    picker_popup = [
        '\t\t\t<!-- \u4f18\u60e0\u5238\u9009\u62e9\u5f39\u7a97 -->\n',
        '\t\t\t<view class="coupon-picker-mask" v-if="showCouponPicker" @click="showCouponPicker = false">\n',
        '\t\t\t\t<view class="coupon-picker" @click.stop>\n',
        '\t\t\t\t\t<view class="picker-header">\n',
        '\t\t\t\t\t\t<text class="picker-title">\u9009\u62e9\u4f18\u60e0\u5238</text>\n',
        '\t\t\t\t\t\t<text class="picker-close" @click="showCouponPicker = false">\u00d7</text>\n',
        '\t\t\t\t\t</view>\n',
        '\t\t\t\t\t<scroll-view class="picker-list" scroll-y>\n',
        '\t\t\t\t\t\t<view\n',
        '\t\t\t\t\t\t\tclass="picker-item"\n',
        '\t\t\t\t\t\t\t:class="{ \'picker-item-active\': selectedCoupon && selectedCoupon.id === coupon.id }"\n',
        '\t\t\t\t\t\t\tv-for="coupon in availableCoupons"\n',
        '\t\t\t\t\t\t\t:key="coupon.id"\n',
        '\t\t\t\t\t\t\t@click="selectCoupon(coupon)"\n',
        '\t\t\t\t\t\t>\n',
        '\t\t\t\t\t\t\t<view class="picker-coupon-amount">\n',
        '\t\t\t\t\t\t\t\t<text class="picker-coupon-value">\u0e3f{{ coupon.amount.toFixed(2) }}</text>\n',
        '\t\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t\t\t<view class="picker-coupon-info">\n',
        '\t\t\t\t\t\t\t\t<text class="picker-coupon-name">{{ coupon.name }}</text>\n',
        '\t\t\t\t\t\t\t\t<text class="picker-coupon-desc">{{ coupon.description || \'\' }}</text>\n',
        '\t\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t\t\t<view class="picker-check" v-if="selectedCoupon && selectedCoupon.id === coupon.id">\n',
        '\t\t\t\t\t\t\t\t<text class="check-mark">\u2713</text>\n',
        '\t\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t\t<view class="picker-item picker-item-none" @click="clearCoupon">\n',
        '\t\t\t\t\t\t\t<text class="picker-coupon-name">\u4e0d\u4f7f\u7528\u4f18\u60e0\u5238</text>\n',
        '\t\t\t\t\t\t</view>\n',
        '\t\t\t\t\t</scroll-view>\n',
        '\t\t\t\t</view>\n',
        '\t\t\t</view>\n',
        '\n',
    ]
    for j, cl in enumerate(picker_popup):
        lines.insert(insert_point + j, cl)
    print(f"Added coupon picker popup at line {insert_point+1}")

# 3. Add showCouponPicker to data
idx_coupons_data = find_line('availableCoupons: []')
if idx_coupons_data >= 0:
    lines.insert(idx_coupons_data + 1, '\t\t\t\tshowCouponPicker: false,\n')
    print(f"Added showCouponPicker to data at line {idx_coupons_data+2}")

# 4. Remove auto-select of best coupon - let user choose
# Find the line: this.selectedCoupon = this.availableCoupons.reduce(...)
idx_auto_select = find_line('this.availableCoupons.reduce')
if idx_auto_select >= 0:
    # Comment it out or just keep it as initial default - user can change
    # Actually let's keep auto-select as initial, but add selectCoupon/clearCoupon methods
    pass

# 5. Add selectCoupon and clearCoupon methods
# Find handleCoinToggle
idx_coin_toggle = find_line('handleCoinToggle')
if idx_coin_toggle >= 0:
    new_methods = [
        '\n',
        '\t\t\tselectCoupon(coupon) {\n',
        '\t\t\t\tthis.selectedCoupon = coupon\n',
        '\t\t\t\tthis.showCouponPicker = false\n',
        '\t\t\t},\n',
        '\n',
        '\t\t\tclearCoupon() {\n',
        '\t\t\t\tthis.selectedCoupon = null\n',
        '\t\t\t\tthis.showCouponPicker = false\n',
        '\t\t\t},\n',
    ]
    for j, cl in enumerate(new_methods):
        lines.insert(idx_coin_toggle + j, cl)
    print(f"Added selectCoupon/clearCoupon methods at line {idx_coin_toggle+1}")

# 6. Add CSS for coupon UI
idx_coin_section_css = find_line('.coin-section')
if idx_coin_section_css >= 0:
    coupon_css = [
        '.coupon-section {\n',
        '\tpadding-top: 10px;\n',
        '}\n',
        '\n',
        '.coupon-row {\n',
        '\tdisplay: flex;\n',
        '\tjustify-content: space-between;\n',
        '\talign-items: center;\n',
        '\tpadding: 12px 0;\n',
        '}\n',
        '\n',
        '.coupon-left {\n',
        '\tdisplay: flex;\n',
        '\talign-items: center;\n',
        '\tgap: 8px;\n',
        '}\n',
        '\n',
        '.coupon-label {\n',
        '\tfont-size: 14px;\n',
        '\tcolor: #000000CC;\n',
        '}\n',
        '\n',
        '.coupon-count {\n',
        '\tfont-size: 11px;\n',
        '\tcolor: #F2B131;\n',
        '}\n',
        '\n',
        '.coupon-right {\n',
        '\tdisplay: flex;\n',
        '\talign-items: center;\n',
        '\tgap: 6px;\n',
        '}\n',
        '\n',
        '.coupon-selected {\n',
        '\tfont-size: 14px;\n',
        '\tcolor: #DA3300;\n',
        '\tfont-weight: 500;\n',
        '}\n',
        '\n',
        '.coupon-hint {\n',
        '\tfont-size: 12px;\n',
        '\tcolor: #00000099;\n',
        '}\n',
        '\n',
        '.coupon-selected-info {\n',
        '\tdisplay: flex;\n',
        '\tjustify-content: space-between;\n',
        '\talign-items: center;\n',
        '\tpadding: 8px 12px;\n',
        '\tbackground-color: #FFF8E1;\n',
        '\tborder-radius: 6px;\n',
        '\tmargin-top: 8px;\n',
        '}\n',
        '\n',
        '.coupon-name {\n',
        '\tfont-size: 12px;\n',
        '\tcolor: #F2B131;\n',
        '}\n',
        '\n',
        '.coupon-remove {\n',
        '\tfont-size: 18px;\n',
        '\tcolor: #00000066;\n',
        '\tpadding: 0 4px;\n',
        '}\n',
        '\n',
        '.coupon-picker-mask {\n',
        '\tposition: fixed;\n',
        '\ttop: 0;\n',
        '\tleft: 0;\n',
        '\tright: 0;\n',
        '\tbottom: 0;\n',
        '\tbackground-color: rgba(0,0,0,0.5);\n',
        '\tz-index: 1000;\n',
        '\tdisplay: flex;\n',
        '\talign-items: flex-end;\n',
        '}\n',
        '\n',
        '.coupon-picker {\n',
        '\tbackground-color: #FFFFFF;\n',
        '\tborder-radius: 16px 16px 0 0;\n',
        '\twidth: 100%;\n',
        '\tmax-height: 60vh;\n',
        '\tdisplay: flex;\n',
        '\tflex-direction: column;\n',
        '}\n',
        '\n',
        '.picker-header {\n',
        '\tdisplay: flex;\n',
        '\tjustify-content: space-between;\n',
        '\talign-items: center;\n',
        '\tpadding: 16px;\n',
        '\tborder-bottom: 1px solid #F3F3F3;\n',
        '}\n',
        '\n',
        '.picker-title {\n',
        '\tfont-size: 16px;\n',
        '\tfont-weight: 700;\n',
        '\tcolor: #000000CC;\n',
        '}\n',
        '\n',
        '.picker-close {\n',
        '\tfont-size: 24px;\n',
        '\tcolor: #00000066;\n',
        '\tpadding: 0 4px;\n',
        '}\n',
        '\n',
        '.picker-list {\n',
        '\tmax-height: 50vh;\n',
        '\tpadding: 8px 16px;\n',
        '}\n',
        '\n',
        '.picker-item {\n',
        '\tdisplay: flex;\n',
        '\talign-items: center;\n',
        '\tpadding: 12px;\n',
        '\tborder-radius: 8px;\n',
        '\tmargin-bottom: 8px;\n',
        '\tbackground-color: #F9F9F9;\n',
        '}\n',
        '\n',
        '.picker-item-active {\n',
        '\tbackground-color: #FFF8E1;\n',
        '\tborder: 1px solid #F2B131;\n',
        '}\n',
        '\n',
        '.picker-item-none {\n',
        '\tjustify-content: center;\n',
        '}\n',
        '\n',
        '.picker-coupon-amount {\n',
        '\tmargin-right: 12px;\n',
        '}\n',
        '\n',
        '.picker-coupon-value {\n',
        '\tfont-size: 18px;\n',
        '\tfont-weight: 700;\n',
        '\tcolor: #DA3300;\n',
        '}\n',
        '\n',
        '.picker-coupon-info {\n',
        '\tflex: 1;\n',
        '\tdisplay: flex;\n',
        '\tflex-direction: column;\n',
        '\tgap: 2px;\n',
        '}\n',
        '\n',
        '.picker-coupon-name {\n',
        '\tfont-size: 14px;\n',
        '\tcolor: #000000CC;\n',
        '}\n',
        '\n',
        '.picker-coupon-desc {\n',
        '\tfont-size: 11px;\n',
        '\tcolor: #00000099;\n',
        '}\n',
        '\n',
        '.picker-check {\n',
        '\tmargin-left: 8px;\n',
        '}\n',
        '\n',
        '.check-mark {\n',
        '\tfont-size: 18px;\n',
        '\tcolor: #F2B131;\n',
        '}\n',
        '\n',
    ]
    for j, cl in enumerate(coupon_css):
        lines.insert(idx_coin_section_css + j, cl)
    print(f"Added coupon CSS ({len(coupon_css)} lines)")

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("\nDone! Coupon selection UI added to checkout.")
