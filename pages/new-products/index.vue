<template>
	<view class="new-products-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">新品上市</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }" @scrolltolower="loadMore">
			<!-- 新品列表 -->
			<view class="products-list">
				<view
					v-for="item in newProducts"
					:key="item.id"
					class="product-card"
					@click="handleProductClick(item)"
				>
					<image class="product-image" :src="item.image_url || '/static/logo.png'" mode="aspectFill"></image>
					<view class="product-info">
						<text class="product-name">{{ item.name }}</text>
						<text class="product-desc" v-if="item.description">{{ item.description }}</text>
						<view class="product-footer">
							<text class="product-price">฿{{ item.price }}</text>
							<view class="buy-btn" @click.stop="handleBuyNow(item)">
								<text class="buy-btn-text">立即购买</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-tip">
				<text v-if="loading" class="tip-text">加载中...</text>
				<text v-else-if="noMore && newProducts.length > 0" class="tip-text">没有更多了</text>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && newProducts.length === 0" class="empty-state">
				<text class="empty-text">暂无新品</text>
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
import { getNewProducts } from '@/api/services/products.js'
import { showToast } from '@/utils/index.js'

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			statusBarHeight: 20,
			contentHeight: 500,
			newProducts: [],
			loading: false,
			noMore: false,
			shopId: null
		}
	},
	onLoad() {
		this.initPage()
		const currentStore = appStore.getCurrentStore()
		if (currentStore) {
			this.shopId = currentStore.id
		}
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

		async loadProducts() {
			if (this.loading) return
			this.loading = true
			try {
				const params = { limit: 20 }
				if (this.shopId) params.store_id = this.shopId
				const res = await getNewProducts(params)
				const items = res.data?.items || []
				this.newProducts = items
				this.noMore = items.length < 20
			} catch (e) {
				console.error('加载新品失败:', e)
			} finally {
				this.loading = false
			}
		},

		loadMore() {
			// 新品一般不多，暂不翻页
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
			const productData = {
				id: item.id,
				name: item.name,
				price: item.price,
				image: item.image_url || '/static/logo.png',
				quantity: 1,
				store_id: this.shopId
			}
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=dinein&shopId=${appStore.getCurrentStore()?.id || ''}&products=${encodeURIComponent(JSON.stringify([productData]))}`
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
	width: 24px;
	height: 24px;
}

.nav-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}

.nav-right {
	width: 32px;
}

/* 内容区域 */
.content-scroll {
	flex: 1;
}

/* 产品列表 */
.products-list {
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
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-image {
	width: 100px;
	height: 100px;
	border-radius: 8px;
	flex-shrink: 0;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 8px 10px;
}

.product-name {
	font-size: 14px;
	font-weight: 700;
	color: #000000CC;
}

.product-desc {
	font-size: 12px;
	color: #949494;
	margin-top: 4px;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.product-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 6px;
}

.product-price {
	font-size: 16px;
	font-weight: 700;
	color: #F2B131;
}

.buy-btn {
	background-color: #F2B131;
	padding: 4px 12px;
	border-radius: 12px;
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
