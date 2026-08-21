<template>
	<view class="products-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ categoryName || i18n.t('products.productList') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 搜索框 -->
		<view class="search-section">
			<view class="search-box">
				<image class="search-icon" src="/static/icons/search.svg" mode="aspectFit"></image>
				<input
					class="search-input"
					v-model="searchKeyword"
					:placeholder="isStoreMode ? i18n.t('storeSelect.searchPlaceholder') : i18n.t('products.searchProducts')"
					confirm-type="search"
					@confirm="handleSearch"
				/>
				<view class="search-clear" v-if="searchKeyword" @click="clearSearch">
					<text class="clear-text">x</text>
				</view>
			</view>
		</view>

		<!-- 门店列表模式 -->
		<scroll-view v-if="isStoreMode" class="products-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<view class="store-list">
				<view
					v-for="store in filteredStores"
					:key="store.id"
					class="store-card"
					@click="handleStoreClick(store)"
				>
					<!-- Banner 区域 -->
					<view class="sc-banner">
						<image
							class="sc-banner-img"
							:src="getStoreBanner(store)"
							mode="aspectFill"
						></image>
						<view class="sc-banner-overlay">
							<view class="sc-banner-top">
								<text class="sc-store-name">{{ store['name_' + lang] || store.name }}</text>
								<view class="sc-status-badge" :class="store.status === 'OPEN' ? 'sc-status-open' : 'sc-status-closed'">
									<text class="sc-status-text">{{ store.status === 'OPEN' ? i18n.t('storeSelect.open') : i18n.t('storeSelect.closed') }}</text>
								</view>
							</view>
							<view class="sc-banner-tags" v-if="store.business_types && store.business_types.length">
								<text class="sc-tag" v-for="(bt, bi) in store.business_types" :key="bi">{{ getBusinessTypeName(bt) }}</text>
							</view>
						</view>
					</view>

					<!-- 信息区域 -->
					<view class="sc-info">
						<view class="sc-info-row" v-if="store.formatted_address || store.address">
							<image class="sc-info-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
							<text class="sc-info-text">{{ store.formatted_address || store.address }}</text>
						</view>
						<view class="sc-info-row" v-if="store.business_hours">
							<image class="sc-info-icon" src="/static/icons/clock.svg" mode="aspectFit"></image>
							<text class="sc-info-text">{{ store.business_hours }}</text>
						</view>
					</view>

					<!-- 商品预览区域 -->
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
									<text class="sc-product-name">{{ prod['name_' + lang] || prod.name || prod.name_en }}</text>
									<text class="sc-product-price">฿{{ prod.price }}</text>
								</view>
							</view>
						</scroll-view>
					</view>

					<!-- 进入店铺按钮 -->
					<view class="sc-action">
						<view class="sc-enter-btn">
							<text class="sc-enter-text">{{ t('mine.enterStore') }}</text>
							<image class="sc-enter-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
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

		<!-- 商品列表模式（原有逻辑） -->
		<template v-else>
			<!-- 筛选标签栏 -->
			<view class="filter-bar">
				<view class="filter-tabs">
					<view
						v-for="(item, index) in filterTabs"
						:key="index"
						class="filter-tab"
						:class="{ 'filter-tab-active': activeFilter === index }"
						@click="selectFilter(index)"
					>
						<text class="filter-tab-text">{{ item["name_" + i18n.getLanguage()] || item.name || item.name_en }}</text>
					</view>
				</view>
			</view>

			<!-- 商品列表 -->
			<scroll-view class="products-scroll" scroll-y :style="{ height: contentHeight + 'px' }" @scrolltolower="loadMore">
				<view class="product-list">
					<view
						v-for="item in products"
						:key="item.id"
						class="product-card"
						@click="handleProductClick(item)"
					>
						<view class="product-image-wrapper">
							<image class="product-image" :src="fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
							<view class="new-badge" v-if="item.is_new_product">
								<text class="new-badge-text">{{ i18n.t('productDetail.new') }}</text>
							</view>
							<view class="product-shop">
								<view class="shop-logo-wrapper">
									<image class="shop-logo" :src="storeLogo || '/static/images/banner-placeholder.svg'" mode="aspectFill"></image>
								</view>
								<text class="shop-name">{{ item.shopName || currentStoreName }}</text>
							</view>
						</view>
						<view class="product-info-overlay">
							<text class="product-name">{{ item["name_" + i18n.getLanguage()] || item.name || item.name_en }}</text>
							<view class="product-price-row">
								<text class="product-price">฿{{ item.price }}</text>
								<text class="original-price" v-if="item.original_price && Number(item.original_price) > Number(item.price)">฿{{ item.original_price }}</text>
								<text class="sales-text">{{ t("products.sold") }}{{ item.sales_count || 0 }}{{ t("products.units") }}</text>
								<view class="buy-btn" @click.stop="handleBuyNow(item)">
									<text class="buy-btn-text">{{ t("productDetail.buyNow") }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="loading-tip">
					<text v-if="loading" class="tip-text">{{ t("common.loading") }}</text>
					<text v-else-if="noMore && products.length > 0" class="tip-text">{{ t("order.noMore") }}</text>
				</view>

				<view v-if="!loading && products.length === 0" class="empty-state">
					<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
					<text class="empty-title">{{ t("common.empty.product") }}</text>
					<text class="empty-desc">{{ t("common.empty.productDesc") }}</text>
				</view>

				<view class="bottom-placeholder"></view>
			</scroll-view>
		</template>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="0"></custom-tabbar>
	</view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar.vue'
import appStore from '@/store/index.js'
import i18n from '@/i18n/index.js'
import { fixMinioUrl, showToast } from '@/utils/index.js'
import { searchProducts, getHotProducts, getNewProducts, getProductsByCategory } from '@/api/services/products.js'
import { getActiveCampaigns } from '@/api/services/campaign.js'
import { getPublicStores } from '@/api/services/store.js'
import { getConsumerMenuItems } from '@/api/services/menu.js'

export default {
	components: { CustomTabbar },
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			lang: i18n.getLanguage(),
			statusBarHeight: 20,
			contentHeight: 500,
			activeFilter: 0,
			filterTabs: [
				{ name: '全部', name_en: 'All', name_th: 'ทั้งหมด', type: 'all' },
				{ name: '热销', name_en: 'Hot', name_th: 'ยอดนิยม', type: 'hot' },
				{ name: '新品', name_en: 'New', name_th: 'ใหม่', type: 'new' },
				{ name: '优惠', name_en: 'Discount', name_th: 'ส่วนลด', type: 'discount' }
			],
			products: [],
			loading: false,
			noMore: false,
			shopId: null,
			currentStoreName: '',
			storeLogo: '',
			searchKeyword: '',
			isSearchMode: false,
			categoryId: null,
			businessType: null,
			categoryName: '',
			page: 1,
			isStoreMode: false,
			stores: []
		}
	},
	computed: {
		filteredStores() {
			if (!this.searchKeyword.trim()) return this.stores
			const kw = this.searchKeyword.trim().toLowerCase()
			return this.stores.filter(s => {
				const name = (s['name_' + this.lang] || s.name || '').toLowerCase()
				const addr = (s.formatted_address || s.address || '').toLowerCase()
				return name.includes(kw) || addr.includes(kw)
			})
		}
	},
	onLoad(options) {
		this.lang = i18n.getLanguage()
		this.initPage()
		if (options && options.shopId) {
			this.shopId = options.shopId
		} else {
			const currentStore = appStore.getCurrentStore()
			if (currentStore) {
				this.shopId = currentStore.id
				this.currentStoreName = currentStore.name || ""
				this.storeLogo = fixMinioUrl(currentStore.logo_url || currentStore.logo || '')
			}
		}
		if (options.keyword) {
			this.searchKeyword = decodeURIComponent(options.keyword)
			this.isSearchMode = true
		}
		if (options.filter) {
			const filterType = decodeURIComponent(options.filter)
			const idx = this.filterTabs.findIndex(t => t.type === filterType)
			if (idx >= 0) this.activeFilter = idx
		}
		if (options.categoryId) {
			this.categoryId = decodeURIComponent(options.categoryId)
		}
		if (options.businessType) {
			this.businessType = decodeURIComponent(options.businessType)
			this.isStoreMode = true
		}
		if (options.categoryName) {
			this.categoryName = decodeURIComponent(options.categoryName)
		}

		if (this.isStoreMode) {
			this.loadStores()
		} else {
			this.loadProducts()
		}
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
			const filterBarHeight = this.isStoreMode ? 0 : 40
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - searchBarHeight - filterBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadStores() {
			this.loading = true
			try {
				const res = await getPublicStores()
				let items = []
				if (res.code === 0 && res.data) {
					items = Array.isArray(res.data) ? res.data : (res.data.items || [])
				}
				// Filter stores matching current business type
				const matched = items.filter(s =>
					s.business_types && s.business_types.includes(this.businessType)
				)
				// Fetch products for each store in parallel
				const storesWithItems = await Promise.all(
					matched.map(async (store) => {
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
			} catch (e) {
				console.error('加载门店失败:', e)
			} finally {
				this.loading = false
			}
		},

		getStoreBanner(store) {
			// Try store images array first, then logo, then placeholder
			if (store.images && store.images.length > 0) {
				const img = store.images[0]
				if (typeof img === 'string') return fixMinioUrl(img)
				if (img.url) return fixMinioUrl(img.url)
				if (img.image_url) return fixMinioUrl(img.image_url)
			}
			if (store.logo_url || store.logo) {
				return fixMinioUrl(store.logo_url || store.logo)
			}
			return '/static/images/banner-placeholder.svg'
		},

		getBusinessTypeName(code) {
			const map = {
				'HOTPOT': i18n.t('mall.hotpot') || '火锅',
				'HOTPOT_BUFFET': i18n.t('mall.hotpot') || '火锅自助',
				'HOTPOT_PER_ITEM': i18n.t('mall.hotpotPerItem') || '火锅计件',
				'BBQ': i18n.t('mall.barbecue') || i18n.t('storeSelect.businessTypes.barbecue') || '烧烤',
				'BARBECUE': i18n.t('mall.barbecue') || i18n.t('storeSelect.businessTypes.barbecue') || '烧烤',
				'MALA_TANG': i18n.t('mall.malatang') || '麻辣烫',
				'MALATANG': i18n.t('mall.malatang') || '麻辣烫',
				'BEVERAGE': i18n.t('storeSelect.businessTypes.beverage') || '饮品',
				'SEAFOOD_NOODLES': i18n.t('mall.seafoodNoodle') || '海鲜面',
				'SEAFOOD_NOODLE': i18n.t('mall.seafoodNoodle') || '海鲜面',
				'SINEFOOD_NOODLE': i18n.t('mall.seafoodNoodle') || '海鲜面',
				'SINEFOOD_NOODLES': i18n.t('mall.seafoodNoodle') || '海鲜面',
				'STANDARD_FOOD': i18n.t('mall.standardFood') || '标准餐饮',
				'HOSTEL_ROOM': i18n.t('mall.hostel') || '民宿',
				'HOSTEL_HOTPOT': i18n.t('mall.hostelHotpot') || '民宿火锅',
				'HOSTEL_COFFEE': i18n.t('mall.hostelCoffee') || '民宿咖啡'
			}
			return map[code] || ''
		},

		handleStoreClick(store) {
			uni.navigateTo({
				url: `/pages/dinein/index?shopId=${store.id}`
			})
		},

		handleProductClick(item, store) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${item.id}&shopId=${store ? store.id : this.shopId || ''}`
			})
		},

		async loadProducts(append = false) {
			if (this.loading) return
			this.loading = true
			try {
				const filterType = this.filterTabs[this.activeFilter].type
				let res

				if (this.isSearchMode && this.searchKeyword.trim()) {
					const params = { keyword: this.searchKeyword.trim(), limit: 20 }
					if (this.categoryId) params.category_id = this.categoryId
					res = await searchProducts(params)
				} else if (filterType === 'hot') {
					const params = { limit: 20 }
					if (this.categoryId) params.category_id = this.categoryId
					res = await getHotProducts(params)
				} else if (filterType === 'new') {
					const params = { limit: 20 }
					if (this.categoryId) params.category_id = this.categoryId
					res = await getNewProducts(params)
				} else if (filterType === 'discount') {
					const campaignParams = { type: 'discount' }
					const campaignRes = await getActiveCampaigns(campaignParams)
					let discountProducts = []
					if (campaignRes.code === 0 && campaignRes.data) {
						const campaigns = Array.isArray(campaignRes.data) ? campaignRes.data : (campaignRes.data.items || [])
						campaigns.forEach(c => {
							if (c.products && c.products.length > 0) {
								let prods = c.products
								if (this.shopId) prods = prods.filter(p => p.store_id == this.shopId)
								if (this.categoryId) prods = prods.filter(p => p.category_id == this.categoryId)
								discountProducts = discountProducts.concat(prods)
							}
						})
					}
					if (!append) {
						this.products = discountProducts.map(p => ({ ...p, image_url: fixMinioUrl(p.image_url) }))
					} else {
						this.products = [...this.products, ...discountProducts.map(p => ({ ...p, image_url: fixMinioUrl(p.image_url) }))]
					}
					this.noMore = true
					return
				} else {
					const params = { page_size: 50 }
					if (this.categoryId) params.category_id = this.categoryId
					res = await getProductsByCategory(params)
				}

				if (res) {
					let items = res.data?.items || (Array.isArray(res.data) ? res.data : [])
					if (filterType === 'hot' || filterType === 'new') {
						if (this.categoryId) items = items.filter(p => p.category_id == this.categoryId)
						if (this.businessType) items = items.filter(p => p.business_type == this.businessType)
						if (this.shopId) items = items.filter(p => p.store_id == this.shopId)
					}
					if (!append) {
						this.products = items.map(p => ({ ...p, image_url: fixMinioUrl(p.image_url) }))
					} else {
						this.products = [...this.products, ...items.map(p => ({ ...p, image_url: fixMinioUrl(p.image_url) }))]
					}
					this.noMore = items.length < 50
				}
			} catch (e) {
				console.error('加载商品失败:', e)
			} finally {
				this.loading = false
			}
		},

		handleSearch() {
			if (!this.searchKeyword.trim()) {
				this.isSearchMode = false
				if (!this.isStoreMode) this.loadProducts()
				return
			}
			if (!this.isStoreMode) {
				this.isSearchMode = true
				this.loadProducts()
			}
		},

		clearSearch() {
			this.searchKeyword = ''
			this.isSearchMode = false
			if (!this.isStoreMode) this.loadProducts()
		},

		selectFilter(index) {
			if (this.activeFilter === index) return
			this.activeFilter = index
			this.isSearchMode = false
			this.products = []
			this.loadProducts()
		},

		loadMore() {
			if (this.noMore || this.loading) return
			this.loadProducts(true)
		},

		goBack() {
			uni.navigateBack()
		},

		handleBuyNow(item) {
			if (item.is_sold_out) {
				showToast(i18n.t('index.soldOut'))
				return
			}
			const productData = {
				id: item.id,
				name: item["name_" + this.lang] || item.name || item.name_en,
				price: item.price,
				image: fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg',
				quantity: 1,
				store_id: this.shopId
			}
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=dinein&shopId=${this.shopId}&products=${encodeURIComponent(JSON.stringify([productData]))}`
			})
		}
	}
}
</script>

