<template>
	<view class="mall-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<!-- 门店选择 -->
			<view class="store-selector" @click="handleLocationClick">
				<image class="location-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
				<text class="store-name">{{ currentLocation }}</text>
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
				</view>
			</view>
		</view>

		<!-- 内容滚动区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 顶部Banner轮播 -->
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
					@click="handleBannerClick(banner)"
				>
					<image class="banner-image" :src="banner.image_url" mode="aspectFill"></image>
				</swiper-item>
			</swiper>
			<view v-else class="top-banner">
				<image class="banner-image" src="/static/logo.png" mode="aspectFill"></image>
				<view class="banner-indicators">
					<view class="indicator active"></view>
				</view>
			</view>

			<!-- 限时特惠提示条 -->
			<view class="promo-bar" v-if="noticeText">
				<image class="promo-icon" src="/static/icons/volume.svg" mode="aspectFit"></image>
				<text class="promo-text">{{ noticeText }}</text>
			</view>

			<!-- 分类标签区域 -->
			<scroll-view class="category-scroll" scroll-x>
				<view class="category-list">
					<view
						v-for="(item, index) in categories"
						:key="item.id || index"
						class="category-item"
						:class="{ 'category-active': activeCategory === index }"
						@click="selectCategory(index)"
					>
						<image class="category-icon" :src="item.icon || '/static/logo.png'" mode="aspectFit"></image>
						<text class="category-name">{{ item['name_' + i18n.getLanguage()] || item.name }}</text>
					</view>
				</view>
			</scroll-view>

			<!-- 优惠专区和拼单专区 并排 -->
			<view class="zone-section">
				<!-- 优惠专区 -->
				<view class="zone-card" @click="handleZoneClick('discount')">
					<view class="zone-header">
						<text class="zone-title">优惠专区</text>
						<view class="zone-more">
							<text class="more-text">更多</text>
							<image class="more-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<view class="zone-content" v-if="discountProduct">
						<image class="zone-image" :src="discountProduct.image_url || '/static/logo.png'" mode="aspectFill"></image>
						<view class="zone-info">
							<text class="zone-name">{{ discountProduct.name }}</text>
							<view class="zone-price">
								<text class="price-symbol">฿</text>
								<text class="price-num">{{ discountProduct.price }}</text>
							</view>
						</view>
					</view>
					<view class="zone-content" v-else>
						<image class="zone-image" src="/static/logo.png" mode="aspectFill"></image>
						<view class="zone-info">
							<text class="zone-name">暂无优惠商品</text>
						</view>
					</view>
				</view>
				<!-- 拼单专区 -->
				<view class="zone-card" @click="handleZoneClick('group')">
					<view class="zone-header">
						<text class="zone-title">拼单专区</text>
						<view class="zone-more">
							<text class="more-text">更多</text>
							<image class="more-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<view class="zone-content" v-if="groupProduct">
						<image class="zone-image" :src="groupProduct.image_url || '/static/logo.png'" mode="aspectFill"></image>
						<view class="zone-info">
							<text class="zone-name">{{ groupProduct.name }}</text>
							<view class="zone-price">
								<text class="price-symbol">฿</text>
								<text class="price-num">{{ groupProduct.price }}</text>
							</view>
						</view>
					</view>
					<view class="zone-content" v-else>
						<image class="zone-image" src="/static/logo.png" mode="aspectFill"></image>
						<view class="zone-info">
							<text class="zone-name">暂无拼单商品</text>
						</view>
					</view>
				</view>
			</view>


			<!-- 商家列表 -->
			<view class="store-list">
				<!-- 民宿入口 -->
				<view class="store-card" @click="handleHostelClick({id:'hostel_demo',name:'暹罗民宿·曼谷店'})">
					<view class="store-card-main">
						<image class="store-card-logo" src="/static/logo.png" mode="aspectFill"></image>
						<view class="store-card-info">
							<view class="store-card-header">
								<text class="store-card-name">暹罗民宿·曼谷店</text>
								<view class="store-card-status status-open">
									<text class="store-card-status-text">营业中</text>
								</view>
							</view>
							<view class="store-card-info-row">
								<text class="store-card-hours">24小时</text>
							</view>
							<view class="store-card-tags">
								<text class="store-card-tag">客房</text>
								<text class="store-card-tag">火锅</text>
								<text class="store-card-tag">咖啡</text>
							</view>
						</view>
					</view>
					<view class="store-card-footer">
						<view class="store-card-distance">
							<image class="store-card-distance-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
							<text class="store-card-distance-text">123 Sukhumvit Rd, Bangkok</text>
						</view>
						<view class="store-card-actions">
							<view class="store-card-enter">
								<text class="store-card-enter-text">进店</text>
							</view>
						</view>
					</view>
				</view>

				<view
					v-for="(store, index) in stores"
					:key="store.id || index"
					class="store-card"
					@click="handleStoreClick(store)"
				>
					<view class="store-card-main">
						<image class="store-card-logo" :src="store.logo_url || store.logo || '/static/logo.png'" mode="aspectFill"></image>
						<view class="store-card-info">
							<view class="store-card-header">
								<text class="store-card-name">{{ store.name }}</text>
								<view class="store-card-status" :class="store.status === 'OPEN' ? 'status-open' : 'status-closed'">
									<text class="store-card-status-text">{{ store.status === 'OPEN' ? i18n.t('storeSelect.open') : i18n.t('storeSelect.closed') }}</text>
								</view>
							</view>
							<view class="store-card-info-row">
								<text class="store-card-hours">{{ store.businessHours }}</text>
							</view>
							<view class="store-card-delivery" v-if="store.delivery_enabled">
								<text class="delivery-text">支持外送</text>
							</view>
							<view class="store-card-tags" v-if="store.business_types && store.business_types.length > 0">
								<text class="store-card-tag" v-for="(type, idx) in getBusinessTypeText(store.business_types)" :key="idx">{{ type }}</text>
							</view>
						</view>
					</view>
					<view class="store-card-footer">
						<view class="store-card-distance">
							<image class="store-card-distance-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
							<text class="store-card-distance-text">{{ store.formatted_address || store.address }}</text>
						</view>
						<view class="store-card-actions">
							<view class="store-card-enter">
								<text class="store-card-enter-text">进店</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="stores.length === 0 && !loading">
				<text class="empty-text">{{ i18n.t('common.noData') }}</text>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="0"></custom-tabbar>
	</view>
