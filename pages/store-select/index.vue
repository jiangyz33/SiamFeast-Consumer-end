<template>
	<view class="store-select-page">
		<!-- 上半部分：地图区域 -->
		<view class="map-section">
			<!-- 状态栏占位 -->
			<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

			<!-- 导航栏 -->
			<view class="nav-bar">
				<view class="nav-back" @click="goBack">
					<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
				</view>
				<text class="nav-title">{{ i18n.t('storeSelect.title') }}</text>
				<view class="nav-right"></view>
			</view>

			<!-- 搜索栏 -->
			<view class="search-bar" :class="{ 'pac-container-parent': true }">
				<image class="search-icon" src="/static/icons/search.svg" mode="aspectFit"></image>
				<!-- #ifdef H5 -->
				<view class="h5-input-wrapper">
					<input
						class="h5-search-input"
						v-model="searchText"
						ref="h5SearchInput"
						id="places-search-input"
						:placeholder="i18n.t('storeSelect.searchPlaceholder') || '搜索地址'"
					/>
				</view>
				<!-- #endif -->
				<!-- #ifndef H5 -->
				<input
					class="search-input"
					:placeholder="i18n.t('storeSelect.searchPlaceholder') || '搜索地址'"
					v-model="searchText"
					@confirm="onSearchConfirm"
				/>
				<!-- #endif -->
				<view class="search-clear" v-if="searchText" @click="clearSearch">
					<text class="clear-text">✕</text>
				</view>
			</view>

			<!-- 地图模式切换 -->
			<view class="map-mode-bar">
				<view class="mode-btn" :class="{ 'mode-active': !pickMode }" @click="setMode('normal')">
					<image class="mode-icon" src="/static/icons/my-location.svg" mode="aspectFit"></image>
					<text class="mode-text">{{ i18n.t('storeSelect.gpsMode') || 'GPS定位' }}</text>
				</view>
				<view class="mode-btn" :class="{ 'mode-active': pickMode }" @click="setMode('pick')">
					<image class="mode-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
					<text class="mode-text">{{ i18n.t('storeSelect.pickMode') || '地图选点' }}</text>
				</view>
			</view>

			<!-- 地图容器 -->
			<view class="map-container" :style="{ height: mapHeight + 'px' }">
				<google-map
					ref="gmap"
					:latitude="currentLocation.latitude"
					:longitude="currentLocation.longitude"
					:markers="mapMarkers"
					:zoom="14"
					:show-user-location="!pickMode"
					:enable-pick-mode="pickMode"
					@marker-click="onMapMarkerClick"
					@map-click="onMapClick"
					@drag-end="onMapDragEnd"
				></google-map>
			</view>
		</view>

		<!-- 下半部分：门店列表 -->
		<view class="store-list-section">
			<!-- 当前定位信息 -->
			<view class="location-info">
				<image class="location-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
				<view class="location-text-wrapper">
					<text class="location-label">{{ i18n.t('storeSelect.currentLocation') }}</text>
					<text class="location-address">{{ currentAddress || i18n.t('storeSelect.locating') }}</text>
				</view>
				<view class="refresh-btn" :class="{ 'refreshing': isLocating }" @click="refreshLocation">
					<image class="refresh-icon" src="/static/icons/refresh.svg" mode="aspectFit"></image>
				</view>
			</view>

			<!-- 门店列表标题 -->
			<view class="list-header">
				<text class="list-title">{{ i18n.t('storeSelect.nearbyStores') }}</text>
				<text class="list-count">{{ i18n.t('storeSelect.storeCount', { count: stores.length }) }}</text>
			</view>

			<!-- 门店列表 -->
			<scroll-view class="store-list" scroll-y :style="{ height: listHeight + 'px' }">
				<view
					v-for="(store, index) in stores"
					:key="store.store_id"
					class="store-item"
					:class="{ 'store-selected': selectedStoreId === store.store_id }"
					@click="handleStoreClick(store)"
				>
					<view class="store-main">
						<view class="store-left">
							<image class="store-logo" :src="fixMinioUrl(store.logo_url || store.logo) || '/static/images/store-placeholder.svg'" mode="aspectFill"></image>
						</view>
						<view class="store-info">
							<view class="store-header">
								<text class="store-name">{{ store['name_' + i18n.getLanguage()] || store.store_name }}</text>
								<view class="store-status" :class="store.is_open ? 'status-open' : 'status-closed'">
									<text class="status-text">{{ store.is_open ? i18n.t('storeSelect.open') : i18n.t('storeSelect.closed') }}</text>
								</view>
							</view>
							<view class="store-rating">
								


								<text class="business-hours">{{ store.business_hours }}</text>
							</view>
							<view class="store-tags">
								<text class="tag" v-for="(type, idx) in getBusinessTypeText(store.business_types)" :key="idx">{{ type }}</text>
							</view>
						</view>
					</view>
					<view class="store-footer">
						<view class="distance-info">
							<image class="distance-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
							<text class="distance-text" v-if="store.distance_text">{{ store.distance_text }}</text>
							<text class="eta-text" v-if="store.eta_min && store.eta_min > 0">~{{ store.eta_min }}min</text>
								<text class="address-text" v-if="store.formatted_address">{{ store.formatted_address }}</text>
						</view>
						<view class="store-meta">
							<text class="delivery-fee" v-if="store.is_deliverable && store.delivery_fee > 0">฿{{ store.delivery_fee }} delivery</text>
							<text class="delivery-badge" v-if="store.is_deliverable">Deliverable</text>
						</view>
						<view class="select-btn" v-if="selectedStoreId === store.store_id">
							<text class="select-text">{{ i18n.t('storeSelect.selected') }}</text>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view class="empty-state" v-if="stores.length === 0 && !isLoading">
					<image class="empty-icon" src="/static/images/empty-store.svg" mode="aspectFit"></image>
					<text class="empty-title">{{ i18n.t('common.empty.store') }}</text>
					<text class="empty-desc">{{ i18n.t('common.empty.storeDesc') }}</text>
				</view>

				<!-- 加载状态 -->
				<view class="loading-state" v-if="isLoading">
					<text class="loading-text">{{ i18n.t('storeSelect.locating') }}</text>
				</view>

				<!-- 底部占位 -->
				<view class="bottom-placeholder"></view>
			</scroll-view>
		</view>

		<!-- 底部确认按钮 -->
		<view class="bottom-bar">
			<view class="confirm-btn" :class="{ 'btn-disabled': !selectedStoreId }" @click="confirmSelect">
				<text class="confirm-text">{{ i18n.t('storeSelect.confirmSelect') }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { showToast, fixMinioUrl } from '@/utils/index.js'
import {
	getUserLocation,
	reverseGeocode,
	createAutocompleteSessionToken,
	fetchPlaceDetails
} from '@/utils/location.js'
import { getNearbyStores, resolvePlace } from '@/api/services/location.js'
import { getStores } from '@/api/services/store.js'
import { GOOGLE_MAPS_API_KEY } from '@/api/config.js'
import GoogleMap from '@/components/google-map.vue'
import i18n from '@/i18n/index.js'

export default {
	components: {
		GoogleMap
	},
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			mapHeight: 280,
			listHeight: 300,
			currentLocation: {
				latitude: 13.7563,
				longitude: 100.5018
			},
			currentAddress: '',
			selectedStoreId: null,
			stores: [],
			allStores: [],
			mapMarkers: [],
			lastClickStoreId: null,
			lastClickTime: 0,
			searchText: '',
			isLocating: false,
			isLoading: false,
			// 地图选点模式
			pickMode: false,
			// 位置来源追踪
			locationSource: 'CURRENT_GPS',
			// Places 相关 (H5)
			// #ifdef H5
			autocomplete: null,
			sessionToken: null,
			// #endif
			// 选中地点的 place_id
			selectedPlaceId: null,
			// 分页
			page: 1,
			pageSize: 20
		}
	},
	onLoad(options) {
		this.initPage()

		if (options.currentStoreId) {
			this.selectedStoreId = parseInt(options.currentStoreId)
		}

		// 如果传入了坐标，优先使用
		if (options.latitude && options.longitude) {
			this.currentLocation = {
				latitude: parseFloat(options.latitude),
				longitude: parseFloat(options.longitude)
			}
		}

		this.initLocation()
	},
	// #ifdef H5
	mounted() {
		this.$nextTick(() => {
			this.initAutocomplete()
		})
	},
	// #endif
	methods: {
		fixMinioUrl,
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20

			const navBarHeight = 44
			const searchBarHeight = 44
			const modeBarHeight = 36
			const bottomBarHeight = 64
			const locationInfoHeight = 70
			const listHeaderHeight = 44
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0

			this.mapHeight = Math.floor(
				(systemInfo.windowHeight - navBarHeight - searchBarHeight - modeBarHeight - bottomBarHeight - safeAreaBottom - this.statusBarHeight) * 0.35
			)
			this.listHeight = systemInfo.windowHeight - this.statusBarHeight - navBarHeight - searchBarHeight - modeBarHeight - this.mapHeight - bottomBarHeight - locationInfoHeight - listHeaderHeight - safeAreaBottom
		},

		goBack() {
			uni.navigateBack()
		},

		// ===================== 场景一：GPS定位 (文档 4.1) =====================

		async initLocation() {
			this.isLocating = true
			this.locationSource = 'CURRENT_GPS'
			this.selectedPlaceId = null
			try {
				const loc = await getUserLocation()
				this.currentLocation = {
					latitude: loc.latitude,
					longitude: loc.longitude
				}
				if (loc.address) {
					this.currentAddress = loc.address
				}
			} catch (e) {
				console.warn('定位失败，使用默认位置:', e)
			} finally {
				this.isLocating = false
			}
			await this.loadNearbyStores()
		},

		async refreshLocation() {
			if (this.isLocating) return
			// 回到 GPS 模式
			this.pickMode = false
			await this.initLocation()
		},

		// ===================== 场景二：手动输入地址 (文档 4.2) =====================
		// Places Autocomplete (New) + sessionToken + Place Details (New)

		// #ifdef H5
		initAutocomplete() {
			if (!GOOGLE_MAPS_API_KEY) {
				console.warn('[store-select] GOOGLE_MAPS_API_KEY not set')
				return
			}

			// 如果 Google Maps 已加载，直接初始化
			if (window.google && window.google.maps && window.google.maps.places) {
				this._bindAutocomplete()
				return
			}

			// 否则监听 google-maps-ready 事件
			const onReady = () => {
				window.removeEventListener('google-maps-ready', onReady)
				this._bindAutocomplete()
			}
			window.addEventListener('google-maps-ready', onReady)
		},

		_bindAutocomplete() {
			// 查找真实 DOM input 元素
			// uni-app H5 的 <input> 会编译为 <uni-input> 包裹真实 <input>
			let input = null

			// 方法1: 通过 id 查找 uni-input 容器，再找内部真实 input
			const wrapper = document.getElementById('places-search-input')
			if (wrapper) {
				if (wrapper.tagName === 'INPUT') {
					input = wrapper
				} else {
					// uni-input 组件，找内部真实 input
					input = wrapper.querySelector('input')
				}
			}

			// 方法2: 通过 ref
			if (!input && this.$refs.h5SearchInput) {
				const ref = this.$refs.h5SearchInput
				if (ref instanceof HTMLInputElement) {
					input = ref
				} else if (ref.$el) {
					input = ref.$el.querySelector?.('input') || ref.$el
				}
			}

			if (!input || !(input instanceof HTMLInputElement)) {
				console.warn('[store-select] search input not found in DOM, retrying in 500ms...')
				setTimeout(() => this._bindAutocomplete(), 500)
				return
			}

			console.log('[store-select] binding Autocomplete to input:', input.tagName, input.id)

			// 创建 sessionToken
			this.sessionToken = createAutocompleteSessionToken()

			this.autocomplete = new google.maps.places.Autocomplete(input, {
				fields: ['formatted_address', 'geometry', 'name', 'place_id'],
				types: ['geocode', 'establishment'],
				sessionToken: this.sessionToken
			})

			this.autocomplete.addListener('place_changed', () => {
				const place = this.autocomplete.getPlace()

				if (place.geometry) {
					this.currentLocation = {
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					}
					this.currentAddress = place.formatted_address || place.name
					this.searchText = this.currentAddress

					this.locationSource = 'MANUAL_PLACE'
					this.selectedPlaceId = place.place_id
					this.pickMode = false

					this.loadNearbyStores()
				}

				// 结束本次 session，创建新 sessionToken
				this.sessionToken = createAutocompleteSessionToken()
				if (this.autocomplete) {
					this.autocomplete.setOptions({ sessionToken: this.sessionToken })
				}
			})
		},
		// #endif

		onSearchFocus() {
			// H5 autocomplete 自动处理
		},

		/**
		 * App/小程序：手动搜索确认
		 * 调用后端 location/resolve 解析地址
		 */
		async onSearchConfirm() {
			if (!this.searchText.trim()) return

			this.locationSource = 'MANUAL_PLACE'
			this.selectedPlaceId = null
			this.isLoading = true

			try {
				const res = await resolvePlace({
					formatted_address: this.searchText
				})
				if (res.code === 0 && res.data) {
					this.currentLocation = {
						latitude: res.data.latitude,
						longitude: res.data.longitude
					}
					this.currentAddress = res.data.formatted_address || this.searchText
					if (res.data.place_id) {
						this.selectedPlaceId = res.data.place_id
					}
					await this.loadNearbyStores()
				}
			} catch (e) {
				console.error('地址解析失败:', e)
				showToast('地址解析失败')
			} finally {
				this.isLoading = false
			}
		},

		clearSearch() {
			this.searchText = ''
		},

		// ===================== 场景三：地图拖动选点 (文档 4.3) =====================

		setMode(mode) {
			this.pickMode = (mode === 'pick')
		},

		async onMapDragEnd(e) {
			if (!e || !e.latitude) return

			this.locationSource = 'MAP_PICKER'
			this.selectedPlaceId = null
			this.currentLocation = {
				latitude: e.latitude,
				longitude: e.longitude
			}

			// 可选：反向地理编码获取可读地址
			this.currentAddress = i18n.t('storeSelect.locating') || 'Locating...'
			const address = await reverseGeocode(e.latitude, e.longitude)
			this.currentAddress = address || `${e.latitude.toFixed(4)}, ${e.longitude.toFixed(4)}`

			await this.loadNearbyStores()
		},

		onMapClick(e) {
			// 可扩展：点击地图空白处
		},

		// ===================== 加载附近门店 (文档 5.1) =====================

		async loadNearbyStores() {
			this.isLoading = true
			try {
				// 并行加载：附近门店 + 全部门店
				const params = {
					location_source: this.locationSource,
					latitude: this.currentLocation.latitude,
					longitude: this.currentLocation.longitude,
					page: this.page,
					page_size: this.pageSize
				}

				if (this.locationSource === 'MANUAL_PLACE') {
					if (this.selectedPlaceId) {
						params.place_id = this.selectedPlaceId
					}
					if (this.currentAddress) {
						params.formatted_address = this.currentAddress
					}
				}

				const [nearbyRes, allRes] = await Promise.allSettled([
					getNearbyStores(params),
					getStores({ page_size: 100 })
				])

				// 处理附近门店
				let nearbyStores = []
				if (nearbyRes.status === 'fulfilled' && nearbyRes.value.code === 0 && nearbyRes.value.data) {
					if (nearbyRes.value.data.selected_location?.formatted_address) {
						this.currentAddress = nearbyRes.value.data.selected_location.formatted_address
					}
					nearbyStores = nearbyRes.value.data.items || []
				}

				// 处理全部门店列表
				let allStoreList = []
				if (allRes.status === 'fulfilled' && allRes.value.code === 0 && allRes.value.data) {
					allStoreList = allRes.value.data.items || []
				}

				// 标准化门店数据：统一字段名
				const normalizeStore = (s) => ({
					store_id: s.store_id || s.id,
					store_name: s.store_name || s.name,
					store_latitude: s.store_latitude || s.latitude,
					store_longitude: s.store_longitude || s.longitude,
					name_en: s.name_en || '',
					name_th: s.name_th || '',
					logo_url: fixMinioUrl(s.logo_url) || '',
					logo: s.logo || '/static/images/store-placeholder.svg',
					phone: s.phone || '',
					formatted_address: s.formatted_address || '',
					is_deliverable: s.is_deliverable || s.delivery_enabled || false,
					is_open: s.is_open || (s.status === 'OPEN'),
					business_hours: s.business_hours || '',
					business_types: s.business_types || [],

					distance_text: s.distance_text || '',
					distance_m: s.distance_m || null,
					eta_min: s.eta_min || null,
					delivery_fee: s.delivery_fee || null
				})

				// 合并去重：nearby优先，allStore补充
				const nearbyIds = new Set(nearbyStores.map(s => s.store_id || s.id))
				const extraStores = allStoreList.filter(s => !nearbyIds.has(s.id))
				this.stores = [
					...nearbyStores.map(normalizeStore),
					...extraStores.map(normalizeStore)
				]

				// 保存全部门店（用于地图标记）
				this.allStores = allStoreList.map(normalizeStore)
				this.updateMapMarkers()
			} catch (e) {
				console.error('加载附近门店失败:', e)
				showToast('加载门店失败')
			} finally {
				this.isLoading = false
			}
		},

		// ===================== 地图标记 =====================

		updateMapMarkers() {
			const userMarker = {
				id: 999,
				latitude: this.currentLocation.latitude,
				longitude: this.currentLocation.longitude,
				title: this.currentAddress || 'Your Location',
				iconPath: '/static/icons/my-location.svg',
				width: 24,
				height: 24
			}

			// 使用去重后的门店集合（优先 allStores，因为含完整坐标）
			const storeSet = new Map()
			for (const s of [...this.allStores, ...this.stores]) {
				if (s.store_latitude && s.store_longitude) {
					storeSet.set(s.store_id, s)
				}
			}

			const storeMarkers = [...storeSet.values()].map((store) => ({
				id: store.store_id,
				latitude: store.store_latitude,
				longitude: store.store_longitude,
				title: store.store_name,
				iconPath: fixMinioUrl(store.logo_url) || '/static/images/store-placeholder.svg',
				width: 28,
				height: 28,
				callout: {
					content: store.store_name,
					color: '#333333',
					fontSize: 12,
					borderRadius: 6,
					bgColor: '#FFFFFF',
					padding: 6,
					display: 'BYCLICK'
				}
			}))

			this.mapMarkers = [userMarker, ...storeMarkers]
		},

		onMapMarkerClick(marker) {
			const storeId = marker.id
			if (storeId && storeId !== 999) {
				this.selectedStoreId = storeId
			}
		},

		// ===================== 门店选择确认 =====================

		handleStoreClick(store) {
			const now = Date.now()
			const storeId = store.store_id
			// 300ms 内对同一门店点击两次 = 双击
			if (this.lastClickStoreId === storeId && (now - this.lastClickTime) < 300) {
				this.lastClickStoreId = null
				this.lastClickTime = 0
				this.flyToStore(store)
				return
			}
			this.lastClickStoreId = storeId
			this.lastClickTime = now
			this.selectedStoreId = storeId
		},

		flyToStore(store) {
			const lat = store.store_latitude
			const lng = store.store_longitude
			if (!lat || !lng) {
				showToast(this.i18n.t('storeSelect.noCoords') || '\u8be5\u95e8\u5e97\u6682\u65e0\u4f4d\u7f6e\u4fe1\u606f')
				return
			}
			this.currentLocation = { latitude: lat, longitude: lng }
			if (this.$refs.gmap && this.$refs.gmap.panTo) {
				this.$refs.gmap.panTo(lat, lng, 16)
			}
			this.selectedStoreId = store.store_id
		},

		confirmSelect() {
			if (!this.selectedStoreId) {
				showToast(this.i18n.t('storeSelect.pleaseSelectStore'))
				return
			}

			const selectedStore = this.stores.find(s => s.store_id === this.selectedStoreId)
			if (selectedStore) {
				const storeInfo = {
					id: selectedStore.store_id,
					name: selectedStore.store_name,
					name_en: selectedStore.name_en || '',
					name_th: selectedStore.name_th || '',
					latitude: selectedStore.store_latitude,
					longitude: selectedStore.store_longitude,
					logo_url: fixMinioUrl(selectedStore.logo_url) || '',
					logo: selectedStore.logo || '/static/images/store-placeholder.svg',
					phone: selectedStore.phone || '',
					formatted_address: selectedStore.formatted_address || '',
					delivery_enabled: selectedStore.is_deliverable || false,
					businessHours: selectedStore.business_hours,
					business_types: selectedStore.business_types,
					status: selectedStore.is_open ? 'OPEN' : 'CLOSED',
					distance: selectedStore.distance_text,
					distance_m: selectedStore.distance_m,
					eta_min: selectedStore.eta_min,
					delivery_fee: selectedStore.delivery_fee,
					address: this.currentAddress
				}

				uni.$emit('storeSelected', storeInfo)
				uni.navigateBack()
			}
		},

		// ===================== 工具方法 =====================

		getBusinessTypeText(types) {
			if (!types || !Array.isArray(types)) return []
			const typeKeyMap = {
				'HOTPOT': 'hotpot',
				'MALA_TANG': 'malaTang',
				'BEVERAGE': 'beverage',
				'BARBECUE': 'barbecue',
				'HOSTEL_ROOM': 'hostel',
				'HOSTEL_HOTPOT': 'hostelHotpot',
				'HOSTEL_COFFEE': 'hostelCoffee'
			}
			return types.map(t => {
				const key = typeKeyMap[t]
				return key ? this.i18n.t(`storeSelect.businessTypes.${key}`) : t
			}).filter(Boolean)
		}
	}
}
</script>

