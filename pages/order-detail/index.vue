<template>
	<view class="order-detail-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t("orderDetail.title") }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-state" v-if="loading">
			<text class="loading-text">{{ t("orderDetail.loading") }}</text>
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
						<text class="status-desc" v-if="false">
							{{ t("orderDetail.estDelivery", { time: deliveryInfo.estimated_time }) }}
						</text>
						<text class="status-desc" v-else-if="orderData.table_number">
							{{ t("orderDetail.tableNo", { no: orderData.table_number }) }}
						</text>
					</view>
				</view>
			</view>

			
				<!-- 待支付二维码 -->
					<view class="qr-pay-section" v-if="orderData.status === 'PENDING_PAYMENT'">
						<view class="section-card qr-card">
							<image v-if="orderQRImageUrl" class="qr-image" :src="orderQRImageUrl" mode="aspectFit"></image>
							<text class="qr-hint">{{ t('payment.showQR') }}</text>
						</view>
					</view>
					<!-- 配送信息 -->
			<view class="delivery-section" v-if="false">
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
			<!-- 门店信息（优先用 getStore 返回的多语言字段，回退到 extra_data） -->
			<view class="shop-section" v-else-if="displayShopName">
				<view class="section-card">
					<view class="shop-header">
						<image class="shop-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
						<view class="shop-info">
							<text class="shop-name">{{ displayShopName }}</text>
							<text class="shop-address" v-if="displayShopAddress">{{ displayShopAddress }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 订单类型 -->
							<!-- Room info -->
				<view class="room-section" v-if="hostelBooking">
					<view class="section-card">
						<view class="section-title">
							<text class="title-text">{{ t("orderDetail.roomInfo") }}</text>
						</view>
						<view class="room-info-list">
							<view class="room-info-row" v-if="hostelBooking.room_name">
								<text class="room-label">{{ t("orderDetail.roomName") }}</text>
								<text class="room-value">{{ hostelBooking["room_name_" + i18n.getLanguage()] || hostelBooking.room_name }}</text>
							</view>
							<view class="room-info-row" v-if="hostelBooking.room_type">
								<text class="room-label">{{ t("orderDetail.roomType") }}</text>
								<text class="room-value">{{ hostelBooking.room_type }}</text>
							</view>
							<view class="room-info-row" v-if="hostelBooking.check_in">
								<text class="room-label">{{ t("orderDetail.checkInDate") }}</text>
								<text class="room-value">{{ formatDate(hostelBooking.check_in) }}</text>
							</view>
							<view class="room-info-row" v-if="hostelBooking.check_out">
								<text class="room-label">{{ t("orderDetail.checkOutDate") }}</text>
								<text class="room-value">{{ formatDate(hostelBooking.check_out) }}</text>
							</view>
							<view class="room-info-row" v-if="hostelBooking.nights">
								<text class="room-label">{{ t("orderDetail.nightsCount", {n: hostelBooking.nights}) }}</text>
								<text class="room-value" v-if="hostelBooking.guests">{{ t("orderDetail.guestsCount", {n: hostelBooking.guests}) }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 订单类型区暂不显示（后端字段就绪，文案待定），保留 orderTypeText computed，恢复显示时改 v-if 即可 -->
				<view class="order-type-section" v-if="false && orderTypeText">
					<view class="section-card">
						<view class="order-type-row">
						<text class="order-type-label">{{ t("orderDetail.orderTypeLabel") }}</text>
						<text class="order-type-value">{{ orderTypeText }}</text>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 商品列表 -->
			<view class="products-section">
				<view class="section-card">
					<view class="section-title">
						<text class="title-text">{{ t("orderDetail.productInfo") }}</text>
					</view>
					<view class="products-list">
						<view class="product-item" v-for="(item, index) in orderData.items" :key="index">
							<image class="product-image" :src="getItemImage(item)" mode="aspectFill" @error="onImageError($event, item, 'image')"></image>
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
						<text class="title-text">{{ t("orderDetail.feeDetail") }}</text>
					</view>
					<view class="info-list">
						<view class="info-row">
							<text class="info-label">{{ t("orderDetail.subtotal") }}</text>
							<text class="info-value">฿{{ orderData.subtotal || 0 }}</text>
						</view>
						<view class="info-row" v-if="orderData.campaign_discount_amount > 0">
							<text class="info-label">{{ t("orderDetail.campaignDiscount") }}</text>
							<text class="info-value discount">-฿{{ orderData.campaign_discount_amount }}</text>
						</view>
						<view class="info-row" v-if="orderData.discount_amount > 0">
							<text class="info-label">{{ t("orderDetail.discount") }}</text>
							<text class="info-value discount">-฿{{ orderData.discount_amount }}</text>
						</view>
							<view class="info-row" v-if="orderData.coin_deduct_amount > 0">
								<text class="info-label">{{ t("orderDetail.coinDeduct") }}</text>
								<text class="info-value discount">-฿{{ orderData.coin_deduct_amount }}<text v-if="orderData.coins_used"> ({{ t("orderDetail.coinsCount", { n: orderData.coins_used }) }})</text></text>
							</view>
							<view class="info-row" v-if="orderData.rounding_adjustment > 0">
								<text class="info-label">{{ t("orderDetail.rounding") }}</text>
								<text class="info-value discount">-฿{{ orderData.rounding_adjustment }}</text>
							</view>
							<view class="info-row" v-if="memberSettlement && memberSettlement.coins_earned > 0">
								<text class="info-label">{{ t("orderDetail.coinsEarned") }}</text>
								<text class="info-value">{{ t("orderDetail.coinsUnit", { n: memberSettlement.coins_earned }) }}</text>
							</view>
							<view class="info-row" v-if="memberSettlement && memberSettlement.points_earned > 0">
								<text class="info-label">{{ t("orderDetail.pointsEarned") }}</text>
								<text class="info-value">{{ t("orderDetail.pointsUnit", { n: memberSettlement.points_earned }) }}</text>
							</view>
						<view class="info-row total-row">
							<text class="info-label">{{ t("orderDetail.actualPay") }}</text>
							<text class="info-value total">฿{{ orderData.total_amount || 0 }}</text>
						</view>
						<!-- 实际获得的金币/积分 -->
						<view class="info-row reward-earned-row" v-if="orderData.coins_earned > 0 || orderData.points_earned > 0">
							<view class="reward-earned-item" v-if="orderData.coins_earned > 0">
								<text class="reward-earned-icon">🪙</text>
								<text class="reward-earned-text">+{{ orderData.coins_earned }}</text>
							</view>
							<view class="reward-earned-item" v-if="orderData.points_earned > 0">
								<text class="reward-earned-icon">⭐</text>
								<text class="reward-earned-text">+{{ orderData.points_earned }}</text>
							</view>
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
						<text class="title-text">{{ t("orderDetail.orderInfo") }}</text>
					</view>
					<view class="info-list">
						<view class="info-row">
							<text class="info-label">{{ t("orderDetail.orderNo") }}</text>
							<text class="info-value">{{ orderData.order_no }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">{{ t("orderDetail.orderTime") }}</text>
							<text class="info-value">{{ formatTime(orderData.created_at) }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">{{ t("orderDetail.orderSource") }}</text>
							<text class="info-value">{{ formatOrderSource(orderData.order_source) }}</text>
						</view>
						<view class="info-row" v-if="orderData.cashier_name">
							<text class="info-label">{{ t("orderDetail.cashier") }}</text>
							<text class="info-value">{{ orderData.cashier_name }}</text>
						</view>
						<view class="info-row" v-if="pickupStoreName">
							<text class="info-label">{{ t("orderDetail.pickupStore") }}</text>
							<text class="info-value">{{ pickupStoreName }}</text>
						</view>
						<view class="info-row" v-if="orderData.pickup_time">
							<text class="info-label">{{ t("orderDetail.pickupTime") }}</text>
							<text class="info-value">{{ formatPickupTime(orderData.pickup_time) }}</text>
						</view>
						<view class="info-row" v-if="orderData.remark">
							<text class="info-label">{{ t("orderDetail.remark") }}</text>
							<text class="info-value">{{ orderData.remark }}</text>
						</view>
						<!-- 支付方式暂不显示，保留 orderData.payment_method 字段和 formatPaymentMethod 方法，恢复时改 v-if 即可 -->
						<view class="info-row" v-if="false && orderData.payment_method">
							<text class="info-label">{{ t("orderDetail.payMethod") }}</text>
							<text class="info-value">{{ formatPaymentMethod(orderData.payment_method) }}</text>
						</view>
						<view class="info-row" v-if="orderData.paid_at">
							<text class="info-label">{{ t("orderDetail.payTime") }}</text>
							<text class="info-value">{{ formatTime(orderData.paid_at) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部操作栏（再来一单随点餐入口临时下线隐藏，保留联系商家） -->
		<view class="bottom-bar">
			<view class="action-btn contact-btn" @click="handleContact">
				<text class="action-btn-text">{{ t("orderDetail.contactStore") }}</text>
			</view>
			<view class="action-btn reorder-btn" v-if="ORDERING_ENABLED" @click="handleReorder">
				<text class="action-btn-text">{{ t("orderDetail.reorder") }}</text>
			</view>
		</view>
		<canvas canvas-id="qrCanvasOrder" style="position:fixed;left:-9999px;width:200px;height:200px;"></canvas>
	</view>
</template>

<script>
import { getOrderDetail, reorder } from '@/api/services/order.js'
import { getStore } from '@/api/services/store.js'
import { getBooking } from '@/api/services/hostel.js'
import { getConsumerMenuItems } from '@/api/services/menu.js'

import { showToast, fixMinioUrl } from '@/utils/index.js'
import { ORDERING_ENABLED } from '@/utils/featureFlags.js'
import i18n from '@/i18n/index.js'
import { generateQRImage } from '@/utils/qrcode.js'

const STATUS_I18N_KEYS = {
	'PENDING_PAYMENT': 'order.pending',
	// 业务简化：先吃后付，付款 = 完成。PAID/PREPARING/READY 都显示为"已完成"
	'PAID': 'order.completed',
	'PREPARING': 'order.completed',
	'READY': 'order.completed',
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
			ORDERING_ENABLED: ORDERING_ENABLED,
			statusBarHeight: 20,
			contentHeight: 500,
			orderId: '',
			loading: true,
			orderData: {},
			storeInfo: null,
			storePhone: '',
			langVersion: 0,
			deliveryInfo: null,
				hostelBooking: null,
				orderQRImageUrl: ''
		}
	},
	computed: {
		statusText() {
			return i18n.t(STATUS_I18N_KEYS[this.orderData.status] || '') || this.orderData.status || i18n.t('orderDetail.unknown')
		},
		// 订单类型：后端下发多语言字段 order_type_name(_en|_th)，按当前语言取；缺失则不显示
		orderTypeText() {
			void this.langVersion
			const lang = i18n.getLanguage()
			const o = this.orderData || {}
			return o['order_type_name_' + lang] || o.order_type_name || ''
		},
		// 提货门店名(从 extra_data 或 storeInfo 取)
		pickupStoreName() {
			void this.langVersion
			const lang = i18n.getLanguage()
			const extra = this.orderData.extra_data || {}
			// 优先从 extra_data 取
			if (extra['store_name_' + lang]) return extra['store_name_' + lang]
			if (extra.store_name) return extra.store_name
			// 从 storeInfo 取
			const s = this.storeInfo
			if (s) return s['name_' + lang] || s.name || ''
			return ''
		},
		memberSettlement() {
			const extra = this.orderData.extra_data
			if (extra && extra.member_settlement) {
				return extra.member_settlement
			}
			return null
		},
		displayShopName() {
			void this.langVersion
			const lang = i18n.getLanguage()
			const s = this.storeInfo
			if (s) {
				return s['name_' + lang] || s.name || ''
			}
			const extra = this.orderData.extra_data || {}
			return extra['store_name_' + lang] || extra.store_name || ''
		},
		displayShopAddress() {
			void this.langVersion
			const lang = i18n.getLanguage()
			const s = this.storeInfo
			if (s) {
				return s['formatted_address_' + lang] || s.formatted_address
					|| s['address_' + lang] || s.address || ''
			}
			const extra = this.orderData.extra_data || {}
			return extra['store_address_' + lang] || extra.store_address || ''
		}
	},
	onLoad(options) {
		if (options.orderId) {
			this.orderId = options.orderId
		}
		this.initPage()
		this.loadOrderDetail()
		uni.$on('languageChanged', this.onLanguageChanged)
	},
	onUnload() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},
	methods: {
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		fixMinioUrl,
		onLanguageChanged() {
			this.langVersion++
		},
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const bottomBarHeight = 64
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			// 该页面没有 tabbar（原生 tabBar 在 H5 端已 hide，APP 端也隐藏），bottom-bar 直接贴底
			// scroll-view 高度减去 bottom-bar 高度 + safe-area，避免最后内容被遮
			this.contentHeight = systemInfo.windowHeight - navBarHeight - bottomBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadOrderDetail() {
			this.loading = true
			try {
				const [orderRes] = await Promise.allSettled([
					getOrderDetail(this.orderId)
				])

				if (orderRes.status === 'fulfilled' && orderRes.value.code === 0 && orderRes.value.data) {
					const dd = orderRes.value.data; if (dd.order && dd.items) { this.orderData = { ...dd.order, items: dd.items } } else { this.orderData = dd }
					// 诊断：打印首个 item 的所有字段，方便确认后端返回的图片字段名
					if (this.orderData.items && this.orderData.items[0]) {
						// debug cleared
					}

					// Read pickup code from localStorage
					
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
								this.storeInfo = sRes.data
								this.storePhone = sRes.data.phone || ''
							}
						} catch(e) {}
						// 后端 order_items 不存图片，从门店菜单反查 item_id → image_url
						await this.enrichItemsWithMenuImages(sid)
					}
				// Generate QR for pending payment orders
				if (this.orderData.status === 'PENDING_PAYMENT') {
					this.generateOrderQR()
				}
			}
			} catch(e) {
				console.error('Load order detail failed:', e)
			} finally {
				this.loading = false
			}
		},

		async generateOrderQR() {
			const qrData = this.orderData.unique_code
			if (!qrData) return
			try {
				this.orderQRImageUrl = await generateQRImage(qrData, { size: 180, canvasId: 'qrCanvasOrder', componentInstance: this })
			} catch (err) {
				console.error('[order-detail] generateQR error:', err)
			}
		},

		formatTime(timeStr) {
			if (!timeStr) return ''
			return timeStr.replace('T', ' ').substring(0, 19)
		},

		formatPickupTime(timeStr) {
			if (!timeStr) return ''
			// 格式:2026-07-27T09:00:00+07:00 → 2026-07-27 09:00
			return timeStr.replace('T', ' ').substring(0, 16)
		},

		formatSpecs(specs) {
			if (!specs) return ''
			const lang = i18n.state.language
			const langMessages = i18n.state.messages[lang] || {}
			const specLabels = (langMessages.productDetail && langMessages.productDetail.specLabels) || {}
			const specOptions = (langMessages.productDetail && langMessages.productDetail.specOptions) || {}
			const skipKeys = ['pricing', 'remark', 'topping_ids', 'quantity', 'group_price', 'original_price', 'group_buy_item_id', 'is_group_buy']
			const normalizeVal = (v) => {
				if (v === null || v === undefined || v === '') return ''
				if (Array.isArray(v)) {
					return v.map(normalizeVal).filter(Boolean).join(', ')
				}
				if (typeof v === 'object') {
					// {id, name, price_diff} → name；兼容旧字段
					return v.name || v.label || v.value || ''
				}
				return specOptions[v] || v
			}
			return Object.entries(specs)
				.filter(([k, v]) => {
					if (skipKeys.includes(k)) return false
					if (v === null || v === undefined || v === '') return false
					if (Array.isArray(v)) return v.length > 0
					if (typeof v === 'object') return !!(v.name || v.label || v.value)
					return true
				})
				.map(([key, val]) => {
					const label = specLabels[key] || key
					const optionLabel = normalizeVal(val)
					if (!optionLabel) return ''
					return `${label}：${optionLabel}`
				})
				.filter(Boolean)
				.join(' / ')
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

		// 兼容多种图片字段名 + 占位符兜底
		getItemImage(item) {
			// 优先用 image_url；后端可能用其他字段名
			const raw = item.image_url || item.item_image_url || item.item_image || item.product_image || item.img_url || item.photo_url || ''
			if (!raw) {
				return '/static/images/img-placeholder.svg'
			}
			// 过滤掉明显无效的占位符（开发环境的假数据）
			if (raw.includes('example.com') || raw === 'string' || raw === 'null') {
				return '/static/images/img-placeholder.svg'
			}
			const fixed = fixMinioUrl(raw)
			return fixed || '/static/images/img-placeholder.svg'
		},

		// 后端 order_items 不存图片，从门店菜单反查 item_id → image_url
		async enrichItemsWithMenuImages(storeId) {
			if (!this.orderData.items || this.orderData.items.length === 0) return
			// 只处理缺图片的 items
			const needImage = this.orderData.items.filter(it => !it.image_url && it.item_id)
			if (needImage.length === 0) return
			try {
				const res = await getConsumerMenuItems(storeId, { page_size: 200 })
				if (res.code !== 0 || !res.data) return
				const menuItems = res.data.items || res.data || []
				// 建立 item_id → image_url 映射
				const imgMap = {}
				for (const m of menuItems) {
					if (m.id && m.image_url) imgMap[m.id] = m.image_url
				}
				// 注入到订单 items
				this.orderData.items = this.orderData.items.map(it => {
					if (!it.image_url && it.item_id && imgMap[it.item_id]) {
						return { ...it, image_url: imgMap[it.item_id] }
					}
					return it
				})
				// enriched images from menu
			} catch (e) {
				console.error('[order-detail] enrich menu images failed:', e)
			}
		},

		// 图片加载失败 → 换占位图
		onImageError(e, item, field) {
			console.warn('[order-detail] image load failed, field=' + field + ', item=' + (item.item_name || item.id), 'raw=' + (item.image_url || item.product_image || ''))
		},

		hasSpecs(item) {
			const specs = item.specs || item.specs_config
			if (!specs) return false
			const skipKeys = ['pricing', 'remark', 'topping_ids', 'quantity', 'group_price', 'original_price', 'group_buy_item_id', 'is_group_buy']
			return Object.entries(specs).some(([k, v]) => {
				if (skipKeys.includes(k)) return false
				if (v === null || v === undefined || v === '') return false
				if (Array.isArray(v)) return v.length > 0
				if (typeof v === 'object') return !!(v.name || v.label || v.value)
				return true
			})
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

		async handleReorder() {
			const orderId = this.orderData.id || this.orderData.order_id
			const shopId = this.orderData.store_id || this.orderData.shop_id || ''
			// 优先调后端 reorder 接口：返回 items 内含 selection(可直接下单) + specs(多语言快照,供展示)
			if (orderId) {
				try {
					const res = await reorder(orderId)
					if (res && res.code === 0 && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
						// reorder 接口不返回 image_url，从菜单接口反查
						const shopId = this.orderData.store_id || this.orderData.shop_id || ''
						if (shopId) {
							await this.enrichItemsWithMenuImages(shopId)
							// 把 enrich 后的图片合并到 reorder 返回的 items
							const imgMap = {}
							for (const it of (this.orderData.items || [])) {
								if (it.item_id && it.image_url) imgMap[it.item_id] = it.image_url
							}
							res.data.items.forEach(item => {
								const itemId = item.item_id || item.id
								if (!item.image_url && imgMap[itemId]) {
									item.image_url = imgMap[itemId]
								}
							})
						}
						const products = res.data.items.map(item => {
							const specs = item.specs || null
							const specsText = specs ? this.formatSpecs(specs) : ''
							return {
								id: item.item_id || item.id,
								name: item.item_name,
								name_en: item.item_name_en || '',
								name_th: item.item_name_th || '',
								price: item.unit_price,
								image: fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg',
								quantity: item.quantity,
								store_id: shopId,
								specs: specs || {},
								specs_text: specsText,
								selection: item.selection || null
							}
						})
						const shopIdParam = shopId ? `&shopId=${shopId}` : ''
						uni.navigateTo({
							url: `/pages/checkout/index?orderType=dinein&products=${encodeURIComponent(JSON.stringify(products))}${shopIdParam}`
						})
						return
					}
				} catch (e) {
					console.warn('[order-detail] reorder API failed, fallback to local build:', e)
				}
			}
			// 兜底：用订单详情的 items 本地拼装（旧逻辑）
			if (this.orderData.items && this.orderData.items.length > 0) {
				const products = this.orderData.items.map(item => {
					const specs = item.specs || item.specs_config || null
					const specsText = specs ? this.formatSpecs(specs) : ''
					return {
						id: item.item_id || item.id,
						name: item.item_name,
						name_en: item.item_name_en || '',
						name_th: item.item_name_th || '',
						price: item.unit_price,
						image: fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg',
						quantity: item.quantity,
						store_id: shopId,
						specs: specs || {},
						specs_text: specsText
					}
				})
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

/* 获得金币/积分 */
.reward-earned-row {
	display: flex;
	gap: 16px;
	padding-top: 8px;
}
.reward-earned-item {
	display: flex;
	align-items: center;
	gap: 4px;
}
.reward-earned-icon {
	font-size: 16px;
}
.reward-earned-text {
	font-size: 14px;
	font-weight: 700;
	color: #F2B131;
}

.bottom-placeholder {
	height: 32px;
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 64px;
	/* 关键：让按钮避开 iPhone Home Indicator */
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16px;
	padding-left: 16px;
	padding-right: 16px;
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
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

/* QR支付 */
.qr-pay-section { padding: 0 16px; }
.qr-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px;
	background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
}
.qr-image {
	width: 180px;
	height: 180px;
	background-color: #FFFFFF;
	border-radius: 8px;
}
.qr-hint {
	margin-top: 12px;
	font-size: 12px;
	color: #5D4037;
}
</style>
