<template>
	<view class="dinein-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ shopInfo["name_" + i18n.getLanguage()] || shopInfo.name }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 店铺头部图片 -->
			<view class="shop-header">
				<image class="shop-banner" :src="shopInfo.banner" mode="aspectFill"></image>
			</view>

			<!-- 店铺详细信息 -->
			<view class="shop-info-card">
				<view class="shop-info-left">
					<text class="shop-full-name" @click="onShopNameClick">{{ shopInfo["name_" + i18n.getLanguage()] || shopInfo.fullName }}</text>
					<view class="shop-rating">
						<text class="rating-text" v-if="shopInfo.phone">{{ shopInfo.phone }}</text>
					</view>
					<text class="shop-time" v-if="shopInfo.businessHours">{{ t('dinein.businessHours') }}：{{ shopInfo.businessHours }}</text>
						<text class="store-status-badge" :class="shopInfo.status === 'OPEN' ? 'badge-open' : 'badge-closed'">{{ shopInfo.status === 'OPEN' ? i18n.t('storeSelect.open') : i18n.t('storeSelect.closed') }}</text>
					<view class="shop-distance" v-if="shopInfo.distance">
						<text class="distance-item">{{ t('dinein.distance') }} {{ shopInfo.distance }}</text>
						<text class="distance-divider">|</text>
						<text class="distance-item">{{ t('dinein.bikeTime') }} {{ shopInfo.bikeTime }}</text>
						<text class="distance-divider">|</text>
						<text class="distance-item">{{ t('dinein.walkTime') }} {{ shopInfo.walkTime }}</text>
					</view>
					<view class="shop-address" @click="openShopMap">
						<image class="address-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
						<text class="address-text">{{ shopInfo['formatted_address_' + i18n.getLanguage()] || shopInfo['address_' + i18n.getLanguage()] || shopInfo.formatted_address || shopInfo.address }}</text>
					</view>
				</view>
				<view class="shop-info-right">
					<image class="share-icon" src="/static/icons/share.svg" mode="aspectFit" @click="handleShareShop"></image>
				</view>
			</view>

			<!-- 新店开业横幅 -->
			<view class="opening-banner" v-if="openingInfo.is_opening_active || testOpeningMode">
				<view class="opening-banner-header">
					<text class="opening-emoji">🎉</text>
					<text class="opening-title">{{ t('opening.active') }}</text>
					<text class="opening-days" v-if="openingInfo.days_left > 0">{{ t('opening.daysLeft', { n: openingInfo.days_left }) }}</text>
				</view>
				<view class="opening-benefits">
					<view class="benefit-item" v-if="openingInfo.extra_points > 0">
						<text class="benefit-icon">⭐</text>
						<text class="benefit-text">{{ t('opening.extraPoints', { n: openingInfo.extra_points }) }}</text>
					</view>
					<view class="benefit-item" v-if="openingInfo.extra_coins > 0">
						<text class="benefit-icon">💰</text>
						<text class="benefit-text">{{ t('opening.extraCoins', { n: openingInfo.extra_coins }) }}</text>
					</view>
					<view class="benefit-item" v-if="openingInfo.discount_percent > 0">
						<text class="benefit-icon">🏷️</text>
						<text class="benefit-text">{{ t('opening.discount', { n: openingInfo.discount_percent }) }}</text>
					</view>
				</view>
				<view class="opening-coupon-section" v-if="openingInfo.has_coupon">
					<view class="opening-claim-btn" :class="{ 'btn-disabled': openingClaiming || openingClaimed }" @click="handleClaimOpeningCoupon">
						<text class="opening-claim-text">
							{{ openingClaiming ? t('common.loading') : (openingClaimed ? t('opening.claimed') : t('opening.claimCoupon')) }}
						</text>
					</view>
				</view>
			</view>

			<!-- 门店位置地图(隐藏,点击地址跳转 Google Maps)-->
			<view class="shop-map" v-if="false && shopInfo.latitude && shopInfo.longitude">
				<iframe class="map-iframe" :src="mapEmbedUrl" frameborder="0" allowfullscreen></iframe>
			</view>

				<!-- category tabs -->
				<view class="category-tabs">
					<view
						v-for="(item, index) in categories"
						:key="index"
						class="category-tab"
						:class="{ 'category-tab-active': activeCategory === index }"
						@click="selectCategory(index)"
					>
						<text class="category-tab-text">{{ item['name_' + i18n.getLanguage()] || item.nameKey }}</text>
					</view>
				</view>

				<!-- product list (non-room tab) -->
				<view class="product-section">
					<view
						v-for="(item, index) in currentProducts"
					:key="index"
					class="product-item"
					@click="handleProductClick(item)"
				>
					<view class="product-image-wrapper">
						<image class="product-image" :src="item.image" mode="aspectFill"></image>
					</view>
					<view class="product-info">
						<view class="product-header">
							<text class="product-name">{{ item.name }}</text>
							<view class="product-tags" v-if="item.tags && item.tags.length > 0">
								<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{ tag }}</text>
							</view>
						</view>
						<text class="product-desc" v-if="item.description">{{ item.description }}</text>
						<view class="product-footer">
							<view class="product-price">
								<text class="price-symbol">฿</text>
								<text class="price-num">{{ item.price }}</text>
								<text class="price-original" v-if="item.originalPrice && Number(item.originalPrice) > Number(item.price)">฿{{ item.originalPrice }}</text>
							</view>
							<view class="add-btn" @click.stop="handleAddToCart(item)">
								<text class="add-icon">+</text>
							</view>
						</view>
					</view>
				</view>

			</view>
			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

			<!-- 购物车底栏 -->
			<view class="cart-bar" v-if="cartCount > 0">
				<view class="cart-bar-left" @click="toggleCartPopup">
					<view class="cart-icon-wrapper">
						<image class="cart-icon" src="/static/icons/cart.svg" mode="aspectFit"></image>
						<view class="cart-badge">
							<text class="badge-text">{{ cartCount }}</text>
						</view>
					</view>
					<view class="cart-bar-price">
						<text class="cart-bar-symbol">฿</text>
						<text class="cart-bar-num">{{ cartTotal }}</text>
					</view>
				</view>
				<view class="cart-bar-checkout" @click="handleCartClick">
					<text class="cart-bar-checkout-text">{{ t('dinein.checkout') }}</text>
					</view>
			</view>

			<!-- 购物车弹窗 -->
			<view class="cart-popup-mask" v-if="showCartPopup" @click="toggleCartPopup"></view>
			<view class="cart-popup" :class="{ 'cart-popup-show': showCartPopup }" v-if="cartCount > 0">
				<view class="cart-popup-header">
					<text class="cart-popup-title">{{ t('dinein.cartTitle') }}</text>
					<view class="cart-popup-clear" @click="handleClearCart">
						<text class="cart-popup-clear-text">{{ t('dinein.clearCart') }}</text>
					</view>
				</view>
				<scroll-view class="cart-popup-list" scroll-y>
					<view class="cart-popup-item" v-for="(item, idx) in cartItems" :key="item.id + '_' + idx + '_' + item.quantity">
						<image class="cart-popup-item-img" :src="item.image" mode="aspectFill"></image>
						<view class="cart-popup-item-info">
							<text class="cart-popup-item-name">{{ item.name }}</text>
							<text class="cart-popup-item-spec" v-if="item.specs && Object.keys(item.specs).length > 0">{{ formatSpecs(item.specs) }}</text>
						</view>
						<view class="cart-popup-item-right">
							<text class="cart-popup-item-price">฿{{ (item.price * item.quantity).toFixed(2) }}</text>
							<view class="cart-popup-qty">
								<view class="cart-popup-qty-btn" @click="changeCartQty(idx, -1)">
									<text class="cart-popup-qty-text">-</text>
								</view>
								<text class="cart-popup-qty-num">{{ item.quantity }}</text>
								<view class="cart-popup-qty-btn" @click="changeCartQty(idx, 1)">
									<text class="cart-popup-qty-text">+</text>
								</view>
							</view>
						</view>
					</view>
					<view class="cart-popup-empty" v-if="cartItems.length === 0">
						<text class="cart-popup-empty-text">{{ t('dinein.cartEmpty') }}</text>
					</view>
				</scroll-view>
			</view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="0"></custom-tabbar>

		<!-- 分享弹窗 -->
		<share-modal
			:visible="showShareModal"
			:shareInfo="shareInfo"
			@close="handleShareModalClose"
			@confirm="handleShareConfirm"
		></share-modal>

			<!-- 规格选择弹窗 -->
			<view class="spec-mask" v-if="showSpecPopup" @click="closeSpecPopup"></view>
			<view class="spec-popup" :class="{ 'spec-popup-show': showSpecPopup }" v-if="specProduct">
				<view class="spec-popup-inner">
					<view class="spec-header">
						<image class="spec-product-image" :src="specProduct.image" mode="aspectFill"></image>
						<view class="spec-product-info">
							<view class="spec-product-price">
								<text class="spec-price-symbol">฿</text>
								<text class="spec-price-num">{{ useNewOptions ? (getOptionsSpecPrice() * specQuantity).toFixed(2) : (specProduct.price * specQuantity).toFixed(2) }}</text>
							</view>
							<text class="spec-product-name">{{ specProduct.name }}</text>
						</view>
						<view class="spec-close" @click="closeSpecPopup">
							<text class="spec-close-text">×</text>
						</view>
					</view>
					<scroll-view class="spec-body" scroll-y>
						<!-- 老规格系统(specs_config) -->
						<template v-if="!useNewOptions">
							<view class="spec-group" v-for="(group, gIdx) in specGroups" :key="gIdx">
								<text class="spec-group-label">{{ group.label }}</text>
								<view class="spec-options">
									<view
										class="spec-option"
										v-for="(opt, oIdx) in group.options"
										:key="oIdx"
										:class="{ 'spec-option-active': selectedSpecs[group.key] === opt.value }"
										@click="selectSpec(group.key, opt.value)"
									>
										<text class="spec-option-text">{{ opt.label }}</text>
									</view>
								</view>
							</view>
						</template>

						<!-- 新规格系统(options API) -->
						<template v-if="useNewOptions && itemOptionsData">
							<!-- 规格(单选) -->
							<view class="spec-group" v-if="itemOptionsData.specs && itemOptionsData.specs.length > 0">
								<text class="spec-group-label">{{ t('productDetail.specSize') }}</text>
								<view class="spec-options">
									<view
										v-for="spec in itemOptionsData.specs"
										:key="spec.id"
										class="spec-option"
										:class="{ 'spec-option-active': selectedSpecOpt && selectedSpecOpt.id === spec.id }"
										@click="selectedSpecOpt = spec"
									>
										<text class="spec-option-text">{{ _optionDisplayName(spec) }}</text>
										<text class="spec-option-price" v-if="spec.price_diff > 0">+฿{{ spec.price_diff }}</text>
									</view>
								</view>
							</view>
							<!-- 口味(单选) -->
							<view class="spec-group" v-if="itemOptionsData.flavors && itemOptionsData.flavors.length > 0">
								<text class="spec-group-label">{{ t('productDetail.specFlavor') }}</text>
								<view class="spec-options">
									<view
										v-for="flavor in itemOptionsData.flavors"
										:key="flavor.id"
										class="spec-option"
										:class="{ 'spec-option-active': selectedFlavor && selectedFlavor.id === flavor.id }"
										@click="selectedFlavor = flavor"
									>
										<text class="spec-option-text">{{ _optionDisplayName(flavor) }}</text>
										<text class="spec-option-price" v-if="flavor.price_diff > 0">+฿{{ flavor.price_diff }}</text>
									</view>
								</view>
							</view>
							<!-- 加料(多选) -->
							<view class="spec-group" v-if="itemOptionsData.toppings && itemOptionsData.toppings.length > 0">
								<text class="spec-group-label">{{ t('productDetail.specTopping') }}</text>
								<view class="spec-options">
									<view
										v-for="topping in itemOptionsData.toppings"
										:key="topping.id"
										class="spec-option"
										:class="{ 'spec-option-active': selectedToppings.some(t => t.id === topping.id) }"
										@click="toggleOptionTopping(topping)"
									>
										<text class="spec-option-text">{{ _optionDisplayName(topping) }}</text>
										<text class="spec-option-price" v-if="topping.price_diff > 0">+฿{{ topping.price_diff }}</text>
									</view>
								</view>
							</view>
						</template>

						<view class="spec-qty-row">
							<text class="spec-qty-label">{{ t('productDetail.quantity') }}</text>
							<view class="spec-qty-control">
								<view class="spec-qty-btn" @click="changeSpecQuantity(-1)"><text class="spec-qty-btn-text">−</text></view>
								<text class="spec-qty-num">{{ specQuantity }}</text>
								<view class="spec-qty-btn" @click="changeSpecQuantity(1)"><text class="spec-qty-btn-text">+</text></view>
							</view>
						</view>
					</scroll-view>
					<view class="spec-footer">
						<view class="spec-confirm-btn" v-if="useNewOptions" @click="confirmOptionsAddToCart">
							<text class="spec-confirm-text">{{ t('common.confirm') }} ฿{{ (getOptionsSpecPrice() * specQuantity).toFixed(2) }}</text>
						</view>
						<view class="spec-confirm-btn" v-else @click="confirmSpec">
							<text class="spec-confirm-text">{{ t('common.confirm') }}</text>
						</view>
					</view>
				</view>
			</view>
	</view>
