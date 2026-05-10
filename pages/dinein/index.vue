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
					<text class="shop-time">{{ i18n.t('dinein.businessHours') }}：{{ shopInfo.businessHours }}</text>
						<text class="delivery-badge" v-if="shopInfo.delivery_enabled">{{ i18n.t('dinein.deliverySupported') }}</text>
					<view class="shop-distance">
						<text class="distance-item">{{ i18n.t('dinein.distance') }}{{ shopInfo.distance }}</text>
						<text class="distance-divider">|</text>
						<text class="distance-item">{{ i18n.t('dinein.bikeTime') }}{{ shopInfo.bikeTime }}</text>
						<text class="distance-divider">|</text>
						<text class="distance-item">{{ i18n.t('dinein.walkTime') }}{{ shopInfo.walkTime }}</text>
					</view>
					<view class="shop-address">
						<image class="address-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
						<text class="address-text">{{ shopInfo.formatted_address || shopInfo.address }}</text>
					</view>
				</view>
				<view class="shop-info-right">
					<image class="share-icon" src="/static/icons/share.svg" mode="aspectFit" @click="handleShareShop"></image>
				</view>
			</view>

				<!-- category tabs -->
				<scroll-view class="category-tabs" scroll-x :show-scrollbar="false">
					<view
						v-if="isHostel"
						class="category-tab"
						:class="{ 'category-tab-active': activeCategory === -1 }"
						@click="selectCategory(-1)"
					>
						<text class="category-tab-text">{{ i18n.t('hostel.rooms') }}</text>
					</view>
					<view
						v-for="(item, index) in categories"
						:key="index"
						class="category-tab"
						:class="{ 'category-tab-active': activeCategory === index }"
						@click="selectCategory(index)"
					>
						<text class="category-tab-text">{{ item['name_' + i18n.getLanguage()] || item.nameKey }}</text>
					</view>
				</scroll-view>


				<!-- room list (hostel mode, room tab selected) -->
				<view class="product-section" v-if="isHostel && activeCategory === -1">
					<view class="hostel-date-bar" @click="openDatePicker">
						<view class="hostel-date-item">
							<text class='hostel-date-label'>{{ i18n.t('hostel.checkIn') }}</text>
							<text class='hostel-date-value'>{{ hostelCheckIn || i18n.t('hostel.selectDate') }}</text>
						</view>
						<view class="hostel-date-night">
							<text class='hostel-night-pill'>{{ hostelNights }}{{ i18n.t('hostel.nights') }}</text>
						</view>
						<view class="hostel-date-item">
							<text class='hostel-date-label'>{{ i18n.t('hostel.checkOut') }}</text>
							<text class='hostel-date-value'>{{ hostelCheckOut || i18n.t('hostel.selectDate') }}</text>
						</view>
					</view>
					<view v-if="hostelRooms.length === 0 && !loading" class="hostel-empty">
						<text class='hostel-empty-text'>{{ i18n.t('hostel.noRooms') }}</text>
					</view>
					<view v-for="room in hostelRooms" :key="room.id" class="room-card" @click="handleBookRoom(room)">
						<view class="room-card-img">
							<image class='room-card-image' :src="room.image || '/static/images/empty-room.svg'" mode='aspectFill'></image>
							<view class="room-card-badge" v-if="!room.is_available">
								<text class='room-card-badge-text'>{{ i18n.t('hostel.full') }}</text>
							</view>
						</view>
						<view class="room-card-content">
							<view class="room-name-row">
								<text class="room-card-name">{{ room["name_" + i18n.getLanguage()] || room.name }}</text>
								<view class="room-spec-chip" v-if="room.capacity">
									<text class="room-spec-chip-text">{{ room.capacity }}{{ i18n.t("hostel.person") }}</text>
								</view>
							</view>
							<text class="room-card-desc" v-if="room.description">{{ room["description_" + i18n.getLanguage()] || room.description }}</text>
							<view class="room-card-specs">
								<view class="room-spec-chip" v-if="room.bed_count">
									<text class="room-spec-chip-text">{{ room.bed_count }}{{ i18n.t("hostel.beds") }}</text>
								</view>
								<view class="room-spec-chip" v-if="room.room_size">
									<text class="room-spec-chip-text">{{ room.room_size }}m²</text>
								</view>
							</view>
							<view class="room-card-footer">
								<view class="room-card-price">
									<text class="room-price-symbol">฿</text>
									<text class="room-price-num">{{ room.base_price }}</text>
									<text class="room-price-unit">/{{ i18n.t("hostel.perNight") }}</text>
								</view>
								<view class="room-book-btn" :class='{ "room-book-btn-disabled": !room.is_available }'>
									<text class="room-book-btn-text">{{ room.is_available ? i18n.t("hostel.book") : i18n.t("hostel.full") }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- product list (non-room tab) -->
				<view class="product-section" v-if="!isHostel || activeCategory !== -1">
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
								<text class="price-original" v-if="item.originalPrice">฿{{ item.originalPrice }}</text>
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
					<text class="cart-bar-checkout-text">{{ i18n.t('dinein.checkout') }}</text>
					</view>
			</view>

			<!-- 购物车弹窗 -->
			<view class="cart-popup-mask" v-if="showCartPopup" @click="toggleCartPopup"></view>
			<view class="cart-popup" :class="{ 'cart-popup-show': showCartPopup }" v-if="cartCount > 0">
				<view class="cart-popup-header">
					<text class="cart-popup-title">{{ i18n.t('dinein.cartTitle') }}</text>
					<view class="cart-popup-clear" @click="handleClearCart">
						<text class="cart-popup-clear-text">{{ i18n.t('dinein.clearCart') }}</text>
					</view>
				</view>
				<scroll-view class="cart-popup-list" scroll-y>
					<view class="cart-popup-item" v-for="(item, idx) in cartItems" :key="idx">
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
						<text class="cart-popup-empty-text">{{ i18n.t('dinein.cartEmpty') }}</text>
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

			<!-- date picker popup -->
			<view class="dp-mask" v-if="showDatePicker" @click="closeDatePicker"></view>
			<view class="dp-popup" :class="{ 'dp-popup-show': showDatePicker }" v-if="showDatePicker">
				<view class="dp-header">
					<text class="dp-title">{{ datePickerStep === 'checkin' ? i18n.t('hostel.checkIn') : i18n.t('hostel.checkOut') }}</text>
					<view class="dp-close" @click="closeDatePicker">
						<text class="dp-close-text">×</text>
					</view>
				</view>
				<view class="dp-nav">
					<view class="dp-nav-btn" @click="prevMonth">
						<text class="dp-nav-arrow">‹</text>
					</view>
					<text class="dp-nav-label">{{ calendarYear }}/{{ String(calendarMonth).padStart(2, '0') }}</text>
					<view class="dp-nav-btn" @click="nextMonth">
						<text class="dp-nav-arrow">›</text>
					</view>
				</view>
				<view class="dp-weekdays">
					<text class="dp-weekday" v-for="d in weekDays" :key="d">{{ d }}</text>
				</view>
				<view class="dp-days">
					<view
						v-for="(day, idx) in calendarDays"
						:key="idx"
						class="dp-day"
						:class="{
							'dp-day-empty': !day,
							'dp-day-selected': day && isDaySelected(day),
							'dp-day-in-range': day && isDayInRange(day),
							'dp-day-disabled': day && isDayDisabled(day)
						}"
						@click="selectDay(day)"
					>
						<text class="dp-day-text" v-if="day">{{ day }}</text>
					</view>
				</view>
				<view class="dp-footer">
					<view class="dp-confirm-btn" @click="confirmDatePicker">
						<text class="dp-confirm-text">{{ i18n.t('common.confirm') }}</text>
					</view>
				</view>
			</view>
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
							<text class="spec-qty-label">{{ i18n.t('productDetail.quantity') }}</text>
							<view class="spec-qty-control">
								<view class="spec-qty-btn" @click="changeSpecQuantity(-1)"><text class="spec-qty-btn-text">−</text></view>
								<text class="spec-qty-num">{{ specQuantity }}</text>
								<view class="spec-qty-btn" @click="changeSpecQuantity(1)"><text class="spec-qty-btn-text">+</text></view>
							</view>
						</view>
					</scroll-view>
					<view class="spec-footer">
						<view class="spec-confirm-btn" @click="confirmSpec">
							<text class="spec-confirm-text">{{ i18n.t('common.confirm') }}</text>
						</view>
					</view>
				</view>
			</view>
	</view>
