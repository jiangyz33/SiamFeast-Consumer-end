<template>
	<view class="product-detail-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ i18n.t('productDetail.specs') }}</text>
			<view class="nav-right">
				<view class="fav-btn" @click="handleToggleFavorite">
					<image
						class="fav-icon"
						:src="isFavorited ? '/static/icons/favorited.svg' : '/static/icons/favorite.svg'"
						mode="aspectFit"
					></image>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-wrapper" v-if="loading">
			<text class="loading-text">{{ i18n.t('common.loading') }}</text>
		</view>

		<!-- 内容区域 -->
		<scroll-view v-else class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 商品图片 -->
			<view class="product-image-section">
				<image class="product-image" :src="fixMinioUrl(product.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
			</view>

			<!-- 商品信息卡片 -->
			<view class="product-info-card">
				<view class="price-row">
					<view class="price-main">
						<text class="price-symbol">฿</text>
						<text class="price-num">{{ product.price }}</text>
					</view>
					<text class="price-original" v-if="product.original_price">฿{{ product.original_price }}</text>
				</view>
				<text class="product-name">{{ product['name_' + i18n.getLanguage()] || product.name || product.name_en }}</text>
				<text class="product-desc" v-if="product.description">{{ product['description_' + i18n.getLanguage()] || product.description }}</text>

				<!-- 标签 -->
				<view class="product-tags" v-if="product.tags && product.tags.length > 0">
					<text class="tag" v-for="(tag, idx) in product.tags" :key="idx">{{ tag }}</text>
				</view>

				<!-- 销量统计 -->
				<view class="stats-row" v-if="product.sales_count || product.repeat_customers">
					<view class="stat-item" v-if="product.sales_count">
						<text class="stat-num">{{ product.sales_count }}</text>
						<text class="stat-label">{{ i18n.t('mine.monthlySales') }}</text>
					</view>
					<view class="stat-divider" v-if="product.sales_count && product.repeat_customers"></view>
					<view class="stat-item" v-if="product.repeat_customers">
						<text class="stat-num">{{ product.repeat_customers }}</text>
						<text class="stat-label">回头客</text>
					</view>
					<view class="stat-divider" v-if="product.weekly_sales"></view>
					<view class="stat-item" v-if="product.weekly_sales">
						<text class="stat-num">{{ product.weekly_sales }}</text>
						<text class="stat-label">周售</text>
					</view>
				</view>

				<!-- 领券减价 -->
				<view class="coupon-tag" v-if="maxCoupon">
					<text class="coupon-tag-text">领券减฿{{ maxCoupon.amount }}</text>
				</view>
			</view>

			<!-- 商品详情 -->
			<view class="detail-card">
				<text class="card-title">商品详情</text>
				<view class="detail-content">
					<image
						v-if="product.detail_image"
						class="detail-image"
						:src="product.detail_image"
						mode="widthFix"
					></image>
					<text class="detail-text" v-if="product.description">{{ product['description_' + i18n.getLanguage()] || product.description }}</text>
					<text class="detail-text" v-else>{{ product['name_' + i18n.getLanguage()] || product.name || product.name_en }}</text>
				</view>
			</view>

			<!-- 购买须知 -->
			<view class="notice-card">
				<text class="card-title">购买须知</text>
				<view class="notice-list">
					<view class="notice-item">
						<text class="notice-dot">·</text>
						<text class="notice-text">商品以实物为准，图片仅供参考</text>
					</view>
					<view class="notice-item">
						<text class="notice-dot">·</text>
						<text class="notice-text">如有过敏食材请提前告知店员</text>
					</view>
				</view>
			</view>

			<!-- 更多推荐 -->
			<view class="recommend-card" v-if="recommendations.length > 0">
				<text class="card-title">{{ i18n.t('productDetail.recommend') }}</text>
				<view class="recommend-list">
					<view
						v-for="item in recommendations"
						:key="item.id"
						class="recommend-item"
						@click="handleRecommendClick(item)"
					>
						<image class="recommend-image" :src="fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
						<text class="recommend-name">{{ item['name_' + i18n.getLanguage()] || item.name || item.name_en }}</text>
						<view class="recommend-price">
							<text class="recommend-price-symbol">฿</text>
							<text class="recommend-price-num">{{ item.price }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部购买栏 -->
		<view class="buy-bar" v-if="!loading">
			<view class="buy-bar-left">
				<view class="bar-action" @click="handleShareProduct">
					<image class="bar-action-icon" src="/static/icons/share.svg" mode="aspectFit"></image>
					<text class="bar-action-text">分享</text>
				</view>
			</view>
			<view class="buy-bar-right">
				<view class="buy-btn buy-btn-cart" @click="handleAddToCart">
					<text class="buy-btn-text">{{ i18n.t('productDetail.addToCart') }}</text>
				</view>
				<view class="buy-btn buy-btn-now" @click="handleBuyNow">
					<text class="buy-btn-text">{{ i18n.t('productDetail.buyNow') }}</text>
				</view>
			</view>
		</view>

		<!-- 分享弹窗 -->
		<share-modal
			:visible="showShareModal"
			:shareInfo="shareInfo"
			@close="handleShareModalClose"
			@confirm="handleShareConfirm"
		></share-modal>
	</view>
</template>

<script>
import { showToast, fixMinioUrl } from '@/utils/index.js'
import { shareProduct, ShareType } from '@/utils/share.js'
import ShareModal from '@/components/share-modal.vue'
import i18n from '@/i18n/index.js'
import appStore from '@/store/index.js'
import { getMenuItem } from '@/api/services/menu.js'
import footprintManager from '@/utils/footprint.js'
import { getAvailableCoupons } from '@/api/services/coupon.js'
import { getHotProducts } from '@/api/services/products.js'
import { checkFavorite, addFavorite, removeFavorite } from '@/api/services/favorite.js'

export default {
	components: {
		ShareModal
	},
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			loading: false,
			productId: null,
			shopId: null,
			product: {},
			maxCoupon: null,
			recommendations: [],
			isFavorited: false,
			showShareModal: false,
			shareInfo: {
				type: 'product',
				id: '',
				name: '',
				image: ''
			}
		}
	},
	onLoad(options) {
		this.initPage()
		if (options.productId) {
			this.productId = parseInt(options.productId)
		}
		if (options.shopId) {
			this.shopId = parseInt(options.shopId)
		} else {
			const currentStore = appStore.getCurrentStore()
			if (currentStore) {
				this.shopId = currentStore.id
			}
		}
		if (this.productId) {
			this.loadProductDetail()
		}
	},
	methods: {
		fixMinioUrl,
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const buyBarHeight = 56
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - buyBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadProductDetail() {
			if (this.loading) return
			this.loading = true

			try {
				const [detailRes, couponRes, favRes] = await Promise.allSettled([
					getMenuItem(this.productId),
					getAvailableCoupons({ order_amount: 0, ...(this.shopId ? { store_id: this.shopId } : {}) }),
					checkFavorite({ target_id: this.productId, type: 'product' })
				])

				// 商品详情
				if (detailRes.status === 'fulfilled' && detailRes.value.code === 0 && detailRes.value.data) {
					this.product = detailRes.value.data

				// 记录商品浏览足迹
				if (this.product && this.product.id) {
					footprintManager.addProductFootprint({
						id: this.product.id,
						name: this.product.name,
						image: fixMinioUrl(this.product.image_url),
						price: this.product.price,
						tags: this.product.tags,
						shopId: this.shopId,
						shopName: this.shopInfo?.name || ''
					})
				}
				}

				// 可用优惠券 - 找最大面额
				if (couponRes.status === 'fulfilled' && couponRes.value.code === 0 && couponRes.value.data) {
					const items = couponRes.value.data.items || []
					const applicable = items.map(c => {
						const tpl = c.template || {}
						return { ...c, amount: tpl.discount_value || c.amount || 0, min_spend: tpl.min_order_amount || c.min_spend || 0 }
					}).filter(c => !c.min_spend || c.min_spend <= (this.product.price || 0))
					if (applicable.length > 0) {
						applicable.sort((a, b) => b.amount - a.amount)
						this.maxCoupon = applicable[0]
					}
				}

				// 收藏状态
				if (favRes.status === 'fulfilled' && favRes.value.code === 0 && favRes.value.data) {
					this.isFavorited = favRes.value.data.is_favorited || false
				}

				// 加载推荐
				this.loadRecommendations()
			} catch (e) {
				console.error('loadProductDetail error:', e)
			} finally {
				this.loading = false
			}
		},

		async loadRecommendations() {
			try {
				const res = await getHotProducts({ limit: 5, ...(this.shopId ? { store_id: this.shopId } : {}) })
				if (res.code === 0 && res.data) {
					const items = res.data.items || []
					this.recommendations = items.filter(p => p.id !== this.productId).slice(0, 4)
				}
			} catch (e) {
				console.error('loadRecommendations error:', e)
			}
		},

		goBack() {
			uni.navigateBack()
		},

		async handleToggleFavorite() {
			try {
				if (this.isFavorited) {
					const res = await removeFavorite({ target_id: this.productId, type: 'product' })
					if (res.code === 0) {
						this.isFavorited = false
						showToast('已取消收藏')
					}
				} else {
					const res = await addFavorite({
						target_id: this.productId,
						type: 'product',
						name: this.product.name || '',
						image_url: fixMinioUrl(this.product.image_url) || '',
						price: this.product.price || 0
					})
					if (res.code === 0) {
						this.isFavorited = true
						showToast('收藏成功')
					}
				}
			} catch (e) {
				console.error('handleToggleFavorite error:', e)
			}
		},

			handleAddToCart() {
				if (this.product.is_sold_out) {
					showToast(this.i18n.t('dinein.soldOut'))
					return
				}
				appStore.addToCart(this.shopId, {
					id: this.product.id || this.productId,
					name: this.product.name || '',
					price: this.product.price || 0,
					image: fixMinioUrl(this.product.image_url) || '',
					quantity: 1,
					specs: {},
					store_id: this.shopId
				})
				showToast(this.i18n.t('dinein.addToCart'))
		},

		handleBuyNow() {
			if (this.product.is_sold_out) {
				showToast('商品已售罄')
				return
			}
			if (this.product.stock !== undefined && this.product.stock <= 0) {
				showToast('库存不足')
				return
			}
			const productData = {
				id: this.product.id || this.productId,
				name: this.product.name || '',
				price: this.product.price || 0,
				image: fixMinioUrl(this.product.image_url) || '',
				quantity: 1,
				store_id: this.shopId
			}
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=dinein&shopId=${this.shopId}&products=${encodeURIComponent(JSON.stringify([productData]))}`
			})
		},

		handleRecommendClick(item) {
			uni.redirectTo({
				url: `/pages/product-detail/index?productId=${item.id}&shopId=${this.shopId || ''}`
			})
		},

		async handleShareProduct() {
			try {
				const shopName = ''
				const result = await shareProduct(
					{
						id: this.productId,
						name: this.product.name || '',
						price: this.product.price || 0,
						image: fixMinioUrl(this.product.image_url) || ''
					},
					{
						id: this.shopId || 1,
						name: shopName
					}
				)

				if (result.success) {
					this.shareInfo = {
						type: 'product',
						id: this.productId,
						name: this.product.name || '',
						price: this.product.price || 0,
						image: fixMinioUrl(this.product.image_url) || '',
						shopId: this.shopId || 1,
						shopName: shopName
					}
					this.showShareModal = true
					showToast('链接已复制')
				} else {
					showToast('复制失败，请重试')
				}
			} catch (e) {
				console.error('分享失败:', e)
				showToast('分享失败，请重试')
			}
		},

		handleShareModalClose() {
			this.showShareModal = false
		},

		handleShareConfirm() {
			this.showShareModal = false
			showToast('欢迎光临！')
		}
	}
}
</script>

<style scoped>
.product-detail-page {
	min-height: 100vh;
	background-color: #F5F5F5;
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
	display: flex;
	align-items: center;
	justify-content: center;
}

.fav-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.fav-icon {
	width: 22px;
	height: 22px;
}

/* 加载状态 */
.loading-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-text {
	font-size: 14px;
	color: #949494;
}

/* 内容区域 */
.content-scroll {
	flex: 1;
	background-color: #F5F5F5;
}

/* 商品图片 */
.product-image-section {
	width: 100%;
	height: 280px;
	background-color: #FFFFFF;
}

.product-image {
	width: 100%;
	height: 100%;
}

/* 商品信息卡片 */
.product-info-card {
	background-color: #FFFFFF;
	padding: 16px;
	margin-bottom: 10px;
}

.price-row {
	display: flex;
	align-items: baseline;
	gap: 8px;
	margin-bottom: 8px;
}

.price-main {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 14px;
	font-weight: 600;
	color: #DA3300;
}

.price-num {
	font-size: 28px;
	font-weight: 700;
	color: #DA3300;
}

.price-original {
	font-size: 14px;
	color: #949494;
	text-decoration: line-through;
}

.product-name {
	font-size: 18px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.9);
	margin-bottom: 6px;
}

.product-desc {
	font-size: 13px;
	color: #949494;
	line-height: 18px;
	margin-bottom: 8px;
}

.product-tags {
	display: flex;
	gap: 6px;
	margin-bottom: 10px;
}

.tag {
	font-size: 11px;
	color: #F2B131;
	background-color: rgba(242, 177, 49, 0.15);
	padding: 2px 8px;
	border-radius: 4px;
}

/* 销量统计 */
.stats-row {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 0;
	border-top: 1px solid #F5F5F5;
	margin-top: 4px;
}

.stat-item {
	display: flex;
	align-items: baseline;
	gap: 4px;
}

.stat-num {
	font-size: 14px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.8);
}

.stat-label {
	font-size: 11px;
	color: #949494;
}

.stat-divider {
	width: 1px;
	height: 12px;
	background-color: #E5E5E5;
}

/* 领券减价 */
.coupon-tag {
	display: inline-flex;
	background-color: #FFF5F0;
	border: 1px solid #FFD5C0;
	border-radius: 4px;
	padding: 4px 10px;
	margin-top: 8px;
}

.coupon-tag-text {
	font-size: 12px;
	color: #DA3300;
	font-weight: 500;
}

/* 详情卡片 */
.detail-card,
.notice-card,
.recommend-card {
	background-color: #FFFFFF;
	padding: 16px;
	margin-bottom: 10px;
}

.card-title {
	font-size: 15px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.9);
	margin-bottom: 12px;
}

.detail-content {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.detail-image {
	width: 100%;
	border-radius: 8px;
}

.detail-text {
	font-size: 13px;
	color: #666666;
	line-height: 20px;
}

/* 购买须知 */
.notice-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.notice-item {
	display: flex;
	align-items: flex-start;
	gap: 6px;
}

.notice-dot {
	font-size: 14px;
	color: #949494;
}

.notice-text {
	font-size: 12px;
	color: #949494;
	line-height: 18px;
}

/* 更多推荐 */
.recommend-list {
	display: flex;
	gap: 10px;
	overflow-x: auto;
}

.recommend-item {
	width: 120px;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.recommend-image {
	width: 120px;
	height: 120px;
	border-radius: 8px;
}

.recommend-name {
	font-size: 13px;
	font-weight: 500;
	color: rgba(0, 0, 0, 0.8);
	lines: 1;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.recommend-price {
	display: flex;
	align-items: baseline;
}

.recommend-price-symbol {
	font-size: 11px;
	font-weight: 600;
	color: #DA3300;
}

.recommend-price-num {
	font-size: 15px;
	font-weight: 700;
	color: #DA3300;
}

/* 底部占位 */
.bottom-placeholder {
	height: 70px;
}

/* 底部购买栏 */
.buy-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 56px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	padding: 0 16px;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
	z-index: 100;
}

.buy-bar-left {
	display: flex;
	align-items: center;
	margin-right: 16px;
}

.bar-action {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
}

.bar-action-icon {
	width: 22px;
	height: 22px;
}

.bar-action-text {
	font-size: 10px;
	color: #949494;
}

.buy-bar-right {
	flex: 1;
	display: flex;
	gap: 10px;
}

.buy-btn {
	flex: 1;
	height: 40px;
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.buy-btn-cart {
	background-color: #F2B131;
}

.buy-btn-now {
	background-color: #DA3300;
}

.buy-btn-text {
	font-size: 14px;
	font-weight: 600;
	color: #FFFFFF;
}
</style>
