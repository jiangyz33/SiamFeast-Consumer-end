/**
 * 模拟数据 - 优惠券相关
 */

// 模拟优惠券列表
let mockCouponState = [
	{
		id: 1,
		name: '新客专享优惠券',
		amount: 10,
		min_spend: 50,
		type: 'dinein',
		validity_start: '2024-01-01',
		validity_end: '2025-12-31',
		status: 'available',
		description: '新用户专享优惠'
	},
	{
		id: 2,
		name: '满减优惠券',
		amount: 20,
		min_spend: 100,
		type: 'delivery',
		validity_start: '2024-01-01',
		validity_end: '2025-12-31',
		status: 'available',
		description: '外卖满减'
	},
	{
		id: 3,
		name: '会员专属优惠券',
		amount: 15,
		min_spend: 80,
		type: 'dinein',
		validity_start: '2024-01-01',
		validity_end: '2024-11-30',
		status: 'expired',
		description: '会员专属'
	},
	{
		id: 4,
		name: '外卖满减券',
		amount: 5,
		min_spend: 30,
		type: 'delivery',
		validity_start: '2024-01-01',
		validity_end: '2025-12-25',
		status: 'available',
		description: '外卖优惠'
	},
	{
		id: 5,
		name: '周末特惠券',
		amount: 8,
		min_spend: 40,
		type: 'dinein',
		validity_start: '2024-01-01',
		validity_end: '2025-12-20',
		status: 'available',
		description: '周末专享'
	},
	{
		id: 6,
		name: '外卖新用户券',
		amount: 12,
		min_spend: 60,
		type: 'delivery',
		validity_start: '2024-01-01',
		validity_end: '2024-10-30',
		status: 'expired',
		description: '新用户外卖'
	}
]

// 新人礼包领取状态
let newbiePackReceived = false

/**
 * 模拟获取我的优惠券
 */
export function mockGetMyCoupons(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let filtered = [...mockCouponState]

			if (params.status && params.status !== 'all') {
				filtered = filtered.filter(c => c.status === params.status)
			}

			if (params.type && params.type !== 'all') {
				filtered = filtered.filter(c => c.type === params.type || c.type === 'all')
			}

			resolve({
				code: 0,
				message: 'success',
				data: {
					items: filtered,
					total: filtered.length
				}
			})
		}, 300)
	})
}

/**
 * 模拟获取可用优惠券
 * @param {Object} params
 * @param {Number} params.amount 订单金额
 * @param {Number} params.store_id 门店ID
 * @param {String} params.order_type 订单类型 (dinein/delivery)
 */
export function mockGetAvailableCoupons(params) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let available = mockCouponState.filter(c => c.status === 'available')

			// 按订单类型筛选
			if (params && params.order_type) {
				available = available.filter(c => c.type === params.order_type || c.type === 'all')
			}

			// 按最低消费筛选
			if (params && params.amount) {
				available = available.filter(c => !c.min_spend || params.amount >= c.min_spend)
			}

			// 按门店筛选（mock中不限制门店）
			const bestCoupon = available.length > 0
				? available.reduce((best, c) => c.amount > best.amount ? c : best, available[0])
				: null

			resolve({
				code: 0,
				message: 'success',
				data: {
					items: available,
					best_coupon: bestCoupon
				}
			})
		}, 300)
	})
}

/**
 * 模拟领取优惠券
 */
export function mockReceiveCoupon(couponId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const coupon = mockCouponState.find(c => c.id === parseInt(couponId))
			if (!coupon) {
				return resolve({ code: -1, message: '优惠券不存在' })
			}
			if (coupon.status !== 'available') {
				return resolve({ code: -1, message: '优惠券已领取或已过期' })
			}
			// 更新优惠券状态为已领取
			coupon.status = 'claimed'
			resolve({
				code: 0,
				message: '领取成功',
				data: { user_coupon_id: Date.now() }
			})
		}, 300)
	})
}

/**
 * 模拟获取新人券包
 */
export function mockGetNewbiePack() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					pack_name: '新人专享礼包',
					pack_description: '新用户专属优惠，限时领取',
					coupons: [
						{ id: 1, name: '满30减10优惠券', amount: 10, min_spend: 30, validity_days: 30 },
						{ id: 2, name: '满50减15优惠券', amount: 15, min_spend: 50, validity_days: 30 },
						{ id: 3, name: '满100减30优惠券', amount: 30, min_spend: 100, validity_days: 30 }
					],
					total_value: 55,
					is_received: newbiePackReceived
				}
			})
		}, 300)
	})
}

/**
 * 模拟领取新人券包
 */
export function mockReceiveNewbiePack() {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (newbiePackReceived) {
				return resolve({ code: -1, message: '已领取过新人礼包' })
			}
			newbiePackReceived = true
			resolve({
				code: 0,
				message: '领取成功',
				data: { received_coupons: [1, 2, 3] }
			})
		}, 300)
	})
}


/**
 * 模拟计算优惠券折扣
 */
export function mockCalculateDiscount(params) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const coupon = mockCouponState.find(c => c.id === Number(params.coupon_id))
			if (!coupon) {
				return resolve({ code: -1, message: '优惠券不存在' })
			}
			if (coupon.status !== 'available' && coupon.status !== 'claimed') {
				return resolve({ code: -1, message: '优惠券不可用' })
			}
			if (params.order_amount < coupon.min_spend) {
				return resolve({ code: -1, message: '未满足最低消费' })
			}
			resolve({
				code: 0,
				message: 'success',
				data: {
					coupon_id: coupon.id,
					order_amount: params.order_amount,
					discount: coupon.amount,
					final_amount: Math.max(0, params.order_amount - coupon.amount)
				}
			})
		}, 300)
	})
}

// 导出原始静态列表（只读引用）
export const mockCoupons = [...mockCouponState]

export default {
	mockCoupons,
	mockGetMyCoupons,
	mockGetAvailableCoupons,
	mockReceiveCoupon,
	mockGetNewbiePack,
	mockReceiveNewbiePack
}