</template>

<script>
import { showToast, fixMinioUrl, calcDistance, getUserLocation } from '@/utils/index.js'
import { shareShop, shareProduct, ShareType } from '@/utils/share.js'
import CustomTabbar from '@/components/custom-tabbar.vue'
import ShareModal from '@/components/share-modal.vue'
import appStore from '@/store/index.js'
import i18n from '@/i18n/index.js'
import { getStore, getOpeningInfo, claimOpeningCoupon } from '@/api/services/store.js'
import footprintManager from '@/utils/footprint.js'
import { getConsumerCategories, getConsumerMenuItems, getStoreMenu, getMenuItemOptions } from '@/api/services/menu.js'

export default {
	components: {
		CustomTabbar,
		ShareModal
	},
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			activeCategory: 0,
			cartCount: 0,
			cartTotal: 0,
			cartItems: [],
			showShareModal: false,
			showCartPopup: false,
			loading: false,
				orderType: 'dinein',
			shareInfo: {
				type: 'shop',
				id: '',
				name: '',
				image: ''
			},
			openingInfo: {
				is_opening_active: false,
				days_left: 0,
				extra_points: 0,
				extra_coins: 0,
				discount_percent: 0,
				coupon_ids: [],
				has_coupon: false
			},
			openingClaiming: false,
			openingClaimed: false,
			testOpeningMode: false,
			_nameClickCount: 0,
			shopInfo: {
				id: null,
				name: '',
				fullName: '',
				banner: 'https://minio.siamfeast.com/sf-uploads/store_logo/2026/05/85f3b58e-5d6e-4b53-a1cc-c5508e5aa00b.webp',
				logo: '/static/images/store-placeholder.svg',
				phone: '',
				businessHours: '',
				distance: '',
				bikeTime: '',
				walkTime: '',
				address: ''
			},
			categories: [],
			allProducts: [],
			showSpecPopup: false,
			specProduct: null,
			specGroups: [],
			selectedSpecs: {},
			specQuantity: 1,
			// 新的 options 系统(后端 /public/menu-items/:id/options)
			itemOptionsData: null,      // { flavors, specs, toppings }
			selectedFlavor: null,
			selectedSpecOpt: null,
			selectedToppings: [],
			useNewOptions: false,
		}
	},
	computed: {
			currentProducts() {
				if (this.activeCategory === -1) return []
				if (this.categories.length === 0) return this.allProducts
				const cat = this.categories[this.activeCategory]
				if (!cat) return []
				// 新路径：分类对象自带 items（来自 /stores/{id}/menu）
				if (Array.isArray(cat.items) && cat.items.length > 0) {
					return cat.items
				}
				// 兜底：从 allProducts 按 catIds 过滤
				if (cat.catIds) {
					return this.allProducts.filter(p => cat.catIds.includes(p.category_id))
				}
				return this.allProducts.filter(p => p.store_menu_category_id === cat.id || p.category_id === cat.id)
			},
		mapEmbedUrl() {
			const lat = this.shopInfo.latitude
			const lng = this.shopInfo.longitude
			if (!lat || !lng) return ''
			return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
		},
	},
	onLoad(options) {
			this.orderType = options.orderType || 'dinein'
		this.initShopInfo(options)
		this.initPage()
		if (this.shopInfo.id) {
			this.loadStoreData()
		}
	},
	onShow() {
		this.restoreCart()
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

		// 测试:连点店名 5 次激活开业横幅(上线前删)
		onShopNameClick() {
			this._nameClickCount = (this._nameClickCount || 0) + 1
			if (this._nameClickCount >= 5) {
				this.testOpeningMode = !this.testOpeningMode
				if (this.testOpeningMode) {
					this.openingInfo = {
						is_opening_active: true,
						days_left: 5,
						extra_points: 50,
						extra_coins: 10,
						discount_percent: 10,
						coupon_ids: [],
						has_coupon: false
					}
					this.openingClaimed = false
					uni.showToast({ title: '开业横幅测试模式 ON', icon: 'none' })
				} else {
					uni.showToast({ title: '开业横幅测试模式 OFF', icon: 'none' })
				}
				this._nameClickCount = 0
			}
		},

		// ============ 新店开业 ============
		async loadOpeningInfo() {
			if (!this.shopInfo.id) return
			try {
				const res = await getOpeningInfo(this.shopInfo.id, {}, { silent: true })
				if (res && res.code === 0 && res.data) {
					this.openingInfo = {
						is_opening_active: res.data.is_opening_active || false,
						days_left: res.data.days_left || 0,
						extra_points: res.data.extra_points || 0,
						extra_coins: res.data.extra_coins || 0,
						discount_percent: res.data.discount_percent || 0,
						coupon_ids: res.data.coupon_ids || [],
						has_coupon: (res.data.coupon_ids || []).length > 0
					}
				}
			} catch (e) {
				console.warn('[opening] load info failed:', e)
			}
		},

		async handleClaimOpeningCoupon() {
			if (this.openingClaiming || this.openingClaimed) return
			this.openingClaiming = true
			try {
				const res = await claimOpeningCoupon(this.shopInfo.id)
				if (res && res.code === 0) {
					this.openingClaimed = true
					uni.showToast({ title: this.t('opening.claimSuccess'), icon: 'success' })
				}
			} catch (e) {
				console.error('[opening] claim failed:', e)
				const code = e && (e.code || e.bizCode)
				const errMap = {
					OPENING_COUPON_UNAVAILABLE: this.t('opening.errors.unavailable'),
					OPENING_ACTIVITY_ENDED: this.t('opening.errors.ended'),
					OPENING_COUPON_ALREADY_CLAIMED: this.t('opening.errors.alreadyClaimed')
				}
				const msg = (code && errMap[code]) || (e && e.message) || this.t('opening.errors.default')
				uni.showToast({ title: msg, icon: 'none' })
				if (code === 'OPENING_COUPON_ALREADY_CLAIMED') {
					this.openingClaimed = true
				}
			} finally {
				this.openingClaiming = false
			}
		},

		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		/**
		 * 初始化门店信息
		 */
		initShopInfo(options) {
			const currentStore = appStore.getCurrentStore()

			if (currentStore) {
				this.shopInfo = {
					id: currentStore.id,
					name: currentStore.name,
					name_en: currentStore.name_en || '',
					name_th: currentStore.name_th || '',
					fullName: currentStore.name,
					banner: currentStore.banner || 'https://minio.siamfeast.com/sf-uploads/store_logo/2026/05/85f3b58e-5d6e-4b53-a1cc-c5508e5aa00b.webp',
					logo: fixMinioUrl(currentStore.logo_url || currentStore.logo) || '/static/images/store-placeholder.svg',
					phone: currentStore.phone || '',
					formatted_address: currentStore.formatted_address || '',
					latitude: currentStore.latitude,
					longitude: currentStore.longitude,
					delivery_enabled: currentStore.delivery_enabled || false,
					businessHours: this.formatBusinessHours(currentStore),
					status: currentStore.status || 'OPEN',
					distance: currentStore.distance || '',
					bikeTime: currentStore.bikeTime || '',
					walkTime: currentStore.walkTime || '',
					address: currentStore.address || ''
				}
				this.updateShopDistance()
			} else if (options.shopName) {
				this.shopInfo.name = decodeURIComponent(options.shopName)
				this.shopInfo.fullName = decodeURIComponent(options.shopName)
			}

				if (options.shopId) {
					this.shopInfo.id = parseInt(options.shopId)
				}

				// Guard: no store selected
				if (!this.shopInfo.id) {
					uni.showModal({
						title: i18n.t("dinein.selectStoreTitle") || "请选择门店",
						content: i18n.t("dinein.selectStoreMsg") || "请先选择一个门店再开始点餐",
						showCancel: false,
						success: () => {
							uni.navigateTo({ url: "/pages/store-select/index" })
						}
					})
				}
			},

			async updateShopDistance() {
				if (!this.shopInfo.latitude || !this.shopInfo.longitude) return
				try {
					const loc = await getUserLocation()
					const info = calcDistance(loc.latitude, loc.longitude, this.shopInfo.latitude, this.shopInfo.longitude)
					if (info) {
						this.$set(this.shopInfo, 'distance', info.distanceText)
						this.$set(this.shopInfo, 'bikeTime', info.bikeText)
						this.$set(this.shopInfo, 'walkTime', info.walkText)
					}
				} catch(e) {
					console.warn('getLocation failed:', e)
				}
			},

		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20

			const navBarHeight = 44
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		/**
		 * 加载门店全部数据（门店详情、分类、商品）
		 */
		async loadStoreData() {
			if (this.loading) return
			this.loading = true

			try {
				// Step 1: Load store details first (need business_types for category filtering)
				const storeRes = await getStore(this.shopInfo.id)
				let storeBusinessTypes = []

				if (storeRes.code === 0 && storeRes.data) {
					const s = storeRes.data
					storeBusinessTypes = s.business_types || []
					this.shopInfo = {
						id: s.id,
						name: s.name,
						name_en: s.name_en || '',
						name_th: s.name_th || '',
						fullName: s.name,
						banner: fixMinioUrl(s.background_image_url || s.banner_image || s.banner) || 'https://minio.siamfeast.com/sf-uploads/store_logo/2026/05/85f3b58e-5d6e-4b53-a1cc-c5508e5aa00b.webp',
						logo: fixMinioUrl(s.logo_url || s.logo) || '/static/images/store-placeholder.svg',
						phone: s.phone || '',
						formatted_address: s.formatted_address || '',
						formatted_address_en: s.formatted_address_en || '',
						formatted_address_th: s.formatted_address_th || '',
						latitude: s.latitude,
						longitude: s.longitude,
						delivery_enabled: s.delivery_enabled || false,
						businessHours: this.formatBusinessHours(s),
						status: s.status || 'OPEN',
						distance: s.distance || '',
						bikeTime: s.bikeTime || '',
						walkTime: s.walkTime || '',
						address: s.address || '',
						address_en: s.address_en || '',
						address_th: s.address_th || '',
						business_types: storeBusinessTypes
					}
					console.log('[dinein] formatted businessHours:', this.shopInfo.businessHours)
					this.updateShopDistance()

					// 加载开业信息
					this.loadOpeningInfo()

				}

				// 记录门店浏览足迹
				if (this.shopInfo && this.shopInfo.id) {
					footprintManager.addStoreFootprint({
						id: this.shopInfo.id,
						name: this.shopInfo.name,
						name_zh: this.shopInfo.name_zh || this.shopInfo.name,
						name_en: this.shopInfo.name_en,
						name_th: this.shopInfo.name_th,
						logo: this.shopInfo.logo,
						address: this.shopInfo.formatted_address || this.shopInfo.address,
						address_zh: this.shopInfo.formatted_address_zh || this.shopInfo.address_zh || this.shopInfo.address,
						address_en: this.shopInfo.formatted_address_en || this.shopInfo.address_en,
						address_th: this.shopInfo.formatted_address_th || this.shopInfo.address_th,
						formatted_address_zh: this.shopInfo.formatted_address_zh,
						formatted_address_en: this.shopInfo.formatted_address_en,
						formatted_address_th: this.shopInfo.formatted_address_th,
						rating: this.shopInfo.rating || 4.5,
						status: this.shopInfo.status || 'OPEN',
						businessHours: this.shopInfo.businessHours
					})
				}

				// Step 2: Load menu (categories + items) via /stores/{id}/menu
				try {
					const menuRes = await getStoreMenu(this.shopInfo.id)
					if (menuRes.code === 0 && menuRes.data) {
						const data = menuRes.data
						const categories = Array.isArray(data.categories) ? data.categories : []
						const uncategorized = Array.isArray(data.uncategorized_items) ? data.uncategorized_items : []

						// Build categories list for tabs
						this.categories = categories.map(cat => ({
							id: cat.id,
							catIds: [cat.id],
							nameKey: cat.name || '',
							name: cat.name || '',
							name_en: cat.name_en || '',
							name_th: cat.name_th || '',
							sortOrder: cat.sort_order || 0,
							items: (cat.items || []).map(it => this.normalizeProduct(it))
						})).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

						// All products flattened (for "all" tab and cart reference)
						this.allProducts = this.categories.flatMap(c => c.items)
						// 兜底：无分类的菜品单独建一个分类
						if (uncategorized.length > 0) {
							const unkCat = {
								id: 'uncategorized',
								catIds: ['uncategorized'],
								nameKey: '其他',
								name: '其他',
								name_en: 'Others',
								name_th: 'อื่น ๆ',
								sortOrder: 999,
								items: uncategorized.map(it => this.normalizeProduct(it))
							}
							this.categories.push(unkCat)
							this.allProducts = this.allProducts.concat(unkCat.items)
						}

						// 兜底：接口失败或为空时，退回旧路径
						if (this.allProducts.length === 0) {
							console.warn('[dinein] /stores/{id}/menu returned empty, fallback to old path')
							await this.loadLegacyMenu()
						}
						if (this.categories.length > 0) {
							this.activeCategory = 0
						}
					} else {
						// 接口失败 → 退回旧路径
						await this.loadLegacyMenu()
					}
				} catch (e) {
					console.error('[dinein] loadStoreMenu error:', e)
					await this.loadLegacyMenu()
				}

			} catch (e) {
				console.error('loadStoreData error:', e)
			} finally {
				this.loading = false
			}
		},

		// 旧路径兜底：调 /public/menu-items + 本地分组（接口 /stores/{id}/menu 异常时用）
		async loadLegacyMenu() {
			try {
				const allItemsRes = await getConsumerMenuItems(this.shopInfo.id, { page_size: 200 })
				if (allItemsRes.code === 0 && allItemsRes.data) {
					const items = Array.isArray(allItemsRes.data) ? allItemsRes.data : (allItemsRes.data.items || [])
					this.allProducts = items.map(item => this.normalizeProduct(item))
				}
				await this.loadFallbackCategories()
				if (this.categories.length > 0) {
					this.activeCategory = 0
				}
			} catch (e) {
				console.error('[dinein] loadLegacyMenu error:', e)
			}
		},

		async loadFallbackCategories() {
					// Build categories directly from product data (no external API dependency)
					if (this.allProducts.length === 0) return

					// Try to get category names from /categories API first
					let catNameMap = new Map()
					try {
						const catRes = await getConsumerCategories()
						if (catRes.code === 0 && catRes.data) {
							const catData = Array.isArray(catRes.data) ? catRes.data : (catRes.data.items || [])
							for (const c of catData) {
								catNameMap.set(c.id, c)
							}
						}
					} catch (e) {
						console.warn('Categories API failed, using product data only:', e)
					}

					// Group products by category_id
					const catGroups = new Map()
					for (const p of this.allProducts) {
						const cid = p.category_id
						if (!cid) continue
						if (!catGroups.has(cid)) catGroups.set(cid, [])
						catGroups.get(cid).push(p)
					}

					// Build category objects
					this.categories = [...catGroups.entries()].map(([cid, prods]) => {
						const catInfo = catNameMap.get(cid)
						const name = catInfo?.name || prods[0]?.category_name || ''
						const nameEn = catInfo?.name_en || prods[0]?.category_name_en || ''
						const nameTh = catInfo?.name_th || prods[0]?.category_name_th || ''
						return {
							id: cid,
							catIds: [cid],
							nameKey: name || 'Cat ' + cid,
							name_en: nameEn,
							name_th: nameTh,
							name: name || 'Cat ' + cid,
							sortOrder: catInfo?.sort_order || 0
						}
					}).sort((a, b) => a.sortOrder - b.sortOrder)
				},

		// 格式化营业时间：兼容 config.opening_time/closing_time、business_hours 字符串、businessHours 等多种形态
		formatBusinessHours(s) {
			if (!s) {
				console.log('[dinein] formatBusinessHours: input empty')
				return ''
			}
			console.log('[dinein] formatBusinessHours input:', JSON.stringify({
				config: s.config,
				store_config: s.store_config,
				business_hours: s.business_hours,
				businessHours: s.businessHours,
				opening_hours: s.opening_hours,
				opening_time: s.opening_time,
				closing_time: s.closing_time
			}))
			// 形态1：config 对象里有 opening_time / closing_time
			const cfg = s.config || s.store_config
			if (cfg && cfg.opening_time && cfg.closing_time) {
				const open = String(cfg.opening_time).slice(0, 5)
				const close = String(cfg.closing_time).slice(0, 5)
				if (open && close && !open.includes('undefined') && !close.includes('undefined')) {
					return `${open}-${close}`
				}
			}
			// 形态2：直接是字符串
			const str = s.business_hours || s.businessHours || s.opening_hours
			if (str && typeof str === 'string' && !str.includes('undefined') && str !== '-') return str
			// 形态3：分开的 opening_time / closing_time 字段（不在 config 里）
			if (s.opening_time && s.closing_time) {
				return `${String(s.opening_time).slice(0, 5)}-${String(s.closing_time).slice(0, 5)}`
			}
			console.log('[dinein] formatBusinessHours: no time field found, returning empty')
			return ''
		},

		normalizeProduct(item) {
			const lang = i18n.getLanguage()
			const nameFallback = item.name || item.name_en || item.name_th || ''
			const localizedName = lang === 'en' ? (item.name_en || nameFallback)
				: lang === 'th' ? (item.name_th || nameFallback)
				: nameFallback
			const localizedDesc = lang === 'en' ? (item.description_en || item.description)
				: lang === 'th' ? (item.description_th || item.description)
				: (item.description || '')
			return {
				id: item.id,
				name: localizedName,
				name_zh: item.name || item.name_en || '',
				description: localizedDesc || '',
				price: item.price,
				originalPrice: item.original_price || item.originalPrice || null,
				image: fixMinioUrl((item.image_url && !item.image_url.includes('example.com')) ? item.image_url : '/static/images/img-placeholder.svg'),
				category_id: item.category_id,
				category_name: item.category_name || '',
				category_name_en: item.category_name_en || '',
				category_name_th: item.category_name_th || '',
				store_menu_category_id: item.store_menu_category_id,
				tags: item.tags || [],
				stock: item.stock,
				is_sold_out: item.is_sold_out || false,
				specs_config: item.specs_config || {},
				has_options: item.has_options || false,
				options_checked: false,
				options_loaded: false,
				optionsSnapshot: null    // options 接口返回的规格快照(per-item 缓存)
			}
		},

		goBack() {
			uni.navigateBack()
		},

		// 点击地址 → 跳转 Google Maps
		openShopMap() {
			const lat = this.shopInfo.latitude
			const lng = this.shopInfo.longitude
			const name = encodeURIComponent(this.shopInfo.name || '')
			if (lat && lng) {
				// #ifdef H5
				window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
				// #endif
				// #ifdef APP-PLUS
				uni.openLocation({
					latitude: parseFloat(lat),
					longitude: parseFloat(lng),
					name: this.shopInfo.name || '',
					address: this.shopInfo.formatted_address || this.shopInfo.address || '',
					scale: 16,
					fail: () => {
						// 兜底:用浏览器打开 Google Maps
						plus.runtime.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`)
					}
				})
				// #endif
			} else {
				// 没有坐标,用地址搜索
				const addr = this.shopInfo.formatted_address || this.shopInfo.address || this.shopInfo.name || ''
				if (addr) {
					// #ifdef H5
					window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank')
					// #endif
					// #ifdef APP-PLUS
					plus.runtime.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`)
					// #endif
				}
			}
		},

		selectCategory(index) {
			this.activeCategory = index
		},

		async loadCategoryProducts() {
			if (this.activeCategory === -1 || this.categories.length === 0) return
			const catId = this.categories[this.activeCategory].id
			try {
				const res = await getConsumerMenuItems(this.shopInfo.id, { category_id: catId, page_size: 200 })
				if (res.code === 0 && res.data) {
					const items = Array.isArray(res.data) ? res.data : (res.data.items || [])
					this.allProducts = items.map(item => this.normalizeProduct(item))
				}
			} catch (e) {
				console.error("loadCategoryProducts error:", e)
			}
		},

		handleProductClick(item) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${item.id}&shopId=${this.shopInfo.id}&name=${encodeURIComponent(item.name)}&price=${item.price}&image=${encodeURIComponent(item.image)}`
			})
		},

		handleAddToCart(item) {
			if (item.is_sold_out) {
				showToast(this.i18n.t('dinein.soldOut'))
				return
			}
			// 商家关业确认（每次进入门店首次加购时弹一次）
			if (this.shopInfo.status && this.shopInfo.status !== 'OPEN' && !this._closedConfirmed) {
				uni.showModal({
					title: this.i18n.t('dinein.storeClosedTitle'),
					content: this.i18n.t('dinein.storeClosedContent'),
					confirmText: this.i18n.t('dinein.storeClosedConfirm'),
					cancelText: this.i18n.t('dinein.storeClosedCancel'),
					success: (res) => {
						if (res.confirm) {
							this._closedConfirmed = true
							this._doAddToCartFlow(item)
						}
					}
				})
				return
			}
			this._doAddToCartFlow(item)
		},

		async _doAddToCartFlow(item) {
			// 1. 兼容老的 specs_config 系统
			const specs = item.specs_config
			const hasValidSpecs = specs && Object.keys(specs).some(k => specs[k] && specs[k].length > 0)
			if (hasValidSpecs) {
				this.specProduct = item
				this.specQuantity = 1
				this.buildSpecGroups(specs)
				this.showSpecPopup = true
				return
			}
			// 2. 已缓存过该商品的 options 快照 → 直接复用弹出（每次加购都让用户选规格）
			if (item.optionsSnapshot && this._hasAnyOption(item.optionsSnapshot)) {
				this._showOptionsPopup(item, item.optionsSnapshot)
				return
			}
			// 3. 没缓存过且有门店 → 请求 options 接口
			if (this.shopInfo.id && !item.options_checked) {
				await this._loadAndShowOptions(item)
				return
			}
			// 4. 请求过且确实无规格 → 直接加入购物车
			this.doAddToCart(item, 1, {})
		},

		_hasAnyOption(data) {
			return !!data && (
				(data.flavors && data.flavors.length > 0) ||
				(data.specs && data.specs.length > 0) ||
				(data.toppings && data.toppings.length > 0)
			)
		},

		_showOptionsPopup(item, data) {
			this.itemOptionsData = data
			this.specProduct = item
			this.specQuantity = 1
			this.selectedFlavor = data.flavors && data.flavors.length > 0 ? data.flavors[0] : null
			this.selectedSpecOpt = data.specs && data.specs.length > 0 ? data.specs[0] : null
			this.selectedToppings = []
			this.showSpecPopup = true
			this.useNewOptions = true
		},

		// ============ 新的 options 系统 ============
		async _loadAndShowOptions(item) {
			try {
				const res = await getMenuItemOptions(item.id, this.shopInfo.id)
				item.options_checked = true
				if (res && res.code === 0 && res.data) {
					const data = res.data
					// 缓存快照,后续点击复用,避免重复请求
					item.optionsSnapshot = data
					// 如果没有任何规格选项,直接加入
					if (!this._hasAnyOption(data)) {
						this.doAddToCart(item, 1, {})
						return
					}
					// 有规格,弹新弹窗
					this._showOptionsPopup(item, data)
					return
				}
			} catch (e) {
				console.warn('[dinein] load options failed:', e)
			}
			// 失败兜底:直接加入
			this.doAddToCart(item, 1, {})
		},

		// 新弹窗:计算价格
		getOptionsSpecPrice() {
			if (!this.specProduct) return 0
			let price = Number(this.specProduct.price) || 0
			if (this.selectedFlavor) price += Number(this.selectedFlavor.price_diff) || 0
			if (this.selectedSpecOpt) price += Number(this.selectedSpecOpt.price_diff) || 0
			if (this.selectedToppings) {
				this.selectedToppings.forEach(t => { price += Number(t.price_diff) || 0 })
			}
			return price
		},

		_optionDisplayName(opt) {
			if (!opt) return ''
			const lang = i18n.getLanguage()
			return opt['name_' + lang] || opt.name || ''
		},

		// 新弹窗:切换加料
		toggleOptionTopping(topping) {
			const idx = this.selectedToppings.findIndex(t => t.id === topping.id)
			if (idx >= 0) { this.selectedToppings.splice(idx, 1) }
			else { this.selectedToppings.push(topping) }
		},

		// 新弹窗:确认加入购物车
		confirmOptionsAddToCart() {
			if (!this.specProduct) return
			// 构建 specs 对象
			const specs = {}
			if (this.selectedSpecOpt) specs.spec = { id: this.selectedSpecOpt.id, name: this._optionDisplayName(this.selectedSpecOpt), price_diff: this.selectedSpecOpt.price_diff }
			if (this.selectedFlavor) specs.flavor = { id: this.selectedFlavor.id, name: this._optionDisplayName(this.selectedFlavor), price_diff: this.selectedFlavor.price_diff }
			if (this.selectedToppings && this.selectedToppings.length > 0) {
				specs.toppings = this.selectedToppings.map(t => ({ id: t.id, name: this._optionDisplayName(t), price_diff: t.price_diff }))
			}

			// 修改 item 价格为含规格价
			const itemCopy = { ...this.specProduct }
			itemCopy.price = this.getOptionsSpecPrice()

			this.doAddToCart(itemCopy, this.specQuantity, specs)
			this.closeSpecPopup()
		},

	
		buildSpecGroups(specs) {
			const lang = i18n.state.language
			const messages = i18n.state.messages[lang] || {}
			const labels = (messages.productDetail && messages.productDetail.specLabels) || {}
			const options = (messages.productDetail && messages.productDetail.specOptions) || {}
			const labelMap = {
				spec: labels.spec || labels.size || '\u89c4\u683c',
				combo: labels.combo || '\u5957\u9910',
				flavor: labels.flavor || labels.spice_level || '\u53e3\u5473',
				toppings: labels.toppings || '\u52a0\u6599',
				temperature: labels.temperature || '\u6e29\u5ea6',
				sugar: labels.sugar || '\u7cd6\u5ea6',
				size: labels.size || '\u4efd\u91cf',
				spice_level: labels.spice_level || '\u8fa3\u5ea6'
			}
			const groups = []
			const selected = {}
			for (const [key, values] of Object.entries(specs)) {
				if (key === 'pricing' || key === 'remark') continue
				if (!values || values.length === 0) continue
				const label = labelMap[key] || labels[key] || key
				groups.push({
					key,
					label,
					options: values.map(v => ({ value: typeof v === 'object' ? v.id || v.value : v, label: typeof v === 'object' ? (v.name || v.label || v.value) : (options[v] || v) }))
				})
				selected[key] = groups[groups.length - 1].options[0].value
			}
			this.specGroups = groups
			this.selectedSpecs = selected
		},

		selectSpec(key, value) {
			this.$set(this.selectedSpecs, key, value)
		},

		changeSpecQuantity(delta) {
			const newQty = this.specQuantity + delta
			if (newQty < 1) return
			if (this.specProduct.stock !== undefined && newQty > this.specProduct.stock) return
			this.specQuantity = newQty
		},

		closeSpecPopup() {
			this.showSpecPopup = false
			this.specProduct = null
			this.useNewOptions = false
			this.itemOptionsData = null
		},

		confirmSpec() {
			if (this.specProduct) {
				this.doAddToCart(this.specProduct, this.specQuantity, this.selectedSpecs)
			}
			this.showSpecPopup = false
			this.specProduct = null
		},

		restoreCart() {
			if (!this.shopInfo || !this.shopInfo.id) return
			const saved = appStore.getCart(this.shopInfo.id)
			if (saved && saved.length > 0) {
				this.cartItems = saved
				this.cartCount = saved.reduce((sum, ci) => sum + ci.quantity, 0)
				this.cartTotal = Math.round(saved.reduce((sum, ci) => sum + ci.price * ci.quantity, 0) * 100) / 100
			} else {
				this.cartItems = []
				this.cartCount = 0
				this.cartTotal = 0
			}
		},

		doAddToCart(item, quantity, specs) {
			quantity = quantity || 1
			this.cartCount += quantity
			this.cartTotal = Math.round((this.cartTotal + item.price * quantity) * 100) / 100

			// 查找购物车中是否已有同商品同规格的项
			// 注意：specs 必须标准化（用空对象而不是 null，避免 stringify 结果不一致）
			const normalizedSpecs = specs && Object.keys(specs).length > 0 ? { ...specs } : {}
			const specsKey = JSON.stringify(normalizedSpecs)
			const existIdx = this.cartItems.findIndex(ci =>
				ci.id === item.id && JSON.stringify(ci.specs || {}) === specsKey
			)

			if (existIdx >= 0) {
				// Vue 3 修改数组元素属性，用 splice 触发响应式更新（避免直接赋值失效）
				const updated = { ...this.cartItems[existIdx], quantity: this.cartItems[existIdx].quantity + quantity }
				this.cartItems.splice(existIdx, 1, updated)
			} else {
				this.cartItems.push({
					id: item.id,
					name: item.name,
					price: item.price,
					image: item.image,
					quantity: quantity,
					specs: normalizedSpecs,
					store_id: this.shopInfo.id
				})
			}
			// 防抖：连续加购时合并多次 toast，避免快速触发卡 UI
			if (this._toastTimer) clearTimeout(this._toastTimer)
			this._toastTimer = setTimeout(() => {
				showToast(this.i18n.t('dinein.addToCart'))
			}, 200)
			this.syncCartToStore()
		},

		handleCartClick() {
			const productsStr = encodeURIComponent(JSON.stringify(this.cartItems))
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=${this.orderType}&shopId=${this.shopInfo.id || ''}&shopName=${encodeURIComponent(this.shopInfo.name)}&products=${productsStr}`
			})
		},

		toggleCartPopup() {
			this.showCartPopup = !this.showCartPopup
		},

		handleClearCart() {
			this.cartItems = []
			this.cartCount = 0
			this.cartTotal = 0
			this.showCartPopup = false
			if (this.shopInfo && this.shopInfo.id) {
				appStore.clearCart(this.shopInfo.id)
			}
		},

		changeCartQty(idx, delta) {
			const item = this.cartItems[idx]
			if (!item) return
			const newQty = item.quantity + delta
			if (newQty <= 0) {
				this.cartItems.splice(idx, 1)
			} else {
				// 用 splice 触发响应式更新（避免直接赋值失效）
				this.cartItems.splice(idx, 1, { ...item, quantity: newQty })
			}
			this.recalcCart()
			this.syncCartToStore()
			if (this.cartItems.length === 0) {
				this.showCartPopup = false
			}
		},

		recalcCart() {
			this.cartCount = this.cartItems.reduce((s, i) => s + i.quantity, 0)
			this.cartTotal = Math.round(this.cartItems.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100
		},

		syncCartToStore() {
			if (!this.shopInfo || !this.shopInfo.id) return
			const all = appStore.getCart()
			all[this.shopInfo.id] = this.cartItems
			try {
				uni.setStorageSync('siamfeast_cart', JSON.stringify(all))
			} catch (e) {
				console.error('syncCartToStore error:', e)
			}
		},

		formatSpecs(specs) {
			if (!specs) return ''
			const lang = i18n.state.language
			const messages = i18n.state.messages[lang] || {}
			const labels = (messages.productDetail && messages.productDetail.specLabels) || {}
			const options = (messages.productDetail && messages.productDetail.specOptions) || {}
			const skipKeys = ['pricing', 'remark', 'topping_ids', 'quantity', 'group_price', 'original_price', 'group_buy_item_id', 'is_group_buy']
			const norm = (v) => {
				if (v === null || v === undefined || v === '') return ''
				if (Array.isArray(v)) return v.map(norm).filter(Boolean).join(', ')
				if (typeof v === 'object') return v.name || v.label || v.value || ''
				return options[v] || v
			}
			return Object.entries(specs)
				.filter(([k, v]) => {
					if (skipKeys.includes(k)) return false
					if (v === null || v === undefined || v === '') return false
					if (Array.isArray(v)) return v.length > 0
					if (typeof v === 'object') return !!(v.name || v.label || v.value)
					return true
				})
				.map(([k, v]) => {
					const label = labels[k] || k
					const val = norm(v)
					if (!val) return ''
					return `${label}：${val}`
				})
				.filter(Boolean)
				.join(' / ')
		},
		// 分享门店
		async handleShareShop() {
			try {
				// 按当前语言取店名（默认中文，回退到 fullName/name）
				const lang = i18n.getLanguage()
				const shopName = this.shopInfo['name_' + lang] || this.shopInfo.fullName || this.shopInfo.name
				const result = await shareShop({
					id: this.shopInfo.id || 1,
					name: shopName,
					logo: this.shopInfo.logo,
					banner: this.shopInfo.banner
				})

				if (result.success) {
					this.shareInfo = {
						type: 'shop',
						id: this.shopInfo.id || 1,
						name: shopName,
						image: this.shopInfo.logo || this.shopInfo.banner
					}
					this.showShareModal = true
					showToast(this.i18n.t('dinein.shareSuccess'))
				} else {
					showToast(this.i18n.t('dinein.shareFail'))
				}
			} catch (e) {
				console.error('Share failed:', e)
				showToast(this.i18n.t('dinein.shareFailed'))
			}
		},

		// 分享菜品
		async handleShareProduct(product) {
			try {
				const lang = i18n.getLanguage()
				const shopName = this.shopInfo['name_' + lang] || this.shopInfo.fullName || this.shopInfo.name
				const productName = product['name_' + lang] || product.name
				const result = await shareProduct(
					{
						id: product.id,
						name: productName,
						price: product.price,
						image: product.image
					},
					{
						id: this.shopInfo.id || 1,
						name: shopName
					}
				)

				if (result.success) {
					this.shareInfo = {
						type: 'product',
						id: product.id,
						name: productName,
						price: product.price,
						image: product.image,
						shopId: this.shopInfo.id || 1,
						shopName: shopName
					}
					this.showShareModal = true
					showToast(this.i18n.t('dinein.shareSuccess'))
				} else {
					showToast(this.i18n.t('dinein.shareFail'))
				}
			} catch (e) {
				console.error('Share failed:', e)
				showToast(this.i18n.t('dinein.shareFailed'))
			}
		},

		handleShareModalClose() {
			this.showShareModal = false
		},

		handleShareConfirm(shareInfo) {
			this.showShareModal = false
			showToast(this.i18n.t('dinein.welcome'))
		}
	}
}
</script>

