/**
 * 支付相关 API
 */
import { USE_MOCK } from '../config.js'
import { get, post } from '../request.js'

/**
 * 获取支付方式列表
 * @returns {Promise}
 */
export function getPaymentMethods(storeId) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			resolve({
				code: 0,
				data: {
					methods: [
						{ code: 'cash_pos', name: '现金支付' },
					]
				}
			})
		})
	}
	return get('/payments/methods', { store_id: storeId }, { silent: true }).then(res => {
		// 后端返回 [{method, is_enabled}]，前端需要 [{code, name}]
		const rawMethods = Array.isArray(res.data) ? res.data : []
		const nameMap = {
			cash_pos: '现金支付', visa: '信用卡', promptpay: 'PromptPay',
		}
		return {
			code: 0,
			data: {
				methods: rawMethods
					.filter(m => m.is_enabled)
					.map(m => ({ code: m.method, name: nameMap[m.method] || m.method }))
			}
		}
	}).catch(() => ({
		code: 0,
		data: {
			methods: [
				{ code: 'cash_pos', name: '现金支付' },
			]
		}
	}))
}

/**
 * 创建支付
 * @param {Object} data 支付数据
 * @param {number} data.order_id 订单ID
 * @param {number} data.amount 支付金额
 * @param {string} data.payment_method 支付方式
 * @param {string} data.remark 备注
 * @returns {Promise}
 */
export function createPayment(data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: {
						payment_id: Date.now(),
						status: 'SUCCESS',
						paid_at: new Date().toISOString()
					}
				})
			}, 500)
		})
	}
	return post('/payments', { order_id: data.order_id, method: data.payment_method || data.method })
}

/**
 * 金币支付
 * @param {Object} data 支付数据
 * @param {number} data.order_id 订单ID
 * @param {number} data.amount 使用金币数量
 * @param {string} data.remark 备注
 * @returns {Promise}
 */

/**
 * 获取支付详情
 * @param {number} paymentId 支付ID
 * @returns {Promise}
 */
export function getPaymentDetail(paymentId) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			resolve({
				code: 0,
				data: {
					id: paymentId,
					order_id: 1,
					amount: 83.00,
					payment_method: 'cash_pos',
					status: 'SUCCESS',
					transaction_id: `TXN${Date.now()}`,
					paid_at: new Date().toISOString()
				}
			})
		})
	}
	return get(`/payments/${paymentId}`)
}

/**
 * 确认支付（模拟）
 * @param {number} paymentId 支付ID
 * @returns {Promise}
 */

/**
 * 退款
 * @param {number} paymentId 支付ID
 * @param {string} reason 退款原因
 * @returns {Promise}
 */

/**
 * 获取订单支付记录
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */

/**
 * 获取支付记录列表
 * @param {Object} params
 * @param {number} [params.page] 页码
 * @param {number} [params.page_size] 每页数量
 * @returns {Promise}
 */
export function getPayments(params = {}) {
	return get('/payments', params)
}

// 导出模块对象
export const paymentApi = {
	getPaymentMethods,
	createPayment,
	getPaymentDetail,
	getPayments
}

export default paymentApi
