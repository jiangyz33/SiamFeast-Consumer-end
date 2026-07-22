/**
 * UniPush 2.0 推送服务封装
 *
 * 流程:
 *   1. APP 启动 → initPush() 获取 cid → 上报后端
 *   2. APP 收到推送 → onPushMessage 监听
 *   3. 用户点击通知 → handlePushClick 跳转
 *   4. 用户退出登录 → unregisterPush() 清除关联
 */

import { post } from '@/api/request.js'

let currentCid = null
let isInitialized = false

/**
 * 初始化推送(在 App.vue onLaunch 调用)
 */
export function initPush() {
	// #ifdef APP-PLUS
	if (isInitialized) return
	isInitialized = true

	try {
		uni.getPushClientId({
			success: (res) => {
				currentCid = res.cid
				console.log('[push] cid=', currentCid)
				reportPushToken(currentCid)
			},
			fail: (err) => {
				console.error('[push] getPushClientId failed:', err)
				// 5 秒后重试
				setTimeout(() => {
					isInitialized = false
					initPush()
				}, 5000)
			}
		})

		// 监听推送消息
		uni.onPushMessage((res) => {
			console.log('[push] onPushMessage:', res)
			if (res.type === 'click') {
				// 用户点击通知栏
				handlePushClick(res.data)
			} else if (res.type === 'receive') {
				// APP 在线时收到透传消息
				handlePushReceive(res.data)
			}
		})
	} catch (e) {
		console.error('[push] init failed:', e)
	}
	// #endif
}

/**
 * 上报 push cid 给后端
 * 后端接口:POST /notifications/register-token
 * body: { token, platform, device_info, app_version }
 */
function reportPushToken(cid) {
	// 没 token 时不报(用户未登录)
	const token = uni.getStorageSync('siamfeast_token')
	if (!token) {
		console.log('[push] 用户未登录,延迟上报 cid(等登录后再报)')
		// 监听登录成功事件
		uni.$once('loginSuccess', () => reportPushToken(cid))
		return
	}

	// 设备信息
	let deviceInfo = ''
	try {
		const info = uni.getSystemInfoSync()
		deviceInfo = `${info.brand || ''}/${info.model || ''}/${info.system || ''}`
	} catch (e) {}

	post('/notifications/register-token', {
		token: cid,
		platform: 'unipush',
		device_info: deviceInfo,
		app_version: '1.0.9'
	}).then(() => {
		console.log('[push] cid 上报成功')
	}).catch(err => {
		console.error('[push] cid 上报失败:', err)
	})
}

/**
 * 用户点击通知栏消息,跳转对应页面
 */
function handlePushClick(data) {
	console.log('[push] click:', data)
	if (!data) return

	let payload = data.payload || {}

	// payload 可能是 JSON 字符串或对象
	if (typeof payload === 'string') {
		try {
			payload = JSON.parse(payload)
		} catch (e) {
			console.error('[push] parse payload failed:', e)
			// 当作普通通知,跳首页
			uni.switchTab({ url: '/pages/index/index' })
			return
		}
	}

	const type = payload.type
	const id = payload.id || payload.order_id || payload.coupon_id || payload.banner_id

	switch (type) {
		case 'order':
			if (id) {
				uni.navigateTo({ url: `/pages/order-detail/index?id=${id}` })
			} else {
				uni.switchTab({ url: '/pages/order/index' })
			}
			break

		case 'coupon':
			uni.navigateTo({ url: '/pages/coupons/index' })
			break

		case 'activity':
		case 'campaign':
			if (id) {
				// 后续 campaign 弹窗可用
				uni.navigateTo({ url: `/pages/banner-detail/index?id=${id}` })
			} else {
				uni.switchTab({ url: '/pages/index/index' })
			}
			break

		case 'system':
		default:
			uni.switchTab({ url: '/pages/index/index' })
	}
}

/**
 * APP 在线时收到透传消息(可选:刷新未读数等)
 */
function handlePushReceive(data) {
	console.log('[push] receive:', data)
	// 通知首页刷新未读数
	try {
		uni.$emit('notificationReceived', data)
	} catch (e) {}
}

/**
 * 退出登录时,清后端的 push token 关联
 * 后端接口:POST /notifications/unregister-token
 * body: { token }
 */
export function unregisterPush() {
	// #ifdef APP-PLUS
	if (!currentCid) return Promise.resolve()

	const cid = currentCid
	return post('/notifications/unregister-token', {
		token: cid
	}).then(() => {
		console.log('[push] unregister success')
		currentCid = null
	}).catch(err => {
		console.error('[push] unregister failed:', err)
	})
	// #endif
	// #ifndef APP-PLUS
	return Promise.resolve()
	// #endif
}

/**
 * 获取当前 cid(调试用)
 */
export function getCurrentCid() {
	return currentCid
}

/**
 * 请求通知权限(Android 13+ 需要 POST_NOTIFICATIONS)
 * 在 APP 启动后或登录后调用
 */
export function requestNotificationPermission() {
	// #ifdef APP-PLUS
	try {
		const Build = plus.android.importClass('android.os.Build')
		if (Build.VERSION.SDK_INT >= 33) {
			plus.android.requestPermissions(
				['android.permission.POST_NOTIFICATIONS'],
				(e) => {
					console.log('[push] 通知权限已授权:', e)
				},
				(e) => {
					console.log('[push] 通知权限被拒绝:', e)
					// 提示用户(可选,建议第一次登录后弹一次)
				}
			)
		}
	} catch (e) {
		console.error('[push] request permission error:', e)
	}
	// #endif
}
