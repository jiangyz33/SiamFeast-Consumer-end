<template>
	<view class="payment-success-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">订单信息</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 支付成功图标 -->
			<view class="success-icon-section">
				<image class="success-icon" src="/static/images/payment-success.svg" mode="aspectFit"></image>
			</view>

			<!-- 支付成功信息 -->
			<view class="success-info-card">
				<view class="success-title-row">
					<text class="success-title">{{ statusText }}</text>
				</view>
				<!-- 堂食订单或到店自取显示取餐码 -->
				<view class="pickup-code-section" v-if="showPickupCode && pickupCode">
					<text class="pickup-label">取餐码</text>
					<text class="pickup-code">{{ pickupCode }}</text>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 好店推荐 -->
			<view class="recommend-section">
				<view class="recommend-card">
					<view class="recommend-header">
						<text class="recommend-title">好店推荐</text>
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
										<text class="stat-divider">|</text>
										<text class="stat-text" v-if="item.businessHours">{{ item.businessHours }}</text>
									</view>
									<view class="shop-tags">
										<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{ tag }}</text>
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

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="action-btn view-order-btn" @click="handleViewOrder">
				<text class="action-btn-text">查看订单</text>
			</view>
			<view class="action-btn continue-btn" @click="handleContinue">
				<text class="action-btn-text">继续购物</text>
			</view>
		</view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="1"></custom-tabbar>
	</view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar.vue'
import { showToast } from '@/utils/index.js'
import { getStores } from '@/api/services/store.js'
	import i18n from '@/i18n/index.js'

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			statusBarHeight: 20,
			contentHeight: 500,
			orderId: '',
			orderType: 'delivery', // delivery, dinein
			deliveryType: 'delivery', // delivery, pickup
			pickupCode: '',
			recommendations: [],
			i18n: i18n
		}
	},
	onLoad(options) {
		if (options.orderId) {
			this.orderId = options.orderId
		}
		if (options.orderType) {
			this.orderType = options.orderType
		}
		if (options.deliveryType) {
			this.deliveryType = options.deliveryType
		}
		if (options.pickupCode) {
			this.pickupCode = options.pickupCode
		}
		this.initPage()
		this.loadRecommendations()
	},
	computed: {
		statusText() {
			// 堂食订单
			if (this.orderType === 'dinein') {
				return '支付完成，请等待取餐'
			}
			// 到店自取
			if (this.deliveryType === 'pickup') {
				return '支付完成，请到店取餐'
			}
			// 配送订单
			return '支付完成，等待配送'
		},
		showPickupCode() {
			// 堂食订单或到店自取显示取餐码
			return this.orderType === 'dinein' || this.deliveryType === 'pickup'
		}
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
						tags: s.business_types || [s.name]
					}))
				}
			} catch (e) {
				console.error('loadRecommendations error:', e)
			}
		},

		goBack() {
			uni.switchTab({
				url: '/pages/order/index'
			})
		},

		handleShopClick(item) {
			uni.navigateTo({
				url: `/pages/dinein/index?shopId=${item.id}`
			})
		},

		handleViewOrder() {
			uni.switchTab({
				url: '/pages/order/index'
			})
		},

		handleContinue() {
			uni.switchTab({
				url: '/pages/index/index'
			})
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

.status-bar {
	width: 100%;
	background-color: #FFFFFF;
}

/* 导航栏 */
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

/* 内容区域 */
.content-scroll {
	flex: 1;
	background-color: #FFFFFF;
}

/* 支付成功图标 */
.success-icon-section {
	display: flex;
	justify-content: center;
	padding: 20px 0;
}

.success-icon {
	width: 74px;
	height: 74px;
}

/* 支付成功信息 */
.success-info-card {
	margin: 0 16px;
	background-color: #FFFFFF;
	border-radius: 8px;
	overflow: hidden;
}

.success-title-row {
	padding: 8px 16px;
}

.success-title {
	font-size: 18px;
	font-weight: 700;
	color: #000000CC;
}

/* 取餐码区域 */
.pickup-code-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px 16px;
	background-color: #FFF8E6;
	margin: 0 16px;
	border-radius: 8px;
	margin-top: 10px;
}

.pickup-label {
	font-size: 14px;
	color: #00000099;
	margin-bottom: 8px;
}

.pickup-code {
	font-size: 48px;
	font-weight: 700;
	color: #F2B131;
	letter-spacing: 8px;
}

/* 分隔线 */
.divider {
	height: 6px;
	background-color: #F3F3F3;
}

/* 好店推荐 */
.recommend-section {
	padding: 10px 16px;
}

.recommend-card {
	background-color: #FFFFFF;
	border-radius: 8px;
	padding-bottom: 10px;
}

.recommend-header {
	height: 40px;
	display: flex;
	align-items: center;
	padding: 0 16px;
}

.recommend-title {
	font-size: 14px;
	font-weight: 700;
	color: #000000;
}

.recommend-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 0 10px;
}

.recommend-item {
	background-color: #FFFFFF;
	border-radius: 6px;
	padding: 10px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.recommend-content {
	display: flex;
	align-items: center;
	flex: 1;
}

.shop-logo {
	width: 40px;
	height: 40px;
	border-radius: 8px;
	margin-right: 10px;
}

.shop-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.shop-name {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
}

.shop-stats {
	display: flex;
	align-items: center;
	gap: 6px;
}

.stat-text {
	font-size: 12px;
	color: #00000099;
}

.stat-divider {
	font-size: 12px;
	color: #00000099;
}

.shop-tags {
	display: flex;
	gap: 6px;
}

.tag {
	font-size: 10px;
	color: #F2B131;
	background-color: rgba(242, 177, 49, 0.1);
	padding: 2px 6px;
	border-radius: 4px;
}

.shop-action {
	background-color: #F2B131;
	border-radius: 14px;
	padding: 6px 16px;
}

.action-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}

/* 底部操作栏 */
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

.view-order-btn {
	background-color: #F3F3F3;
}

.view-order-btn .action-btn-text {
	color: #000000CC;
}

.continue-btn {
	background-color: #F2B131;
}

.continue-btn .action-btn-text {
	color: #FFFFFF;
}

.action-btn-text {
	font-size: 14px;
	font-weight: 500;
}
</style>