<style scoped>
.store-select-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

/* 上半部分：地图区域 */
.map-section {
	background-color: #FFFFFF;
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
	border-bottom: 1px solid #F3F3F3;
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
}

/* 搜索栏 */
.search-bar {
	display: flex;
	align-items: center;
	background-color: #F3F3F3;
	margin: 8px 16px 0;
	padding: 0 12px;
	border-radius: 20px;
	height: 36px;
}

.search-icon {
	width: 16px;
	height: 16px;
	margin-right: 8px;
}

.search-input {
	flex: 1;
	font-size: 14px;
	color: #333333;
	background-color: transparent;
	border: none;
	outline: none;
}

/* H5 真实 HTML input 包裹 */
.h5-input-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
}

.h5-search-input {
	width: 100%;
	font-size: 14px;
	color: #333333;
	background-color: transparent;
	border: none;
	outline: none;
	padding: 0;
	margin: 0;
	line-height: normal;
}

/* 让 pac 下拉不被裁剪 */
.pac-container-parent {
	overflow: visible !important;
	position: relative;
	z-index: 100;
}

/* 隐藏 uni-input 外层 placeholder，只保留原生 input 的 */
.h5-input-wrapper .uni-input-placeholder {
	display: none !important;
}

.search-clear {
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.clear-text {
	font-size: 14px;
	color: #999999;
}

/* 地图模式切换栏 */
.map-mode-bar {
	display: flex;
	gap: 0;
	padding: 8px 16px;
}

.mode-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	padding: 6px 0;
	border-radius: 8px;
	background-color: #F3F3F3;
}