<style scoped>
.dinein-page {
	min-height: 100vh;
	background-color: #F2B131;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #F2B131;
}

/* 导航栏 */
.nav-bar {
	height: 44px;
	background-color: #F2B131;
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
	border-radius: 16px;
	transition: background-color 0.2s;
}

.nav-back:active {
	background-color: rgba(0, 0, 0, 0.06);
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
	background-color: #FFFFFF;
	border-radius: 12px 12px 0 0;
}

/* 店铺头部 */
.shop-header {
	width: 100%;
	height: 129px;
	padding: 10px 16px;
}

.shop-banner {
	width: 100%;
	height: 100%;
	border-radius: 10px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 店铺详细信息 */
.shop-info-card {
	display: flex;
	padding: 0 16px 12px;
}

.shop-info-left {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.shop-full-name {
	font-size: 16px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.9);
}

.shop-rating {
	display: flex;
	align-items: center;
}

.rating-text {
	font-size: 11px;
	font-weight: 500;
	color: #6C4600;
}

.shop-time {
	font-size: 11px;
	font-weight: 500;
	color: rgba(0, 0, 0, 0.9);
}

.store-status-badge {
	font-size: 10px;
	font-weight: 600;
	padding: 2px 6px;
	border-radius: 4px;
	margin-left: 6px;
}
.badge-open {
	color: #52C41A;
	background-color: rgba(82, 196, 26, 0.1);
}
.badge-closed {
	color: #DA3300;
	background-color: rgba(218, 51, 0, 0.1);
}

.delivery-badge {
	font-size: 11px;
	font-weight: 500;
	color: #DA3300;
	background-color: rgba(218, 51, 0, 0.08);
	padding: 1px 6px;
	border-radius: 4px;
	display: inline-block;
	margin-top: 2px;
}

.shop-distance {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-top: 2px;
}

.distance-item {
	font-size: 11px;
	font-weight: 500;
	color: #949494;
}

.distance-divider {
	font-size: 11px;
	color: #D9D9D9;
}

.shop-address {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-top: 2px;
}

.shop-address:active {
	opacity: 0.6;
}

.address-icon {
	width: 14px;
	height: 14px;
}

.address-text {
	font-size: 11px;
	font-weight: 500;
	color: #949494;
}

/* 新店开业横幅 */
.opening-banner {
	margin: 12px 16px;
	padding: 20px 16px;
	background: linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 100%);
	border-radius: 16px;
	border: 1px solid #FFE082;
	box-shadow: 0 2px 8px rgba(242, 177, 49, 0.1);
}