<style scoped>
.products-page {
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

.nav-back {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 20px;
	height: 20px;
}

.nav-title {
	font-size: 16px;
	font-weight: 600;
	color: #3C3C3C;
}

.nav-right {
	width: 32px;
}

/* 搜索框 */
.search-section {
	padding: 0 16px 8px;
	background-color: #FFFFFF;
}

.search-box {
	height: 36px;
	background-color: #F5F5F5;
	border-radius: 22px;
	display: flex;
	align-items: center;
	padding: 0 12px;
	gap: 8px;
}

.search-icon {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
}

.search-input {
	flex: 1;
	font-size: 13px;
	height: 36px;
}

.search-clear {
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #CCCCCC;
	border-radius: 10px;
	flex-shrink: 0;
}

.clear-text {
	font-size: 12px;
	color: #FFFFFF;
}

/* 筛选栏 */
.filter-bar {
	height: 40px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	padding: 0 16px;
	border-bottom: 1px solid #F3F3F3;
}

.filter-tabs {
	display: flex;
	gap: 24px;
}

.filter-tab {
	padding: 8px 0;
}

.filter-tab-text {
	font-size: 14px;
	color: #828282;
}

.filter-tab-active .filter-tab-text {
	color: #F2B131;
	font-weight: 600;
}

/* 商品列表 */
.products-scroll {
	flex: 1;
}

.product-list {
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.product-card {
	background-color: #FFFFFF;
	border-radius: 8px;
	overflow: hidden;
}

.product-image-wrapper {
	width: 100%;
	height: 160px;
	position: relative;
}

.product-image {
	width: 100%;
	height: 100%;
}

/* 新品角标 */
.new-badge {
	position: absolute;
	top: 6px;
	left: 6px;
	background: linear-gradient(135deg, #FF6B6B 0%, #DA3300 100%);
	padding: 3px 8px;
	border-radius: 4px;
	z-index: 2;
}
.new-badge-text {
	font-size: 10px;
	color: #FFFFFF;
	font-weight: 600;
	line-height: 1.2;
}

.product-shop {
	position: absolute;
	top: 0;
	left: 0;
	display: flex;
	align-items: center;
	gap: 10px;
	background-color: rgba(0, 0, 0, 0.6);
	padding: 6px 0 0 6px;
	border-radius: 0 0 7px 0;
}

.shop-logo-wrapper {
	width: 24px;
	height: 24px;
	background-color: #F2B131;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.shop-logo {
	width: 18px;
	height: 18px;
	border-radius: 9px;
}

.shop-name {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
}

.buy-btn {
	margin-left: auto;
	background-color: #F2B131;
	padding: 4px 10px;
	border-radius: 12px;
	flex-shrink: 0;
}

.buy-btn-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
}

.product-info-overlay {
	padding: 8px 10px;
}

.product-name {
	font-size: 14px;
	font-weight: 600;
}

.product-price-row {
	display: flex;
	align-items: baseline;
	gap: 6px;
	margin-top: 4px;
}

.product-price {
	font-size: 14px;
	font-weight: 600;
	color: #F2B131;
}

.original-price {
	font-size: 11px;
	color: #949494;
	text-decoration: line-through;
}

.sales-text {
	font-size: 11px;
	color: #949494;
	margin-left: auto;
}

/* ========= 新门店卡片样式 ========= */
.store-list {
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.store-card {
	background-color: #FFFFFF;
	border-radius: 12px;
	overflow: hidden;
}

/* Banner */
.sc-banner {
	position: relative;
	height: 140px;
}

.sc-banner-img {
	width: 100%;
	height: 100%;
}

.sc-banner-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 30px 12px 10px;
	background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%);
}

.sc-banner-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.sc-store-name {
	font-size: 17px;
	font-weight: 700;
	color: #FFFFFF;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.sc-status-badge {
	padding: 2px 10px;
	border-radius: 10px;
	flex-shrink: 0;
}

.sc-status-open {
	background-color: rgba(76, 175, 80, 0.85);
}

.sc-status-closed {
	background-color: rgba(158, 158, 158, 0.85);
}

.sc-status-text {
	font-size: 11px;
	font-weight: 500;
	color: #FFFFFF;
}

.sc-banner-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 6px;
}

