<template>
	<view class="google-map-wrapper">
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

		<!-- #ifndef MP-WEIXIN -->
		<view class="map-h5" :id="mapId" ref="mapContainer">
			<view class="map-loading" v-if="!mapReady">
				<image class="map-loading-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
				<text class="map-loading-text">Map loading...</text>
			</view>
		</view>
		<!-- #endif -->

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
		enablePickMode: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			mapReady: false,
			gmap: null,
			gmarkers: [],
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
				if (this.gmap) this.updateMarkers(newVal)
			},
			deep: true
		},
		latitude() {
			if (this.gmap) {
				this.gmap.setCenter({ lat: this.latitude, lng: this.longitude })
			}
		},
		enablePickMode(val) {
			this.showCenterPin = val
			if (val && this.gmap) this.setupPickMode()
		}
	},
	mounted() {
		// #ifndef MP-WEIXIN
		this.initGoogleMap()
		// #endif
	},
	beforeUnmount() {
		this.cleanupMap()
		if (this.dragTimer) clearTimeout(this.dragTimer)
	},
	methods: {
		// #ifndef MP-WEIXIN
		initGoogleMap() {
			if (!GOOGLE_MAPS_API_KEY) {
				console.warn('Google Maps API Key not configured')
				return
			}
			if (typeof window === 'undefined') return

			if (window.google && window.google.maps) {
				this.createMap()
				return
			}

			const callbackName = 'googleMapsInit_' + (this._uid || Date.now())
			window[callbackName] = () => {
				this.createMap()
				window.dispatchEvent(new Event('google-maps-ready'))
			}

			const script = document.createElement('script')
			script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`
			script.async = true
			script.defer = true
			document.head.appendChild(script)
		},

		createMap() {
			const container = document.getElementById(this.mapId)
			if (!container) return

			this.gmap = new google.maps.Map(container, {
				center: { lat: this.latitude, lng: this.longitude },
				zoom: this.zoom,
				disableDefaultUI: true,
				zoomControl: true,
				mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: false
			})

			this.mapReady = true
			this.updateMarkers(this.markers)

			this.gmap.addListener('click', (e) => {
				this.$emit('map-click', {
					latitude: e.latLng.lat(),
					longitude: e.latLng.lng()
				})
			})

			if (this.enablePickMode) this.setupPickMode()
			window.dispatchEvent(new Event('google-maps-ready'))
		},

		updateMarkers(markers) {
			this.gmarkers.forEach(m => m.setMap(null))
			this.gmarkers = []
			markers.forEach((m, index) => {
				const marker = new google.maps.Marker({
					position: { lat: m.latitude, lng: m.longitude },
					map: this.gmap,
					title: m.title || '',
					label: m.label || undefined
				})
				marker.addListener('click', () => {
					this.$emit('marker-click', { id: m.id || index, ...m })
				})
				this.gmarkers.push(marker)
			})
		},

		cleanupMap() {
			this.gmarkers.forEach(m => m.setMap(null))
			this.gmarkers = []
			this.gmap = null
		},

		setupPickMode() {
			if (!this.gmap) return
			this.showCenterPin = true
			this.gmap.addListener('dragstart', () => { this.showCenterPin = false })
			this.gmap.addListener('idle', () => {
				this.showCenterPin = true
				const center = this.gmap.getCenter()
				this.emitDragEnd(center.lat(), center.lng())
			})
		},
		// #endif

		panTo(lat, lng, zoom) {
			// #ifndef MP-WEIXIN
			if (this.gmap) {
				this.gmap.panTo({ lat, lng })
				if (zoom) this.gmap.setZoom(zoom)
			}
			// #endif
		},

		emitDragEnd(lat, lng) {
			if (this.dragTimer) clearTimeout(this.dragTimer)
			this.dragTimer = setTimeout(() => {
				this.$emit('drag-end', { latitude: lat, longitude: lng })
			}, 500)
		},

		onMarkerTap(e) {
			const markerId = e.detail?.markerId ?? e.markerId
			const marker = this.markers.find((m, i) => (m.id || i) === markerId)
			if (marker) this.$emit('marker-click', marker)
		},

		onMapTap(e) {
			this.$emit('map-click', {
				latitude: e.detail?.latitude,
				longitude: e.detail?.longitude
			})
		},

		onRegionChange(e) {
			if (this.enablePickMode && e.type === 'end') {
				const center = e.detail?.centerLocation
				if (center) {
					if (e.causedBy === 'gesture') this.showCenterPin = true
					this.emitDragEnd(center.latitude, center.longitude)
				}
			}
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
