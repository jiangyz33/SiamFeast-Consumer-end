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
					<text class="shop-full-name">{{ shopInfo["name_" + i18n.getLanguage()] || shopInfo.fullName }}</text>
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
					<view class="shop-address">
						<image class="address-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
						<text class="address-text">{{ shopInfo['formatted_address_' + i18n.getLanguage()] || shopInfo['address_' + i18n.getLanguage()] || shopInfo.formatted_address || shopInfo.address }}</text>
					</view>
				</view>
				<view class="shop-info-right">
					<image class="share-icon" src="/static/icons/share.svg" mode="aspectFit" @click="handleShareShop"></image>
				</view>
			</view>

			<!-- 门店位置地图 -->
			<view class="shop-map" v-if="shopInfo.latitude && shopInfo.longitude">
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
								<text class="spec-price-num">{{ (specProduct.price * specQuantity).toFixed(2) }}</text>
							</view>
							<text class="spec-product-name">{{ specProduct.name }}</text>
						</view>
						<view class="spec-close" @click="closeSpecPopup">
							<text class="spec-close-text">×</text>
						</view>
					</view>
					<scroll-view class="spec-body" scroll-y>
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
						<view class="spec-confirm-btn" @click="confirmSpec">
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
import { getStore } from '@/api/services/store.js'
import footprintManager from '@/utils/footprint.js'
import { getConsumerCategories, getConsumerMenuItems, getStoreMenu } from '@/api/services/menu.js'

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
				specs_config: item.specs_config || {}
			}
		},

		goBack() {
			uni.navigateBack()
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

		_doAddToCartFlow(item) {
			// 有规格则弹出选择弹窗
			const specs = item.specs_config
			const hasValidSpecs = specs && Object.keys(specs).some(k => specs[k] && specs[k].length > 0)
			if (hasValidSpecs) {
				this.specProduct = item
				this.specQuantity = 1
				this.buildSpecGroups(specs)
				this.showSpecPopup = true
				return
			}
			// 无规格直接加入购物车
			this.doAddToCart(item, 1, {})
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
			const lang = i18n.state.language
			const messages = i18n.state.messages[lang] || {}
			const options = (messages.productDetail && messages.productDetail.specOptions) || {}
			return Object.values(specs).map(v => options[v] || v).join('/')
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

.address-icon {
	width: 14px;
	height: 14px;
}

.address-text {
	font-size: 11px;
	font-weight: 500;
	color: #949494;
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