</template>

<script>
import { showToast } from '@/utils/index.js'
import CustomTabbar from '@/components/custom-tabbar.vue'
import i18n from '@/i18n/index.js'
import appStore from '@/store/index.js'
import { getStore, getStores } from '@/api/services/store.js'
import { getGlobalCategories } from '@/api/services/menu.js'
import { getMallBanners } from '@/api/services/banner.js'
import { getGlobalNotice } from '@/api/services/notice.js'

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			loading: false,
			shopId: null,
			currentLocation: '',
			banners: [],
			noticeText: '',
			activeCategory: 0,
			categories: [],
			stores: [],
			discountProduct: null,
			groupProduct: null
		}
	},
	computed: {
	},
	onLoad() {
		this.initPage()
		this.initStoreInfo()
	},
	onShow() {
		this.loadMallData()
	},
	methods: {
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const tabBarHeight = 63
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		initStoreInfo() {
			const currentStore = appStore.getCurrentStore()
			if (currentStore) {
				this.shopId = currentStore.id
				this.currentLocation = currentStore.name || ''
			} else {
				this.currentLocation = this.i18n.t('index.storeLocation')
			}
		},

		async loadMallData() {
			if (this.loading) return
			this.loading = true

			try {
				const storeId = this.shopId || 1

				const [bannerRes, noticeRes, catRes, storesRes] = await Promise.allSettled([
					getMallBanners(),
					getGlobalNotice(),
					getGlobalCategories(),
					getStores({}, { silent: true })
				])

				// 轮播图
				if (bannerRes.status === 'fulfilled' && bannerRes.value.code === 0 && bannerRes.value.data) {
					this.banners = Array.isArray(bannerRes.value.data) ? bannerRes.value.data : []
				}

					// 全局公告通知（支持多语言）
				if (noticeRes.status === "fulfilled" && noticeRes.value.code === 0 && noticeRes.value.data) {
					const notice = noticeRes.value.data
					if (notice) {
						const lang = i18n.getLanguage()
						this.noticeText = notice["content_" + lang] || notice.content || ""
					}
				}

				// 分类列表
				if (catRes.status === 'fulfilled' && catRes.value.code === 0 && catRes.value.data) {
					const apiCategories = (catRes.value.data || []).map(c => ({
							id: c.id,
							name: c.name,
							name_en: c.name_en || '',
							name_th: c.name_th || '',
							icon: c.icon || c.icon_url || '/static/logo.png'
					}))
					// 在前面加上新人礼包入口，后面加更多
					this.categories = [
						{ id: 'newbie', name: '新人礼包', icon: '/static/icons/newbie-gift.svg' },
						...apiCategories,
						{ id: 'more', name: '更多', icon: '/static/icons/more-categories.svg' }
					]
				} else {
					this.categories = [
						{ id: 'newbie', name: '新人礼包', icon: '/static/icons/newbie-gift.svg' },
						{ id: 'more', name: '更多', icon: '/static/icons/more-categories.svg' }
					]
				}

				// 商家列表
				if (storesRes.status === 'fulfilled' && storesRes.value.code === 0 && storesRes.value.data) {
					const data = storesRes.value.data
					const list = Array.isArray(data) ? data : (data.items || [])
					this.stores = list.map(store => ({
						id: store.id,
						name: store.name,
						name_en: store.name_en || '',
						name_th: store.name_th || '',
						logo_url: store.logo_url || '',
						logo: store.logo || '/static/logo.png',
						phone: store.phone || '',
						status: store.status || 'OPEN',
						address: store.address || '',
						formatted_address: store.formatted_address || '',
						latitude: store.latitude,
						longitude: store.longitude,
						delivery_enabled: store.delivery_enabled || false,
						businessHours: store.config
							? store.config.opening_time?.slice(0,5) + '-' + store.config.closing_time?.slice(0,5)
							: '11:00-22:00',
						distance: store.distance || '',
						business_types: store.business_types || []
					}))
				}

			} catch (e) {
				console.error('loadMallData error:', e)
			} finally {
				this.loading = false
			}
		},

		/**
		 * 轮播图点击
		 */
		handleBannerClick(banner) {
			if (banner.link_type === 'PAGE' && banner.link_value) {
				uni.navigateTo({ url: banner.link_value })
			} else if (banner.link_type === 'PRODUCT' && banner.link_value) {
				uni.navigateTo({
					url: `/pages/product-detail/index?productId=${banner.link_value}&shopId=${this.shopId || ''}`
				})
			}
		},

		handleLocationClick() {
			uni.navigateTo({
				url: '/pages/store-select/index'
			})
		},

		handleLanguageClick() {
			uni.navigateTo({
				url: '/pages/language/index'
			})
		},

		handleMessageClick() {
			uni.navigateTo({
				url: '/pages/message/index'
			})
		},

		selectCategory(index) {
			this.activeCategory = index
			const cat = this.categories[index]
			if (cat && cat.id === 'newbie') {
				uni.navigateTo({
					url: '/pages/newbie-gift/index'
				})
			} else if (cat && cat.id === 'more') {
				// 更多分类 - 暂无
				showToast(this.i18n.t('common.noData'))
			} else if (cat && cat.id) {
				uni.navigateTo({
					url: `/pages/products/index?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`
				})
			}
		},

		handleZoneClick(type) {
			if (type === 'discount') {
				uni.navigateTo({
					url: '/pages/discount/index'
				})
			} else if (type === 'group') {
				uni.navigateTo({
					url: '/pages/group/index'
				})
			} else {
				uni.navigateTo({
					url: '/pages/products/index'
				})
			}
		},


	handleStoreClick(store) {
		// Hotel/hostel type: go directly to hostel page
		const hostelTypes = ["HOTEL", "HOSTEL_ROOM", "HOSTEL_HOTPOT", "HOSTEL_COFFEE"]
		if (store.business_types && store.business_types.some(t => hostelTypes.includes(t))) {
			uni.navigateTo({
				url: "/pages/hostel/index?shopId=" + store.id + "&shopName=" + encodeURIComponent(store.name)
			})
			return
		}
		uni.navigateTo({
			url: `/pages/dinein/index?shopId=${store.id}`
		})
	},

		getBusinessTypeText(types) {
			if (!types || !Array.isArray(types)) return []
			const typeKeyMap = {
				'HOTPOT': 'hotpot',
				'MALA_TANG': 'malaTang',
				'BEVERAGE': 'beverage',
				'BARBECUE': 'barbecue',
				'HOSTEL_ROOM': 'hostel',
				'HOSTEL_HOTPOT': 'hostelHotpot',
				'HOSTEL_COFFEE': 'hostelCoffee'
			}
			return types.map(t => {
				const key = typeKeyMap[t]
				return key ? this.i18n.t(`storeSelect.businessTypes.${key}`) : t
			}).filter(Boolean)
		},

			isHostelStore(store) {
				const types = store.business_types || []
				return types.some(t => ["HOSTEL_ROOM", "HOSTEL_HOTPOT", "HOSTEL_COFFEE"].includes(t))
			},
		handleHostelClick(store) {
			uni.navigateTo({
				url: "/pages/hostel/index?shopId=" + store.id + "&shopName=" + encodeURIComponent(store.name)
			})
		}
	}
}
</script>

