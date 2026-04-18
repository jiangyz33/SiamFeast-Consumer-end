<template>
	<view class="google-map-wrapper">
		<!-- #ifdef APP-PLUS -->
		<map
			class="map-native"
			:latitude="latitude"
			:longitude="longitude"
			:markers="nativeMarkers"
			:zoom="zoom"
			:show-location="showUserLocation"
			@markertap="onMarkerTap"
			@tap="onMapTap"
			@regionchange="onRegionChange"
		></map>
		<!-- #endif -->

		<!-- #ifdef H5 -->
		<view class="map-h5" :id="mapId" ref="mapContainer">
			<!-- 地图加载中占位 -->
			<view class="map-loading" v-if="!mapReady">
				<image class="map-loading-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
				<text class="map-loading-text">Map loading...</text>
			</view>
		</view>
		<!-- #endif -->

		<!-- #ifdef MP-WEIXIN -->
		<map
			class="map-native"
			:latitude="latitude"
			:longitude="longitude"
			:markers="nativeMarkers"
			:zoom="zoom"
			:show-location="showUserLocation"
			@markertap="onMarkerTap"
			@tap="onMapTap"
			@regionchange="onRegionChange"
		></map>
		<!-- #endif -->

		<!-- 地图中心定位针（拖动选点时显示） -->
		<view class="center-pin" v-if="enablePickMode && showCenterPin">
			<image class="pin-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
		</view>
	</view>
</template>

<script>
import { GOOGLE_MAPS_API_KEY } from '@/api/config.js'

