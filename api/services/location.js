/**
 * 定位相关 API 服务
 * 附近门店、地址解析、配送范围
 */
import { USE_MOCK } from '../config.js'
import { get, post } from '../request.js'
import {
	mockGetNearbyStores,
	mockResolvePlace,
	mockGetStoreServiceability
} from '../mock/location.js'

/**
 * 获取附近门店
 * POST /stores/nearby
 * @param {Object} params
 * @param {string} params.location_source - "CURRENT_GPS" | "MANUAL_PLACE" | "MAP_PICKER"
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @param {string} [params.formatted_address]
 * @returns {Promise}
 */
export function getNearbyStores(params) {
	if (USE_MOCK) {
		return mockGetNearbyStores(params)
	}
	return post('/stores/nearby', params)
}

/**
 * 解析地址/地点
 * POST /location/resolve
 * 注意：后端仅接受 place_id 参数
 * @param {Object} params
 * @param {string} params.place_id Google Place ID
 * @param {number} [params.latitude] （仅 mock 使用）
 * @param {number} [params.longitude] （仅 mock 使用）
 * @returns {Promise}
 */
export function resolvePlace(params) {
	if (USE_MOCK) {
		return mockResolvePlace(params)
	}
	return post('/location/resolve', { place_id: params.place_id })
}

/**
 * 获取门店配送范围检查
 * GET /api/v1/stores/{store_id}/serviceability?lat=...&lng=...
 * @param {number} storeId
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise}
 */
export function getStoreServiceability(storeId, lat, lng) {
	if (USE_MOCK) {
		return mockGetStoreServiceability(storeId, lat, lng)
	}
	return get(`/stores/${storeId}/serviceability`, { lat, lng })
}

// 导出模块对象
export const locationApi = {
	getNearbyStores,
	resolvePlace,
	getStoreServiceability
}

export default locationApi
