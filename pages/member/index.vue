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
				<!-- 加载中：占位骨架（避免数据未到位时闪烁老 UI） -->
				<view v-if="tierLoading" class="member-level-section member-level-skeleton">
					<view class="skeleton-line skeleton-title"></view>
					<view class="skeleton-line skeleton-status"></view>
					<view class="skeleton-line skeleton-bar"></view>
				</view>

				<!-- 会员等级区域：动态档位渲染（按 sort_order 选样式） -->
				<view
					v-else-if="currentTier"
					class="member-level-section"
					:class="'tier-level-' + (getTierSortIndex(currentTierCode))"
					@click="goToPointsMall"
				>
					<view class="level-header">
						<view class="level-titles">
							<!-- 所有档位名平铺，当前档高亮 -->
							<text
								v-for="tier in membershipTiers"
								:key="tier.code"
								class="level-title"
								:class="{ 'level-active': tier.code === currentTierCode }"
							>{{ getTierName(tier) }}</text>
						</view>
						<tier-icon :tier-code="currentTierCode" :sort-index="getTierSortIndex(currentTierCode)" />
					</view>
					<view class="level-info">
						<text class="level-status">{{ currentTierName }}</text>
						<view v-if="nextTier" class="upgrade-btn" @click.stop="goToPointsMall">
							<text class="upgrade-text">{{ t('member.upgrade') }} {{ getTierName(nextTier) }}</text>
						</view>
					</view>
					<view class="progress-section" v-if="nextTier">
						<view class="progress-bar">
							<view
								class="progress-fill"
								:style="{ width: progressPercent + '%' }"
							></view>
						</view>
						<text class="progress-text">{{ t('member.consumption') }} {{ consumedAmount }}/{{ totalAmount }}</text>
					</view>
					<!-- 最高档时显示已累计消费金额 -->
					<view class="progress-section" v-else>
						<text class="progress-text">{{ t('member.totalSpent') }}：{{ consumedAmount }}</text>
					</view>
					<view class="level-benefit" v-if="getTierDescription(currentTier)">
						<text class="benefit-text">{{ getTierDescription(currentTier) }}</text>
					</view>
					<!-- 已最高档时的占位 -->
					<view class="level-benefit" v-else-if="!nextTier">
						<text class="benefit-text">{{ t('member.highestTier') }}</text>
					</view>
				</view>

				<!-- 兜底：档位配置未加载时显示老的 UI（避免白屏） -->
				<view v-else class="member-level-section" :class="{ 'platinum-section': currentLevel === 1 }" @click="goToPointsMall">
					<view class="level-header">
						<view class="level-titles">
							<text class="level-title" :class="{ 'level-active': currentLevel === 0 }">{{ t('member.normal') }}</text>
							<text class="level-title" :class="{ 'level-active': currentLevel === 1 }">{{ t('member.platinum') }}</text>
						</view>
					</view>
					<view class="level-info">
						<text class="level-status">{{ currentLevel === 0 ? i18n.t('member.normalMember') : i18n.t('member.platinumMember') }}</text>
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
						<text class="stat-pending" v-if="pendingPoints > 0">+{{ pendingPoints }}</text>
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
						<!-- 足迹入口临时下线（随点餐入口隐藏，ORDERING_ENABLED=true 恢复） -->
						<view class="feature-tab" v-if="ORDERING_ENABLED" @click="handleFeature('footprint')">
							<image class="feature-icon" src="/static/icons/clock.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('mine.footprint') }}</text>
						</view>
						<!-- 移除「我的地址」入口：当前只有堂食，无外卖配送场景 -->
						<view class="feature-tab" @click="handleFeature('coupons')">
							<image class="feature-icon" src="/static/icons/coupon.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('mine.myCoupons') }}</text>
						</view>
						<!-- 移除「领券中心」入口：当前没有可领的优惠券，避免用户进入空页面 -->
						<view class="feature-tab" @click="handleFeature('referral')">
							<image class="feature-icon" src="/static/icons/invite.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('mine.inviteCode') }}</text>
						</view>
						<view class="feature-tab" @click="handleFeature('memberCode')">
							<image class="feature-icon" src="/static/icons/vending.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('memberCode.title') }}</text>
						</view>
						<view class="feature-tab" @click="handleFeature('exchange')">
							<image class="feature-icon" src="/static/icons/mall.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('index.pointsMall') }}</text>
						</view>
						<view class="feature-tab" @click="handleFeature('settings')">
							<image class="feature-icon" src="/static/icons/settings.svg" mode="aspectFit"></image>
							<text class="feature-text">{{ t('mine.settings') }}</text>
						</view>
					</view>
				</view>

				<!-- 好店推荐（点餐入口临时下线，整块隐藏：恢复 ORDERING_ENABLED=true 还原） -->
				<view class="recommend-section" v-if="ORDERING_ENABLED">
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

		<!-- 升级动画（动态版：内容来自档位配置） -->
		<upgrade-animation-dynamic
			v-if="currentTier"
			:visible="showUpgradeAnimation"
			:tier="currentTier"
			@close="handleUpgradeAnimationClose"
		></upgrade-animation-dynamic>
		<!-- 兜底：档位未加载时用旧组件 -->
		<upgrade-animation
			v-else
			:visible="showUpgradeAnimation"
			@close="handleUpgradeAnimationClose"
		></upgrade-animation>
	</view>