<style scoped>
.mall-page {
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
	border-radius: 22px;
	padding: 6px 12px;
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

.store-name {
	font-size: 12px;
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
	gap: 8px;
}

.nav-icon-btn {
	width: 30px;
	height: 30px;
	background-color: #FFFFFF;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.2s, background-color 0.2s;
}

.nav-icon-btn:active {
	transform: scale(0.92);
	background-color: #F5F5F5;
}

.icon-img {
	width: 24px;
	height: 24px;
}

/* 内容滚动区域 */
.content-scroll {
	flex: 1;
}

/* 顶部Banner */
.top-banner {
	width: 100%;
	height: 234px;
	position: relative;
	background-color: #E0E0E0;
	padding: 0 16px;
	box-sizing: border-box;
}

.top-banner swiper {
	width: 100%;
	height: 234px;
	border-radius: 12px;
	overflow: hidden;
}

.banner-image {
	width: 100%;
	height: 100%;
}

.banner-indicators {
	position: absolute;
	bottom: 13px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	gap: 6px;
}

.indicator {
	width: 6px;
	height: 6px;
	border-radius: 18px;
	background-color: #FFFFFF;
	transition: width 0.3s;
}

.indicator.active {
	width: 16px;
	background-color: #FFD23D;
}

/* 限时特惠提示条 */
.promo-bar {
	background-color: #DA3300;
	padding: 6px 17px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
}

.promo-icon {
	width: 18px;
	height: 18px;
}

.promo-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
	opacity: 0.9;
}

