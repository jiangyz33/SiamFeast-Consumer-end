<template>
	<view class="hostel-page">
		<!-- 状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="nav-back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ shopInfo.name }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 主内容 -->
		<scroll-view class="main-scroll" scroll-y :style="{ height: scrollHeight + 'px' }">
			<!-- Hero Banner -->
			<view class="hero-banner">
				<image class="hero-img" :src="shopInfo.banner" mode="aspectFill"></image>
				<view class="hero-overlay">
					<view class="hero-badge">
						<text class="hero-badge-text">民宿</text>
					</view>
				</view>
			</view>

			<!-- 店铺信息 -->
			<view class="shop-info-section">
				<text class="shop-name">{{ shopInfo.fullName }}</text>
				<view class="shop-rating-row">
					<view class="stars">
						<text class="star" v-for="s in 5" :key="s">{{ s <= Math.round(shopInfo.rating) ? '★' : '☆' }}</text>
					</view>
					<text class="rating-num">{{ shopInfo.rating }}</text>
					<text class="rating-count"> · 128条评价</text>
				</view>
				<view class="shop-meta-row">
					<text class="shop-meta-text">{{ shopInfo.businessHours }}</text>
				</view>
				<view class="shop-address-row">
					<image class="address-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
					<text class="address-text">{{ shopInfo.address }}</text>
				</view>
			</view>

			<!-- 日期选择栏（美团风格：横向两栏 + 晚数） -->
			<view class="date-bar" @click="openDatePicker">
				<view class="date-bar-item">
					<text class="date-bar-label">入住</text>
					<text class="date-bar-value" :class="{ 'date-bar-placeholder': !checkInDate }">
						{{ checkInDate ? formatDateShort(checkInDate) : '请选择' }}
					</text>
					<text class="date-bar-week" v-if="checkInDate">{{ formatWeekday(checkInDate) }}</text>
				</view>
				<view class="date-bar-center">
					<view class="night-pill" v-if="nights > 0">
						<text class="night-pill-text">共{{ nights }}晚</text>
					</view>
					<view class="night-pill night-pill-empty" v-else>
						<text class="night-pill-text-empty">--晚</text>
					</view>
				</view>
				<view class="date-bar-item date-bar-right">
					<text class="date-bar-label">退房</text>
					<text class="date-bar-value" :class="{ 'date-bar-placeholder': !checkOutDate }">
						{{ checkOutDate ? formatDateShort(checkOutDate) : '请选择' }}
					</text>
					<text class="date-bar-week" v-if="checkOutDate">{{ formatWeekday(checkOutDate) }}</text>
				</view>
			</view>

			<!-- Tab 切换 -->
			<view class="tab-bar">
				<view
					v-for="(tab, i) in tabs"
					:key="i"
					class="tab-item"
					:class="{ 'tab-active': activeTab === i }"
					@click="switchTab(i)"
				>
					<text class="tab-text">{{ tab.name }}</text>
					<view class="tab-indicator" v-if="activeTab === i"></view>
				</view>
			</view>

				<!-- ========== 客房列表 ========== -->
				<view v-if="activeTab === 0" class="room-list">
					<view
						v-for="room in rooms"
						:key="room.id"
						class="room-card"
					>
						<!-- 房间图片 -->
						<view class="room-img-wrapper">
							<image class="room-img" :src="room.image || '/static/images/empty-room.svg'" mode="aspectFill"></image>
							<view class="room-status-mask" v-if="!room.is_available">
								<text class="room-status-text">已满</text>
							</view>
						</view>
						<!-- 房间信息 -->
						<view class="room-content">
						<view class="room-name-row">
							<text class="room-name">{{ room.name }}</text>
							<view class="spec-chip" v-if="room.capacity">
								<text class="spec-chip-text">{{ room.capacity }}人</text>
							</view>
						</view>
						<view class="room-spec-chips">
							<view class="spec-chip" v-if="room.bed_count">
								<text class="spec-chip-text">{{ room.bed_count }}床</text>
							</view>
							<view class="spec-chip" v-if="room.room_size">
								<text class="spec-chip-text">{{ room.room_size }}m²</text>
							</view>
						</view>
							<text class="room-desc" v-if="room.description">{{ room.description }}</text>
							<!-- 价格 & 预订 -->
							<view class="room-footer">
								<view class="room-price-box">
									<text class="price-val">฿{{ room.base_price }}</text>
									<text class="price-unit">/晚</text>
									<text class="price-total" v-if="nights > 0 && room.is_available">{{ nights }}晚 ฿{{ room.base_price * nights }}</text>
								</view>
								<view
									class="book-btn"
									:class="{ 'book-btn-off': !room.is_available || !isDateReady }"
									@click.stop="handleBook(room)"
								>
									<text class="book-btn-text">
										{{ !room.is_available ? '已满' : (!isDateReady ? '选日期' : '预订') }}
									</text>
								</view>
							</view>
						</view>
					</view>

					<view class="empty-box" v-if="rooms.length === 0 && !loading">
						<image class="empty-img" src="/static/images/empty-room.svg" mode="aspectFit"></image>
						<text class="empty-msg">{{ i18n.t("common.empty.room") }}</text>
						<text class="empty-msg-desc">{{ i18n.t("common.empty.roomDesc") }}</text>
					</view>
				</view>
			<!-- ========== 商品列表（动态分类） ========== -->
			<view v-if="activeTab > 0" class="product-list">
				<view v-for="item in currentProducts" :key="item.id" class="prod-card" @click="handleProductClick(item)">
					<image class="prod-img" :src="item.image" mode="aspectFill"></image>
					<view class="prod-body">
						<text class="prod-name">{{ item["name_" + i18n.getLanguage()] || item.name || item.name_en }}</text>
						<text class="prod-desc" v-if="item.description">{{ item.description }}</text>
						<view class="prod-bottom">
							<view class="prod-price">
								<text class="price-sym">฿</text>
								<text class="price-val">{{ item.price }}</text>
							</view>
							<view class="add-circle" @click.stop="handleAddToCart(item)">
								<text class="add-circle-text">+</text>
							</view>
						</view>
					</view>
				</view>
				<view class="empty-box" v-if="currentProducts.length === 0 && !loading">
					<text class="empty-msg">暂无商品</text>
				</view>
			</view>

			<view style="height: 100px;"></view>
		</scroll-view>

		<!-- 购物车浮窗 -->
		<view class="cart-float" v-if="activeTab !== 0 && cartCount > 0" @click="handleCartClick">
			<view class="cart-float-left">
				<view class="cart-float-icon-box">
					<image class="cart-float-icon" src="/static/icons/cart.svg" mode="aspectFit"></image>
					<view class="cart-float-badge">
						<text class="cart-float-badge-text">{{ cartCount }}</text>
					</view>
				</view>
				<view class="cart-float-price">
					<text class="price-sym-w">฿</text>
					<text class="price-val-w">{{ cartTotal }}</text>
				</view>
			</view>
			<view class="cart-float-btn">
				<text class="cart-float-btn-text">去结算</text>
			</view>
		</view>

		<!-- 日期选择弹窗（美团风格底部弹窗） -->
		<view class="dp-mask" v-if="showDatePicker" @click="closeDatePicker">
			<view class="dp-popup" @click.stop>
				<!-- 弹窗头部 -->
				<view class="dp-header">
					<text class="dp-title">选择入住日期</text>
					<view class="dp-close" @click="closeDatePicker">
						<text class="dp-close-text">✕</text>
					</view>
				</view>
				<!-- 选中状态摘要 -->
				<view class="dp-summary">
					<view class="dp-summary-item">
						<text class="dp-summary-label">入住</text>
						<text class="dp-summary-val" :class="{ 'dp-summary-active': checkInDate }">
							{{ checkInDate ? formatDateShort(checkInDate) : '待选择' }}
						</text>
					</view>
					<view class="dp-summary-mid">
						<view class="dp-summary-line"></view>
						<text class="dp-summary-nights" v-if="nights > 0">{{ nights }}晚</text>
					</view>
					<view class="dp-summary-item dp-summary-right">
						<text class="dp-summary-label">退房</text>
						<text class="dp-summary-val" :class="{ 'dp-summary-active': checkOutDate }">
							{{ checkOutDate ? formatDateShort(checkOutDate) : '待选择' }}
						</text>
					</view>
				</view>
				<!-- 日历 -->
				<scroll-view class="dp-calendar" scroll-y>
					<view v-for="(month, mi) in calendarMonths" :key="mi" class="dp-month-block">
						<text class="dp-month-label">{{ month.title }}</text>
						<view class="dp-week-header">
							<text class="dp-week-h" v-for="w in weekHeaders" :key="w">{{ w }}</text>
						</view>
						<view class="dp-day-grid">
							<view
								v-for="(day, di) in month.days"
								:key="di"
								class="dp-cell"
								:class="{
									'dp-cell-empty': !day,
									'dp-cell-past': day && day.disabled,
									'dp-cell-today': day && day.isToday,
									'dp-cell-in': day && day.date === checkInDate,
									'dp-cell-out': day && day.date === checkOutDate,
									'dp-cell-range': day && isInDayRange(day.date)
								}"
								@click="day && !day.disabled && onCalendarTap(day.date)"
							>
								<text v-if="day" class="dp-cell-num">{{ day.day }}</text>
								<text v-if="day && day.date === checkInDate" class="dp-cell-tag">入住</text>
								<text v-if="day && day.date === checkOutDate" class="dp-cell-tag">退房</text>
								<text v-if="day && day.isToday && day.date !== checkInDate && day.date !== checkOutDate" class="dp-cell-tag dp-cell-tag-today">今天</text>
							</view>
						</view>
					</view>
					<!-- 确认按钮（选完退房日期后出现） -->
					<view class="dp-confirm-area" v-if="checkInDate && checkOutDate">
						<view class="dp-confirm-btn" @click="confirmDateSelection">
							<text class="dp-confirm-text">确认 · {{ nights }}晚</text>
						</view>
					</view>
					<view style="height: 30px;"></view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import appStore from '@/store/index.js'