.opening-banner-header {
	display: flex;
	align-items: center;
	margin-bottom: 12px;
}

.opening-emoji {
	font-size: 28px;
	margin-right: 8px;
}

.opening-title {
	font-size: 18px;
	font-weight: 700;
	color: #FF6B9D;
	flex: 1;
}

.opening-days {
	font-size: 13px;
	color: #F2B131;
	font-weight: 600;
	padding: 4px 10px;
	background-color: rgba(242, 177, 49, 0.15);
	border-radius: 12px;
}

.opening-benefits {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-bottom: 8px;
}

.benefit-item {
	display: flex;
	align-items: center;
	padding: 4px 8px;
	background-color: rgba(255, 255, 255, 0.8);
	border-radius: 8px;
}

.benefit-icon {
	font-size: 18px;
	margin-right: 3px;
}

.benefit-text {
	font-size: 15px;
	color: #333;
	font-weight: 500;
}

.opening-coupon-section {
	margin-top: 8px;
}

.opening-claim-btn {
	height: 44px;
	background: linear-gradient(90deg, #FF6B9D 0%, #F2B131 100%);
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 8px rgba(255, 107, 157, 0.2);
}

.opening-claim-btn.btn-disabled {
	opacity: 0.5;
}

.opening-claim-text {
	color: #FFFFFF;
	font-size: 14px;
	font-weight: 600;
}

.shop-map {
	margin: 12px 16px 0;
	border-radius: 12px;
	overflow: hidden;
	height: 180px;
	background-color: #F5F5F5;
}

.map-iframe {
	width: 100%;
	height: 100%;
	border: 0;
	display: block;
}

.shop-info-right {
	display: flex;
	align-items: center;
	padding-left: 16px;
}

.share-icon {
	width: 24px;
	height: 24px;
	opacity: 0.5;
	transition: opacity 0.2s;
}

.share-icon:active {
	opacity: 0.8;
}

/* 分类标签 */
.category-tabs {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	white-space: nowrap;
	align-items: center;
	justify-content: space-around;
	padding: 0 16px;
	gap: 0;
	height: 44px;
	border-bottom: 1px solid #F5F5F5;
	background-color: #FFFFFF;
}

.category-tab {
	padding: 10px 14px;
	position: relative;
	transition: opacity 0.2s;
	flex-shrink: 0;
}

.category-tab:active {
	opacity: 0.7;
}

.category-tab-text {
	font-size: 14px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.5);
	transition: color 0.2s;
}

