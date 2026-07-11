/**
 * 模拟数据 - 会员相关
 */

import { generateUniqueCode } from './order.js'

// 模拟会员状态
let mockMemberState = {
	level: 0,
	consumed_amount: 200,
	total_amount: 200,
	balance: 0,
	points: 1257,
	new_user_coupons: 3,
	invite_code: 'ABC12DEF'
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
					avatar_url: '/static/images/avatar-placeholder.svg',
					nickname: '用户昵称',
					phone: '138****8888',
					invite_code: mockMemberState.invite_code
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
	{ id: 1, name: '满30减10优惠券', image_url: '/static/images/img-placeholder.svg', point_price: 500, coin_price: null, stock: 100, description: '满30减10' },
	{ id: 2, name: '招牌茉莉奶白 免费兑换券', image_url: '/static/images/img-placeholder.svg', point_price: 800, coin_price: null, stock: 50, description: '免费兑换招牌饮品' },
	{ id: 3, name: '品牌定制马克杯', image_url: '/static/images/img-placeholder.svg', point_price: 1500, coin_price: null, stock: 30, description: '精美定制马克杯' },
	{ id: 4, name: '泰式冬阴功锅底 5折券', image_url: '/static/images/img-placeholder.svg', point_price: 300, coin_price: null, stock: 200, description: '锅底5折优惠' },
	{ id: 5, name: '特色小食拼盘 免费兑换券', image_url: '/static/images/img-placeholder.svg', point_price: 1000, coin_price: null, stock: 80, description: '小食拼盘免费' },
	{ id: 6, name: '品牌帆布袋', image_url: '/static/images/img-placeholder.svg', point_price: 2000, coin_price: null, stock: 40, description: '品牌帆布袋' }
]

// 模拟余额兑换商品
const mockBalanceBenefits = [
	{ id: 7, name: '充值100送20', image_url: '/static/images/img-placeholder.svg', point_price: null, coin_price: 100, stock: 999, description: '充值100送20余额' },
	{ id: 8, name: '充值200送50', image_url: '/static/images/img-placeholder.svg', point_price: null, coin_price: 200, stock: 999, description: '充值200送50余额' },
	{ id: 9, name: '充值500送150', image_url: '/static/images/img-placeholder.svg', point_price: null, coin_price: 500, stock: 999, description: '充值500送150余额' },
	{ id: 10, name: '充值1000送400', image_url: '/static/images/img-placeholder.svg', point_price: null, coin_price: 1000, stock: 999, description: '充值1000送400余额' }
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

// 兑换订单轮询计数器
const _exchangePollCounters = {}

/**
 * 兑换操作（核销模式：返回 unique_code + PENDING）
 */
export function mockExchangeBenefit(data) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (data.exchange_type === 'points') {
				const benefit = mockPointsBenefits.find(b => b.id === data.product_id || b.id === data.benefit_id)
				if (!benefit) {
					return resolve({ code: -1, message: '商品不存在' })
				}
				const cost = benefit.point_price * (data.quantity || 1)
				if (mockMemberState.points < cost) {
					return resolve({ code: -1, message: '积分不足' })
				}
				mockMemberState.points -= cost
				const exchangeId = Date.now()
				const uniqueCode = generateUniqueCode()

				// Track for polling simulation
				_exchangePollCounters[exchangeId] = 0

				// Add to mock mall orders
				mockMallOrders.unshift({
					id: exchangeId,
					product_name: benefit.name,
					product_id: benefit.id,
					points_cost: cost,
					status: 'PENDING',
					unique_code: uniqueCode,
					store_id: data.store_id || 1,
					created_at: new Date().toISOString()
				})

				resolve({
					code: 0,
					message: '兑换成功，请到门店核销',
					data: {
						exchange_id: exchangeId,
						status: 'PENDING',
						unique_code: uniqueCode,
						product_name: benefit.name,
						points_cost: cost,
						remaining_points: mockMemberState.points
					}
				})
			} else if (data.exchange_type === 'balance') {
				const benefit = mockBalanceBenefits.find(b => b.id === data.product_id || b.id === data.benefit_id)
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

/**
 * 获取会员码（invite_code）
 */
export function mockGetMemberCode() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					member_code: mockMemberState.invite_code,
					nickname: '用户昵称',
					level_name: mockMemberState.level === 0 ? '普通会员' : '铂金会员'
				}
			})
		}, 200)
	})
}

// 模拟签到状态
let mockCheckinToday = false

/**
 * 模拟签到
 */
export function mockCheckin() {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (mockCheckinToday) {
				return resolve({ code: -1, message: '今日已签到' })
			}
			mockCheckinToday = true
			mockMemberState.points += 10
			resolve({
				code: 0,
				message: '签到成功',
				data: { points_earned: 10, total_points: mockMemberState.points }
			})
		}, 300)
	})
}

/**
 * 模拟获取签到状态
 */
export function mockGetCheckinStatus() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: { checked_in: mockCheckinToday }
			})
		}, 200)
	})
}

// 模拟兑换订单
const mockMallOrders = [
	{ id: 1, product_name: '满30减10优惠券', product_id: 1, points_cost: 500, status: 'REDEEMED', unique_code: 'old-code-1', store_id: 1, created_at: '2024-12-01T10:00:00Z' },
	{ id: 2, product_name: '品牌定制马克杯', product_id: 3, points_cost: 1500, status: 'PENDING', unique_code: 'old-code-2', store_id: 1, created_at: '2024-12-10T14:30:00Z' }
]

/**
 * 模拟获取兑换订单
 */
export function mockGetMallOrders() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({ code: 0, message: 'success', data: { items: mockMallOrders, total: mockMallOrders.length } })
		}, 300)
	})
}

/**
 * 模拟获取兑换订单详情
 */
export function mockGetMallOrderDetail(orderId) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const order = mockMallOrders.find(o => o.id === Number(orderId))
			if (order) {
				resolve({ code: 0, message: 'success', data: order })
			} else {
				resolve({ code: -1, message: '订单不存在' })
			}
		}, 200)
	})
}

/**
 * 模拟获取兑换订单状态（轮询核销状态）
 */
export function mockGetMallOrderStatus(orderId) {
	const id = parseInt(orderId)
	return new Promise((resolve) => {
		setTimeout(() => {
			if (_exchangePollCounters[id] !== undefined) {
				_exchangePollCounters[id]++
				if (_exchangePollCounters[id] >= 3) {
					delete _exchangePollCounters[id]
					// Update mock data
					const order = mockMallOrders.find(o => o.id === id)
					if (order) order.status = 'REDEEMED'
					resolve({
						code: 0,
						data: {
							order_id: id,
							status: 'REDEEMED'
						}
					})
					return
				}
			}

			resolve({
				code: 0,
				data: {
					order_id: id,
					status: 'PENDING'
				}
			})
		}, 200)
	})
}

/**
 * 模拟取消兑换订单
 */
export function mockCancelMallOrder(orderId) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const order = mockMallOrders.find(o => o.id === Number(orderId))
			if (!order) {
				return resolve({ code: -1, message: '订单不存在' })
			}
			if (order.status === 'REDEEMED') {
				return resolve({ code: -1, message: '已核销的订单不可取消' })
			}
			order.status = 'CANCELLED'
			mockMemberState.points += order.points_cost
			resolve({ code: 0, message: '取消成功' })
		}, 300)
	})
}

export default {
	mockGetMemberInfo,
	mockGetMemberProgress,
	mockGetMemberBalance,
	mockGetMemberPoints,
	mockGetPointsBenefits,
	mockGetBalanceBenefits,
	mockExchangeBenefit,
	mockGetMallOrderStatus
}
