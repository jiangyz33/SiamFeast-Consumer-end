#!/usr/bin/env python3
"""Insert coupon selection row in checkout template"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\checkout\index.vue'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the divider right before coin-section
for i, line in enumerate(lines):
    if 'class="divider"' in line and i < 250:
        # Check if coin-section is nearby
        for k in range(i+1, min(i+5, len(lines))):
            if 'coin-section' in lines[k]:
                # Found it! Insert coupon section before this divider
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
                    '\t\t\t\t\t\t</view>\n',
                    '\t\t\t\t\t\t<view class="coupon-selected-info" v-if="selectedCoupon">\n',
                    '\t\t\t\t\t\t\t<text class="coupon-name">{{ selectedCoupon.name }}</text>\n',
                    '\t\t\t\t\t\t\t<text class="coupon-remove" @click.stop="clearCoupon">\u00d7</text>\n',
                    '\t\t\t\t\t\t</view>\n',
                    '\t\t\t\t\t</view>\n',
                    '\t\t\t\t</view>\n',
                    '\n',
                    '\t\t\t\t<!-- \u5206\u9694\u7ebf -->\n',
                    '\t\t\t\t<view class="divider"></view>\n',
                    '\n',
                ]
                for j, cl in enumerate(coupon_section):
                    lines.insert(i + j, cl)
                print(f"Inserted coupon selection UI at line {i+1}")
                break
        else:
            continue
        break

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done!")
