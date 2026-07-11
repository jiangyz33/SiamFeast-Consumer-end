/**
 * 模拟数据 - 消息相关
 */

// 图标映射
const iconMap = {
	system: '/static/images/img-placeholder.svg',
	promotion: '/static/images/img-placeholder.svg',
	order: '/static/images/img-placeholder.svg'
}

// 模拟消息列表
let mockMessages = [
	{
		id: 1,
		type: 'system',
		title: '系统通知',
		description: '欢迎使用暹罗盛宴，新用户专享优惠等你来领！',
		icon: iconMap.system,
		created_at: '2025-12-20 10:00:00',
		is_read: false
	},
	{
		id: 2,
		type: 'promotion',
		title: '优惠活动',
		description: '限时特惠：满100减20，活动截止到本月底',
		icon: iconMap.promotion,
		created_at: '2025-12-19 15:30:00',
		is_read: false
	},
	{
		id: 3,
		type: 'order',
		title: '订单消息',
		description: '您的订单已送达，感谢您的惠顾',
		icon: iconMap.order,
		created_at: '2025-12-18 12:00:00',
		is_read: true
	},
	{
		id: 4,
		type: 'system',
		title: '系统通知',
		description: '系统维护通知：12月25日凌晨2:00-4:00将进行系统升级',
		icon: iconMap.system,
		created_at: '2025-12-17 09:00:00',
		is_read: true
	},
	{
		id: 5,
		type: 'promotion',
		title: '优惠活动',
		description: '兑换商城上新：品牌定制马克杯已上架，快去兑换吧',
		icon: iconMap.promotion,
		created_at: '2025-12-16 14:00:00',
		is_read: false
	},
	{
		id: 6,
		type: 'order',
		title: '订单消息',
		description: '您的订单正在配送中，预计30分钟送达',
		icon: iconMap.order,
		created_at: '2025-12-15 18:30:00',
		is_read: true
	},
	{
		id: 7,
		type: 'system',
		title: '系统通知',
		description: '您的会员等级已更新，快去查看会员权益吧',
		icon: iconMap.system,
		created_at: '2025-12-14 11:00:00',
		is_read: true
	},
	{
		id: 8,
		type: 'promotion',
		title: '优惠活动',
		description: '圣诞特惠活动即将开始，敬请期待！',
		icon: iconMap.promotion,
		created_at: '2025-12-13 16:00:00',
		is_read: true
	}
]

/**
 * 格式化时间显示
 */
function formatTime(dateStr) {
	const date = new Date(dateStr)
	const now = new Date()
	const diff = now - date
	const minutes = Math.floor(diff / 60000)
	const hours = Math.floor(diff / 3600000)
	const days = Math.floor(diff / 86400000)

	if (minutes < 1) return '刚刚'
	if (minutes < 60) return `${minutes}分钟前`
	if (hours < 24) return `${hours}小时前`
	if (days < 7) return `${days}天前`
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${month}-${day}`
}

/**
 * 获取消息列表
 */
export function mockGetMessages(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let items = [...mockMessages]
			if (params.type && params.type !== 'all') {
				items = items.filter(m => m.type === params.type)
			}
			resolve({
				code: 0,
				message: 'success',
				data: {
					items: items.map(m => ({
						...m,
						time: formatTime(m.created_at)
					})),
					total: items.length
				}
			})
		}, 300)
	})
}

/**
 * 获取未读消息数
 */
export function mockGetUnreadCount() {
	return new Promise((resolve) => {
		setTimeout(() => {
			const count = mockMessages.filter(m => !m.is_read).length
			resolve({
				code: 0,
				message: 'success',
				data: {
					unread_count: count
				}
			})
		}, 200)
	})
}

/**
 * 标记消息已读
 */
export function mockMarkAsRead(id) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const msg = mockMessages.find(m => m.id === id)
			if (msg) {
				msg.is_read = true
				resolve({
					code: 0,
					message: 'success'
				})
			} else {
				resolve({
					code: -1,
					message: '消息不存在'
				})
			}
		}, 200)
	})
}

/**
 * 全部标记已读
 */
export function mockMarkAllAsRead() {
	return new Promise((resolve) => {
		setTimeout(() => {
			mockMessages.forEach(m => {
				m.is_read = true
			})
			resolve({
				code: 0,
				message: 'success'
			})
		}, 300)
	})
}

export default {
	mockGetMessages,
	mockGetUnreadCount,
	mockMarkAsRead,
	mockMarkAllAsRead
}
