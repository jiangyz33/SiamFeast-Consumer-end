<template>
	<view class="order-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 页面标题 -->
		<view class="page-header">
			<text class="page-title">我的订单</text>
		</view>

		<!-- 订单状态Tab -->
		<view class="order-tabs">
			<view
				v-for="(tab, index) in tabs"
				:key="index"
				class="tab-item"
				:class="{ 'tab-active': activeTab === index }"
				@click="switchTab(index)"
			>
				<text class="tab-text">{{ tab.name }}</text>
			</view>
		</view>

		<!-- 订单列表 -->
		<scroll-view class="order-list" scroll-y :style="{ height: contentHeight + 'px' }" @scrolltolower="loadMore">
			<view v-if="filteredOrders.length > 0">
				<view
					class="order-card"
					v-for="order in filteredOrders"
					:key="order.id"
					@click="handleOrderClick(order)"
				>
					<!-- 订单头部 -->
					<view class="order-header">
						<view class="shop-info">
							<image class="shop-icon" src="/static/logo.png" mode="aspectFill"></image>
							<text class="shop-name">{{ order.store_name || order.order_type_text }}</text>
							<text class="order-type-tag" v-if="order.order_type && order.order_type !== 'DINE_IN'">{{ formatOrderType(order.order_type) }}</text>
						</view>
						<text class="order-status" :style="{ color: getStatusColor(order.status) }">{{ statusText(order.status) }}</text>
					</view>

					<!-- 订单摘要 -->
					<view class="order-summary">
						<text class="summary-text">订单号：{{ order.order_no }}</text>
						<text class="summary-text">{{ formatTime(order.created_at) }}</text>
					<text class="summary-text coins" v-if="order.coins_used">使用{{ order.coins_used }}个金币</text>
					</view>

					<!-- 订单底部 -->
					<view class="order-footer">
						<view class="order-total">
							<text class="total-label">实付</text>
							<text class="total-price">฿{{ order.total_amount }}</text>
						</view>
						<view class="order-actions">
							<view class="action-btn" v-if="order.status === 'PENDING_PAYMENT'" @click.stop="handlePay(order)">
								<text class="action-text primary">去支付</text>
							</view>
							<view class="action-btn" v-if="order.status === 'COMPLETED'" @click.stop="handleReorder(order)">
								<text class="action-text">再来一单</text>
							</view>
							<view class="action-btn" @click.stop="handleOrderClick(order)">
								<text class="action-text">查看详情</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-tip" v-if="filteredOrders.length > 0">
				<text v-if="loading" class="tip-text">加载中...</text>
				<text v-else-if="noMore" class="tip-text">没有更多了</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && filteredOrders.length === 0">
				<image class="empty-icon" src="/static/logo.png" mode="aspectFit"></image>
				<text class="empty-text">暂无订单</text>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="1"></custom-tabbar>
	</view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar.vue'
import { showToast } from '@/utils/index.js'
import { getUserOrders, getOrderDetail } from '@/api/services/order.js'
import { createPayment } from '@/api/services/payment.js'

import i18n from '@/i18n/index.js'