.mode-btn:first-child {
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
}

.mode-btn:last-child {
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}

.mode-active {
	background-color: #F2B131;
}

.mode-active .mode-text {
	color: #FFFFFF;
}

.mode-icon {
	width: 14px;
	height: 14px;
}

.mode-text {
	font-size: 12px;
	color: #00000099;
	font-weight: 500;
}

.map-container {
	position: relative;
	width: 100%;
	background-color: #E8E8E8;
}

/* 下半部分：门店列表 */
.store-list-section {
	flex: 1;
	background-color: #FFFFFF;
	margin-top: 10px;
}

.location-info {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	background-color: #FFFFFF;
	border-bottom: 1px solid #F3F3F3;
}

.location-icon {
	width: 20px;
	height: 20px;
	margin-right: 10px;
}

.location-text-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.location-label {
	font-size: 12px;
	color: #00000099;
}

.location-address {
	font-size: 14px;
	color: #000000CC;
	font-weight: 500;
}

.refresh-btn {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #F3F3F3;
	border-radius: 50%;
}

.refreshing {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.refresh-icon {
	width: 18px;
	height: 18px;
}

.list-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	border-bottom: 1px solid #F3F3F3;
}

.list-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}

.list-count {
	font-size: 12px;
	color: #00000099;
}

