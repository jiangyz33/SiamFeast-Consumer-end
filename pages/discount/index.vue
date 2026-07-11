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
					:placeholder="i18n.t('discount.searchPlaceholder') || '搜索优惠菜品'"
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
						<image class="tab-icon" :src="tab.icon || '/static/images/store-placeholder.svg'" mode="aspectFit"></image>
						<text class="tab-text">{{ tab["name_" + lang] || tab.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 商品列表 -->
		<scroll-view
			class="product-list"
			scroll-y
			:style="{ height: contentHeight + 'px' }"
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<view class="list-container">
				<view
					v-for="item in products"
					:key="item.menu_item_id"
					class="product-card"
					@click="handleProductClick(item)"
				>
					<!-- 商品图片 -->
					<view class="product-image-wrapper">
						<image class="product-image" :src="fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
						<!-- 折扣角标 -->
						<view class="discount-badge" v-if="item.discount_rate && item.discount_rate < 1">
							<text class="badge-text">{{ formatDiscount(item.discount_rate) }}</text>
						</view>
					</view>

					<!-- 商品信息 -->
					<view class="product-info">
						<view class="product-header">
							<text class="store-name">{{ item["store_name_" + lang] || item.store_name }}</text>
							<text class="product-name">{{ item["menu_item_name_" + lang] || item.menu_item_name }}</text>
							<text class="category-tag" v-if='item["category_name_" + lang] || item.category_name'>{{ item["category_name_" + lang] || item.category_name }}</text>
						</view>

						<view class="product-footer">
							<view class="price-info">
								<text class="price-symbol">฿</text>
								<text class="price-num">{{ item.discount_price }}</text>
								<text class="original-price" v-if="item.original_price && item.original_price > item.discount_price">฿{{ item.original_price }}</text>
							</view>
							<view class="discount-amount" v-if="item.discount_amount">
								<text class="amount-text">-฿{{ item.discount_amount }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-tip">
				<text v-if="loading" class="tip-text">{{ t("common.loading") }}</text>
				<text v-else-if="noMore && products.length > 0" class="tip-text">{{ t("order.noMore") }}</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && products.length === 0">
				<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ t("discount.noProducts") }}</text>
				<text class="empty-desc">{{ t("discount.noProductsDesc") }}</text>
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
import { showToast, fixMinioUrl } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import { getDiscountMenuItems } from '@/api/services/products.js'
import { getConsumerCategories } from '@/api/services/menu.js'

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			i18n: i18n,
			langVersion: 0,
			statusBarHeight: 20,
			contentHeight: 500,
			activeTab: 0,
			tabs: [{ name: '全部', name_en: 'All', name_th: 'ทั้งหมด', id: null, icon: '/static/images/store-placeholder.svg' }],
			products: [],
			loading: false,
			refreshing: false,
			noMore: false,
			page: 1,
			pageSize: 20,
			totalPages: 0,
			searchKeyword: '',
			isSearchMode: false
		}
	},
	computed: {
		lang() {
			this.langVersion
			return i18n.getLanguage()
		}
	},
	onLoad() {
		uni.$on('languageChanged', this.onLanguageChanged)
		this.initPage()
		this.loadCategories()
		this.loadProducts()
	},
	onUnload() {
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
			const headerHeight = 180
			const tabBarHeight = 63
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - headerHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadCategories() {
			try {
				const res = await getConsumerCategories()
				if (res.code === 0 && res.data) {
					const catRaw = res.data
					const catItems = Array.isArray(catRaw) ? catRaw : (catRaw.items || [])
					const cats = catItems.map(c => {
						const rawIcon = c.icon || c.icon_url || ''
						const icon = rawIcon ? fixMinioUrl(rawIcon) : '/static/images/store-placeholder.svg'
						return {
							id: c.id,
							name: c.name,
							name_en: c.name_en || '',
							name_th: c.name_th || '',
							icon: icon
						}
					})
					// Deduplicate
					const seen = new Map()
					for (const cat of cats) {
						const key = (cat.name_en || cat.name || '').toLowerCase()
						if (!seen.has(key)) seen.set(key, cat)
					}
					this.tabs = [
						{ name: '全部', name_en: 'All', name_th: 'ทั้งหมด', id: null, icon: '/static/images/store-placeholder.svg' },
						...seen.values()
					]
				}
			} catch (e) {
				console.error('加载分类失败:', e)
			}
		},

		async loadProducts(reset = true) {
			if (this.loading) return
			this.loading = true

			if (reset) {
				this.page = 1
				this.products = []
				this.noMore = false
			}

			try {
				const params = {
					page: this.page,
					page_size: this.pageSize
				}

				// 分类筛选
				const selectedTab = this.tabs[this.activeTab]
				if (selectedTab && selectedTab.id) {
					params.category_id = selectedTab.id
				}

				// 搜索关键词
				if (this.isSearchMode && this.searchKeyword.trim()) {
					params.keyword = this.searchKeyword.trim()
				}

				// 排序
				if (this.currentSort) {
					params.sort = this.currentSort
				}

				const res = await getDiscountMenuItems(params)

				if (res.code === 0 && res.data) {
					const data = res.data
					const items = data.items || []

					if (reset) {
						this.products = items
					} else {
						this.products = this.products.concat(items)
					}

					this.totalPages = data.total_pages || 0
					this.noMore = this.page >= this.totalPages || items.length < this.pageSize
				} else {
					if (reset) this.products = []
					this.noMore = true
				}
			} catch (e) {
				console.error('加载优惠商品失败:', e)
				if (reset) this.products = []
				this.noMore = true
			} finally {
				this.loading = false
				this.refreshing = false
			}
		},

		onRefresh() {
			this.refreshing = true
			this.loadProducts(true)
		},

		loadMore() {
			if (this.loading || this.noMore) return
			this.page++
			this.loadProducts(false)
		},

		handleSearch() {
			if (!this.searchKeyword.trim()) {
				this.isSearchMode = false
				this.loadProducts(true)
				return
			}
			this.isSearchMode = true
			this.loadProducts(true)
		},

		clearSearch() {
			this.searchKeyword = ''
			this.isSearchMode = false
			this.loadProducts(true)
		},

		switchTab(index) {
			if (this.activeTab === index) return
			this.activeTab = index
			this.isSearchMode = false
			this.loadProducts(true)
		},

		formatDiscount(rate) {
			if (!rate || rate >= 1) return ''
			// 0.6655 -> "6.7折"
			const val = Math.round(rate * 100) / 10
			return val + i18n.t('discount.off')
		},

		goBack() {
			uni.navigateBack()
		},

		handleProductClick(item) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${item.menu_item_id}&shopId=${item.store_id || ''}`
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
	position: relative;
}

.product-image {
	width: 100%;
	height: 100%;
}

.discount-badge {
	position: absolute;
	top: 4px;
	left: 4px;
	background: linear-gradient(135deg, #FF4D4F, #FF2C6F);
	border-radius: 4px;
	padding: 2px 6px;
}

.badge-text {
	font-size: 10px;
	color: #FFFFFF;
	font-weight: 600;
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

.store-name {
	font-size: 11px;
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

.category-tag {
	font-size: 10px;
	color: #DA3300;
	background-color: rgba(218, 51, 0, 0.08);
	padding: 1px 6px;
	border-radius: 3px;
	align-self: flex-start;
}

.product-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: auto;
	padding: 4px 6px;
	background: linear-gradient(90deg, rgba(255, 212, 212, 0.1) 0%, rgba(255, 0, 0, 0.1) 100%);
	border-radius: 4px;
}

.price-info {
	display: flex;
	align-items: baseline;
	gap: 2px;
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

.discount-amount {
	background-color: #DA3300;
	border-radius: 3px;
	padding: 2px 6px;
}

.amount-text {
	font-size: 10px;
	color: #FFFFFF;
	font-weight: 500;
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
	height: 20px;
}
</style>
