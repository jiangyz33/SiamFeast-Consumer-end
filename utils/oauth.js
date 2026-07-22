/**
 * HBuilderX 内置 OAuth 登录封装
 *
 * 实现:利用 uni-app 内置 uni.login() API,通过 HBuilderX 打包时勾选的
 * Google/Facebook SDK 拉起原生授权,拿到 access_token / id_token,
 * 提交给后端 /auth/{provider}-login 接口换取自家 JWT。
 *
 * 优点:
 *  - 不需要 UTS 插件,不用踩 UTS 编译坑
 *  - 完全免费
 *  - 用户体验好(原生 SDK 拉起)
 *
 * 缺点:
 *  - 不支持 Phone Auth(短信验证码需后端单独实现)
 *  - 需要后端新增 /auth/{provider}-login 接口
 */

import { post } from '@/api/request.js'

// ============ 内部工具 ============

/**
 * 调用 uni.login 拿原生 OAuth token,封装为 Promise
 */
function _uniLogin(provider) {
	return new Promise((resolve, reject) => {
		// #ifdef APP-PLUS
		uni.login({
			provider,
			success: (res) => {
				console.log(`[oauth-login] uni.login ${provider} success:`, JSON.stringify(res))
				resolve(res)
			},
			fail: (err) => {
				console.error(`[oauth-login] uni.login ${provider} fail:`, err)
				reject({ code: 'OAUTH_LOGIN_FAILED', message: err.errMsg || `${provider} 登录失败` })
			}
		})
		// #endif
		// #ifndef APP-PLUS
		reject({ code: 'OAUTH_NOT_AVAILABLE', message: '当前环境不支持 OAuth 登录' })
		// #endif
	})
}

/**
 * 把 OAuth token 提交给后端换自家 JWT
 * 后端需提供 /auth/{provider}-login 接口
 */
function _exchangeTokenForJwt(provider, payload) {
	const url = `/auth/${provider}-login`
	return post(url, payload).then(
		(res) => res,
		(err) => {
			console.error('[oauth-login] failed:', provider, err)
			throw err
		}
	)
}

// ============ 对外 API ============

/**
 * Google 登录
 * @returns {Promise<{access_token, id_token}>} Google 原生 OAuth token(后端验证用)
 *
 * 调用流程:
 *   1. uni.login({ provider: 'google' }) 拉起 Google 授权页
 *   2. 用户授权后返回 access_token / id_token
 *   3. 提交给后端 /auth/google-login
 *   4. 后端用 Google OAuth API 验证 token + 提取 user info
 *   5. 后端签发自家 JWT 返回
 */
export async function loginWithGoogle() {
	const loginRes = await _uniLogin('google')
	// uni.login Google provider 返回结构兼容多种格式:
	//   标准模式:   { authResult: { id_token, access_token } }
	//   HBuilderX:  { authResult: { openid, unionid } }  ← 国内 SDK 简化版
	const authResult = loginRes.authResult || loginRes
	const idToken = authResult.id_token || authResult.idToken || ''
	const accessToken = authResult.access_token || authResult.accessToken || ''
	const openid = authResult.openid || authResult.sub || ''
	const unionid = authResult.unionid || ''

	// 三种 token 至少要有一种
	if (!idToken && !accessToken && !openid) {
		throw { code: 'GOOGLE_AUTH_FAILED', message: 'Google 授权未返回有效 token' }
	}

	const res = await _exchangeTokenForJwt('google', {
		id_token: idToken,
		access_token: accessToken,
		openid,
		unionid
	})

	if (res.code !== 0) {
		throw { code: 'GOOGLE_AUTH_FAILED', message: res.message || 'Google 登录失败' }
	}

	return res.data
}

/**
 * Facebook 登录
 * @returns {Promise<{access_token, uid}>} Facebook 原生 OAuth token
 *
 * 调用流程同 Google,但 provider=facebook,后端走 /auth/facebook-login
 */
export async function loginWithFacebook() {
	const loginRes = await _uniLogin('facebook')
	// uni.login Facebook provider 返回结构:{ authResult: { access_token, ... }, ... }
	const authResult = loginRes.authResult || loginRes
	const accessToken = authResult.access_token || authResult.accessToken || ''
	const uid = authResult.uid || authResult.userID || ''

	if (!accessToken) {
		throw { code: 'FACEBOOK_AUTH_FAILED', message: 'Facebook 授权未返回有效 token' }
	}

	const res = await _exchangeTokenForJwt('facebook', {
		access_token: accessToken,
		uid
	})

	if (res.code !== 0) {
		throw { code: 'FACEBOOK_AUTH_FAILED', message: res.message || 'Facebook 登录失败' }
	}

	return res.data
}

/**
 * 退出 OAuth 登录(幂等)
 * uni.logout 是对称调用,清掉 SDK 本地登录态
 */
export function logoutOAuth() {
	return new Promise((resolve) => {
		// #ifdef APP-PLUS
		try {
			uni.logout({
				provider: 'google',
				complete: () => {
					try {
						uni.logout({
							provider: 'facebook',
							complete: () => resolve()
						})
					} catch (e) { resolve() }
				}
			})
		} catch (e) { resolve() }
		// #endif
		// #ifndef APP-PLUS
		resolve()
		// #endif
	})
}

// ============ 兼容旧 API ============
// 直接返回后端原始 data,包含 access_token/refresh_token/user/is_new_user
// 不要转换成旧 firebase 格式(那会丢掉 access_token)

export async function signInWithGoogle() {
	return await loginWithGoogle()
}

export async function signInWithFacebook() {
	return await loginWithFacebook()
}

/**
 * 兼容旧接口 - 把 OAuth token 提交给后端
 * 旧的 exchangeFirebaseTokenForJwt 用的是 /auth/firebase-login,
 * 现在改成 /auth/{provider}-login
 */
export function exchangeOAuthTokenForJwt(provider, idToken, extra = {}) {
	return _exchangeTokenForJwt(provider, {
		id_token: idToken,
		access_token: extra.accessToken || '',
		email: extra.email || '',
		display_name: extra.displayName || ''
	})
}
