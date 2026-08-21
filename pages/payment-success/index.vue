<template>
	<view class="payment-success-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('payment.orderInfo') }}</text>
			<view class="nav-right"></view>
		</view>

		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 等待支付 / 已支付 状态 -->
			<view class="status-section" :class="{ 'status-paid': isPaid }">
				<view class="status-icon-wrap">
					<image v-if="isPaid" class="status-icon" src="/static/images/payment-success.svg" mode="aspectFit"></image>
					<view v-else class="status-pending-icon">
						<view class="pulse-ring"></view>
						<text class="pending-dot">฿</text>
					</view>
				</view>
				<text class="status-text">{{ isPaid ? i18n.t('payment.paidSuccess') : i18n.t('payment.waitingPay') }}</text>
			</view>

			<!-- 二维码卡片 -->
			<view class="qr-card" v-if="!isPaid">
				<image v-if="qrImageUrl" class="qr-image" :src="qrImageUrl" mode="aspectFit"></image>
				<text class="qr-hint">{{ t('payment.showQR') }}</text>
				<text class="qr-sub-hint">{{ t('payment.scanning') }}</text>
			</view>

			<!-- 订单信息 -->
			<view class="order-info-card">
				<view class="info-row">
					<text class="info-label">{{ t('payment.orderNo') }}</text>
					<text class="info-value">{{ orderNo }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">{{ t('payment.amount') }}</text>
					<text class="info-value amount">฿{{ totalAmount }}</text>
				</view>
				<view class="info-row" v-if="isPaid">
					<text class="info-label">{{ t('payment.paid') }}</text>
					<text class="info-value paid-badge">{{ t('payment.paidSuccess') }}</text>
				</view>
			</view>

			<!-- 好店推荐（点餐入口临时下线，整块隐藏） -->
			<view class="recommend-section" v-if="ORDERING_ENABLED">
				<view class="recommend-card">
					<view class="recommend-header">
						<text class="recommend-title">{{ t('mine.recommendedStores') }}</text>
					</view>
					<view class="recommend-list">
						<view
							v-for="(item, index) in recommendations"
							:key="index"
							class="recommend-item"
							@click="handleShopClick(item)"
						>
							<view class="recommend-content">
								<image class="shop-logo" :src="item.logo" mode="aspectFill"></image>
								<view class="shop-info">
									<text class="shop-name">{{ item["name_" + i18n.getLanguage()] || item.name }}</text>
									<view class="shop-stats">
										<text class="stat-text shop-status" :class="item.status === 'OPEN' ? 'status-open' : 'status-closed'">{{ item.status === 'OPEN' ? i18n.t('storeSelect.open') : i18n.t('storeSelect.closed') }}</text>
									</view>
								</view>
							</view>
							<view class="shop-action">
								<text class="action-text">进店</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="bottom-placeholder"></view>
		</scroll-view>

		<view class="bottom-bar">
			<view class="action-btn view-order-btn" @click="handleViewOrder">
				<text class="action-btn-text">{{ t('payment.viewOrder') }}</text>
			</view>
			<view class="action-btn continue-btn" @click="handleContinue">
				<text class="action-btn-text">{{ t('payment.continueShopping') }}</text>
			</view>
		</view>

		<custom-tabbar :current="1"></custom-tabbar>
		<canvas canvas-id="qrCanvasPayment" style="position:fixed;left:-9999px;width:200px;height:200px;"></canvas>
	</view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar.vue'
import { showToast } from '@/utils/index.js'
import { getStores } from '@/api/services/store.js'
import { getOrderStatus, getOrderDetail } from '@/api/services/order.js'
import { ORDERING_ENABLED } from '@/utils/featureFlags.js'
import i18n from '@/i18n/index.js'
import { generateQRImage } from '@/utils/qrcode.js'

export default {
	components: { CustomTabbar },
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			ORDERING_ENABLED: ORDERING_ENABLED,
			statusBarHeight: 20,
			contentHeight: 500,
			orderId: '',
			orderNo: '',
			orderType: 'dinein',
			totalAmount: '0',
			uniqueCode: '',
			isPaid: false,
			recommendations: [],
			pollTimer: null,
			qrImageUrl: ''
		}
	},
	onLoad(options) {
		if (options.orderId) this.orderId = options.orderId
		if (options.orderNo) this.orderNo = decodeURIComponent(options.orderNo)
		if (options.orderType) this.orderType = options.orderType
		if (options.totalAmount) this.totalAmount = options.totalAmount
		if (options.uniqueCode) this.uniqueCode = decodeURIComponent(options.uniqueCode)
		this.initPage()
		this.loadRecommendations()
		// 后端创建订单响应可能未及时返回 order_no，主动调详情接口补全
		this.fillOrderInfo()
		this.startPolling()
	},
	onReady() {
		this.generateQR()
	},
	onUnload() {
		this.stopPolling()
	},
	created() {
		uni.$on('languageChanged', this.onLanguageChanged)
	},

	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},

	methods: {
		onLanguageChanged() {
			this.langVersion++
		},
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		async generateQR() {
			const qrData = this.uniqueCode
			if (!qrData) return
			try {
				this.qrImageUrl = await generateQRImage(qrData, { size: 200, canvasId: 'qrCanvasPayment', componentInstance: this })
			} catch (err) {
				console.error('[payment-success] generateQR error:', err)
			}
		},
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const bottomBarHeight = 64
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - bottomBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},



		startPolling() {
			this.pollTimer = setInterval(() => {
				this.checkOrderStatus()
			}, 5000)
		},

		stopPolling() {
			if (this.pollTimer) {
				clearInterval(this.pollTimer)
				this.pollTimer = null
			}
		},

		async checkOrderStatus() {
			if (this.isPaid || !this.orderId) return
			try {
				const res = await getOrderStatus(this.orderId)
				if (res.code === 0 && res.data) {
					const status = res.data.status
					// 兜底：如果 orderNo 还空，从状态接口拿
					if (!this.orderNo && res.data.order_no) {
						this.orderNo = res.data.order_no
					}
					if (status === 'PAID' || status === 'COMPLETED' || status === 'PREPARING') {
						this.isPaid = true
						this.stopPolling()
						this.playSuccessSound()
					}
				}
			} catch (e) {
				console.error('Poll status error:', e)
			}
		},

		// 后端创建订单响应可能没立即返回 order_no（异步生成），主动调详情接口补全
		async fillOrderInfo() {
			if (!this.orderId) return
			// 已经有 orderNo 就不用再拉
			if (this.orderNo) return
			try {
				const res = await getOrderDetail(this.orderId)
				if (res.code === 0 && res.data) {
					// 兼容两种响应结构：
					// 1. 平铺：res.data.order_no / res.data.unique_code（mock 旧结构）
					// 2. 嵌套：res.data.order.order_no（生产结构，order-detail 页面已验证）
					const order = (res.data.order && (res.data.order.id || res.data.order.order_no))
						? res.data.order
						: res.data
					if (order.order_no) this.orderNo = order.order_no
					if (!this.totalAmount || this.totalAmount === '0') {
						this.totalAmount = order.total_amount || this.totalAmount
					}
					if (!this.uniqueCode && order.unique_code) {
						this.uniqueCode = order.unique_code
						this.$nextTick(() => { this.generateQR() })
					}
				}
			} catch (e) {
				console.warn('[payment-success] fillOrderInfo failed:', e)
			}
		},

		playSuccessSound() {
			if (typeof navigator !== 'undefined' && navigator.vibrate) {
				navigator.vibrate(200)
			}
			try { uni.vibrateShort({ success: () => {} }) } catch (e) {}
		},

		// 经营品类枚举 → 多语言文案（与 store-select/mall 页面映射保持一致）
		normalizeBusinessTypes(types, fallback) {
			if (!types || !Array.isArray(types) || types.length === 0) {
				return fallback ? [fallback] : []
			}
			const typeKeyMap = {
				'HOTPOT': 'hotpot', 'HOTPOT_BUFFET': 'hotpot', 'HOTPOT_PER_ITEM': 'hotpot',
				'BBQ': 'barbecue', 'BARBECUE': 'barbecue',
				'MALA_TANG': 'malaTang', 'MALATANG': 'malaTang',
				'BEVERAGE': 'beverage',
				'SEAFOOD_NOODLES': 'seafoodNoodle', 'SEAFOOD_NOODLE': 'seafoodNoodle',
				'SINEFOOD_NOODLE': 'seafoodNoodle', 'SINEFOOD_NOODLES': 'seafoodNoodle',
				'HOSTEL_ROOM': 'hostel', 'HOSTEL_HOTPOT': 'hostelHotpot', 'HOSTEL_COFFEE': 'hostelCoffee'
			}
			const result = types.map(t => {
				const key = typeKeyMap[t]
				return key ? i18n.t(`storeSelect.businessTypes.${key}`) : ''
			}).filter(Boolean)
			if (result.length === 0 && fallback) return [fallback]
			return result
		},

		async loadRecommendations() {
			try {
				const res = await getStores({ limit: 3 })
				if (res.code === 0 && res.data) {
					const stores = Array.isArray(res.data) ? res.data : (res.data.items || [])
					this.recommendations = stores.slice(0, 3).map(s => ({
						id: s.id,
						name: s["name_" + i18n.getLanguage()] || s.name || s.name_en,
						logo: s.logo || '/static/images/store-placeholder.svg',
						status: s.status || 'OPEN',
						businessHours: s.business_hours || '',
						tags: this.normalizeBusinessTypes(s.business_types, s["name_" + i18n.getLanguage()] || s.name)
					}))
				}
			} catch (e) {
				console.error('loadRecommendations error:', e)
			}
		},

		goBack() {
			this.stopPolling()
			uni.switchTab({ url: '/pages/order/index' })
		},

		handleShopClick(item) {
			uni.navigateTo({ url: `/pages/dinein/index?shopId=${item.id}` })
		},

		handleViewOrder() {
			this.stopPolling()
			uni.switchTab({ url: '/pages/order/index' })
		},

		handleContinue() {
			this.stopPolling()
			uni.switchTab({ url: '/pages/index/index' })
		}
	}
	}
