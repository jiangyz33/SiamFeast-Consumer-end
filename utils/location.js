/**
 * 定位工具模块
 * GPS定位、距离计算、格式化、反向地理编码
 */
import { GOOGLE_MAPS_API_KEY } from '@/api/config.js'

const EARTH_RADIUS = 6378137 // 地球半径（米）

/**
 * 将角度转为弧度
 */
function rad(deg) {
	return deg * Math.PI / 180.0
}

/**
 * 使用 Haversine 公式计算两点间距离
 * @param {number} lat1 点1纬度
 * @param {number} lng1 点1经度
 * @param {number} lat2 点2纬度
 * @param {number} lng2 点2经度
 * @returns {number} 距离（米）
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
	const radLat1 = rad(lat1)
	const radLat2 = rad(lat2)
	const a = radLat1 - radLat2
	const b = rad(lng1) - rad(lng2)

	const s = 2 * Math.asin(Math.sqrt(
		Math.pow(Math.sin(a / 2), 2) +
		Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
	))

	return Math.round(s * EARTH_RADIUS)
}

/**
 * 格式化距离为可读文本
 * @param {number} meters 距离（米）
 * @returns {string} 格式化后的距离文本，如 "600m" 或 "1.2km"
 */
export function formatDistance(meters) {
	if (meters < 1000) {
		return `${meters}m`
	}
	return `${(meters / 1000).toFixed(1)}km`
}

/**
 * 获取用户当前位置
 * 封装 uni.getLocation，处理权限和错误
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function getUserLocation() {
	return new Promise((resolve, reject) => {
		uni.getLocation({
			type: 'gcj02',
			geocode: true,
			success: (res) => {
				resolve({
					latitude: res.latitude,
					longitude: res.longitude,
					address: res.address
				})
			},
			fail: (err) => {
				console.warn('定位失败:', err)
				// 判断错误类型
				const errMsg = (err && err.errMsg) || ''
				const isPermissionDenied =
					errMsg.includes('auth deny') ||
					errMsg.includes('authRefuse') ||
					errMsg.includes('permission') ||
					errMsg.includes('authorize') ||
					errMsg.includes('denied')
				const isTimeout = errMsg.includes('timeout')
				// 返回结构化错误
				reject({
					code: isPermissionDenied ? 'PERMISSION_DENIED'
						: (isTimeout ? 'TIMEOUT' : 'UNKNOWN'),
					message: errMsg,
					error: err
				})
			}
		})
	})
}

/**
 * 默认位置（曼谷市中心），定位失败时兜底使用
 */
export const DEFAULT_LOCATION = {
	latitude: 13.7563,
	longitude: 100.5018,
	address: null
}

/**
 * 获取定位，失败时返回默认位置（不抛错）
 * @param {Object} [options]
 * @param {boolean} [options.silentOnDeny=false] - 权限拒绝时不弹提示
 * @returns {Promise<{latitude: number, longitude: number, address: string|null, denied: boolean}>}
 */
export function getLocationOrDefault(options = {}) {
	return getUserLocation().then(loc => ({
		...loc,
		denied: false
	})).catch(err => {
		// 权限拒绝时弹引导（除非 silent）
		if (err.code === 'PERMISSION_DENIED' && !options.silentOnDeny) {
			showLocationPermissionGuide()
		}
		return {
			...DEFAULT_LOCATION,
			denied: err.code === 'PERMISSION_DENIED'
		}
	})
}

/**
 * 引导用户去开启定位权限
 */
export function showLocationPermissionGuide() {
	uni.showModal({
		title: i18n.t ? i18n.t('storeSelect.title') : '定位权限',
		content: '需要定位权限以获取附近门店，是否前往设置开启？',
		confirmText: '去设置',
		cancelText: '暂不',
		success: (modalRes) => {
			if (modalRes.confirm) {
				openLocationSettings()
			}
		}
	})
}

/**
 * 打开系统定位设置页
 * APP 端打开 APP 自身的权限设置；H5 端无法直接打开，给提示
 */
