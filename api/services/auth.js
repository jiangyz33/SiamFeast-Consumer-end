/**
 * 认证相关 API
 */
import { USE_MOCK, TOKEN_KEY } from '../config.js'
import { get, post, put, upload } from '../request.js'

/**
 * 格式化手机号为后端要求的格式（带+66前缀）
 * 如果手机号已经以+开头则不处理，否则添加+66前缀
 * @param {string} phone 手机号
 * @returns {string}
 */
function formatPhoneForBackend(phone) {
	if (!phone) return phone
	const trimmed = phone.trim()
	if (trimmed.startsWith('+')) return trimmed
	// 去掉开头的0，然后加+66
	const digits = trimmed.replace(/^0+/, '')
	return `+66${digits}`
}
import {
	mockSendCode,
	mockLoginByCode,
	mockLoginByPassword,
	mockRegister,
	mockGetUserInfo,
	mockUpdateUserInfo,
	mockCheckUserExist,
	mockGetCoinBalance
} from '../mock/auth.js'

/**
 * 发送短信验证码
 * POST /auth/sms/send
 * @param {string} phone 手机号
 * @param {string} [purpose] 用途: register / login / reset_password
 * @returns {Promise}
 */
export function sendCode(phone, purpose = 'register') {
	const formattedPhone = formatPhoneForBackend(phone)
	if (USE_MOCK) {
		return mockSendCode(phone)
	}
	return post('/auth/sms/send', { phone: formattedPhone, purpose })
}

/**
 * 验证码登录
 * POST /auth/phone-login
 * @param {string} phone 手机号
 * @param {string} code 验证码
 * @returns {Promise}
 */
export function loginByCode(phone, code) {
	const formattedPhone = formatPhoneForBackend(phone)
	if (USE_MOCK) {
		return mockLoginByCode(phone, code)
	}
	return post('/auth/phone-login', {
		phone: formattedPhone,
		code
	})
}

/**
 * 手机号+密码登录
 * POST /auth/temp-login
 * @param {string} phone 手机号
 * @param {string} password 密码
 * @returns {Promise}
 */
export function loginByPassword(phone, password) {
	const formattedPhone = formatPhoneForBackend(phone)
	if (USE_MOCK) {
		return mockLoginByPassword(phone, password)
	}
	return post('/auth/temp-login', {
		phone: formattedPhone,
		password
	})
}

/**
 * 手机号注册
 * POST /auth/register
 * @param {Object} data 注册信息
 * @param {string} data.phone 手机号
 * @param {string} data.password 密码
 * @param {string} data.sms_code 短信验证码
 * @param {string} [data.invite_code] 邀请码
 * @returns {Promise}
 */
export function register(data) {
	if (USE_MOCK) {
		return mockRegister(data)
	}
	return post('/auth/register', {
		...data,
		phone: formatPhoneForBackend(data.phone)
	})
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
	if (USE_MOCK) {
		return mockGetUserInfo()
	}
	return get('/users/me')
}

/**
 * 更新用户信息
 * @param {Object} data 更新数据
 * @returns {Promise}
 */
export function updateUserInfo(data) {
	if (USE_MOCK) {
		return mockUpdateUserInfo(data)
	}
	return put('/users/me', data)
}

/**
 * 上传用户头像
 * @param {string} filePath 本地图片路径
 * @returns {Promise} 返回 { code: 0, data: { url } }
 */
export function uploadAvatar(filePath) {
	if (USE_MOCK) {
		return Promise.resolve({
			code: 0,
			message: 'success',
			data: {
				url: '/static/logo.png'
			}
		})
	}
	return upload('/uploads/avatar', filePath)
}

/**
 * 检查用户是否已注册
 * 注意：后端不提供此接口，Firebase 登录后自动判断
 * 此函数仅用于 mock 模式开发
 * @param {string} phone 手机号
 * @returns {Promise}
 */
export function checkUserExist(phone) {
	if (USE_MOCK) {
		return mockCheckUserExist(phone)
	}
	// 后端无此接口，尝试获取用户信息判断是否已注册
	return get('/users/me').then(res => {
		return { code: 0, data: { exists: true } }
	}).catch(() => {
		return { code: 0, data: { exists: false } }
	})
}

/**
 * 获取金币余额
 * @returns {Promise}
 */
export function getCoinBalance() {
	if (USE_MOCK) {
		return mockGetCoinBalance()
	}
	return get('/user-orders/coin-balance')
}

/**
 * 退出登录
 * 注意：后端不提供 logout 接口，前端清除 token 即可
 * @returns {Promise}
 */
export function logout() {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ code: 0, message: 'success' })
			}, 200)
		})
	}
	// 后端无 logout 接口，直接清除本地 token
	uni.removeStorageSync(TOKEN_KEY)
	uni.removeStorageSync('siamfeast_userInfo')
	return Promise.resolve({ code: 0, message: 'success' })
}

/**
 * 刷新 Token
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise}
 */
export function refreshToken(refreshToken) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: {
						access_token: `mock_token_${Date.now()}`,
						token_type: 'bearer',
						expires_in: 3600
					}
				})
			}, 200)
		})
	}
	return post('/auth/refresh', { refresh_token: refreshToken })
}

// 导出模块对象
export const authApi = {
	sendCode,
	loginByCode,
	loginByPassword,
	register,
	getUserInfo,
	updateUserInfo,
	uploadAvatar,
	checkUserExist,
	getCoinBalance,
	logout,
	refreshToken
}

// 别名：tempLogin = loginByPassword（兼容）
export const tempLogin = loginByPassword

export default authApi
