<template>
	<view class="dinein-stores-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('index.dineIn') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 搜索框 -->
		<view class="search-section">
			<view class="search-box">
				<image class="search-icon" src="/static/icons/search.svg" mode="aspectFit"></image>
				<input
					class="search-input"
					v-model="searchKeyword"
					:placeholder="i18n.t('storeSelect.searchPlaceholder')"
					confirm-type="search"
					@confirm="handleSearch"
				/>
				<view class="search-clear" v-if="searchKeyword" @click="clearSearch">
					<text class="clear-text">x</text>
				</view>
			</view>
		</view>

		<!-- 分类标签栏 -->
		<scroll-view class="category-scroll" scroll-x>
			<view class="category-list">
				<view
					class="category-item"
					:class="{ 'category-active': activeCategory === -1 }"
					@click="selectCategory(-1)"
				>
					<image class="category-icon" src="/static/icons/cat-all.svg" mode="aspectFit"></image>
					<text class="category-name">{{ t('products.all') || '全部' }}</text>
				</view>
				<view
					v-for="(cat, index) in categories"
					:key="cat.id || index"
					class="category-item"
					:class="{ 'category-active': activeCategory === index }"
					@click="selectCategory(index)"
				>
					<image class="category-icon" :src="getCategoryIcon(cat)" mode="aspectFit"></image>
					<text class="category-name">{{ cat['name_' + lang] || cat.name }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 店铺列表 -->
		<scroll-view class="store-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<view class="store-list">
				<view
					v-for="store in filteredStores"
					:key="store.id"
					class="store-card"
					@click="handleStoreClick(store)"
				>
					<!-- Banner -->
					<view class="sc-banner">
						<image class="sc-banner-img" :src="getStoreBanner(store)" mode="aspectFill"></image>
						<view class="sc-banner-overlay">
							<view class="sc-banner-top">
								<text class="sc-store-name">{{ store['name_' + lang] || store.name }}</text>
								<view class="sc-status-badge" :class="store.status === 'OPEN' ? 'sc-status-open' : 'sc-status-closed'">
									<text class="sc-status-text">{{ store.status === 'OPEN' ? i18n.t('storeSelect.open') : i18n.t('storeSelect.closed') }}</text>
								</view>
							</view>
							<view class="sc-banner-info" v-if="store.distance">
								<text class="sc-distance">{{ store.distance }}</text>
								<text class="sc-bike" v-if="store.bikeTime">{{ store.bikeTime }}</text>
							</view>
						</view>
					</view>
					<view class="sc-hours" v-if="getBusinessHours(store)">
						<text class="sc-hours-text">{{ t('dinein.businessHours') }}：{{ getBusinessHours(store) }}</text>
					</view>

					<!-- 菜品预览 -->
					<view class="sc-products" v-if="store._items && store._items.length > 0">
						<view class="sc-products-header">
							<text class="sc-products-title">{{ t('products.hotItems') || '招牌菜品' }}</text>
							<text class="sc-products-count">{{ store._items.length }} {{ t('products.items') || '款' }}</text>
						</view>
						<scroll-view class="sc-products-scroll" scroll-x>
							<view class="sc-products-list">
								<view
									class="sc-product-item"
									v-for="(prod, pi) in store._items.slice(0, 8)"
									:key="pi"
									@click.stop="handleProductClick(prod, store)"
								>
									<image class="sc-product-img" :src="fixMinioUrl(prod.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
									<text class="sc-product-name">{{ prod['name_' + lang] || prod.name }}</text>
									<text class="sc-product-price">฿{{ prod.price }}</text>
								</view>
							</view>
						</scroll-view>
					</view>

					<!-- 进入店铺 -->
					<view class="sc-action">
						<view class="sc-enter-btn">
							<text class="sc-enter-text">{{ t('mine.enterStore') }}</text>
							<image class="sc-enter-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载 -->
			<view class="loading-tip">
				<text v-if="loading" class="tip-text">{{ t("common.loading") }}</text>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && filteredStores.length === 0" class="empty-state">
				<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ t("common.empty.store") || i18n.t("common.noData") }}</text>
			</view>

			<view class="bottom-placeholder"></view>
		</scroll-view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import appStore from '@/store/index.js'
import { fixMinioUrl, calcDistance } from '@/utils/index.js'
import { getLocationOrDefault } from '@/utils/location.js'
import { getPublicStores, getBusinessTypes } from '@/api/services/store.js'
import { getConsumerMenuItems } from '@/api/services/menu.js'