.category-tab-active .category-tab-text {
	color: #000000CC;
}

.category-tab-active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 20px;
	height: 3px;
	background-color: #F2B131;
	border-radius: 2px;
}

/* 商品列表 */
.product-section {
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.product-item {
	display: flex;
	background-color: #FFFFFF;
	border-radius: 10px;
	overflow: hidden;
	padding: 10px;
	gap: 10px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	transition: transform 0.2s, box-shadow 0.2s;
}

.product-item:active {
	transform: scale(0.98);
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.product-image-wrapper {
	width: 100px;
	height: 100px;
	flex-shrink: 0;
}

.product-image {
	width: 100%;
	height: 100%;
	border-radius: 10px;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.product-header {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.product-name {
	font-size: 14px;
	font-weight: 600;
	color: #3C3C3C;
}

.product-tags {
	display: flex;
	gap: 4px;
}

.tag {
	font-size: 10px;
	color: #F2B131;
	background-color: rgba(242, 177, 49, 0.1);
	padding: 2px 6px;
	border-radius: 4px;
}

.product-desc {
	font-size: 12px;
	color: #949494;
	margin-top: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.product-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: auto;
}

.product-price {
	display: flex;
	align-items: baseline;
	gap: 4px;
}

.price-symbol {
	font-size: 12px;
	font-weight: 600;
	color: #F2B131;
}

.price-num {
	font-size: 18px;
	font-weight: 700;
	color: #F2B131;
}

.price-original {
	font-size: 12px;
	color: #949494;
	text-decoration: line-through;
}

.add-btn {
	width: 28px;
	height: 28px;
	background-color: #F2B131;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.2s, opacity 0.2s;
}

.add-btn:active {
	transform: scale(0.9);
	opacity: 0.85;
}

.add-icon {
	font-size: 18px;
	color: #FFFFFF;
	font-weight: 500;
}

/* 购物车底栏 */
.cart-bar {
	position: fixed;
	bottom: 56px;
	left: 12px;
	right: 12px;
	height: 52px;
	background-color: #4B4B4B;
	border-radius: 26px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 6px 0 6px;
	z-index: 100;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}

.cart-bar-left {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 0 8px;
	flex: 1;
}

.cart-icon-wrapper {
	width: 44px;
	height: 44px;
	background-color: #F2B131;
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	box-shadow: 0 2px 8px rgba(242, 177, 49, 0.3);
}

.cart-icon {
	width: 22px;
	height: 22px;
}

.cart-badge {
	position: absolute;
	top: -4px;
	right: -4px;
	min-width: 18px;
	height: 18px;
	background-color: #FF4444;
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid #4B4B4B;
}

.badge-text {
	font-size: 10px;
	color: #FFFFFF;
	font-weight: 600;
}

.cart-bar-price {
	display: flex;
	align-items: baseline;
}

.cart-bar-symbol {
	font-size: 12px;
	font-weight: 600;
	color: #FFFFFF;
}

.cart-bar-num {
	font-size: 20px;
	font-weight: 700;
	color: #FFFFFF;
}

.cart-bar-checkout {
	background-color: #F2B131;
	padding: 12px 22px;
	border-radius: 20px;
	transition: opacity 0.2s;
}

.cart-bar-checkout:active {
	opacity: 0.85;
}

.cart-bar-checkout-text {
	font-size: 13px;
	font-weight: 600;
	color: #FFFFFF;
}

/* 购物车弹窗遮罩 */
.cart-popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 199;
}

/* 购物车弹窗 */
.cart-popup {
	position: fixed;
	bottom: 116px;
	left: 12px;
	right: 12px;
	max-height: 50vh;
	background-color: #FFFFFF;
	border-radius: 14px;
	z-index: 200;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	transform: translateY(20px);
	opacity: 0;
	pointer-events: none;
	transition: transform 0.25s ease, opacity 0.2s ease;
}

.cart-popup-show {
	transform: translateY(0);
	opacity: 1;
	pointer-events: auto;
}

.cart-popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 16px 10px;
	border-bottom: 1px solid #F5F5F5;
}

.cart-popup-title {
	font-size: 15px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.88);
}

.cart-popup-clear {
	padding: 4px 8px;
	border-radius: 4px;
	transition: background-color 0.15s;
}

.cart-popup-clear:active {
	background-color: #F5F5F5;
}

.cart-popup-clear-text {
	font-size: 12px;
	color: #949494;
}

.cart-popup-list {
	max-height: 40vh;
	padding: 4px 0;
}

.cart-popup-item {
	display: flex;
	align-items: center;
	padding: 10px 16px;
	gap: 10px;
}

.cart-popup-item-img {
	width: 44px;
	height: 44px;
	border-radius: 8px;
	flex-shrink: 0;
}

.cart-popup-item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2px;
	overflow: hidden;
}

