<template>
	<view class="exchange-success-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('exchangeResult.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 状态区域 -->
			<view class="status-section" :class="{ 'status-redeemed': isRedeemed }">
				<view class="status-icon-wrap">
					<image v-if="isRedeemed" class="status-icon" src="/static/images/payment-success.svg" mode="aspectFit"></image>
					<view v-else class="status-pending-icon">
						<view class="pulse-ring"></view>
						<text class="pending-dot">✓</text>
					</view>
				</view>
				<text class="status-text">{{ isRedeemed ? t('exchangeResult.redeemed') : t('exchangeResult.waitingRedeem') }}</text>
			</view>

			<!-- 商品图片 -->
			<view class="product-preview" v-if="productImage">
				<image class="product-img" :src="productImage" mode="aspectFill"></image>
			</view>

			<!-- 二维码卡片 -->
			<view class="qr-card" v-if="!isRedeemed">
				<view class="qr-wrap" v-if="qrImageUrl">
					<image class="qr-image" :src="qrImageUrl" mode="aspectFit"></image>
				</view>
				<view class="qr-wrap qr-loading" v-else>
					<text class="qr-loading-text">...</text>
				</view>
				<text class="qr-hint">{{ t('exchangeResult.showQR') }}</text>
				<text class="qr-sub-hint">{{ t('exchangeResult.scanning') }}</text>
				<view class="code-text-row" v-if="uniqueCode">
					<text class="code-text">{{ uniqueCode }}</text>
				</view>
			</view>

			<!-- 兑换信息 -->
			<view class="info-card">
				<view class="info-row" v-if="displayName">
					<text class="info-label">{{ t('exchangeResult.product') }}</text>
					<text class="info-value">{{ displayName }}</text>
				</view>
				<view class="info-row" v-if="quantity > 1">
					<text class="info-label">{{ t('exchangeResult.quantity') }}</text>
					<text class="info-value">{{ quantity }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">{{ t('exchangeResult.exchangeId') }}</text>
					<text class="info-value">{{ exchangeId }}</text>
				</view>
				<view class="info-row" v-if="exchangeCost">
					<text class="info-label">{{ t('order.exchangeCost') }}</text>
					<text class="info-value">{{ exchangeCost }}</text>
				</view>
				<view class="info-row" v-if="displayStoreName">
					<text class="info-label">{{ t('exchangeResult.pickupStore') }}</text>
					<text class="info-value">{{ displayStoreName }}</text>
				</view>
				<view class="info-row" v-if="pickupTimeDisplay">
					<text class="info-label">{{ t('exchangeResult.pickupTime') }}</text>
					<text class="info-value">{{ pickupTimeDisplay }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">{{ t('exchangeResult.status') }}</text>
					<text class="info-value" :class="isRedeemed ? 'redeemed-badge' : 'pending-badge'">{{ isRedeemed ? t('exchangeResult.redeemed') : t('exchangeResult.waitingRedeem') }}</text>
				</view>
			</view>

			<view class="bottom-placeholder"></view>
		</scroll-view>

		<view class="bottom-bar">
			<view class="action-btn view-order-btn" @click="handleViewOrders">
				<text class="action-btn-text">{{ t('exchangeResult.viewOrders') }}</text>
			</view>
			<view class="action-btn continue-btn" @click="handleContinue">
				<text class="action-btn-text">{{ t('payment.continueShopping') }}</text>
			</view>
		</view>
		<canvas canvas-id="qrCanvasExchange" style="position:fixed;left:-9999px;width:200px;height:200px;"></canvas>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import { getMallOrderDetail, getMallOrderStatus } from '@/api/services/member.js'
import { generateQRImage } from '@/utils/qrcode.js'
import { fixMinioUrl } from '@/utils/index.js'

export default {
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			exchangeId: '',
			uniqueCode: '',
			productName: '',
			productNameZh: '',
			productNameEn: '',
			productNameTh: '',
			productImage: '',
			quantity: 1,
			exchangeCost: '',
			exchangeType: '',
			coinCost: 0,
			storeName: '',
			storeNameEn: '',
			storeNameTh: '',
			pickupTimeDisplay: '',
			isRedeemed: false,
			pollTimer: null,
			pollCount: 0,
			MAX_POLL: 60,  // 5 秒 × 60 = 5 分钟，避免无限轮询
			qrImageUrl: ''
		}
	},
	onLoad(options) {
		if (options.exchangeId) this.exchangeId = options.exchangeId
		if (options.uniqueCode) this.uniqueCode = decodeURIComponent(options.uniqueCode)
		// 接收所有语言版本的 product name（从 order 页或 points-mall 传来）
		if (options.productName) this.productNameZh = decodeURIComponent(options.productName)
		if (options.productNameEn) this.productNameEn = decodeURIComponent(options.productNameEn)
		if (options.productNameTh) this.productNameTh = decodeURIComponent(options.productNameTh)
		// productName 字段保留兼容（computed displayName 会按当前语言取）
		if (this.productNameZh) this.productName = this.productNameZh
		if (options.productImage) this.productImage = fixMinioUrl(decodeURIComponent(options.productImage))
		if (options.quantity) this.quantity = parseInt(options.quantity) || 1
		if (options.exchangeType) this.exchangeType = String(options.exchangeType).toUpperCase()
		if (options.coinCost) this.coinCost = parseInt(options.coinCost) || 0
		if (this.coinCost > 0 && this.exchangeType) {
			const key = this.exchangeType === 'COIN' ? 'order.exchangeCoins' : 'order.exchangePoints'
			this.exchangeCost = i18n.t(key, { n: this.coinCost })
		}
		if (options.storeName) this.storeName = decodeURIComponent(options.storeName)
		if (options.storeNameEn) this.storeNameEn = decodeURIComponent(options.storeNameEn)
		if (options.storeNameTh) this.storeNameTh = decodeURIComponent(options.storeNameTh)
		if (options.pickupTime) this.pickupTimeDisplay = decodeURIComponent(options.pickupTime)
		this.initPage()
	},
	onReady() {
		this.loadDetailAndGenerateQR()
		this.startPolling()
	},
	onShow() {
		// 从后台切回前台 / 从其他页面返回 → 立即查一次状态
		if (this.exchangeId && !this.isRedeemed) {
			// onShow status check
			this.checkStatus()
			// 如果轮询被停过，重启
			if (!this.pollTimer) {
				this.startPolling()
			}
		}
	},
	onHide() {
		// 切到后台 → 暂停轮询省电（onShow 会重启）
		// onHide pause polling
		this.stopPolling()
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

	computed: {
		// 按当前语言取商品名（响应 langVersion）
		displayName() {
			void this.langVersion
			const lang = i18n.getLanguage()
			if (lang === 'en' && this.productNameEn) return this.productNameEn
			if (lang === 'th' && this.productNameTh) return this.productNameTh
			return this.productNameZh || this.productName || ''
		},
		// 按当前语言取门店名
		displayStoreName() {
			void this.langVersion
			const lang = i18n.getLanguage()
			if (lang === 'en' && this.storeNameEn) return this.storeNameEn
			if (lang === 'th' && this.storeNameTh) return this.storeNameTh
			return this.storeName || ''
		}
	},

		methods: {
			t(key, params) {
				void this.langVersion
				return i18n.t(key, params)
			},
			onLanguageChanged() {
				this.langVersion++
				// 重新计算 exchangeCost 文案
				if (this.coinCost > 0 && this.exchangeType) {
					const k = this.exchangeType === 'COIN' ? 'order.exchangeCoins' : 'order.exchangePoints'
					this.exchangeCost = i18n.t(k, { n: this.coinCost })
				}
			},
			initPage() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 20
				const navBarHeight = 44
				const bottomBarHeight = 64
				const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
				this.contentHeight = systemInfo.windowHeight - navBarHeight - bottomBarHeight - safeAreaBottom - this.statusBarHeight
			},

			async loadDetailAndGenerateQR() {
				// 始终调详情接口：补全 uniqueCode、exchangeId（订单号）、多语言商品名等
				// 后端创建兑换订单响应可能未及时返回完整字段，这里做最终兜底
				if (this.exchangeId) {
					try {
						const res = await getMallOrderDetail(this.exchangeId)
						if (res.code === 0 && res.data) {
							const d = res.data
							// 补全订单号：详情接口可能返回 order_no / exchange_no / id 等多种字段
							if (!this.exchangeId && (d.id || d.exchange_id)) {
								this.exchangeId = String(d.id || d.exchange_id)
							}
							if (d.order_no || d.exchange_no) {
								// 如果详情返回了正式单号，优先用正式单号显示
								const formalNo = d.order_no || d.exchange_no
								if (formalNo && this.exchangeId !== formalNo) {
									this.exchangeId = formalNo
								}
							}
							if (!this.uniqueCode) this.uniqueCode = d.unique_code || ''
							// 保存所有语言的商品名（后端字段 product_name_<lang>）
							if (d.product_name_zh) this.productNameZh = d.product_name_zh
							if (d.product_name_en) this.productNameEn = d.product_name_en
							if (d.product_name_th) this.productNameTh = d.product_name_th
							// 兜底：后端只返回单一 product_name 时存到 zh（默认中文）
							if (d.product_name && !this.productNameZh) this.productNameZh = d.product_name
							if (!this.productName) this.productName = d.product_name || ''
							if (!this.productImage && d.product_image) this.productImage = fixMinioUrl(d.product_image)
							if (d.quantity) this.quantity = d.quantity
							if (!this.exchangeType && d.exchange_type) {
								this.exchangeType = String(d.exchange_type).toUpperCase()
							}
							// 补全提货门店 + 提货时间（后端详情接口若返回则填上）
							if (!this.storeName && d.store_name) this.storeName = d.store_name
							if (!this.storeNameEn && d.store_name_en) this.storeNameEn = d.store_name_en
							if (!this.storeNameTh && d.store_name_th) this.storeNameTh = d.store_name_th
							if (!this.pickupTimeDisplay && d.pickup_time) {
								// ISO 8601 → YYYY-MM-DD HH:mm
								try { this.pickupTimeDisplay = String(d.pickup_time).replace('T', ' ').substring(0, 16) } catch (e) {}
							}
							const cost = d.coin_cost || d.points_cost || 0
							if (cost > 0 && !this.exchangeCost) {
								const k = this.exchangeType === 'COIN' ? 'order.exchangeCoins' : 'order.exchangePoints'
								this.exchangeCost = i18n.t(k, { n: cost })
							}
							if (d.status === 'REDEEMED' || d.status === 'COMPLETED') {
								this.isRedeemed = true
							}
						}
					} catch (e) {
						console.error('[exchange-success] loadDetail error:', e)
					}
				}
				if (this.uniqueCode) {
					this.$nextTick(() => { this.generateQR() })
				}
			},

			async generateQR() {
				if (!this.uniqueCode) return
				try {
					this.qrImageUrl = await generateQRImage(this.uniqueCode, { size: 200, canvasId: 'qrCanvasExchange', componentInstance: this })
				} catch (err) {
					console.error('[exchange-success] generateQR error:', err)
				}
			},

			startPolling() {
				if (this.isRedeemed) return
				if (this.pollTimer) return
				this.pollCount = 0
				// 改为 5 秒间隔，匹配 payment-success，避免高频请求
				this.pollTimer = setInterval(() => {
					this.pollCount++
					if (this.pollCount > this.MAX_POLL) {
						// polling exceeded max
						this.stopPolling()
						return
					}
					this.checkStatus()
				}, 5000)
				// polling started
			},

			stopPolling() {
				if (this.pollTimer) {
					clearInterval(this.pollTimer)
					this.pollTimer = null
					// polling stopped
				}
			},

			async checkStatus() {
				if (this.isRedeemed || !this.exchangeId) return
				try {
					const res = await getMallOrderStatus(this.exchangeId)
					if (res.code === 0 && res.data) {
						const status = String(res.data.status || '').toUpperCase()
						// 兼容多种「已核销」状态值
						if (status === 'REDEEMED' || status === 'COMPLETED' || status === 'PAID') {
							this.isRedeemed = true
							this.stopPolling()
							this.playSuccess()
						}
					}
				} catch (e) {
					console.error('[exchange-success] poll error:', e)
				}
			},

			playSuccess() {
				if (typeof navigator !== 'undefined' && navigator.vibrate) {
					navigator.vibrate(200)
				}
				try { uni.vibrateShort({ success: () => {} }) } catch (e) {}
			},

			goBack() {
				this.stopPolling()
				uni.navigateBack()
			},

			handleViewOrders() {
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
.exchange-success-page {
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

.status-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 24px 0 16px;
}
.status-icon-wrap { margin-bottom: 10px; }
.status-icon { width: 60px; height: 60px; }
.status-text { font-size: 18px; font-weight: 700; color: #F2B131; }
.status-redeemed .status-text { color: #52C41A; }

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
.qr-wrap {
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.qr-image {
	width: 200px;
	height: 200px;
}
.qr-loading {
	width: 224px;
	height: 224px;
}
.qr-loading-text {
	color: #ccc;
	font-size: 14px;
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
.code-text-row {
	margin-top: 12px;
	padding: 6px 16px;
	background-color: rgba(93, 64, 55, 0.08);
	border-radius: 8px;
}
.code-text {
	font-size: 16px;
	font-weight: 700;
	color: #5D4037;
	letter-spacing: 2px;
}

.info-card {
	margin: 12px 24px;
	padding: 16px;
	background-color: #F9F9F9;
	border-radius: 12px;
}

/* 商品预览图 */
.product-preview {
	display: flex;
	justify-content: center;
	margin: 8px 0;
}
.product-img {
	width: 120px;
	height: 120px;
	border-radius: 12px;
	background-color: #F5F5F5;
}
.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 6px 0;
}
.info-label { font-size: 13px; color: #999; }
.info-value { font-size: 13px; color: #333; font-weight: 500; }
.redeemed-badge { color: #52C41A; font-size: 12px; background-color: rgba(82, 196, 26, 0.1); padding: 2px 8px; border-radius: 4px; }
.pending-badge { color: #F2B131; font-size: 12px; background-color: rgba(242, 177, 49, 0.1); padding: 2px 8px; border-radius: 4px; }

.bottom-placeholder { height: 32px; }

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0; right: 0;
	/* 关键：用 padding-bottom + env(safe-area-inset-bottom) 让按钮避开 Home Indicator；
	   内容区域 contentHeight 已经减掉 safeAreaBottom，bottom-bar 也需要把这部分高度吃进去 */
	height: 64px;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16px;
	padding-left: 16px;
	padding-right: 16px;
	box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
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
