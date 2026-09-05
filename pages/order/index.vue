<template>
	<view class="order-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 页面标题 -->
		<view class="page-header">
			<text class="page-title">{{ t("order.title") }}</text>
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

		<!-- 普通订单列表 -->
		<scroll-view v-if="!(tabs[activeTab] && tabs[activeTab].id === 'exchange')" class="order-list" scroll-y :style="{ height: contentHeight + 'px' }" @scrolltolower="loadMore">
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
							<text class="shop-name">{{ shopNameOf(order) }}</text>
							<!-- 订单类型 tag 暂不显示（后端字段就绪，文案待定），保留 orderTypeTextOf 方法，恢复显示时改 v-if 即可 -->
							<text class="order-type-tag" v-if="false && orderTypeTextOf(order)">{{ orderTypeTextOf(order) }}</text>
						</view>
						<text class="order-status" :style="{ color: getStatusColor(order.status) }">{{ statusText(order.status) }}</text>
					</view>

					<!-- 订单摘要 -->
					<view class="order-summary">
						<text class="summary-text">{{ t("order.orderNoLabel") }}：{{ order.order_no }}</text>
						<text class="summary-text">{{ formatTime(order.created_at) }}</text>
						<text class="summary-text coins" v-if="order.coins_used">{{ t("order.coinsUsed", { n: order.coins_used }) }}</text>
					</view>

					<!-- 订单底部 -->
					<view class="order-footer">
						<view class="order-total">
							<text class="total-label">{{ t("order.actualPay") }}</text>
							<text class="total-price">฿{{ order.total_amount }}</text>
						</view>
						<view class="order-actions">
							<view class="action-btn" v-if="order.status === 'PENDING_PAYMENT'" @click.stop="handlePay(order)">
								<text class="action-text primary">{{ t("order.goPay") }}</text>
							</view>
							<view class="action-btn" v-if="ORDERING_ENABLED && ['PAID', 'PREPARING', 'READY', 'COMPLETED'].includes(order.status)" @click.stop="handleReorder(order)">
								<text class="action-text">{{ t("order.reorder") }}</text>
							</view>
							<view class="action-btn" @click.stop="handleOrderClick(order)">
								<text class="action-text">{{ t("order.viewDetail") }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-tip" v-if="filteredOrders.length > 0">
				<text v-if="loading" class="tip-text">{{ t("common.loading") }}</text>
				<text v-else-if="noMore" class="tip-text">{{ t("order.noMore") }}</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && filteredOrders.length === 0">
				<image class="empty-icon" src="/static/images/empty-order.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ t("common.empty.order") }}</text>
				<text class="empty-desc">{{ t("common.empty.orderDesc") }}</text>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 兑换订单列表 -->
		<scroll-view v-if="tabs[activeTab] && tabs[activeTab].id === 'exchange'" class="order-list" scroll-y :style="{ height: contentHeight + 'px' }" @scrolltolower="loadMore">
			<view v-if="exchangeOrders.length > 0">
				<view class="order-card" v-for="order in exchangeOrders" :key="order.id">
					<view class="order-header">
						<view class="shop-info">
							<image class="shop-icon" :src="fixMinioUrl(order.product_image) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
							<text class="shop-name">{{ exchangeProductName(order) }}</text>
							<text class="order-type-tag" v-if="order.exchange_type">{{ exchangeTypeText(order.exchange_type) }}</text>
						</view>
						<text class="order-status" :style="{ color: exchangeStatusColor(order.status) }">{{ exchangeStatusText(order.status) }}</text>
					</view>
					<view class="order-summary">
						<text class="summary-text">{{ t('order.exchangeCost') }}：{{ exchangeCostText(order) }}</text>
						<text class="summary-text">{{ formatTime(order.created_at) }}</text>
					</view>
					<view class="order-footer">
						<view class="order-total">
							<text class="summary-text">{{ t('order.exchangeOrder') }} #{{ order.id }}</text>
						</view>
						<view class="order-actions">
							<view v-if="['PENDING', 'PENDING_REDEEM', 'DELIVERED'].includes(order.status)" class="action-btn action-primary" @click.stop="showExchangeQR(order)">
								<text class="action-text primary">{{ t('order.viewCode') }}</text>
							</view>
							<view class="action-btn" @click.stop="handleExchangeDetail(order)">
								<text class="action-text">{{ t('order.viewDetail') }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="loading-tip" v-if="exchangeLoading && exchangeOrders.length === 0">
				<text class="tip-text">{{ t('common.loading') }}</text>
			</view>
			<view class="loading-tip" v-if="exchangeOrders.length > 0">
				<text v-if="exchangeLoading" class="tip-text">{{ t('common.loading') }}</text>
				<text v-else-if="exchangeNoMore" class="tip-text">{{ t('order.noMore') }}</text>
			</view>
			<view class="empty-state" v-if="!exchangeLoading && exchangeOrders.length === 0">
				<image class="empty-icon" src="/static/images/empty-order.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ t('common.empty.order') }}</text>
			</view>
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
import { getMallOrders } from '@/api/services/member.js'
import { getStore } from '@/api/services/store.js'
import { ORDERING_ENABLED } from '@/utils/featureFlags.js'
import { createPayment } from '@/api/services/payment.js'

import i18n from '@/i18n/index.js'

const STATUS_COLORS = {
	'PENDING_PAYMENT': '#F2B131',
	// 业务简化：先吃后付，付款 = 完成。PAID/PREPARING/READY 都归到"已完成"显示
	'PAID': '#52C41A',
	'PREPARING': '#52C41A',
	'READY': '#52C41A',
	'COMPLETED': '#52C41A',
	'CANCELLED': '#999999'
}

const STATUS_I18N_KEYS = {
	'PENDING_PAYMENT': 'order.pending',
	// 业务简化：PAID/PREPARING/READY 都显示为"已完成"
	'PAID': 'order.completed',
	'PREPARING': 'order.completed',
	'READY': 'order.completed',
	'COMPLETED': 'order.completed',
	'CANCELLED': 'order.cancelled'
}

// 订单类型由后端下发多语言字段：order_type_name(_en|_th)。
// 前端按当前语言取；后端未补字段时不显示 tag。

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			i18n: i18n,
			ORDERING_ENABLED: ORDERING_ENABLED,
			tabs: [],
			statusBarHeight: 20,
			contentHeight: 500,
			activeTab: 0,
			orders: [],
			loading: false,
			noMore: false,
			offset: 0,
			exchangeOrders: [],
			exchangeLoading: false,
			exchangePage: 1,
			exchangeNoMore: false,
			langVersion: 0
		}
	},
	computed: {
		filteredOrders() {
			// 「兑换订单」tab：return []（数据从 exchangeOrders 取）
			if (this.tabs[this.activeTab]?.id === 'exchange') return []
			if (this.activeTab === 0) {
				return this.orders
			}
			// tab 顺序：0=全部 1=待付款 2=已完成 3=兑换
			// 「已完成」包含 PAID/PREPARING/READY/COMPLETED（业务简化：付款即完成）
			const statusMap = {
				1: ['PENDING_PAYMENT'],
				2: ['PAID', 'PREPARING', 'READY', 'COMPLETED']
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
		uni.$on('languageChanged', this.onLanguageChanged)
	},
	onUnload() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},
	onShow() {
		// #ifdef APP-PLUS
		try { uni.hideTabBar({ animation: false }) } catch(e) {}
		// #endif
		uni.$emit('tabbarUpdate')
		this.initTabs()
		this.offset = 0
		this.loadOrders()
		if (this.tabs[this.activeTab] && this.tabs[this.activeTab].id === 'exchange') this.loadExchangeOrders()
	},
	methods: {
		// 关键：读一下 langVersion 让模板建立响应式依赖，切语言时所有 i18n.t 才会重新求值
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},

		initTabs() {
			this.tabs = [
				{ id: 'all', name: this.i18n.t('order.all') },
				{ id: 'pending', name: this.i18n.t('order.pending') },
				// 移除"已支付"tab：业务简化，付款 = 完成
				{ id: 'completed', name: this.i18n.t('order.completed') },
				{ id: 'exchange', name: this.i18n.t('order.exchangeOrders') }
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
					const detailPromises = rawItems.map(o =>
						getOrderDetail(o.id, {}, { silent: true }).catch(() => null)
					)
					const details = await Promise.allSettled(detailPromises)
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
							// 保存所有语言版本的店名，让模板切语言时实时切换
							store_name: storeInfo?.name || storeName || '',
							store_name_zh: storeInfo?.name_zh || storeInfo?.name || '',
							store_name_en: storeInfo?.name_en || storeInfo?.name || '',
							store_name_th: storeInfo?.name_th || storeInfo?.name || '',
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

		// 订单类型文本：按当前语言取后端下发的 order_type_name_<lang>
		orderTypeTextOf(order) {
			void this.langVersion
			if (!order) return ''
			const lang = i18n.getLanguage()
			return order['order_type_name_' + lang] || order.order_type_name || ''
		},

		shopNameOf(order) {
			// 读 langVersion 触发响应式依赖（切语言时重新求值）
			void this.langVersion
			if (!order) return ''
			const lang = i18n.getLanguage()
			// 订单对象上的多语言快照（extra_data 里的多语言字段）+ 门店缓存里的 name_<lang>
			return order['store_name_' + lang]
				|| order.store_name_loc
				|| order['store_name']
				|| order.order_type_text
				|| ''
		},

		formatTime(timeStr) {
			if (!timeStr) return ''
			const d = new Date(timeStr)
			const pad = n => String(n).padStart(2, '0')
			return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
		},

		switchTab(index) {
			this.activeTab = index
			if (this.tabs[index] && this.tabs[index].id === 'exchange') this.loadExchangeOrders()
		},

		loadMore() {
			if (this.tabs[this.activeTab] && this.tabs[this.activeTab].id === 'exchange') {
				if (this.exchangeNoMore || this.exchangeLoading) return
				return this.loadExchangeOrders(true)
			}
			if (this.noMore || this.loading) return
			this.loadOrders(true)
		},

		handleOrderClick(order) {
			uni.navigateTo({
				url: `/pages/order-detail/index?orderId=${order.id}`
			})
		},

		// === 兑换订单相关 ===

		async loadExchangeOrders(append = false) {
			if (this.exchangeLoading) return
			this.exchangeLoading = true
			try {
				const page = append ? this.exchangePage + 1 : 1
				const res = await getMallOrders({ page, page_size: 20 })
				console.log('[exchange-orders] response:', JSON.stringify(res).substring(0, 500))
				let items = []
				if (res && res.code === 0 && res.data) {
					const d = res.data
					if (Array.isArray(d)) {
						items = d
					} else if (Array.isArray(d.items)) {
						items = d.items
					} else if (Array.isArray(d.list)) {
						items = d.list
					} else if (Array.isArray(d.orders)) {
						items = d.orders
					}
					if (!append) this.exchangeNoMore = items.length < 20
				}
				if (append) {
					this.exchangeOrders = [...this.exchangeOrders, ...items]
				} else {
					this.exchangeOrders = items
				}
				this.exchangePage = page
				this.exchangeNoMore = items.length < 20
			} catch (e) {
				console.error('[exchange-orders] load error:', e)
			} finally {
				this.exchangeLoading = false
			}
		},

		exchangeTypeText(type) {
			if (type === 'COIN') return this.i18n.t('order.coinExchange')
			if (type === 'POINT') return this.i18n.t('order.pointExchange')
			return ''
		},

		fixMinioUrl,

		// 格式化 pickup_time 给 exchange-success 页显示用（ISO 8601 → YYYY-MM-DD HH:mm）
		formatPickupTimeForDisplay(t) {
			if (!t) return ''
			try {
				const s = String(t).replace('T', ' ')
				return s.substring(0, 16)
			} catch (e) { return '' }
		},

		showExchangeQR(order) {
			// 同 handleExchangeDetail：传所有语言的 product_name + 提货门店/时间
			const params = [
				`exchangeId=${order.id}`,
				`uniqueCode=${encodeURIComponent(order.unique_code || '')}`,
				`productName=${encodeURIComponent(order.product_name || '')}`,
				`productNameEn=${encodeURIComponent(order.product_name_en || '')}`,
				`productNameTh=${encodeURIComponent(order.product_name_th || '')}`,
				`productImage=${encodeURIComponent(order.product_image || '')}`,
				`quantity=${order.quantity || 1}`,
				`exchangeType=${order.exchange_type || ''}`,
				`coinCost=${order.coin_cost || 0}`,
				`storeName=${encodeURIComponent(order.store_name || '')}`,
				`storeNameEn=${encodeURIComponent(order.store_name_en || '')}`,
				`storeNameTh=${encodeURIComponent(order.store_name_th || '')}`,
				`pickupTime=${encodeURIComponent(this.formatPickupTimeForDisplay(order.pickup_time))}`
			].join('&')
			uni.navigateTo({
				url: `/pages/exchange-success/index?${params}`
			})
		},

		handleExchangeDetail(order) {
			// 把所有语言的 product_name 都传给详情页，让详情页能跟随语言切换
			const params = [
				`exchangeId=${order.id}`,
				`uniqueCode=${encodeURIComponent(order.unique_code || '')}`,
				`productName=${encodeURIComponent(order.product_name || '')}`,
				`productNameEn=${encodeURIComponent(order.product_name_en || '')}`,
				`productNameTh=${encodeURIComponent(order.product_name_th || '')}`,
				`productImage=${encodeURIComponent(order.product_image || '')}`,
				`quantity=${order.quantity || 1}`,
				`exchangeType=${order.exchange_type || ''}`,
				`coinCost=${order.coin_cost || 0}`,
				`storeName=${encodeURIComponent(order.store_name || '')}`,
				`storeNameEn=${encodeURIComponent(order.store_name_en || '')}`,
				`storeNameTh=${encodeURIComponent(order.store_name_th || '')}`,
				`pickupTime=${encodeURIComponent(this.formatPickupTimeForDisplay(order.pickup_time))}`
			].join('&')
			uni.navigateTo({
				url: `/pages/exchange-success/index?${params}`
			})
		},

		exchangeStatusText(status) {
			const map = {
				PENDING: this.i18n.t('order.exchangePending'),
				PENDING_REDEEM: this.i18n.t('order.exchangePending'),
				REDEEMED: this.i18n.t('order.exchangeRedeemed'),
				EXPIRED: this.i18n.t('order.exchangeExpired'),
				CANCELLED: this.i18n.t('order.cancelled')
			}
			return map[status] || status
		},

		exchangeStatusColor(status) {
			const map = { PENDING: '#F2B131', PENDING_REDEEM: '#F2B131', SHIPPED: '#1890FF', DELIVERED: '#F2B131', REDEEMED: '#52C41A', EXPIRED: '#999', CANCELLED: '#999' }
			return map[status] || '#999'
		},

		exchangeProductName(order) {
			void this.langVersion
			if (!order) return '-'
			const lang = i18n.getLanguage()
			return order['product_name_' + lang] || order.product_name || '-'
		},

		onLanguageChanged() {
			this.langVersion++
			this.initTabs()
		},

		exchangeCostText(order) {
			const cost = Number(order.coin_cost || order.points_cost || 0) || 0
			if (order.exchange_type === 'COIN') {
				return this.i18n.t("order.exchangeCoins", { n: cost })
			}
			return this.i18n.t("order.exchangePoints", { n: cost })
		},

		async handlePay(order) {
			// 跳转到支付页（展示二维码让收银员扫码）
			// 不直接调 createPayment — 现金/POS 支付由收银端扫码后端确认
			const orderNo = order.order_no || ''
			const totalAmount = order.total_amount || 0
			const uniqueCode = order.unique_code || ''
			uni.navigateTo({
				url: `/pages/payment-success/index?orderId=${order.id}&orderNo=${encodeURIComponent(orderNo)}&totalAmount=${totalAmount}&uniqueCode=${encodeURIComponent(uniqueCode)}&orderType=dinein`
			})
		},

		handleReorder(order) {
			if (order.detail_items && order.detail_items.length > 0) {
				const products = order.detail_items.map(item => ({
					id: item.item_id || item.id,
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

.action-primary {
	border-color: #F2B131 !important;
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

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}

</style>
