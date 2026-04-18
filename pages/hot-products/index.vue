<template>
	<view class="hot-products-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">热销榜单</text>
			<view class="nav-right">
				<view class="search-btn" @click="handleSearchClick">
					<image class="search-icon" src="/static/icons/search.svg" mode="aspectFit"></image>
				</view>
			</view>
		</view>

		<!-- 搜索栏 -->
		<view class="search-bar" v-if="showSearch">
			<view class="search-input-wrapper">
				<image class="search-input-icon" src="/static/icons/search.svg" mode="aspectFit"></image>
				<input
					class="search-input"
					v-model="searchKeyword"
					placeholder="搜索商品"
					confirm-type="search"
					@confirm="handleSearch"
				/>
				<view class="search-clear" v-if="searchKeyword" @click="clearSearch">
					<text class="clear-text">x</text>
				</view>
			</view>
		</view>

		<!-- 分类筛选 -->
		<scroll-view class="category-scroll" scroll-x>
			<view class="category-list">
				<view
					v-for="(item, index) in categories"
					:key="item.id || index"
					class="category-tab"
					:class="{ 'category-tab-active': activeCategoryIndex === index }"
					@click="selectCategory(index)"
				>
					<text class="category-tab-text">{{ item.name }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }" @scrolltolower="loadMore">
			<!-- 产品列表 -->
			<view class="products-container">
				<view
					v-for="(item, index) in products"
					:key="item.id"
					class="product-card"
					@click="handleProductClick(item)"
				>
					<!-- 排名角标 -->
					<view class="rank-badge" v-if="index < 3">
						<text class="rank-text">{{ index + 1 }}</text>
					</view>
					<image class="product-image" :src="item.image_url || '/static/logo.png'" mode="aspectFill"></image>
					<view class="product-info">
						<view class="product-content">
							<text class="product-name">{{ item.name }}</text>
							<view class="product-sales">
								<text class="sales-text">已售{{ item.sales_count || 0 }}份</text>
							</view>
						</view>
						<view class="product-footer">
							<view class="price-section">
								<text class="price-text">฿{{ item.price }}</text>
								<text class="original-price" v-if="item.original_price">฿{{ item.original_price }}</text>
							</view>
							<view class="buy-btn" @click.stop="handleBuy(item)">
								<text class="buy-text">抢</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-tip">
				<text v-if="loading" class="tip-text">加载中...</text>
				<text v-else-if="noMore && products.length > 0" class="tip-text">没有更多了</text>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && products.length === 0" class="empty-state">
				<text class="empty-text">暂无热销商品</text>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="0"></custom-tabbar>
	</view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar.vue'
