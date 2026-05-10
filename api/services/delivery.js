/**
 * 配送相关 API
 */
import { USE_MOCK } from '../config.js'
import { get } from '../request.js'
import { mockGetOrderDelivery } from '../mock/delivery.js'

/**
 * 获取订单配送信息
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export function getOrderDelivery(orderId) {
	if (USE_MOCK) {
		return mockGetOrderDelivery(orderId)
	}
	// 配送接口可能不存在（堂食/自提订单），静默失败不弹错误提示
	return get(`/orders/${orderId}/delivery`, {}, { silent: true }).catch(() => ({ code: -1, data: null }))
}

/**
 * 获取我的配送列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getMyDeliveries(params = {}) {
	return get('/my-deliveries', params)
}

export const deliveryApi = {
	getOrderDelivery
}

export default deliveryApi
