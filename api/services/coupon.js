/**
 * 优惠券服务
 */
import { USE_MOCK } from '../config.js'
import { get, post } from '../request.js'

/**
 * 获取券展示码（15 位数字 Y，Feistel 加密后的展示码，供收银端扫码核销）
 * GET /coupons/:user_coupon_id/display
 * @param {number} userCouponId 用户券实例 id（user_coupons.id）
 * @returns {Promise<{display_code: string, expires_in: number}>}
 *   - display_code: 15 位纯数字，用此生成二维码给收银员扫描
 *   - expires_in: 0 = 永久有效（同一券的 Y 不变，可本地缓存）
 */
export function getCouponDisplayCode(userCouponId) {
	return get(`/coupons/${userCouponId}/display`)
}
import {
	mockGetMyCoupons,
	mockGetAvailableCoupons,
	mockReceiveCoupon,
	mockGetNewbiePack,
	mockReceiveNewbiePack
} from '../mock/coupon.js'

/**
 * 获取我的优惠券列表
 * @param {Object} params 查询参数
 * @param {String} params.status 状态 (available/used/expired/all)
 * @param {String} params.type 类型 (dinein/delivery/all)
 * @param {Number} [params.page=1] 页码
 * @param {Number} [params.page_size=200] 每页数量（默认 200，覆盖后端默认 20 限制）
 * @returns {Promise}
 */
export function getMyCoupons(params = {}) {
	if (USE_MOCK) {
		return mockGetMyCoupons(params)
	}
	// 默认拉 200 条，避免后端默认 page_size=20 导致只能看到前 20 张
	const query = { page: 1, page_size: 200, ...params }
	return get('/coupons', query)
}

/**
 * 获取可用优惠券（下单时使用）
 * 后端新增的专用接口：GET /coupons/available
 * 已按订单上下文过滤（用户拥有 + ACTIVE + 金额门槛满足 + 未过期）
 * @param {Object} params 查询参数
 * @param {Number} params.store_id 门店ID
 * @param {Number} params.order_amount 订单金额
 * @param {String} [params.order_type] 订单类型 (dinein/delivery/groupbuy/hostel)
 * @returns {Promise}
 */
export function getAvailableCoupons(params) {
	if (USE_MOCK) {
		return mockGetAvailableCoupons(params)
	}
	// 传所有上下文参数给后端，让后端按规则过滤
	const query = { page_size: 100 }
	if (params?.order_amount !== undefined && params?.order_amount !== null) {
		query.order_amount = params.order_amount
	}
	if (params?.store_id) query.store_id = params.store_id
	if (params?.order_type) query.order_type = params.order_type
	return get('/coupons/available', query)
}

/**
 * 领取优惠券
 * @param {Number} couponId 优惠券模板ID (coupon_id)
 * @returns {Promise}
 */
export function receiveCoupon(couponId) {
	if (USE_MOCK) {
		return mockReceiveCoupon(couponId)
	}
	return post('/coupons/claim', { coupon_id: couponId })
}

/**
 * 获取新人券包
 * @returns {Promise}
 */
export function getNewbiePack() {
	if (USE_MOCK) {
		return mockGetNewbiePack()
	}
	return get('/coupons/newbie-pack')
}

/**
 * 领取新人券包
 * 注意：后端 newbie-pack 接口本身即可领取，无需单独的 receive 接口
 * @returns {Promise}
 */
export function receiveNewbiePack() {
	if (USE_MOCK) {
		return mockReceiveNewbiePack()
	}
	// 后端无单独的领取接口，先获取新人券包信息再逐一领取
	return get('/coupons/newbie-pack').then(res => {
		const d = res.data || res; const coupons = d.coupons || d.items || []
		if (coupons.length === 0) {
			return { code: 0, message: '没有可领取的新人券', data: { received: [] } }
		}
		// 批量领取所有新人券
		return Promise.all(
			coupons.map(c => post('/coupons/claim', { coupon_id: c.id || c.coupon_id }))
		).then(() => ({
			code: 0,
			message: '新人券包领取成功',
			data: { received: coupons.length }
		}))
	})
}

/**
 * 获取可领取的优惠券列表
 * 使用活动优惠券接口替代原 receivable 接口
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getReceivableCoupons(params = {}) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: {
						items: [
							{ id: 10, name: '限时特惠券', amount: 15, min_spend: 80, type: 'dinein', is_received: false },
							{ id: 11, name: '周末福利券', amount: 8, min_spend: 40, type: 'all', is_received: false }
						],
						total: 2
					}
				})
			}, 300)
		})
	}
	return get('/campaigns/coupons', params)
}


/**
 * 计算优惠券折扣
 * @param {Object} params
 * @param {number} params.coupon_id 优惠券ID
 * @param {number} params.order_amount 订单金额
 * @param {number} [params.store_id] 门店ID
 * @param {string} [params.order_type] 订单类型
 * @returns {Promise}
 */
export function calculateDiscount(params) {
	if (USE_MOCK) {
		return mockCalculateDiscount(params)
	}
	return post('/coupons/calculate', params)
}

export const couponApi = {
	getMyCoupons,
	getAvailableCoupons,
	receiveCoupon,
	getNewbiePack,
	receiveNewbiePack,
	getReceivableCoupons,
	calculateDiscount
}

export default couponApi
