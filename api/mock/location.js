/**
 * 模拟数据 - 定位/附近门店
 * 匹配后端 API 文档契约
 */
import { calculateDistance, formatDistance } from '../../utils/location.js'

// 模拟门店数据（含坐标）
const mockStoreLocations = [
	{
		store_id: 1,
		store_name: '芭堤雅泰式火锅',
		store_latitude: 13.7563,
		store_longitude: 100.5018,
		logo: '/static/logo.png',
		rating: '4.7',
		business_hours: '11:00-22:00',
		business_types: ['HOTPOT', 'MALA_TANG'],
		is_open: true,
		is_deliverable: true,
		delivery_fee: 5.0,
		delivery_radius_m: 5000
	},
	{
		store_id: 2,
		store_name: '茉莉奶白万达店',
		store_latitude: 13.7400,
		store_longitude: 100.5300,
		logo: '/static/logo.png',
		rating: '4.8',
		business_hours: '10:00-22:00',
		business_types: ['BEVERAGE'],
		is_open: true,
		is_deliverable: true,
		delivery_fee: 3.0,
		delivery_radius_m: 5000
	},
	{
		store_id: 3,
		store_name: '茶颜悦色',
		store_latitude: 13.7450,
		store_longitude: 100.5400,
		logo: '/static/logo.png',
		rating: '4.9',
		business_hours: '10:00-23:00',
		business_types: ['BEVERAGE'],
		is_open: true,
		is_deliverable: false,
		delivery_fee: 0,
		delivery_radius_m: 3000
	}
]

/**
 * 模拟获取附近门店
 * @param {Object} params
 * @param {string} params.location_source - "CURRENT_GPS" | "MANUAL_PLACE" | "MAP_PICKER"
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @param {string} [params.place_id] - MANUAL_PLACE 时携带
 * @param {string} [params.formatted_address]
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @returns {Promise}
 */
export function mockGetNearbyStores(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const lat = params.latitude || 13.7563
			const lng = params.longitude || 100.5018
			const page = params.page || 1
			const pageSize = params.page_size || 20

			// 根据 location_source 决定地址文本
			let addressText = params.formatted_address || '曼谷市中心，素坤逸路'
			if (params.location_source === 'MAP_PICKER') {
				addressText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
			}

			let items = mockStoreLocations.map(store => {
				const distanceM = calculateDistance(lat, lng, store.store_latitude, store.store_longitude)
				const routeDistanceM = Math.round(distanceM * 1.3)
				const etaMin = Math.max(5, Math.round(routeDistanceM / 100))

				return {
					...store,
					distance_m: distanceM,
					distance_text: formatDistance(distanceM),
					route_distance_m: routeDistanceM,
					eta_min: etaMin
				}
			}).sort((a, b) => a.distance_m - b.distance_m)

			// 分页
			const start = (page - 1) * pageSize
			items = items.slice(start, start + pageSize)

			resolve({
				code: 0,
				message: 'success',
				data: {
					selected_location: {
						latitude: lat,
						longitude: lng,
						formatted_address: addressText
					},
					items
				}
			})
		}, 300)
	})
}

/**
 * 模拟解析地址
 * @param {Object} params
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @returns {Promise}
 */
export function mockResolvePlace(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					latitude: params.latitude || 13.7563,
					longitude: params.longitude || 100.5018,
					formatted_address: params.formatted_address || '曼谷市中心，素坤逸路',
					place_id: 'mock_place_' + Date.now()
				}
			})
		}, 200)
	})
}

/**
 * 模拟获取门店配送范围
 * @param {number} storeId
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise}
 */
export function mockGetStoreServiceability(storeId, lat, lng) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const store = mockStoreLocations.find(s => s.store_id === parseInt(storeId))
			const distanceM = store
				? calculateDistance(lat, lng, store.store_latitude, store.store_longitude)
				: 99999

			const deliveryRadius = store?.delivery_radius_m || 5000
			const inRadius = distanceM <= deliveryRadius
			const deliverable = inRadius && (store?.is_deliverable || false)

			resolve({
				code: 0,
				message: 'success',
				data: {
					store_id: parseInt(storeId),
					is_open: store ? store.is_open : false,
					is_deliverable: deliverable,
					distance_m: distanceM,
					route_distance_m: Math.round(distanceM * 1.3),
					eta_min: Math.max(5, Math.round(distanceM / 100)),
					delivery_fee: deliverable ? (store?.delivery_fee || 0) : 0
				}
			})
		}, 200)
	})
}

export default {
	mockGetNearbyStores,
	mockResolvePlace,
	mockGetStoreServiceability
}