.cart-popup-item-name {
	font-size: 13px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.85);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.cart-popup-item-spec {
	font-size: 11px;
	color: #949494;
}

.cart-popup-item-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4px;
}

.cart-popup-item-price {
	font-size: 13px;
	font-weight: 600;
	color: #F2B131;
}

.cart-popup-qty {
	display: flex;
	align-items: center;
	gap: 8px;
}

.cart-popup-qty-btn {
	width: 22px;
	height: 22px;
	background-color: #F5F5F5;
	border-radius: 11px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.15s;
}

.cart-popup-qty-btn:active {
	background-color: #E8E8E8;
}

.cart-popup-qty-text {
	font-size: 14px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.6);
}

.cart-popup-qty-num {
	font-size: 13px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.8);
	min-width: 18px;
	text-align: center;
}

.cart-popup-empty {
	padding: 40px 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.cart-popup-empty-text {
	font-size: 13px;
	color: #949494;
}

/* 底部占位 */
.bottom-placeholder {
	height: 120px;
}

/* 规格选择弹窗 */
.spec-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 200;
}

.spec-popup {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 201;
}

.spec-popup-inner {
	width: 620rpx;
	max-width: 85vw;
	background-color: #FFFFFF;
	border-radius: 16px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	max-height: 70vh;
	transform: scale(0.9);
	opacity: 0;
	transition: transform 0.25s ease, opacity 0.3s ease;
}

