/**
 * Firebase Authentication 服务封装(SiamFeast 集成版)
 *
 * 实现说明:
 *  - 内部调用 uni_modules/html5app-firebase UTS 双端原生插件(DCloud 插件市场)
 *  - 该插件支持 google / facebook / apple / twitter 四种 OAuth 登录
 *  - 不支持 Phone(短信验证码)登录 → isFirebasePhoneAuthSupported 始终返回 false
 *  - 外部 API 保持向后兼容:pages/login/index.vue / components/CSocialButtons.vue 不用改
 *
 * 调用链:
 *   页面 → utils/firebase.js → uni_modules/html5app-firebase (UTS) → Firebase SDK
 *                                                              → 后端 /auth/firebase-login
 */

import { post } from '@/api/request.js'
import i18n from '@/i18n/index.js'

// Firebase UTS 插件暂时禁用(试用版 aar 是空壳,需要付费购买正式版才能用)
// 启用步骤:
//   1. 购买 DCloud 插件(html5app-firebase,¥118)并下载正式版覆盖试用版
//   2. 把下面的 import 取消注释
//   3. 重新打自定义基座
// import * as firebaseAuth from '@/uni_modules/html5app-firebase'
const firebaseAuth = null

// ============ 对外 API ============

/**
 * 检查当前环境是否支持 Firebase Phone Auth
 * UTS 插件暂时禁用,统一返回 false
 */
export function isFirebasePhoneAuthSupported() {
	return false
}

// ============ OAuth 登录(Google / Facebook / Apple)============

/**
 * 通用:调用 html5app-firebase 插件 login 方法
 * @param {'google'|'facebook'|'apple'} provider
 * @returns {Promise<{idToken, uid, email, displayName, photoURL}>}
 */
function _loginWithProvider(provider) {
	return new Promise((resolve, reject) => {
		// #ifdef APP-PLUS
		try {
			console.log(`[firebase-login] start: provider=${provider}`)
			console.log(`[firebase-login] firebaseAuth object:`, typeof firebaseAuth, Object.keys(firebaseAuth))
			firebaseAuth.login({ loginType: provider }, (res) => {
				console.log(`[firebase-login] callback: provider=${provider} res=`, JSON.stringify(res))
				if (res && res.code === 0 && res.token) {
					resolve({
						idToken: res.token,
						uid: res.uid || '',
						email: res.email || '',
						displayName: res.displayName || '',
						photoURL: res.photoUrl || '',
						phoneNumber: res.phoneNumber || ''
					})
				} else {
					const errMsg = (res && res.msg) || 'Firebase 登录失败'
					const errCode = _mapProviderToErrCode(provider)
					reject({ code: errCode, message: errMsg, nativeCode: res && res.code })
				}
			})
		} catch (e) {
			console.error(`[firebase-login] EXCEPTION provider=${provider}:`, e)
			reject({ code: 'FIREBASE_AUTH_FAILED', message: String(e && e.message || e), nativeError: String(e) })
		}
		// #endif
		// #ifndef APP-PLUS
		reject({ code: 'FIREBASE_NOT_AVAILABLE', message: '当前环境不支持 Firebase 登录' })
		// #endif
	})
}

function _mapProviderToErrCode(provider) {
	if (provider === 'google') return 'GOOGLE_AUTH_FAILED'
	if (provider === 'facebook') return 'FACEBOOK_AUTH_FAILED'
	if (provider === 'apple') return 'APPLE_AUTH_FAILED'
	return 'FIREBASE_AUTH_FAILED'
}

/**
 * Google 三方登录
 * @returns {Promise<{idToken, uid, email, displayName, photoURL}>}
 */
export function signInWithGoogle() {
	return _loginWithProvider('google')
}

/**
 * Facebook 三方登录
 * @returns {Promise<{idToken, uid, email, displayName, photoURL}>}
 */
export function signInWithFacebook() {
	return _loginWithProvider('facebook')
}

/**
 * Apple 三方登录
 * @returns {Promise<{idToken, uid, email, displayName, photoURL}>}
 */
export function signInWithApple() {
	return _loginWithProvider('apple')
}

/**
 * 把 Firebase ID Token 发给后端换自家系统的 JWT
 * 后端接口:POST /auth/firebase-login
 */
export function exchangeFirebaseTokenForJwt(provider, idToken, extra = {}) {
	return post('/auth/firebase-login', {
		provider,
		id_token: idToken,
		phone_number: extra.phoneNumber || '',
		email: extra.email || '',
		display_name: extra.displayName || ''
	})
}

/**
 * 退出 Firebase 登录(幂等)
 */
export function signOutFirebase() {
	return new Promise((resolve) => {
		// #ifdef APP-PLUS
		try { firebaseAuth.logout() } catch (e) {}
		// #endif
		resolve()
	})
}

/**
 * 获取当前登录的 Firebase 用户(用于启动时恢复会话)
 * 失败时 resolve(null),保持老接口语义
 */
export function getCurrentFirebaseUser() {
	return new Promise((resolve) => {
		// #ifdef APP-PLUS
		try {
			firebaseAuth.isLogin((res) => {
				if (res && res.code === 0 && res.token) {
					resolve({
						uid: res.uid || '',
						email: res.email || '',
						displayName: res.displayName || '',
						phoneNumber: res.phoneNumber || '',
						idToken: res.token
					})
				} else {
					resolve(null)
				}
			})
		} catch (e) {
			resolve(null)
		}
		// #endif
		// #ifndef APP-PLUS
		resolve(null)
		// #endif
	})
}

// ============ Phone Auth(不支持,占位)============

export function sendPhoneVerificationCode() {
	return Promise.reject({
		code: 'FIREBASE_NOT_AVAILABLE',
		message: i18n.t('error.smsNotConfigured')
	})
}

export function verifyPhoneCode() {
	return Promise.reject({
		code: 'FIREBASE_NOT_AVAILABLE',
		message: i18n.t('error.smsNotConfigured')
	})
}

// ============ 错误判断工具(保持向后兼容)============

export function isRateLimitedError(err) {
	if (!err) return false
	if (err.code === 'TOO_MANY_REQUESTS' || err.code === 'RATE_LIMITED') return true
	const native = String(err.nativeCode || '').toLowerCase()
	const msg = String(err.message || '').toLowerCase()
	return native.includes('too-many') || native.includes('quota')
		|| msg.includes('too many') || msg.includes('quota')
}

export function isInvalidCodeError(err) {
	if (!err) return false
	return err.code === 'INVALID_CODE'
		|| err.code === 'SESSION_EXPIRED'
		|| err.code === 'FIREBASE_TOKEN_INVALID'
}
