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
 * 发送短信验证码（已废弃 — 后端 /auth/sms-code 已关闭 404）
 * 请改用 sendEmailCode(phone, email)
 * @deprecated
 */
export function sendCode(phone, purpose = 'register') {
	console.warn('[auth] sendCode 已废弃，请改用 sendEmailCode（SMS 服务已下线）')
	if (USE_MOCK) {
		return mockSendCode(phone)
	}
	return Promise.reject({ code: 'DEPRECATED', message: 'SMS 验证码服务已下线，请使用邮箱验证码' })
}

/**
 * 发送邮箱验证码（SMS 不可用时的替代通道，账号仍绑手机号）
 * POST /auth/email-code
 * @param {string} phone 手机号（账号标识）
 * @param {string} email 接收验证码的邮箱
 * @returns {Promise}
 */
export function sendEmailCode(phone, email) {
	const formattedPhone = formatWithCurrentCode(phone)
	if (USE_MOCK) {
		return mockSendCode(phone + email)
	}
	return post('/auth/email-code', { phone: formattedPhone, email })
}

/**
 * 邮箱验证码登录（用手机号查/建用户，验证码从邮箱拿）
 * POST /auth/email-login
 * @param {string} phone 手机号
 * @param {string} code 邮箱收到的 6 位验证码
 * @returns {Promise}
 */
export function loginByEmailCode(phone, code) {
	const formattedPhone = formatWithCurrentCode(phone)
	if (USE_MOCK) {
		return mockLoginByCode(phone, code)
	}
	return post('/auth/email-login', { phone: formattedPhone, code })
}

/**
 * SMS 验证码登录（已废弃 — 后端 /auth/sms-login 已关闭 404）
 * 请改用 loginByEmailCode(phone, code)
 * @deprecated
 */
export function loginByCode(phone, code) {
	console.warn('[auth] loginByCode 已废弃，请改用 loginByEmailCode（SMS 服务已下线）')
	if (USE_MOCK) {
		return mockLoginByCode(phone, code)
	}
	return Promise.reject({ code: 'DEPRECATED', message: 'SMS 验证码登录已下线，请使用邮箱验证码登录' })
}

/**
 * 手机号+密码登录
 * POST /auth/login
 * @param {string} phone 手机号
 * @param {string} password 密码
 * @returns {Promise}
 */
export function loginByPassword(phone, password) {
	const formattedPhone = formatWithCurrentCode(phone)
	if (USE_MOCK) {
		return mockLoginByPassword(phone, password)
	}
	return post('/auth/login', {
		phone: formattedPhone,
		password
	})
}

/**
 * 手机号注册（已废弃 — 后端 /auth/sms-login 已关闭 404）
 * 新流程：邮箱验证码注册 → 用 sendEmailCode + loginByEmailCode
 * loginByEmailCode 会自动注册新用户，无需调 register
 * @deprecated
 */
export function register(data) {
	console.warn('[auth] register 已废弃，请改用 sendEmailCode + loginByEmailCode')
	if (USE_MOCK) {
		return mockRegister(data)
	}
	return Promise.reject({ code: 'DEPRECATED', message: 'register 接口已下线，请使用邮箱验证码流程' })
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

/**
 * 发送换绑手机号验证码
 * POST /change-phone/send-sms
 * @param {'old'|'new'} type 给旧号还是新号发
 * @param {string} phoneNumber E.164 格式
 */
export function sendChangePhoneSMS(type, phoneNumber) {
	return post('/change-phone/send-sms', {
		type,
		phone_number: phoneNumber
	})
}

/**
 * 提交换绑手机号
 * POST /change-phone
 * @param {string} oldPhone 旧号
 * @param {string} oldCode 旧号验证码
 * @param {string} newPhone 新号
 * @param {string} newCode 新号验证码
 */
export function changePhone(oldPhone, oldCode, newPhone, newCode) {
	return post('/change-phone', {
		old_phone: oldPhone,
		old_code: oldCode,
		new_phone: newPhone,
		new_code: newCode
	})
}

// 导出模块对象
export const authApi = {
	sendCode,
	sendEmailCode,
	loginByEmailCode,
	loginByCode,
	loginByPassword,
	register,
	getUserInfo,
	updateUserInfo,
	uploadAvatar,
	checkUserExist,
	getCoinBalance,
	logout,
	refreshToken,
	sendChangePhoneSMS,
	changePhone
}

// 别名：tempLogin = loginByPassword（兼容）
export const tempLogin = loginByPassword

export default authApi
