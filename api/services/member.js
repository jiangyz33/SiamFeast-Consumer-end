/**
 * 会员服务
 */
import { USE_MOCK } from '../config.js'
import { get, post } from '../request.js'
import {
	mockGetMemberInfo,
	mockGetMemberProgress,
	mockGetMemberBalance,
	mockGetMemberPoints,
	mockGetPointsBenefits,
	mockGetBalanceBenefits,
	mockExchangeBenefit,
	mockGetMemberCode,
	mockGetMallOrderStatus
} from '../mock/member.js'

/**
 * 获取会员信息
 * @returns {Promise}
 */
export function getMemberInfo() {
	if (USE_MOCK) {
		return mockGetMemberInfo()
	}
	return get('/member/info')
}

/**
 * 获取会员等级进度
 * @returns {Promise}
 */
export function getMemberProgress() {
	if (USE_MOCK) {
		return mockGetMemberProgress()
	}
	return get('/member/progress')
}

/**
 * 获取用户余额
 * @returns {Promise}
 */
export function getMemberBalance() {
	if (USE_MOCK) {
		return mockGetMemberBalance()
	}
	return get('/member/balance')
}

/**
 * 获取用户积分
 * @returns {Promise}
 */
export function getMemberPoints() {
	if (USE_MOCK) {
		return mockGetMemberPoints()
	}
	return get('/member/points')
}

/**
 * 获取积分兑换商品（GET /mall/products?exchange_type=POINT）
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getPointsBenefits(params = {}) {
	if (USE_MOCK) {
		return mockGetPointsBenefits(params)
	}
	return get('/mall/products', { ...params, exchange_type: 'POINT' })
}

/**
 * 获取余额兑换商品（GET /mall/products?exchange_type=COIN）
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getBalanceBenefits(params = {}) {
	if (USE_MOCK) {
		return mockGetBalanceBenefits(params)
	}
	return get('/mall/products', { ...params, exchange_type: 'COIN' })
}

/**
 * 兑换商品（核销模式：POST /mall/redeem）
 * @param {Object} data 兑换数据
 * @param {Number} data.product_id 商品ID
 * @param {String} data.exchange_type 兑换类型 (points/balance)
 * @param {Number} data.quantity 数量
 * @param {Number} data.store_id 门店ID（核销门店）
 * @param {Number} data.points_amount 积分数量（积分兑换时必传）
 * @param {Number} data.coin_amount 金币数量（余额兑换时必传）
 * @returns {Promise}
 */
export function exchangeBenefit(data) {
	if (USE_MOCK) {
		return mockExchangeBenefit(data)
	}
	const payload = {
		product_id: data.product_id || data.benefit_id,
		quantity: data.quantity || 1,
		exchange_type: data.exchange_type || 'points',
		store_id: data.store_id
	}
	if (data.coin_amount) payload.coin_amount = data.coin_amount
	if (data.points_amount) payload.points_amount = data.points_amount
	return post('/mall/redeem', payload)
}

/**
 * 获取会员码（invite_code，用于收银端扫码识别用户）
 * @returns {Promise}
 */
export function getMemberCode() {
	if (USE_MOCK) {
		return mockGetMemberCode()
	}
	return get('/member/code')
}

/**
 * 每日签到
 * @returns {Promise}
 */
export function checkin() {
	if (USE_MOCK) {
		return mockCheckin()
	}
	return post('/member/checkin')
}

/**
 * 获取签到状态
 * @returns {Promise}
 */
export function getCheckinStatus() {
	if (USE_MOCK) {
		return mockGetCheckinStatus()
	}
	return get('/member/checkin')
}

/**
 * 获取积分商城兑换订单列表
 * @param {Object} params
 * @param {number} [params.page] 页码
 * @param {number} [params.page_size] 每页数量
 * @returns {Promise}
 */
export function getMallOrders(params = {}) {
	if (USE_MOCK) {
		return mockGetMallOrders(params)
	}
	return get('/mall/my-orders', params)
}

/**
 * 获取兑换订单详情
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export function getMallOrderDetail(orderId) {
	if (USE_MOCK) {
		return mockGetMallOrderDetail(orderId)
	}
	return get('/mall/my-orders/' + orderId)
}

/**
 * 获取兑换订单状态（轮询核销状态）
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export function getMallOrderStatus(orderId) {
	if (USE_MOCK) {
		return mockGetMallOrderStatus(orderId)
	}
	return get('/mall/my-orders/' + orderId)
}

/**
 * 取消兑换订单
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export function cancelMallOrder(orderId) {
	if (USE_MOCK) {
		return mockCancelMallOrder(orderId)
	}
	return post('/mall/my-orders/' + orderId + '/cancel')
}

export const memberApi = {
	getMemberInfo,
	getMemberProgress,
	getMemberBalance,
	getMemberPoints,
	getPointsBenefits,
	getBalanceBenefits,
	exchangeBenefit,
	getMemberCode,
	checkin,
	getCheckinStatus,
	getMallOrders,
	getMallOrderDetail,
	getMallOrderStatus,
	cancelMallOrder
}

export default memberApi
