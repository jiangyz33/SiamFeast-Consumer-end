<template>
	<view class="products-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ categoryName || '商品列表' }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 搜索框 -->
		<view class="search-section">
			<view class="search-box">
				<image class="search-icon" src="/static/icons/search.svg" mode="aspectFit"></image>
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
					<text class="filter-tab-text">{{ item.name }}</text>
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
						<image class="product-image" :src="item.image_url || '/static/logo.png'" mode="aspectFill"></image>
						<view class="product-shop">
							<view class="shop-logo-wrapper">
								<image class="shop-logo" src="/static/logo.png" mode="aspectFill"></image>
							</view>
							<text class="shop-name">{{ item.shopName || currentStoreName }}</text>
						</view>
						<view class="buy-btn" @click.stop="handleBuyNow(item)">
							<text class="buy-btn-text">立即购买</text>
						</view>
					</view>
					<view class="product-info-overlay">
						<text class="product-name">{{ item.name }}</text>
						<view class="product-price-row">
							<text class="product-price">฿{{ item.price }}</text>
							<text class="original-price" v-if="item.original_price">฿{{ item.original_price }}</text>
							<text class="sales-text">已售{{ item.sales_count || 0 }}份</text>
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
				<text class="empty-text">暂无商品</text>
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
import { showToast } from '@/utils/index.js'
import { searchProducts, getHotProducts, getNewProducts } from '@/api/services/products.js'
import { getConsumerMenuItems } from '@/api/services/menu.js'
import { getActiveCampaigns } from '@/api/services/campaign.js'

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			statusBarHeight: 20,
			contentHeight: 500,
			activeFilter: 0,
			filterTabs: [
				{ name: '全部', type: 'all' },
				{ name: '热销', type: 'hot' },
				{ name: '新品', type: 'new' },
				{ name: '优惠', type: 'discount' }
			],
			products: [],
			loading: false,
			noMore: false,
			shopId: null,
			currentStoreName: '',
			searchKeyword: '',
			isSearchMode: false,
			categoryId: null,
			categoryName: '',
			page: 1
		}
	},
	onLoad(options) {
		this.initPage()
		const currentStore = appStore.getCurrentStore()
		if (currentStore) {
			this.shopId = currentStore.id
			this.currentStoreName = currentStore.name || ''
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
		if (options.categoryName) {
			this.categoryName = decodeURIComponent(options.categoryName)
		}
		this.loadProducts()
	},
	methods: {
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const searchBarHeight = 44
			const filterBarHeight = 40
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - searchBarHeight - filterBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadProducts(append = false) {
			if (this.loading) return
			this.loading = true
			try {
				const filterType = this.filterTabs[this.activeFilter].type
				let res

				if (this.isSearchMode && this.searchKeyword.trim()) {
					// 搜索模式
					const params = { keyword: this.searchKeyword.trim(), limit: 20 }
					if (this.shopId) params.store_id = this.shopId
					res = await searchProducts(params)
				} else if (filterType === 'hot') {
					const params = { limit: 20 }
					if (this.shopId) params.store_id = this.shopId
					res = await getHotProducts(params)
				} else if (filterType === 'new') {
					const params = { limit: 20 }
					if (this.shopId) params.store_id = this.shopId
					res = await getNewProducts(params)
				} else if (filterType === 'discount') {
					// 优惠商品来自活动接口
					const campaignRes = await getActiveCampaigns({ type: 'discount' })
					let discountProducts = []
					if (campaignRes.code === 0 && campaignRes.data) {
						const campaigns = campaignRes.data
						campaigns.forEach(c => {
							if (c.products && c.products.length > 0) {
								discountProducts = discountProducts.concat(c.products)
							}
						})
					}
					if (!append) {
						this.products = discountProducts
					} else {
						this.products = [...this.products, ...discountProducts]
					}
					this.noMore = true
					return
				} else {
					// 全部 - 从菜单获取
					const params = { limit: 20 }
					if (this.shopId) params.store_id = this.shopId
					if (this.categoryId) params.category_id = this.categoryId
					res = await getConsumerMenuItems(params.store_id || this.shopId, params)
				}

				if (res) {
					const items = res.data?.items || (Array.isArray(res.data) ? res.data : [])
					if (!append) {
						this.products = items
					} else {
						this.products = [...this.products, ...items]
					}
					this.noMore = items.length < 20
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
				this.loadProducts()
				return
			}
			this.isSearchMode = true
			this.loadProducts()
		},

		clearSearch() {
			this.searchKeyword = ''
			this.isSearchMode = false
			this.loadProducts()
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
	position: absolute;
	bottom: 8px;
	right: 8px;
	background-color: #F2B131;
	padding: 6px 12px;
	border-radius: 16px;
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
	color: #000000CC;
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
	height: 70px;
}
</style>
