/**
 * 短信验证码登录工具(后端自建 SMS 服务)
 *
 * 后端接口:
 *  - POST /auth/sms/send   发送验证码
 *  - POST /auth/sms/login  验证码登录(登录即注册)
 *
 * 关键字段:
 *  - phone_number: E.164 格式(+66812345678,必须 + 开头)
 *  - scene: login / register / reset_password / change_phone
 *  - code: 6 位数字
 *
 * 关键返回:
 *  - access_token: 自家 JWT
 *  - refresh_token: 刷新 token
 *  - is_new_user: 是否首次注册(决定跳转)
 */

import { post } from '@/api/request.js'

// ============ 测试号码(开发期)============

const TEST_PHONES = ['+66811111111', '+8613800138000']
const TEST_CODE = '123456'

// ============ 校验工具 ============

/**
 * 校验手机号是否为合法的 E.164 格式
 * E.164: +国家码+号码,长度 8-16 位
 */
export function isValidE164Phone(phone) {
	if (!phone || typeof phone !== 'string') return false
	// 简单校验:+ 开头 + 7~15 位数字
	return /^\+\d{7,15}$/.test(phone)
}

export function isTestPhone(phone) {
	return TEST_PHONES.includes(phone)
}

// ============ 接口封装 ============

/**
 * 发送短信验证码
 * @param {string} phoneNumber E.164 格式
 * @param {'login'|'register'|'reset_password'|'change_phone'} scene
 * @returns {Promise<{expires_in: number, is_test: boolean}>}
 *
 * 频控:
 *  - 同号码 60s 内只能发 1 条(前端要做 60s 倒计时)
 *  - 同号码 1h 5 条 / 1d 10 条
 *  - 同 IP 1h 10 条
 *  超限会返回 RATE_LIMITED
 */
export function sendSMSCode(phoneNumber, scene = 'login') {
	if (!isValidE164Phone(phoneNumber)) {
		return Promise.reject({
			code: 'INVALID_PHONE',
			message: '手机号格式不正确,必须是 E.164 格式(+66812345678)'
		})
	}
	return post('/auth/sms/send', {
		phone_number: phoneNumber,
		scene
	}).then(res => {
		if (res.code !== 0) {
			return Promise.reject({
				code: res.code,
				message: res.message || '验证码发送失败'
			})
		}
		return res.data
	})
}

/**
 * 短信验证码登录(登录即注册)
 * @param {string} phoneNumber E.164 格式
 * @param {string} code 6 位数字验证码
 * @param {'login'|'register'|'reset_password'|'change_phone'} scene 默认 login
 * @returns {Promise<{access_token, refresh_token, expires_in, user, is_new_user}>}
 *
 * 注意:
 *  - 老用户(is_new_user=false)直接进首页
 *  - 新用户(is_new_user=true)需要跳到"完善信息"页填昵称/密码/邀请码
 */
export function smsLogin(phoneNumber, code, scene = 'login') {
	if (!isValidE164Phone(phoneNumber)) {
		return Promise.reject({
			code: 'INVALID_PHONE',
			message: '手机号格式不正确'
		})
	}
	if (!code || !/^\d{4,8}$/.test(code)) {
		return Promise.reject({
			code: 'CODE_INVALID',
			message: '验证码必须是 4-8 位数字'
		})
	}
	return post('/auth/sms/login', {
		phone_number: phoneNumber,
		code,
		scene
	}).then(res => {
		if (res.code !== 0) {
			return Promise.reject({
				code: res.code,
				message: res.message || '登录失败'
			})
		}
		return res.data
	})
}

// ============ 错误码 → 用户友好提示 ============

/**
 * 把后端返回的错误码映射成中文文案
 */
export function resolveSMSErrorMessage(err) {
	if (!err) return '操作失败'
	const codeMap = {
		INVALID_PHONE: '手机号格式不正确',
		PHONE_FORMAT_INVALID: '手机号格式不正确',
		RATE_LIMITED: '操作太频繁,请稍后重试',
		CODE_INVALID: '验证码错误',
		CODE_EXPIRED: '验证码已过期,请重新发送',
		CODE_NOT_SENT: '请先获取验证码',
		CODE_TOO_MANY_ATTEMPTS: '尝试次数过多,请重新发送',
		ACCOUNT_DISABLED: '账号已被禁用,请联系客服',
		SMS_NOT_CONFIGURED: '短信服务暂不可用',
		SMS_SEND_FAILED: '短信发送失败,请稍后重试'
	}
	const code = err.code || ''
	if (codeMap[code]) return codeMap[code]
	return err.message || '操作失败'
}
