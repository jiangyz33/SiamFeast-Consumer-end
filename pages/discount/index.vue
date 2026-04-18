<template>
	<view class="discount-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部渐变背景区域 -->
		<view class="header-bg">
			<!-- 返回按钮 -->
			<view class="nav-row">
				<view class="back-btn" @click="goBack">
					<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
				</view>
			</view>
			<!-- 搜索栏 -->
			<view class="search-bar">
				<image class="search-icon" src="/static/icons/search.svg" mode="aspectFit"></image>
				<input
					class="search-input"
					v-model="searchKeyword"
					placeholder="输入关键词搜索"
					confirm-type="search"
					@confirm="handleSearch"
				/>
				<view class="search-clear" v-if="searchKeyword" @click="clearSearch">
					<text class="clear-text">x</text>
				</view>
			</view>

			<!-- 分类标签 -->
			<scroll-view class="category-tabs" scroll-x>
				<view class="tabs-container">
					<view
						v-for="(tab, index) in tabs"
						:key="index"
						class="tab-item"
						:class="{ 'tab-active': activeTab === index }"
						@click="switchTab(index)"
					>
						<image class="tab-icon" :src="tab.icon || '/static/logo.png'" mode="aspectFit"></image>
						<text class="tab-text">{{ tab.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 商品列表 -->
		<scroll-view class="product-list" scroll-y :style="{ height: contentHeight + 'px' }" @scrolltolower="loadMore">
			<view class="list-container">
				<view
					v-for="item in products"
					:key="item.id"
					class="product-card"
					@click="handleProductClick(item)"
				>
					<!-- 商品图片 -->
					<view class="product-image-wrapper">
						<image class="product-image" :src="item.image_url || '/static/logo.png'" mode="aspectFill"></image>
					</view>

					<!-- 商品信息 -->
					<view class="product-info">
						<view class="product-header">
							<text class="shop-name">{{ item.shopName || currentStoreName }}</text>
							<text class="product-name">{{ item.name }}</text>
						</view>

						<view class="product-footer">
							<view class="price-info">
								<text class="price-label">优惠价</text>
								<text class="price-symbol">฿</text>
								<text class="price-num">{{ item.price }}</text>
								<text class="original-price" v-if="item.original_price">฿{{ item.original_price }}</text>
							</view>
							<view class="sales-info">
								<text class="sales-text">已售{{ item.sales_count || 0 }}+份</text>
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
			<view class="empty-state" v-if="!loading && products.length === 0">
				<text class="empty-text">暂无优惠商品</text>
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
import { getActiveCampaigns } from '@/api/services/campaign.js'
import { searchProducts } from '@/api/services/products.js'
import { getConsumerCategories } from '@/api/services/menu.js'

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			statusBarHeight: 20,
			contentHeight: 500,
			activeTab: 0,
			tabs: [{ name: '全部', id: null, icon: '/static/logo.png' }],
			products: [],
			loading: false,
			noMore: false,
			shopId: null,
			currentStoreName: '',
			searchKeyword: '',
			isSearchMode: false
		}
	},
	onLoad() {
		this.initPage()
		const currentStore = appStore.getCurrentStore()
		if (currentStore) {
			this.shopId = currentStore.id
			this.currentStoreName = currentStore.name || ''
		}
		this.loadCategories()
		this.loadProducts()
	},
	methods: {
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const headerHeight = 180
			const tabBarHeight = 63
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - headerHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadCategories() {
			try {
				const storeId = this.shopId || 1
				const res = await getConsumerCategories(storeId)
				if (res.code === 0 && res.data) {
					const cats = (res.data || []).map(c => ({
						id: c.id,
						name: c.name,
						icon: c.icon || '/static/logo.png'
					}))
					this.tabs = [{ name: '全部', id: null, icon: '/static/logo.png' }, ...cats]
				}
			} catch (e) {
				console.error('加载分类失败:', e)
			}
		},

		async loadProducts() {
			if (this.loading) return
			this.loading = true
			try {
				if (this.isSearchMode && this.searchKeyword.trim()) {
					// 搜索模式
					const params = { keyword: this.searchKeyword.trim(), limit: 20 }
					if (this.shopId) params.store_id = this.shopId
					const res = await searchProducts(params)
					const items = res.data?.items || []
					this.products = items
					this.noMore = true
				} else {
					// 从优惠活动获取商品
					const params = { type: 'discount' }
					const campaignRes = await getActiveCampaigns(params)
					let discountProducts = []
					if (campaignRes.code === 0 && campaignRes.data) {
						const campaigns = campaignRes.data
						campaigns.forEach(c => {
							if (c.products && c.products.length > 0) {
								discountProducts = discountProducts.concat(c.products)
							}
						})
					}

					// 按分类筛选
					const selectedTab = this.tabs[this.activeTab]
					if (selectedTab && selectedTab.id) {
						discountProducts = discountProducts.filter(p => p.category_id === selectedTab.id)
					}

					this.products = discountProducts
					this.noMore = true
				}
			} catch (e) {
				console.error('加载优惠商品失败:', e)
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

		switchTab(index) {
			if (this.activeTab === index) return
			this.activeTab = index
			this.isSearchMode = false
			this.loadProducts()
		},

		loadMore() {
			// 优惠商品暂不翻页
		},

		goBack() {
			uni.navigateBack()
		},

		handleProductClick(item) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${item.id}&shopId=${this.shopId || ''}`
			})
		}
	}
}
</script>

<style scoped>
.discount-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background: linear-gradient(135deg, #DA0000 0%, #FF2C6F 100%);
}

/* 顶部渐变背景区域 */
.header-bg {
	background: linear-gradient(135deg, #DA0000 0%, #FF2C6F 100%);
	padding: 0 16px 16px;
}

/* 返回按钮行 */
.nav-row {
	display: flex;
	align-items: center;
	height: 44px;
}

.back-btn {
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

/* 搜索栏 */
.search-bar {
	display: flex;
	align-items: center;
	background-color: #FFFFFF;
	border-radius: 22px;
	padding: 0 16px;
	height: 36px;
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

/* 分类标签 */
.category-tabs {
	margin-top: 16px;
	white-space: nowrap;
}

.tabs-container {
	display: inline-flex;
	gap: 8px;
}

.tab-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: #FFFFFF;
	border-radius: 8px;
	padding: 12px 26px 8px;
	gap: 4px;
}

.tab-item.tab-active {
	background-color: #FFFFFF;
}

.tab-icon {
	width: 30px;
	height: 30px;
	border-radius: 4px;
}

.tab-text {
	font-size: 12px;
	color: #00000099;
}

.tab-active .tab-text {
	color: #DA3300;
	font-weight: 500;
}

/* 商品列表 */
.product-list {
	flex: 1;
}

.list-container {
	padding: 10px 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.product-card {
	display: flex;
	background-color: #FFFFFF;
	border-radius: 8px;
	overflow: hidden;
}

.product-image-wrapper {
	width: 100px;
	height: 100px;
	flex-shrink: 0;
}

.product-image {
	width: 100%;
	height: 100%;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 6px 10px;
	gap: 2px;
}

.product-header {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.shop-name {
	font-size: 12px;
	color: #00000099;
}

.product-name {
	font-size: 14px;
	font-weight: 700;
	color: #000000CC;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.product-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: auto;
	padding: 4px;
	background: linear-gradient(90deg, rgba(255, 212, 212, 0.1) 0%, rgba(255, 0, 0, 0.1) 100%);
	border-radius: 4px;
}

.price-info {
	display: flex;
	align-items: baseline;
	gap: 2px;
}

.price-label {
	font-size: 12px;
	color: #DA3300;
}

.price-symbol {
	font-size: 12px;
	font-weight: 600;
	color: #DA3300;
}

.price-num {
	font-size: 16px;
	font-weight: 700;
	color: #DA3300;
}

.original-price {
	font-size: 12px;
	color: #949494;
	text-decoration: line-through;
	margin-left: 4px;
}

.sales-info {
	border-left: 1px solid #E0E0E0;
	padding-left: 10px;
}

.sales-text {
	font-size: 12px;
	color: #00000099;
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
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 0;
}

.empty-text {
	font-size: 14px;
	color: #00000099;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}
</style>
