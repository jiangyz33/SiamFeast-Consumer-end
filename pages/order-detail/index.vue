<template>
	<view class="order-detail-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">订单详情</text>
			<view class="nav-right"></view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-state" v-if="loading">
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 内容区域 -->
		<scroll-view v-else class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 订单状态 -->
			<view class="status-section">
				<view class="status-card">
					<view class="status-icon-wrapper">
						<image class="status-icon" src="/static/logo.png" mode="aspectFit"></image>
					</view>
					<view class="status-info">
						<text class="status-title">{{ statusText }}</text>
						<text class="status-desc" v-if="deliveryInfo && deliveryInfo.estimated_time">
							预计{{ deliveryInfo.estimated_time }}分钟送达
						</text>
						<text class="status-desc" v-else-if="orderData.table_number">
							桌号：{{ orderData.table_number }}
						</text>
					</view>
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
							<text class="shop-name">{{ orderData.extra_data.store_name }}</text>
							<text class="shop-address" v-if="orderData.extra_data.store_address">{{ orderData.extra_data.store_address }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 订单类型 -->
			<view class="order-type-section" v-if="orderData.order_type">
				<view class="section-card">
					<view class="order-type-row">
						<text class="order-type-label">订单类型</text>
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
						<text class="title-text">商品信息</text>
					</view>
					<view class="products-list">
						<view class="product-item" v-for="(item, index) in orderData.items" :key="index">
							<image class="product-image" :src="item.image_url || '/static/logo.png'" mode="aspectFill"></image>
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
						<text class="title-text">费用明细</text>
					</view>
					<view class="info-list">
						<view class="info-row">
							<text class="info-label">商品小计</text>
							<text class="info-value">฿{{ orderData.subtotal || 0 }}</text>
						</view>
						<view class="info-row" v-if="orderData.discount_amount > 0">
							<text class="info-label">优惠减免</text>
							<text class="info-value discount">-฿{{ orderData.discount_amount }}</text>
						</view>
							<view class="info-row" v-if="orderData.coin_deduct_amount > 0">
								<text class="info-label">金币抵扣</text>
								<text class="info-value discount">-฿{{ orderData.coin_deduct_amount }}<text v-if="orderData.coins_used"> ({{ orderData.coins_used }}个金币)</text></text>
							</view>
							<view class="info-row" v-if="memberSettlement && memberSettlement.coins_earned > 0">
								<text class="info-label">获得金币</text>
								<text class="info-value">+{{ memberSettlement.coins_earned }}个</text>
							</view>
							<view class="info-row" v-if="memberSettlement && memberSettlement.points_earned > 0">
								<text class="info-label">获得积分</text>
								<text class="info-value">+{{ memberSettlement.points_earned }}分</text>
							</view>
						<view class="info-row total-row">
							<text class="info-label">实付金额</text>
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
						<text class="title-text">订单信息</text>
					</view>
					<view class="info-list">
						<view class="info-row">
							<text class="info-label">订单编号</text>
							<text class="info-value">{{ orderData.order_no }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">下单时间</text>
							<text class="info-value">{{ formatTime(orderData.created_at) }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">订单类型</text>
							<text class="info-value">{{ formatOrderSource(orderData.order_source) }}</text>
						</view>
						<view class="info-row" v-if="orderData.remark">
							<text class="info-label">备注</text>
							<text class="info-value">{{ orderData.remark }}</text>
						</view>
						<view class="info-row" v-if="orderData.payment_method">
							<text class="info-label">支付方式</text>
							<text class="info-value">{{ formatPaymentMethod(orderData.payment_method) }}</text>
						</view>
						<view class="info-row" v-if="orderData.paid_at">
							<text class="info-label">支付时间</text>
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
				<text class="action-btn-text">联系商家</text>
			</view>
			<view class="action-btn reorder-btn" @click="handleReorder">
				<text class="action-btn-text">再来一单</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getOrderDetail } from '@/api/services/order.js'
import { getOrderDelivery } from '@/api/services/delivery.js'
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'

const STATUS_MAP = {
	'PENDING_PAYMENT': '待支付',
	'PAID': '已支付',
	'PREPARING': '制作中',
	'READY': '待取餐',
	'COMPLETED': '已完成',
	'CANCELLED': '已取消'
}

const PAYMENT_METHOD_MAP = {
	'cash_pos': '现金支付',
	'visa': '信用卡支付',
	'paypal': 'PayPal',
	'coin_deduct': '金币抵扣',
	'coupon': '优惠券支付'
}

const ORDER_TYPE_MAP = {
	'SINEFOOD_NOODLE': '泰式海鲜面',
	'HOTPOT': '火锅',
	'MALATANG': '麻辣烫',
	'BBQ': '烧烤',
	'SEAFOOD_NOODLE': '泰式海鲜面',
	'DINE_IN': '堂食',
	'TAKEAWAY': '外卖',
	'DELIVERY': '配送'
}

const ORDER_SOURCE_MAP = {
	'DINE_IN_SCAN': '扫码点餐',
	'DINE_IN_CASHIER': '柜台点餐',
	'TAKEAWAY': '自提',
	'DELIVERY': '外卖配送'
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
			deliveryInfo: null
		}
	},
	computed: {
		statusText() {
			return STATUS_MAP[this.orderData.status] || this.orderData.status || '未知'
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
				const [orderRes, deliveryRes] = await Promise.allSettled([
					getOrderDetail(this.orderId),
					getOrderDelivery(this.orderId).catch(() => null)
				])

				if (orderRes.status === 'fulfilled' && orderRes.value.code === 0 && orderRes.value.data) {
					this.orderData = orderRes.value.data
				}

				if (deliveryRes.status === 'fulfilled' && deliveryRes.value.code === 0 && deliveryRes.value.data) {
					this.deliveryInfo = deliveryRes.value.data
				}
			} catch (e) {
				console.error('加载订单详情失败:', e)
				showToast('加载失败')
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
			return Object.entries(specs).map(([key, val]) => {
				const label = specLabels[key] || key
				const optionLabel = specOptions[val] || val
				return `${label}：${optionLabel}`
			}).join(' / ')
		},

		formatOrderSource(source) {
			return ORDER_SOURCE_MAP[source] || source || '未知'
		},

		formatPaymentMethod(method) {
			return PAYMENT_METHOD_MAP[method] || method || '未知'
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
			return specs && Object.keys(specs).length > 0
		},

		formatOrderType(type) {
			return ORDER_TYPE_MAP[type] || type || ''
		},

		goBack() {
			uni.navigateBack()
		},

		handleContact() {
			if (this.deliveryInfo && this.deliveryInfo.shop && this.deliveryInfo.shop.phone) {
				uni.makePhoneCall({
					phoneNumber: this.deliveryInfo.shop.phone,
					fail: () => {
						showToast('拨打失败')
					}
				})
			} else {
				showToast('暂无商家联系方式')
			}
		},

		handleReorder() {
			if (this.orderData.items && this.orderData.items.length > 0) {
				const products = this.orderData.items.map(item => ({
					id: item.id,
					name: item.item_name,
					price: item.unit_price,
					image: item.image_url || '/static/logo.png',
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
