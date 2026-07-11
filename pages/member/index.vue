<template>
	<view class="member-page">
		<!-- 顶部背景区域 -->
		<view class="header-bg">
			<view class="bg-gradient"></view>
			<view class="bg-decor-circle bg-circle-1"></view>
			<view class="bg-decor-circle bg-circle-2"></view>
			<view class="bg-decor-circle bg-circle-3"></view>
		</view>

		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 用户信息区域 -->
		<view class="user-section">
			<view class="user-info-row" v-if="userInfo" @click="goSettings">
				<image class="user-avatar" :src="userInfo.avatar_url || '/static/images/04_default_avatar.png'" mode="aspectFill"></image>
				<view class="user-text">
					<text class="user-name">{{ userInfo.nickname || i18n.t('mine.title') }}</text>
					<text class="user-phone">{{ formatPhone }}</text>
				</view>
				<view class="edit-btn">
					<image class="edit-icon" src="/static/icons/edit.svg" mode="aspectFit"></image>
				</view>
			</view>
			<view class="user-info-row" v-else @click="goLogin">
				<image class="user-avatar" src="/static/images/banner-placeholder.svg" mode="aspectFill"></image>
				<view class="user-text">
					<text class="user-name">{{ t('login.notLoggedIn') }}</text>
					<text class="user-phone">{{ t('login.clickToLogin') }}</text>
				</view>
			</view>
		</view>

		<!-- 内容卡片区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<view class="content-card">
				<!-- 会员等级区域 -->
				<view class="member-level-section" :class="{ 'platinum-section': currentLevel === 1 }" @click="goToPointsMall">
					<view class="level-header">
						<view class="level-titles">
							<text class="level-title" :class="{ 'level-active': currentLevel === 0 }">{{ t('member.normal') }}</text>
							<text class="level-title" :class="{ 'level-active': currentLevel === 1 }">{{ t('member.platinum') }}</text>
						</view>
					</view>
					<view class="level-info">
						<text class="level-status">{{ currentLevel === 0 ? i18n.t('member.normalMember') : i18n.t('member.platinumMember') }}</text>
						<view class="upgrade-btn" :class="{ 'upgrade-btn-disabled': !canUpgrade }" @click.stop="handleUpgrade" v-if="currentLevel === 0">
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
					<view class="stat-item" @click="handleFeature('balance')">
						<text class="stat-value">{{ userBalance }}</text>
						<text class="stat-label">{{ t('member.balance') }}</text>
					</view>
					<view class="stat-item" @click="goToPointsMall">
						<text class="stat-value">{{ userPoints }}</text>
						<text class="stat-label">{{ t('member.points') }}</text>
					</view>
					<view class="stat-item" @click="handleFeature('newUserCoupons')">
						<text class="stat-value">{{ newUserCoupons }}</text>
						<text class="stat-label">{{ t('index.coupons') }}</text>
					</view>
				</view>

				<!-- 我的功能 -->
				<view class="feature-section">
					<view class="section-header">
						<text class="section-title">{{ t('mine.myFeatures') }}</text>
					</view>
					<view class="feature-tabs">
						<view class="feature-tab" @click="handleFeature('footprint')">
							<image class="feature-icon" src="/static/icons/clock.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('mine.footprint') }}</text>
						</view>
						<!-- 移除「我的地址」入口：当前只有堂食，无外卖配送场景 -->
						<view class="feature-tab" @click="handleFeature('coupons')">
							<image class="feature-icon" src="/static/icons/coupon.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('mine.myCoupons') }}</text>
						</view>
						<view class="feature-tab" @click="handleFeature('claimCoupons')">
							<image class="feature-icon" src="/static/icons/claim-coupon.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('mine.claimCenter') }}</text>
						</view>
						<view class="feature-tab" @click="handleFeature('referral')">
							<image class="feature-icon" src="/static/icons/invite.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('mine.inviteCode') }}</text>
						</view>
						<view class="feature-tab" @click="handleFeature('memberCode')">
							<image class="feature-icon" src="/static/icons/vending.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('memberCode.title') }}</text>
						</view>
						<view class="feature-tab" @click="handleFeature('settings')">
							<image class="feature-icon" src="/static/icons/settings.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('mine.settings') }}</text>
						</view>
					</view>
				</view>

				<!-- 好店推荐 -->
				<view class="recommend-section">
					<view class="section-header">
						<text class="section-title">{{ t('mine.recommendedStores') }}</text>
					</view>
					<view class="recommend-list">
						<view
							class="recommend-item"
							v-for="(item, index) in recommendations"
							:key="index"
							@click="handleShopClick(item)"
						>
							<image class="shop-logo" :src="item.logo" mode="aspectFill"></image>
							<view class="shop-info">
								<text class="shop-name">{{ item['name_' + i18n.getLanguage()] || item.name }}</text>
								<view class="shop-stats">
									<text class="stat-text shop-status" :class="item.status === 'OPEN' ? 'status-open' : 'status-closed'">{{ item.status === 'OPEN' ? i18n.t('mine.open') : i18n.t('mine.closed') }}</text>
									<text class="stat-divider">|</text>
									<text class="stat-text" v-if="item.businessHours">{{ item.businessHours }}</text>
								</view>
								<view class="shop-tags">
									<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{ tag }}</text>
								</view>
							</view>
							<view class="shop-action">
								<text class="action-text">{{ t('mine.enterStore') }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 退出登录 -->
			<view class="logout-section" v-if="userInfo">
				<view class="logout-btn" @click="handleLogout">
					<text class="logout-text">{{ t('mine.logout') }}</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="2"></custom-tabbar>

		<!-- 升级动画 -->
		<upgrade-animation
			:visible="showUpgradeAnimation"
			@close="handleUpgradeAnimationClose"
		></upgrade-animation>
	</view>
</template>

<script>
import store from '@/store/index.js'
import { showToast, formatPhone, fixMinioUrl } from '@/utils/index.js'
import CustomTabbar from '@/components/custom-tabbar.vue'
import UpgradeAnimation from '@/components/upgrade-animation.vue'
import i18n from '@/i18n/index.js'
import { getMemberInfo, getMemberProgress } from '@/api/services/member.js'
	import { getUserInfo } from '@/api/services/auth.js'
import { getMyCoupons } from '@/api/services/coupon.js'
import { getStores } from '@/api/services/store.js'

export default {
	components: {
		CustomTabbar,
		UpgradeAnimation
	},
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			userInfo: null,
			currentLevel: 0,
			consumedAmount: 0,
			totalAmount: 200,
			userBalance: 0,
			userPoints: 0,
			newUserCoupons: 0,
			recommendations: [],
			showUpgradeAnimation: false
		}
	},
	computed: {
		formatPhone() {
			if (!this.userInfo || !this.userInfo.phone) return ''
			return formatPhone(this.userInfo.phone)
		},
		progressPercent() {
			return Math.min((this.consumedAmount / this.totalAmount) * 100, 100)
		},
		canUpgrade() {
			return this.consumedAmount >= this.totalAmount
		}
	},
	onLoad() {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20
	},
	onShow() {
			// #ifdef APP-PLUS
			uni.hideTabBar({ animation: false, fail: () => {} })
			// #endif
			uni.$emit('tabbarUpdate')
			const cached = store.getUserInfo()
			if (cached) this.userInfo = cached
			this.refreshUserInfo()
		this.initPage()
		this.loadMemberData()
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

		// 格式化营业时间：兼容 config.opening_time/closing_time、business_hours 字符串、opening_hours 等
		// 和 dinein/index.vue 的 formatBusinessHours 逻辑保持一致
		formatBusinessHours(s) {
			if (!s) return ''
			// 形态1：config 对象里有 opening_time / closing_time
			const cfg = s.config || s.store_config
			if (cfg && cfg.opening_time && cfg.closing_time) {
				const open = String(cfg.opening_time).slice(0, 5)
				const close = String(cfg.closing_time).slice(0, 5)
				if (open && close && !open.includes('undefined') && !close.includes('undefined')) {
					return `${open}-${close}`
				}
			}
			// 形态2：字符串字段（过滤占位符 "-"）
			const str = s.business_hours || s.businessHours || s.opening_hours
			if (str && typeof str === 'string' && !str.includes('undefined') && str !== '-' && str !== ' - ') {
				return str
			}
			// 形态3：顶层 opening_time / closing_time
			if (s.opening_time && s.closing_time) {
				const open = String(s.opening_time).slice(0, 5)
				const close = String(s.closing_time).slice(0, 5)
				if (open && close && !open.includes('undefined') && !close.includes('undefined')) {
					return `${open}-${close}`
				}
			}
			return ''
		},

		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		async refreshUserInfo() {
			try {
				const [memberRes, userRes] = await Promise.all([
					getMemberInfo().catch(() => null),
					getUserInfo().catch(() => null)
				])
				let info = {}
				if (memberRes && memberRes.code === 0 && memberRes.data) {
					info = { ...memberRes.data }
									}
				if (userRes) {
					const ud = userRes.data || userRes
					if (ud) info = { ...info, ...ud }
				}
				if (Object.keys(info).length > 0) {
					if (info.avatar_url) info.avatar_url = fixMinioUrl(info.avatar_url)
					this.userInfo = info
					store.setUserInfo(info)
				}
			} catch(e) {
				console.error('refreshUserInfo error:', e)
			}
		},
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20

			const tabBarHeight = 63
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - 104 - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		goLogin() {
			uni.navigateTo({
				url: '/pages/login/index'
			})
		},

		goSettings() {
			uni.navigateTo({
				url: '/pages/settings/index'
			})
		},

		goToPointsMall() {
			uni.navigateTo({
				url: '/pages/points-mall/index'
			})
		},

		handleUpgrade() {
			if (!this.canUpgrade) return
			this.currentLevel = 1
			this.showUpgradeAnimation = true
			this.markUpgradeAnimationShown()
		},

		doUpgrade() {
			// TODO: 调用升级接口
			showToast(this.i18n.t('common.success'))
		},

		handleFeature(type) {
			if (!this.userInfo && type !== 'settings') {
				this.goLogin()
				return
			}
			if (type === 'coupons') {
				uni.navigateTo({
					url: '/pages/coupons/index'
				})
			} else if (type === 'points') {
				this.goToPointsMall()
			} else if (type === 'balance') {
				// userBalance 实际是金币余额，跳到金币商城（tab=1）
				uni.navigateTo({
					url: '/pages/points-mall/index?tab=1'
				})
			} else if (type === 'footprint') {
				uni.navigateTo({
					url: '/pages/footprint/index'
				})
			} else if (type === 'claimCoupons') {
				uni.navigateTo({
					url: '/pages/claim-coupons/index'
				})
			} else if (type === 'referral') {
					uni.navigateTo({
						url: '/pages/referral/index'
					})
				} else if (type === 'memberCode') {
					uni.navigateTo({
						url: '/pages/member-code/index'
					})
				} else if (type === 'settings') {
				uni.navigateTo({
					url: '/pages/settings/index'
				})
			} else if (type === 'invoice') {
				showToast(this.i18n.t('common.fail'))
			} else if (type === 'balance') {
				showToast(this.i18n.t('member.balanceDetail'))
			} else if (type === 'newUserCoupons') {
				// 业务简化：和首页一致，跳转到优惠券列表（不再单独走 newUser 类型）
				uni.navigateTo({
					url: '/pages/coupons/index'
				})
			}
		},

		async loadMemberData() {
			try {
				const results = await Promise.allSettled([
					getMemberInfo(),
					getMemberProgress(),
					getMyCoupons({ status: 'UNUSED' }),
					getStores({ limit: 3 }),
				])

				const [memberInfoRes, progressRes, couponsRes, storesRes] = results;

				// balance & points from getMemberInfo
				if (memberInfoRes.status === 'fulfilled' && memberInfoRes.value.code === 0 && memberInfoRes.value.data) {
					const info = memberInfoRes.value.data
					this.userBalance = info.coin_balance ?? 0
					this.userPoints = info.point_balance ?? 0
				}

				// 会员等级进度
				if (progressRes.status === 'fulfilled' && progressRes.value.code === 0 && progressRes.value.data) {
					const d = progressRes.value.data
					console.log('[member] progress response:', JSON.stringify(d).substring(0, 500))
					// 已消费金额（兼容多种字段名）
					this.consumedAmount =
						d.current_spent ||
						d.total_spent ||
						d.spent_amount ||
						d.consumption ||
						d.current_amount ||
						d.current_progress ||
						0
					// 升级阈值（兼容多种字段名）
					this.totalAmount =
						d.threshold ||
						d.required_for_next ||
						d.next_tier_threshold ||
						d.target_amount ||
						d.upgrade_threshold ||
						d.next_threshold ||
						d.required_amount ||
						d.goal_amount ||
						d.target ||
						200  // 后端确认的真实默认值（如未提供则用此值）
					console.log('[member] consumed=', this.consumedAmount, 'total=', this.totalAmount)
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

				// 优惠券数量（只统计可用：UNUSED/ACTIVE/CLAIMED，和首页一致）
				if (couponsRes.status === 'fulfilled' && couponsRes.value.code === 0 && couponsRes.value.data) {
					const items = couponsRes.value.data.items || couponsRes.value.data || []
					this.newUserCoupons = Array.isArray(items)
						? items.filter(c => c.status === 'CLAIMED' || c.status === 'ACTIVE' || c.status === 'UNUSED').length
						: 0
				}

				// 好店推荐
				if (storesRes.status === 'fulfilled' && storesRes.value.code === 0 && storesRes.value.data) {
					const stores = Array.isArray(storesRes.value.data) ? storesRes.value.data : (storesRes.value.data.items || [])
					this.recommendations = stores.slice(0, 3).map(s => ({
						id: s.id,
						name: s.name,
						name_en: s.name_en || '',
						name_th: s.name_th || '',
						logo: fixMinioUrl(s.logo || s.image_url) || '/static/images/store-placeholder.svg',
						status: s.status || 'OPEN',
						businessHours: this.formatBusinessHours(s),
						tags: s.business_types || [s.name]
					}))
				}

			} catch (e) {
				console.error('loadMemberData error:', e)
			}
		},
		handleShopClick(item) {
			uni.navigateTo({
				url: `/pages/dinein/index?shopId=${item.id}&shopName=${encodeURIComponent(item.name)}`
			})
		},

		handleLogout() {
			uni.showModal({
				title: this.i18n.t('common.confirm'),
				content: this.i18n.t('mine.logoutConfirm'),
				confirmText: this.i18n.t('common.confirm'),
				cancelText: this.i18n.t('common.cancel'),
				success: (res) => {
					if (res.confirm) {
						store.logout()
						this.userInfo = null
						showToast(this.i18n.t('common.success'))
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/login/index'
							})
						}, 1000)
					}
				}
			})
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

	}
}
</script>