</template>

<script>
import store from '@/store/index.js'
import { showToast, formatPhone, fixMinioUrl } from '@/utils/index.js'
import { ORDERING_ENABLED } from '@/utils/featureFlags.js'
import CustomTabbar from '@/components/custom-tabbar.vue'
import UpgradeAnimation from '@/components/upgrade-animation.vue'
import UpgradeAnimationDynamic from '@/components/upgrade-animation-dynamic.vue'
import TierIcon from '@/components/tier-icon.vue'
import i18n from '@/i18n/index.js'
import { getMemberInfo, getMemberProgress, getMembershipTiers } from '@/api/services/member.js'
	import { getUserInfo } from '@/api/services/auth.js'
import { getMyCoupons } from '@/api/services/coupon.js'
import { getStores } from '@/api/services/store.js'

export default {
	components: {
		CustomTabbar,
		UpgradeAnimation,
		UpgradeAnimationDynamic,
		TierIcon
	},
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			ORDERING_ENABLED: ORDERING_ENABLED,
			statusBarHeight: 20,
			contentHeight: 500,
			userInfo: null,
			currentLevel: 0,
			consumedAmount: 0,
			totalAmount: 200,
			userBalance: 0,
			userPoints: 0,
			tierLoading: true,   // 会员档位加载中（首次加载完成前不渲染等级区域，避免闪屏）
		pendingPoints: 0,   // 待激活积分（仅展示，不能消费）
			newUserCoupons: 0,
			recommendations: [],
			showUpgradeAnimation: false,
			// 动态档位配置（来自后端 GET /membership/tiers）
			membershipTiers: [],
			// 当前用户档位信息（来自 GET /member/progress）
			currentTierCode: '',      // 如 'BRONZE'、'GOLD'、'VIP'
			nextTierCode: '',         // 下一档 code（已最高档时为空）
			currentLevelValue: 0,     // 当前档位的 sort_index 数值（0=最低，兜底用）
			tierUpdatedAt: null,      // 升级时间（判断是否要弹动画）
			lastSeenTierUpdatedAt: null  // 上次访问时记录的 tier_updated_at（localStorage）
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
		},
		// 当前档位配置对象（从 membershipTiers 里按 currentTierCode 查找）
		// 兜底：如果 code 对不上（如 BRONZE vs REGULAR），用 current_level 数值索引
		currentTier() {
			if (this.membershipTiers.length === 0) return null
			// 1. 按 code 精确匹配
			if (this.currentTierCode) {
				const found = this.membershipTiers.find(t => t.code === this.currentTierCode)
				if (found) return found
			}
			// 2. 兜底：用 progress 返回的 current_level 数值（0=最低档）
			if (this.currentLevelValue >= 0 && this.currentLevelValue < this.membershipTiers.length) {
				return this.membershipTiers[this.currentLevelValue]
			}
			// 3. 最后兜底：返回最低档
			return this.membershipTiers[0]
		},
		// 下一档配置对象
		nextTier() {
			if (this.membershipTiers.length === 0) return null
			if (this.nextTierCode) {
				const found = this.membershipTiers.find(t => t.code === this.nextTierCode)
				if (found) return found
			}
			// 兜底：用 currentLevel+1
			const nextIdx = this.currentLevelValue + 1
			if (nextIdx > 0 && nextIdx < this.membershipTiers.length) {
				return this.membershipTiers[nextIdx]
			}
			return null
		},
		// 当前档位名称（按语言取）
		currentTierName() {
			const t = this.currentTier
			if (!t) return ''
			const lang = i18n.getLanguage()
			return t['name_' + lang] || t.name || ''
		},
		// 当前档位图标（emoji）
		currentTierIcon() {
			return (this.currentTier && this.currentTier.icon) || '👤'
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
		// 监听金币/积分到期清零事件（push 推送 days=0 时触发）
		uni.$on('balanceExpired', this.onBalanceExpired)
	},

	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
		uni.$off('balanceExpired', this.onBalanceExpired)
	},

	methods: {
		onLanguageChanged() {
			this.langVersion++
		},

		// 收到金币/积分到期清零推送时刷新余额
		async onBalanceExpired(payload) {
			console.log('[member] balanceExpired:', payload)
			try {
				// 重新拉 /users/me 拿最新 coin_balance / point_balance
				const memberRes = await getMemberInfo()
				if (memberRes && memberRes.code === 0 && memberRes.data) {
					const info = memberRes.data
					this.userBalance = info.coin_balance ?? 0
					this.userPoints = info.point_balance ?? 0
					this.pendingPoints = info.pending_points ?? 0
				}
			} catch (e) {
				console.warn('[member] refresh after expiry failed:', e)
			}
		},

		// 按语言取档位名（用于模板循环渲染各档位时）
		getTierName(tier) {
			if (!tier) return ''
			const lang = i18n.getLanguage()
			return tier['name_' + lang] || tier.name || ''
		},
		// 按语言取档位描述
		getTierDescription(tier) {
			if (!tier) return ''
			const lang = i18n.getLanguage()
			return tier['description_' + lang] || tier.description || ''
		},
		// 按语言取升级奖励文案（动画展示用）
		getTierRewardText(tier) {
			if (!tier) return ''
			const lang = i18n.getLanguage()
			return tier['reward_text_' + lang] || tier.reward_text || ''
		},
		// 取当前用户 currentTierCode 在档位列表中的序号（0=最低）
		getTierSortIndex(code) {
			if (!code || this.membershipTiers.length === 0) return 0
			const idx = this.membershipTiers.findIndex(t => t.code === code)
			return idx >= 0 ? idx : 0
		},

		// 经营品类枚举 → 多语言文案（未识别返回空，避免显示英文枚举）
		getBusinessTypeText(types, fallback) {
			if (!types || !Array.isArray(types) || types.length === 0) {
				return fallback ? [fallback] : []
			}
			const typeKeyMap = {
				'HOTPOT': 'hotpot',
				'HOTPOT_BUFFET': 'hotpot',
				'HOTPOT_PER_ITEM': 'hotpot',
				'BBQ': 'barbecue',
				'BARBECUE': 'barbecue',
				'MALA_TANG': 'malaTang',
				'MALATANG': 'malaTang',
				'BEVERAGE': 'beverage',
				'SEAFOOD_NOODLES': 'seafoodNoodle',
				'SEAFOOD_NOODLE': 'seafoodNoodle',
				'SINEFOOD_NOODLE': 'seafoodNoodle',
				'SINEFOOD_NOODLES': 'seafoodNoodle',
				'HOSTEL_ROOM': 'hostel',
				'HOSTEL_HOTPOT': 'hostelHotpot',
				'HOSTEL_COFFEE': 'hostelCoffee'
			}
			const result = types.map(t => {
				const key = typeKeyMap[t]
				return key ? this.i18n.t(`storeSelect.businessTypes.${key}`) : ''
			}).filter(Boolean)
			// 全部未识别时，用 fallback（门店名）兜底
			if (result.length === 0 && fallback) return [fallback]
			return result
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
			} else if (type === 'exchange') {
				// 金币换积分功能(积分商城第 3 个 Tab)
				uni.navigateTo({
					url: '/pages/points-mall/index?tab=2'
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
					getMembershipTiers(),
					getMyCoupons({ status: 'UNUSED' }),
					getStores({ limit: 3 }),
				])

				const [memberInfoRes, progressRes, tiersRes, couponsRes, storesRes] = results;

				// balance & points from getMemberInfo
				if (memberInfoRes.status === 'fulfilled' && memberInfoRes.value.code === 0 && memberInfoRes.value.data) {
					const info = memberInfoRes.value.data
					this.userBalance = info.coin_balance ?? 0
					this.userPoints = info.point_balance ?? 0
					this.pendingPoints = info.pending_points ?? 0
				}

				// 档位配置（动态）
				if (tiersRes.status === 'fulfilled' && tiersRes.value.code === 0 && tiersRes.value.data) {
					this.membershipTiers = (tiersRes.value.data.tiers || []).filter(t => t.is_active !== false)
				}

				// 会员等级进度（动态档位）
				if (progressRes.status === 'fulfilled' && progressRes.value.code === 0 && progressRes.value.data) {
					const d = progressRes.value.data

					// 新接口字段：current_tier_code / next_tier_code / tier_updated_at
					// 新接口字段（兼容多种字段名）
					this.currentTierCode = d.current_tier_code || d.current_tier || d.tier_code || d.membership_tier || ''
					this.nextTierCode = d.next_tier_code || ''
					this.currentLevelValue = Number(d.current_level) || 0
					this.tierUpdatedAt = d.tier_updated_at || null

					// 兼容老字段
					this.consumedAmount =
						d.total_spent ||
						d.current_spent ||
						d.spent_amount ||
						d.current_progress ||
						0
					// 下一档升级阈值（新接口字段 next_upgrade_threshold）
					if (d.next_upgrade_threshold) {
						this.totalAmount = d.next_upgrade_threshold
					} else if (this.nextTier && this.nextTier.upgrade_threshold) {
						this.totalAmount = this.nextTier.upgrade_threshold
					}

					// 判断是否刚升级 → 弹动画
					this.checkAndShowUpgradeAnimation()
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
						tags: this.getBusinessTypeText(s.business_types, s.name)
					}))
				}

			} catch (e) {
				console.error('loadMemberData error:', e)
			} finally {
				// 加载完成（不管成功/失败），关闭 loading，让模板渲染最终状态
				this.tierLoading = false
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

		// 检查是否刚升级（tierUpdatedAt 比上次访问记录新），如果刚升级 → 弹动画
		checkAndShowUpgradeAnimation() {
			if (!this.tierUpdatedAt) return
			// 跳过普通档（REGULAR）：升到普通不算升级
			if (this.currentTierCode === 'REGULAR' || !this.currentTierCode) return
			// 必须有档位配置（用于动画展示）
			if (!this.currentTier) return

			const UPGRADE_KEY = 'siamfeast_last_tier_updated_at'
			let lastSeen = ''
			try {
				lastSeen = uni.getStorageSync(UPGRADE_KEY) || ''
			} catch (e) {}

			// 没记录过（首次安装/清缓存）→ 不弹（避免老用户首次打开都弹）
			// 但如果是后端刚迁移后第一次访问（PLATINUM→VIP 那 16 个用户），允许弹
			if (!lastSeen) {
				this.markTierSeen()
				return
			}

			// tierUpdatedAt 比上次新 → 弹动画
			if (this.tierUpdatedAt > lastSeen) {
				this.showUpgradeAnimation = true
			}
			this.markTierSeen()
		},

		markTierSeen() {
			const UPGRADE_KEY = 'siamfeast_last_tier_updated_at'
			try {
				uni.setStorageSync(UPGRADE_KEY, this.tierUpdatedAt || new Date().toISOString())
			} catch (e) {}
		},

		// 兼容旧调用（保留避免代码报错）
		hasSeenUpgradeAnimation() {
			return false
		},

		markUpgradeAnimationShown() {
			this.markTierSeen()
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

/* 加载骨架 */
.member-level-skeleton {
	display: flex;
	flex-direction: column;
	gap: 10px;
	min-height: 100px;
}
.skeleton-line {
	background: linear-gradient(90deg, rgba(147, 108, 42, 0.06) 25%, rgba(147, 108, 42, 0.12) 50%, rgba(147, 108, 42, 0.06) 75%);
	background-size: 200% 100%;
	animation: skeleton-shimmer 1.4s ease-in-out infinite;
	border-radius: 6px;
}
.skeleton-title { width: 40%; height: 18px; align-self: center; }
.skeleton-status { width: 30%; height: 16px; align-self: center; }
.skeleton-bar { width: 100%; height: 6px; margin-top: 6px; }
@keyframes skeleton-shimmer {
	0% { background-position: 200% 0; }
	100% { background-position: -200% 0; }
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
	align-items: center;
	margin-bottom: 12px;
	gap: 8px;
}

/* 动态档位图标 */
.level-tier-icon {
	font-size: 32px;
	line-height: 1;
	opacity: 0.8;
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
	position: relative;
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

/* 待激活积分标记 */
.stat-pending {
	position: absolute;
	top: -4px;
	right: 8px;
	font-size: 11px;
	color: #FFFFFF;
	background: linear-gradient(135deg, #F2B131 0%, #FF8A00 100%);
	padding: 1px 6px;
	border-radius: 8px;
	font-weight: 600;
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
	flex: 1;
	min-width: 0;
	transition: transform 0.15s ease;
}

.feature-tab:active {
	transform: scale(0.95);
}

.feature-icon {
	width: 24px;
	height: 24px;
	padding: 8px;
	border-radius: 12px;
	background-color: #FFF8E1;
	box-sizing: content-box;
}

.feature-text {
	font-size: 12px;
	color: #00000099;
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

/* 金卡档：暖金渐变（沿用原铂金视觉） */
/* 第 2 档（金卡级别）：暖金渐变 — sort_order=1 */
.member-level-section.tier-level-1 {
	background: linear-gradient(135deg, #FFF1C9 0%, #F5D77A 35%, #E8B547 70%, #C9892D 100%) !important;
	border-color: rgba(201, 137, 45, 0.5) !important;
}
.member-level-section.tier-level-1 .level-status,
.member-level-section.tier-level-1 .progress-text,
.member-level-section.tier-level-1 .benefit-text {
	color: #6b3a10 !important;
}
.member-level-section.tier-level-1 .benefit-text {
	border-color: rgba(107, 58, 16, 0.2) !important;
	background-color: rgba(107, 58, 16, 0.08) !important;
}

/* 第 3 档（VIP 级别）：深金棕渐变 — sort_order=2 */
.member-level-section.tier-level-2 {
	background: linear-gradient(135deg, #E8D5AA 0%, #B89055 30%, #8B5E2A 70%, #5D3A10 100%) !important;
	border-color: rgba(93, 58, 16, 0.6) !important;
}
.member-level-section.tier-level-2 .level-title {
	color: rgba(255, 248, 231, 0.6);
}
.member-level-section.tier-level-2 .level-title.level-active {
	color: #FFFFFF;
}
.member-level-section.tier-level-2 .level-status,
.member-level-section.tier-level-2 .progress-text,
.member-level-section.tier-level-2 .benefit-text {
	color: #FFFFFF !important;
}
.member-level-section.tier-level-2 .benefit-text {
	border-color: rgba(255, 255, 255, 0.25) !important;
	background-color: rgba(255, 255, 255, 0.12) !important;
}
.member-level-section.tier-level-2 .upgrade-btn {
	background-color: #FFFFFF !important;
}
.member-level-section.tier-level-2 .upgrade-text {
	color: #6b3a10 !important;
}

/* 第 4 档（钻石级别）：紫钻渐变 — sort_order=3（预留） */
.member-level-section.tier-level-3 {
	background: linear-gradient(135deg, #E0E0E0 0%, #B0BEC5 30%, #78909C 70%, #37474F 100%) !important;
	border-color: rgba(55, 71, 79, 0.6) !important;
}
.member-level-section.tier-level-3 .level-title { color: rgba(255, 255, 255, 0.6); }
.member-level-section.tier-level-3 .level-title.level-active { color: #FFFFFF; }
.member-level-section.tier-level-3 .level-status,
.member-level-section.tier-level-3 .progress-text,
.member-level-section.tier-level-3 .benefit-text { color: #FFFFFF !important; }
.member-level-section.tier-level-3 .benefit-text {
	border-color: rgba(255, 255, 255, 0.25) !important;
	background-color: rgba(255, 255, 255, 0.12) !important;
}

/* 第 5 档（黑钻级别）：深黑渐变 — sort_order=4（预留） */
.member-level-section.tier-level-4 {
	background: linear-gradient(135deg, #424242 0%, #212121 100%) !important;
	border-color: rgba(255, 215, 0, 0.5) !important;
}
.member-level-section.tier-level-4 .level-title { color: rgba(255, 215, 0, 0.6); }
.member-level-section.tier-level-4 .level-title.level-active { color: #FFD700; }
.member-level-section.tier-level-4 .level-status,
.member-level-section.tier-level-4 .progress-text,
.member-level-section.tier-level-4 .benefit-text { color: #FFD700 !important; }
</style>
