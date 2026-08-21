<template>
	<view class="new-products-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('newProducts.title') || '新品上市' }}</text>
			<view class="nav-right">
				<view class="sort-btn" @click="toggleSortMode">
					<text class="sort-btn-text">{{ sortMode === 'distance' ? t('newProducts.sortByDefault') : t('newProducts.sortByDistance') }}</text>
				</view>
			</view>
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
					<!-- 左侧：正方形商品图 -->
					<image class="product-image" :src="fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>

					<!-- 右侧：商品信息（垂直分布：上=商品名+门店，下=价格+按钮） -->
					<view class="product-info">
						<!-- 上半部分：商品名 + 门店（logo 在左，店名在右） -->
						<view class="product-top">
							<text class="product-name">{{ item['name_' + i18n.getLanguage()] || item.name }}</text>
							<view class="shop-row" v-if="item.storeName">
								<image class="shop-logo" :src="item.storeLogo || '/static/images/banner-placeholder.svg'" mode="aspectFill"></image>
								<text class="shop-name">{{ item.storeName }}</text>
								<text class="shop-distance" v-if="item.storeDistanceText">· {{ item.storeDistanceText }}</text>
							</view>
						</view>
						<!-- 下半部分：价格 + 月销 + 按钮 -->
						<view class="product-bottom">
							<view class="price-row">
								<text class="product-price">฿{{ item.price }}</text>
								<text class="original-price" v-if="item.original_price && Number(item.original_price) > Number(item.price)">฿{{ item.original_price }}</text>
								<text class="sales-text" v-if="item.sales_count > 0">· {{ t('mine.monthlySales') }}{{ item.sales_count }}</text>
							</view>
							<view class="buy-btn" @click.stop="handleBuyNow(item)">
								<text class="buy-btn-text">{{ t('hotProducts.grab') }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-tip">
				<text v-if="loading" class="tip-text">{{ t('common.loading') }}</text>
				<text v-else-if="noMore && products.length > 0" class="tip-text">{{ t('order.noMore') }}</text>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && products.length === 0" class="empty-state">
				<image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ t('common.empty.product') }}</text>
				<text class="empty-desc">{{ t('common.empty.productDesc') }}</text>
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
import { getMenuItemOptions } from '@/api/services/menu.js'
import { showToast, fixMinioUrl } from '@/utils/index.js'
import { getUserLocation, calculateDistance, formatDistance } from '@/utils/location.js'
import i18n from '@/i18n/index.js'

