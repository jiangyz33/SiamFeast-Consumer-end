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
					<view class="store-card-left">
						<image class="store-logo" :src="fixMinioUrl(store.logo_url || store.logo || '') || '/static/images/store-placeholder.svg'" mode="aspectFill"></image>
					</view>
					<view class="store-card-right">
						<view class="store-card-header">
							<text class="store-card-name">{{ store['name_' + i18n.getLanguage()] || store.name }}</text>
							<view class="store-status" :class="store.status === 'OPEN' ? 'status-open' : 'status-closed'">
								<text class="store-status-text">{{ store.status === 'OPEN' ? i18n.t('storeSelect.open') : i18n.t('storeSelect.closed') }}</text>
							</view>
						</view>
						<text class="store-address">{{ store.formatted_address || store.address }}</text>
						<view class="store-card-tags" v-if="store.business_types && store.business_types.length > 0">
							<text class="store-tag" v-for="(bt, bi) in store.business_types" :key="bi">{{ getBusinessTypeName(bt) }}</text>
						</view>
						<view class="store-card-footer">
							<text class="store-hours">{{ store.business_hours || '' }}</text>
							<view class="store-enter-btn">
								<text class="store-enter-text">{{ i18n.t('mine.enterStore') }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-tip">
				<text v-if="loading" class="tip-text">{{ i18n.t("common.loading") }}</text>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && filteredStores.length === 0" class="empty-state">
				<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ i18n.t("common.empty.store") || i18n.t("common.noData") }}</text>
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
							<image class="product-image" :src="item.image_url || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
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
								<text class="original-price" v-if="item.original_price">฿{{ item.original_price }}</text>
								<text class="sales-text">{{ i18n.t("products.sold") }}{{ item.sales_count || 0 }}{{ i18n.t("products.units") }}</text>
								<view class="buy-btn" @click.stop="handleBuyNow(item)">
									<text class="buy-btn-text">{{ i18n.t("productDetail.buyNow") }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="loading-tip">
					<text v-if="loading" class="tip-text">{{ i18n.t("common.loading") }}</text>
					<text v-else-if="noMore && products.length > 0" class="tip-text">{{ i18n.t("order.noMore") }}</text>
				</view>

				<view v-if="!loading && products.length === 0" class="empty-state">
					<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
					<text class="empty-title">{{ i18n.t("common.empty.product") }}</text>
					<text class="empty-desc">{{ i18n.t("common.empty.productDesc") }}</text>
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

export default {
	components: { CustomTabbar },
	data() {
		return {
			i18n: i18n,
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
			// 门店列表模式
			isStoreMode: false,
			stores: []
		}
	},
	computed: {
		filteredStores() {
			if (!this.searchKeyword.trim()) return this.stores
			const kw = this.searchKeyword.trim().toLowerCase()
			return this.stores.filter(s => {
				const name = (s['name_' + i18n.getLanguage()] || s.name || '').toLowerCase()
				const addr = (s.formatted_address || s.address || '').toLowerCase()
				return name.includes(kw) || addr.includes(kw)
			})
		}
	},
	onLoad(options) {
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
	methods: {
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
				// 按门店的 business_types 过滤匹配当前分类的门店
				this.stores = items.filter(s =>
					s.business_types && s.business_types.includes(this.businessType)
				)
			} catch (e) {
				console.error('加载门店失败:', e)
			} finally {
				this.loading = false
			}
		},

		getBusinessTypeName(code) {
			const map = {
				'HOTPOT_BUFFET': i18n.t('mall.hotpot') || '火锅自助',
				'HOTPOT_PER_ITEM': i18n.t('mall.hotpotPerItem') || '火锅计件',
				'MALA_TANG': i18n.t('mall.malatang') || '麻辣烫',
				'SEAFOOD_NOODLE': i18n.t('mall.seafoodNoodle') || '海鲜面',
				'STANDARD_FOOD': i18n.t('mall.standardFood') || '标准餐饮',
				'HOSTEL_ROOM': i18n.t('mall.hostel') || '民宿',
				'HOSTEL_HOTPOT': i18n.t('mall.hostelHotpot') || '民宿火锅',
				'HOSTEL_COFFEE': i18n.t('mall.hostelCoffee') || '民宿咖啡'
			}
			return map[code] || code
		},

		handleStoreClick(store) {
			uni.navigateTo({
				url: `/pages/dinein/index?shopId=${store.id}`
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

		handleProductClick(item) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${item.id}&shopId=${this.shopId || ''}`
			})
		},

		handleBuyNow(item) {
			if (item.is_sold_out) {
				showToast(i18n.t('index.soldOut'))
				return
			}
			const productData = {
				id: item.id,
				name: item["name_" + i18n.getLanguage()] || item.name || item.name_en,
				price: item.price,
				image: item.image_url || '/static/images/img-placeholder.svg',
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

/* 门店列表模式 */
.store-list {
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.store-card {
	background-color: #FFFFFF;
	border-radius: 10px;
	padding: 12px;
	display: flex;
	gap: 12px;
}

.store-card-left {
	width: 80px;
	height: 80px;
	flex-shrink: 0;
	border-radius: 8px;
	overflow: hidden;
	background-color: #F5F5F5;
}

.store-logo {
	width: 80px;
	height: 80px;
}

.store-card-right {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.store-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.store-card-name {
	font-size: 15px;
	font-weight: 600;
	color: #3C3C3C;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.store-status {
	padding: 2px 8px;
	border-radius: 10px;
	flex-shrink: 0;
}

.status-open {
	background-color: #E8F5E9;
}

.status-closed {
	background-color: #F5F5F5;
}

.store-status-text {
	font-size: 11px;
	font-weight: 500;
}

.status-open .store-status-text {
	color: #4CAF50;
}

.status-closed .store-status-text {
	color: #949494;
}

.store-address {
	font-size: 12px;
	color: #949494;
	margin-top: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.store-card-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-top: 6px;
}

.store-tag {
	font-size: 10px;
	color: #F2B131;
	background-color: #FFF8E1;
	padding: 2px 6px;
	border-radius: 4px;
}

.store-card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 6px;
}

.store-hours {
	font-size: 11px;
	color: #949494;
}

.store-enter-btn {
	background-color: #F2B131;
	padding: 4px 14px;
	border-radius: 14px;
}

.store-enter-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
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
