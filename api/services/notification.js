/**
 * 通知相关 API
 * 包含：设备推送设置 + 消息列表管理
 */
import { USE_MOCK } from '../config.js'
import { post, get } from '../request.js'
import {
	mockGetMessages,
	mockGetUnreadCount,
	mockMarkAsRead,
	mockMarkAllAsRead
} from '../mock/message.js'

// ==================== 设备推送设置 ====================

/**
 * 模拟设备注册状态
 */
let mockNotificationEnabled = true

/**
 * 模拟注册设备推送
 */
function mockRegisterDevice(data) {
	return new Promise((resolve) => {
		setTimeout(() => {
			mockNotificationEnabled = true
			resolve({
				code: 0,
				message: '通知已开启'
			})
		}, 300)
	})
}

/**
 * 模拟取消设备推送
 */
function mockUnregisterDevice() {
	return new Promise((resolve) => {
		setTimeout(() => {
			mockNotificationEnabled = false
			resolve({
				code: 0,
				message: '通知已关闭'
			})
		}, 300)
	})
}

/**
 * 模拟获取通知设置
 */
function mockGetNotificationSettings() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					enabled: mockNotificationEnabled,
					order_notify: true,
					promotion_notify: true,
					system_notify: true
				}
			})
		}, 200)
	})
}

/**
 * 注册设备推送
 * @param {Object} data
 * @param {string} data.token FCM设备Token
 * @param {string} data.device_type 设备类型 (ANDROID/IOS/WEB)
 * @param {string} [data.device_name] 设备名称
 * @returns {Promise}
 */
export function registerDevice(data) {
	if (USE_MOCK) {
		return mockRegisterDevice(data)
	}
	return post('/notifications/devices/register', data)
}

/**
 * 取消设备推送
 * @param {string} [deviceToken] 设备token（后端需要 DELETE /notifications/devices/{token}）
 * @returns {Promise}
 */
export function unregisterDevice(deviceToken) {
	if (USE_MOCK) {
		return mockUnregisterDevice()
	}
	const token = deviceToken || uni.getStorageSync('device_token') || ''
	return del(`/notifications/devices/${encodeURIComponent(token)}`)
}

/**
 * 获取通知设置
 * 注意：后端不提供 settings 接口，从设备注册状态推断
 * @returns {Promise}
 */
export function getNotificationSettings() {
	if (USE_MOCK) {
		return mockGetNotificationSettings()
	}
	// 后端无通知设置接口，返回本地缓存状态
	const enabled = uni.getStorageSync('notification_enabled')
	return Promise.resolve({
		code: 0,
		message: 'success',
		data: {
			enabled: enabled !== false,
			order_notify: true,
			promotion_notify: true,
			system_notify: true
		}
	})
}

/**
 * 切换通知开关
 * @param {boolean} enabled 是否开启
 * @returns {Promise}
 */
export function toggleNotification(enabled) {
	if (enabled) {
		const platform = uni.getSystemInfoSync().platform || 'android'
		const deviceType = platform === 'ios' ? 'IOS' : 'ANDROID'
		return registerDevice({
			token: `mock_device_${Date.now()}`,
			device_type: deviceType
		})
	} else {
		return unregisterDevice()
	}
}

// ==================== 消息列表管理 ====================

/**
 * 获取消息列表
 * @param {Object} params 查询参数
 * @param {string} params.type 消息类型 (all/system/promotion/order)
 * @returns {Promise}
 */
export function getMessages(params = {}) {
	if (USE_MOCK) {
		return mockGetMessages(params)
	}
	return get('/notifications', params)
}

/**
 * 获取未读消息数
 * @returns {Promise}
 */
export function getUnreadCount() {
	if (USE_MOCK) {
		return mockGetUnreadCount()
	}
	return get('/notifications/unread-count')
}

/**
 * 标记消息已读
 * @param {number} id 消息ID
 * @returns {Promise}
 */
export function markAsRead(id) {
	if (USE_MOCK) {
		return mockMarkAsRead(id)
	}
	return post(`/notifications/${id}/read`)
}

/**
 * 全部标记已读
 * @returns {Promise}
 */
export function markAllAsRead() {
	if (USE_MOCK) {
		return mockMarkAllAsRead()
	}
	return post('/notifications/read-all')
}

export const notificationApi = {
	registerDevice,
	unregisterDevice,
	getNotificationSettings,
	toggleNotification,
	getMessages,
	getUnreadCount,
	markAsRead,
	markAllAsRead
}

export default notificationApi
