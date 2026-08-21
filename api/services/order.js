/**
 * 订单相关 API
 */
import { USE_MOCK } from '../config.js'
import { get, post, put, del } from '../request.js'
import {
	mockOrders,
	mockGetUserOrders,
	mockGetOrderDetail,
	mockCreateOrder,
	mockCancelOrder,
	mockGetOrderStatus
} from '../mock/order.js'

/**
 * 获取用户订单列表
 * @param {Object} params 查询参数
 * @param {string} params.status_filter 状态筛选
 * @param {string} params.order_type 订单类型
 * @param {number} params.limit 每页数量
 * @param {number} params.offset 偏移量
 * @returns {Promise}
 */
export function getUserOrders(params = {}) {
	if (USE_MOCK) {
		return mockGetUserOrders(params)
	}
	return get('/user-orders/my-orders', params)
}

/**
 * 获取订单详情
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export function getOrderDetail(orderId) {
	if (USE_MOCK) {
		return mockGetOrderDetail(orderId)
	}
	return get(`/user-orders/${orderId}`)
}

/**
 * 创建订单
 * @param {Object} data 订单数据
 * @param {number} data.store_id 门店ID
 * @param {string} data.order_type 订单类型
 * @param {string} data.order_source 订单来源
 * @param {string} data.table_number 桌号
 * @param {Array} data.items 菜品列表
 * @param {boolean} data.use_coins 是否使用金币
 * @param {number} data.coins_to_use 使用金币数量
 * @param {string} data.remark 备注
 * @returns {Promise}
 */
export function createOrder(data) {
	if (USE_MOCK) {
		return mockCreateOrder(data)
	}
	const orderData = { ...data }
	if (orderData.items && Array.isArray(orderData.items)) {
		orderData.items = orderData.items.map(item => ({
			menu_item_id: item.menu_item_id || item.id,
			item_name: item.item_name || item.name,
			item_name_en: item.item_name_en || item.name_en || null,
			item_name_th: item.item_name_th || item.name_th || null,
			quantity: item.quantity,
			unit_price: item.unit_price || item.price,
			specs: item.specs || null,
			remark: item.remark || null
		}))
	}
	return post('/user-orders', orderData)
}

/**
 * 结算预览(不真正下单)
 * POST /orders/preview
 * @param {Object} data 和 createOrder 一样的参数
 * @returns {Promise<{subtotal, campaign_discount, campaign_name, campaign_type, coupon_discount, coin_deduct, coins_used, total_amount}>}
 */
export function previewOrder(data) {
	const orderData = { ...data }
	if (orderData.items && Array.isArray(orderData.items)) {
		orderData.items = orderData.items.map(item => ({
			menu_item_id: item.menu_item_id || item.id,
			item_name: item.item_name || item.name,
			item_name_en: item.item_name_en || item.name_en || null,
			item_name_th: item.item_name_th || item.name_th || null,
			quantity: item.quantity,
			unit_price: item.unit_price || item.price,
			specs: item.specs || null,
			remark: item.remark || null
		}))
	}
	return post('/orders/preview', orderData)
}

/**
 * 取消订单
 * @param {number} orderId 订单ID
 * @param {string} reason 取消原因
 * @returns {Promise}
 */
export function cancelOrder(orderId, reason = '') {
	if (USE_MOCK) {
		return mockCancelOrder(orderId)
	}
	return post(`/user-orders/${orderId}/cancel?reason=${encodeURIComponent(reason)}`)
}

/**
 * 再来一单
 * @param {number} orderId 原订单ID
 * @returns {Promise}
 */
export function reorder(orderId) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: {
						items: mockOrders.find(o => o.id === orderId)?.items || []
					}
				})
			}, 300)
		})
	}
	return post(`/user-orders/${orderId}/reorder`)
}

/**
 * 获取订单状态
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export function getOrderStatus(orderId) {
	if (USE_MOCK) {
		return mockGetOrderStatus(orderId)
	}
	return get(`/user-orders/${orderId}/status`)
}

/**
 * 获取金币余额
 * @returns {Promise}
 */
export function getCoinBalance() {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			resolve({
				code: 0,
				data: {
					user_id: 1,
					coin_balance: 100
				}
			})
		})
	}
	return get('/user-orders/coin-balance')
}

/**
 * 计算金币抵扣
 * @param {number} orderAmount 订单金额
 * @param {number} coinsToUse 使用金币数
 * @returns {Promise}
 */
export function calculateCoinDeduct(orderAmount, coinsToUse) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			const maxDeduct = Math.min(orderAmount, coinsToUse)
			resolve({
				code: 0,
				data: {
					order_amount: orderAmount,
					coin_balance: coinsToUse,
					deduct_amount: maxDeduct,
					final_amount: orderAmount - maxDeduct
				}
			})
		})
	}
	return post('/user-orders/calculate-coin-deduct', {
		order_amount: orderAmount,
		coins_to_use: coinsToUse
	})
}

/**
 * 获取金币档位列表（按档位抵扣改造后的新接口）
 * GET /api/v1/coin-tiers
 * @param {Object} params
 * @param {number} params.subtotal 商品原始小计
 * @param {number} [params.campaign_discount] 活动优惠原始金额
 * @param {number} [params.coupon_discount] 优惠券优惠原始金额
 * @returns {Promise<{coin_balance, max_deduct_percent, tiers: [{id, coin_amount, deduct_amount, rate, usable, reason, reason_en, reason_th}]}>}
 */
export function getCoinTiers(params = {}) {
	return get('/coin-tiers', params)
}

// ============ 后台订单接口 ============

/**
 * 获取门店订单列表（后台）
 * @param {Object} params 查询参数
 * @param {number} params.store_id 门店ID
 * @param {string} params.order_type 订单类型
 * @param {string} params.status_filter 状态筛选
 * @returns {Promise}
 */
export function getStoreOrders(params) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			resolve({
				code: 0,
				data: mockOrders
			})
		})
	}
	return get('/orders', params)
}

/**
 * 更新订单状态（后台）
 * @param {number} orderId 订单ID
 * @param {string} status 新状态
 * @param {string} cancelReason 取消原因（可选）
 * @returns {Promise}
 */
export function updateOrderStatus(orderId, status, cancelReason = null) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			resolve({
				code: 0,
				data: {
					id: orderId,
					status: status
				}
			})
		})
	}
	return put(`/orders/${orderId}/status`, {
		status,
		cancel_reason: cancelReason
	})
}

// 导出模块对象
/**
 * 获取订单交易类型列表
 * @returns {Promise}
 */
export function getTransactionTypes() {
	return get('/user-orders/transaction-types')
}

export const orderApi = {
	getUserOrders,
	getOrderDetail,
	createOrder,
	cancelOrder,
	reorder,
	getOrderStatus,
	getCoinBalance,
	calculateCoinDeduct,
	getCoinTiers,
	getStoreOrders,
	updateOrderStatus
}

export default orderApi
