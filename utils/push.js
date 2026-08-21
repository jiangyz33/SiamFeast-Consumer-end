/**
 * UniPush 2.0 推送服务封装
 *
 * 流程:
 *   1. APP 启动 → initPush() 获取 cid → 上报后端
 *   2. APP 收到推送 → onPushMessage 监听
 *   3. 用户点击通知 → handlePushClick 跳转
 *   4. 用户退出登录 → unregisterPush() 清除关联
 */

import { post, get } from '@/api/request.js'
import { showCoinConfirmModal } from '@/utils/coinConfirmModal.js'

/**
 * 查询待确认金币授权单（弹窗兜底用）
 */
function getPendingCoinConfirmation() {
	return get('/user/coin-confirmations/pending')
}

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

		// 切换 APP 语言时重报 locale（后端按设备 locale 选推送文案语言）
		uni.$on('languageChanged', () => {
			if (currentCid) reportPushToken(currentCid)
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
	let deviceType = ''
	try {
		const info = uni.getSystemInfoSync()
		deviceInfo = `${info.brand || ''}/${info.model || ''}/${info.system || ''}`
		// 后端文档要求的设备类型字段（决定推送标题/正文按平台兜底）
		deviceType = String(info.platform || '').toLowerCase() === 'ios' ? 'ios' : 'android'
	} catch (e) {}

	// locale：后端按设备语言选推送文案（zh/en/th）；语言切换时 languageChanged 事件重报
	const locale = (uni.getStorageSync('siamfeast_language') || 'zh').slice(0, 2)

	// 版本号优先读系统（APP 端取 manifest versionName），读不到兜底
	let appVersion = '1.0.11'
	try {
		appVersion = uni.getSystemInfoSync().appVersion || appVersion
	} catch (e) {}

	post('/notifications/register-token', {
		token: cid,
		platform: 'unipush',
		device_type: deviceType,
		locale: locale,
		device_info: deviceInfo,
		app_version: appVersion
	}).then(() => {
		console.log('[push] cid 上报成功 locale=', locale)
	}).catch(err => {
		console.error('[push] cid 上报失败:', err)
	})
}

/**
 * 推送点击跳转（冷启动点通知时页面栈可能为空，navigateTo 会失败 → 回退 reLaunch）
 */
function pushNavigateTo(url) {
	uni.navigateTo({
		url,
		fail: () => {
			uni.reLaunch({ url })
		}
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

	// 金币使用确认：后端推送 Data 只带 action=COIN_CONFIRM（无 type 字段），
	// 必须在 switch 之前拦截，否则落入 default 跳首页导致点击无确认入口
	if (payload.action === 'COIN_CONFIRM') {
		pushNavigateTo({ url: '/pages/coin-confirm/index' })
		return
	}

	switch (type) {
		case 'order':
			if (id) {
				pushNavigateTo({ url: `/pages/order-detail/index?id=${id}` })
			} else {
				uni.switchTab({ url: '/pages/order/index' })
			}
			break

		case 'coupon':
			pushNavigateTo({ url: '/pages/coupons/index' })
			break

		case 'activity':
		case 'campaign':
			if (id) {
				// 后续 campaign 弹窗可用
				pushNavigateTo({ url: `/pages/banner-detail/index?id=${id}` })
			} else {
				uni.switchTab({ url: '/pages/index/index' })
			}
			break

		case 'COIN_EXPIRY':
		case 'POINT_EXPIRY':
			uni.switchTab({ url: '/pages/member/index' })
			break

		// 会员等级升级 → 跳会员页（下次打开会自动弹动画）
		case 'MEMBERSHIP_UPGRADED':
			uni.switchTab({ url: '/pages/member/index' })
			break

		// 金币相关通知：跳金币确认页（有待确认授权单可直接同意/拒绝；无则显示空态）
		case 'COIN':
		case 'POINT':
		case 'COIN_CONFIRM':
			pushNavigateTo({ url: '/pages/coin-confirm/index' })
			break

		// 收银端代下单提醒：点击通知 → 消息中心看详情
		case 'SYSTEM':
			pushNavigateTo({ url: '/pages/message/index' })
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

	// 处理金币/积分到期通知：days=0 表示已清零，触发个人中心刷新余额
	try {
		let payload = data && data.payload
		if (typeof payload === 'string') {
			payload = JSON.parse(payload)
		}
		if (payload && (payload.type === 'COIN_EXPIRY' || payload.type === 'POINT_EXPIRY')) {
			const days = Number(payload.days)
			if (days === 0) {
				uni.$emit('balanceExpired', { unit: payload.unit, amount: payload.amount })
			}
		}

		// 金币使用确认制：收银端发起确认请求（action=COIN_CONFIRM）→ 在线立即弹确认弹窗
		if (payload && payload.action === 'COIN_CONFIRM') {
			// 弹窗需要完整授权单信息：payload 带 coins/amount/store_name 时直接用，否则查 pending
			if (payload.coins !== undefined || payload.amount !== undefined) {
				showCoinConfirmModal(payload)
			} else {
				getPendingCoinConfirmation().then((res) => {
					if (res && res.code === 0 && res.data && res.data.item) {
						showCoinConfirmModal(res.data.item)
					}
				}).catch(() => {})
			}
		}
		// 收银员代客下单 / 扣金币事后提醒：APP 在线时弹窗告知（记录性通知）
		// 后端推送：SYSTEM=收银员正在为您下单；COIN=您在【门店】使用了 N 金币
		else if (payload && (payload.type === 'COIN' || payload.type === 'POINT' || payload.type === 'SYSTEM')) {
			showCashierVerificationModal(payload)
		}
	} catch (e) {}
}

/**
 * 收银端操作验证弹窗：非本人操作时提醒用户联系客服
 * payload: { type: 'COIN'|'SYSTEM', title?, content?, store_name?, coins? }
 */
function showCashierVerificationModal(payload) {
	// 防抖：短时间内可能同时收到 SYSTEM + COIN 两条，只弹一次
	if (showCashierVerificationModal._showing) return
	showCashierVerificationModal._showing = true
	setTimeout(() => { showCashierVerificationModal._showing = false }, 3000)

	let title = payload.title || ''
	let content = payload.content || payload.message || ''
	if (!content) {
		// 兜底拼文案（后端三语 message 优先，缺失时按语言拼本地文案）
		const storeName = payload.store_name || ''
		if (payload.type === 'COIN' && payload.coins) {
			content = storeName
				? `您在【${storeName}】使用了 ${payload.coins} 金币，如非本人操作请立即联系客服`
				: `您使用了 ${payload.coins} 金币，如非本人操作请立即联系客服`
		} else {
			content = storeName
				? `收银员正在【${storeName}】为您下单，如非本人操作请联系客服`
				: '收银员正在为您下单，如非本人操作请联系客服'
		}
	}

	try {
		uni.showModal({
			title: title || '操作提醒',
			content,
			showCancel: false,
			confirmText: '我知道了'
		})
	} catch (e) {
		console.error('[push] show verification modal failed:', e)
	}
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