.store-list {
	flex: 1;
}

.store-item {
	background-color: #FFFFFF;
	padding: 14px 16px;
	border-bottom: 1px solid #F3F3F3;
}

.store-selected {
	background-color: rgba(242, 177, 49, 0.08);
}

.store-main {
	display: flex;
	align-items: flex-start;
}

.store-left {
	margin-right: 12px;
}

.store-logo {
	width: 56px;
	height: 56px;
	border-radius: 8px;
}

.store-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.store-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.store-name {
	font-size: 15px;
	font-weight: 600;
	color: #000000CC;
	flex: 1;
}

.store-status {
	padding: 2px 8px;
	border-radius: 4px;
}

.status-open {
	background-color: rgba(82, 196, 26, 0.15);
}

.status-closed {
	background-color: rgba(0, 0, 0, 0.08);
}

.status-text {
	font-size: 11px;
	font-weight: 500;
}

.status-open .status-text {
	color: #52C41A;
}

.status-closed .status-text {
	color: #999999;
}

.store-rating {
	display: flex;
	align-items: center;
	gap: 4px;
}

.star-icon {
	width: 14px;
	height: 14px;
}

.rating-text {
	font-size: 12px;
	color: #F2B131;
	font-weight: 500;
}

.divider {
	font-size: 12px;
	color: #00000066;
	margin: 0 4px;
}

