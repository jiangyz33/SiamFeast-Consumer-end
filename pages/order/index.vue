<template>
	<view class="order-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 页面标题 -->
		<view class="page-header">
			<text class="page-title">{{ i18n.t("order.title") }}</text>
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
							<image class="shop-icon" :src="order.store_logo || '/static/images/store-placeholder.svg'" mode="aspectFill"></image>
							<text class="shop-name">{{ order.store_name_loc || order.store_name || order.order_type_text }}</text>
							<text class="order-type-tag" v-if="order.order_type && order.order_type !== 'DINE_IN'">{{ formatOrderType(order.order_type) }}</text>
						</view>
						<text class="order-status" :style="{ color: getStatusColor(order.status) }">{{ statusText(order.status) }}</text>
					</view>

					<!-- 订单摘要 -->
					<view class="order-summary">
						<text class="summary-text">{{ i18n.t("order.orderNoLabel") }}：{{ order.order_no }}</text>
						<text class="summary-text">{{ formatTime(order.created_at) }}</text>
					<text class="summary-text coins" v-if="order.coins_used">{{ i18n.t("order.coinsUsed", { n: order.coins_used }) }}</text>
					</view>

					<!-- 订单底部 -->
					<view class="order-footer">
						<view class="order-total">
							<text class="total-label">{{ i18n.t("order.actualPay") }}</text>
							<text class="total-price">฿{{ order.total_amount }}</text>
						</view>
						<view class="order-actions">
							<view class="action-btn" v-if="order.status === 'PENDING_PAYMENT'" @click.stop="handlePay(order)">
								<text class="action-text primary">{{ i18n.t("order.goPay") }}</text>
							</view>
							<view class="action-btn" v-if="order.status === 'COMPLETED'" @click.stop="handleReorder(order)">
								<text class="action-text">{{ i18n.t("order.reorder") }}</text>
							</view>
							<view class="action-btn" @click.stop="handleOrderClick(order)">
								<text class="action-text">{{ i18n.t("order.viewDetail") }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-tip" v-if="filteredOrders.length > 0">
				<text v-if="loading" class="tip-text">{{ i18n.t("common.loading") }}</text>
				<text v-else-if="noMore" class="tip-text">{{ i18n.t("order.noMore") }}</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && filteredOrders.length === 0">
				<image class="empty-icon" src="/static/images/empty-order.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ i18n.t("common.empty.order") }}</text>
				<text class="empty-desc">{{ i18n.t("common.empty.orderDesc") }}</text>
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
import { showToast, fixMinioUrl } from '@/utils/index.js'
import { getUserOrders, getOrderDetail } from '@/api/services/order.js'
import { getStore } from '@/api/services/store.js'
import { createPayment } from '@/api/services/payment.js'

import i18n from '@/i18n/index.js'

const STATUS_COLORS = {
		'PENDING_PAYMENT': '#F2B131',
		'PAID': '#1890FF',
		'PREPARING': '#1890FF',
		'READY': '#52C41A',
		'COMPLETED': '#52C41A',
		'CANCELLED': '#999999'
	}

	const STATUS_I18N_KEYS = {
		'PENDING_PAYMENT': 'order.pending',
		'PAID': 'order.paid',
		'PREPARING': 'order.preparing',
		'READY': 'order.ready',
		'COMPLETED': 'order.completed',
		'CANCELLED': 'order.cancelled'
	}

const ORDER_TYPE_I18N = {
		'SINEFOOD_NOODLE': 'order.seafoodNoodle',
		'HOTPOT': 'order.hotpot',
		'MALATANG': 'order.malatang',
		'BBQ': 'order.hotpot',
		'SEAFOOD_NOODLE': 'order.seafoodNoodle',
		'DINE_IN': 'order.dineIn',
		'TAKEAWAY': 'order.takeaway',
		'DELIVERY': 'order.delivery'
	}

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			i18n: i18n,
			tabs: [],
			statusBarHeight: 20,
			contentHeight: 500,
			activeTab: 0,
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
			uni.$emit('tabbarUpdate')
			this.initTabs()
		this.offset = 0
		this.loadOrders()
	},
	methods: {
		initTabs() {
				this.tabs = [
					{ id: 'all', name: this.i18n.t('order.all') },
					{ id: 'pending', name: this.i18n.t('order.pending') },
					{ id: 'processing', name: this.i18n.t('order.processing') },
					{ id: 'completed', name: this.i18n.t('order.completed') }
				]
			},

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
					// Collect unique store_ids
					const storeIds = [...new Set(rawItems.map(o => o.store_id).filter(Boolean))]
					const storeMap = {}
					await Promise.allSettled(storeIds.map(id =>
						getStore(id).then(r => { if (r.code === 0 && r.data) storeMap[id] = r.data })
					))
					const items = rawItems.map((o, idx) => {
						const detail = details[idx]?.status === 'fulfilled' ? details[idx].value?.data : null
						const storeName = detail?.extra_data?.store_name || ''
						const firstItem = detail?.items?.[0]
						const orderLabel = storeName || (firstItem ? firstItem.item_name : o.order_type || '')
						const storeInfo = storeMap[o.store_id]
						const lang = i18n.getLanguage()
						return {
							...o,
							order_type_text: orderLabel,
							detail_items: detail?.items || [],
							store_logo: fixMinioUrl(storeInfo?.logo_url || storeInfo?.logo) || '',
							store_name_loc: storeInfo ? (storeInfo["name_" + lang] || storeInfo.name) : ''
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
				console.error(this.i18n.t('order.loadFailed'), e)
			} finally {
				this.loading = false
			}
		},

		getStatusColor(status) {
			return STATUS_COLORS[status] || '#999999'
		},

		statusText(status) {
			return i18n.t(STATUS_I18N_KEYS[status] || '') || status
		},

			formatOrderType(type) {
				return i18n.t(ORDER_TYPE_I18N[type] || '') || type || ''
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
					showToast(this.i18n.t('order.paySuccess'))
					this.offset = 0
					this.loadOrders()
				} else {
					showToast(res.message || this.i18n.t('order.payFailed'))
				}
			} catch (e) {
				console.error('Payment error:', e)
				showToast(this.i18n.t('order.payRetry'))
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
					name: item.item_name_en && i18n.getLanguage() !== "zh" ? (i18n.getLanguage() === "th" ? (item.item_name_th || item.item_name_en || item.item_name) : (item.item_name_en || item.item_name)) : item.item_name,
					price: item.unit_price,
					image: fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg',
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
