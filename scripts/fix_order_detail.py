#!/usr/bin/env python3
"""Fix order-detail/index.vue - add missing fields, i18n, fix specs"""

filepath = r'D:\project\SiamFeast\pages\order-detail\index.vue'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace product list section - add order_type section before it
old_products = '''\t\t\t\t<!-- \u5546\u54c1\u5217\u8868 -->
\t\t\t\t<view class="products-section">
\t\t\t\t\t<view class="section-card">
\t\t\t\t\t\t<view class="section-title">
\t\t\t\t\t\t\t<text class="title-text">\u5546\u54c1\u4fe1\u606f</text>
\t\t\t\t\t\t</view>
\t\t\t\t\t\t<view class="products-list">
\t\t\t\t\t\t\t<view class="product-item" v-for="(item, index) in orderData.items" :key="index">
\t\t\t\t\t\t\t\t<image class="product-image" :src="item.image_url || '/static/logo.png'" mode="aspectFill"></image>
\t\t\t\t\t\t\t\t<view class="product-info">
\t\t\t\t\t\t\t\t\t<text class="product-name">{{ item.item_name }}</text>
\t\t\t\t\t\t\t\t\t<view class="product-specs" v-if="item.specs_config && Object.keys(item.specs_config).length > 0">
\t\t\t\t\t\t\t\t\t\t<text class="specs-text">{{ formatSpecs(item.specs_config) }}</text>
\t\t\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t\t\t\t<view class="product-footer">
\t\t\t\t\t\t\t\t\t\t<text class="product-price">\u0e3f{{ item.unit_price }}</text>
\t\t\t\t\t\t\t\t\t\t<text class="product-quantity">x{{ item.quantity }}</text>
\t\t\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t</view>
\t\t\t\t\t</view>
\t\t\t\t</view>'''

new_products = '''\t\t\t\t<!-- \u8ba2\u5355\u7c7b\u578b -->
\t\t\t\t<view class="order-type-section" v-if="orderData.order_type">
\t\t\t\t\t<view class="section-card">
\t\t\t\t\t\t<view class="order-type-row">
\t\t\t\t\t\t\t<text class="order-type-label">\u8ba2\u5355\u7c7b\u578b</text>
\t\t\t\t\t\t\t<text class="order-type-value">{{ formatOrderType(orderData.order_type) }}</text>
\t\t\t\t\t\t</view>
\t\t\t\t\t</view>
\t\t\t\t</view>

\t\t\t\t<!-- \u5206\u9694\u7ebf -->
\t\t\t\t<view class="divider"></view>

\t\t\t\t<!-- \u5546\u54c1\u5217\u8868 -->
\t\t\t\t<view class="products-section">
\t\t\t\t\t<view class="section-card">
\t\t\t\t\t\t<view class="section-title">
\t\t\t\t\t\t\t<text class="title-text">\u5546\u54c1\u4fe1\u606f</text>
\t\t\t\t\t\t</view>
\t\t\t\t\t\t<view class="products-list">
\t\t\t\t\t\t\t<view class="product-item" v-for="(item, index) in orderData.items" :key="index">
\t\t\t\t\t\t\t\t<image class="product-image" :src="item.image_url || '/static/logo.png'" mode="aspectFill"></image>
\t\t\t\t\t\t\t\t<view class="product-info">
\t\t\t\t\t\t\t\t\t<text class="product-name">{{ getItemName(item) }}</text>
\t\t\t\t\t\t\t\t\t<view class="product-specs" v-if="hasSpecs(item)">
\t\t\t\t\t\t\t\t\t\t<text class="specs-text">{{ formatSpecs(item.specs || item.specs_config) }}</text>
\t\t\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t\t\t\t<view class="product-footer">
\t\t\t\t\t\t\t\t\t\t<text class="product-price">\u0e3f{{ item.unit_price }}</text>
\t\t\t\t\t\t\t\t\t\t<text class="product-quantity">x{{ item.quantity }}</text>
\t\t\t\t\t\t\t\t\t\t<text class="product-subtotal" v-if="item.subtotal">\u0e3f{{ item.subtotal }}</text>
\t\t\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t</view>
\t\t\t\t\t</view>
\t\t\t\t</view>'''

if old_products in content:
    content = content.replace(old_products, new_products)
    print("OK: Replaced products section with order_type + i18n")
else:
    print("WARN: Could not find old_products section")

# 2. Add coins_used to fee details section
old_fees = '''\t\t\t\t\t\t\t<view class="info-row" v-if="orderData.coin_deduct_amount > 0">
\t\t\t\t\t\t\t\t<text class="info-label">\u91d1\u5e01\u62b5\u6263</text>
\t\t\t\t\t\t\t\t<text class="info-value discount">-\u0e3f{{ orderData.coin_deduct_amount }}</text>
\t\t\t\t\t\t\t</view>'''