const STATUS_MAP = {
	'PENDING_PAYMENT': { text: '待支付', color: '#F2B131' },
	'PAID': { text: '已支付', color: '#1890FF' },
	'PREPARING': { text: '制作中', color: '#1890FF' },
	'READY': { text: '待取餐', color: '#52C41A' },
	'COMPLETED': { text: '已完成', color: '#52C41A' },
	'CANCELLED': { text: '已取消', color: '#999999' }
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

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			activeTab: 0,
			tabs: [
				{ id: 'all', name: '全部' },
				{ id: 'pending', name: '待支付' },
				{ id: 'processing', name: '进行中' },
				{ id: 'completed', name: '已完成' }
			],
			orders: [],
			loading: false,
			noMore: false,
			offset: 0
		}
	},
	computed: {
		filteredOrders() {
			if (this.activeTab === 0) {
				return this.orders
			}
			const statusMap = {
				1: ['PENDING_PAYMENT'],
				2: ['PAID', 'PREPARING', 'READY'],
				3: ['COMPLETED']
			}
			const statuses = statusMap[this.activeTab] || []
			return this.orders.filter(order => statuses.includes(order.status))
		}
	},
	onLoad() {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20
		const headerHeight = 44 + 44
		const tabBarHeight = 63
		const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
		this.contentHeight = systemInfo.windowHeight - headerHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
	},
	onShow() {
		this.offset = 0
		this.loadOrders()
	},
	methods: {
		async loadOrders(append = false) {
			if (this.loading) return
			this.loading = true
			try {
				const params = { limit: 20 }
				if (append) {
					params.offset = this.offset
				}
				const res = await getUserOrders(params)
				if (res.code === 0 && res.data) {
					const rawItems = res.data.items || []
					// Fetch detail for each order to get store info from extra_data
					const detailPromises = rawItems.map(o =>
						getOrderDetail(o.id).catch(() => null)
					)
					const details = await Promise.allSettled(detailPromises)
					const items = rawItems.map((o, idx) => {
						const detail = details[idx]?.status === 'fulfilled' ? details[idx].value?.data : null
						const storeName = detail?.extra_data?.store_name || ''
						const firstItem = detail?.items?.[0]
						const orderLabel = storeName || (firstItem ? firstItem.item_name : o.order_type || '订单')
						return {
							...o,
							order_type_text: orderLabel,
							detail_items: detail?.items || []
						}
					})
					if (append) {
						this.orders = [...this.orders, ...items]
					} else {
						this.orders = items
					}
					this.offset = this.orders.length
					this.noMore = items.length < 20
				}
			} catch (e) {
				console.error('加载订单失败:', e)
			} finally {
				this.loading = false
			}
		},

		getStatusColor(status) {
			return STATUS_MAP[status]?.color || '#999999'
		},

		statusText(status) {
			return STATUS_MAP[status]?.text || status
		},

			formatOrderType(type) {
				return ORDER_TYPE_MAP[type] || type || ''
			},

		formatTime(timeStr) {
			if (!timeStr) return ''
			const d = new Date(timeStr)
			const pad = n => String(n).padStart(2, '0')
			return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
		},

		switchTab(index) {
			this.activeTab = index
		},

		loadMore() {
			if (this.noMore || this.loading) return
			this.loadOrders(true)
		},

		handleOrderClick(order) {
			uni.navigateTo({
				url: `/pages/order-detail/index?orderId=${order.id}`
			})
		},

		async handlePay(order) {
			try {
				const res = await createPayment({
					order_id: order.id,
					amount: order.total_amount,
					payment_method: 'cash_pos'
				})
				if (res.code === 0) {
					showToast('支付成功')
					this.offset = 0
					this.loadOrders()
				} else {
					showToast(res.message || '支付失败')
				}
			} catch (e) {
				console.error('支付失败:', e)
				showToast('支付失败，请重试')
			}
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

		handleReorder(order) {
				if (order.detail_items && order.detail_items.length > 0) {
					const products = order.detail_items.map(item => ({
					id: item.id,
					name: item.item_name,
					price: item.unit_price,
					image: item.image_url || '/static/logo.png',
					quantity: item.quantity,
					store_id: order.store_id || order.shop_id || ''
				}))
				const shopId = order.store_id || order.shop_id || ''
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
.order-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #FFFFFF;
}

.page-header {
	background-color: #FFFFFF;
	padding: 12px 16px;
}

.page-title {
	font-size: 18px;
	font-weight: 700;
	color: #000000CC;
}

/* 订单状态Tab */
.order-tabs {
	display: flex;
	background-color: #FFFFFF;
	padding: 0 16px;
	border-bottom: 1px solid #F3F3F3;
}

.tab-item {
	flex: 1;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.tab-text {
	font-size: 14px;
	color: #00000099;
}

.tab-active .tab-text {
	font-size: 14px;
	font-weight: 700;
	color: #F2B131;
}

/* 订单列表 */
.order-list {
	flex: 1;
}

.order-card {
	background-color: #FFFFFF;
	margin: 10px 16px;
	border-radius: 8px;
	overflow: hidden;
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	border-bottom: 1px solid #F3F3F3;
}

.shop-info {
	display: flex;
	align-items: center;
	gap: 8px;
}

.shop-icon {
	width: 24px;
	height: 24px;
	border-radius: 4px;
}

.shop-name {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
}


.order-type-tag {
	font-size: 10px;
	color: #F2B131;
	background-color: #FFF8E1;
	padding: 2px 6px;
	border-radius: 4px;
	margin-left: 6px;
}

.summary-text.coins {
	color: #F2B131;
}
.order-status {
	font-size: 12px;
	font-weight: 500;
}

.order-products {
	padding: 12px 16px;
}

.order-summary {
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.summary-text {
	font-size: 12px;
	color: #00000099;
}

.product-item {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
}

.product-item:last-child {
	margin-bottom: 0;
}

.product-image {
	width: 48px;
	height: 48px;
	border-radius: 6px;
	margin-right: 10px;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.product-name {
	font-size: 12px;
	color: #000000CC;
}

.product-specs {
	font-size: 10px;
	color: #949494;
}

.product-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.product-price {
	font-size: 12px;
	color: #000000CC;
}

.product-quantity {
	font-size: 12px;
	color: #00000099;
}

.order-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	border-top: 1px solid #F3F3F3;
}

.order-total {
	display: flex;
	align-items: center;
	gap: 4px;
}

.total-label {
	font-size: 12px;
	color: #00000099;
}

.total-price {
	font-size: 14px;
	font-weight: 700;
	color: #DA3300;
}

.order-actions {
	display: flex;
	gap: 10px;
}

.action-btn {
	padding: 6px 12px;
	border-radius: 14px;
	border: 1px solid #E0E0E0;
}

.action-text {
	font-size: 12px;
	color: #00000099;
}

.action-text.primary {
	color: #F2B131;
}

/* 加载提示 */
.loading-tip {
	padding: 16px 0;
	display: flex;
	justify-content: center;
}

.tip-text {
	font-size: 12px;
	color: #949494;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 0;
}

.empty-icon {
	width: 80px;
	height: 80px;
	opacity: 0.5;
	margin-bottom: 16px;
}

.empty-text {
	font-size: 14px;
	color: #00000099;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}
</style>
