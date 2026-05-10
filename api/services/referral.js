/**
 * 推荐裂变服务
 */
import { USE_MOCK } from '../config.js'
import { get, post } from '../request.js'

/**
 * 获取我的推荐码和统计
 * @returns {Promise}
 */
export function getMyReferralInfo() {
	if (USE_MOCK) {
		return mockGetMyReferralInfo()
	}
	return get('/referrals/my-info')
}

/**
 * 获取推荐统计
 * @returns {Promise}
 */
export function getReferralStats() {
	if (USE_MOCK) {
		return mockGetReferralStats()
	}
	return get('/referrals/stats')
}

/**
 * 验证推荐码
 * @param {string} code 推荐码
 * @returns {Promise}
 */
export function validateReferralCode(code) {
	if (USE_MOCK) {
		return mockValidateReferralCode(code)
	}
	return get('/referrals/validate-code', { code })
}

/**
 * 绑定推荐人
 * @param {string} referralCode 推荐码
 * @returns {Promise}
 */
export function bindReferral(referralCode) {
	if (USE_MOCK) {
		return mockBindReferral(referralCode)
	}
	return post('/referrals/bind', { referral_code: referralCode })
}

/**
 * 获取我推荐的用户列表
 * @param {Object} params
 * @param {number} [params.level] 层级 (1=直接, 2=间接)
 * @param {number} [params.page] 页码
 * @param {number} [params.page_size] 每页数量
 * @returns {Promise}
 */
export function getMyReferees(params = {}) {
	if (USE_MOCK) {
		return mockGetMyReferees(params)
	}
	return get('/referrals/my-referees', params)
}

/**
 * 获取推荐奖励记录
 * @param {Object} params
 * @param {string} [params.reward_type] 奖励类型 (SIGN_UP/FIRST_ORDER/ORDER_COMMISSION)
 * @param {number} [params.page] 页码
 * @param {number} [params.page_size] 每页数量
 * @returns {Promise}
 */
export function getMyReferralRewards(params = {}) {
	if (USE_MOCK) {
		return mockGetMyReferralRewards(params)
	}
	return get('/referrals/my-rewards', params)
}

// ===== 模拟数据 =====

function mockGetMyReferralInfo() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					referral_code: 'USER' + Math.floor(Math.random() * 9000 + 1000),
					share_link: 'https://siamfeast.com/ref/USER123',
					total_referrals: 3,
					pending_rewards: 50
				}
			})
		}, 300)
	})
}

function mockGetReferralStats() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					total_referrals: 3,
					sign_up_rewards: 30,
					first_order_rewards: 50,
					total_coins_earned: 150
				}
			})
		}, 300)
	})
}

function mockValidateReferralCode(code) {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (code && code.length >= 4) {
				resolve({ code: 0, message: 'success', data: { valid: true, referrer_name: '用户***' } })
			} else {
				resolve({ code: -1, message: '推荐码无效' })
			}
		}, 200)
	})
}

function mockBindReferral(code) {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (code && code.length >= 4) {
				resolve({ code: 0, message: '绑定成功' })
			} else {
				resolve({ code: -1, message: '推荐码无效' })
			}
		}, 300)
	})
}

function mockGetMyReferees(params) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					items: [
						{ id: 1, nickname: '用户A', phone: '081****123', created_at: '2024-10-15', level: 1 },
						{ id: 2, nickname: '用户B', phone: '082****456', created_at: '2024-11-01', level: 1 }
					],
					total: 2
				}
			})
		}, 300)
	})
}

function mockGetMyReferralRewards(params) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					items: [
						{ id: 1, type: 'SIGN_UP', coins: 10, from_user: '用户A', created_at: '2024-10-15' },
						{ id: 2, type: 'FIRST_ORDER', coins: 50, from_user: '用户A', created_at: '2024-10-20' },
						{ id: 3, type: 'SIGN_UP', coins: 10, from_user: '用户B', created_at: '2024-11-01' }
					],
					total: 3
				}
			})
		}, 300)
	})
}

export const referralApi = {
	getMyReferralInfo,
	getReferralStats,
	validateReferralCode,
	bindReferral,
	getMyReferees,
	getMyReferralRewards
}

export default referralApi
