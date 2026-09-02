<template>
	<view class="index-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<!-- 门店选择 -->
			<view class="store-selector" @click="handleLocationClick">
				<image class="location-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
					<image v-if="currentStoreLogo" class="store-logo" :src="currentStoreLogo" mode="aspectFill"></image>
					<text class='store-name'>{{ currentLocation || t('index.notLocated') }}</text>
				<view class="arrow-wrapper">
					<image class="arrow-icon" src="/static/icons/arrow-down.svg" mode="aspectFit"></image>
				</view>
			</view>
			<!-- 右侧图标 -->
			<view class="nav-icons">
				<view class="nav-icon-btn" @click="goToMemberCode">
					<image class="icon-img" src="/static/icons/qr-code.svg" mode="aspectFit"></image>
				</view>
				<view class="nav-icon-btn" @click="handleLanguageClick">
					<image class="icon-img" src="/static/icons/global.svg" mode="aspectFit"></image>
				</view>
				<view class="nav-icon-btn" @click="handleMessageClick">
					<image class="icon-img" src="/static/icons/message.svg" mode="aspectFit"></image>
					<view class="unread-dot" v-if="hasUnread"></view>
				</view>
			</view>
		</view>

		<!-- 内容滚动区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 顶部轮播图 -->
			<swiper
				v-if="banners.length > 0"
				class="top-banner"
				:indicator-dots="banners.length > 1"
				indicator-color="rgba(255,255,255,0.5)"
				indicator-active-color="#FFD23D"
				:autoplay="true"
				:interval="4000"
				:duration="500"
				circular
			>
				<swiper-item
					v-for="banner in banners"
					:key="banner.id"
				>
					<image
						class="banner-image"
						:src="banner.image_url"
						mode="aspectFill"
						@click.stop="handleBannerClick(banner)"
					></image>
					<!-- SPECIAL_DATE 活动今日可领标记 -->
					<view v-if="isClaimableToday(banner.campaign)" class="banner-today-badge">
						<text class="banner-today-badge-text">{{ t('campaign.claimableToday') }}</text>
					</view>
					<!-- 适用范围徽章：全部门店 / 指定门店 N 家 -->
					<view v-if="bannerScopeText(banner)" class="banner-scope-badge">
						<text class="banner-scope-badge-text">{{ bannerScopeText(banner) }}</text>
					</view>
					<!-- 标题文字（不遮挡图片，浮在图片下方） -->
					<view v-if="bannerTitleText(banner)" class="banner-title-bar">
						<text class="banner-title-text">{{ bannerTitleText(banner) }}</text>
					</view>
				</swiper-item>
			</swiper>
			<view v-else class="top-banner">
				<image class="banner-image" src="/static/images/banner-placeholder.svg" mode="aspectFill"></image>
			</view>

			<!-- 堂食 Tab（临时隐藏：APP 内点餐暂未开放） -->
			<view class="main-tabs" v-if="SHOW_ORDERING_ENTRIES">
				<view class="main-tabs-wrapper">
					<view
						class="main-tab-item"
						:class="{ 'main-tab-active': activeMainTab === 0 }"
						@click="switchMainTab(0)"
					>
						<view class="tab-content">
							<text class="tab-title">{{ t('index.dineIn') }}</text>
							<text class="tab-subtitle">{{ t('index.dineInDesc') }}</text>
						</view>
						<image class="tab-icon" src="/static/icons/dine-in.svg" mode="aspectFit"></image>
					</view>
				</view>
			</view>

			<!-- 会员信息卡片 -->
			<view class="member-card" :class="{ 'member-card-no-tabs': !SHOW_ORDERING_ENTRIES }">
				<view class="member-left" @click="goSettings">
					<image class="member-avatar" :src="memberInfo.avatar_url || '/static/images/04_default_avatar.png'" mode="aspectFill"></image>
					<view class="member-info">
						<text class="member-name">{{ memberInfo.nickname || t('mine.guest') }}</text>
						<view class="member-level">
							<text class="level-text">{{ memberLevelText }}</text>
						</view>
					</view>
				</view>
				<view class="member-stats">
					<view class="stat-item" @click="handleCouponClick">
						<text class="stat-num">{{ couponCount }}</text>
						<text class="stat-label">{{ t('index.coupons') }}</text>
					</view>
					<view class="stat-item" @click="handleFeature('coins')">
						<text class="stat-num">{{ coinBalance }}</text>
						<text class="stat-label">{{ t('index.coins') }}</text>
					</view>
					<view class="stat-item" @click="handleFeature('points')">
						<text class="stat-num">{{ points }}</text>
						<text class="stat-label">{{ t('index.points') }}</text>
					</view>
				</view>
			</view>

			<!-- 功能入口区域（原布局：新品大卡 + 热销/兑换小卡；点餐入口开放时显示） -->
			<view class="feature-section" v-if="SHOW_ORDERING_ENTRIES">
				<!-- 左侧新品上市 -->
				<view class="feature-card feature-left" @click="handleFeature('new')">
					<view class="feature-content">
						<text class="feature-title">{{ t('index.newProducts') }}</text>
						<text class="feature-subtitle">{{ t('index.newProductsDesc') }}</text>
					</view>
					<image
						v-if="newProducts.length > 0"
						class="feature-icon"
						:src="newProducts[0].image_url || '/static/images/img-placeholder.svg'"
						mode="aspectFit"
					></image>
					<image v-else class="feature-icon" src="/static/icons/new-product.svg" mode="aspectFit"></image>
				</view>
				<!-- 右侧热销榜单和兑换商城 -->
				<view class="feature-right">
					<view class="feature-small" @click="handleFeature('hot')">
						<view class="feature-small-content">
							<text class="feature-small-title">{{ t('index.hotList') }}</text>
							<text class="feature-small-subtitle">{{ t('index.hotListDesc') }}</text>
						</view>
						<image
							v-if="hotProducts.length > 0"
							class="feature-small-icon"
							:src="hotProducts[0].image_url || '/static/images/img-placeholder.svg'"
							mode="aspectFit"
						></image>
						<image v-else class="feature-small-icon" src="/static/icons/hot-rank.svg" mode="aspectFit"></image>
					</view>
					<view class="feature-small" @click="handleFeature('points')">
						<view class="feature-small-content">
							<text class="feature-small-title">{{ t('index.pointsMall') }}</text>
							<text class="feature-small-subtitle">{{ t('index.pointsMallDesc') }}</text>
						</view>
						<image class="feature-small-icon" src="/static/icons/points-mall.svg" mode="aspectFit"></image>
					</view>
				</view>
			</view>

			<!-- 兑换商城横条（点餐入口临时下线期间的功能入口，全宽单行） -->
			<view class="redeem-banner" v-if="!SHOW_ORDERING_ENTRIES" @click="handleFeature('points')">
				<view class="redeem-banner-icon-wrap">
					<image class="redeem-banner-icon" src="/static/icons/redeem-coin.svg" mode="aspectFit"></image>
				</view>
				<view class="redeem-banner-content">
					<text class="redeem-banner-title">{{ t('index.pointsMall') }}</text>
					<text class="redeem-banner-subtitle">{{ t('index.pointsMallDesc') }}</text>
				</view>
				<view class="redeem-banner-arrow-wrap">
					<image class="redeem-banner-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
				</view>
			</view>

			<!-- 邀请好友拓客卡片 -->
			<view class="invite-card" v-if="referralCode">
				<view class="invite-card-header">
					<image class="invite-card-icon" src="/static/icons/invite.svg" mode="aspectFit"></image>
					<text class="invite-card-title">{{ t('mine.inviteFriends') }}</text>
				</view>
				<!-- 邀请码 + 分享链接按钮 -->
				<view class="invite-card-code-row">
					<text class="invite-card-code-label">{{ t('mine.myCode') }}</text>
					<text class="invite-card-code">{{ referralCode }}</text>
					<view class="invite-card-copy-btn" @click.stop="shareInviteLink">
						<text class="invite-card-copy-text">{{ t('mine.shareToLine') }}</text>
					</view>
				</view>
				<!-- 统计数据 -->
				<view class="invite-card-stats">
					<view class="invite-stat-item">
						<text class="invite-stat-num">{{ referralInfo.total_referees || 0 }}</text>
						<text class="invite-stat-label">{{ t('mine.invited') }}</text>
					</view>
					<view class="invite-stat-divider"></view>
					<view class="invite-stat-item">
						<text class="invite-stat-num">{{ referralInfo.total_coins_earned || 0 }}</text>
						<text class="invite-stat-label">{{ t('mine.coinsEarned') }}</text>
					</view>
					<view class="invite-stat-divider"></view>
					<view class="invite-stat-item" v-if="referralInfo.pending_count > 0">
						<text class="invite-stat-num">{{ referralInfo.pending_count }}</text>
						<text class="invite-stat-label">{{ t('mine.pending') }}</text>
					</view>
				</view>
				<!-- 任务进度（直接展示，不跳转） -->
				<view class="invite-card-tasks" v-if="taskList.length > 0">
					<!-- 迭代变量用 task：避免 v-for="t in ..." 遮蔽翻译方法 t() 导致渲染崩溃 -->
					<view
						class="invite-task-row"
						:class="getTaskStatusClass(task)"
						v-for="task in taskList"
						:key="task.id"
					>
						<view class="invite-task-left">
							<text class="invite-task-name">{{ getTaskName(task) }}</text>
							<text class="invite-task-reward">+{{ task.task.reward_amount }} {{ task.task.reward_type === 'POINT' ? t('index.points') : t('mine.coinUnit') }}</text>
						</view>
						<view class="invite-task-right" v-if="!task._locked">
							<view class="invite-task-progress-bar">
								<view class="invite-task-progress-fill" :style="{ width: Math.min(100, (task.progress / task.task.target_count) * 100) + '%' }"></view>
							</view>
							<text class="invite-task-progress-text">{{ getTaskStatusText(task) }}</text>
						</view>
						<view class="invite-task-right" v-else>
							<image class="invite-task-lock-icon" src="/static/icons/lock.svg" mode="aspectFit"></image>
							<text class="invite-task-locked-text">{{ getTaskStatusText(task) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 活动小条列表 -->
			<view class="campaign-strip-section" v-if="activeCampaigns.length > 0">
				<!-- 区块标题 + 查看全部入口 -->
				<view class="campaign-section-header">
					<view class="campaign-section-title-row">
						<view class="campaign-section-title-bar"></view>
						<text class="campaign-section-title">{{ t('campaignCenter.title') }}</text>
					</view>
					<view class="campaign-section-more" @click="goCampaignCenter">
						<text class="campaign-section-more-text">{{ t('campaignCenter.viewAll') }}</text>
						<image class="campaign-section-more-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
					</view>
				</view>
				<view
					class="campaign-strip"
					v-for="camp in activeCampaigns"
					:key="camp.id"
					@click="openCampaign(camp)"
				>
					<view class="campaign-strip-left">
						<text class="campaign-strip-type-tag" :class="'tag-' + getCampaignSimpleType(camp)">{{ getCampaignSimpleTypeName(camp) }}</text>
						<view class="campaign-strip-info">
							<text class="campaign-strip-name">{{ getCampaignDisplayName(camp) }}</text>
							<text class="campaign-strip-desc">{{ getCampaignSimpleDesc(camp) }}</text>
						</view>
					</view>
					<view class="campaign-strip-right">
						<view class="campaign-strip-btn" v-if="hasCampaignCoupon(camp)" @click.stop="openCampaign(camp)">
							<text class="campaign-strip-btn-text">{{ t('campaign.claimNow') }}</text>
						</view>
						<text class="campaign-strip-arrow" v-else>›</text>
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="0"></custom-tabbar>

		<!-- 分享链接跳转确认弹窗 -->
		<share-modal
			:visible="showShareModal"
			:shareInfo="shareInfo"
			@close="handleShareModalClose"
			@confirm="handleShareModalConfirm"
		></share-modal>

		<!-- 语言切换弹窗 -->
		<language-modal
			:visible="showLanguageModal"
			@close="handleLanguageModalClose"
			@change="handleLanguageChange"
		></language-modal>

		<!-- 横幅介绍图弹窗(支持多图滑动)-->
		<banner-detail-modal
			:visible="showBannerDetail"
			:images="currentBannerDetailImages"
			@close="handleBannerDetailClose"
		></banner-detail-modal>

		<!-- 活动详情弹窗(DISCOUNT/FULL_REDUCTION/COUPON_GRANT)-->
		<campaign-detail-modal
			:visible="showCampaignDetail"
			:campaign="currentCampaign"
			@close="handleCampaignDetailClose"
			@claimed="handleCampaignClaimed"
		></campaign-detail-modal>

		<!-- 生日奖励弹窗 -->
		<birthday-modal
			:visible="showBirthdayModal"
			:rewardType="birthdayRewardType"
			:rewardAmount="birthdayRewardAmount"
			@close="closeBirthdayModal"
			@claimed="handleBirthdayClaimed"
		></birthday-modal>
	</view>
</template>

<script>
import { showToast, fixMinioUrl } from '@/utils/index.js'
import { parseShareLink, clearShareParams, ShareType } from '@/utils/share.js'
import CustomTabbar from '@/components/custom-tabbar.vue'
import ShareModal from '@/components/share-modal.vue'
import LanguageModal from '@/components/language-modal.vue'
import BannerDetailModal from '@/components/banner-detail-modal.vue'
import CampaignDetailModal from '@/components/campaign-detail-modal.vue'
import BirthdayModal from '@/components/birthday-modal.vue'
import appStore from '@/store/index.js'
import i18n from '@/i18n/index.js'
import {
	getHomeBanners,
	getMemberInfo,
	getMyCoupons,
	getNewProducts,
	getHotProducts
} from '@/api/index.js'
import { getMemberProgress, getMembershipTiers } from '@/api/services/member.js'
import { getUnreadCount } from '@/api/services/notification.js'
import { getUserInfo } from '@/api/services/auth.js'
import { getStore } from '@/api/services/store.js'
import { getMyReferralInfo } from '@/api/services/referral.js'
import { shareInviteToLine, buildInviteUrl } from '@/utils/lineShare.js'
import { getTasks } from '@/api/services/tasks.js'
import { getActiveCampaigns } from '@/api/services/campaign.js'
import { ORDERING_ENABLED as SHOW_ORDERING_ENTRIES } from '@/utils/featureFlags.js'

export default {
	components: {
		CustomTabbar,
		ShareModal,
		LanguageModal,
		BannerDetailModal,
		CampaignDetailModal,
		BirthdayModal
	},
	data() {
		return {
			i18n: i18n,
			// 点餐入口显隐开关（模块常量注入模板用）
			SHOW_ORDERING_ENTRIES: SHOW_ORDERING_ENTRIES,
			statusBarHeight: 20,
			contentHeight: 500,
				currentLocation: '',
				currentStoreLogo: '',
			currentStoreId: null,
			activeMainTab: 0,
			showShareModal: false,
			showLanguageModal: false,
			showBannerDetail: false,
			currentBannerDetailImages: [],
			showCampaignDetail: false,
			currentCampaign: {},
			showBirthdayModal: false,
			birthdayRewardType: 'COIN',
			birthdayRewardAmount: 0,
			banners: [],
				langVersion: 0,
				memberInfo: {},
			membershipTiers: [],       // 动态档位配置
			currentTierCode: '',       // 当前用户档位 code
			couponCount: 0,
			coinBalance: 0,
			points: 0,
			unreadCount: 0,
			newProducts: [],
			hotProducts: [],
			// 邀请码拓客
			referralCode: '',
			referralInfo: {},
			taskList: [],
			activeCampaigns: [],
			shareInfo: {
				type: '',
				id: '',
				name: '',
				price: undefined,
				image: '',
				shopId: '',
				shopName: ''
			}
		}
	},
	onLoad(options) {
		// 启动时检查登录态：没 token 直接跳登录页
		const token = uni.getStorageSync('siamfeast_token')
		if (!token) {
			// 分享链接直达：H5 直接访问 hash 路由时，uni-app 会先初始化入口页（pages/index/index）
			// 此时如果直接 reLaunch 到 /pages/login/index，会丢失用户原本要去的路径（如 register?invite_code=XXX）
			// 解决：读当前 hash 路径，若是 login 子页（含 register），尊重目标并保留 query
			// #ifdef H5
			try {
				const hash = (window.location.hash || '').replace(/^#/, '')  // 形如 /pages/login/register?invite_code=XXX
				if (hash && hash.startsWith('/pages/login/')) {
					const [path, queryStr] = hash.split('?')
					const target = path + (queryStr ? '?' + queryStr : '')
					console.log('[home] no token, respect target route:', target)
					uni.reLaunch({ url: target })
					return
				}
			} catch (e) {}
			// #endif
			console.log('[home] no token, redirect to login')
			uni.reLaunch({ url: '/pages/login/index' })
			return
		}
		this.initPage()
			// Pre-populate memberInfo from cache for instant avatar display
			const cachedUser = appStore.getUserInfo()
			if (cachedUser) this.memberInfo = cachedUser
		this.checkShareLink(options)
		this.loadBanners()
		this.loadHomeData()
		// 监听门店选择事件
		uni.$on('storeSelected', this.handleStoreSelected)
			uni.$on("languageChanged", () => { this.langVersion++; this.initStoreInfo() })
		// 监听 App.vue 的生日奖励事件
		uni.$on('showBirthdayModal', this.onBirthdayShow)
		// 兜底：冷启动时序竞态—— App.onShow 可能在首页 onLoad 之前 emit 事件
		// 此时主动从 globalData 取一次 pending payload
		const pending = getApp().globalData && getApp().globalData.pendingBirthdayPayload
		if (pending) {
			getApp().globalData.pendingBirthdayPayload = null
			this.$nextTick(() => this.onBirthdayShow(pending))
		}
		// 初始化门店信息
		this.initStoreInfo()
	},
	onUnload() {
		// 移除事件监听
		uni.$off('storeSelected', this.handleStoreSelected)
			uni.$off("languageChanged")
		uni.$off('showBirthdayModal', this.onBirthdayShow)
	},
	onShow() {
		// #ifdef APP-PLUS
		uni.hideTabBar({ animation: false, fail: () => {} })
		// #endif
		uni.$emit("tabbarUpdate")
		// 未登录时不请求任何接口(避免登录页时首页 onShow 触发网络错误)
		const token = uni.getStorageSync('siamfeast_token')
		if (!token) return
		// 每次显示时刷新会员数据和统计
		this.loadMemberData()
		this.loadUnreadCount()
		// 兜底：取出 App.vue 在首页 onLoad 之前 emit 的事件 payload（防冷启动时序竞态）
		const app = getApp()
		const pending = app && app.globalData && app.globalData.pendingBirthdayPayload
		if (pending) {
			app.globalData.pendingBirthdayPayload = null
			this.onBirthdayShow(pending)
		}
		// 主动触发一次生日检查（30 秒节流，避免频繁请求）
		// 覆盖场景：登录前进入过首页 → 登录后回到首页（此时 App.onShow 已 skip）
		app && app.checkBirthday && app.checkBirthday()
	},
	computed: {
		hasUnread() {
			return this.unreadCount > 0
		},
			memberLevelText() {
				const t = this.t.bind(this)
				void this.langVersion   // 响应语言切换：触发 computed 重算
				// 优先用动态档位配置（按当前语言）
				const tierCode = this.memberInfo?.membership_tier || this.currentTierCode
				if (tierCode && this.membershipTiers.length > 0) {
					const tier = this.membershipTiers.find(x => x.code === tierCode)
					if (tier) {
						const lang = i18n.getLanguage()
						return tier['name_' + lang] || tier.name || ''
					}
				}
				// 兜底：档位配置未加载
				return t("member.normal") || "普通会员"
			}
	},
	methods: {
			t(key, params) {
				this.langVersion; // reactive dependency
				return i18n.t(key, params)
			},
		/**
		 * 加载首页轮播图
		 */
		async loadBanners() {
			// 未登录时不请求(避免登录页报错)
			if (!uni.getStorageSync('siamfeast_token')) return
			try {
				const res = await getHomeBanners()
				let banners = (res.data.items || res.data || [])

				// 后端在活动失效（PAUSED/过期/窗口外）时把内嵌 campaign 置 null
				// 前端按 isBannerActiveToday 判定是否显示，不需要额外补全 campaign
				this.banners = banners
					.filter(b => this.isBannerActiveToday(b))
					.map(b => {
						// 后端字段 detail_images 是 JSONB 数组（字符串 URL/file_key 数组）
						let detailImages = []
						if (Array.isArray(b.detail_images)) {
							detailImages = b.detail_images.map(u => fixMinioUrl(u)).filter(Boolean)
						} else if (typeof b.detail_images === 'string') {
							// 兜底：后端偶尔可能返回 JSON 字符串
							try {
								const parsed = JSON.parse(b.detail_images)
								if (Array.isArray(parsed)) {
									detailImages = parsed.map(u => fixMinioUrl(u)).filter(Boolean)
								}
							} catch (e) {}
						}
						// 兼容老字段 detail_image_url（如果后端某些环境还在用）
						if (detailImages.length === 0 && b.detail_image_url) {
							detailImages = [fixMinioUrl(b.detail_image_url)]
						}
						return {
							...b,
							image_url: fixMinioUrl(b.image_url),
							detail_images: detailImages
						}
					})
			} catch (e) {
				console.error('loadBanners error:', e)
				this.banners = []
			}
		},

		/**
		 * 轮播图点击
		 * 优先级:
		 *   1. campaign_id(关联活动)→ 弹活动详情弹窗
		 *   2. detail_images(多图介绍)→ 弹图片弹窗
		 *   3. link_type(PAGE/PRODUCT/STORE)→ 跳转
		 */
		/**
		 * 判断 banner 今日是否应展示
		 * 规则：
		 * 1. 未关联活动（campaign_id 为空 / campaign 为空）→ 始终展示
		 * 2. 关联活动但非 SPECIAL_DATE → 检查活动 start_date ~ end_date 区间
		 * 3. 关联 SPECIAL_DATE 活动 → 必须命中 date_patterns（双号日 / 单日 / 区间）
		 *    （SPECIAL_DATE 的 end_date 通常配到 2099 年，不能用作判断依据）
		 */
		isBannerActiveToday(banner) {
			if (!banner) return false
			const c = banner.campaign
			// 纯图 banner（无关联活动）→ 始终展示
			if (!banner.campaign_id) return true
			// 关联活动但 campaign 为 null（活动已 PAUSED/过期/窗口外）→ 退回纯图展示
			// （运营要彻底下线应停用 banner 本身；活动失效不该让首页轮播整个消失）
			if (!c) return true
			// SPECIAL_DATE → 必须命中 date_patterns（不依赖 coupon_ids）
			const type = c.type || c.campaign_type
			if (type === 'SPECIAL_DATE') {
				return this.isClaimableToday(c)
			}
			// 其他活动类型 → 检查活动有效期（start_date / end_date）
			const now = Date.now()
			const start = c.start_date ? new Date(c.start_date).getTime() : 0
			const end = c.end_date ? new Date(c.end_date).getTime() : Number.MAX_SAFE_INTEGER
			return now >= start && now <= end
		},

		/**
		 * SPECIAL_DATE 活动今日可领本地预判（时区 Asia/Bangkok UTC+7）
		 * 仅用于列表标记，最终可领状态以服务端 date_matched 为准
		 */
		isClaimableToday(campaign) {
			if (!campaign || campaign.type !== 'SPECIAL_DATE') return false
			const rules = campaign.rules || {}
			// 显示判定只看 date_patterns 与曼谷当天的匹配，不依赖 coupon_ids
			// 纯折扣/纯奖励的特殊日期活动（无券）也应显示
			const patterns = rules.date_patterns || []
			if (patterns.length === 0) return false
			// 取 Asia/Bangkok 时区的 MM-DD
			const now = new Date()
			const bangkokDate = new Date(now.getTime() + (now.getTimezoneOffset() + 420) * 60000)
			const mm = String(bangkokDate.getUTCMonth() + 1).padStart(2, '0')
			const dd = String(bangkokDate.getUTCDate()).padStart(2, '0')
			const today = `${mm}-${dd}`
			// 命中条件：patterns 包含 today，或包含 "**-**" 且 mm === dd
			// 注：双号日 = 重号日（月与日相同，如 8.8、9.9），产品确认的语义
			if (patterns.includes(today)) return true
			if (patterns.includes('**-**') && mm === dd) return true
			// 区间模式：MM-DD~MM-DD（含跨年，开始>结束）
			const ord = (m, d) => m * 32 + d
			const curM = parseInt(mm, 10)
			const curD = parseInt(dd, 10)
			const curOrd = ord(curM, curD)
			for (const p of patterns) {
				if (!p.includes('~')) continue
				const [start, end] = p.split('~')
				const [sm, sd] = start.split('-').map(n => parseInt(n, 10))
				const [em, ed] = end.split('-').map(n => parseInt(n, 10))
				const sOrd = ord(sm, sd)
				const eOrd = ord(em, ed)
				if (sOrd <= eOrd) {
					// 正常区间：s <= cur <= e
					if (curOrd >= sOrd && curOrd <= eOrd) return true
				} else {
					// 跨年区间：cur >= s 或 cur <= e
					if (curOrd >= sOrd || curOrd <= eOrd) return true
				}
			}
			return false
		},

		/**
		 * 横幅标题文字（多语言，不展示纯图时给文字 fallback）
		 * 优先取 banner 多语言标题；都没有则取关联 campaign 的多语言名
		 */
		bannerTitleText(banner) {
			if (!banner) return ''
			const lang = i18n.getLanguage()
			return banner['title_' + lang] || banner.title
				|| (banner.campaign && (banner.campaign['name_' + lang] || banner.campaign.name))
				|| ''
		},

		/**
		 * 横幅适用范围徽章文案
		 * 判断依据：banner.store_id（关联门店）或 campaign 关联门店
		 * - banner.store_id 非空 → "指定门店"
		 * - banner.store_id 为空且 source=MANUAL 或 store_id=null → "全部门店"
		 * 业务含义：开业横幅通常单店，普通横幅通常全门店
		 */
		bannerScopeText(banner) {
			if (!banner) return ''
			// banner 直接关联门店 → 单店横幅
			if (banner.store_id) return this.t('campaign.specificStoresScope')
			// 关联了 campaign：检查 campaign 的门店字段
			const c = banner.campaign
			if (c) {
				// campaign 有 store_id → 单店
				if (c.store_id) return this.t('campaign.specificStoresScope')
				// campaign 有 is_global → 按全局/分店判断
				if (c.is_global === false) return this.t('campaign.specificStoresScope')
				if (c.is_global === true) return this.t('campaign.allStoresScope')
				// campaign 有 applicable_stores 且非空 → 指定门店
				let stores = c.applicable_stores
				if (typeof stores === 'string') {
					try { stores = JSON.parse(stores) } catch (e) { stores = [] }
				}
				if (Array.isArray(stores) && stores.length > 0) {
					return this.t('campaign.applicableStores', { n: stores.length })
				}
			}
			// 无明确范围信息 → 不展示徽章（避免误显示"全部门店"）
			return ''
		},

		handleBannerClick(banner) {
			console.log('[banner-click] banner clicked:', banner.id, 'campaign_id:', banner.campaign_id)
			// 1. 关联了活动 → 弹活动详情
			if (banner.campaign_id && banner.campaign) {
				this.currentCampaign = banner.campaign
				this.showCampaignDetail = true
				return
			}
			// 2. 有详情图 → 弹图片弹窗
			if (Array.isArray(banner.detail_images) && banner.detail_images.length > 0) {
				this.currentBannerDetailImages = banner.detail_images
				this.showBannerDetail = true
				return
			}
			// 3. 走原 link_type 跳转
			const linkType = (banner.link_type || '').toUpperCase()
			if (linkType === 'PAGE' && banner.link_value) {
				uni.navigateTo({ url: banner.link_value })
			} else if (linkType === 'PRODUCT' && banner.link_value) {
				uni.navigateTo({
					url: `/pages/product-detail/index?productId=${banner.link_value}`
				})
			} else if (linkType === 'STORE' && banner.link_value) {
				// 点餐入口临时下线：banner 关联门店不跳店
				if (!ORDERING_ENABLED) {
					showToast(this.t('error.orderingDisabled'))
					return
				}
				uni.navigateTo({
					url: `/pages/dinein/index?shopId=${banner.link_value}`
				})
			}
		},

		handleBannerDetailClose() {
			this.showBannerDetail = false
			this.currentBannerDetailImages = []
		},

		handleCampaignDetailClose() {
			this.showCampaignDetail = false
			this.currentCampaign = {}
		},

		// 抢券成功回调:可以刷新"我的优惠券"数量等
		handleCampaignClaimed(coupon) {
			console.log('[campaign] claimed:', coupon.template_id || coupon.coupon_id)
			// 领券成功 → 刷新优惠券数量（本地 +1 立即生效，再后台拉一次校正）
			this.couponCount += 1
			// 延迟重新拉会员数据（等后端写入完成）
			setTimeout(() => this.loadMemberData(), 500)
		},

		/**
		 * 加载会员数据（信息、积分、优惠券数量）
		 */
		async loadMemberData() {
			if (!uni.getStorageSync('siamfeast_token')) return
			try {

					const [userRes, infoRes, couponsRes, progressRes, tiersRes] = await Promise.allSettled([
						getUserInfo(),
						getMemberInfo(),
						getMyCoupons({ status: 'UNUSED' }),
						getMemberProgress(),
						getMembershipTiers()
					])

				if (userRes.status === 'fulfilled' && userRes.value.code === 0 && userRes.value.data) {
						this.memberInfo = { ...userRes.value.data }
						if (this.memberInfo.avatar_url) this.memberInfo.avatar_url = fixMinioUrl(this.memberInfo.avatar_url)
					}
					if (infoRes.status === 'fulfilled' && infoRes.value.code === 0 && infoRes.value.data) {
						const info = infoRes.value.data
						this.memberInfo = { ...this.memberInfo, ...info }
				this.coinBalance = info.coin_balance ?? 0
				this.points = info.point_balance ?? 0
				}
				if (couponsRes.status === 'fulfilled' && couponsRes.value.code === 0 && couponsRes.value.data) {
					const d = couponsRes.value.data
					const items = d.items || d || []
					this.couponCount = Array.isArray(items) ? items.filter(c => c.status === 'CLAIMED' || c.status === 'ACTIVE' || c.status === 'UNUSED').length : 0
				}
				// 动态档位：读后端配置 + 用户当前档位
				if (tiersRes.status === 'fulfilled' && tiersRes.value.code === 0 && tiersRes.value.data) {
					this.membershipTiers = (tiersRes.value.data.tiers || []).filter(t => t.is_active !== false)
				}
				if (progressRes.status === 'fulfilled' && progressRes.value.code === 0 && progressRes.value.data) {
					const p = progressRes.value.data
					// 新接口字段
					if (p.current_tier_code) {
						this.currentTierCode = p.current_tier_code
						this.memberInfo = { ...this.memberInfo, membership_tier: p.current_tier_code }
					}
				}
			} catch (e) {
				console.error('加载会员数据失败:', e)
			}
			// 加载邀请码信息（不阻塞主流程）
			this.loadReferralInfo()
			this.loadActiveCampaigns()
		},

		async loadReferralInfo() {
			if (!uni.getStorageSync('siamfeast_token')) return
			try {
				const res = await getMyReferralInfo()
				if (res && res.code === 0 && res.data) {
					this.referralCode = res.data.referral_code || ''
					this.referralInfo = res.data
				}
			} catch (e) {
				console.warn('[home] loadReferralInfo failed:', e)
			}
			// 同时拉任务进度
			this.loadTasks()
		},

		async loadTasks() {
			try {
				const res = await getTasks()
				if (res && res.code === 0 && res.data) {
					const items = res.data.items || res.data || []
					// 只展示邀请相关任务（INVITE），按 target_count 升序（3→5→10）
					let tasks = (Array.isArray(items) ? items : [])
						.filter(t => t.task && t.task.task_type === 'INVITE')
						.sort((a, b) => (a.task.target_count || 0) - (b.task.target_count || 0))

					// 计算解锁状态：第一个总是解锁；前一个未完成 → 后一个锁定
					tasks.forEach((t, i) => {
						if (i === 0) {
							t._locked = false
						} else {
							const prev = tasks[i - 1]
							const prevDone = prev.progress >= prev.task.target_count || prev.status === 'COMPLETED' || prev.status === 'CLAIMED'
							t._locked = !prevDone
						}
					})
					this.taskList = tasks
				}
			} catch (e) {
				console.warn('[home] loadTasks failed:', e)
			}
		},

		// 任务状态文案
		getTaskStatusText(t) {
			if (!t) return ''
			if (t._locked) return i18n.t('opening.locked') || '未解锁'
			if (t.progress >= t.task.target_count) {
				if (t.status === 'CLAIMED') return i18n.t('campaign.claimed')
				return i18n.t('opening.claimable') || '可领取'
			}
			return t.progress + '/' + t.task.target_count
		},

		// 任务状态 CSS class
		getTaskStatusClass(t) {
			if (!t) return ''
			if (t._locked) return 'task-locked'
			if (t.progress >= t.task.target_count) return 'task-done'
			return 'task-progress'
		},

		getTaskName(t) {
			if (!t || !t.task) return ''
			const lang = i18n.getLanguage()
			return t.task['name_' + lang] || t.task.name || ''
		},

		// 加载活动列表（首页小条展示）
		async loadActiveCampaigns() {
			try {
				const res = await getActiveCampaigns({ page_size: 10 })
				if (res && res.code === 0 && res.data) {
					const items = res.data.items || res.data || []
					const lang = i18n.getLanguage()
					this.activeCampaigns = (Array.isArray(items) ? items : []).map(c => {
						const rules = typeof c.rules === 'string' ? (() => { try { return JSON.parse(c.rules) } catch (e) { return {} } })() : (c.rules || {})
						return {
							id: c.id,
							type: c.type || c.campaign_type || '',
							name: c['name_' + lang] || c.name || '',
							name_zh: c.name_zh || c.name || '',
							name_en: c.name_en || '',
							name_th: c.name_th || '',
							image_url: c.image_url ? fixMinioUrl(c.image_url) : '',
							rules: rules,
							status: c.status || 'ACTIVE',
							// 原始对象（传给弹窗用）
							_raw: c
						}
					}).filter(c => c.status === 'ACTIVE')
				}
			} catch (e) {
				console.warn('[home] loadActiveCampaigns failed:', e)
			}
		},

		getCampaignSimpleType(camp) {
			const t = String(camp.type || '').toUpperCase()
			if (t === 'DISCOUNT' || t === 'STORE_OPENING') return 'discount'
			if (t === 'FULL_REDUCTION') return 'reduction'
			if (t === 'COUPON_GRANT') return 'coupon'
			if (t === 'SPECIAL_DATE') return 'special'
			return 'other'
		},

		getCampaignSimpleTypeName(camp) {
			const lang = i18n.getLanguage()
			const m = {
				discount: { zh: '折扣', en: 'Sale', th: 'ลด' },
				reduction: { zh: '满减', en: 'Save', th: 'ลด' },
				coupon: { zh: '领券', en: 'Coupon', th: 'คูปอง' },
				special: { zh: '活动', en: 'Event', th: 'โปร' },
				other: { zh: '活动', en: 'Event', th: 'โปร' }
			}
			const key = this.getCampaignSimpleType(camp)
			return (m[key] && m[key][lang]) || key
		},

		getCampaignDisplayName(camp) {
			return camp.name || ''
		},

		getCampaignSimpleDesc(camp) {
			const lang = i18n.getLanguage()
			const r = camp.rules || {}
			const type = String(camp.type || '').toUpperCase()
			// 满减
			if (type === 'FULL_REDUCTION' && r.threshold && r.reduction) {
				if (lang === 'zh') return `满${r.threshold}减${r.reduction}`
				if (lang === 'th') return `ลด${r.reduction}เมื่อซื้อครบ${r.threshold}`
				return `฿${r.reduction} off ฿${r.threshold}`
			}
			// 折扣
			if ((type === 'DISCOUNT' || type === 'STORE_OPENING') && r.discount_percent) {
				if (lang === 'zh') return `全场${r.discount_percent}% off`
				if (lang === 'th') return `ลด${r.discount_percent}%`
				return `${r.discount_percent}% off`
			}
			// 赠券
			if (type === 'COUPON_GRANT') {
				const n = (r.coupon_ids || []).length
				if (n > 0) return lang === 'zh' ? `${n}张券可领` : (lang === 'th' ? `รับคูปอง ${n} ใบ` : `${n} coupon${n > 1 ? 's' : ''} available`)
			}
			// 特殊日期
			if (type === 'SPECIAL_DATE') {
				const parts = []
				if (r.discount_percent) parts.push(`${r.discount_percent}% off`)
				if (r.extra_points) parts.push(lang === 'zh' ? `+${r.extra_points}积分` : `+${r.extra_points} pts`)
				if (r.extra_coins) parts.push(lang === 'zh' ? `+${r.extra_coins}金币` : `+${r.extra_coins} coins`)
				const couponN = (r.coupon_ids || []).length
				if (couponN) parts.push(lang === 'zh' ? `${couponN}张券` : `${couponN} coupons`)
				return parts.join(' · ')
			}
			return ''
		},

		hasCampaignCoupon(camp) {
			const r = camp.rules || {}
			return Array.isArray(r.coupon_ids) && r.coupon_ids.length > 0
		},

		openCampaign(camp) {
			if (!camp._raw) return
			this.currentCampaign = camp._raw
			this.showCampaignDetail = true
		},

		// 复制邀请码
		copyInviteCode() {
			if (!this.referralCode) return
			uni.setClipboardData({
				data: this.referralCode,
				success: () => {
					uni.showToast({ title: i18n.t('mine.copied'), icon: 'success' })
				}
			})
		},

		// 分享邀请链接（直接复制到剪贴板，不跳转）
		// 分享邀请到 LINE（第一期：链接统一落 H5 邀请页，优先 my-info 的 invite_url）
		shareInviteLink() {
			if (!this.referralCode) return
			const url = (this.referralInfo && this.referralInfo.invite_url) || buildInviteUrl(this.referralCode)
			shareInviteToLine(url)
		},

		// 点击卡片跳转邀请详情
		goToReferral() {
			uni.navigateTo({ url: '/pages/referral/index' })
		},

		// 查看全部 → 活动中心列表页
		goCampaignCenter() {
			uni.navigateTo({ url: '/pages/campaign/index' })
		},

		/**
		 * 加载首页数据（新品、热销）
		 */
		async loadHomeData() {
			if (!uni.getStorageSync('siamfeast_token')) return
			// 点餐入口下线期间不拉新品/热销数据（无展示位，省两个请求）
			if (!SHOW_ORDERING_ENTRIES) return
			try {
				const [newRes, hotRes] = await Promise.allSettled([
					getNewProducts({ store_id: 1, limit: 4 }),
					getHotProducts({ limit: 4 })
				])

				if (newRes.status === 'fulfilled' && newRes.value.data) {
					this.newProducts = (newRes.value.data.items || []).map(p => ({ ...p, image_url: fixMinioUrl(p.image_url) }))
				}
				if (hotRes.status === 'fulfilled' && hotRes.value.data) {
					this.hotProducts = (hotRes.value.data.items || []).map(p => ({ ...p, image_url: fixMinioUrl(p.image_url) }))
				}
			} catch (e) {
				console.error('加载首页数据失败:', e)
			}
		},

		/**
		 * 初始化门店信息
		 */
		initStoreInfo() {
			const currentStore = appStore.getCurrentStore()
			if (currentStore) {
				const lang = i18n.getLanguage()
				this.currentLocation = currentStore["name_" + lang] || currentStore.name
				this.currentStoreLogo = fixMinioUrl(currentStore.logo_url || currentStore.logo || '')
				this.currentStoreId = currentStore.id
				// 缓存里若缺当前语言字段（老数据），拉一次最新门店数据补齐
				this.refreshStoreIfNeeded(currentStore, lang)
			}
		},

		async refreshStoreIfNeeded(currentStore, lang) {
			if (!currentStore || !currentStore.id) return
			const hasLangField = !!currentStore["name_" + lang]
			if (hasLangField) return
			try {
				// silent: true — 这是后台刷新多语言字段，失败时不该弹「服务器错误」打扰用户
				const res = await getStore(currentStore.id, { silent: true })
				if (res && res.code === 0 && res.data) {
					const fresh = res.data
					// 合并老缓存里的运行时字段（distance 等），保留新增的多语言字段
					const merged = { ...currentStore, ...fresh }
					appStore.setCurrentStore(merged)
					this.currentLocation = merged["name_" + lang] || merged.name || this.currentLocation
					this.currentStoreLogo = fixMinioUrl(merged.logo_url || merged.logo || '')
				}
			} catch (e) {
				// 静默失败：用老缓存即可，不影响用户体验
			}
		},

		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20

			// 计算内容区域高度
			const navBarHeight = 44
			const tabBarHeight = 63
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		/**
		 * 检测分享链接
		 * @param {Object} options onLoad 传入的页面参数（App环境）
		 */
		checkShareLink(options) {
			let shareInfo = null

			// App 环境：优先从 onLoad options 解析
			if (options && (options.type || options.shareType || options.id)) {
				shareInfo = parseShareLink(options)
			}

			// H5 环境：从 URL query 解析
			if (!shareInfo) {
				shareInfo = parseShareLink()
			}

			if (shareInfo) {
				console.log('检测到分享链接:', shareInfo)
				this.shareInfo = shareInfo
				// 延迟显示弹窗，等待页面渲染完成
				this.$nextTick(() => {
					this.showShareModal = true
				})
			}
		},

		/**
		 * 关闭分享弹窗
		 */
		handleShareModalClose() {
			this.showShareModal = false
			clearShareParams()
		},

		/**
		 * 确认跳转
		 */
		handleShareModalConfirm(shareInfo) {
			this.showShareModal = false
			clearShareParams()

			// 根据分享类型跳转到对应页面，使用ID作为标识
			if (shareInfo.type === ShareType.SHOP) {
				// 点餐入口临时下线：分享门店不跳店
				if (!ORDERING_ENABLED) {
					showToast(this.t('error.orderingDisabled'))
					return
				}
				// 跳转到门店页面
				uni.navigateTo({
					url: `/pages/dinein/index?shopId=${shareInfo.id}`
				})
			} else if (shareInfo.type === ShareType.PRODUCT) {
				// 跳转到商品详情页面，必须带上门店ID
				uni.navigateTo({
					url: `/pages/product-detail/index?productId=${shareInfo.id}&shopId=${shareInfo.shopId}`
				})
			}
		},

		handleLocationClick() {
			uni.navigateTo({
				url: `/pages/store-select/index?currentStoreId=${this.currentStoreId || ''}`
			})
		},

		/**
		 * 处理门店选择
		 */
		handleStoreSelected(storeInfo) {
			if (storeInfo) {
				const lang2 = i18n.getLanguage()
				this.currentLocation = storeInfo["name_" + lang2] || storeInfo.name
				this.currentStoreLogo = fixMinioUrl(storeInfo.logo_url || storeInfo.logo || '')
				this.currentStoreId = storeInfo.id
				// 保存到全局状态
				appStore.setCurrentStore(storeInfo)
			}
		},

		handleLanguageClick() {
			this.showLanguageModal = true
		},

		handleLanguageModalClose() {
			this.showLanguageModal = false
		},

		handleLanguageChange(lang) {
			// 语言已切换，刷新页面文本
			this.langVersion++
			showToast(this.t('language.switchSuccess'))
		},

		handleMessageClick() {
			uni.navigateTo({
				url: '/pages/message/index'
			})
		},

		goToMemberCode() {
			uni.navigateTo({
				url: '/pages/member-code/index'
			})
		},

		// ============ 生日奖励 ============
		// App.vue 检查到可领奖时,通过 uni.$emit('showBirthdayModal') 通知
		onBirthdayShow(payload) {
			if (!payload) return
			this.birthdayRewardType = payload.reward_type || 'COIN'
			this.birthdayRewardAmount = payload.reward_amount || 0
			this.showBirthdayModal = true
		},
		closeBirthdayModal() {
			this.showBirthdayModal = false
		},
		handleBirthdayClaimed(data) {
			console.log('[birthday] claimed:', data)
			// 同步余额
			try {
				const userInfo = appStore.getUserInfo()
				if (userInfo) {
					if (data && data.coin_balance_after !== undefined) {
						userInfo.coin_balance = data.coin_balance_after
					}
					if (data && data.point_balance_after !== undefined) {
						userInfo.point_balance = data.point_balance_after
					}
					appStore.setUserInfo(userInfo)
				}
			} catch (e) {}
		},

		async loadUnreadCount() {
			// 没 token 时不请求(避免登录前调用导致 401 噪音)
			const token = uni.getStorageSync('siamfeast_token')
			if (!token) return
			try {
				const res = await getUnreadCount()
				if (res.code === 0 && res.data !== undefined) {
					this.unreadCount = res.data.unread_count || res.data || 0
				}
			} catch (e) {
				// 限流(429)是后端正常防护,不打印
				if (e && (e.code === 429 || e.bizCode === 'RATE_LIMITED')) {
					return
				}
				console.error('获取未读消息数失败:', e)
			}
		},

		switchMainTab(index) {
			this.activeMainTab = index
			if (index === 1) {
				// 外卖 - 跳转到外卖门店列表
				uni.navigateTo({
					url: '/pages/mall/index'
				})
			} else {
				// 堂食 - 总是进门店列表，让用户自己选（列表按距离排序，最近门店在最前）
				uni.navigateTo({ url: '/pages/dinein-stores/index' })
			}
		},

		handleFeature(type) {
				const sid = this.currentStoreId || ""
				if (type === "new") {
					uni.navigateTo({ url: "/pages/new-products/index?shopId=" + sid })
				} else if (type === "hot") {
					// 热销榜是跨门店全局排行，不传 shopId
					uni.navigateTo({ url: "/pages/hot-products/index" })
				} else if (type === "points") {
					uni.navigateTo({ url: "/pages/points-mall/index" })
				} else if (type === "coins") {
					uni.navigateTo({ url: "/pages/points-mall/index?tab=1" })
				} else if (type === "vending") {
					uni.navigateTo({ url: "/pages/vending-machine/index" })
			}
		},

		handleCouponClick() {
			uni.navigateTo({
				url: '/pages/coupons/index'
			})
		},

		goSettings() {
			uni.navigateTo({
				url: '/pages/settings/index'
			})
		}
	}
}
</script>

<style scoped>
.index-page {
	min-height: 100vh;
	background-color: #F3F3F3;
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
}

.store-selector {
	display: flex;
	align-items: center;
	background-color: #FFFFFF;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 22px;
	padding: 6px 14px;
	gap: 8px;
	flex: 1 1 auto;
	min-width: 0;
	overflow: hidden;
	transition: background-color 0.2s;
}

.store-selector:active {
	background-color: #F5F5F5;
}

.location-icon {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
}

	.store-logo {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		flex-shrink: 0;
	}

.store-name {
	font-size: 13px;
	font-weight: 500;
	color: #3C3C3C;
	line-height: 24px;
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.arrow-wrapper {
	width: 18px;
	height: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	transform: rotate(-90deg);
}

.arrow-icon {
	width: 9px;
	height: 9px;
}

.nav-icons {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.nav-icon-btn {
	width: 32px;
	height: 32px;
	background-color: #FFFFFF;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	transition: transform 0.2s, background-color 0.2s;
}

.nav-icon-btn:active {
	transform: scale(0.92);
	background-color: #EEEEEE;
}

.icon-img {
	width: 20px;
	height: 20px;
}

.unread-dot {
	position: absolute;
	top: 2px;
	right: 2px;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: #FF4444;
	border: 1.5px solid #FFFFFF;
	animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.7; transform: scale(1.2); }
}

/* 内容滚动区域 */
.content-scroll {
	flex: 1;
}

/* 顶部轮播图区域 */
.top-banner {
	width: 100%;
	height: 200px;
	background-color: #F3F3F3;
	padding: 0 16px;
	box-sizing: border-box;
}

.top-banner swiper {
	width: 100%;
	height: 200px;
	border-radius: 12px;
	overflow: hidden;
}

.banner-image {
	width: 100%;
	height: 100%;
}

/* SPECIAL_DATE 活动今日可领角标 */
.banner-today-badge {
	position: absolute;
	top: 12px;
	right: 12px;
	background: linear-gradient(135deg, #FF6B6B 0%, #DA3300 100%);
	padding: 4px 10px;
	border-radius: 12px;
	box-shadow: 0 2px 6px rgba(218, 51, 0, 0.3);
	z-index: 2;
}
.banner-today-badge-text {
	font-size: 11px;
	color: #FFFFFF;
	font-weight: 600;
}

/* 适用范围徽章：左上角 */
.banner-scope-badge {
	position: absolute;
	top: 12px;
	left: 12px;
	background-color: rgba(0, 0, 0, 0.55);
	padding: 4px 10px;
	border-radius: 12px;
	z-index: 2;
}
.banner-scope-badge-text {
	font-size: 11px;
	color: #FFFFFF;
	font-weight: 500;
}

/* 横幅标题文字：浮在图片下方，半透明遮罩避免完全遮挡图片 */
.banner-title-bar {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 8px 16px;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0));
	z-index: 2;
	pointer-events: none;  /* 让点击穿透到 image */
}
.banner-title-text {
	font-size: 13px;
	color: #FFFFFF;
	font-weight: 600;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* 堂食/商城 Tab切换 */
.main-tabs {
	padding: 16px 16px 8px;
}

.main-tabs-wrapper {
	display: flex;
	background-color: #FFFFFF;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.main-tab-item {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 16px;
	border-right: 1px solid #F5F5F5;
	transition: all 0.25s ease;
	position: relative;
}

.main-tab-item:last-child {
	border-right: none;
}

.main-tab-item:active {
	transform: scale(0.98);
}

.main-tab-active {
	background-color: #FFFDF5;
}

.main-tab-active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 24px;
	height: 3px;
	background: linear-gradient(90deg, #F2B131, #FFD23D);
	border-radius: 2px;
}

.tab-content {
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.tab-title {
	font-size: 16px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.5);
	transition: color 0.25s;
}

.tab-subtitle {
	font-size: 10px;
	font-weight: 400;
	color: #AAAAAA;
}

.tab-icon {
	width: 36px;
	height: 36px;
	opacity: 0.7;
	transition: opacity 0.25s, transform 0.25s;
}

.main-tab-active .tab-title {
	color: #F2B131;
}

.main-tab-active .tab-icon {
	opacity: 1;
	transform: scale(1.05);
}

/* 会员信息卡片 */
.member-card {
	margin: 8px 16px;
	background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%);
	border-radius: 12px;
	padding: 14px 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 4px 16px rgba(242, 177, 49, 0.12);
	position: relative;
	overflow: hidden;
}

.member-card::before {
	content: '';
	position: absolute;
	top: -30px;
	right: -30px;
	width: 80px;
	height: 80px;
	background: radial-gradient(circle, rgba(242, 177, 49, 0.2) 0%, transparent 70%);
	border-radius: 50%;
}

.member-left {
	display: flex;
	align-items: center;
	gap: 10px;
	z-index: 1;
}

.member-avatar {
	width: 38px;
	height: 38px;
	border-radius: 50%;
	border: 2px solid rgba(242, 177, 49, 0.25);
	box-shadow: 0 2px 8px rgba(242, 177, 49, 0.15);
}

.member-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.member-name {
	font-size: 14px;
	font-weight: 600;
	color: #5D4037;
}

.member-level {
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	border-radius: 10px;
	padding: 1px 10px;
	height: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 6px rgba(242, 177, 49, 0.3);
}

.level-text {
	font-size: 10px;
	font-weight: 600;
	color: #FFFFFF;
}

.member-stats {
	display: flex;
	align-items: center;
	gap: 16px;
	z-index: 1;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
}

.stat-num {
	font-size: 18px;
	font-weight: 700;
	color: #5D4037;
}

.stat-label {
	font-size: 10px;
	font-weight: 400;
	color: rgba(93, 64, 55, 0.5);
}

/* 功能入口区域 */
.feature-section {
	margin: 10px 16px;
	display: flex;
	gap: 8px;
}

/* 堂食 Tab 隐藏时补齐 banner 与会员卡之间的间距（原由 main-tabs 的 padding 提供） */
.member-card-no-tabs {
	margin-top: 14px;
}

/* 兑换商城横条（点餐入口下线期间的全宽功能入口） */
.redeem-banner {
	margin: 10px 16px;
	padding: 14px 16px;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFFDF7 100%);
	border-radius: 14px;
	border: 2rpx solid #FFF1CE;
	box-shadow: 0 2px 10px rgba(224, 154, 27, 0.08);
	display: flex;
	align-items: center;
}

/* 浅黄渐变方形底（squircle），衬托填充版金币图标 */
.redeem-banner-icon-wrap {
	width: 52px;
	height: 52px;
	padding: 2px;
	border-radius: 16px;
	background: linear-gradient(150deg, #FFF6DE 0%, #FFE9B3 100%);
	box-shadow: inset 0 -2px 4px rgba(224, 154, 27, 0.18);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.redeem-banner-icon {
	width: 48px;
	height: 48px;
}

.redeem-banner-content {
	flex: 1;
	margin-left: 14px;
	display: flex;
	flex-direction: column;
}

.redeem-banner-title {
	font-size: 15px;
	font-weight: 600;
	color: #1A1A1A;
}

.redeem-banner-subtitle {
	margin-top: 3px;
	font-size: 12px;
	color: #999999;
}

/* 右侧箭头：浅黄圆底，视觉呼应图标底 */
.redeem-banner-arrow-wrap {
	width: 26px;
	height: 26px;
	border-radius: 13px;
	background-color: #FFF6DE;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.redeem-banner-arrow {
	width: 12px;
	height: 12px;
}

.feature-left {
	width: 167px;
	height: 194px;
}

.feature-card {
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 14px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 10px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
	transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:active {
	transform: scale(0.97);
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.feature-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.feature-title {
	font-size: 16px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.75);
}

.feature-subtitle {
	font-size: 10px;
	font-weight: 400;
	color: #AAAAAA;
}

.feature-icon {
	width: 56px;
	height: 56px;
	border-radius: 14px;
	background-color: #FFF8E1;
	padding: 6px;
	box-sizing: border-box;
}

.feature-right {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.feature-small {
	flex: 1;
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 10px 14px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
	transition: transform 0.2s, box-shadow 0.2s;
}

.feature-small:active {
	transform: scale(0.97);
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.feature-small-content {
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.feature-small-title {
	font-size: 15px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.75);
}

.feature-small-subtitle {
	font-size: 11px;
	font-weight: 400;
	color: #AAAAAA;
}

.feature-small-icon {
	width: 44px;
	height: 44px;
	border-radius: 10px;
	background-color: #FFF8E1;
	padding: 4px;
	box-sizing: border-box;
}

/* 快捷入口 */
.quick-entry {
	display: flex;
	justify-content: space-around;
	padding: 16px 16px 0;
	gap: 12px;
}

.quick-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	flex: 1;
}

.quick-icon-wrap {
	width: 48px;
	height: 48px;
	border-radius: 14px;
	background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.quick-icon {
	width: 24px;
	height: 24px;
}

.quick-text {
	font-size: 11px;
	color: #5D4037;
}

/* 底部占位 */
.bottom-placeholder {
	height: 70px;
}

/* 活动小条 */
.campaign-strip-section {
	margin: 0 16px 16px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

/* 活动中心区块标题行 */
.campaign-section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 4px 2px 2px;
}

.campaign-section-title-row {
	display: flex;
	align-items: center;
}

.campaign-section-title-bar {
	width: 4px;
	height: 16px;
	border-radius: 2px;
	background: linear-gradient(180deg, #F2B131 0%, #E09A1B 100%);
	margin-right: 8px;
}

.campaign-section-title {
	font-size: 16px;
	font-weight: 700;
	color: #1A1A1A;
}

.campaign-section-more {
	display: flex;
	align-items: center;
}

.campaign-section-more-text {
	font-size: 12px;
	color: #999999;
}

.campaign-section-more-icon {
	width: 12px;
	height: 12px;
	margin-left: 2px;
	opacity: 0.6;
}

.campaign-strip {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 14px;
	background-color: #FFFFFF;
	border-radius: 12px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
	border: 1px solid #F5F5F5;
}

.campaign-strip:active {
	transform: scale(0.98);
}

.campaign-strip-left {
	display: flex;
	align-items: center;
	gap: 8px;
	flex: 1;
	min-width: 0;
}

.campaign-strip-type-tag {
	font-size: 10px;
	font-weight: 700;
	padding: 3px 8px;
	border-radius: 6px;
	flex-shrink: 0;
	color: #FFFFFF;
}
.tag-discount { background-color: #FF6B6B; }
.tag-reduction { background-color: #4ECDC4; }
.tag-coupon { background-color: #F2B131; }
.tag-special { background-color: #9B59B6; }
.tag-other { background-color: #95A5A6; }

.campaign-strip-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.campaign-strip-name {
	font-size: 13px;
	font-weight: 600;
	color: #1A1A1A;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.campaign-strip-desc {
	font-size: 11px;
	color: #999;
}

.campaign-strip-right {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	margin-left: 8px;
}

.campaign-strip-btn {
	padding: 6px 14px;
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	border-radius: 14px;
}

.campaign-strip-btn-text {
	font-size: 12px;
	color: #FFFFFF;
	font-weight: 700;
	white-space: nowrap;
}

.campaign-strip-arrow {
	font-size: 18px;
	color: #CCC;
	line-height: 1;
}

/* 邀请好友拓客卡片 */
.invite-card {
	margin: 0 16px 16px;
	padding: 20px 16px;
	background: linear-gradient(135deg, #FF6B9D 0%, #F2B131 100%);
	border-radius: 16px;
	box-shadow: 0 4px 16px rgba(255, 107, 157, 0.15);
}

.invite-card-header {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 14px;
}
.invite-card-icon {
	width: 20px;
	height: 20px;
	color: #FFFFFF;
}
.invite-card-title {
	font-size: 15px;
	font-weight: 700;
	color: #FFFFFF;
}

.invite-card-code-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 14px;
}
.invite-card-code-label {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.85);
}
.invite-card-code {
	flex: 1;
	font-size: 18px;
	font-weight: 800;
	color: #FFFFFF;
	letter-spacing: 2px;
}
.invite-card-copy-btn {
	padding: 4px 12px;
	background-color: rgba(255, 255, 255, 0.25);
	border-radius: 12px;
}
.invite-card-copy-text {
	font-size: 11px;
	color: #FFFFFF;
	font-weight: 600;
}

.invite-card-stats {
	display: flex;
	align-items: center;
	gap: 0;
	padding: 10px 12px;
	background-color: rgba(255, 255, 255, 0.15);
	border-radius: 10px;
	margin-bottom: 14px;
}
.invite-stat-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
}
.invite-stat-num {
	font-size: 18px;
	font-weight: 800;
	color: #FFFFFF;
	line-height: 1;
}
.invite-stat-label {
	font-size: 10px;
	color: rgba(255, 255, 255, 0.8);
}
.invite-stat-divider {
	width: 1px;
	height: 24px;
	background-color: rgba(255, 255, 255, 0.3);
}

.invite-card-cta {
	height: 40px;
	background-color: #FFFFFF;
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.invite-card-cta-text {
	font-size: 14px;
	font-weight: 700;
	color: #FF6B9D;
}

/* 任务进度 */
.invite-card-tasks {
	margin-top: 4px;
}
.invite-task-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 0;
	border-top: 1px solid rgba(255, 255, 255, 0.15);
}
.invite-task-left {
	display: flex;
	flex-direction: column;
	gap: 2px;
	flex-shrink: 0;
	max-width: 50%;
}
.invite-task-name {
	font-size: 12px;
	font-weight: 600;
	color: #FFFFFF;
}
.invite-task-reward {
	font-size: 10px;
	color: rgba(255, 255, 255, 0.7);
}
.invite-task-right {
	display: flex;
	align-items: center;
	gap: 4px;
}
.invite-task-progress-bar {
	width: 80px;
	height: 6px;
	background-color: rgba(255, 255, 255, 0.25);
	border-radius: 3px;
	overflow: hidden;
}
.invite-task-progress-fill {
	height: 100%;
	background-color: #FFFFFF;
	border-radius: 3px;
	transition: width 0.3s;
}
.invite-task-progress-text {
	font-size: 11px;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 600;
	min-width: 30px;
	text-align: right;
}

/* 锁定状态 */
.invite-task-row.task-locked {
	opacity: 0.5;
}
.invite-task-locked-text {
	font-size: 11px;
	color: rgba(255, 255, 255, 0.6);
}

.invite-task-lock-icon {
	width: 12px;
	height: 12px;
	color: rgba(255, 255, 255, 0.6);
	margin-right: 2px;
}

/* 完成状态 */
.invite-task-row.task-done .invite-task-progress-fill {
	background-color: #4CAF50;
}
.invite-task-row.task-done .invite-task-progress-text {
	color: #4CAF50;
}
</style>
