/**
 * 火锅相关 API
 */
import { get, post } from '../request.js'

/**
 * 获取火锅菜单
 * @param {Object} params
 * @param {number} [params.store_id] 门店ID
 * @returns {Promise}
 */
export function getHotpotMenu(params = {}) {
	return get('/hotpot/menu', params)
}

/**
 * 获取可用桌台
 * @param {Object} params
 * @param {number} [params.store_id] 门店ID
 * @param {string} [params.date] 日期
 * @param {string} [params.time] 时间
 * @param {number} [params.guest_count] 人数
 * @returns {Promise}
 */
export function getAvailableTables(params = {}) {
	return get('/hotpot/tables/available', params)
}

/**
 * 创建自助火锅订单
 * @param {Object} data
 * @param {number} data.store_id 门店ID
 * @param {number} data.table_id 桌台ID
 * @param {number} data.guest_count 人数
 * @param {string} data.order_source 订单来源
 * @returns {Promise}
 */
export function createBuffetOrder(data) {
	return post('/hotpot/orders', data)
}

/**
 * 创建论件火锅订单
 * @param {Object} data
 * @param {number} data.store_id 门店ID
 * @param {number} data.table_id 桌台ID
 * @param {Array} data.items 菜品列表
 * @param {string} data.order_source 订单来源
 * @returns {Promise}
 */
export function createPiecewiseOrder(data) {
	return post('/hotpot/orders/piecewise', data)
}

export const hotpotApi = {
	getHotpotMenu,
	getAvailableTables,
	createBuffetOrder,
	createPiecewiseOrder
}

export default hotpotApi
