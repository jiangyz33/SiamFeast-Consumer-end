<template>
	<view class="points-mall-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('pointsMall.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 会员等级区域 -->
			<view class="member-level-section" :class="{ 'platinum-section': currentLevel === 1 }">
				<view class="level-header">
					<view class="level-titles">
						<text class="level-title" :class="{ 'level-active': currentLevel === 0 }">{{ t('member.normal') }}</text>
						<text class="level-title" :class="{ 'level-active': currentLevel === 1 }">{{ t('member.platinum') }}</text>
					</view>
				</view>
				<view class="level-info">
					<text class="level-status">{{ currentLevel === 0 ? i18n.t('member.normalMember') : i18n.t('member.platinumMember') }}</text>
					<view class="platinum-badge" v-if="currentLevel === 1">
						<text class="platinum-icon">♛</text>
					</view>
					<view class="upgrade-btn" :class="{ 'upgrade-btn-disabled': !canUpgrade }" @click="handleUpgrade" v-if="currentLevel === 0">
						<text class="upgrade-text">{{ t('member.upgrade') }}</text>
					</view>
				</view>
				<view class="progress-section" v-if="currentLevel === 0">
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
					</view>
					<text class="progress-text">{{ t('member.consumption') }} {{ consumedAmount }}/{{ totalAmount }}</text>
				</view>
				<view class="level-benefit" v-if="currentLevel === 0">
					<text class="benefit-text">{{ t('member.platinumBenefit') }}</text>
				</view>
				<view class="level-benefit platinum-benefit" v-if="currentLevel === 1">
					<text class="benefit-text">{{ t('upgrade.benefitBirthday') }} · {{ t('upgrade.benefitDiscount') }} · {{ t('upgrade.benefitPriority') }}</text>
				</view>
			</view>

			<!-- 统计数据区域 -->
			<view class="stats-section">
				<view class="stat-item" @click="handleBalanceClick">
					<text class="stat-value">{{ userBalance }}</text>
					<text class="stat-label">{{ t('member.balance') }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ userPoints }}</text>
					<text class="stat-label">{{ t('member.points') }}</text>
				</view>
				<view class="stat-item" @click="handleNewUserPackClick">
					<text class="stat-value">{{ newUserCoupons }}</text>
					<text class="stat-label">{{ t('index.coupons') }}</text>
				</view>
			</view>

			<!-- 兑换Tab -->
			<view class="exchange-tabs">
				<view
					class="exchange-tab"
					:class="{ 'tab-active': activeTab === 0 }"
					@click="switchTab(0)"
				>
					<text class="tab-text">{{ t('member.pointsExchange') }}</text>
				</view>
				<view
					class="exchange-tab"
					:class="{ 'tab-active': activeTab === 1 }"
					@click="switchTab(1)"
				>
					<text class="tab-text">{{ t('member.balanceExchange') }}</text>
				</view>
			</view>

			<!-- 积分兑换商品列表 -->
			<view class="products-grid" v-if="activeTab === 0">
				<view
					class="product-card"
					v-for="item in pointsBenefits"
					:key="item.id"
					@click="handleProductClick(item)"
				>
					<image class="product-image" :src="fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
					<view class="product-info">
						<text class="product-name">{{ item["name_" + i18n.getLanguage()] || item.name || item.name_en }}</text>
						<view class="product-footer">
							<view class="points-cost">
								<text class="cost-num">{{ item.point_price }}</text>
								<text class="cost-unit">{{ t('member.points') }}</text>
							</view>
							<view class="exchange-btn" @click.stop="handleExchange(item)">
								<text class="exchange-text">{{ t('member.exchange') }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-if="pointsBenefits.length === 0" class="empty-state">
					<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
					<text class="empty-title">{{ t("common.empty.product") }}</text>
					<text class="empty-desc">{{ t("common.empty.productDesc") }}</text>
				</view>
			</view>

			<!-- 余额兑换商品列表 -->
			<view class="products-grid" v-if="activeTab === 1">
				<view
					class="product-card"
					v-for="item in balanceBenefits"
					:key="item.id"
					@click="handleProductClick(item)"
				>
					<image class="product-image" :src="fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
					<view class="product-info">
						<text class="product-name">{{ item["name_" + i18n.getLanguage()] || item.name || item.name_en }}</text>
						<view class="product-footer">
							<view class="points-cost">
								<image class="coin-icon" src="/static/icons/coin.svg" mode="aspectFit"></image>
								<text class="cost-num">{{ item.coin_price }}</text>
							</view>
							<view class="exchange-btn" @click.stop="handleExchange(item)">
								<text class="exchange-text">{{ t('member.exchange') }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-if="balanceBenefits.length === 0" class="empty-state">
					<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
					<text class="empty-title">{{ t("common.empty.product") }}</text>
					<text class="empty-desc">{{ t("common.empty.productDesc") }}</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 升级动画 -->
		<upgrade-animation
			:visible="showUpgradeAnimation"
			@close="handleUpgradeAnimationClose"
		></upgrade-animation>

		<!-- 门店选择弹窗 -->
		<view class="address-modal-mask" v-if="showStoreModal" @click="showStoreModal = false">
			<view class="address-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ t('dinein.selectStoreTitle') }}</text>
					<view class="modal-close" @click="showStoreModal = false">
						<text class="close-text">✕</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="store-list">
						<view
							class="store-item"
							v-for="store in storeList"
							:key="store.id"
							:class="{ 'store-selected': selectedStoreId === store.id }"
							@click="selectedStoreId = store.id"
						>
							<view class="store-radio">
								<view class="radio-inner" v-if="selectedStoreId === store.id"></view>
							</view>
							<view class="store-info">
								<text class="store-name">{{ store['name_' + i18n.getLanguage()] || store.name }}</text>
								<text class="store-address">{{ store['address_' + i18n.getLanguage()] || store['formatted_address_' + i18n.getLanguage()] || store.address || store.formatted_address }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="modal-footer">
					<view class="modal-btn modal-btn-cancel" @click="showStoreModal = false">
						<text class="modal-btn-text cancel">{{ t('common.cancel') || '取消' }}</text>
					</view>
					<view class="modal-btn modal-btn-confirm" @click="confirmExchange">
						<text class="modal-btn-text confirm">{{ t('member.exchange') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { showToast, fixMinioUrl } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import UpgradeAnimation from '@/components/upgrade-animation.vue'
import { getStores } from '@/api/services/store.js'
import {
	getMemberProgress,
	getMemberInfo,
	getPointsBenefits,
	getBalanceBenefits,
	exchangeBenefit
} from '@/api/services/member.js'
import { getMyCoupons } from '@/api/services/coupon.js'

export default {
	components: {
		UpgradeAnimation
	},
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			currentLevel: 0,
			consumedAmount: 0,
			totalAmount: 200,
			userPoints: 0,
			userBalance: 0,
			newUserCoupons: 0,
			activeTab: 0,
			pointsBenefits: [],
			balanceBenefits: [],
			showUpgradeAnimation: false,
			showStoreModal: false,
			storeList: [],
			selectedStoreId: null,
			pendingExchangeItem: null
		}
	},
	computed: {
		progressPercent() {
			if (this.totalAmount <= 0) return 0
			return Math.min((this.consumedAmount / this.totalAmount) * 100, 100)
		},
		canUpgrade() {
			return this.consumedAmount >= this.totalAmount
		}
	},
	onLoad(options) {
		// 支持从外部带 tab 参数进入：0=积分兑换 1=金币兑换
		if (options && options.tab !== undefined) {
			const t = parseInt(options.tab, 10)
			if (!isNaN(t) && (t === 0 || t === 1)) this.activeTab = t
		}
		this.initPage()
		this.loadData()
	},

	onShow() {
		this.loadData()
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
		fixMinioUrl,
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20

			const navBarHeight = 44
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadData() {
				try {
					const [memberInfoRes, progressRes, pointsBenefitsRes, balanceBenefitsRes, couponsRes] = await Promise.allSettled([
						getMemberInfo(),
						getMemberProgress(),
						getPointsBenefits(),
						getBalanceBenefits(),
						getMyCoupons({ status: 'UNUSED' })
					])

					// 积分和余额从 getMemberInfo 获取（与会员页一致）
					if (memberInfoRes.status === 'fulfilled' && memberInfoRes.value.code === 0 && memberInfoRes.value.data) {
						const info = memberInfoRes.value.data
						this.userPoints = info.point_balance ?? 0
						this.userBalance = info.coin_balance ?? 0
					}

					if (progressRes.status === 'fulfilled' && progressRes.value.code === 0 && progressRes.value.data) {
						const d = progressRes.value.data
						this.consumedAmount = d.current_spent || d.total_spent || 0
						this.totalAmount = d.threshold || d.required_for_next || 200
						const isBackendPlatinum = d.current_tier === 'PLATINUM'
						const hasMetGoal = this.consumedAmount >= this.totalAmount
						const hasSeenAnimation = this.hasSeenUpgradeAnimation()
						const shouldShowPlatinum = isBackendPlatinum || hasMetGoal
						if (shouldShowPlatinum && !hasSeenAnimation) {
							this.currentLevel = 0
							this.showUpgradeAnimation = true
							this.markUpgradeAnimationShown()
						} else if (shouldShowPlatinum) {
							this.currentLevel = 1
						} else {
							this.currentLevel = 0
						}
					}
					if (couponsRes.status === 'fulfilled' && couponsRes.value.code === 0 && couponsRes.value.data) {
						const couponItems = couponsRes.value.data.items || couponsRes.value.data || []
						// 只统计可用：UNUSED/ACTIVE/CLAIMED（和首页/我的页一致）
					this.newUserCoupons = Array.isArray(couponItems)
						? couponItems.filter(c => c.status === 'CLAIMED' || c.status === 'ACTIVE' || c.status === 'UNUSED').length
						: 0
					}
					if (pointsBenefitsRes.status === 'fulfilled' && pointsBenefitsRes.value.code === 0 && pointsBenefitsRes.value.data) {
						this.pointsBenefits = pointsBenefitsRes.value.data.items || []
					}
					if (balanceBenefitsRes.status === 'fulfilled' && balanceBenefitsRes.value.code === 0 && balanceBenefitsRes.value.data) {
						this.balanceBenefits = balanceBenefitsRes.value.data.items || []
					}
				} catch (e) {
					console.error('Load points mall data failed:', e)
				}
			},
		async loadStores() {
			try {
				const res = await getStores({ limit: 50 })
				if (res.code === 0 && res.data) {
					this.storeList = res.data.items || res.data || []
				}
			} catch (e) {
				console.error('Load stores failed:', e)
			}
		},

		goBack() {
			uni.navigateBack()
		},

		switchTab(index) {
			this.activeTab = index
		},

		handleUpgrade() {
			if (!this.canUpgrade) return
			this.currentLevel = 1
			this.showUpgradeAnimation = true
			this.markUpgradeAnimationShown()
		},

		handleUpgradeAnimationClose() {
			this.showUpgradeAnimation = false
			this.currentLevel = 1
			this.markUpgradeAnimationShown()
		},

		hasSeenUpgradeAnimation() {
			const UPGRADE_SHOWN_KEY = 'siamfeast_upgrade_shown_platinum'
			try {
				return !!uni.getStorageSync(UPGRADE_SHOWN_KEY)
			} catch (e) {
				return false
			}
		},

		markUpgradeAnimationShown() {
			const UPGRADE_SHOWN_KEY = 'siamfeast_upgrade_shown_platinum'
			try {
				uni.setStorageSync(UPGRADE_SHOWN_KEY, '1')
			} catch (e) {
				// ignore
			}
		},

		handleBalanceClick() {
			showToast(this.i18n.t('member.balanceDetail'))
		},

		handleNewUserPackClick() {
			// 跳转到优惠券列表（业务简化，不再有单独的"新人券包"概念）
			uni.navigateTo({
				url: '/pages/coupons/index'
			})
		},

		handleProductClick(item) {
			// 按当前语言取商品名
			const lang = i18n.getLanguage()
			const name = item['name_' + lang] || item.name || item.name_en || ''
			showToast(name)
		},

		async handleExchange(item) {
			if (this.activeTab === 0 && item.point_price && this.userPoints < item.point_price) {
				showToast(this.i18n.t('member.pointsNotEnough'))
				return
			}

			this.pendingExchangeItem = item
			this.selectedStoreId = null

			if (this.storeList.length === 0) {
				await this.loadStores()
			}
			this.showStoreModal = true
		},

		async confirmExchange() {
			if (!this.selectedStoreId) {
				showToast(this.i18n.t('dinein.selectStoreTitle'))
				return
			}

			const item = this.pendingExchangeItem
			if (!item) return

			this.showStoreModal = false
			try {
				const exchangeParams = {
					product_id: item.id,
					exchange_type: this.activeTab === 0 ? 'points' : 'balance',
					quantity: 1,
					store_id: this.selectedStoreId
				}
				if (this.activeTab === 0 && item.point_price) {
					exchangeParams.points_amount = item.point_price
				}
				if (this.activeTab === 1 && item.coin_price) {
					exchangeParams.coin_amount = item.coin_price
				}
				const res = await exchangeBenefit(exchangeParams)
				if (res.code === 0 && res.data) {
					const exchangeId = res.data.exchange_id || ''
					const uniqueCode = res.data.unique_code || ''
					// 传所有语言的 product name，让详情页能跟随语言切换
					const productNameZh = encodeURIComponent(item.name || item.name_zh || '')
					const productNameEn = encodeURIComponent(item.name_en || '')
					const productNameTh = encodeURIComponent(item.name_th || '')
					const productImage = item.image || item.image_url || ''
					const exchangeType = item.exchange_type || 'POINT'
					const quantity = item.quantity || 1
					uni.redirectTo({
						url: `/pages/exchange-success/index?exchangeId=${exchangeId}&uniqueCode=${encodeURIComponent(uniqueCode)}&productName=${productNameZh}&productNameEn=${productNameEn}&productNameTh=${productNameTh}&productImage=${encodeURIComponent(productImage)}&quantity=${quantity}&exchangeType=${exchangeType}&coinCost=${item.coin_cost || item.points_cost || 0}`
					})
				} else {
					showToast(res.message || this.t('pointsMall.exchangeFailed'))
				}
				this.loadData()
			} catch (e) {
				console.error('Exchange failed:', e)
				// request.js 在 4xx 时已经走过 getErrorMessage（含 bizCode → i18n 映射 + 关键词反查）
				// e.message 通常已经是当前语言的翻译（如「金币余额不足」/「Insufficient coins」/「เหรียญไม่เพียงพอ」）
				// 万一后端没返回 message，回退到通用「兑换失败」提示
				const msg = (e && e.message) || this.t('pointsMall.exchangeFailed')
				showToast(msg)
			}
		}
	}
}
</script>

<style scoped>
.points-mall-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background: linear-gradient(135deg, #936c2a 0%, #6b3a10 100%);
}

.nav-bar {
	height: 44px;
	background: linear-gradient(135deg, #936c2a 0%, #6b3a10 100%);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
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
	color: #FFFFFF;
}

.nav-right {
	width: 32px;
}

.content-scroll {
	flex: 1;
	background-color: #FFFFFF;
}

/* 会员等级区域 */
.member-level-section {
	background: linear-gradient(135deg, #FFF8E7 0%, #F5E6C8 50%, #E8D5AA 100%);
	padding: 16px;
	position: relative;
	overflow: hidden;
}

.member-level-section::after {
	content: 'VIP';
	position: absolute;
	top: 8px;
	right: 14px;
	font-size: 32px;
	font-weight: 900;
	color: rgba(147, 108, 42, 0.06);
	letter-spacing: 2px;
}

.level-header {
	display: flex;
	justify-content: center;
	margin-bottom: 12px;
}

.level-titles {
	display: flex;
	gap: 35px;
}

.level-title {
	font-size: 14px;
	font-weight: 700;
	color: #936c2a91;
}

.level-title.level-active {
	color: #936c2a;
}

.level-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.level-status {
	font-size: 14px;
	font-weight: 700;
	color: #936c2a;
}

.upgrade-btn {
	background: linear-gradient(135deg, #936c2a 0%, #b8892e 100%);
	border-radius: 14px;
	padding: 4px 12px;
	box-shadow: 0 2px 6px rgba(147, 108, 42, 0.3);
}

.upgrade-btn-disabled {
	background: #CCCCCC;
	box-shadow: none;
	opacity: 0.6;
}

.upgrade-text {
	font-size: 10px;
	font-weight: 600;
	color: #FFFFFF;
	letter-spacing: 0.5px;
}

.progress-section {
	margin-bottom: 8px;
}

.progress-bar {
	height: 4px;
	background-color: rgba(147, 108, 42, 0.15);
	border-radius: 2px;
	overflow: hidden;
	margin-bottom: 6px;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #936c2a 0%, #F2B131 100%);
	border-radius: 2px;
	transition: width 0.3s ease;
}

.progress-text {
	font-size: 14px;
	font-weight: 700;
	color: #936c2a;
}

.level-benefit {
	display: flex;
	justify-content: center;
	margin-top: 8px;
}

.benefit-text {
	font-size: 10px;
	font-weight: 500;
	color: #936c2a;
	background-color: rgba(147, 108, 42, 0.1);
	padding: 4px 12px;
	border-radius: 13px;
	border: 1px solid rgba(147, 108, 42, 0.15);
}

/* 统计数据区域 */
.stats-section {
	display: flex;
	justify-content: space-around;
	padding: 12px 0;
	background-color: #FFFFFF;
	border-bottom: 1px solid #F3F3F3;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.stat-value {
	font-size: 20px;
	font-weight: 700;
	color: #000000CC;
}

.stat-label {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
}

/* 兑换Tab */
.exchange-tabs {
	display: flex;
	padding: 12px 16px;
	gap: 12px;
	background-color: #FFFFFF;
}
.exchange-tab {
	flex: 1;
	height: 45px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	background-color: #F3F3F3;
	transition: all 0.2s ease;
}
.exchange-tab.tab-active {
	background: linear-gradient(135deg, #936c2a 0%, #b8892e 100%);
	box-shadow: 0 3px 10px rgba(147, 108, 42, 0.3);
}
.tab-text {
	font-size: 14px;
	color: #000000CC;
}
.tab-active .tab-text {
	color: #FFFFFF;
	font-weight: 500;
}

/* 商品列表 */
.products-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 10px;
	gap: 10px;
	background-color: #FFFFFF;
}
.product-card {
	width: calc(50% - 5px);
	background-color: #FFFFFF;
	border-radius: 8px;
	overflow: hidden;
	border: 1px solid #F3F3F3;
}
.product-image {
	width: 100%;
	height: 140px;
}
.product-info {
	padding: 8px 10px;
	background-color: #fffbf4;
}
.product-name {
	font-size: 11px;
	font-weight: 500;
	color: #000000CC;
	opacity: 0.9;
	line-height: 1.4;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	margin-bottom: 8px;
}
.product-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.points-cost {
	display: flex;
	align-items: baseline;
	gap: 2px;
}
.coin-icon {
	width: 14px;
	height: 14px;
	margin-right: 2px;
}

.cost-symbol {
	font-size: 12px;
	font-weight: 700;
	color: #936c2a;
}
.cost-num {
	font-size: 16px;
	font-weight: 700;
	color: #936c2a;
}
.cost-unit {
	font-size: 10px;
	color: #936c2a;
}
.exchange-btn {
	background-color: #936c2a;
	border-radius: 12px;
	padding: 4px 12px;
}
.exchange-text {
	font-size: 12px;
	color: #FFFFFF;
}
/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}
/* 空状态 */
.empty-state {
	width: 100%;
	padding: 40px 0;
	display: flex;
	justify-content: center;
}
.empty-title {
	font-size: 15px;
	color: #333;
	font-weight: 500;
	margin-bottom: 6px;
}
.empty-desc {
	font-size: 13px;
	color: #999;
}

/* 铂金权益 */
.platinum-benefit .benefit-text {
	background-color: rgba(107, 58, 16, 0.12);
	border-color: rgba(107, 58, 16, 0.2);
}

/* 铂金会员样式 */
.platinum-section {
	background: linear-gradient(135deg, #E8D5AA 0%, #D4C090 30%, #C9B47E 60%, #B8A06A 100%) !important;
	border: 1px solid rgba(201, 180, 126, 0.5);
}

.platinum-section::after {
	content: '♛' !important;
	font-size: 80px !important;
	color: rgba(201, 180, 126, 0.08) !important;
}

.platinum-badge {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	background: linear-gradient(135deg, #FFD700 0%, #F2B131 50%, #c49a3c 100%);
	border-radius: 50%;
	box-shadow: 0 2px 8px rgba(242, 177, 49, 0.4);
}

.platinum-icon {
	font-size: 16px;
	color: #1a0a00;
}

/* 门店选择弹窗 */
.address-modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}
.address-modal {
	width: 85%;
	background-color: #FFFFFF;
	border-radius: 12px;
	overflow: hidden;
}
.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	border-bottom: 1px solid #F3F3F3;
}
.modal-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}
.modal-close {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.close-text {
	font-size: 18px;
	color: #999999;
}
.modal-body {
	padding: 16px;
	max-height: 320px;
	overflow-y: auto;
}
.modal-footer {
	display: flex;
	gap: 12px;
	padding: 0 16px 16px;
}
.modal-btn {
	flex: 1;
	height: 44px;
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.modal-btn-cancel {
	background-color: #F3F3F3;
}
.modal-btn-confirm {
	background-color: #936c2a;
}
.modal-btn-text {
	font-size: 15px;
	font-weight: 500;
}
.modal-btn-text.cancel {
	color: #00000099;
}
.modal-btn-text.confirm {
	color: #FFFFFF;
}

/* 门店列表 */
.store-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.store-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px;
	border: 1px solid #E0E0E0;
	border-radius: 8px;
	transition: border-color 0.2s;
}
.store-item.store-selected {
	border-color: #936c2a;
	background-color: #FFF8E7;
}
.store-radio {
	width: 20px;
	height: 20px;
	border: 2px solid #CCC;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.store-selected .store-radio {
	border-color: #936c2a;
}
.radio-inner {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background-color: #936c2a;
}
.store-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
	flex: 1;
}
.store-name {
	font-size: 14px;
	font-weight: 500;
	color: #333;
}
.store-address {
	font-size: 12px;
	color: #999;
}
</style>
