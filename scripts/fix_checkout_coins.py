#!/usr/bin/env python3
"""Fix checkout to send use_coins and coins_to_use to createOrder"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'D:\project\SiamFeast\pages\checkout\index.vue'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line "orderData.coupon_id = this.selectedCoupon.id"
for i, line in enumerate(lines):
    if 'orderData.coupon_id = this.selectedCoupon.id' in line:
        # Find the closing }
        for k in range(i, i+4):
            if lines[k].strip() == '}':
                close_line = k
                break

        # Insert use_coins block after the closing }
        coin_lines = [
            '\n',
            '\t\t\t\tif (this.useCoins && this.coinDeductAmount > 0) {\n',
            '\t\t\t\t\torderData.use_coins = true\n',
            '\t\t\t\t\torderData.coins_to_use = this.coinBalance\n',
            '\t\t\t\t}\n',
        ]
        for j, cl in enumerate(coin_lines):
            lines.insert(close_line + 1 + j, cl)
        print(f"Added use_coins/coins_to_use at line {close_line+2}")
        break

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done!")