export function openLocationSettings() {
	// #ifdef APP-PLUS
	if (typeof plus !== 'undefined' && plus.runtime && plus.runtime.openURL) {
		// Android: 打开应用详情页（含权限设置）
		// iOS: 打开设置 App
		try {
			plus.runtime.openURL('app-settings:')  // iOS
		} catch (e) {
			try { plus.runtime.openURL('package:com.android.settings') } catch(e2) {}
		}
		return
	}
	uni.openSetting && uni.openSetting({
		fail: () => {
			uni.showToast({ title: '请在系统设置中开启定位权限', icon: 'none' })
		}
	})
	// #endif
	// #ifdef H5
	uni.showToast({ title: '请在浏览器地址栏允许定位权限', icon: 'none', duration: 3000 })
	// #endif
}

/**
 * 持续监听位置变化
 * @param {Function} callback 位置更新回调
 * @returns {Function} 停止监听的函数
 */
export function watchLocation(callback) {
	let watchId = null

	// #ifdef APP-PLUS
	watchId = plus.geolocation.watchPosition(
		(pos) => {
			callback({
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude
			})
		},
		(err) => {
			console.warn('位置监听错误:', err)
		},
		{ enableHighAccuracy: false, maximumAge: 30000 }
	)

	return () => {
		if (watchId !== null) {
			plus.geolocation.clearWatch(watchId)
		}
	}
	// #endif

	// #ifndef APP-PLUS
	// H5 环境使用轮询模拟
	const timer = setInterval(() => {
		getUserLocation().then(callback).catch(() => {})
	}, 30000)

	return () => {
		clearInterval(timer)
	}
	// #endif
}

/**
 * 反向地理编码：坐标 -> 可读地址
 * H5 使用 Google Geocoding API，App 使用后端接口
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string|null>} 格式化地址
 */
export function reverseGeocode(latitude, longitude) {
	// #ifdef H5
	return new Promise((resolve) => {
		if (!window.google || !window.google.maps) {
			resolve(null)
			return
		}
		const geocoder = new google.maps.Geocoder()
		geocoder.geocode(
			{ location: { lat: latitude, lng: longitude } },
			(results, status) => {
				if (status === 'OK' && results && results.length > 0) {
					resolve(results[0].formatted_address)
				} else {
					resolve(null)
				}
			}
		)
	})
	// #endif

	// #ifndef H5
	// App/小程序环境：直接返回 null，由后端解析
	return Promise.resolve(null)
	// #endif
}

/**
 * 创建 Places Autocomplete sessionToken（H5 专用）
 * 同一个输入会话复用同一个 token，用户选中后 token 自动失效
 * @returns {Object|null} sessionToken
 */
export function createAutocompleteSessionToken() {
	// #ifdef H5
	if (window.google && window.google.maps && google.maps.places) {
		return new google.maps.places.AutocompleteSessionToken()
	}
	// #endif
	return null
}

/**
 * Fetch Place Details 使用 Place Details API (New)
 * 获取 place_id 对应的完整信息
 * @param {string} placeId
 * @returns {Promise<{place_id: string, formatted_address: string, latitude: number, longitude: number}|null>}
 */
export function fetchPlaceDetails(placeId) {
	// #ifdef H5
	return new Promise((resolve) => {
		if (!window.google || !window.google.maps) {
			resolve(null)
			return
		}
		const service = new google.maps.places.PlacesService(
			document.createElement('div')
		)
		service.getDetails(
			{
				placeId: placeId,
				fields: ['formatted_address', 'geometry', 'name', 'place_id']
			},
			(place, status) => {
				if (status === 'OK' && place) {
					resolve({
						place_id: place.place_id,
						formatted_address: place.formatted_address || place.name,
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					})
				} else {
					resolve(null)
				}
			}
		)
	})
	// #endif

	// #ifndef H5
	return Promise.resolve(null)
	// #endif
}

export default {
	getUserLocation,
	calculateDistance,
	formatDistance,
	watchLocation,
	reverseGeocode,
	createAutocompleteSessionToken,
	fetchPlaceDetails
}