<style scoped>
.member-page {
	min-height: 100vh;
	background-color: #F7F7F7;
	display: flex;
	flex-direction: column;
}

/* 顶部背景区域 */
.header-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 254px;
	overflow: hidden;
	background: linear-gradient(135deg, #1a0a00 0%, #3d1c00 25%, #6b3a10 50%, #936c2a 75%, #c49a3c 100%);
}

.bg-gradient {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(180deg, rgba(147, 108, 42, 0.3) 0%, rgba(26, 10, 0, 0.8) 100%);
}

.bg-decor-circle {
	position: absolute;
	border-radius: 50%;
	opacity: 0.08;
	background-color: #FFD700;
}

.bg-circle-1 {
	width: 200px;
	height: 200px;
	top: -60px;
	right: -40px;
}

.bg-circle-2 {
	width: 140px;
	height: 140px;
	top: 80px;
	left: -30px;
	background-color: #F2B131;
}

.bg-circle-3 {
	width: 100px;
	height: 100px;
	bottom: 20px;
	right: 60px;
	background-color: #FFFFFF;
	opacity: 0.04;
}

.status-bar {
	width: 100%;
	position: relative;
	z-index: 1;
}

/* 用户信息区域 */
.user-section {
	position: relative;
	z-index: 1;
	padding: 0 20px;
	height: 52px;
	display: flex;
	align-items: center;
}