.sc-tag {
	font-size: 10px;
	color: #F2B131;
	background-color: rgba(242, 177, 49, 0.2);
	padding: 2px 8px;
	border-radius: 4px;
	font-weight: 500;
}

/* Info section */
.sc-info {
	padding: 10px 12px 6px;
}

.sc-info-row {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 4px;
}

.sc-info-icon {
	width: 14px;
	height: 14px;
	flex-shrink: 0;
}

.sc-info-text {
	font-size: 12px;
	color: #949494;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* Products preview */
.sc-products {
	padding: 6px 12px 0;
}

.sc-products-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.sc-products-title {
	font-size: 13px;
	font-weight: 600;
	color: #3C3C3C;
}

.sc-products-count {
	font-size: 11px;
	color: #949494;
}

.sc-products-scroll {
	white-space: nowrap;
}

.sc-products-list {
	display: flex;
	gap: 8px;
	padding-bottom: 4px;
}

.sc-product-item {
	width: 72px;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.sc-product-img {
	width: 72px;
	height: 72px;
	border-radius: 8px;
	background-color: #F5F5F5;
}

.sc-product-name {
	font-size: 10px;
	color: #3C3C3C;
	margin-top: 4px;
	width: 72px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: center;
}

.sc-product-price {
	font-size: 11px;
	font-weight: 600;
	color: #F2B131;
	margin-top: 2px;
}

/* Action button */
.sc-action {
	padding: 10px 12px 12px;
	border-top: 1px solid #F5F5F5;
	margin-top: 8px;
}

.sc-enter-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #F2B131;
	border-radius: 20px;
	padding: 8px 0;
	gap: 4px;
}

.sc-enter-text {
	font-size: 14px;
	font-weight: 600;
	color: #FFFFFF;
}

.sc-enter-arrow {
	width: 16px;
	height: 16px;
}

/* 加载提示 */
.loading-tip {
	padding: 16px 0;
	display: flex;
	justify-content: center;
}

.tip-text {
	font-size: 12px;
	color: #949494;
}

/* 空状态 */
.empty-state {
	padding: 60px 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.empty-icon {
	width: 120px;
	height: 120px;
	margin-bottom: 12px;
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

/* 底部占位 */
.bottom-placeholder {
	height: 70px;
}
</style>
