<template>
	<view class="group-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="header-bg">
			<view class="nav-row">
				<view class="back-btn" @click="goBack">
					<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
				</view>
			</view>
			<view class="header-info">
				<text class="header-title">{{ i18n.t('groupBuy.title') }}</text>
			</view>
		</view>

		<scroll-view class="product-list" scroll-y :style="{ height: contentHeight + 'px' }">
			<view class="list-container">
				<view
					v-for="item in products"
					:key="item.id"
					class="product-card"
					@click="goDetail(item)"
				>
					<view class="product-image-wrapper">
						<image class="product-image" :src="item.image_url || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
					</view>

					<view class="product-info">
						<view class="product-header">
							<text class="product-name">{{ item.name }}</text>
						</view>

						<view class="product-meta">
							<view class="progress-bar">
								<view class="progress-fill" :style="{ width: progressPercent(item) + '%' }"></view>
							</view>
							<text class="meta-text">{{ i18n.t('groupBuy.progressSold', { sold: item.sold_count, total: item.total_quota }) }}</text>
						</view>

						<view class="product-footer">
							<view class="price-info">
								<view class="group-tag">
									<text class="group-tag-text">{{ i18n.t('groupBuy.discountRate', { rate: item.discount_rate }) }}</text>
								</view>
								<text class="price-symbol">฿</text>
								<text class="price-num">{{ item.group_price }}</text>
								<text class="original-price" v-if="item.original_price">฿{{ item.original_price }}</text>
							</view>
							<view class="join-btn" @click.stop="goDetail(item)">
								<text class="join-text">{{ i18n.t('groupBuy.joinGroup') }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="loading-tip" v-if="loading">
				<text class="tip-text">{{ i18n.t('common.loading') }}</text>
			</view>

			<view class="empty-state" v-if="!loading && products.length === 0">
				<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ i18n.t('groupBuy.noProducts') }}</text>
			</view>

			<view class="bottom-placeholder"></view>
		</scroll-view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import appStore from '@/store/index.js'
import { getGroupBuyProducts } from '@/api/services/groupbuy.js'
import { fixMinioUrl } from '@/utils/index.js'

export default {
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			products: [],
			loading: false,
			shopId: null,
			page: 1,
			pageSize: 20
		}
	},
	onLoad(options) {
		this.initPage()
		if (options && options.shopId) {
			this.shopId = parseInt(options.shopId)
		} else {
			const currentStore = appStore.getCurrentStore()
			if (currentStore) this.shopId = currentStore.id
		}
		this.loadProducts()
	},
	methods: {
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const headerHeight = 120
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - headerHeight - safeAreaBottom - this.statusBarHeight
		},

		progressPercent(item) {
			if (!item.total_quota) return 0
			return Math.min(100, Math.round(item.sold_count / item.total_quota * 100))
		},

		async loadProducts() {
			if (this.loading) return
			this.loading = true
			try {
				const params = { page: this.page, page_size: this.pageSize }
				if (this.shopId) params.store_id = this.shopId
				const res = await getGroupBuyProducts(params)
				if (res && res.code === 0 && res.data) {
					const items = res.data.items || res.data || []
					this.products = (Array.isArray(items) ? items : []).map(p => ({
						id: p.id,
						name: p.name || p.name_en || '',
						image_url: fixMinioUrl(p.image_url || p.image || ''),
						group_price: p.group_price || 0,
						original_price: p.original_price || 0,
						discount_rate: p.discount_rate || 0,
						total_quota: p.total_quota || 0,
						sold_count: p.sold_count || 0,
						max_per_user: p.max_per_user || 1,
						share_code: p.share_code || '',
						is_active: p.is_active !== false,
						start_time: p.start_time || '',
						end_time: p.end_time || ''
					}))
				} else {
					this.products = []
				}
			} catch (e) {
				console.error('loadProducts error:', e)
				this.products = []
			} finally {
				this.loading = false
			}
		},

		goDetail(item) {
			uni.navigateTo({
				url: '/pages/group-detail/index?id=' + item.id
			})
		},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.group-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background: linear-gradient(135deg, #DA0000 0%, #FF2C6F 100%);
}

.header-bg {
	background: linear-gradient(135deg, #DA0000 0%, #FF2C6F 100%);
	padding: 0 16px 16px;
}

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

.header-info {
	margin-top: 8px;
}

.header-title {
	font-size: 20px;
	font-weight: 700;
	color: #FFFFFF;
}

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
	gap: 4px;
}

.product-header {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.product-name {
	font-size: 14px;
	font-weight: 700;
	color: #000000CC;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.product-meta {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.progress-bar {
	height: 4px;
	background-color: #F3F3F3;
	border-radius: 2px;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #DA3300, #FF6B6B);
	border-radius: 2px;
}

.meta-text {
	font-size: 10px;
	color: #949494;
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
	align-items: center;
	gap: 4px;
}

.group-tag {
	background-color: #F2B131;
	border-radius: 4px;
	padding: 2px 6px;
}

.group-tag-text {
	font-size: 10px;
	font-weight: 500;
	color: #FFFFFF;
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
	font-size: 11px;
	color: #949494;
	text-decoration: line-through;
	margin-left: 4px;
}

.join-btn {
	background-color: #DA3300;
	border-radius: 4px;
	padding: 4px 10px;
}

.join-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
}

.loading-tip {
	padding: 16px 0;
	display: flex;
	justify-content: center;
}

.tip-text {
	font-size: 12px;
	color: #949494;
}

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
}

.bottom-placeholder {
	height: 20px;
}
</style>
