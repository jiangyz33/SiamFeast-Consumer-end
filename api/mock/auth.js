/**
 * 模拟数据 - 认证相关
 */

// 模拟用户数据
export const mockUsers = [
	{
		id: 1,
		phone: '0812345678',
		email: 'user1@example.com',
		nickname: '测试用户',
		avatar_url: '/static/logo.png',
		password: '123456',
		membership_tier: 'REGULAR',
		coin_balance: 100,
		point_balance: 57
	}
]

// 模拟验证码存储
export const mockCodes = {}

/**
 * 模拟发送验证码
 */
export function mockSendCode(phone) {
	return new Promise((resolve) => {
		setTimeout(() => {
			// 生成6位验证码
			const code = Math.random().toString().slice(2, 8)
			mockCodes[phone] = {
				code,
				expireTime: Date.now() + 5 * 60 * 1000 // 5分钟有效期
			}

			console.log(`[模拟] 验证码已发送到 ${phone}: ${code}`)

			resolve({
				code: 0,
				message: '发送成功',
				data: {
					_debug_code: code // 开发环境返回验证码
				}
			})
		}, 500)
	})
}

/**
 * 模拟验证码登录
 */
export function mockLoginByCode(phone, code) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// 验证验证码
			const storedCode = mockCodes[phone]
			if (!storedCode) {
				return resolve({
					code: -1,
					message: '验证码已过期，请重新获取'
				})
			}

			if (storedCode.code !== code) {
				return resolve({
					code: -1,
					message: '验证码错误'
				})
			}

			// 清除验证码
			delete mockCodes[phone]

			// 查找或创建用户
			let user = mockUsers.find(u => u.phone === phone)
			if (!user) {
				user = {
					id: mockUsers.length + 1,
					phone,
					email: null,
					nickname: `用户${phone.slice(-4)}`,
					avatar_url: '/static/logo.png',
					membership_tier: 'REGULAR',
					coin_balance: 0,
					point_balance: 0
				}
				mockUsers.push(user)
			}

			// 生成模拟token
			const token = `mock_token_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

			resolve({
				code: 0,
				message: '登录成功',
				data: {
					token,
					userInfo: {
						id: user.id,
						phone: user.phone,
						nickname: user.nickname,
						avatar_url: user.avatar_url
					}
				}
			})
		}, 800)
	})
}

/**
 * 模拟密码登录
 */
export function mockLoginByPassword(phone, password) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const user = mockUsers.find(u => u.phone === phone)

			if (!user) {
				return resolve({
					code: -1,
					message: '用户不存在，请先注册'
				})
			}

			if (user.password !== password) {
				return resolve({
					code: -1,
					message: '密码错误'
				})
			}

			// 生成模拟token
			const token = `mock_token_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

			resolve({
				code: 0,
				message: '登录成功',
				data: {
					token,
					userInfo: {
						id: user.id,
						phone: user.phone,
						nickname: user.nickname,
						avatar_url: user.avatar_url
					}
				}
			})
		}, 800)
	})
}

/**
 * 模拟注册
 */
export function mockRegister(data) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const { phone, code, password, inviteCode } = data

			// 验证验证码
			const storedCode = mockCodes[phone]
			if (!storedCode) {
				return resolve({
					code: -1,
					message: '验证码已过期，请重新获取'
				})
			}

			if (storedCode.code !== code) {
				return resolve({
					code: -1,
					message: '验证码错误'
				})
			}

			// 清除验证码
			delete mockCodes[phone]

			// 检查用户是否已存在
			const existUser = mockUsers.find(u => u.phone === phone)
			if (existUser) {
				return resolve({
					code: -1,
					message: '该手机号已注册，请直接登录'
				})
			}

			// 创建新用户
			const newUser = {
				id: mockUsers.length + 1,
				phone,
				email: null,
				password,
				nickname: `用户${phone.slice(-4)}`,
				avatar_url: '/static/logo.png',
				membership_tier: 'REGULAR',
				coin_balance: 0,
				point_balance: 0,
				inviteCode: inviteCode || ''
			}
			mockUsers.push(newUser)

			// 生成模拟token
			const token = `mock_token_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

			console.log('[模拟] 新用户注册成功:', newUser)

			resolve({
				code: 0,
				message: '注册成功',
				data: {
					token,
					userInfo: {
						id: newUser.id,
						phone: newUser.phone,
						nickname: newUser.nickname,
						avatar_url: newUser.avatar_url
					}
				}
			})
		}, 800)
	})
}

/**
 * 模拟获取用户信息
 */
export function mockGetUserInfo() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: mockUsers[0] || null
			})
		}, 200)
	})
}

/**
 * 模拟检查用户是否存在
 */
export function mockCheckUserExist(phone) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const user = mockUsers.find(u => u.phone === phone)
			resolve({
				code: 0,
				message: 'success',
				data: {
					exist: !!user
				}
			})
		}, 200)
	})
}

/**
 * 模拟获取金币余额
 */
export function mockGetCoinBalance() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					user_id: 1,
					coin_balance: 100
				}
			})
		}, 200)
	})
}

/**
 * 模拟更新用户信息
 */
export function mockUpdateUserInfo(data) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const user = mockUsers[0]
			if (user) {
				Object.assign(user, data)
			}
			resolve({
				code: 0,
				message: 'success',
				data: { ...user, ...data }
			})
		}, 300)
	})
}

export default {
	mockUsers,
	mockCodes,
	mockSendCode,
	mockLoginByCode,
	mockLoginByPassword,
	mockRegister,
	mockGetUserInfo,
	mockUpdateUserInfo,
	mockCheckUserExist,
	mockGetCoinBalance
}