.user-info-row {
	display: flex;
	align-items: center;
	width: 100%;
}

.user-avatar {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background-color: #F7F7F7;
}

.user-text {
	margin-left: 16px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.user-name {
	font-size: 16px;
	font-weight: 700;
	color: #FFFFFF;
}

.user-phone {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.8);
	margin-top: 4px;
}

.edit-btn {
	position: absolute;
	right: 20px;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.edit-icon {
	width: 20px;
	height: 20px;
}

/* 内容卡片区域 */
.content-scroll {
	flex: 1;
	position: relative;
	z-index: 2;
	margin-top: 10px;
}

.content-card {
	background-color: #FFFFFF;
	border-radius: 16px 16px 0 0;
	padding: 10px 10px;
	margin: 0 0;
	box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
}

/* 会员等级区域 */
.member-level-section {
	background: linear-gradient(135deg, #FFF8E7 0%, #F5E6C8 50%, #E8D5AA 100%);
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 10px;
	position: relative;
	overflow: hidden;
	border: 1px solid rgba(147, 108, 42, 0.15);
}

.member-level-section::before {
	content: '';
	position: absolute;
	top: -20px;
	right: -20px;
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(242, 177, 49, 0.2) 0%, transparent 70%);
}

.member-level-section::after {
	content: 'VIP';
	position: absolute;
	top: 12px;
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

.platinum-benefit .benefit-text {
	background-color: rgba(107, 58, 16, 0.12);
	border-color: rgba(107, 58, 16, 0.2);
}

/* 统计数据区域 */
.stats-section {
	display: flex;
	justify-content: space-around;
	padding: 16px 0;
	background-color: #FFFFFF;
	border-radius: 12px;
	margin-bottom: 10px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	/* 让三项等宽，防止长 label 拉歪数字位置 */
	flex: 1;
	min-width: 0;
	padding: 0 4px;
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
	text-align: center;
	/* 限两行，防止泰国字把高度撑开导致上方数字位置参差 */
	min-height: 20px;
	line-height: 1.2;
	word-break: break-word;
	width: 100%;
}

/* 区块头部 */
.section-header {
	height: 40px;
	display: flex;
	align-items: center;
	padding: 0 6px;
}

.section-title {
	font-size: 14px;
	font-weight: 700;
	color: #000000CC;
}

/* 功能区域 */
.feature-section {
	background-color: #FFFFFF;
	border-radius: 12px;
	overflow: hidden;
	margin-top: 10px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.feature-tabs {
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 0 0 12px 0;
}

.feature-tab {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	padding: 12px 0;
	/* 多语言下让每个 tab 等宽，避免长文本（泰文/英文）把图标挤歪 */
	flex: 1;
	min-width: 0;
	transition: transform 0.15s ease;
}

.feature-tab:active {
	transform: scale(0.95);
}

.feature-icon {
	width: 28px;
	height: 28px;
}

.feature-text {
	font-size: 12px;
	color: #00000099;
	/* 限两行、固定行高，确保各 tab 上方图标垂直对齐 */
	line-height: 1.3;
	text-align: center;
	width: 100%;
	min-height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	word-break: break-word;
}

/* 优惠券区域 */
.coupon-section {
	margin-top: 10px;
}

.coupon-card {
	display: flex;
	align-items: center;
	background: linear-gradient(135deg, #FFB16D 0%, #F35500 100%);
	border-radius: 11px;
	padding: 0 4px;
	height: 57px;
}

.coupon-left {
	display: flex;
	align-items: center;
	flex: 1;
}

.coupon-amount {
	font-size: 32px;
	font-weight: 400;
	color: #FF5031;
	padding: 0 19px;
}

.coupon-divider {
	width: 1px;
	height: 33px;
	background-color: rgba(0, 0, 0, 0.3);
}

.coupon-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding-left: 12px;
}

.coupon-name {
	font-size: 14px;
	color: #000000CC;
}

.coupon-condition {
	font-size: 10px;
	color: #00000099;
}

.coupon-right {
	background: linear-gradient(180deg, #FF9350 0%, #FF2D2D 100%);
	border-radius: 8px;
	padding: 10px 14px;
	margin-left: auto;
}

.coupon-btn {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
	white-space: nowrap;
}

.coupon-card-claimed .coupon-right {
	background: #C0C0C0;
	padding: 10px 14px;
}

.coupon-btn-claimed {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
	white-space: nowrap;
}
.recommend-section {
	margin-top: 10px;
}

.recommend-item {
	display: flex;
	align-items: center;
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
	transition: transform 0.15s ease;
}

.recommend-item:active {
	transform: scale(0.98);
}

.recommend-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 0 0 10px 0;
}

.recommend-item {
	display: flex;
	align-items: center;
	background-color: #FFFFFF;
	border-radius: 8px;
	padding: 10px;
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
	flex: 1;
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

.status-open {
	color: #4CAF50;
}

.status-closed {
	color: #999;
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

/* 退出登录 */
.logout-section {
	padding: 20px 16px;
}

.logout-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 44px;
	background-color: #FFFFFF;
	border-radius: 8px;
}

.logout-text {
	font-size: 14px;
	color: #FF4444;
}

/* 底部占位 */
.bottom-placeholder {
	height: 80px;
}


/* 铂金会员视觉样式 */
.member-level-section.platinum-section {
	background: linear-gradient(135deg, #E8D5AA 0%, #D4C090 30%, #C9B47E 60%, #B8A06A 100%) !important;
	border-color: rgba(201, 180, 126, 0.5) !important;
}

.member-level-section.platinum-section::after {
	content: '♛' !important;
	font-size: 80px !important;
	color: rgba(201, 180, 126, 0.08) !important;
}

.member-level-section.platinum-section .level-status {
	color: #6b3a10 !important;
}

.member-level-section.platinum-section .progress-text {
	color: #6b3a10 !important;
}

.member-level-section.platinum-section .benefit-text {
	color: #6b3a10 !important;
	border-color: rgba(107, 58, 16, 0.2) !important;
	background-color: rgba(107, 58, 16, 0.08) !important;
}
</style>