/* 分类标签区域 */
.category-scroll {
	padding: 14px 16px;
	white-space: nowrap;
}

.category-list {
	display: inline-flex;
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 8px;
	gap: 0;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.category-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 6px 12px;
	gap: 6px;
	min-width: 60px;
	border-radius: 8px;
	transition: background-color 0.2s;
}

.category-item:active {
	background-color: #FFF8E1;
}

.category-icon {
	width: 38px;
	height: 38px;
	border-radius: 10px;
}

.category-name {
	font-size: 11px;
	font-weight: 500;
	color: rgba(0, 0, 0, 0.6);
}

.category-active .category-name {
	color: #F2B131;
	font-weight: 600;
}

/* 优惠专区和拼单专区 */
.zone-section {
	display: flex;
	gap: 8px;
	padding: 0 16px;
	margin-bottom: 10px;
}

.zone-card {
	flex: 1;
	background-color: #FFFFFF;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	transition: transform 0.2s;
}

.zone-card:active {
	transform: scale(0.98);
}

.zone-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 10px 4px;
	background-color: #FFFFFF;
}

.zone-title {
	font-size: 14px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.85);
}

.zone-more {
	display: flex;
	align-items: center;
	gap: 2px;
}

.zone-more .more-text {
	font-size: 10px;
	color: #949494;
}