.business-hours {
	font-size: 12px;
	color: #00000099;
}

.store-tags {
	display: flex;
	gap: 6px;
}

.tag {
	font-size: 10px;
	color: #F2B131;
	background-color: rgba(242, 177, 49, 0.1);
	padding: 2px 6px;
	border-radius: 4px;
}

.store-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 10px;
	padding-top: 10px;
	border-top: 1px solid #F3F3F3;
}

.distance-info {
	display: flex;
	align-items: center;
	gap: 4px;
}

.distance-icon {
	width: 14px;
	height: 14px;
}

.distance-text {
	font-size: 13px;
	color: #F2B131;
	font-weight: 600;
}

.eta-text {
	font-size: 12px;
	color: #00000099;
	margin-left: 6px;
}
.address-text {
	font-size: 12px;
	color: #00000099;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 200px;
}

.store-meta {
	display: flex;
	align-items: center;
	gap: 6px;
	flex: 1;
	justify-content: center;
}

.delivery-fee {
	font-size: 11px;
	color: #00000099;
}

.delivery-badge {
	font-size: 10px;
	color: #52C41A;
	background-color: rgba(82, 196, 26, 0.1);
	padding: 2px 6px;
	border-radius: 4px;
}

.undeliverable-badge {
	font-size: 10px;
	color: #FF4D4F;
	background-color: rgba(255, 77, 79, 0.1);
	padding: 2px 6px;
	border-radius: 4px;
}