.spec-popup-show .spec-popup-inner {
	transform: scale(1);
	opacity: 1;
}

/* 头部：商品图+价格+关闭 */
.spec-header {
	display: flex;
	align-items: flex-start;
	padding: 16px;
	gap: 12px;
	border-bottom: 1px solid #F0F0F0;
}

.spec-product-image {
	width: 72px;
	height: 72px;
	border-radius: 8px;
	flex-shrink: 0;
}

.spec-product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding-top: 2px;
	overflow: hidden;
}

.spec-product-price {
	display: flex;
	align-items: baseline;
}

.spec-price-symbol {
	font-size: 13px;
	font-weight: 600;
	color: #DA3300;
}

.spec-price-num {
	font-size: 22px;
	font-weight: 700;
	color: #DA3300;
}

.spec-product-name {
	font-size: 12px;
	color: #949494;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.spec-close {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: 14px;
}

.spec-close:active {
	background-color: #F0F0F0;
}

.spec-close-text {
	font-size: 20px;
	color: #949494;
	line-height: 1;
}

/* 规格主体 */
.spec-body {
	flex: 1;
	padding: 16px;
	max-height: 40vh;
}

.spec-group {
	margin-bottom: 16px;
}

.spec-group-label {
	font-size: 13px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.75);
	margin-bottom: 10px;
	display: block;
}