import appStore from '@/store/index.js'
import i18n from '@/i18n/index.js'
import { showToast } from '@/utils/index.js'
import { getHotProducts, searchProducts } from '@/api/services/products.js'
import { getConsumerCategories } from '@/api/services/menu.js'

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
			noMore: false,
			shopId: null,
			allProducts: [],
			categories: [{ id: null, name: '全部' }],
			activeCategoryIndex: 0,
			showSearch: false,
			searchKeyword: '',
			isSearchMode: false
		}
	},
	computed: {
		products() {
			if (this.activeCategoryIndex === 0) return this.allProducts
			const selectedCat = this.categories[this.activeCategoryIndex]
			if (!selectedCat || !selectedCat.id) return this.allProducts
			return this.allProducts.filter(p => p.category_id === selectedCat.id)
		}
	},
	onLoad() {
		this.initPage()
		const currentStore = appStore.getCurrentStore()
		if (currentStore) {
			this.shopId = currentStore.id
		}
		this.loadCategories()
		this.loadProducts()
	},
	methods: {
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadCategories() {
			try {
				const storeId = this.shopId || 1
				const res = await getConsumerCategories(storeId)
				if (res.code === 0 && res.data) {
					const cats = (res.data || []).map(c => ({
						id: c.id,
						name: c.name
					}))
					this.categories = [{ id: null, name: '全部' }, ...cats]
				}
			} catch (e) {
				console.error('加载分类失败:', e)
			}
		},

		async loadProducts() {
			if (this.loading) return
			this.loading = true
			try {
				const params = { limit: 20 }
				if (this.shopId) params.store_id = this.shopId

				const res = await getHotProducts(params)
				const items = res.data?.items || []
				this.allProducts = items
				this.noMore = items.length < 20
			} catch (e) {
				console.error('加载热销商品失败:', e)
			} finally {
				this.loading = false
			}
		},

		async handleSearch() {
			if (!this.searchKeyword.trim()) {
				this.isSearchMode = false
				this.loadProducts()
				return
			}
			this.loading = true
			this.isSearchMode = true
			try {
				const params = { keyword: this.searchKeyword.trim(), limit: 20 }
				if (this.shopId) params.store_id = this.shopId
				const res = await searchProducts(params)
				const items = res.data?.items || []
				this.allProducts = items
				this.noMore = true
			} catch (e) {
				console.error('搜索失败:', e)
			} finally {
				this.loading = false
			}
		},

		clearSearch() {
			this.searchKeyword = ''
			this.isSearchMode = false
			this.loadProducts()
		},

		handleSearchClick() {
			this.showSearch = !this.showSearch
			if (!this.showSearch && this.isSearchMode) {
				this.searchKeyword = ''
				this.isSearchMode = false
				this.loadProducts()
			}
		},

		selectCategory(index) {
			if (this.activeCategoryIndex === index) return
			this.activeCategoryIndex = index
		},

		loadMore() {
			// 热销商品暂不翻页
		},

		goBack() {
			uni.navigateBack()
		},

		handleProductClick(item) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${item.id}&shopId=${this.shopId || ''}`
			})
		},

		handleBuy(item) {
			if (item.is_sold_out) {
				showToast('商品已售罄')
				return
			}
			const productData = {
				id: item.id,
				name: item.name,
				price: item.price,
				image: item.image_url || '/static/logo.png',
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
.hot-products-page {
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
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	background-color: #FFFFFF;
}

.nav-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}

.nav-right {
	width: 32px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
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

.search-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.search-icon {
	width: 22px;
	height: 22px;
}

/* 搜索栏 */
.search-bar {
	background-color: #FFFFFF;
	padding: 0 16px 10px;
}

.search-input-wrapper {
	display: flex;
	align-items: center;
	background-color: #F5F5F5;
	border-radius: 20px;
	padding: 0 12px;
	height: 36px;
}

.search-input-icon {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
}

.search-input {
	flex: 1;
	font-size: 14px;
	margin-left: 8px;
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
}

.clear-text {
	font-size: 12px;
	color: #FFFFFF;
}

/* 分类筛选 */
.category-scroll {
	background-color: #FFFFFF;
	padding: 0 16px 10px;
	white-space: nowrap;
}

.category-list {
	display: inline-flex;
	gap: 6px;
}

.category-tab {
	padding: 6px 16px;
	background-color: #F5F5F5;
	border-radius: 16px;
}

.category-tab-text {
	font-size: 13px;
	color: #666666;
}

.category-tab-active {
	background-color: #F2B131;
}

.category-tab-active .category-tab-text {
	color: #FFFFFF;
	font-weight: 600;
}

/* 内容区域 */
.content-scroll {
	flex: 1;
	background-color: #FFFFFF;
	border-radius: 10px 10px 0 0;
}

.products-container {
	padding: 10px 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

/* 产品卡片 */
.product-card {
	display: flex;
	background-color: #FFFFFF;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	position: relative;
}

.rank-badge {
	position: absolute;
	top: 0;
	left: 0;
	width: 24px;
	height: 24px;
	background-color: #DA3300;
	border-radius: 0 0 8px 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
}

.rank-text {
	font-size: 12px;
	font-weight: 700;
	color: #FFFFFF;
}

.product-image {
	width: 100px;
	height: 100px;
	border-radius: 8px;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 6px 10px;
}

.product-content {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.product-name {
	font-size: 14px;
	font-weight: 700;
	color: #000000CC;
}

.product-sales {
	display: flex;
}

.sales-text {
	font-size: 12px;
	font-weight: 500;
	color: #949494;
}

.product-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: linear-gradient(90deg, rgba(255, 212, 212, 0.1) 0%, rgba(255, 0, 0, 0.1) 100%);
	border-radius: 4px;
	padding: 4px 8px;
}

.price-section {
	display: flex;
	align-items: baseline;
	gap: 6px;
}

.price-text {
	font-size: 14px;
	font-weight: normal;
	color: #DA3300;
}

.original-price {
	font-size: 11px;
	color: #949494;
	text-decoration: line-through;
}

.buy-btn {
	background-color: #DA3300;
	border-radius: 4px;
	padding: 4px 10px;
}

.buy-text {
	font-size: 14px;
	font-weight: 700;
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
	justify-content: center;
}

.empty-text {
	font-size: 14px;
	color: #949494;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}
</style>
