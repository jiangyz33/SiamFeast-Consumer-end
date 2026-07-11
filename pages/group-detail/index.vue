<template>
	<view class="detail-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('groupBuy.title') }}</text>

		</view>

		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<view v-if="loading" class="loading-state">
				<text class="loading-text">{{ t('common.loading') }}</text>
			</view>

			<view v-else-if="product" class="content-wrapper">
				<!-- 商品图片 -->
				<image class="hero-image" :src="fixMinioUrl(product.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>

				<!-- 价格区域 -->
				<view class="price-section">
					<view class="price-row">
						<text class="group-price-label">{{ t('groupBuy.groupPrice') }}</text>
						<text class="group-price-symbol">฿</text>
						<text class="group-price-num">{{ product.group_price }}</text>
						<view class="original-price-box" v-if="product.original_price && Number(product.original_price) > Number(product.price)">
							<text class="original-price-text">฿{{ product.original_price }}</text>
						</view>
						<view class="discount-tag" v-if="product.discount_rate">
							<text class="discount-text">{{ formatDiscountOff(product.discount_rate) }}</text>
						</view>
					</view>
				</view>

				<!-- 商品信息 -->
				<view class="info-card">
					<text class="product-name">{{ product.name }}</text>
					<text class="product-desc" v-if="product.description">{{ product.description }}</text>
				</view>

				<!-- 库存进度 -->
				<view class="info-card">
					<view class="quota-row">
						<text class="quota-label">{{ t('groupBuy.remainCount') }}{{ remainCount }}份</text>
					</view>
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
					</view>
					<view class="quota-row" v-if="product.max_per_user">
						<text class="quota-label">{{ t('groupBuy.limitPerUser') }}{{ product.max_per_user }}份</text>
					</view>
				</view>

				<!-- 数量选择 -->
				<view class="info-card quantity-card">
					<text class="quantity-label">{{ t('groupBuy.quantityLabel') }}</text>
					<view class="quantity-control">
						<view class="qty-btn" @click="changeQuantity(-1)">
							<text class="qty-btn-text">-</text>
						</view>
						<text class="qty-num">{{ quantity }}</text>
						<view class="qty-btn" @click="changeQuantity(1)">
							<text class="qty-btn-text">+</text>
						</view>
					</view>
				</view>

				<!-- 合计 -->
				<view class="info-card total-card">
					<text class="total-label">{{ t('groupBuy.totalLabel') }}</text>
					<text class="total-value">฿{{ totalPrice }}</text>
				</view>
			</view>

			<view v-else class="empty-state">
				<text class="empty-text">{{ t('groupBuy.noProducts') }}</text>
			</view>

			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部按钮 -->
		<view class="bottom-bar" v-if="product && !loading">
			<view class="total-section">
				<text class="bar-total-label">{{ t('groupBuy.totalLabel') }}</text>
				<text class="bar-total-price">฿{{ totalPrice }}</text>
			</view>
			<view
				class="buy-btn"
				:class="{ 'buy-btn-disabled': !canBuy }"
				@click="handleBuy"
			>
				<text class="buy-text">{{ buyButtonText }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import { getGroupBuyProductDetail } from '@/api/services/groupbuy.js'
import { showToast, getErrorMessage, fixMinioUrl } from '@/utils/index.js'
import appStore from '@/store/index.js'

export default {
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			loading: true,
			product: null,
			quantity: 1,
			submitting: false
		}
	},
	computed: {
		remainCount() {
			if (!this.product) return 0
			return Math.max(0, this.product.total_quota - this.product.sold_count)
		},
		progressPercent() {
			if (!this.product || !this.product.total_quota) return 0
			return Math.min(100, Math.round(this.product.sold_count / this.product.total_quota * 100))
		},
		maxQuantity() {
			if (!this.product) return 1
			return Math.min(this.product.max_per_user || 99, this.remainCount)
		},
		totalPrice() {
			if (!this.product) return '0.00'
			return (this.product.group_price * this.quantity).toFixed(2)
		},
		canBuy() {
			if (!this.product) return false
			return this.product.is_active && this.remainCount > 0 && !this.submitting
		},
		buyButtonText() {
			if (!this.product) return ''
			if (!this.product.is_active) return this.i18n.t('groupBuy.ended')
			if (this.remainCount <= 0) return this.i18n.t('groupBuy.soldOut')
			if (this.submitting) return '...'
			return this.i18n.t('groupBuy.buyNow')
		}
	},
	onLoad(options) {
		this.initPage()
		if (options && options.id) {
			this.loadProduct(options.id)
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
		formatDiscount(rate) {
			if (!rate) return ''
			return (rate * 10).toFixed(rate % 0.1 === 0 ? 0 : 1)
		},
		formatDiscountOff(rate) {
			if (!rate) return ''
			return Math.round((1 - rate) * 100) + '% OFF'
		},
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const bottomBarHeight = 64
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - bottomBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadProduct(id) {
			this.loading = true
			try {
				const res = await getGroupBuyProductDetail(id)
				if (res && res.code === 0 && res.data) {
					this.product = this.normalizeProduct(res.data)
				}
			} catch (e) {
				console.error('loadProduct error:', e)
			} finally {
				this.loading = false
			}
		},

		normalizeProduct(p) {
			return {
				id: p.id,
				name: p.name || p.name_en || '',
				description: p.description || '',
				image_url: fixMinioUrl(p.image_url || p.image || ''),
				group_price: p.group_price || 0,
				original_price: p.original_price || 0,
				discount_rate: p.discount_rate || 0,
				total_quota: p.total_quota || 0,
				sold_count: p.sold_count || 0,
				max_per_user: p.max_per_user || 1,
				is_active: p.is_active !== false,
				start_time: p.start_time || '',
				end_time: p.end_time || ''
			}
		},

		changeQuantity(delta) {
			const newVal = this.quantity + delta
			if (newVal >= 1 && newVal <= this.maxQuantity) {
				this.quantity = newVal
			}
		},

		async handleBuy() {
			if (!this.canBuy || this.submitting) return
			this.submitting = true
			try {
				const product = this.product
				const orderItem = {
					id: product.id,
					name: product.name,
					price: product.group_price,
					image: product.image_url,
					quantity: this.quantity,
					store_id: appStore.getCurrentStore()?.id || '',
					is_group_buy: true
				}
				const params = [
					'orderType=groupbuy',
					'shopId=' + (appStore.getCurrentStore()?.id || ''),
					'shopName=' + encodeURIComponent(appStore.getCurrentStore()?.name || ''),
					'products=' + encodeURIComponent(JSON.stringify([orderItem]))
				].join('&')
				uni.navigateTo({ url: '/pages/checkout/index?' + params })
			} catch (e) {
				showToast(getErrorMessage(e))
			} finally {
				this.submitting = false
			}
		},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.detail-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #FFFFFF;
}

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
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.content-scroll {
	flex: 1;
}

.loading-state {
	display: flex;
	justify-content: center;
	padding: 40px 0;
}

.loading-text {
	font-size: 14px;
	color: #949494;
}

.hero-image {
	width: 100%;
	height: 280px;
}

.price-section {
	background: linear-gradient(135deg, #DA3300 0%, #FF6B6B 100%);
	padding: 16px;
}

.price-row {
	display: flex;
	align-items: baseline;
	gap: 4px;
	flex-wrap: wrap;
}

.group-price-label {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.8);
	margin-right: 4px;
}

.group-price-symbol {
	font-size: 16px;
	font-weight: 600;
	color: #FFFFFF;
}

.group-price-num {
	font-size: 32px;
	font-weight: 800;
	color: #FFFFFF;
	line-height: 1;
}

.original-price-box {
	margin-left: 8px;
}

.original-price-text {
	font-size: 14px;
	color: rgba(255, 255, 255, 0.6);
	text-decoration: line-through;
}

.discount-tag {
	background-color: #FFD23D;
	border-radius: 4px;
	padding: 2px 8px;
	margin-left: 8px;
}

.discount-text {
	font-size: 11px;
	font-weight: 600;
	color: #DA3300;
}

.info-card {
	background-color: #FFFFFF;
	padding: 14px 16px;
	margin-bottom: 8px;
}

.product-name {
	font-size: 16px;
	font-weight: 700;
	color: #3C3C3C;
	display: block;
}

.product-desc {
	font-size: 13px;
	color: #949494;
	margin-top: 6px;
	display: block;
}

.quota-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.quota-label {
	font-size: 13px;
	color: #00000099;
}

.quota-value {
	font-size: 13px;
	font-weight: 600;
	color: #DA3300;
}

.progress-bar {
	height: 6px;
	background-color: #F3F3F3;
	border-radius: 3px;
	overflow: hidden;
	margin-bottom: 8px;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #DA3300, #FF6B6B);
	border-radius: 3px;
}

.quantity-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.quantity-label {
	font-size: 14px;
	color: #3C3C3C;
}

.quantity-control {
	display: flex;
	align-items: center;
	gap: 16px;
}

.qty-btn {
	width: 28px;
	height: 28px;
	border-radius: 14px;
	background-color: #F3F3F3;
	display: flex;
	align-items: center;
	justify-content: center;
}

.qty-btn-text {
	font-size: 16px;
	color: #3C3C3C;
}

.qty-num {
	font-size: 16px;
	font-weight: 600;
	color: #3C3C3C;
	min-width: 20px;
	text-align: center;
}

.total-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.total-label {
	font-size: 14px;
	color: #00000099;
}

.total-value {
	font-size: 18px;
	font-weight: 700;
	color: #DA3300;
}

.empty-state {
	display: flex;
	justify-content: center;
	padding: 60px 0;
}

.empty-text {
	font-size: 15px;
	color: #999;
}

.bottom-placeholder {
	height: 80px;
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 64px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.total-section {
	display: flex;
	align-items: baseline;
	gap: 4px;
}

.bar-total-label {
	font-size: 13px;
	color: #00000099;
}

.bar-total-price {
	font-size: 20px;
	font-weight: 700;
	color: #DA3300;
}

.buy-btn {
	background: linear-gradient(135deg, #DA3300 0%, #FF6B6B 100%);
	border-radius: 22px;
	padding: 12px 32px;
}

.buy-btn-disabled {
	opacity: 0.5;
}

.buy-text {
	font-size: 16px;
	font-weight: 500;
	color: #FFFFFF;
}
</style>
