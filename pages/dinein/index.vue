<template>
	<view class="dinein-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ shopInfo.name }}</text>
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
					<text class="shop-full-name">{{ shopInfo.fullName }}</text>
					<view class="shop-rating">
						<text class="rating-text" v-if="shopInfo.phone">{{ shopInfo.phone }}</text>
					</view>
					<text class="shop-time">{{ i18n.t('dinein.businessHours') }}：{{ shopInfo.businessHours }}</text>
						<text class="delivery-badge" v-if="shopInfo.delivery_enabled">支持外送</text>
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
				<view class="category-tabs">
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
				</view>


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
							<image class='room-card-image' :src="room.image || '/static/logo.png'" mode='aspectFill'></image>
							<view class="room-card-badge" v-if="!room.is_available">
								<text class='room-card-badge-text'>{{ i18n.t('hostel.full') }}</text>
							</view>
						</view>
						<view class="room-card-content">
							<text class='room-card-name'>{{ room.name }}</text>
							<text class='room-card-desc' v-if='room.description'>{{ room.description }}</text>
							<view class="room-card-specs">
								<view class='room-spec-chip' v-if='room.capacity'>
									<text class='room-spec-chip-text'>{{ room.capacity }}{{ i18n.t('hostel.person') }}</text>
								</view>
								<view class='room-spec-chip' v-if='room.bed_count'>
									<text class='room-spec-chip-text'>{{ room.bed_count }}{{ i18n.t('hostel.beds') }}</text>
								</view>
								<view class='room-spec-chip' v-if='room.room_size'>
									<text class='room-spec-chip-text'>{{ room.room_size }}m²</text>
								</view>
							</view>
							<view class="room-card-footer">
								<view class="room-card-price">
									<text class='room-price-from'>{{ i18n.t('hostel.perNight') }}</text>
									<view class="room-price-row">
										<text class='room-price-symbol'>฿</text>
										<text class='room-price-num'>{{ room.base_price }}</text>
									</view>
								</view>
								<view class='room-book-btn' :class="{ 'room-book-btn-disabled': !room.is_available }">
									<text class='room-book-btn-text'>{{ room.is_available ? i18n.t('hostel.book') : i18n.t('hostel.full') }}</text>
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

		<!-- 购物车浮窗 -->
		<view class="cart-float" v-if="cartCount > 0" @click="handleCartClick">
			<view class="cart-icon-wrapper">
				<image class="cart-icon" src="/static/icons/cart.svg" mode="aspectFit"></image>
				<view class="cart-badge">
					<text class="badge-text">{{ cartCount }}</text>
				</view>
			</view>
			<view class="cart-info">
				<view class="cart-price">
					<text class="price-symbol">฿</text>
					<text class="price-num">{{ cartTotal }}</text>
				</view>
			</view>
			<view class="cart-btn cart-btn-active">
				<text class="cart-btn-text">{{ i18n.t('dinein.checkout') }}</text>
			</view>
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
						<image class="spec-close-icon" src="/static/icons/close.svg" mode="aspectFit"></image>
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
							<view class="qty-btn" @click="changeSpecQuantity(-1)">
								<text class="qty-btn-text">-</text>
							</view>
							<text class="qty-num">{{ specQuantity }}</text>
							<view class="qty-btn" @click="changeSpecQuantity(1)">
								<text class="qty-btn-text">+</text>
							</view>
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
import { getConsumerCategories, getConsumerMenuItems } from '@/api/services/menu.js'
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
				banner: '/static/logo.png',
				logo: '/static/logo.png',
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
				if (this.categories.length === 0) return []
				if (this.activeCategory === -1) return []
				const catId = this.categories[this.activeCategory].id
				return this.allProducts.filter(p => p.category_id === catId)
			},
			weekDays() {
				return ['日', '一', '二', '三', '四', '五', '六']
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
					banner: currentStore.banner || '/static/logo.png',
					logo: currentStore.logo_url || currentStore.logo || '/static/logo.png',
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
				const [storeRes, catRes, itemsRes] = await Promise.allSettled([
					getStore(this.shopInfo.id),
					getConsumerCategories(this.shopInfo.id),
					getConsumerMenuItems(this.shopInfo.id)
				])

				// 门店详情：用API返回的完整数据覆盖
				if (storeRes.status === 'fulfilled' && storeRes.value.code === 0 && storeRes.value.data) {
					const s = storeRes.value.data
					this.shopInfo = {
						id: s.id,
						name: s.name,
						name_en: s.name_en || '',
						name_th: s.name_th || '',
						fullName: s.name,
						banner: s.background_image_url || s.banner_image || s.banner || '/static/logo.png',
						logo: s.logo_url || s.logo || '/static/logo.png',
						phone: s.phone || '',
						formatted_address: s.formatted_address || '',
						latitude: s.latitude,
						longitude: s.longitude,
						delivery_enabled: s.delivery_enabled || false,
						businessHours: s.config
							? `${s.config.opening_time?.slice(0, 5)}-${s.config.closing_time?.slice(0, 5)}`
							: (s.businessHours || '11:00-22:00'),
						distance: s.distance || '',
						bikeTime: s.bikeTime || '',
						walkTime: s.walkTime || '',
						address: s.address || '',
						business_types: s.business_types || []
					}

					// Detect hotel/hostel type - enable room tab
					const hostelTypes = ["HOTEL", "HOSTEL_ROOM", "HOSTEL_HOTPOT", "HOSTEL_COFFEE"]
					this.isHostel = s.business_types && s.business_types.some(t => hostelTypes.includes(t))
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

				// 分类列表
				if (catRes.status === 'fulfilled' && catRes.value.code === 0 && catRes.value.data) {
					this.categories = (catRes.value.data || []).map(c => ({
						id: c.id,
						nameKey: c.name,
						name_en: c.name_en || '',
						name_th: c.name_th || '',
						name: c.name,
						sortOrder: c.sort_order
					}))
				}

				// 商品列表
				if (itemsRes.status === 'fulfilled' && itemsRes.value.code === 0 && itemsRes.value.data) {
					const items = Array.isArray(itemsRes.value.data) ? itemsRes.value.data : (itemsRes.value.data.items || [])
					this.allProducts = items.map(item => this.normalizeProduct(item))
				}

			} catch (e) {
				console.error('loadStoreData error:', e)
			} finally {
				this.loading = false
			}
		},

		normalizeProduct(item) {
			const lang = i18n.getLanguage()
			const localizedName = lang === 'en' ? (item.name_en || item.name)
				: lang === 'th' ? (item.name_th || item.name)
				: item.name
			const localizedDesc = lang === 'en' ? (item.description_en || item.description)
				: lang === 'th' ? (item.description_th || item.description)
				: (item.description || '')
			return {
				id: item.id,
				name: localizedName,
				name_zh: item.name,
				description: localizedDesc || '',
				price: item.price,
				originalPrice: item.original_price || item.originalPrice || null,
				image: item.image_url || '/static/logo.png',
				category_id: item.category_id,
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
						this.hostelRooms = res.data.available_rooms || []
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
					url: `/pages/hostel/booking?roomId=${room.id}&roomName=${encodeURIComponent(room.name)}&roomPrice=${room.base_price}&checkIn=${this.hostelCheckIn}&checkOut=${this.hostelCheckOut}&nights=${this.hostelNights}&storeId=${this.shopInfo.id}&storeName=${encodeURIComponent(this.shopInfo.name)}&capacity=${room.capacity || 0}`
				})
			},

		goBack() {
			uni.navigateBack()
		},

		selectCategory(index) {
			this.activeCategory = index
		},

		handleProductClick(item) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${item.id}&name=${encodeURIComponent(item.name)}&price=${item.price}&image=${encodeURIComponent(item.image)}`
			})
		},

		handleAddToCart(item) {
			if (item.is_sold_out) {
				showToast('商品已售罄')
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
		},

		handleCartClick() {
			const productsStr = encodeURIComponent(JSON.stringify(this.cartItems))
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=dinein&shopId=${this.shopInfo.id || ''}&shopName=${encodeURIComponent(this.shopInfo.name)}&products=${productsStr}`
			})
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
				console.error('分享失败:', e)
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

		handleShareConfirm(shareInfo) {
			this.showShareModal = false
			showToast('欢迎光临！')
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
.room-card-name {
	font-size: 16px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.88);
	display: block;
	margin-bottom: 4px;
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
	flex-direction: column;
	gap: 2px;
}
.room-price-from {
	font-size: 11px;
	color: #949494;
}
.room-price-row {
	display: flex;
	align-items: baseline;
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

/* 购物车浮窗 */
.cart-float {
	position: fixed;
	bottom: 60px;
	left: 16px;
	right: 16px;
	height: 50px;
	background-color: #4B4B4B;
	border-radius: 25px;
	display: flex;
	align-items: center;
	padding: 0 8px;
	z-index: 100;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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

.cart-info {
	flex: 1;
	margin-left: 12px;
}

.cart-price {
	display: flex;
	align-items: baseline;
}

.cart-price .price-symbol {
	font-size: 12px;
	color: #FFFFFF;
}

.cart-price .price-num {
	font-size: 18px;
	font-weight: 700;
	color: #FFFFFF;
}

.cart-btn {
	background-color: rgba(255, 255, 255, 0.15);
	padding: 12px 20px;
	border-radius: 20px;
	transition: opacity 0.2s;
}

.cart-btn:active {
	opacity: 0.8;
}

.cart-btn-active {
	background-color: #F2B131;
}

.cart-btn-text {
	font-size: 12px;
	font-weight: 600;
	color: #FFFFFF;
}

/* 底部占位 */
.bottom-placeholder {
	height: 70px;
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

.spec-header {
	display: flex;
	align-items: flex-start;
	padding: 20px 16px 12px;
	gap: 12px;
	border-bottom: 1px solid #F5F5F5;
}

.spec-product-image {
	width: 80px;
	height: 80px;
	border-radius: 10px;
	flex-shrink: 0;
}

.spec-product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding-top: 4px;
}

.spec-product-price {
	display: flex;
	align-items: baseline;
}

.spec-price-symbol {
	font-size: 14px;
	font-weight: 600;
	color: #DA3300;
}

.spec-price-num {
	font-size: 24px;
	font-weight: 700;
	color: #DA3300;
}

.spec-product-name {
	font-size: 13px;
	color: #949494;
}

.spec-close {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: 16px;
	transition: background-color 0.2s;
}

.spec-close:active {
	background-color: #F5F5F5;
}

.spec-close-icon {
	width: 20px;
	height: 20px;
}

.spec-body {
	flex: 1;
	padding: 16px;
	max-height: 40vh;
}

.spec-group {
	margin-bottom: 20px;
}

.spec-group-label {
	font-size: 14px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.8);
	margin-bottom: 12px;
	display: block;
}

.spec-options {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.spec-option {
	padding: 8px 20px;
	border-radius: 20px;
	background-color: #F5F5F5;
	border: 1px solid transparent;
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
	font-size: 13px;
	color: rgba(0, 0, 0, 0.8);
}

.spec-option-active .spec-option-text {
	color: #F2B131;
	font-weight: 600;
}

.spec-qty-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 0;
	border-top: 1px solid #F5F5F5;
	margin-top: 8px;
}

.spec-qty-label {
	font-size: 14px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.8);
}

.spec-qty-control {
	display: flex;
	align-items: center;
	gap: 16px;
}

.spec-qty-control .qty-btn {
	width: 32px;
	height: 32px;
	border-radius: 16px;
	background-color: #F5F5F5;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s;
}

.spec-qty-control .qty-btn:active {
	background-color: #E8E8E8;
}

.spec-qty-control .qty-btn-text {
	font-size: 18px;
	color: rgba(0, 0, 0, 0.8);
}

.spec-qty-control .qty-num {
	font-size: 16px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.9);
	min-width: 24px;
	text-align: center;
}

.spec-footer {
	padding: 12px 16px;
	padding-bottom: calc(12px + env(safe-area-inset-bottom));
	border-top: 1px solid #F5F5F5;
}

.spec-confirm-btn {
	height: 44px;
	background-color: #F2B131;
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: opacity 0.2s;
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