export default {
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			lang: i18n.getLanguage(),
			statusBarHeight: 20,
			contentHeight: 500,
			loading: false,
			searchKeyword: '',
			categories: [],
			activeCategory: -1,
			stores: []
		}
	},
	computed: {
		filteredStores() {
			let list = this.stores
			if (this.activeCategory >= 0) {
				const cat = this.categories[this.activeCategory]
				if (cat && cat.code) {
					list = list.filter(s => s.business_types && s.business_types.includes(cat.code))
				}
			}
			if (this.searchKeyword.trim()) {
				const kw = this.searchKeyword.trim().toLowerCase()
				list = list.filter(s => {
					const name = (s['name_' + this.lang] || s.name || '').toLowerCase()
					const addr = (s.formatted_address || s.address || '').toLowerCase()
					return name.includes(kw) || addr.includes(kw)
				})
			}
			return list
		}
	},
	onLoad() {
		this.lang = i18n.getLanguage()
		this.initPage()
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
			const searchBarHeight = 44
			const catBarHeight = 72
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - searchBarHeight - catBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadData() {
			this.loading = true
			try {
				const [catRes, storesRes] = await Promise.allSettled([
					getBusinessTypes(),
					getPublicStores({ delivery_enabled: 'false' })
				])

				// 分类列表
				if (catRes.status === 'fulfilled' && catRes.value.code === 0 && catRes.value.data) {
					const btItems = Array.isArray(catRes.value.data) ? catRes.value.data : []
					const hostelCodes = ['HOSTEL_ROOM', 'HOSTEL_HOTPOT', 'HOSTEL_COFFEE']
					this.categories = btItems
						.filter(bt => bt.is_active !== false && !hostelCodes.includes(bt.code))
						.map(bt => ({
							id: bt.code,
							name: bt.name,
							name_en: bt.name_en || '',
							name_th: bt.name_th || '',
							code: bt.code,
							icon_url: bt.icon_url || ''
						}))
				}

				// 堂食店铺列表
				if (storesRes.status === 'fulfilled' && storesRes.value.code === 0 && storesRes.value.data) {
					const data = storesRes.value.data
					const list = Array.isArray(data) ? data : (data.items || [])

					let dineinStores = list.filter(s => !s.delivery_enabled)

					// 计算距离并排序（失败用曼谷默认坐标，不抛错）
					try {
						const loc = await getLocationOrDefault()
						dineinStores.forEach(s => {
							if (s.latitude && s.longitude) {
								const info = calcDistance(loc.latitude, loc.longitude, s.latitude, s.longitude)
								if (info) {
									s.distance = info.distanceText
									s.bikeTime = info.bikeText
									s.walkTime = info.walkText
									s._distanceKm = info.distanceKm
								}
							}
						})
						dineinStores.sort((a, b) => (a._distanceKm || Infinity) - (b._distanceKm || Infinity))
					} catch (e) {
						console.warn('getLocation failed:', e)
					}

					// 加载每个店铺的热门菜品
					const storesWithItems = await Promise.all(
						dineinStores.map(async (store) => {
							try {
								const menuRes = await getConsumerMenuItems(store.id, { page_size: 10 })
								let prods = []
								if (menuRes.code === 0 && menuRes.data) {
									prods = Array.isArray(menuRes.data) ? menuRes.data : (menuRes.data.items || [])
								}
								prods = prods.map(p => ({ ...p, image_url: fixMinioUrl(p.image_url) }))
								return { ...store, _items: prods }
							} catch (e) {
								return { ...store, _items: [] }
							}
						})
					)
					this.stores = storesWithItems
				}
			} catch (e) {
				console.error('loadData error:', e)
			} finally {
				this.loading = false
			}
		},

		getCategoryIcon(cat) {
			if (cat.icon_url) {
				return fixMinioUrl(cat.icon_url)
			}
			return '/static/images/img-placeholder.svg'
		},

		getStoreBanner(store) {
			if (store.images && store.images.length > 0) {
				const img = store.images[0]
				if (typeof img === 'string') return fixMinioUrl(img)
				if (img.url) return fixMinioUrl(img.url)
				if (img.image_url) return fixMinioUrl(img.image_url)
			}
			if (store.background_image_url) return fixMinioUrl(store.background_image_url)
			if (store.logo_url || store.logo) return fixMinioUrl(store.logo_url || store.logo)
			return '/static/images/banner-placeholder.svg'
		},

		// 兼容后端多种营业时间字段：config.opening_time/closing_time、business_hours 字符串、
		// businessHours、opening_hours、顶层 opening_time/closing_time
		getBusinessHours(store) {
			if (!store) return ''
			if (store._businessHours !== undefined) return store._businessHours
			let hours = ''
			const cfg = store.config || store.store_config
			if (cfg && cfg.is_24_hours) {
				hours = '24h'
			} else if (cfg && cfg.opening_time && cfg.closing_time) {
				const open = String(cfg.opening_time).slice(0, 5)
				const close = String(cfg.closing_time).slice(0, 5)
				if (open && close && !open.includes('undefined') && !close.includes('undefined')) {
					hours = `${open}-${close}`
				}
			}
			if (!hours) {
				const str = store.business_hours || store.businessHours || store.opening_hours
				if (str && typeof str === 'string' && !str.includes('undefined') && str !== '-' && str !== ' - ') {
					hours = str
				}
			}
			if (!hours && store.opening_time && store.closing_time) {
				const open = String(store.opening_time).slice(0, 5)
				const close = String(store.closing_time).slice(0, 5)
				if (open && close && !open.includes('undefined') && !close.includes('undefined')) {
					hours = `${open}-${close}`
				}
			}
			store._businessHours = hours
			return hours
		},

		selectCategory(index) {
			this.activeCategory = index
		},

		handleStoreClick(store) {
			appStore.setCurrentStore(store)
			uni.navigateTo({
				url: '/pages/dinein/index?shopId=' + store.id
			})
		},

		handleProductClick(prod, store) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${prod.id}&shopId=${store.id}`
			})
		},

		handleSearch() {},
		clearSearch() {
			this.searchKeyword = ''
		},
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.dinein-stores-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}
.status-bar { width: 100%; background-color: #FFFFFF; }

/* 导航栏 */
.nav-bar {
	height: 44px; background-color: #FFFFFF;
	display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
}
.nav-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.back-icon { width: 20px; height: 20px; }
.nav-title { font-size: 16px; font-weight: 600; color: #3C3C3C; }
.nav-right { width: 32px; }

/* 搜索 */
.search-section { padding: 0 16px 8px; background-color: #FFFFFF; }
.search-box {
	height: 36px; background-color: #F5F5F5; border-radius: 22px;
	display: flex; align-items: center; padding: 0 12px; gap: 8px;
}
.search-icon { width: 16px; height: 16px; flex-shrink: 0; }
.search-input { flex: 1; font-size: 13px; height: 36px; }
.search-clear {
	width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
	background-color: #CCCCCC; border-radius: 10px; flex-shrink: 0;
}
.clear-text { font-size: 12px; color: #FFFFFF; }

/* 分类栏 */
.category-scroll {
	height: 72px; background-color: #FFFFFF; white-space: nowrap;
	border-bottom: 1px solid #F3F3F3;
}
.category-list {
	display: flex; padding: 8px 16px; align-items: flex-start; gap: 16px;
}
.category-item {
	flex-shrink: 0; display: flex; flex-direction: column; align-items: center;
	width: 52px;
}
.category-icon {
	width: 36px; height: 36px; border-radius: 10px; background-color: #FFF8E8;
	margin-bottom: 4px;
}
.category-name {
	font-size: 11px; color: #828282; text-align: center;
	width: 52px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.category-active .category-icon {
	background-color: rgba(242, 177, 49, 0.2);
}
.category-active .category-name {
	color: #F2B131; font-weight: 600;
}

/* 店铺列表 */
.store-scroll { flex: 1; }
.store-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }

.store-card { background-color: #FFFFFF; border-radius: 12px; overflow: hidden; }

/* Banner */
.sc-banner { position: relative; height: 140px; }
.sc-banner-img { width: 100%; height: 100%; }
.sc-banner-overlay {
	position: absolute; bottom: 0; left: 0; right: 0;
	padding: 30px 12px 10px;
	background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%);
}
.sc-banner-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sc-store-name { font-size: 17px; font-weight: 700; color: #FFFFFF; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sc-status-badge { padding: 2px 10px; border-radius: 10px; flex-shrink: 0; }
.sc-status-open { background-color: rgba(76, 175, 80, 0.85); }
.sc-status-closed { background-color: rgba(158, 158, 158, 0.85); }
.sc-status-text { font-size: 11px; font-weight: 500; color: #FFFFFF; }
.sc-banner-info { display: flex; gap: 12px; margin-top: 6px; }
.sc-distance, .sc-bike { font-size: 12px; color: rgba(255,255,255,0.85); }
.sc-hours { padding: 6px 12px 0; }
.sc-hours-text { font-size: 12px; color: #888; line-height: 16px; }

/* 菜品预览 */
.sc-products { padding: 6px 12px 0; }
.sc-products-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.sc-products-title { font-size: 13px; font-weight: 600; color: #3C3C3C; }
.sc-products-count { font-size: 11px; color: #949494; }
.sc-products-scroll { white-space: nowrap; }
.sc-products-list { display: flex; gap: 8px; padding-bottom: 4px; }
.sc-product-item { width: 72px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; }
.sc-product-img { width: 72px; height: 72px; border-radius: 8px; background-color: #F5F5F5; }
.sc-product-name { font-size: 10px; color: #3C3C3C; margin-top: 4px; width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
.sc-product-price { font-size: 11px; font-weight: 600; color: #F2B131; margin-top: 2px; }

/* 进入店铺 */
.sc-action { padding: 10px 12px 12px; border-top: 1px solid #F5F5F5; margin-top: 8px; }
.sc-enter-btn {
	display: flex; align-items: center; justify-content: center;
	background-color: #F2B131; border-radius: 20px; padding: 8px 0; gap: 4px;
}
.sc-enter-text { font-size: 14px; font-weight: 600; color: #FFFFFF; }
.sc-enter-arrow { width: 16px; height: 16px; }

/* 加载/空状态 */
.loading-tip { padding: 16px 0; display: flex; justify-content: center; }
.tip-text { font-size: 12px; color: #949494; }
.empty-state { padding: 60px 0; display: flex; flex-direction: column; align-items: center; }
.empty-icon { width: 120px; height: 120px; margin-bottom: 12px; }
.empty-title { font-size: 15px; color: #333; font-weight: 500; }
.bottom-placeholder { height: 20px; }
</style>