</script>

<style scoped>
.payment-success-page {
	min-height: 100vh;
	background-color: #FFFFFF;
	display: flex;
	flex-direction: column;
}

.status-bar { width: 100%; background-color: #FFFFFF; }

.nav-bar {
	height: 44px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	border-bottom: 1px solid #F3F3F3;
}
.nav-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.back-icon { width: 24px; height: 24px; }
.nav-title { font-size: 16px; font-weight: 700; color: #000000CC; }
.nav-right { width: 32px; }

.content-scroll { flex: 1; background-color: #FFFFFF; }

/* 状态区域 */
.status-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 24px 0 16px;
}
.status-icon-wrap { margin-bottom: 10px; }
.status-icon { width: 60px; height: 60px; }
.status-text { font-size: 18px; font-weight: 700; color: #000000CC; }
.status-paid .status-text { color: #52C41A; }

.status-pending-icon {
	width: 60px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}
.pending-dot {
	font-size: 28px;
	color: #F2B131;
	font-weight: 700;
	z-index: 1;
}
.pulse-ring {
	position: absolute;
	width: 60px;
	height: 60px;
	border-radius: 50%;
	border: 2px solid #F2B131;
	animation: pulse 2s ease-out infinite;
}
@keyframes pulse {
	0% { transform: scale(0.8); opacity: 1; }
	100% { transform: scale(1.4); opacity: 0; }
}

/* 二维码卡片 */
.qr-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 12px 24px;
	padding: 24px;
	background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
	border-radius: 16px;
	box-shadow: 0 4px 16px rgba(242, 177, 49, 0.1);
}
.qr-image {
	width: 200px;
	height: 200px;
	background-color: #FFFFFF;
	border-radius: 8px;
}
.qr-hint {
	margin-top: 16px;
	font-size: 14px;
	font-weight: 600;
	color: #5D4037;
}
.qr-sub-hint {
	margin-top: 4px;
	font-size: 12px;
	color: #5D403799;
}

/* 订单信息 */
.order-info-card {
	margin: 12px 24px;
	padding: 16px;
	background-color: #F9F9F9;
	border-radius: 12px;
}
.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 6px 0;
}
.info-label { font-size: 13px; color: #999; }
.info-value { font-size: 13px; color: #333; font-weight: 500; }
.info-value.amount { font-size: 16px; font-weight: 700; color: #F2B131; }
.paid-badge { color: #52C41A; font-size: 12px; background-color: rgba(82, 196, 26, 0.1); padding: 2px 8px; border-radius: 4px; }

/* 好店推荐 */
.recommend-section { padding: 10px 16px; }
.recommend-card { background-color: #FFFFFF; border-radius: 8px; padding-bottom: 10px; }
.recommend-header { height: 40px; display: flex; align-items: center; padding: 0 16px; }
.recommend-title { font-size: 14px; font-weight: 700; color: #000000; }
.recommend-list { display: flex; flex-direction: column; gap: 10px; padding: 0 10px; }
.recommend-item {
	background-color: #FFFFFF;
	border-radius: 6px;
	padding: 10px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border: 1px solid #F3F3F3;
}
.recommend-content { display: flex; align-items: center; flex: 1; }
.shop-logo { width: 40px; height: 40px; border-radius: 8px; margin-right: 10px; }
.shop-info { display: flex; flex-direction: column; gap: 4px; }
.shop-name { font-size: 14px; font-weight: 500; color: #000000CC; }
.shop-stats { display: flex; align-items: center; gap: 6px; }
.stat-text { font-size: 12px; color: #00000099; }
.status-open { color: #52C41A; }
.status-closed { color: #999; }
.shop-action { background-color: #F2B131; border-radius: 14px; padding: 6px 16px; }
.action-text { font-size: 12px; font-weight: 500; color: #FFFFFF; }

.bottom-placeholder { height: 20px; }

/* 底部操作栏 */
.bottom-bar {
	position: fixed;
	bottom: 50px;
	left: 0; right: 0;
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
.view-order-btn { background-color: #F3F3F3; }
.view-order-btn .action-btn-text { color: #000000CC; }
.continue-btn { background-color: #F2B131; }
.continue-btn .action-btn-text { color: #FFFFFF; }
.action-btn-text { font-size: 14px; font-weight: 500; }
</style>
