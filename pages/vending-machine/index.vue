<template>
	<view class="vending-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('vending.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<scroll-view class="page-content" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 金币余额 -->
			<view class="coin-card">
				<view class="coin-card-bg"></view>
				<view class="coin-info">
					<image class="coin-icon" src="/static/icons/coin.svg" mode="aspectFit"></image>
					<view class="coin-text-area">
						<text class="coin-label">{{ t('vending.myCoins') }}</text>
						<text class="coin-value">{{ coinBalance }}</text>
					</view>
				</view>
			</view>

			<!-- 售卖机地图 -->
			<view class="map-section">
				<view class="section-header">
					<text class="section-title">{{ t('vending.nearby') }}</text>
				</view>
				<map
					class="vending-map"
					:latitude="latitude"
					:longitude="longitude"
					:markers="markers"
					:show-location="true"
					@markertap="handleMarkerTap"
				></map>
			</view>

			<!-- 可兑换商品 -->
			<view class="products-section">
				<view class="section-header">
					<text class="section-title">{{ t('vending.exchangeProducts') }}</text>
				</view>
				<view class="products-grid">
					<view class="product-card" v-for="item in products" :key="item.id" @click="handleExchange(item)">
						<image class="product-img" :src="item.image_url || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
						<view class="product-info">
							<text class="product-name">{{ item.name }}</text>
							<view class="product-footer">
								<view class="coin-price">
									<image class="coin-sm" src="/static/icons/coin.svg" mode="aspectFit"></image>
									<text class="price-num">{{ item.coin_price }}</text>
								</view>
								<view class="exchange-btn">
									<text class="exchange-text">{{ t('vending.exchange') }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="empty-tip" v-if="!loading && products.length === 0">
					<text class="empty-text">{{ t('vending.noProducts') }}</text>
				</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<!-- 兑换确认弹窗 -->
		<view class="modal-mask" v-if="showModal" @click="showModal = false">
			<view class="modal-content" @click.stop>
				<text class="modal-title">{{ t('vending.confirmExchange') }}</text>
				<view class="modal-product" v-if="selectedProduct">
					<text class="modal-name">{{ selectedProduct.name }}</text>
					<view class="modal-price">
						<image class="coin-sm" src="/static/icons/coin.svg" mode="aspectFit"></image>
						<text class="modal-price-num">{{ selectedProduct.coin_price }} {{ t('vending.coins') }}</text>
					</view>
				</view>
				<view class="modal-btns">
					<view class="modal-cancel" @click="showModal = false">
						<text class="modal-cancel-text">{{ t('common.cancel') }}</text>
					</view>
					<view class="modal-confirm" @click="confirmExchange">
						<text class="modal-confirm-text">{{ t('vending.confirm') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import i18n from '@/i18n/index.js'
	import { showToast } from '@/utils/index.js'
	import { getCoinBalance } from '@/api/services/order.js'
	import { getBalanceBenefits, exchangeBenefit } from '@/api/services/member.js'

	export default {
		data() {
			return {
			langVersion: 0,
				statusBarHeight: 0,
				contentHeight: 0,
				coinBalance: 0,
				latitude: 13.7563,
				longitude: 100.5018,
				markers: [],
				products: [],
				loading: false,
				showModal: false,
				selectedProduct: null
			}
		},
		computed: {
			i18n() { return i18n }
		},
		onLoad() {
			const sysInfo = uni.getSystemInfoSync()
			this.statusBarHeight = sysInfo.statusBarHeight || 0
			this.contentHeight = sysInfo.windowHeight - this.statusBarHeight - 44
		},
		onShow() {
			this.loadData()
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
			goBack() {
				uni.navigateBack()
			},
			async loadData() {
				this.loading = true
				try {
					const [coinRes, productRes] = await Promise.allSettled([
						getCoinBalance(),
						getBalanceBenefits({ page: 1, page_size: 50 })
					])
					if (coinRes.status === 'fulfilled' && coinRes.value.code === 0 && coinRes.value.data) {
						this.coinBalance = coinRes.value.data.coin_balance || 0
					}
					if (productRes.status === 'fulfilled' && productRes.value.code === 0 && productRes.value.data) {
						this.products = (productRes.value.data.items || []).map(p => ({
							...p,
							name: p['name_' + i18n.getLanguage()] || p.name || p.name_en,
							coin_price: p.coin_price || p.point_price || 0
						}))
					}
				} catch (e) {
					console.error('loadData error', e)
				} finally {
					this.loading = false
				}
			},
			handleMarkerTap(e) {
				const marker = this.markers.find(m => m.id === e.markerId)
				if (marker) {
					uni.openLocation({
						latitude: marker.latitude,
						longitude: marker.longitude,
						name: marker.title || '',
						address: marker.address || ''
					})
				}
			},
			handleExchange(item) {
				if (item.coin_price > this.coinBalance) {
					showToast(i18n.t('vending.insufficientCoins'))
					return
				}
				this.selectedProduct = item
				this.showModal = true
			},
			async confirmExchange() {
				if (!this.selectedProduct) return
				try {
					const res = await exchangeBenefit({
						product_id: this.selectedProduct.id,
						exchange_type: 'COIN',
						coin_amount: this.selectedProduct.coin_price,
						quantity: 1
					})
					if (res.code === 0) {
						showToast(i18n.t('vending.exchangeSuccess'))
						this.coinBalance -= this.selectedProduct.coin_price
						this.showModal = false
						this.selectedProduct = null
					} else {
						showToast(res.message || i18n.t('common.networkError'))
					}
				} catch (e) {
					console.error('confirmExchange error', e)
					showToast(i18n.t('common.networkError'))
				}
			}
		}
	}
</script>

<style scoped>
.vending-page {
	width: 100vw;
	min-height: 100vh;
	background-color: #F7F7F7;
}

.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 44px;
	padding: 0 16px;
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
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
	font-size: 17px;
	font-weight: 600;
	color: #fff;
}

.nav-right {
	width: 32px;
}

/* 金币余额卡片 */
.coin-card {
	margin: 16px;
	border-radius: 12px;
	padding: 20px;
	background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%);
	box-shadow: 0 4px 16px rgba(242, 177, 49, 0.12);
	position: relative;
	overflow: hidden;
}

.coin-card::before {
	content: '';
	position: absolute;
	top: -30px;
	right: -30px;
	width: 100px;
	height: 100px;
	background: radial-gradient(circle, rgba(242, 177, 49, 0.2) 0%, transparent 70%);
	border-radius: 50%;
}

.coin-info {
	display: flex;
	align-items: center;
	gap: 14px;
}

.coin-icon {
	width: 36px;
	height: 36px;
}

.coin-text-area {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.coin-label {
	font-size: 12px;
	color: rgba(93, 64, 55, 0.5);
}

.coin-value {
	font-size: 28px;
	font-weight: 700;
	color: #5D4037;
}

/* 地图 */
.map-section {
	margin: 0 16px 16px;
}

.section-header {
	margin-bottom: 10px;
}

.section-title {
	font-size: 16px;
	font-weight: 600;
	color: #333;
}

.vending-map {
	width: 100%;
	height: 200px;
	border-radius: 12px;
	overflow: hidden;
}

/* 商品列表 */
.products-section {
	margin: 0 16px;
}

.products-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}

.product-card {
	width: calc(50% - 6px);
	background-color: #fff;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.product-img {
	width: 100%;
	height: 120px;
}

.product-info {
	padding: 10px;
}

.product-name {
	font-size: 13px;
	color: #333;
	font-weight: 500;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.product-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 8px;
}

.coin-price {
	display: flex;
	align-items: center;
	gap: 4px;
}

.coin-sm {
	width: 14px;
	height: 14px;
}

.price-num {
	font-size: 14px;
	font-weight: 700;
	color: #F2B131;
}

.exchange-btn {
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	border-radius: 12px;
	padding: 4px 12px;
}

.exchange-text {
	font-size: 11px;
	font-weight: 600;
	color: #fff;
}

.empty-tip {
	padding: 40px 0;
	text-align: center;
}

.empty-text {
	font-size: 13px;
	color: #bbb;
}

.bottom-space {
	height: 30px;
}

/* 弹窗 */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-content {
	width: 300px;
	background-color: #fff;
	border-radius: 16px;
	padding: 24px;
}

.modal-title {
	font-size: 16px;
	font-weight: 600;
	color: #333;
	text-align: center;
	display: block;
	margin-bottom: 16px;
}

.modal-product {
	background-color: #FFF8E1;
	border-radius: 10px;
	padding: 14px;
	margin-bottom: 20px;
}

.modal-name {
	font-size: 14px;
	color: #5D4037;
	font-weight: 500;
	display: block;
	margin-bottom: 6px;
}

.modal-price {
	display: flex;
	align-items: center;
	gap: 4px;
}

.modal-price-num {
	font-size: 16px;
	font-weight: 700;
	color: #F2B131;
}

.modal-btns {
	display: flex;
	gap: 12px;
}

.modal-cancel {
	flex: 1;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	border: 1px solid #ddd;
}

.modal-cancel-text {
	font-size: 14px;
	color: #999;
}

.modal-confirm {
	flex: 1;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
}

.modal-confirm-text {
	font-size: 14px;
	font-weight: 600;
	color: #fff;
}
</style>