.spec-options {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.spec-option {
	padding: 6px 14px;
	border-radius: 16px;
	background-color: #F5F5F5;
	border: 1.5px solid transparent;
	transition: all 0.2s;
}

.spec-option:active {
	opacity: 0.8;
}

.spec-option-active {
	background-color: rgba(242, 177, 49, 0.1);
	border-color: #F2B131;
}

.spec-option-text {
	font-size: 12px;
	color: rgba(0, 0, 0, 0.75);
}

.spec-option-active .spec-option-text {
	color: #F2B131;
	font-weight: 600;
}

.spec-option-price {
	font-size: 11px;
	color: #999;
	margin-left: 4px;
}

.spec-option-active .spec-option-price {
	color: #F2B131;
}

/* 数量行 */
	.spec-qty-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 20px 0 0;
		margin-top: 12px;
		border-top: 1px solid #F0F0F0;
	}

	.spec-qty-label {
		font-size: 13px;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.75);
	}

	.spec-qty-control {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.spec-qty-btn {
		width: 26px;
		height: 26px;
		border-radius: 13px;
		background-color: #F5F5F5;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spec-qty-btn:active {
		background-color: #E8E8E8;
	}

	.spec-qty-btn-text {
		font-size: 15px;
		font-weight: 500;
		color: rgba(0, 0, 0, 0.7);
		line-height: 1;
	}

	.spec-qty-num {
		font-size: 15px;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.85);
		min-width: 20px;
		text-align: center;
	}

.spec-footer {
	padding: 12px 16px;
	padding-bottom: calc(12px + env(safe-area-inset-bottom));
	border-top: 1px solid #F0F0F0;
}

.spec-confirm-btn {
	height: 42px;
	background-color: #F2B131;
	border-radius: 21px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.spec-confirm-btn:active {
	opacity: 0.85;
}

.spec-confirm-text {
	font-size: 15px;
	font-weight: 600;
	color: #FFFFFF;
}
</style>
