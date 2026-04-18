/**
 * 支付相关 API
 */
import { USE_MOCK } from '../config.js'
import { get, post } from '../request.js'

/**
 * 获取支付方式列表
 * @returns {Promise}
 */
export function getPaymentMethods() {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			resolve({
				code: 0,
				data: {
					methods: [
						{ code: 'visa', name: '信用卡支付', description: '支持 Visa/MasterCard' },
						{ code: 'paypal', name: 'PayPal', description: 'PayPal 支付' },
						{ code: 'cash_pos', name: '现金支付', description: 'POS 机现金收款' },
						{ code: 'coin_deduct', name: '金币抵扣', description: '使用会员金币抵扣' },
						{ code: 'coupon', name: '优惠券', description: '使用优惠券支付' }
					]
				}
			})
		})
	}
	return get('/payments/methods')
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
						amount: data.amount,
						status: 'SUCCESS',
						paid_at: new Date().toISOString()
					}
				})
			}, 500)
		})
	}
	return post('/payments', data)
}

/**
 * 金币支付
 * @param {Object} data 支付数据
 * @param {number} data.order_id 订单ID
 * @param {number} data.amount 使用金币数量
 * @param {string} data.remark 备注
 * @returns {Promise}
 */
export function coinPayment(data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: {
						payment_id: Date.now(),
						amount: data.amount,
						status: 'SUCCESS'
					}
				})
			}, 500)
		})
	}
	return post('/payments/coin', data)
}

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
export function confirmPayment(paymentId) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: '支付成功',
					data: {
						payment_id: paymentId,
						status: 'SUCCESS'
					}
				})
			}, 500)
		})
	}
	return post(`/payments/${paymentId}/confirm`)
}

/**
 * 退款
 * @param {number} paymentId 支付ID
 * @param {string} reason 退款原因
 * @returns {Promise}
 */
export function refundPayment(paymentId, reason = '') {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: '退款成功',
					data: {
						payment_id: paymentId,
						status: 'REFUNDED'
					}
				})
			}, 500)
		})
	}
	return post(`/payments/${paymentId}/refund?reason=${encodeURIComponent(reason)}`)
}

/**
 * 获取订单支付记录
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export function getOrderPayments(orderId) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			resolve({
				code: 0,
				data: [
					{
						id: 1,
						order_id: orderId,
						amount: 83.00,
						payment_method: 'cash_pos',
						status: 'SUCCESS',
						paid_at: new Date().toISOString()
					}
				]
			})
		})
	}
	return get(`/payments/order/${orderId}`)
}

// 导出模块对象
export const paymentApi = {
	getPaymentMethods,
	createPayment,
	coinPayment,
	getPaymentDetail,
	confirmPayment,
	refundPayment,
	getOrderPayments
}

export default paymentApi
