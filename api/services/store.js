/**
 * 门店相关 API
 */
import { USE_MOCK } from '../config.js'
import { get, post, put, del } from '../request.js'
import { mockGetStores, mockGetStore } from '../mock/store.js'

/**
 * 获取门店列表
 * @param {Object} params 查询参数
 * @param {string} params.status_filter 状态筛选
 * @returns {Promise}
 */
export function getStores(params = {}) {
	if (USE_MOCK) {
		return mockGetStores(params)
	}
	return get('/stores', params)
}

/**
 * 获取门店详情
 * @param {number} storeId 门店ID
 * @returns {Promise}
 */
export function getStore(storeId) {
	if (USE_MOCK) {
		return mockGetStore(storeId)
	}
	return get(`/stores/${storeId}`)
}

/**
 * 创建门店（仅总店管理员）
 * @param {Object} data 门店数据
 * @returns {Promise}
 */
export function createStore(data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: Date.now(), ...data }
				})
			}, 300)
		})
	}
	return post('/stores', data)
}

/**
 * 更新门店信息
 * @param {number} storeId 门店ID
 * @param {Object} data 更新数据
 * @returns {Promise}
 */
export function updateStore(storeId, data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: storeId, ...data }
				})
			}, 300)
		})
	}
	return put(`/stores/${storeId}`, data)
}

/**
 * 更新门店状态
 * @param {number} storeId 门店ID
 * @param {Object} data 状态数据
 * @param {string} data.status 状态 (OPEN/PAUSED/CLOSED)
 * @param {string} data.reason 原因
 * @returns {Promise}
 */
export function updateStoreStatus(storeId, data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: storeId, status: data.status }
				})
			}, 300)
		})
	}
	return put(`/stores/${storeId}/status`, data)
}

/**
 * 更新门店配置
 * @param {number} storeId 门店ID
 * @param {Object} data 配置数据
 * @returns {Promise}
 */
export function updateStoreConfig(storeId, data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { store_id: storeId, updated: true }
				})
			}, 300)
		})
	}
	return put(`/stores/${storeId}/config`, data)
}

/**
 * 删除门店（仅总店管理员）
 * @param {number} storeId 门店ID
 * @returns {Promise}
 */
export function deleteStore(storeId) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: storeId, deleted: true }
				})
			}, 300)
		})
	}
	return del(`/stores/${storeId}`)
}

/**
 * 获取附近的门店
 * POST /stores/nearby
 * @param {Object} params 参数
 * @param {string} params.location_source 定位来源 (CURRENT_GPS|MANUAL_PLACE|MAP_PICKER)
 * @param {number} params.latitude 纬度
 * @param {number} params.longitude 经度
 * @param {string} [params.formatted_address] 格式化地址
 * @param {string} [params.place_id] 地点ID
 * @param {number} [params.page] 页码
 * @param {number} [params.page_size] 每页数量
 * @returns {Promise}
 */
export function getNearbyStores(params) {
	if (USE_MOCK) {
		return mockGetStores(params)
	}
	return post('/stores/nearby', params)
}

// 导出模块对象
export const storeApi = {
	getStores,
	getStore,
	createStore,
	updateStore,
	updateStoreStatus,
	updateStoreConfig,
	deleteStore,
	getNearbyStores
}

export default storeApi
