/**
 * 验证码 + 短信登录工具（后端自建服务）
 *
 * 后端接口（2026-08-01 升级后）:
 *  - POST /auth/verify-code/send   统一发码（SMS 优先，额度用完自动降级邮箱）
 *  - POST /auth/verify-code/verify 统一校验（自动识别 sms/email 渠道）
 *  - POST /auth/sms/login          验证码登录（登录即注册，签发 token）
 *
 * 关键字段:
 *  - phone_number: E.164 格式(+66812345678,必须 + 开头)
 *  - scene: login / register / reset_password / change_phone
 *  - code: 6 位数字
 *
 * 发码响应字段（前端必须处理）:
 *  - channel: "sms" | "email"     实际发送渠道（额度用完后端自动切邮箱）
 *  - email: "san***@gmail.com"    脱敏邮箱（仅 channel=email 时返回）
 *  - warning: "..."               剩 ≤1 条 SMS 配额时的三语提醒（必须显著提示）
 *  - remaining: number            本年度剩余 SMS 条数（可选展示）
 *  - expires_in: 300              验证码有效期秒数
 *
 * 关键返回（登录）:
 *  - access_token: 自家 JWT
 *  - refresh_token: 刷新 token
 *  - is_new_user: 是否首次注册(决定跳转)
 */

import { post } from '@/api/request.js'
import i18n from '@/i18n/index.js'
import { getErrorMessage } from './index.js'

// ============ 测试号码(开发期)============

const TEST_PHONES = ['+66811111111', '+8613800138000']
const TEST_CODE = '123456'

// ============ 校验工具 ============

/**
 * 把"国家码 + 本地号码"或各种格式的手机号归一化为 E.164 格式
 * 修正点：之前直接字符串拼接 `+66 + 0812345678 = +660812345678`（多了一个 0）
 *
 * 转换规则（以泰国为例）：
 *   - `08xxxxxxxx`（本地号 0 开头）→ `+668xxxxxxxx`（去 0 加 +66）
 *   - `+668xxxxxxxx`（已正确）→ 原样返回
 *   - `668xxxxxxxx`（无 +）→ `+668xxxxxxxx`
 *   - `+6608xxxxxxxx`（错误的拼接）→ `+668xxxxxxxx`（兜底去掉 0）
 *
 * @param {string} countryCode 国家码，如 '+66'
 * @param {string} localPhone 本地号码，如 '0812345678'
 * @returns {string} E.164 格式
 */
export function toE164(countryCode, localPhone) {
	const cc = (countryCode || '').replace(/\s/g, '')
	let p = String(localPhone || '').replace(/\s/g, '').replace(/-/g, '')

	// 本地号 0 开头 → 去掉 0 拼国家码（修复 +6608xx bug 的关键）
	if (p.startsWith('0')) {
		return cc + p.substring(1)
	}
	// 已经是 + 开头的完整国际号 → 原样（兜底：+6608xx → +668xx）
	if (p.startsWith('+')) {
		// +660 后跟 8 位以上数字 → 视为多了一个 0 的错误格式，去掉
		if (/^\+66[0]\d{8,}$/.test(p)) return '+66' + p.substring(4)
		return p
	}
	// 无 + 但国家码前缀开头（如 668xx）→ 补 +
	if (cc && p.startsWith(cc.replace('+', ''))) {
		return '+' + p
	}
	// 8xx 开头（无 0 无国家码前缀）→ 直接拼
	return cc + p
}

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

// ============ 接口封装（新统一接口）============

/**
 * 发送验证码（统一接口，SMS 优先，额度用完自动降级邮箱）
 *
 * 后端决策：
 *   scene=register                → 直接发 SMS（不扣配额）
 *   scene=login/reset_password:
 *     ├ 用户不存在                → 发 SMS（不扣配额，避免泄露注册状态）
 *     ├ 配额未用完                → 发 SMS + 计数
 *     ├ 配额用完 + 已绑邮箱        → 降级发邮箱验证码
 *     └ 配额用完 + 未绑邮箱        → 429 SMS_QUOTA_NO_EMAIL
 *
 * @param {string} phoneNumber E.164 格式
 * @param {'login'|'register'|'reset_password'|'change_phone'} scene
 * @returns {Promise<{channel: 'sms'|'email', email?: string, expires_in: number, remaining?: number, warning?: string}>}
 */
export function sendVerifyCode(phoneNumber, scene = 'login') {
	if (!isValidE164Phone(phoneNumber)) {
		return Promise.reject({
			code: 'INVALID_PHONE',
			message: '手机号格式不正确,必须是 E.164 格式(+66812345678)'
		})
	}
	return post('/auth/verify-code/send', {
		phone_number: phoneNumber,
		scene
	}, { silent: true }).then(res => {
		// request.js 包装格式：{ code: 0, data: {...} }
		// 后端裸返回：{ channel, email, expires_in, warning, remaining }
		const data = (res && res.data) ? res.data : res
		return data
	}, err => {
		// 后端错误已三语（按 Accept-Language），原样抛出供调用方展示
		return Promise.reject(err)
	})
}

