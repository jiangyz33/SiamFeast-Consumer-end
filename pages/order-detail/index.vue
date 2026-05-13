<template>
	<view class="order-detail-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ i18n.t("orderDetail.title") }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-state" v-if="loading">
			<text class="loading-text">{{ i18n.t("orderDetail.loading") }}</text>
		</view>

		<!-- 内容区域 -->
		<scroll-view v-else class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 订单状态 -->
			<view class="status-section">
				<view class="status-card">
					<view class="status-icon-wrapper">
						<image class="status-icon" src="/static/images/payment-success.svg" mode="aspectFit"></image>
					</view>
					<view class="status-info">
						<text class="status-title">{{ statusText }}</text>
						<text class="status-desc" v-if="deliveryInfo && deliveryInfo.estimated_time">
							{{ i18n.t("orderDetail.estDelivery", { time: deliveryInfo.estimated_time }) }}
						</text>
						<text class="status-desc" v-else-if="orderData.table_number">
							{{ i18n.t("orderDetail.tableNo", { no: orderData.table_number }) }}
						</text>
					</view>
				</view>
			</view>

			
				<!-- 取餐码 -->
				<view class="pickup-code-section" v-if="pickupCode">
					<view class="section-card pickup-card">
						<text class="pickup-label">{{ i18n.t("orderDetail.pickupCode") }}</text>
						<text class="pickup-code">{{ pickupCode }}</text>
					</view>
				</view>
				<!-- 配送信息 -->
			<view class="delivery-section" v-if="deliveryInfo && deliveryInfo.delivery_type === 'delivery' && deliveryInfo.address">
				<view class="section-card">
					<view class="delivery-header">
						<image class="delivery-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
						<view class="delivery-info">
							<view class="delivery-user">
								<text class="user-name">{{ deliveryInfo.address.name }}</text>
								<text class="user-phone">{{ deliveryInfo.address.phone }}</text>
							</view>
							<text class="delivery-address">{{ deliveryInfo.address.detail }}</text>
							<view class="carrier-info" v-if="deliveryInfo.carrier">
								<text class="carrier-text">{{ deliveryInfo.carrier }} {{ deliveryInfo.tracking_no || '' }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 到店信息 -->
			<view class="shop-section" v-if="deliveryInfo && deliveryInfo.shop">
				<view class="section-card">
					<view class="shop-header">
						<image class="shop-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
						<view class="shop-info">
							<text class="shop-name">{{ deliveryInfo.shop.name }}</text>
							<text class="shop-address">{{ deliveryInfo.shop.address }}</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 门店信息（从订单数据） -->
			<view class="shop-section" v-else-if="orderData.extra_data && orderData.extra_data.store_name">
				<view class="section-card">
					<view class="shop-header">
						<image class="shop-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
						<view class="shop-info">
							<text class="shop-name">{{ orderData.extra_data["store_name_" + i18n.getLanguage()] || orderData.extra_data.store_name }}</text>
							<text class="shop-address" v-if="orderData.extra_data.store_address">{{ orderData.extra_data["store_address_" + i18n.getLanguage()] || orderData.extra_data.store_address }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 订单类型 -->
							<!-- Room info -->
				<view class="room-section" v-if="hostelBooking">
					<view class="section-card">
						<view class="section-title">
							<text class="title-text">{{ i18n.t("orderDetail.roomInfo") }}</text>
						</view>
						<view class="room-info-list">
							<view class="room-info-row" v-if="hostelBooking.room_name">
								<text class="room-label">{{ i18n.t("orderDetail.roomName") }}</text>
								<text class="room-value">{{ hostelBooking["room_name_" + i18n.getLanguage()] || hostelBooking.room_name }}</text>
							</view>
							<view class="room-info-row" v-if="hostelBooking.room_type">
								<text class="room-label">{{ i18n.t("orderDetail.roomType") }}</text>
								<text class="room-value">{{ hostelBooking.room_type }}</text>
							</view>
							<view class="room-info-row" v-if="hostelBooking.check_in">
								<text class="room-label">{{ i18n.t("orderDetail.checkInDate") }}</text>
								<text class="room-value">{{ formatDate(hostelBooking.check_in) }}</text>
							</view>
							<view class="room-info-row" v-if="hostelBooking.check_out">
								<text class="room-label">{{ i18n.t("orderDetail.checkOutDate") }}</text>
								<text class="room-value">{{ formatDate(hostelBooking.check_out) }}</text>
							</view>
							<view class="room-info-row" v-if="hostelBooking.nights">
								<text class="room-label">{{ i18n.t("orderDetail.nightsCount", {n: hostelBooking.nights}) }}</text>
								<text class="room-value" v-if="hostelBooking.guests">{{ i18n.t("orderDetail.guestsCount", {n: hostelBooking.guests}) }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="order-type-section" v-if="orderData.order_type">
					<view class="section-card">
						<view class="order-type-row">
						<text class="order-type-label">{{ i18n.t("orderDetail.orderTypeLabel") }}</text>
						<text class="order-type-value">{{ formatOrderType(orderData.order_type) }}</text>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 商品列表 -->
			<view class="products-section">
				<view class="section-card">
					<view class="section-title">
						<text class="title-text">{{ i18n.t("orderDetail.productInfo") }}</text>
					</view>
					<view class="products-list">
						<view class="product-item" v-for="(item, index) in orderData.items" :key="index">
							<image class="product-image" :src="fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
							<view class="product-info">
							<text class="product-name">{{ getItemName(item) }}</text>
						<view class="product-specs" v-if="hasSpecs(item)">
							<text class="specs-text">{{ formatSpecs(item.specs || item.specs_config) }}</text>
						</view>
						<view class="product-footer">
								<text class="product-price">฿{{ item.unit_price }}</text>
								<text class="product-quantity">x{{ item.quantity }}</text>
										<text class="product-subtotal" v-if="item.subtotal">฿{{ item.subtotal }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 费用明细 -->
			<view class="info-section">
				<view class="section-card">
					<view class="section-title">
						<text class="title-text">{{ i18n.t("orderDetail.feeDetail") }}</text>
					</view>
					<view class="info-list">
						<view class="info-row">
							<text class="info-label">{{ i18n.t("orderDetail.subtotal") }}</text>
							<text class="info-value">฿{{ orderData.subtotal || 0 }}</text>
						</view>
						<view class="info-row" v-if="orderData.discount_amount > 0">
							<text class="info-label">{{ i18n.t("orderDetail.discount") }}</text>
							<text class="info-value discount">-฿{{ orderData.discount_amount }}</text>
						</view>
							<view class="info-row" v-if="orderData.coin_deduct_amount > 0">
								<text class="info-label">{{ i18n.t("orderDetail.coinDeduct") }}</text>
								<text class="info-value discount">-฿{{ orderData.coin_deduct_amount }}<text v-if="orderData.coins_used"> ({{ i18n.t("orderDetail.coinsCount", { n: orderData.coins_used }) }})</text></text>
							</view>
							<view class="info-row" v-if="memberSettlement && memberSettlement.coins_earned > 0">
								<text class="info-label">{{ i18n.t("orderDetail.coinsEarned") }}</text>
								<text class="info-value">{{ i18n.t("orderDetail.coinsUnit", { n: memberSettlement.coins_earned }) }}</text>
							</view>
							<view class="info-row" v-if="memberSettlement && memberSettlement.points_earned > 0">
								<text class="info-label">{{ i18n.t("orderDetail.pointsEarned") }}</text>
								<text class="info-value">{{ i18n.t("orderDetail.pointsUnit", { n: memberSettlement.points_earned }) }}</text>
							</view>
						<view class="info-row total-row">
							<text class="info-label">{{ i18n.t("orderDetail.actualPay") }}</text>
							<text class="info-value total">฿{{ orderData.total_amount || 0 }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 订单信息 -->
			<view class="info-section">
				<view class="section-card">
					<view class="section-title">
						<text class="title-text">{{ i18n.t("orderDetail.orderInfo") }}</text>
					</view>
					<view class="info-list">
						<view class="info-row">
							<text class="info-label">{{ i18n.t("orderDetail.orderNo") }}</text>
							<text class="info-value">{{ orderData.order_no }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">{{ i18n.t("orderDetail.orderTime") }}</text>
							<text class="info-value">{{ formatTime(orderData.created_at) }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">{{ i18n.t("orderDetail.orderSource") }}</text>
							<text class="info-value">{{ formatOrderSource(orderData.order_source) }}</text>
						</view>
						<view class="info-row" v-if="orderData.remark">
							<text class="info-label">{{ i18n.t("orderDetail.remark") }}</text>
							<text class="info-value">{{ orderData.remark }}</text>
						</view>
						<view class="info-row" v-if="orderData.payment_method">
							<text class="info-label">{{ i18n.t("orderDetail.payMethod") }}</text>
							<text class="info-value">{{ formatPaymentMethod(orderData.payment_method) }}</text>
						</view>
						<view class="info-row" v-if="orderData.paid_at">
							<text class="info-label">{{ i18n.t("orderDetail.payTime") }}</text>
							<text class="info-value">{{ formatTime(orderData.paid_at) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="action-btn contact-btn" @click="handleContact">
				<text class="action-btn-text">{{ i18n.t("orderDetail.contactStore") }}</text>
			</view>
			<view class="action-btn reorder-btn" @click="handleReorder">
				<text class="action-btn-text">{{ i18n.t("orderDetail.reorder") }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getOrderDetail } from '@/api/services/order.js'
import { getStore } from '@/api/services/store.js'
import { getBooking } from '@/api/services/hostel.js'

import { showToast, fixMinioUrl } from '@/utils/index.js'
import i18n from '@/i18n/index.js'

const STATUS_I18N_KEYS = {
	'PENDING_PAYMENT': 'order.pending',
	'PAID': 'order.paid',
	'PREPARING': 'order.preparing',
	'READY': 'order.ready',
	'COMPLETED': 'order.completed',
	'CANCELLED': 'order.cancelled'
}

const PAYMENT_METHOD_I18N = {
	'cash_pos': 'orderDetail.payCash',
	'visa': 'orderDetail.payVisa',
	'paypal': 'orderDetail.payPaypal',
	'coin_deduct': 'orderDetail.payCoin',
	'coupon': 'orderDetail.payCoupon'
}

const ORDER_TYPE_I18N = {
	'SINEFOOD_NOODLE': 'order.seafoodNoodle',
	'HOTPOT': 'order.hotpot',
	'MALATANG': 'order.malatang',
	'BBQ': 'order.hotpot',
	'SEAFOOD_NOODLE': 'order.seafoodNoodle',
	'DINE_IN': 'order.dineIn',
	'TAKEAWAY': 'order.takeaway',
	'DELIVERY': 'order.delivery',
	'GROUP_BUY': 'order.groupBuy'
}

const ORDER_SOURCE_I18N = {
	'DINE_IN_SCAN': 'orderDetail.sourceDineInScan',
	'DINE_IN_CASHIER': 'orderDetail.sourceDineInCashier',
	'TAKEAWAY': 'orderDetail.sourceTakeaway',
	'DELIVERY': 'orderDetail.sourceDelivery'
}

export default {
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			orderId: '',
			loading: true,
			orderData: {},
			storePhone: '',
			deliveryInfo: null,
				pickupCode: "",
				hostelBooking: null
		}
	},
	computed: {
		statusText() {
			return i18n.t(STATUS_I18N_KEYS[this.orderData.status] || '') || this.orderData.status || i18n.t('orderDetail.unknown')
		},
		memberSettlement() {
			const extra = this.orderData.extra_data
			if (extra && extra.member_settlement) {
				return extra.member_settlement
			}
			return null
		}
	},
	onLoad(options) {
		if (options.orderId) {
			this.orderId = options.orderId
		}
		this.initPage()
		this.loadOrderDetail()
	},
	methods: {
		fixMinioUrl,
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const bottomBarHeight = 64
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - bottomBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadOrderDetail() {
			this.loading = true
			try {
				const [orderRes] = await Promise.allSettled([
					getOrderDetail(this.orderId)
				])

				if (orderRes.status === 'fulfilled' && orderRes.value.code === 0 && orderRes.value.data) {
					const dd = orderRes.value.data; if (dd.order && dd.items) { this.orderData = { ...dd.order, items: dd.items } } else { this.orderData = dd }

					// Read pickup code from localStorage
					try { this.pickupCode = uni.getStorageSync("pickup_code_" + this.orderId) || "" } catch(e) {}
					// Parse extra_data if it is a JSON string
					if (this.orderData.extra_data && typeof this.orderData.extra_data === "string") { try { this.orderData.extra_data = JSON.parse(this.orderData.extra_data) } catch(e) {} }
					// Load hostel booking room info
					const orderType = (this.orderData.order_type || '').toUpperCase()
					if (orderType.includes('HOSTEL')) {
						try {
							const bkRes = await getBooking(this.orderId)
							if (bkRes.code === 0 && bkRes.data) {
								this.hostelBooking = bkRes.data
							}
						} catch(e) { console.error('Load hostel booking failed:', e) }
					}
					// Load store phone for contact
					const sid = this.orderData.store_id || this.orderData.shop_id
					if (sid) {
						try {
							const sRes = await getStore(sid)
							if (sRes.code === 0 && sRes.data) {
								this.storePhone = sRes.data.phone || ''
							}
						} catch(e) {}
					}
				}

			} catch (e) {
				console.error('Load order detail failed:', e)
				showToast(this.i18n.t('orderDetail.loadFailed'))
			} finally {
				this.loading = false
			}
		},

		formatTime(timeStr) {
			if (!timeStr) return ''
			return timeStr.replace('T', ' ').substring(0, 19)
		},

		formatSpecs(specs) {
			if (!specs) return ''
			const lang = i18n.state.language
			const langMessages = i18n.state.messages[lang] || {}
			const specLabels = (langMessages.productDetail && langMessages.productDetail.specLabels) || {}
			const specOptions = (langMessages.productDetail && langMessages.productDetail.specOptions) || {}
			const skipKeys = ['pricing', 'remark', 'topping_ids', 'quantity', 'group_price', 'original_price', 'group_buy_item_id', 'is_group_buy']
			return Object.entries(specs)
				.filter(([k, v]) => !skipKeys.includes(k) && v !== null && v !== undefined && v !== '' && typeof v !== 'object')
				.map(([key, val]) => {
					const label = specLabels[key] || key
					const optionLabel = specOptions[val] || val
					return `${label}：${optionLabel}`
				}).join(' / ')
		},

		formatOrderSource(source) {
			return i18n.t(ORDER_SOURCE_I18N[source] || '') || source || i18n.t('orderDetail.unknown')
		},

		formatPaymentMethod(method) {
			return i18n.t(PAYMENT_METHOD_I18N[method] || '') || method || i18n.t('orderDetail.unknown')
		},

		getItemName(item) {
			const lang = i18n.getLanguage()
			const name = lang === 'en' ? (item.item_name_en || item.item_name)
				: lang === 'th' ? (item.item_name_th || item.item_name)
				: item.item_name
			return name || ''
		},

		hasSpecs(item) {
			const specs = item.specs || item.specs_config
			if (!specs) return false
			return Object.entries(specs).some(([k, v]) => {
				if (k === "pricing" || k === "remark" || k === "topping_ids" || k === "quantity" || k === "group_price" || k === "original_price" || k === "group_buy_item_id" || k === "is_group_buy") return false
				return v !== null && v !== undefined && v !== "" && typeof v !== "object"
			})
		},

		formatOrderType(type) {
			return i18n.t(ORDER_TYPE_I18N[type] || '') || type || ''
		},

		goBack() {
			uni.navigateBack()
		},

		handleContact() {
			const phone = this.storePhone
				|| (this.deliveryInfo && this.deliveryInfo.shop && this.deliveryInfo.shop.phone)
				|| ''
			if (phone) {
				uni.makePhoneCall({
					phoneNumber: phone,
					fail: () => {
						showToast(this.i18n.t('orderDetail.callFailed'))
					}
				})
			} else {
				showToast(this.i18n.t('orderDetail.noStoreContact'))
			}
		},

		handleReorder() {
			if (this.orderData.items && this.orderData.items.length > 0) {
				const products = this.orderData.items.map(item => ({
					id: item.id,
					name: item.item_name,
					price: item.unit_price,
					image: fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg',
					quantity: item.quantity,
					store_id: this.orderData.store_id || this.orderData.shop_id || ''
				}))
				const shopId = this.orderData.store_id || this.orderData.shop_id || ''
				const shopIdParam = shopId ? `&shopId=${shopId}` : ''
				uni.navigateTo({
					url: `/pages/checkout/index?orderType=dinein&products=${encodeURIComponent(JSON.stringify(products))}${shopIdParam}`
				})
			} else {
				uni.navigateTo({
					url: '/pages/dinein/index'
				})
			}
		}
	}
}
</script>

<style scoped>
.order-detail-page {
	min-height: 100vh;
	background-color: #FFFFFF;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #FFFFFF;
}

.nav-bar {
	height: 44px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	border-bottom: 1px solid #F3F3F3;
}

.nav-back {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 24px;
	height: 24px;
}

.nav-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}

.nav-right {
	width: 32px;
}

.loading-state {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-text {
	font-size: 14px;
	color: #949494;
}

.content-scroll {
	flex: 1;
	background-color: #F3F3F3;
}

.status-section {
	padding: 10px 16px;
}

.status-card {
	background-color: #FFFFFF;
	border-radius: 8px;
	padding: 16px;
	display: flex;
	align-items: center;
}

.status-icon-wrapper {
	margin-right: 12px;
}

.status-icon {
	width: 40px;
	height: 40px;
}

.status-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.status-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}

.status-desc {
	font-size: 12px;
	color: #00000099;
}

.section-card {
	background-color: #FFFFFF;
	border-radius: 8px;
	margin: 0 16px;
	padding: 10px 16px;
}

.section-title {
	padding: 10px 0;
}

.title-text {
	font-size: 14px;
	font-weight: 700;
	color: #000000CC;
}

.delivery-header, .shop-header {
	display: flex;
	align-items: flex-start;
}

.delivery-icon, .shop-icon {
	width: 20px;
	height: 20px;
	margin-right: 12px;
	margin-top: 2px;
}

.delivery-info, .shop-info {
	flex: 1;
}

.delivery-user {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 4px;
}

.user-name {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
}

.user-phone {
	font-size: 14px;
	color: #00000099;
}

.delivery-address, .shop-address {
	font-size: 12px;
	color: #00000099;
}

.carrier-info {
	margin-top: 6px;
}

.carrier-text {
	font-size: 12px;
	color: #1890FF;
}

.shop-name {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
	margin-bottom: 4px;
	display: block;
}

.divider {
	height: 6px;
	background-color: #F3F3F3;
}

.products-section {
	padding-top: 10px;
}

.products-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.product-item {
	display: flex;
	align-items: center;
}

.product-image {
	width: 56px;
	height: 56px;
	border-radius: 8px;
	margin-right: 10px;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 4px;
}

.product-name {
	font-size: 12px;
	color: #000000CC;
}

.product-specs {
	display: flex;
}

.specs-text {
	font-size: 11px;
	color: #949494;
}

.product-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.product-price {
	font-size: 12px;
	font-weight: 500;
	color: #000000CC;
}

.product-quantity {
	font-size: 12px;
	color: #00000099;
}

.room-section {
		padding-top: 10px;
	}

	.room-info-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.room-info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.room-label {
		font-size: 12px;
		color: #00000099;
	}

	.room-value {
		font-size: 12px;
		color: #000000CC;
		font-weight: 500;
	}

	.order-type-section {
	padding-top: 10px;
}

.order-type-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.order-type-label {
	font-size: 12px;
	color: #00000099;
}

.order-type-value {
	font-size: 12px;
	color: #F2B131;
	font-weight: 500;
}

.product-subtotal {
	font-size: 11px;
	color: #00000099;
	margin-left: 8px;
}

.info-section {
	padding-top: 10px;
}

.info-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.info-label {
	font-size: 12px;
	color: #00000099;
}

.info-value {
	font-size: 12px;
	color: #000000CC;
}

.info-value.discount {
	color: #DA3300;
}

.info-value.total {
	font-size: 16px;
	font-weight: 700;
	color: #DA3300;
}

.total-row {
	padding-top: 10px;
	border-top: 1px solid #F3F3F3;
}

.bottom-placeholder {
	height: 20px;
}

.bottom-bar {
	position: fixed;
	bottom: 50px;
	left: 0;
	right: 0;
	height: 64px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16px;
	padding: 0 16px;
}

.action-btn {
	flex: 1;
	height: 44px;
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.contact-btn {
	background-color: #F3F3F3;
}

.contact-btn .action-btn-text {
	color: #000000CC;
}

.reorder-btn {
	background-color: #F2B131;
}

.reorder-btn .action-btn-text {
	color: #FFFFFF;
}

.action-btn-text {
	font-size: 14px;
	font-weight: 500;
}
</style>
