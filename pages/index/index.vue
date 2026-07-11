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
				</swiper-item>
			</swiper>
			<view v-else class="top-banner">
				<image class="banner-image" src="/static/images/banner-placeholder.svg" mode="aspectFill"></image>
			</view>

			<!-- 堂食 Tab -->
			<view class="main-tabs">
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
			<view class="member-card">
				<view class="member-left" @click="goSettings">
					<image class="member-avatar" :src="memberInfo.avatar_url || '/static/images/04_default_avatar.png'" mode="aspectFill"></image>
					<view class="member-info">
						<text class="member-name">{{ memberInfo.nickname || '用户名称' }}</text>
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

			<!-- 功能入口区域 -->
			<view class="feature-section">
				<!-- 左侧新品上市 -->
				<view class="feature-card feature-left" @click="handleFeature('new')">
					<view class="feature-content">
						<text class="feature-title">{{ t('index.newProducts') }}</text>
						<text class="feature-subtitle">{{ newProducts.length }} {{ t('index.newProductsDesc') }}</text>
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

		<!-- 横幅介绍图弹窗（支持多图滑动） -->
		<banner-detail-modal
			:visible="showBannerDetail"
			:images="currentBannerDetailImages"
			@close="handleBannerDetailClose"
		></banner-detail-modal>
	</view>
</template>

<script>
import { showToast, fixMinioUrl } from '@/utils/index.js'
import { parseShareLink, clearShareParams, ShareType } from '@/utils/share.js'
import CustomTabbar from '@/components/custom-tabbar.vue'
import ShareModal from '@/components/share-modal.vue'
import LanguageModal from '@/components/language-modal.vue'
import BannerDetailModal from '@/components/banner-detail-modal.vue'
import appStore from '@/store/index.js'
import i18n from '@/i18n/index.js'
import {
	getHomeBanners,
	getMemberInfo,
	getMyCoupons,
	getNewProducts,
	getHotProducts
} from '@/api/index.js'
import { getUnreadCount } from '@/api/services/notification.js'
import { getMemberProgress } from '@/api/services/member.js'
import { getUserInfo } from '@/api/services/auth.js'
import { getStore } from '@/api/services/store.js'

export default {
	components: {
		CustomTabbar,
		ShareModal,
		LanguageModal,
		BannerDetailModal
	},
	data() {
		return {
			i18n: i18n,
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
			banners: [],
				langVersion: 0,
				memberInfo: {},
			couponCount: 0,
			coinBalance: 0,
			points: 0,
			unreadCount: 0,
			newProducts: [],
			hotProducts: [],
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
		// 初始化门店信息
		this.initStoreInfo()
	},
	onUnload() {
		// 移除事件监听
		uni.$off('storeSelected', this.handleStoreSelected)
			uni.$off("languageChanged")
	},
	onShow() {
		// #ifdef APP-PLUS
		uni.hideTabBar({ animation: false, fail: () => {} })
		// #endif
		uni.$emit("tabbarUpdate")
		// 每次显示时刷新会员数据和统计
		this.loadMemberData()
		this.loadUnreadCount()
	},
	computed: {
		hasUnread() {
			return this.unreadCount > 0
		},
			memberLevelText() {
				const t = this.t.bind(this)
				const tierMap = {
					REGULAR: t("member.normal") || "普通会员",
					PLATINUM: t("member.platinum") || "铂金会员"
				}
				return tierMap[this.memberInfo?.membership_tier] || t("index.memberLevel") || "普通会员"
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
			try {
				const res = await getHomeBanners()
				// === DEBUG: 看 banner 原始字段（排查弹窗不显示）===
				console.log('[banner-debug] raw response:', JSON.stringify(res.data, null, 2))
				// === END DEBUG ===
				this.banners = (res.data.items || res.data || []).map(b => {
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
		 */
		handleBannerClick(banner) {
			// === DEBUG: 确认点击触发 + 看数据 ===
			console.log('[banner-click] banner clicked:', banner.id, 'detail_images:', banner.detail_images)
			// === END DEBUG ===
			// 优先：挂了竖屏介绍图（多图数组）→ 弹窗显示
			if (Array.isArray(banner.detail_images) && banner.detail_images.length > 0) {
				this.currentBannerDetailImages = banner.detail_images
				this.showBannerDetail = true
				console.log('[banner-click] opening modal with images:', this.currentBannerDetailImages)
				return
			}
			// 兜底：走原 link_type 跳转（兼容大小写）
			const linkType = (banner.link_type || '').toUpperCase()
			if (linkType === 'PAGE' && banner.link_value) {
				uni.navigateTo({ url: banner.link_value })
			} else if (linkType === 'PRODUCT' && banner.link_value) {
				uni.navigateTo({
					url: `/pages/product-detail/index?productId=${banner.link_value}`
				})
			} else if (linkType === 'STORE' && banner.link_value) {
				uni.navigateTo({
					url: `/pages/dinein/index?shopId=${banner.link_value}`
				})
			}
		},

		handleBannerDetailClose() {
			this.showBannerDetail = false
			this.currentBannerDetailImages = []
		},

		/**
		 * 加载会员数据（信息、积分、优惠券数量）
		 */
		async loadMemberData() {
			try {

					const [userRes, infoRes, couponsRes, progressRes] = await Promise.allSettled([
						getUserInfo(),
						getMemberInfo(),
						getMyCoupons({ status: 'UNUSED' }),
						getMemberProgress()
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
				// 消费已达标且用户看过动画 → 直接显示铂金会员
				if (progressRes.status === 'fulfilled' && progressRes.value.code === 0 && progressRes.value.data) {
					const p = progressRes.value.data
					const consumed = p.total_spent || p.current_spent || 0
					const required = p.threshold || p.required_for_next || 200
					const isPlatinum = p.current_tier === 'PLATINUM'
					// Backend platinum OR user has seen animation = show platinum directly
					const hasMetGoal = consumed >= required
					const shouldShowPlatinum = isPlatinum || hasMetGoal
					if (shouldShowPlatinum) {
						this.memberInfo = { ...this.memberInfo, membership_tier: 'PLATINUM' }
					}
				}
			} catch (e) {
				console.error('加载会员数据失败:', e)
			}
		},

		/**
		 * 加载首页数据（新品、热销）
		 */
		async loadHomeData() {
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

		async loadUnreadCount() {
			try {
				const res = await getUnreadCount()
				if (res.code === 0 && res.data !== undefined) {
					this.unreadCount = res.data.unread_count || res.data || 0
				}
			} catch (e) {
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
					uni.navigateTo({ url: "/pages/hot-products/index?shopId=" + sid })
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
	transition: background-color 0.2s;
}

.store-selector:active {
	background-color: #F5F5F5;
}

.location-icon {
	width: 16px;
	height: 16px;
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
}

.arrow-wrapper {
	width: 18px;
	height: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	transform: rotate(-90deg);
}

.arrow-icon {
	width: 9px;
	height: 9px;
}

.nav-icons {
	display: flex;
	align-items: center;
	gap: 12px;
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
</style>
