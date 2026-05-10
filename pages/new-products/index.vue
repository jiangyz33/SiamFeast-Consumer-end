<template>
	<view class="new-products-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ i18n.t('newProducts.title') || '新品上市' }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="products-scroll" scroll-y :style="{ height: contentHeight + 'px' }" @scrolltolower="loadMore">
			<!-- 商品列表 -->
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
								<image class="shop-logo" :src="item.storeLogo || '/static/images/banner-placeholder.svg'" mode="aspectFill"></image>
							</view>
							<text class="shop-name">{{ item.storeName }}</text>
						</view>
					</view>
					<view class="product-info-overlay">
						<text class="product-name">{{ item['name_' + i18n.getLanguage()] || item.name }}</text>
						<view class="product-price-row">
							<text class="product-price">฿{{ item.price }}</text>
							<text class="original-price" v-if="item.original_price">฿{{ item.original_price }}</text>
							<text class="sales-text">{{ i18n.t('mine.monthlySales') }}{{ item.sales_count || 0 }}</text>
							<view class="buy-btn" @click.stop="handleBuyNow(item)">
								<text class="buy-btn-text">{{ i18n.t('newProducts.buyNow') || '购买' }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-tip">
				<text v-if="loading" class="tip-text">{{ i18n.t('common.loading') }}</text>
				<text v-else-if="noMore && products.length > 0" class="tip-text">{{ i18n.t('order.noMore') }}</text>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && products.length === 0" class="empty-state">
				<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ i18n.t('common.empty.product') }}</text>
				<text class="empty-desc">{{ i18n.t('common.empty.productDesc') }}</text>
			</view>

			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="0"></custom-tabbar>
	</view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar.vue'
import appStore from '@/store/index.js'
import { getNewProducts } from '@/api/services/products.js'
import { getStores } from '@/api/services/store.js'
import { showToast, fixMinioUrl } from '@/utils/index.js'
import i18n from '@/i18n/index.js'

export default {
	components: { CustomTabbar },
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			loading: false,
			noMore: false,
			products: [],
			storeMap: {},
			page: 1,
			pageSize: 20
		}
	},
	onLoad() {
		this.initPage()
		this.loadStores()
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

		async loadStores() {
			try {
				const res = await getStores({}, { silent: true })
				let stores = []
				if (res.code === 0 && res.data) {
					const data = res.data
					stores = Array.isArray(data) ? data : (data.items || [])
				}
				const map = {}
				for (const s of stores) {
					map[s.id] = {
						name: s.name || '',
						name_en: s.name_en || '',
						name_th: s.name_th || '',
						logo: fixMinioUrl(s.logo_url || s.logo || '')
					}
				}
				this.storeMap = map
			} catch (e) {
				console.error('loadStores error:', e)
			}
			this.loadProducts()
		},

		async loadProducts(append = false) {
			if (this.loading) return
			this.loading = true
			try {
				const res = await getNewProducts({ limit: this.pageSize, page: this.page })
				const items = res.data?.items || []
				const mapped = items.map(p => {
					const store = this.storeMap[p.store_id] || {}
					return {
						id: p.id,
						name: p.name || '',
						name_en: p.name_en || '',
						name_th: p.name_th || '',
						price: p.price,
						original_price: p.original_price || '',
						sales_count: p.sales_count || 0,
						image_url: fixMinioUrl(p.image_url || ''),
						store_id: p.store_id,
						storeName: store['name_' + i18n.getLanguage()] || store.name || '',
						storeLogo: store.logo || '/static/images/banner-placeholder.svg'
					}
				})
				if (append) {
					this.products = [...this.products, ...mapped]
				} else {
					this.products = mapped
				}
				this.noMore = items.length < this.pageSize
				if (!this.noMore) this.page++
			} catch (e) {
				console.error('loadProducts error:', e)
			} finally {
				this.loading = false
			}
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
				url: `/pages/product-detail/index?productId=${item.id}&shopId=${item.store_id || ''}`
			})
		},

		handleBuyNow(item) {
			const productData = {
				id: item.id,
				name: item['name_' + i18n.getLanguage()] || item.name,
				price: item.price,
				image: item.image_url || '/static/images/img-placeholder.svg',
				quantity: 1,
				store_id: item.store_id
			}
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=dinein&shopId=${item.store_id}&products=${encodeURIComponent(JSON.stringify([productData]))}`
			})
		}
	}
}
</script>

<style scoped>
.new-products-page {
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

.empty-icon {
	width: 80px;
	height: 80px;
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

.bottom-placeholder {
	height: 20px;
}
</style>