/**
 * 校验验证码（统一接口，自动识别 sms/email 渠道）
 *
 * @param {string} phoneNumber E.164 格式
 * @param {string} code 6 位数字验证码
 * @param {'login'|'register'|'reset_password'|'change_phone'} scene
 * @returns {Promise<{channel: 'sms'|'email'}>}
 *
 * 注意：本接口仅校验码是否正确，不签发 token。
 * 校验通过后需另外调 smsLogin() 完成登录。
 */
export function verifyCode(phoneNumber, code, scene = 'login') {
	if (!isValidE164Phone(phoneNumber)) {
		return Promise.reject({
			code: 'INVALID_PHONE',
			message: i18n.t('error.phoneFormatInvalid')
		})
	}
	if (!code || !/^\d{4,8}$/.test(code)) {
		return Promise.reject({
			code: 'CODE_INVALID',
			message: i18n.t('error.codeInvalid')
		})
	}
	return post('/auth/verify-code/verify', {
		phone_number: phoneNumber,
		code,
		scene
	}, { silent: true }).then(res => {
		const data = (res && res.data) ? res.data : res
		return data
	})
}

// ============ 接口封装（兼容旧调用，内部转发到新接口）============

/**
 * 发送验证码（保留旧函数名，转发到新统一接口）
 * 旧调用方继续返回 expires_in，新增字段 channel/warning/email 也一并返回
 *
 * 频控:
 *  - 同号码 60s 内只能发 1 条(前端要做 60s 倒计时)
 *  - 同号码 1h 5 条 / 1d 10 条
 *  - 同 IP 1h 10 条
 *  超限会返回 RATE_LIMITED
 *
 * @deprecated 建议改用 sendVerifyCode（语义更清晰）
 */
export function sendSMSCode(phoneNumber, scene = 'login') {
	return sendVerifyCode(phoneNumber, scene)
}

/**
 * 短信验证码登录(登录即注册)
 * @param {string} phoneNumber E.164 格式
 * @param {string} code 6 位数字验证码
 * @param {'login'|'register'|'reset_password'|'change_phone'} scene 默认 login
 * @param {Object} options 可选附加字段
 * @param {string} [options.password] 密码（≥6 位），仅 register 场景生效
 * @param {string} [options.inviteCode] 邀请码
 * @param {string} [options.email] 邮箱（可选，2026-08-03 起后端支持在注册主接口传）
 *                                 传了会做唯一性校验，失败返 ErrEmailAlreadyBound
 * @returns {Promise<{access_token, refresh_token, expires_in, user, is_new_user}>}
 *
 * 注意:
 *  - 老用户(is_new_user=false)直接进首页
 *  - 新用户(is_new_user=true)需要跳到"完善信息"页填昵称/密码/邀请码
 */
export function smsLogin(phoneNumber, code, scene = 'login', options = {}) {
	if (!isValidE164Phone(phoneNumber)) {
		return Promise.reject({
			code: 'INVALID_PHONE',
			message: i18n.t('error.phoneFormatInvalid')
		})
	}
	if (!code || !/^\d{4,8}$/.test(code)) {
		return Promise.reject({
			code: 'CODE_INVALID',
			message: i18n.t('error.codeInvalid')
		})
	}
	const body = {
		phone_number: phoneNumber,
		code,
		scene
	}
	// scene=register 时支持可选 password（至少 6 位）；登录场景忽略
	if (scene === 'register' && options.password) {
		body.password = options.password
	}
	if (options.inviteCode) {
		body.invite_code = options.inviteCode
	}
	// email 可选（2026-08-03 起后端支持）；填了就做唯一性校验
	if (options.email) {
		body.email = options.email
	}
	return post('/auth/sms/login', body).then(res => {
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
 * 把后端返回的错误码映射成当前语言的提示文案
 * 命中 i18n codeMap 优先翻译；未命中则用后端 message（后端已按 Accept-Language 返回三语）
 */
export function resolveSMSErrorMessage(err) {
	if (!err) {
		try { return i18n.t?.('common.fail') || '操作失败' } catch (e) { return '操作失败' }
	}
	// 复用 getErrorMessage 的 codeMap（包含 SMS/验证码相关 bizCode）
	try {
		const mapped = getErrorMessage(err)
		if (mapped && mapped !== (err.message || '')) return mapped
	} catch (e) {}
	// 兜底：后端 message（按 Accept-Language 已是当前语言）
	return err.message || (i18n.t?.('common.fail') || '操作失败')
}