export default {
	name: 'GoogleMap',
	props: {
		latitude: {
			type: Number,
			default: 13.7563
		},
		longitude: {
			type: Number,
			default: 100.5018
		},
		markers: {
			type: Array,
			default: () => []
		},
		zoom: {
			type: Number,
			default: 14
		},
		showUserLocation: {
			type: Boolean,
			default: true
		},
		mapId: {
			type: String,
			default: 'google-map-container'
		},
		// 是否启用地图拖动选点模式
		enablePickMode: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			mapReady: false,
			h5Map: null,
			h5Markers: [],
			scriptLoaded: false,
			showCenterPin: false,
			dragTimer: null
		}
	},
	computed: {
		nativeMarkers() {
			return this.markers.map((m, index) => ({
				id: m.id || index,
				latitude: m.latitude,
				longitude: m.longitude,
				title: m.title || '',
				iconPath: m.iconPath || '/static/icons/location.svg',
				width: m.width || 28,
				height: m.height || 28,
				callout: m.callout ? {
					content: m.callout.content || '',
					color: m.callout.color || '#333333',
					fontSize: m.callout.fontSize || 12,
					borderRadius: m.callout.borderRadius || 6,
					bgColor: m.callout.bgColor || '#FFFFFF',
					padding: m.callout.padding || 6,
					display: m.callout.display || 'BYCLICK'
				} : undefined
			}))
		}
	},
	watch: {
		markers: {
			handler(newVal) {
				// #ifdef H5
				if (this.h5Map) {
					this.updateH5Markers(newVal)
				}
				// #endif
			},
			deep: true
		},
		latitude() {
			// #ifdef H5
			if (this.h5Map) {
				this.h5Map.setCenter({ lat: this.latitude, lng: this.longitude })
			}
			// #endif
		},
		enablePickMode(val) {
			this.showCenterPin = val
			// #ifdef H5
			if (val && this.h5Map) {
				this.setupPickMode()
			}
			// #endif
		}
	},
	mounted() {
		// #ifdef H5
		this.initH5Map()
		// #endif
	},
	beforeUnmount() {
		// #ifdef H5
		this.cleanupH5Map()
		// #endif
		if (this.dragTimer) {
			clearTimeout(this.dragTimer)
		}
	},
	methods: {
		// #ifdef H5
		/**
		 * H5：初始化 Google Maps JS API
		 */
		initH5Map() {
			if (!GOOGLE_MAPS_API_KEY) {
				console.warn('Google Maps API Key not configured')
				return
			}

			if (window.google && window.google.maps) {
				this.createH5Map()
				return
			}

			const callbackName = 'googleMapsInit_' + this._uid
			window[callbackName] = () => {
				this.scriptLoaded = true
				this.createH5Map()
				// 通知父组件 Google Maps 已加载完成
				window.dispatchEvent(new Event('google-maps-ready'))
			}

			const script = document.createElement('script')
			script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`
			script.async = true
			script.defer = true
			document.head.appendChild(script)
		},

		createH5Map() {
			const container = document.getElementById(this.mapId)
			if (!container) return

			this.h5Map = new google.maps.Map(container, {
				center: { lat: this.latitude, lng: this.longitude },
				zoom: this.zoom,
				disableDefaultUI: true,
				zoomControl: true,
				mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: false
			})

			this.mapReady = true
			this.updateH5Markers(this.markers)

			// 地图点击
			this.h5Map.addListener('click', (e) => {
				this.$emit('map-click', {
					latitude: e.latLng.lat(),
					longitude: e.latLng.lng()
				})
			})

			// 拖动选点：监听中心点变化
			if (this.enablePickMode) {
				this.setupPickMode()
			}

			// 通知外部 Google Maps 就绪
			window.dispatchEvent(new Event('google-maps-ready'))
		},

		updateH5Markers(markers) {
			this.h5Markers.forEach(m => m.setMap(null))
			this.h5Markers = []

			markers.forEach((m, index) => {
				const marker = new google.maps.Marker({
					position: { lat: m.latitude, lng: m.longitude },
					map: this.h5Map,
					title: m.title || '',
					label: m.label || undefined
				})

				marker.addListener('click', () => {
					this.$emit('marker-click', {
						id: m.id || index,
						...m
					})
				})

				this.h5Markers.push(marker)
			})
		},

		cleanupH5Map() {
			this.h5Markers.forEach(m => m.setMap(null))
			this.h5Markers = []
			this.h5Map = null
		},

		setupPickMode() {
			if (!this.h5Map) return
			this.showCenterPin = true
			this.h5Map.addListener('dragstart', () => {
				this.showCenterPin = false
			})
			this.h5Map.addListener('idle', () => {
				this.showCenterPin = true
				const center = this.h5Map.getCenter()
				this.emitDragEnd(center.lat(), center.lng())
			})
		},
		// #endif

		/**
		 * 外部调用：平移地图到指定坐标并缩放
		 * @param {number} lat 纬度
		 * @param {number} lng 经度
		 * @param {number} [zoom] 缩放级别
		 */
		panTo(lat, lng, zoom) {
			// #ifdef H5
			if (this.h5Map) {
				this.h5Map.panTo({ lat, lng })
				if (zoom) this.h5Map.setZoom(zoom)
			}
			// #endif
		},

		/**
		 * 防抖发送 drag-end 事件
		 */
		emitDragEnd(lat, lng) {
			if (this.dragTimer) clearTimeout(this.dragTimer)
			this.dragTimer = setTimeout(() => {
				this.$emit('drag-end', {
					latitude: lat,
					longitude: lng
				})
			}, 500)
		},

		/**
		 * App/小程序：标记点击
		 */
		onMarkerTap(e) {
			const markerId = e.detail?.markerId ?? e.markerId
			const marker = this.markers.find((m, i) => (m.id || i) === markerId)
			if (marker) {
				this.$emit('marker-click', marker)
			}
		},

		onMapTap(e) {
			this.$emit('map-click', {
				latitude: e.detail?.latitude,
				longitude: e.detail?.longitude
			})
		},

		/**
		 * App/小程序：地图区域变化（拖动选点）
		 */
		onRegionChange(e) {
			if (this.enablePickMode && e.type === 'end') {
				const center = e.detail?.centerLocation
				if (center) {
					if (e.causedBy === 'gesture') {
						this.showCenterPin = true
					}
					this.emitDragEnd(center.latitude, center.longitude)
				}
			}

			// 非选点模式也支持 drag-end
			if (!this.enablePickMode && e.type === 'end' && e.causedBy === 'gesture') {
				this.$emit('drag-end', {
					latitude: e.detail?.centerLocation?.latitude,
					longitude: e.detail?.centerLocation?.longitude
				})
			}
		}
	}
}
</script>

<style scoped>
.google-map-wrapper {
	width: 100%;
	height: 100%;
	position: relative;
}

.map-native {
	width: 100%;
	height: 100%;
}

.map-h5 {
	width: 100%;
	height: 100%;
	position: relative;
}

.map-loading {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #F3F3F3;
	z-index: 1;
}

.map-loading-icon {
	width: 32px;
	height: 32px;
	margin-bottom: 8px;
}

.map-loading-text {
	font-size: 14px;
	color: #999999;
}

/* 拖动选点中心针 */
.center-pin {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -100%);
	z-index: 10;
	pointer-events: none;
	transition: transform 0.2s ease;
}

.pin-icon {
	width: 32px;
	height: 32px;
}
</style>