import { getRooms, getAvailableRooms } from '@/api/services/hostel.js'
import { getStore } from '@/api/services/store.js'
import footprintManager from '@/utils/footprint.js'
import { getConsumerCategories, getConsumerMenuItems, } from '@/api/services/menu.js'
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'

export default {
	data() {
		return {
			statusBarHeight: 20,
			scrollHeight: 600,
			loading: false,
			activeTab: 0,
			storeId: null,
			// 店铺
			shopInfo: {
				name: '暹罗民宿',
				fullName: '暹罗民宿·曼谷店',
				banner: '/static/images/banner-placeholder.svg',
				rating: 4.8,
				businessHours: '24小时',
				address: '123 Sukhumvit Rd, Bangkok'
			},
			// Tab
			tabs: [
				{ name: '客房', key: 'room' }
			],
			// 数据
			rooms: [],
			activeCategory: 0,
			// 购物车
			cartItems: [],
				i18n: i18n,
				allProducts: [],
				categories: [],
			// 日期
			showDatePicker: false,
			checkInDate: '',
			checkOutDate: '',
			calendarMonths: [],
			weekHeaders: ['日', '一', '二', '三', '四', '五', '六']
		}
	},
	computed: {
		currentProducts() {
			if (this.activeTab === 0) return []
			return this.allProducts
		},
		nights() {
			if (!this.checkInDate || !this.checkOutDate) return 0
			const diff = new Date(this.checkOutDate).getTime() - new Date(this.checkInDate).getTime()
			return diff > 0 ? Math.round(diff / 86400000) : 0
		},
		isDateReady() {
			return this.checkInDate && this.checkOutDate && this.nights > 0
		},
		cartCount() {
			return this.cartItems.reduce((s, i) => s + i.quantity, 0)
		},
		cartTotal() {
			return this.cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
		}
	},
	onLoad(options) {
		this.initLayout()
		this.storeId = options.storeId || options.store_id || null
		if (this.storeId) {
			this.loadRooms()
			this.loadMenuData()
		} else {
			this.loadDemoData()
		}
	},
	methods: {
		initLayout() {
			const sys = uni.getSystemInfoSync()
			this.statusBarHeight = sys.statusBarHeight || 0
			const wh = sys.windowHeight || sys.screenHeight || 700
			this.scrollHeight = Math.max(wh - this.statusBarHeight - 44, 400)
		},

		// ===== 日期格式化 =====
		formatDateShort(dateStr) {
			if (!dateStr) return ''
			const d = new Date(dateStr)
			return `${d.getMonth() + 1}月${d.getDate()}日`
		},
		formatWeekday(dateStr) {
			if (!dateStr) return ''
			return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(dateStr).getDay()]
		},

		// ===== 日历 =====
		openDatePicker() {
			this.buildCalendar()
			this.showDatePicker = true
		},
		closeDatePicker() {
			this.showDatePicker = false
		},
		confirmDateSelection() {
			this.showDatePicker = false
		},
		buildCalendar() {
			const months = []
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			for (let m = 0; m < 6; m++) {
				const y = today.getFullYear() + Math.floor((today.getMonth() + m) / 12)
				const mo = (today.getMonth() + m) % 12
				const first = new Date(y, mo, 1)
				const last = new Date(y, mo + 1, 0)
				const days = []
				for (let i = 0; i < first.getDay(); i++) days.push(null)
				for (let d = 1; d <= last.getDate(); d++) {
					const dt = new Date(y, mo, d)
					dt.setHours(0, 0, 0, 0)
					days.push({
						day: d,
						date: `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
						disabled: dt < today,
						isToday: dt.getTime() === today.getTime()
					})
				}
				months.push({ title: `${y}年${mo + 1}月`, days })
			}
			this.calendarMonths = months
		},
		onCalendarTap(dateStr) {
			if (!this.checkInDate || (this.checkInDate && this.checkOutDate)) {
				// 开始新一轮选择
				this.checkInDate = dateStr
				this.checkOutDate = ''
			} else {
				// 已有入住日期，选退房
				if (new Date(dateStr) <= new Date(this.checkInDate)) {
					this.checkInDate = dateStr
					this.checkOutDate = ''
				} else {
					this.checkOutDate = dateStr
					// Dates complete, reload rooms with new date range
					this.loadRooms()
				}
			}
		},
		isInDayRange(dateStr) {
			if (!this.checkInDate || !this.checkOutDate) return false
			const t = new Date(dateStr).getTime()
			return t > new Date(this.checkInDate).getTime() && t < new Date(this.checkOutDate).getTime()
		},

		// ===== 数据加载 =====
		async loadRooms() {
			if (!this.storeId) return
			try {
				this.loading = true
				// Use available rooms API (C-end accessible), fallback to demo
				const checkIn = this.checkInDate || this.getDefaultDate(0)
				const checkOut = this.checkOutDate || this.getDefaultDate(1)
				const res = await getAvailableRooms(this.storeId, {
					check_in_date: checkIn,
					check_out_date: checkOut
				})
				if (res.code === 0 && res.data) {
					const d = res.data
					const rawRooms = Array.isArray(d) ? d : (d.data || d.available_rooms || d.rooms || [])
					this.rooms = rawRooms.map(r => ({
						id: r.id,
						name: r.room_type_name || r.name || ('Room ' + r.room_number),
						room_number: r.room_number,
						floor: r.floor,
						base_price: r.base_price,
						capacity: r.max_guests || r.capacity || 0,
						bed_count: r.bed_count || 0,
						room_size: r.area_sqm || r.room_size || 0,
						description: r.description || '',
						is_available: r.status === 'AVAILABLE' || r.is_available === true,
						image: r.cover_image || r.image || '/static/images/img-placeholder.svg',
						tags: r.amenities || r.tags || []
					}))
				}
				if (this.rooms.length === 0) {
					try {
						const fallbackRes = await getRooms(this.storeId)
						if (fallbackRes.code === 0 && fallbackRes.data) {
						const fd = fallbackRes.data
						const rawFd = Array.isArray(fd) ? fd : (fd.data || fd.rooms || fd.available_rooms || [])
						this.rooms = rawFd.map(r => ({
							id: r.id,
							name: r.room_type_name || r.name || ('Room ' + r.room_number),
							room_number: r.room_number,
							base_price: r.base_price || r.price_per_night || 0,
							capacity: r.max_guests || r.capacity || 0,
							is_available: r.status === 'AVAILABLE' || r.is_available === true,
							image: r.cover_image || r.image || '/static/images/img-placeholder.svg',
							description: r.description || ''
						}))
					}
					} catch (e2) {
						this.loadDemoData()
					}
				}
			} catch (e) {
				console.log('加载客房失败，使用Demo:', e)
				this.loadDemoData()
			} finally {
				this.loading = false
			}
		},
		getDefaultDate(offsetDays) {
			const d = new Date()
			d.setDate(d.getDate() + offsetDays)
			return d.toISOString().slice(0, 10)
		},
		async loadMenuData() {
				if (!this.storeId) return
				try {
					// Step 1: Load store first to get business_types
					const storeRes = await getStore(this.storeId)
					let storeBusinessTypes = []

					if (storeRes.code === 0 && storeRes.data) {
						const s = storeRes.data
						storeBusinessTypes = s.business_types || []
						this.shopInfo = {
							...this.shopInfo,
							name: s.name,
							fullName: s.name,
							banner: s.banner_image || s.background_image_url || '/static/images/banner-placeholder.svg',
							phone: s.phone || '',
							address: s.formatted_address || s.address || this.shopInfo.address,
							businessHours: s.config
								? `${(s.config.opening_time||'').slice(0,5)}-${(s.config.closing_time||'').slice(0,5)}`
								: this.shopInfo.businessHours
						}
					}

					// 记录民宿门店浏览足迹
					if (this.shopInfo && this.shopInfo.id) {
						footprintManager.addStoreFootprint({
							id: this.shopInfo.id,
							name: this.shopInfo.name,
							logo: this.shopInfo.logo,
							address: this.shopInfo.address,
							rating: this.shopInfo.rating || 4.5,
							status: this.shopInfo.status || 'OPEN',
							businessHours: this.shopInfo.businessHours
						})
					}

						// Step 2: Load categories from global categories API
						await this.loadFallbackCategories(storeBusinessTypes)
					// 动态构建 tabs: 客房 + 各分类
					this.tabs = [
						{ name: '客房', key: 'room' },
						...this.categories.map(c => ({ name: c.name, key: 'cat_' + c.id }))
					]

					// Load products for first category tab after categories are ready
					if (this.categories.length > 0) {
						this.loadCategoryProducts()
					}
				} catch (e) {
					console.error('loadMenuData error:', e)
				}
			},

			async loadFallbackCategories(storeBusinessTypes) {
				const categoryBusinessType = this.mapBusinessType(storeBusinessTypes)
				const catRes = await getConsumerCategories(categoryBusinessType)
				if (catRes.code === 0 && catRes.data) {
					const catData = Array.isArray(catRes.data) ? catRes.data : (catRes.data.items || [])
					this.categories = catData.map(c => ({
						id: c.id,
						name: c.name,
						name_en: c.name_en || '',
						name_th: c.name_th || ''
					}))
				}
			},

			// Map store business_types to category business_type filter
			mapBusinessType(businessTypes) {
				if (!businessTypes || !businessTypes.length) return null
				if (businessTypes.some(t => t.includes('HOTPOT'))) return 'hotpot'
				if (businessTypes.some(t => t.includes('MALATANG'))) return 'malatang'
				return 'standard'
			},

		async loadCategoryProducts() {
			if (this.activeTab === 0 || this.categories.length === 0) return
			const catIndex = this.activeTab - 1
			if (catIndex >= this.categories.length) return
			const catId = this.categories[catIndex].id
			try {
				const res = await getConsumerMenuItems(this.storeId, { store_menu_category_id: catId })
				if (res.code === 0 && res.data) {
					const items = Array.isArray(res.data) ? res.data : (res.data.items || [])
					this.allProducts = items.map(item => ({
						id: item.id,
						name: item["name_" + i18n.getLanguage()] || item.name || item.name_en,
						description: item.description || '',
						price: item.price,
						image: item.image_url || '/static/images/img-placeholder.svg',
						category_id: item.category_id,
						store_menu_category_id: item.store_menu_category_id,
						business_type: item.business_type || '',
						tags: item.tags || [],
						is_sold_out: item.is_sold_out || false,
						specs_config: item.specs_config || {}
					}))
				}
			} catch (e) {
				console.error("loadCategoryProducts error:", e)
			}
		},

		loadDemoData() {
			this.rooms = [
				{ id: 1, name: '豪华大床房', description: '舒适宽敞，配备独立卫浴，城市景观', base_price: 899, capacity: 2, bed_count: 1, room_size: 35, is_available: true, image: '/static/images/img-placeholder.svg', tags: ['独立卫浴', 'WiFi', '城景'] },
				{ id: 2, name: '标准双床房', description: '两张单人床，适合朋友出行', base_price: 699, capacity: 2, bed_count: 2, room_size: 30, is_available: true, image: '/static/images/img-placeholder.svg', tags: ['双床', 'WiFi'] },
				{ id: 3, name: '家庭套房', description: '宽敞舒适，独立客厅，适合家庭', base_price: 1299, capacity: 4, bed_count: 2, room_size: 55, is_available: false, image: '/static/images/img-placeholder.svg', tags: ['独立卫浴', '客厅', '家庭'] }
			]
		},

		// ===== 交互 =====
		switchTab(i) { this.activeTab = i; this.loadCategoryProducts() },
		scrollToRooms() { this.activeTab = 0 },
		goBack() { uni.navigateBack() },
		handleMyBookings() { uni.showToast({ title: '开发中', icon: 'none' }) },
		handleProductClick(item) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${item.id}&name=${encodeURIComponent(item.name)}&price=${item.price}&image=${encodeURIComponent(item.image)}`
			})
		},
		handleCartClick() {
			if (this.cartItems.length === 0) return
			const cartData = encodeURIComponent(JSON.stringify(this.cartItems.map(c => ({
				id: c.id, name: c.name, price: c.price, quantity: c.quantity, image: c.image
			}))))
			uni.navigateTo({
				url: `/pages/checkout/index?storeId=${this.storeId || ''}&order_type=dinein&cart_items=${cartData}`
			})
		},
		handleAddToCart(item) {
			const ex = this.cartItems.find(c => c.id === item.id)
			if (ex) ex.quantity++
			else this.cartItems.push({ ...item, quantity: 1 })
		},
		handleBook(room) {
			if (!room.is_available) {
				uni.showToast({ title: '该房间已满', icon: 'none' })
				return
			}
			if (!this.isDateReady) {
				this.openDatePicker()
				return
			}
			uni.navigateTo({
				url: `/pages/hostel/booking?roomId=${room.id}&roomName=${encodeURIComponent(room["name_" + i18n.getLanguage()] || room.name)}&roomPrice=${room.base_price}&roomImage=${encodeURIComponent(room.image || '')}&checkIn=${this.checkInDate}&checkOut=${this.checkOutDate}&nights=${this.nights}&storeId=${this.storeId || ''}&storeName=${encodeURIComponent(this.shopInfo["name_" + i18n.getLanguage()] || this.shopInfo.fullName)}&capacity=${room.capacity || 0}`
			})
		}
	}
}
</script>

<style scoped>
/* ===== 基础布局 ===== */
.hostel-page {
	min-height: 100vh;
	background: #F5F5F5;
	display: flex;
	flex-direction: column;
}
.status-bar { background: #fff; }
.nav-bar {
	height: 44px;
	background: #fff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	border-bottom: 1rpx solid #F0F0F0;
}
.nav-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.nav-back-icon { width: 22px; height: 22px; }
.nav-title { font-size: 17px; font-weight: 700; color: #1A1A1A; }
.nav-right { width: 32px; }
.main-scroll { flex: 1; }

/* ===== Hero Banner ===== */
.hero-banner { position: relative; width: 100%; height: 200px; }
.hero-img { width: 100%; height: 100%; }
.hero-overlay {
	position: absolute; left: 0; right: 0; bottom: 0;
	padding: 12px 16px;
	background: linear-gradient(transparent, rgba(0,0,0,0.4));
	display: flex; justify-content: space-between; align-items: flex-end;
}
.hero-badge {
	background: rgba(255,255,255,0.9);
	border-radius: 4px;
	padding: 2px 8px;
}
.hero-badge-text { font-size: 11px; color: #FFB800; font-weight: 600; }
/* ===== 店铺信息 ===== */
.shop-info-section {
	background: #fff;
	padding: 16px;
	margin-bottom: 8px;
}
.shop-name { font-size: 20px; font-weight: 700; color: #1A1A1A; }
.shop-rating-row { display: flex; align-items: center; margin-top: 8px; gap: 4px; }
.star { font-size: 14px; color: #FFB800; }
.rating-num { font-size: 14px; font-weight: 600; color: #FFB800; }
.rating-count { font-size: 12px; color: #999; }
.shop-meta-row { display: flex; align-items: center; margin-top: 8px; }
.shop-meta-text { font-size: 12px; color: #666; }
.shop-address-row { display: flex; align-items: center; margin-top: 8px; gap: 4px; }
.address-icon { width: 14px; height: 14px; flex-shrink: 0; }
.address-text { font-size: 12px; color: #666; }

/* ===== 日期选择栏 ===== */
.date-bar {
	display: flex;
	align-items: center;
	background: #fff;
	padding: 14px 16px;
	margin-bottom: 8px;
}
.date-bar-item { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.date-bar-right { align-items: flex-end; }
.date-bar-label { font-size: 11px; color: #999; }
.date-bar-value { font-size: 17px; font-weight: 700; color: #1A1A1A; }
.date-bar-placeholder { color: #ccc; }
.date-bar-week { font-size: 11px; color: #999; }
.date-bar-center { display: flex; align-items: center; padding: 0 16px; }
.night-pill {
	background: #FFB800;
	border-radius: 12px;
	padding: 3px 12px;
}
.night-pill-text { font-size: 12px; color: #fff; font-weight: 500; }
.night-pill-empty {
	background: #F0F0F0;
	border-radius: 12px;
	padding: 3px 12px;
}
.night-pill-text-empty { font-size: 12px; color: #ccc; }

/* ===== Tab 切换 ===== */
.tab-bar {
	display: flex;
	background: #fff;
	padding: 0 16px;
	border-bottom: 1rpx solid #F0F0F0;
}
.tab-item {
	padding: 12px 0;
	margin-right: 28px;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.tab-text { font-size: 15px; color: #999; font-weight: 500; }
.tab-active .tab-text { color: #1A1A1A; font-weight: 700; }
.tab-indicator {
	width: 20px; height: 3px;
	background: #FFB800;
	border-radius: 2px;
	margin-top: 6px;
}

	/* ===== 客房卡片 ===== */
	.room-list { padding: 8px 16px 0; }
	.room-card {
		background: #fff;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	}
	.room-img-wrapper {
		width: 100%;
		height: 180px;
		position: relative;
	}
	.room-img { width: 100%; height: 100%; }
	.room-status-mask {
		position: absolute; top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.45);
		display: flex; align-items: center; justify-content: center;
		border-radius: 12px 12px 0 0;
	}
	.room-status-text { font-size: 15px; color: #fff; font-weight: 600; letter-spacing: 2px; }
	.room-content { padding: 12px 14px 14px; }
	.room-name-row { display: flex; align-items: center; gap: 8px; }
	.room-name { font-size: 16px; font-weight: 700; color: #1A1A1A; }
	.room-spec-chips {
		display: flex;
		gap: 8px;
		margin-top: 8px;
	}
	.spec-chip {
		background: #F5F5F5;
		border-radius: 4px;
		padding: 3px 8px;
	}
	.spec-chip-text { font-size: 11px; color: #666; font-weight: 500; }
	.room-desc {
		font-size: 12px;
		color: #999;
		margin-top: 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.room-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 12px;
		padding-top: 10px;
		border-top: 1rpx solid #F0F0F0;
	}
	.room-price-box { display: flex; align-items: baseline; gap: 2px; flex-wrap: wrap; }
	.price-val { font-size: 20px; color: #FFB800; font-weight: 700; }
	.price-unit { font-size: 11px; color: #999; }
	.price-total { font-size: 11px; color: #999; margin-left: 6px; }
	.book-btn {
		background: #FFB800;
		border-radius: 18px;
		padding: 7px 20px;
		flex-shrink: 0;
	}
	.book-btn-off { background: #ccc; }
	.book-btn-text { font-size: 13px; color: #fff; font-weight: 600; }

/* ===== 商品列表 ===== */
.product-list { padding: 8px 12px 0; }
.prod-card {
	display: flex;
	background: #fff;
	border-radius: 12px;
	overflow: hidden;
	margin-bottom: 8px;
}
.prod-img { width: 100px; height: 100px; flex-shrink: 0; }
.prod-body { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; }
.prod-name { font-size: 14px; font-weight: 600; color: #1A1A1A; }
.prod-desc { font-size: 12px; color: #999; margin-top: 2px; }
.prod-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.prod-price { display: flex; align-items: baseline; gap: 1px; }
.add-circle {
	width: 26px; height: 26px;
	background: #FFB800;
	border-radius: 13px;
	display: flex; align-items: center; justify-content: center;
}
.add-circle-text { font-size: 16px; color: #fff; font-weight: 600; line-height: 1; }

/* ===== 空状态 ===== */
.empty-box { display: flex; flex-direction: column; align-items: center; padding: 40px 0; }
.empty-img { width: 60px; height: 60px; margin-bottom: 8px; }
.empty-msg { font-size: 14px; color: #333; font-weight: 500; margin-bottom: 6px; }
.empty-msg-desc { font-size: 12px; color: #999; }

/* ===== 购物车浮窗 ===== */
.cart-float {
	position: fixed;
	left: 12px; right: 12px; bottom: 56px;
	height: 50px;
	background: #2D2D2D;
	border-radius: 25px;
	display: flex;
	align-items: center;
	padding: 0 5px 0 12px;
	z-index: 100;
}
.cart-float-left { display: flex; align-items: center; flex: 1; }
.cart-float-icon-box { position: relative; margin-right: 10px; }
.cart-float-icon { width: 26px; height: 26px; }
.cart-float-badge {
	position: absolute; top: -5px; right: -5px;
	background: #E74C3C;
	border-radius: 10px;
	min-width: 16px; height: 16px;
	display: flex; align-items: center; justify-content: center;
}
.cart-float-badge-text { font-size: 10px; color: #fff; }
.cart-float-price { display: flex; align-items: baseline; gap: 1px; }
.price-sym-w { font-size: 12px; color: #fff; font-weight: 600; }
.price-val-w { font-size: 18px; color: #fff; font-weight: 700; }
.cart-float-btn {
	background: #FFB800;
	border-radius: 20px;
	padding: 8px 20px;
}
.cart-float-btn-text { font-size: 13px; color: #fff; font-weight: 600; }

/* ===== 日期选择弹窗 ===== */
.dp-mask {
	position: fixed; top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0,0,0,0.5);
	z-index: 999;
	display: flex; align-items: flex-end;
}
.dp-popup {
	width: 100%;
	max-height: 75vh;
	background: #fff;
	border-radius: 16px 16px 0 0;
	display: flex; flex-direction: column;
}
.dp-header {
	display: flex; align-items: center; justify-content: space-between;
	padding: 16px;
	border-bottom: 1rpx solid #F0F0F0;
}
.dp-title { font-size: 16px; font-weight: 700; color: #1A1A1A; }
.dp-close { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
.dp-close-text { font-size: 16px; color: #999; }

/* 弹窗内摘要 */
.dp-summary {
	display: flex; align-items: center;
	padding: 12px 16px;
	background: #FAFAFA;
}
.dp-summary-item { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.dp-summary-right { align-items: flex-end; }
.dp-summary-label { font-size: 11px; color: #999; }
.dp-summary-val { font-size: 15px; font-weight: 600; color: #ccc; }
.dp-summary-active { color: #FFB800; }
.dp-summary-mid { display: flex; flex-direction: column; align-items: center; padding: 0 16px; gap: 4px; }
.dp-summary-line { width: 30px; height: 1px; background: #ddd; }
.dp-summary-nights { font-size: 11px; color: #FFB800; font-weight: 600; }

/* 日历 */
.dp-calendar { flex: 1; max-height: 60vh; padding: 0 16px; }
.dp-month-block { margin-bottom: 16px; }
.dp-month-label { font-size: 14px; font-weight: 600; color: #1A1A1A; text-align: center; display: block; margin-bottom: 8px; margin-top: 12px; }
.dp-week-header { display: flex; margin-bottom: 4px; }
.dp-week-h { width: calc(100% / 7); text-align: center; font-size: 11px; color: #bbb; }
.dp-day-grid { display: flex; flex-wrap: wrap; }
.dp-cell {
	width: calc(100% / 7);
	height: 50px;
	display: flex; flex-direction: column;
	align-items: center; justify-content: center;
	position: relative;
	border-radius: 4px;
}
.dp-cell-empty { visibility: hidden; }
.dp-cell-num { font-size: 15px; color: #333; }
.dp-cell-tag { font-size: 9px; color: #fff; margin-top: 1px; }
.dp-cell-tag-today { color: #FFB800; }

/* 过去的日期 */
.dp-cell-past { opacity: 0.25; }
.dp-cell-past .dp-cell-num { color: #ccc; }
/* 今天 */
.dp-cell-today .dp-cell-num { color: #FFB800; font-weight: 700; }
/* 入住 */
.dp-cell-in { background: #FFB800; border-radius: 20px 4px 4px 20px; }
.dp-cell-in .dp-cell-num { color: #fff; }
/* 退房 */
.dp-cell-out { background: #FFB800; border-radius: 4px 20px 20px 4px; }
.dp-cell-out .dp-cell-num { color: #fff; }
/* 范围 */
.dp-cell-range { background: #FFF8E1; }
.dp-cell-range .dp-cell-num { color: #FFB800; }

/* 确认按钮 */
.dp-confirm-area { padding: 16px 0 8px; }
.dp-confirm-btn {
	background: #FFB800;
	border-radius: 24px;
	padding: 12px;
	text-align: center;
}
.dp-confirm-text { font-size: 16px; color: #fff; font-weight: 600; }
</style>
