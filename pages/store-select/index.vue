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
				<text class="nav-title">{{ t('storeSelect.title') }}</text>
				<view class="nav-right"></view>
			</view>



			<!-- 地图容器 -->
			<view class="map-container" :style="{ height: mapHeight + 'px' }">
				<google-map
					ref="gmap"
					:latitude="currentLocation.latitude"
					:longitude="currentLocation.longitude"
					:markers="mapMarkers"
					:zoom="14"
					:show-user-location="true"
						@marker-click="onMapMarkerClick"
						></google-map>
			</view>
		</view>

		<!-- 下半部分：门店列表 -->
		<view class="store-list-section">
			<!-- 当前定位信息 -->
			<view class="location-info">
				<image class="location-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
				<view class="location-text-wrapper">
					<text class="location-label">{{ t('storeSelect.currentLocation') }}：</text>
					<text class="location-address" v-if="locationDenied">{{ t('storeSelect.locationDenied') }}</text>
					<text class="location-address" v-else-if="currentAddress">{{ currentAddress }}</text>
					<text class="location-address" v-else>{{ t('storeSelect.locating') }}</text>
				</view>
				<view v-if="!locationDenied" class="refresh-btn" :class="{ 'refreshing': isLocating }" @click="refreshLocation">
					<image class="refresh-icon" src="/static/icons/refresh.svg" mode="aspectFit"></image>
				</view>
				<view v-else class="enable-location-btn" @click="handleEnableLocation">
					<text class="enable-location-text">{{ t('storeSelect.enableLocation') }}</text>
				</view>
			</view>

			<!-- 门店列表标题 -->
			<view class="list-header">
				<text class="list-title">{{ t('storeSelect.nearbyStores') }}</text>
				<text class="list-count">{{ t('storeSelect.storeCount', { count: stores.length }) }}</text>
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
								


								<text class="business-hours" v-if="store.business_hours && store.business_hours !== '-'">{{ store.business_hours }}</text>
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
								<text class="address-text">{{ getStoreAddress(store) }}</text>
						</view>
						<view class="store-meta">
							<text class="delivery-fee" v-if="false">฿{{ store.delivery_fee }} delivery</text>
							<text class="delivery-badge" v-if="false">Deliverable</text>
						</view>
						<view class="select-btn" v-if="selectedStoreId === store.store_id">
							<text class="select-text">{{ t('storeSelect.selected') }}</text>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view class="empty-state" v-if="stores.length === 0 && !isLoading">
					<image class="empty-icon" src="/static/images/empty-store.svg" mode="aspectFit"></image>
					<text class="empty-title">{{ t('common.empty.store') }}</text>
					<text class="empty-desc">{{ t('common.empty.storeDesc') }}</text>
				</view>

				<!-- 加载状态 -->
				<view class="loading-state" v-if="isLoading">
					<text class="loading-text">{{ t('storeSelect.locating') }}</text>
				</view>

				<!-- 底部占位 -->
				<view class="bottom-placeholder"></view>
			</scroll-view>
		</view>

		<!-- 底部确认按钮 -->
		<view class="bottom-bar">
			<view class="confirm-btn" :class="{ 'btn-disabled': !selectedStoreId }" @click="confirmSelect">
				<text class="confirm-text">{{ t('storeSelect.confirmSelect') }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { showToast, fixMinioUrl } from '@/utils/index.js'
import {
		getUserLocation,
		getLocationOrDefault,
		openLocationSettings,
		reverseGeocode
	} from '@/utils/location.js'
import { getNearbyStores } from '@/api/services/location.js'
import { getStores } from '@/api/services/store.js'
import GoogleMap from '@/components/google-map.vue'
import i18n from '@/i18n/index.js'

export default {
	components: {
		GoogleMap
	},
	data() {
		return {
			langVersion: 0,
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
			isLocating: false,
			isLoading: false,
			locationDenied: false,
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
		// 多语言地址:中文模式后端没存中文,fallback 到英文(避免泰文给中国用户看)
		getStoreAddress(store) {
			const lang = i18n.getLanguage()
			const fa = store['formatted_address_' + lang] || store['address_' + lang]
			if (fa) return fa
			// fallback:中文→英文→泰文→原始
			if (lang === 'zh') {
				return store.formatted_address_en || store.address_en || store.formatted_address || store.address || ''
			}
			if (lang === 'en') {
				return store.formatted_address_en || store.address_en || store.formatted_address || store.address || ''
			}
			return store.formatted_address || store.address || ''
		},
		fixMinioUrl,
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20

			const navBarHeight = 44
			const bottomBarHeight = 64
			const locationInfoHeight = 70
			const listHeaderHeight = 44
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0

			this.mapHeight = Math.floor(
				(systemInfo.windowHeight - navBarHeight - bottomBarHeight - safeAreaBottom - this.statusBarHeight) * 0.35
			)
			this.listHeight = systemInfo.windowHeight - this.statusBarHeight - navBarHeight - this.mapHeight - bottomBarHeight - locationInfoHeight - listHeaderHeight - safeAreaBottom
		},

		goBack() {
			uni.navigateBack()
		},

		// ===================== 场景一：GPS定位 (文档 4.1) =====================

		async initLocation() {
			this.isLocating = true
			try {
				const loc = await getLocationOrDefault()
				this.locationDenied = !!loc.denied
				this.currentLocation = {
					latitude: loc.latitude,
					longitude: loc.longitude
				}
				// 优先用系统返回的 address；没有就调 Google 反向地理编码
				if (loc.address) {
					this.currentAddress = typeof loc.address === 'string'
						? loc.address
						: (loc.address.formatted_address || loc.address.street || '')
				} else if (loc.denied) {
					this.currentAddress = ''
				} else {
					// 等待 Google 反向地理编码（不显示坐标，看起来像 IP）
					this.currentAddress = i18n.t('storeSelect.locating')
					reverseGeocode(loc.latitude, loc.longitude).then(addr => {
						if (addr && typeof addr === 'string') {
							this.currentAddress = addr
						} else {
							// 反查失败，用「定位成功」兜底（不显示坐标）
							this.currentAddress = i18n.t('storeSelect.locationReady') || '已定位'
						}
					}).catch(() => {
						this.currentAddress = i18n.t('storeSelect.locationReady') || '已定位'
					})
				}
			} catch (e) {
				console.warn('定位失败，使用默认位置:', e)
				this.locationDenied = true
			} finally {
				this.isLocating = false
			}
			await this.loadNearbyStores()
		},

		async refreshLocation() {
			if (this.isLocating) return
			await this.initLocation()
		},

		// 用户点击「开启定位」按钮 — 打开系统设置（APP）或显示提示（H5）
		handleEnableLocation() {
			openLocationSettings()
			// APP 端用户从设置返回后，自动尝试重新定位
			// #ifdef APP-PLUS
			setTimeout(() => {
				this.refreshLocation()
			}, 1500)
			// #endif
		},

		// ===================== 加载附近门店 (文档 5.1) =====================

		async loadNearbyStores() {
			this.isLoading = true
			try {
				// 并行加载：附近门店 + 全部门店
				const params = {
					latitude: this.currentLocation.latitude,
					longitude: this.currentLocation.longitude,
					page: this.page,
					page_size: this.pageSize
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
				const normalizeStore = (s) => {
					// 兼容多种营业时间字段：config.opening_time/closing_time、business_hours 字符串、
					// businessHours、opening_hours、分开的 opening_time/closing_time
					let businessHours = ''
					const cfg = s.config || s.store_config
					if (cfg && cfg.opening_time && cfg.closing_time) {
						const open = String(cfg.opening_time).slice(0, 5)
						const close = String(cfg.closing_time).slice(0, 5)
						if (open && close && !open.includes('undefined') && !close.includes('undefined')) {
							businessHours = `${open}-${close}`
						}
					}
					if (!businessHours) {
						const str = s.business_hours || s.businessHours || s.opening_hours
						if (str && typeof str === 'string' && !str.includes('undefined') && str !== '-' && str !== ' - ') {
							businessHours = str
						}
					}
					if (!businessHours && s.opening_time && s.closing_time) {
						const open = String(s.opening_time).slice(0, 5)
						const close = String(s.closing_time).slice(0, 5)
						if (open && close && !open.includes('undefined') && !close.includes('undefined')) {
							businessHours = `${open}-${close}`
						}
					}
					return {
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
						formatted_address_zh: s.formatted_address_zh || '',
						formatted_address_en: s.formatted_address_en || '',
						formatted_address_th: s.formatted_address_th || '',
						address: s.address || '',
						address_zh: s.address_zh || '',
						address_en: s.address_en || '',
						address_th: s.address_th || '',
						is_deliverable: s.is_deliverable || s.delivery_enabled || false,
						is_open: s.is_open || (s.status === 'OPEN'),
						business_hours: businessHours,
						business_types: s.business_types || [],

						distance_text: s.distance_text || '',
						distance_m: s.distance_m || null,
						eta_min: s.eta_min || null,
						delivery_fee: s.delivery_fee || null
					}
				}

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
				'BBQ': 'barbecue',
				'BARBECUE': 'barbecue',
				'MALA_TANG': 'malaTang',
				'MALATANG': 'malaTang',
				'BEVERAGE': 'beverage',
				'SEAFOOD_NOODLES': 'seafoodNoodle',
				'SEAFOOD_NOODLE': 'seafoodNoodle',
				'SINEFOOD_NOODLE': 'seafoodNoodle',
				'SINEFOOD_NOODLES': 'seafoodNoodle',
				'HOSTEL_ROOM': 'hostel',
				'HOSTEL_HOTPOT': 'hostelHotpot',
				'HOSTEL_COFFEE': 'hostelCoffee'
			}
			return types.map(t => {
				const key = typeKeyMap[t]
				if (!key) {
					// 临时调试：把未识别的枚举打到控制台，方便补充映射
					console.warn('[store-select] unknown business_type:', t)
				}
				return key ? this.i18n.t(`storeSelect.businessTypes.${key}`) : ''
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
	flex-wrap: wrap;
	align-items: baseline;
	gap: 0 6px;
	min-width: 0;
}

.location-label {
	font-size: 12px;
	color: #00000099;
	flex-shrink: 0;
}

.location-address {
	font-size: 14px;
	color: #000000CC;
	font-weight: 500;
	flex: 1;
	min-width: 0;
	word-break: break-word;
}

.location-address.location-denied {
	color: #DA3300;
}

.enable-location-btn {
	padding: 6px 14px;
	background-color: #F2B131;
	border-radius: 14px;
}

.enable-location-text {
	color: #FFFFFF;
	font-size: 12px;
	font-weight: 600;
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
	align-items: flex-start;
	gap: 4px;
}

.distance-icon {
	width: 14px;
	height: 14px;
	flex-shrink: 0;
	margin-top: 2px;
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
	flex: 1;
	min-width: 0;
	line-height: 1.4;
	word-break: break-word;
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