export default {
	components: { CustomTabbar },
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			loading: false,
			noMore: false,
			products: [],
			storeMap: {},
			// 用户当前位置（拉到才用，拉不到保持 null 不阻塞）
			userLocation: null,
			// 排序模式：'default' 默认（按时间倒序）/ 'distance' 按距离升序
			sortMode: 'default',
			page: 1,
			pageSize: 20
		}
	},
	onLoad() {
		this.initPage()
		this.loadStores()
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
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadStores() {
			// 并发：拉门店列表 + 拉用户位置（位置失败不阻塞）
			const storesPromise = getStores({}, { silent: true }).catch(e => {
				console.error('loadStores error:', e)
				return null
			})
			const locationPromise = getUserLocation().then(loc => {
				this.userLocation = loc
			}).catch(e => {
				// 用户拒绝定位 / 设备无定位 → 静默降级（用户仍能看商品，只是不按距离排序）
				console.warn('[new-products] getUserLocation failed, fallback to default order:', e && e.code)
			})
			const [res] = await Promise.all([storesPromise, locationPromise])

			let stores = []
			if (res && res.code === 0 && res.data) {
				const data = res.data
				stores = Array.isArray(data) ? data : (data.items || [])
			}
			const map = {}
			for (const s of stores) {
				// 距离：仅当用户位置 + 门店坐标都齐全时才计算
				let distance = null
				if (this.userLocation && s.latitude && s.longitude) {
					distance = calculateDistance(
						this.userLocation.latitude, this.userLocation.longitude,
						Number(s.latitude), Number(s.longitude)
					)
				}
				map[s.id] = {
					name: s.name || '',
					name_en: s.name_en || '',
					name_th: s.name_th || '',
					logo: fixMinioUrl(s.logo_url || s.logo || ''),
					distance  // 单位：米；null = 无法计算（默认排序）
				}
			}
			this.storeMap = map
			this.loadProducts()
		},

		/**
		 * 排序切换：default ↔ distance
		 */
		toggleSortMode() {
			// 切到距离排序前必须先有用户位置，否则提示
			if (this.sortMode !== 'distance' && !this.userLocation) {
				showToast(i18n.t('storeSelect.title') || '无法获取位置')
				return
			}
			this.sortMode = this.sortMode === 'distance' ? 'default' : 'distance'
			// 触发已加载商品重排（无需重新请求）
			this.applySort()
		},

		/**
		 * 对当前 products 列表按 sortMode 排序
		 * - default：恢复原始顺序（后端返回的时间倒序）
		 * - distance：按所属门店距离升序；同门店内保持原顺序；无距离的排最后
		 */
		applySort() {
			if (this.sortMode !== 'distance') {
				// 恢复原始顺序（loadProducts 时保存的快照）
				if (this._originalProductsSnapshot) {
					this.products = this._originalProductsSnapshot.slice()
				}
				return
			}
			// 先存快照（仅首次进入 distance 模式时存，避免反复切换丢失原顺序）
			if (!this._originalProductsSnapshot) {
				this._originalProductsSnapshot = this.products.slice()
			}
			this.products = this.products.slice().sort((a, b) => {
				const da = this.storeMap[a.store_id]?.distance
				const db = this.storeMap[b.store_id]?.distance
				if (da == null && db == null) return 0
				if (da == null) return 1
				if (db == null) return -1
				return da - db
			})
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
						storeLogo: fixMinioUrl(store.logo_url || store.logo) || '/static/images/store-placeholder.svg',
						// 门店距离（米）+ 格式化文案，用于 UI 显示和排序
						storeDistance: store.distance,
						storeDistanceText: store.distance != null ? formatDistance(store.distance) : ''
					}
				})
				if (append) {
					this.products = [...this.products, ...mapped]
				} else {
					this.products = mapped
					// 重置 / 重建原始顺序快照（首页加载或刷新时）
					this._originalProductsSnapshot = null
				}
				this.noMore = items.length < this.pageSize
				if (!this.noMore) this.page++
				// 加载完成后应用当前排序模式（loadMore 拿到下一页后也保持）
				this.applySort()
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

		async handleBuyNow(item) {
			// 先检查商品是否有规格，有规格则跳详情页让用户选，避免规格丢失
			const hasSpecs = await this._checkHasSpecs(item)
			if (hasSpecs) {
				uni.navigateTo({
					url: `/pages/product-detail/index?productId=${item.id}&shopId=${item.store_id || ''}`
				})
				return
			}
			const productData = {
				id: item.id,
				name: item['name_' + i18n.getLanguage()] || item.name,
				price: item.price,
				image: fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg',
				quantity: 1,
				store_id: item.store_id
			}
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=dinein&shopId=${item.store_id}&products=${encodeURIComponent(JSON.stringify([productData]))}`
			})
		},

		async _checkHasSpecs(item) {
			if (!item || !item.id || !item.store_id) return false
			try {
				const res = await getMenuItemOptions(item.id, item.store_id)
				if (res && res.code === 0 && res.data) {
					const d = res.data
					return (d.flavors && d.flavors.length > 0)
						|| (d.specs && d.specs.length > 0)
						|| (d.toppings && d.toppings.length > 0)
				}
			} catch (e) {
				console.warn('[new-products] check specs failed:', e)
			}
			return false
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
	min-width: 32px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

/* 排序按钮 */
.sort-btn {
	padding: 6px 10px;
	background-color: rgba(242, 177, 49, 0.12);
	border-radius: 14px;
}

.sort-btn-text {
	font-size: 11px;
	color: #F2B131;
	font-weight: 600;
	white-space: nowrap;
}

.shop-distance {
	font-size: 12px;
	color: #F2B131;
	font-weight: 500;
	margin-left: 2px;
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
	display: flex;
	background-color: #FFFFFF;
	border-radius: 12px;
	overflow: hidden;
	padding: 12px;
	gap: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 左侧：正方形商品图 */
.product-image {
	width: 100px;
	height: 100px;
	border-radius: 10px;
	background-color: #F5F5F5;
	flex-shrink: 0;
}

/* 右侧：商品信息 */
.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
	padding: 2px 0;
}

/* 上半部分：商品名（最多 2 行）+ 门店（logo 在左，店名在右） */
.product-top {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.product-name {
	font-size: 14px;
	font-weight: 600;
	color: #000000CC;
	line-height: 1.3;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.shop-row {
	display: flex;
	align-items: center;
	gap: 6px;
}

.shop-logo {
	width: 20px;
	height: 20px;
	border-radius: 10px;
	background-color: #F5F5F5;
}

.shop-name {
	font-size: 13px;
	color: rgba(0, 0, 0, 0.6);
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
	min-width: 0;
}

/* 下半部分：价格 + 月销 + 抢按钮 */
.product-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.price-row {
	display: flex;
	align-items: baseline;
	gap: 6px;
	overflow: hidden;
}

.product-price {
	font-size: 15px;
	font-weight: 700;
	color: #DA3300;
}

.original-price {
	font-size: 11px;
	color: #949494;
	text-decoration: line-through;
}

.sales-text {
	font-size: 11px;
	color: #949494;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.buy-btn {
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	padding: 5px 14px;
	border-radius: 14px;
	flex-shrink: 0;
	box-shadow: 0 2px 6px rgba(242, 177, 49, 0.25);
}

.buy-btn-text {
	font-size: 12px;
	font-weight: 600;
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
