/**
 * 会员服务
 */
import { USE_MOCK } from '../config.js'
import { get, post } from '../request.js'

/**
 * 获取动态会员码 token（10 位字母数字，60 秒一次性，供收银端扫描识别用户）
 * POST /qr-token
 * @returns {Promise<{token: string, expires_in: number}>}
 *   - token: 10 位字母数字，用此生成二维码给收银员扫描
 *   - expires_in: 60 秒（过期后需重新获取）
 *
 * 关键行为：
 *   - token 是一次性的，被收银员扫描后立即失效（后端 GETDEL）
 *   - 同一用户同时只有一个有效 token，获取新 token 会让旧 token 失效
 */
export function getQRToken() {
	return post('/qr-token')
}
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
 * 获取所有启用的会员档位配置（公共接口，无需 auth）
 * GET /api/v1/membership/tiers
 * 返回档位列表（按 sort_order 升序），含三语名称/图标/颜色/升级阈值/奖励
 * @returns {Promise<{tiers: Array}>}
 */
export function getMembershipTiers() {
	return get('/membership/tiers')
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
	if (data.pickup_time) payload.pickup_time = data.pickup_time
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

/**
 * 获取金币换积分配置
 * GET /coins/exchange-config
 * 返回:points_per_coin / min_coins_per_exchange / max_points_per_day / is_enabled
 */
export function getCoinExchangeConfig() {
	return get('/coins/exchange-config')
}

/**
 * 金币换积分
 * POST /coins/convert-points
 * @param {number} coinsToSpend 要消耗的金币数
 * @returns {Promise<{coins_spent, points_received, coin_balance_after, point_balance_after}>}
 *
 * 错误码:
 *   INVALID_AMOUNT          兑换数量太少(< min_coins_per_exchange)
 *   INSUFFICIENT_COINS      金币余额不足
 *   EXCHANGE_DISABLED       功能未启用
 *   DAILY_LIMIT_EXCEEDED    今日已达上限
 */
export function convertCoinsToPoints(coinsToSpend) {
	return post('/coins/convert-points', { coins_to_spend: coinsToSpend })
}

/**
 * 查询生日奖励状态
 * GET /birthday-status
 * 返回 is_birthday_today / claimable / reward_type / reward_amount / already_claimed / reason
 *
 * reason 可能值:
 *   disabled             生日奖励未启用
 *   not_birthday_today   今天不是生日
 *   claimed              当年已领取
 *   no_birthday          未设置生日
 */
export function getBirthdayStatus() {
	return get('/birthday-status')
}

/**
 * 领取生日奖励
 * POST /birthday/claim
 * @returns {Promise<{reward_type, reward_amount, grant_id, coin_balance_after?, point_balance_after?}>}
 *
 * 错误码:
 *   not_birthday_today            今天不是生日
 *   already_claimed               当年已领过
 *   disabled                      后台未启用
 *   no_birthday                   未设置生日
 *   BIRTHDAY_COUPON_UNAVAILABLE   生日券暂不可用
 */
export function claimBirthday() {
	return post('/birthday/claim')
}

export const memberApi = {
	getMemberInfo,
	getMemberProgress,
	getMembershipTiers, // 动态档位（HMR 强制刷新标记）
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
	cancelMallOrder,
	getCoinExchangeConfig,
	convertCoinsToPoints,
	getBirthdayStatus,
	claimBirthday
}

export default memberApi