.zone-more .more-icon {
	width: 10px;
	height: 10px;
}

.zone-content {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 10px 10px;
	background-color: #FFFFFF;
}

.zone-image {
	width: 66px;
	height: 66px;
	border-radius: 8px;
}

.zone-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.zone-name {
	font-size: 12px;
	color: rgba(0, 0, 0, 0.8);
}

.zone-price {
	display: flex;
	align-items: baseline;
}

.zone-price .price-symbol {
	font-size: 12px;
	font-weight: 600;
	color: #F2B131;
}

.zone-price .price-num {
	font-size: 18px;
	font-weight: 700;
	color: #F2B131;
}

/* 商家列表 */
.store-list {
	padding: 10px 16px 0 16px;
	margin-top: 6px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.store-card {
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 14px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	transition: transform 0.2s, box-shadow 0.2s;
}

.store-card:active {
	transform: scale(0.98);
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.store-card-main {
	display: flex;
	gap: 12px;
}

.store-card-logo {
	width: 72px;
	height: 72px;
	border-radius: 10px;
	flex-shrink: 0;
}

.store-card-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
}

.store-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.store-card-name {
	font-size: 15px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.85);
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.store-card-status {
	padding: 2px 8px;
	border-radius: 4px;
	flex-shrink: 0;
}

.store-card-status.status-open {
	background-color: rgba(82, 196, 26, 0.12);
}

.store-card-status.status-closed {
	background-color: rgba(0, 0, 0, 0.06);
}

.store-card-status-text {
	font-size: 11px;
	font-weight: 500;
}

.status-open .store-card-status-text {
	color: #52C41A;
}

.status-closed .store-card-status-text {
	color: #999999;
}

.store-card-info-row {
	display: flex;
	align-items: center;
	gap: 4px;
}

.store-card-hours {
	font-size: 12px;
	color: rgba(0, 0, 0, 0.5);
}

.store-card-address {
	font-size: 12px;
	color: rgba(0, 0, 0, 0.45);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.store-card-phone {
	font-size: 12px;
	color: rgba(0, 0, 0, 0.5);
	margin-top: 2px;
}

.store-card-delivery {
	display: inline-flex;
	margin-top: 2px;
}

.store-card-delivery .delivery-text {
	font-size: 10px;
	color: #52C41A;
	background-color: rgba(82, 196, 26, 0.08);
	padding: 2px 6px;
	border-radius: 4px;
}

.store-card-tags {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
}

.store-card-tag {
	font-size: 10px;
	color: #F2B131;
	background-color: rgba(242, 177, 49, 0.1);
	padding: 2px 8px;
	border-radius: 4px;
}

.store-card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 10px;
	padding-top: 10px;
	border-top: 1px solid #F5F5F5;
}

.store-card-distance {
	display: flex;
	align-items: center;
	gap: 4px;
}

.store-card-distance-icon {
	width: 14px;
	height: 14px;
}

.store-card-distance-text {
	font-size: 12px;
	color: rgba(0, 0, 0, 0.5);
	font-weight: 500;
}

.store-card-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}


.store-card-enter {
	background-color: #F2B131;
	padding: 4px 16px;
	border-radius: 12px;
	transition: opacity 0.2s;
}

.store-card-enter:active {
	opacity: 0.8;
}

.store-card-enter-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
}

/* 空状态 */
.empty-state {
	padding: 40px 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.empty-text {
	font-size: 14px;
	color: #949494;
}

/* 底部占位 */
.bottom-placeholder {
	height: 70px;
}
</style>
