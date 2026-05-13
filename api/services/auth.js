/**
 * 认证相关 API
 */
import { USE_MOCK, TOKEN_KEY } from '../config.js'
import { get, post, put, patch, upload } from '../request.js'

/**
 * 格式化手机号为后端要求的格式（带国际区号前缀）
 * 如果手机号已经以+开头则不处理，否则添加 countryCode 前缀
 * @param {string} phone 手机号
 * @param {string} [countryCode='+66'] 国际区号
 * @returns {string}
 */
function formatPhoneForBackend(phone, countryCode = '+66') {
	if (!phone) return phone
	const trimmed = phone.trim()
	if (trimmed.startsWith('+')) return trimmed
	const digits = trimmed.replace(/^0+/, '')
	return `${countryCode}${digits}`
}

// 当前选中的国际区号（各页面可设置）
let _selectedCountryCode = '+66'
export function setCountryCode(code) { _selectedCountryCode = code }
export function getCountryCode() { return _selectedCountryCode }
function formatWithCurrentCode(phone) {
	return formatPhoneForBackend(phone, _selectedCountryCode)
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
 * POST /auth/sms-code
 * @param {string} phone 手机号
 * @param {string} [purpose] 用途: register / login / reset_password
 * @returns {Promise}
 */
export function sendCode(phone, purpose = 'register') {
	const formattedPhone = formatWithCurrentCode(phone)
	if (USE_MOCK) {
		return mockSendCode(phone)
	}
	return post('/auth/sms-code', { phone: formattedPhone })
}

/**
 * 验证码登录
 * POST /auth/sms-login
 * @param {string} phone 手机号
 * @param {string} code 验证码
 * @returns {Promise}
 */
export function loginByCode(phone, code) {
	const formattedPhone = formatWithCurrentCode(phone)
	if (USE_MOCK) {
		return mockLoginByCode(phone, code)
	}
	return post('/auth/sms-login', {
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
	const formattedPhone = formatWithCurrentCode(phone)
	if (USE_MOCK) {
		return mockLoginByPassword(phone, password)
	}
	return post('/auth/temp-login', {
		phone: formattedPhone,
		password
	})
}

/**
 * 手机号注册（通过验证码登录自动注册）
 * POST /auth/sms-login
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
	// Backend has no separate register endpoint - sms-login auto-registers new users
	// After login, set password via temp-login or user update
	return post('/auth/sms-login', {
		phone: formatWithCurrentCode(data.phone),
		code: data.sms_code
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
	return patch('/users/me', data)
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
				url: '/static/images/avatar-placeholder.svg'
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