new_fees = '''\t\t\t\t\t\t\t<view class="info-row" v-if="orderData.coin_deduct_amount > 0">
\t\t\t\t\t\t\t\t<text class="info-label">\u91d1\u5e01\u62b5\u6263</text>
\t\t\t\t\t\t\t\t<text class="info-value discount">-\u0e3f{{ orderData.coin_deduct_amount }}<text v-if="orderData.coins_used"> ({{ orderData.coins_used }}\u4e2a\u91d1\u5e01)</text></text>
\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t\t<view class="info-row" v-if="memberSettlement && memberSettlement.coins_earned > 0">
\t\t\t\t\t\t\t\t<text class="info-label">\u83b7\u5f97\u91d1\u5e01</text>
\t\t\t\t\t\t\t\t<text class="info-value">+{{ memberSettlement.coins_earned }}\u4e2a</text>
\t\t\t\t\t\t\t</view>
\t\t\t\t\t\t\t<view class="info-row" v-if="memberSettlement && memberSettlement.points_earned > 0">
\t\t\t\t\t\t\t\t<text class="info-label">\u83b7\u5f97\u79ef\u5206</text>
\t\t\t\t\t\t\t\t<text class="info-value">+{{ memberSettlement.points_earned }}\u5206</text>
\t\t\t\t\t\t\t</view>'''

if old_fees in content:
    content = content.replace(old_fees, new_fees)
    print("OK: Added coins_used and member_settlement to fees")
else:
    print("WARN: Could not find old_fees section")

# 3. Add computed memberSettlement and methods
old_computed = '''\t\tcomputed: {
\t\t\tstatusText() {
\t\t\t\treturn STATUS_MAP[this.orderData.status] || this.orderData.status || '\u672a\u77e5'
\t\t\t}
\t\t},'''

new_computed = '''\t\tcomputed: {
\t\t\tstatusText() {
\t\t\t\treturn STATUS_MAP[this.orderData.status] || this.orderData.status || '\u672a\u77e5'
\t\t\t},
\t\t\tmemberSettlement() {
\t\t\t\tconst extra = this.orderData.extra_data
\t\t\t\tif (extra && extra.member_settlement) {
\t\t\t\t\treturn extra.member_settlement
\t\t\t\t}
\t\t\t\treturn null
\t\t\t}
\t\t},'''

if old_computed in content:
    content = content.replace(old_computed, new_computed)
    print("OK: Added memberSettlement computed")
else:
    print("WARN: Could not find computed section")

# 4. Add ORDER_TYPE_MAP and new methods
old_status_map_end = "const ORDER_SOURCE_MAP = {"

new_with_type_map = '''const ORDER_TYPE_MAP = {
\t'SINEFOOD_NOODLE': '\u6cf0\u5f0f\u6d77\u9c9c\u9762',
\t'HOTPOT': '\u706b\u9505',
\t'MALATANG': '\u9ebb\u8fa3\u70eb',
\t'BBQ': '\u70e7\u70e4',
\t'SEAFOOD_NOODLE': '\u6cf0\u5f0f\u6d77\u9c9c\u9762',
\t'DINE_IN': '\u5802\u98df',
\t'TAKEAWAY': '\u5916\u5356',
\t'DELIVERY': '\u914d\u9001'
}

const ORDER_SOURCE_MAP = {'''

if old_status_map_end in content:
    content = content.replace(old_status_map_end, new_with_type_map, 1)
    print("OK: Added ORDER_TYPE_MAP")
else:
    print("WARN: Could not find ORDER_SOURCE_MAP")

# 5. Add new methods before goBack
old_goback = '''\t\t\tgoBack() {
\t\t\t\tuni.navigateBack()
\t\t\t},'''

new_with_methods = '''\t\t\tgetItemName(item) {
\t\t\t\tconst lang = i18n.getLanguage()
\t\t\t\tconst name = lang === 'en' ? (item.item_name_en || item.item_name)
\t\t\t\t\t: lang === 'th' ? (item.item_name_th || item.item_name)
\t\t\t\t\t: item.item_name
\t\t\t\treturn name || ''
\t\t\t},

\t\t\thasSpecs(item) {
\t\t\t\tconst specs = item.specs || item.specs_config
\t\t\t\treturn specs && Object.keys(specs).length > 0
\t\t\t},

\t\t\tformatOrderType(type) {
\t\t\t\treturn ORDER_TYPE_MAP[type] || type || ''
\t\t\t},

\t\t\tgoBack() {
\t\t\t\tuni.navigateBack()
\t\t\t},'''

if old_goback in content:
    content = content.replace(old_goback, new_with_methods, 1)
    print("OK: Added getItemName, hasSpecs, formatOrderType methods")
else:
    print("WARN: Could not find goBack method")

# 6. Add CSS for new elements
old_info_section_css = '''.info-section {
\tpadding-top: 10px;
}'''

new_css = '''.order-type-section {
\tpadding-top: 10px;
}

.order-type-row {
\tdisplay: flex;
\tjustify-content: space-between;
\talign-items: center;
}

.order-type-label {
\tfont-size: 12px;
\tcolor: #00000099;
}

.order-type-value {
\tfont-size: 12px;
\tcolor: #F2B131;
\tfont-weight: 500;
}

.product-subtotal {
\tfont-size: 11px;
\tcolor: #00000099;
\tmargin-left: 8px;
}

.info-section {
\tpadding-top: 10px;
}'''

if old_info_section_css in content:
    content = content.replace(old_info_section_css, new_css, 1)
    print("OK: Added new CSS")
else:
    print("WARN: Could not find info-section CSS")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! order-detail updated.")
