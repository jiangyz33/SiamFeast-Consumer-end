/**
 * 模拟数据 - 会员相关
 */

// 模拟会员状态
let mockMemberState = {
	level: 0,
	consumed_amount: 200,
	total_amount: 200,
	balance: 0,
	points: 1257,
	new_user_coupons: 3
}

/**
 * 获取会员信息
 */
export function mockGetMemberInfo() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					user_id: 1,
					level: mockMemberState.level,
					level_name: mockMemberState.level === 0 ? '普通会员' : '铂金会员',
					consumed_amount: mockMemberState.consumed_amount,
					total_amount: mockMemberState.total_amount,
					balance: mockMemberState.balance,
					points: mockMemberState.points,
					new_user_coupons: mockMemberState.new_user_coupons,
					avatar_url: '/static/logo.png',
					nickname: '用户昵称',
					phone: '138****8888'
				}
			})
		}, 300)
	})
}

/**
 * 获取会员等级进度
 */
export function mockGetMemberProgress() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					current_level: mockMemberState.level,
					current_level_name: mockMemberState.level === 0 ? '普通会员' : '铂金会员',
					next_level: 1,
					next_level_name: '铂金会员',
					consumed_amount: mockMemberState.consumed_amount,
					required_amount: mockMemberState.total_amount,
					progress_percent: (mockMemberState.consumed_amount / mockMemberState.total_amount) * 100
				}
			})
		}, 300)
	})
}

/**
 * 获取余额
 */
export function mockGetMemberBalance() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					balance: mockMemberState.balance,
					frozen_balance: 0,
					available_balance: mockMemberState.balance
				}
			})
		}, 300)
	})
}

/**
 * 获取积分
 */
export function mockGetMemberPoints() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					points: mockMemberState.points,
					expiring_soon: 100,
					expiring_date: '2025-12-31'
				}
			})
		}, 300)
	})
}

// 模拟积分兑换商品
const mockPointsBenefits = [
	{ id: 1, name: '满30减10优惠券', image_url: '/static/logo.png', point_price: 500, coin_price: null, stock: 100, description: '满30减10' },
	{ id: 2, name: '招牌茉莉奶白 免费兑换券', image_url: '/static/logo.png', point_price: 800, coin_price: null, stock: 50, description: '免费兑换招牌饮品' },
	{ id: 3, name: '品牌定制马克杯', image_url: '/static/logo.png', point_price: 1500, coin_price: null, stock: 30, description: '精美定制马克杯' },
	{ id: 4, name: '泰式冬阴功锅底 5折券', image_url: '/static/logo.png', point_price: 300, coin_price: null, stock: 200, description: '锅底5折优惠' },
	{ id: 5, name: '特色小食拼盘 免费兑换券', image_url: '/static/logo.png', point_price: 1000, coin_price: null, stock: 80, description: '小食拼盘免费' },
	{ id: 6, name: '品牌帆布袋', image_url: '/static/logo.png', point_price: 2000, coin_price: null, stock: 40, description: '品牌帆布袋' }
]

// 模拟余额兑换商品
const mockBalanceBenefits = [
	{ id: 7, name: '充值100送20', image_url: '/static/logo.png', point_price: null, coin_price: 100, stock: 999, description: '充值100送20余额' },
	{ id: 8, name: '充值200送50', image_url: '/static/logo.png', point_price: null, coin_price: 200, stock: 999, description: '充值200送50余额' },
	{ id: 9, name: '充值500送150', image_url: '/static/logo.png', point_price: null, coin_price: 500, stock: 999, description: '充值500送150余额' },
	{ id: 10, name: '充值1000送400', image_url: '/static/logo.png', point_price: null, coin_price: 1000, stock: 999, description: '充值1000送400余额' }
]

/**
 * 获取积分兑换商品
 */
export function mockGetPointsBenefits() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					items: mockPointsBenefits,
					total: mockPointsBenefits.length
				}
			})
		}, 300)
	})
}

/**
 * 获取余额兑换商品
 */
export function mockGetBalanceBenefits() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					items: mockBalanceBenefits,
					total: mockBalanceBenefits.length
				}
			})
		}, 300)
	})
}

/**
 * 兑换操作
 */
export function mockExchangeBenefit(data) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (data.exchange_type === 'points') {
				const benefit = mockPointsBenefits.find(b => b.id === data.benefit_id)
				if (!benefit) {
					return resolve({ code: -1, message: '商品不存在' })
				}
				const cost = benefit.point_price * (data.quantity || 1)
				if (mockMemberState.points < cost) {
					return resolve({ code: -1, message: '积分不足' })
				}
				mockMemberState.points -= cost
				resolve({
					code: 0,
					message: '兑换成功',
					data: {
						exchange_id: Date.now(),
						status: 'success',
						remaining_points: mockMemberState.points
					}
				})
			} else if (data.exchange_type === 'balance') {
				const benefit = mockBalanceBenefits.find(b => b.id === data.benefit_id)
				if (!benefit) {
					return resolve({ code: -1, message: '商品不存在' })
				}
				resolve({
					code: 0,
					message: 'success',
					data: {
						exchange_id: Date.now(),
						payment_url: '/pages/payment/index'
					}
				})
			} else {
				resolve({ code: -1, message: '未知兑换类型' })
			}
		}, 500)
	})
}

export default {
	mockGetMemberInfo,
	mockGetMemberProgress,
	mockGetMemberBalance,
	mockGetMemberPoints,
	mockGetPointsBenefits,
	mockGetBalanceBenefits,
	mockExchangeBenefit
}