.select-btn {
	display: flex;
	align-items: center;
	gap: 4px;
	background-color: #F2B131;
	padding: 4px 12px;
	border-radius: 12px;
}

.select-text {
	font-size: 12px;
	color: #FFFFFF;
	font-weight: 500;
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
	opacity: 0.5;
	margin-bottom: 16px;
}

.empty-text {
	font-size: 14px;
	color: #00000099;
}

/* 加载状态 */
.loading-state {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px 0;
}

.loading-text {
	font-size: 14px;
	color: #999999;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}

/* 底部确认按钮 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 64px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 16px;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.confirm-btn {
	flex: 1;
	height: 44px;
	background-color: #F2B131;
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-disabled {
	opacity: 0.5;
}

.confirm-text {
	font-size: 16px;
	font-weight: 600;
	color: #FFFFFF;
}
</style>

<!-- 非 scoped 样式：确保 Google Places Autocomplete 下拉菜单正常显示 -->
<style>
.pac-container {
	z-index: 9999 !important;
	border-radius: 0 0 8px 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	border: none;
	margin-top: 0;
}

.pac-item {
	padding: 8px 12px;
	font-size: 14px;
	cursor: pointer;
}

.pac-item:hover {
	background-color: #F3F3F3;
}

.pac-item-query {
	font-size: 14px;
}

.pac-matched {
	font-weight: 600;
}
</style>
