/**
 * 认证相关 API
 *
 * 当前可用接口（按 2026-08-03 文档）：
 *   - POST /auth/sms/send          发送 SMS 验证码（utils/sms.js 封装，含发码/校验/统一接口）
 *   - POST /auth/sms/login         SMS 验证码登录/注册（utils/sms.js 封装）
 *   - POST /auth/verify-code/send  统一发码（SMS 优先，额度用完降级邮箱，utils/sms.js 封装）
 *   - POST /auth/verify-code/verify 统一校验
 *   - POST /auth/email-code        发送邮箱验证码（SMS 不可用时的替代通道）
 *   - POST /auth/email-login       邮箱验证码登录
 *   - POST /auth/login             手机号 + 密码登录
 *   - POST /auth/check-phone       校验手机号注册状态（不消耗 SMS 配额）
 *   - POST /auth/refresh           刷新 access_token
 *
 * 已废弃（不在本文件导出）：
 *   - sendCode        请用 utils/sms.js 的 sendVerifyCode / sendSMSCode
 *   - loginByCode     请用 utils/sms.js 的 smsLogin
 *   - register        请用 utils/sms.js 的 smsLogin（scene='register' 自动注册）
 *   - checkUserExist  请用 checkPhone
 *   - tempLogin       请用 loginByPassword
 */
import { USE_MOCK, TOKEN_KEY } from '../config.js'
import { get, post, patch, upload } from '../request.js'

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
	mockGetUserInfo,
	mockUpdateUserInfo,
	mockGetCoinBalance
} from '../mock/auth.js'

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
 * @param {Object} data 更新数据（如 nickname / birthday / email / avatar_url）
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
 * 校验手机号注册状态（不消耗 SMS 配额，可在发码前调用）
 * POST /api/v1/auth/check-phone
 * @param {string} phone E.164 格式（如 +66812345678）
 * @returns {Promise<{phone_number, registered, has_password, is_active}>}
 */
export function checkPhone(phone) {
	return post('/auth/check-phone', { phone_number: phone })
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
	sendEmailCode,
	loginByEmailCode,
	loginByPassword,
	checkPhone,
	getUserInfo,
	updateUserInfo,
	uploadAvatar,
	getCoinBalance,
	logout,
	refreshToken,
	sendChangePhoneSMS,
	changePhone
}

export default authApi