</template>

<script>
import { showToast } from '@/utils/index.js'
import { shareShop, shareProduct, ShareType } from '@/utils/share.js'
import CustomTabbar from '@/components/custom-tabbar.vue'
import ShareModal from '@/components/share-modal.vue'
import appStore from '@/store/index.js'
import i18n from '@/i18n/index.js'
import { getStore } from '@/api/services/store.js'
import footprintManager from '@/utils/footprint.js'
import { getConsumerCategories, getConsumerMenuItems, } from '@/api/services/menu.js'
import { getAvailableRooms } from '@/api/services/hostel.js'

export default {
	components: {
		CustomTabbar,
		ShareModal
	},
	data() {
		return {
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
			isHostel: false,
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
				banner: '/static/images/banner-placeholder.svg',
				logo: '/static/images/store-placeholder.svg',
				phone: '',
				businessHours: '11:00-22:00',
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
			hostelRooms: [],
			hostelCheckIn: '',
			hostelCheckOut: '',
			hostelNights: 0,
				showDatePicker: false,
				datePickerStep: 'checkin',
				calendarYear: new Date().getFullYear(),
				calendarMonth: new Date().getMonth() + 1,
		}
	},
	computed: {
			currentProducts() {
				if (this.activeCategory === -1) return []
				if (this.categories.length === 0) return this.allProducts
				const catId = this.categories[this.activeCategory].id
				const cat = this.categories[this.activeCategory]
				if (cat.catIds) {
					return this.allProducts.filter(p => cat.catIds.includes(p.category_id))
				}
				return this.allProducts.filter(p => p.store_menu_category_id === catId || p.category_id === catId)
			},
			weekDays() {
				return i18n.t('common.weekDays')
			},
			calendarDays() {
				const firstDay = new Date(this.calendarYear, this.calendarMonth - 1, 1).getDay()
				const daysInMonth = new Date(this.calendarYear, this.calendarMonth, 0).getDate()
				const days = []
				for (let i = 0; i < firstDay; i++) days.push(0)
				for (let i = 1; i <= daysInMonth; i++) days.push(i)
				return days
			},
	},
	onLoad(options) {
		this.initShopInfo(options)
		this.initPage()
		if (this.shopInfo.id) {
			this.loadStoreData()
		}
	},
	onShow() {
		this.restoreCart()
	},
	methods: {
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
					banner: currentStore.banner || '/static/images/banner-placeholder.svg',
					logo: currentStore.logo_url || currentStore.logo || '/static/images/store-placeholder.svg',
					phone: currentStore.phone || '',
					formatted_address: currentStore.formatted_address || '',
					latitude: currentStore.latitude,
					longitude: currentStore.longitude,
					delivery_enabled: currentStore.delivery_enabled || false,
					businessHours: currentStore.businessHours || '11:00-22:00',
					distance: currentStore.distance || '',
					bikeTime: currentStore.bikeTime || '',
					walkTime: currentStore.walkTime || '',
					address: currentStore.address || ''
				}
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
						banner: s.background_image_url || s.banner_image || s.banner || '/static/images/banner-placeholder.svg',
						logo: s.logo_url || s.logo || '/static/images/store-placeholder.svg',
						phone: s.phone || '',
						formatted_address: s.formatted_address || '',
						latitude: s.latitude,
						longitude: s.longitude,
						delivery_enabled: s.delivery_enabled || false,
						businessHours: s.config
							? `${s.config.opening_time?.slice(0, 5)}-${s.config.closing_time?.slice(0, 5)}`
							: (s.business_hours || s.businessHours || '11:00-22:00'),
						distance: s.distance || '',
						bikeTime: s.bikeTime || '',
						walkTime: s.walkTime || '',
						address: s.address || '',
						business_types: storeBusinessTypes
					}

					// Detect hotel/hostel type - enable room tab
					const hostelTypes = ["HOTEL", "HOSTEL_ROOM", "HOSTEL_HOTPOT", "HOSTEL_COFFEE"]
					this.isHostel = storeBusinessTypes.some(t => hostelTypes.includes(t))
					if (this.isHostel) {
						this.activeCategory = -1
						this.loadHostelRooms()
					}
				}

				// 记录门店浏览足迹
				if (this.shopInfo && this.shopInfo.id) {
					footprintManager.addStoreFootprint({
						id: this.shopInfo.id,
						name: this.shopInfo.name,
						logo: this.shopInfo.logo,
						address: this.shopInfo.formatted_address || this.shopInfo.address,
						rating: this.shopInfo.rating || 4.5,
						status: this.shopInfo.status || 'OPEN',
						businessHours: this.shopInfo.businessHours
					})
				}

				// Step 2: Load all products for this store first
				try {
					const allItemsRes = await getConsumerMenuItems(this.shopInfo.id, { page_size: 200 })
					if (allItemsRes.code === 0 && allItemsRes.data) {
						const items = Array.isArray(allItemsRes.data) ? allItemsRes.data : (allItemsRes.data.items || [])
						this.allProducts = items.map(item => this.normalizeProduct(item))
					}
				} catch (e) {
					console.error('loadProducts error:', e)
				}

					// Step 3: Load categories from global categories API
					await this.loadFallbackCategories()
					if (!this.isHostel && this.categories.length > 0) {
						this.activeCategory = 0
					}

			} catch (e) {
				console.error('loadStoreData error:', e)
			} finally {
				this.loading = false
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
					console.log('[DEBUG] allProducts count:', this.allProducts.length, 'catIds:', this.allProducts.map(p => p.category_id))
					console.log('[DEBUG] catGroups size:', catGroups.size, 'keys:', [...catGroups.keys()])
					console.log('[DEBUG] catNameMap has:', [...catNameMap.keys()])
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
					console.log('[DEBUG] final categories:', JSON.stringify(this.categories.map(c => ({id: c.id, name: c.name, name_en: c.name_en}))))
				},

		// Map store business_types (JSONB array) to category business_type filter
		mapBusinessType(businessTypes) {

			if (!businessTypes || !businessTypes.length) return null

			// Match the first known food business_type (exclude hostel types)

			const foodTypes = ["HOTPOT_BUFFET", "HOTPOT_PER_ITEM", "MALA_TANG", "SEAFOOD_NOODLE", "STANDARD_FOOD"]

			for (const ft of foodTypes) {

				if (businessTypes.includes(ft)) return ft

			}

			// Fallback: return first non-hostel type

			const hostelTypes = ["HOSTEL_ROOM", "HOSTEL_HOTPOT", "HOSTEL_COFFEE"]

			const nonHostel = businessTypes.find(t => !hostelTypes.includes(t))

			return nonHostel || null

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
				image: (item.image_url && !item.image_url.includes('example.com')) ? item.image_url : '/static/images/img-placeholder.svg',
				category_id: item.category_id,
				category_name: item.category_name || '',
				category_name_en: item.category_name_en || '',
				category_name_th: item.category_name_th || '',
				store_menu_category_id: item.store_menu_category_id,
				tags: item.tags || [],
				stock: item.stock,
				is_sold_out: item.is_sold_out || false,
				business_type: item.business_type,
				specs_config: item.specs_config || {}
			}
		},

			async loadHostelRooms() {
				if (!this.shopInfo.id) return
				try {
					const checkIn = this.hostelCheckIn || this.getDefaultDate(0)
					const checkOut = this.hostelCheckOut || this.getDefaultDate(1)
					const res = await getAvailableRooms(this.shopInfo.id, {
						check_in_date: checkIn,
						check_out_date: checkOut
					})
					if (res.code === 0 && res.data) {
						const d = res.data
						const rawHR = Array.isArray(d) ? d : (d.data || d.available_rooms || d.rooms || [])
						this.hostelRooms = rawHR.map(r => ({
							id: r.id,
							name: r.room_type_name || r.name || ('Room ' + r.room_number),
							room_number: r.room_number,
							base_price: r.base_price,
							capacity: r.max_guests || r.capacity || 0,
							bed_count: r.bed_count || 0,
							is_available: r.status === 'AVAILABLE' || r.is_available === true,
							image: r.cover_image || r.image || '/static/images/img-placeholder.svg',
							description: r.description || ''
						}))
					}
				} catch (e) {
					console.error('loadHostelRooms error:', e)
					this.hostelRooms = []
				}
			},
			getDefaultDate(offsetDays) {
				const d = new Date()
				d.setDate(d.getDate() + offsetDays)
				return d.toISOString().slice(0, 10)
			},
				openDatePicker() {
					this.datePickerStep = this.hostelCheckIn ? 'checkout' : 'checkin'
					this.calendarYear = new Date().getFullYear()
					this.calendarMonth = new Date().getMonth() + 1
					this.showDatePicker = true
				},
				closeDatePicker() {
					this.showDatePicker = false
				},
				prevMonth() {
					if (this.calendarMonth === 1) {
						this.calendarMonth = 12
						this.calendarYear--
					} else {
						this.calendarMonth--
					}
				},
				nextMonth() {
					if (this.calendarMonth === 12) {
						this.calendarMonth = 1
						this.calendarYear++
					} else {
						this.calendarMonth++
					}
				},
				isDayDisabled(day) {
					const dateStr = this.calendarYear + '-' + String(this.calendarMonth).padStart(2,'0') + '-' + String(day).padStart(2,'0')
					const today = new Date(); today.setHours(0,0,0,0)
					const d = new Date(dateStr); d.setHours(0,0,0,0)
					if (d < today) return true
					if (this.datePickerStep === 'checkout' && this.hostelCheckIn) {
						const cin = new Date(this.hostelCheckIn); cin.setHours(0,0,0,0)
						if (d <= cin) return true
					}
					return false
				},
				isDaySelected(day) {
					const dateStr = this.calendarYear + '-' + String(this.calendarMonth).padStart(2,'0') + '-' + String(day).padStart(2,'0')
					if (this.datePickerStep === 'checkin' && this.hostelCheckIn === dateStr) return true
					if (this.datePickerStep === 'checkout' && this.hostelCheckOut === dateStr) return true
					return false
				},
				isDayInRange(day) {
					if (!this.hostelCheckIn || !this.hostelCheckOut) return false
					const dateStr = this.calendarYear + '-' + String(this.calendarMonth).padStart(2,'0') + '-' + String(day).padStart(2,'0')
					const d = new Date(dateStr).getTime()
					const cin = new Date(this.hostelCheckIn).getTime()
					const cout = new Date(this.hostelCheckOut).getTime()
					return d > cin && d < cout
				},
				selectDay(day) {
					if (this.isDayDisabled(day)) return
					const dateStr = this.calendarYear + '-' + String(this.calendarMonth).padStart(2,'0') + '-' + String(day).padStart(2,'0')
					if (this.datePickerStep === 'checkin') {
						this.hostelCheckIn = dateStr
						this.hostelCheckOut = ''
						this.datePickerStep = 'checkout'
					} else {
						this.hostelCheckOut = dateStr
					}
					this.updateNights()
				},
				updateNights() {
					if (this.hostelCheckIn && this.hostelCheckOut) {
						const cin = new Date(this.hostelCheckIn)
						const cout = new Date(this.hostelCheckOut)
						const diff = (cout - cin) / (1000 * 60 * 60 * 24)
						this.hostelNights = Math.max(0, Math.round(diff))
					} else {
						this.hostelNights = 0
					}
				},
				confirmDatePicker() {
					this.showDatePicker = false
					if (this.hostelCheckIn && this.hostelCheckOut && this.hostelNights > 0) {
						this.loadHostelRooms()
					}
				},
			handleBookRoom(room) {
				if (!room.is_available) {
					showToast(i18n.t('hostel.roomFull'))
					return
				}
				uni.navigateTo({
					url: `/pages/hostel/booking?roomId=${room.id}&roomName=${encodeURIComponent(room["name_" + i18n.getLanguage()] || room.name)}&roomPrice=${room.base_price}&checkIn=${this.hostelCheckIn}&checkOut=${this.hostelCheckOut}&nights=${this.hostelNights}&storeId=${this.shopInfo.id}&storeName=${encodeURIComponent(this.shopInfo["name_" + i18n.getLanguage()] || this.shopInfo.name)}&capacity=${room.capacity || 0}`
				})
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
			const specConfig = {
				temperature: { labelKey: 'temperature', options: ['hot', 'ice'] },
				sugar: { labelKey: 'sugar', options: ['full', 'half', 'little', 'none'] },
				size: { labelKey: 'size', options: ['small', 'medium', 'large'] },
				spice_level: { labelKey: 'spice_level', options: ['mild', 'medium_spice', 'hot_spice', 'extra_hot'] }
			}
			const groups = []
			const selected = {}
			for (const [key, values] of Object.entries(specs)) {
				if (!values || values.length === 0) continue
				const config = specConfig[key]
				if (!config) continue
				groups.push({
					key,
					label: labels[config.labelKey] || key,
					options: values.map(v => ({ value: v, label: options[v] || v }))
				})
				selected[key] = values[0]
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
			const specsKey = specs ? JSON.stringify(specs) : ''
			const existIdx = this.cartItems.findIndex(ci =>
				ci.id === item.id && JSON.stringify(ci.specs || {}) === specsKey
			)

				if (existIdx >= 0) {
					this.cartItems[existIdx].quantity += quantity
				} else {
					this.cartItems.push({
						id: item.id,
						name: item.name,
						price: item.price,
						image: item.image,
						quantity: quantity,
						specs: specs ? { ...specs } : {},
						store_id: this.shopInfo.id
					})
				}
			showToast(this.i18n.t('dinein.addToCart'))
			this.syncCartToStore()
		},

		handleCartClick() {
			const productsStr = encodeURIComponent(JSON.stringify(this.cartItems))
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=dinein&shopId=${this.shopInfo.id || ''}&shopName=${encodeURIComponent(this.shopInfo.name)}&products=${productsStr}`
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
				item.quantity = newQty
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
				const result = await shareShop({
					id: this.shopInfo.id || 1,
					name: this.shopInfo.fullName || this.shopInfo.name,
					logo: this.shopInfo.logo,
					banner: this.shopInfo.banner
				})

				if (result.success) {
					this.shareInfo = {
						type: 'shop',
						id: this.shopInfo.id || 1,
						name: this.shopInfo.fullName || this.shopInfo.name,
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
				const result = await shareProduct(
					{
						id: product.id,
						name: product.name,
						price: product.price,
						image: product.image
					},
					{
						id: this.shopInfo.id || 1,
						name: this.shopInfo.fullName || this.shopInfo.name
					}
				)

				if (result.success) {
					this.shareInfo = {
						type: 'product',
						id: product.id,
						name: product.name,
						price: product.price,
						image: product.image,
						shopId: this.shopInfo.id || 1,
						shopName: this.shopInfo.fullName || this.shopInfo.name
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


/* 民宿日期栏 */
.hostel-date-bar {
	display: flex;
	align-items: center;
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 14px 16px;
	gap: 12px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.hostel-date-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.hostel-date-label {
	font-size: 11px;
	color: #949494;
	font-weight: 500;
}
.hostel-date-value {
	font-size: 14px;
	color: rgba(0, 0, 0, 0.85);
	font-weight: 600;
}
.hostel-date-night {
	display: flex;
	align-items: center;
	justify-content: center;
}
.hostel-night-pill {
	font-size: 12px;
	font-weight: 600;
	color: #F2B131;
	background-color: rgba(242, 177, 49, 0.12);
	padding: 4px 12px;
	border-radius: 12px;
}
.hostel-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60px 0;
}
.hostel-empty-text {
	font-size: 14px;
	color: #949494;
}

/* 客房卡片 */
.room-card {
	background-color: #FFFFFF;
	border-radius: 14px;
	overflow: hidden;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	transition: transform 0.2s, box-shadow 0.2s;
}
.room-card:active {
	transform: scale(0.98);
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.room-card-img {
	width: 100%;
	height: 180px;
	position: relative;
}
.room-card-image {
	width: 100%;
	height: 100%;
}
.room-card-badge {
	position: absolute;
	top: 10px;
	right: 10px;
	background-color: rgba(0, 0, 0, 0.6);
	padding: 3px 10px;
	border-radius: 10px;
}
.room-card-badge-text {
	font-size: 11px;
	color: #FFFFFF;
	font-weight: 500;
}
.room-card-content {
	padding: 14px 16px 16px;
}
.room-name-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 4px;
}
.room-card-name {
	font-size: 16px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.88);
}
.room-card-desc {
	font-size: 12px;
	color: #949494;
	display: block;
	margin-bottom: 10px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.room-card-specs {
	display: flex;
	gap: 8px;
	margin-bottom: 14px;
}
.room-spec-chip {
	background-color: #F7F7F7;
	padding: 4px 10px;
	border-radius: 6px;
}
.room-spec-chip-text {
	font-size: 11px;
	color: rgba(0, 0, 0, 0.55);
	font-weight: 500;
}
.room-card-footer {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
}
.room-card-price {
	display: flex;
	align-items: baseline;
	gap: 2px;
}
.room-price-symbol {
	font-size: 14px;
	font-weight: 600;
	color: #F2B131;
}
.room-price-num {
	font-size: 24px;
	font-weight: 700;
	color: #F2B131;
}
.room-price-unit {
	font-size: 12px;
	color: #949494;
}
.room-book-btn {
	background-color: #F2B131;
	padding: 8px 24px;
	border-radius: 18px;
	transition: opacity 0.2s;
}
.room-book-btn:active {
	opacity: 0.85;
}
.room-book-btn-disabled {
	background-color: #D9D9D9;
}
.room-book-btn-text {
	font-size: 14px;
	font-weight: 600;
	color: #FFFFFF;
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
	transition: transform 0.25s ease, opacity 0.2s ease;
}

.cart-popup-show {
	transform: translateY(0);
	opacity: 1;
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



/* date picker popup */
.dp-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.45);
	z-index: 300;
}
.dp-popup {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%) scale(0.9);
	width: 340px;
	max-width: 90vw;
	background-color: #FFFFFF;
	border-radius: 16px;
	z-index: 301;
	opacity: 0;
	transition: transform 0.25s ease, opacity 0.3s ease;
	overflow: hidden;
}
.dp-popup-show {
	transform: translate(-50%, -50%) scale(1);
	opacity: 1;
}
.dp-header {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	padding: 18px 16px 12px;
}
.dp-title {
	font-size: 17px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.88);
}
.dp-close {
	position: absolute;
	right: 16px;
	top: 16px;
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 14px;
}
.dp-close:active {
	background-color: #F5F5F5;
}
.dp-close-text {
	font-size: 22px;
	color: #949494;
	line-height: 1;
}
.dp-nav {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 24px;
	padding: 8px 0 16px;
}
.dp-nav-btn {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 16px;
}
.dp-nav-btn:active {
	background-color: #F5F5F5;
}
.dp-nav-arrow {
	font-size: 20px;
	color: rgba(0, 0, 0, 0.6);
}
.dp-nav-label {
	font-size: 16px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.8);
	min-width: 80px;
	text-align: center;
}
.dp-weekdays {
	display: flex;
	padding: 0 12px;
	margin-bottom: 8px;
}
.dp-weekday {
	flex: 1;
	text-align: center;
	font-size: 12px;
	color: #949494;
	font-weight: 500;
}
.dp-days {
	display: flex;
	flex-wrap: wrap;
	padding: 0 12px;
}
.dp-day {
	width: 14.28%;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 22px;
	transition: background-color 0.15s;
}
.dp-day:active {
	background-color: #F5F5F5;
}
.dp-day-empty {
	pointer-events: none;
}
.dp-day-text {
	font-size: 15px;
	color: rgba(0, 0, 0, 0.8);
}
.dp-day-selected {
	background-color: #F2B131;
}
.dp-day-selected .dp-day-text {
	color: #FFFFFF;
	font-weight: 700;
}
.dp-day-in-range {
	background-color: rgba(242, 177, 49, 0.12);
}
.dp-day-in-range .dp-day-text {
	color: #F2B131;
}
.dp-day-disabled {
	pointer-events: none;
}
.dp-day-disabled .dp-day-text {
	color: #D9D9D9;
}
.dp-footer {
	padding: 12px 16px;
	padding-bottom: calc(12px + env(safe-area-inset-bottom));
	border-top: 1px solid #F5F5F5;
}
.dp-confirm-btn {
	height: 46px;
	background-color: #F2B131;
	border-radius: 23px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.dp-confirm-btn:active {
	opacity: 0.85;
}
.dp-confirm-text {
	font-size: 16px;
	font-weight: 600;
	color: #FFFFFF;
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
