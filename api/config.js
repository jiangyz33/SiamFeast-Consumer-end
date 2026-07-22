/**
 * API 配置
 */

// 是否使用模拟数据（开发阶段设为 true）
export const USE_MOCK = false

// API 基础地址
// - 本地开发（vite dev server / HBuilderX 运行到浏览器 / 本地 serve 预览构建产物）：
//   用相对路径 '/api/v1'，由 vite.config.js 的 proxy 转发，避免 CORS
// - 生产环境（部署到 h5.siamfeast.com、APP、小程序）：用完整 API 域名
// - 临时强制本地：把 FORCE_DEV 设为 true 可绕过自动判断（自测用，提交前记得改回 false）
const FORCE_DEV = false

// APP 端(自定义基座 / 正式 APK / IPA)总是用生产域名
// 因为 APP 没有 dev server 代理,相对路径 '/api/v1' 会发到 APP 自身
const isApp = (() => {
	// #ifdef APP-PLUS
	return true
	// #endif
	return false
})()

const isDev = (() => {
	if (FORCE_DEV) return true
	if (isApp) return false  // APP 端强制生产环境
	try {
		// 优先用 vite 内置变量（vite dev server 是 true，构建产物是 false）
		if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV === true) {
			return true
		}
		// 兜底：浏览器 location 是 localhost / 127.0.0.1 / 局域网 IP（用于本地 serve 预览构建产物）
		if (typeof window !== 'undefined' && window.location) {
			const h = window.location.hostname
			return h === 'localhost'
				|| h === '127.0.0.1'
				|| /^192\.168\./.test(h)
				|| /^10\./.test(h)
				|| /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)
		}
	} catch (e) {}
	return false
})()

export const API_BASE_URL = isDev ? '/api/v1' : 'https://consumer.siamfeast.com/api/v1'

// 请求超时时间
export const REQUEST_TIMEOUT = 30000

// Google Maps 配置
export const GOOGLE_MAPS_API_KEY = 'AIzaSyAyM66cLMc7pJ15UU2w5dvmeCco_vn0WkA'

// Token 存储 key
export const TOKEN_KEY = 'siamfeast_token'

// 响应码
export const RESPONSE_CODE = {
	SUCCESS: 0,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	SERVER_ERROR: 500
}

// 订单状态映射
export const ORDER_STATUS = {
	PENDING_PAYMENT: { value: 'PENDING_PAYMENT', label: '待支付', color: '#F2B131' },
	PAID: { value: 'PAID', label: '已支付', color: '#1890FF' },
	PREPARING: { value: 'PREPARING', label: '制作中', color: '#1890FF' },
	READY: { value: 'READY', label: '待取餐', color: '#52C41A' },
	DELIVERING: { value: 'DELIVERING', label: '配送中', color: '#1890FF' },
	COMPLETED: { value: 'COMPLETED', label: '已完成', color: '#52C41A' },
	CANCELLED: { value: 'CANCELLED', label: '已取消', color: '#999999' }
}

// 订单来源映射
export const ORDER_SOURCE = {
	DINE_IN_SCAN: '扫码点餐',
	DINE_IN_CASHIER: '收银台下单',
	TAKEAWAY: '外卖',
	DELIVERY: '配送',
	HOSTEL_ROOM_SERVICE: '客房服务'
}

// 订单类型映射
export const ORDER_TYPE = {
	SEAFOOD_NOODLE: '海鲜面',
	MALA_TANG: '麻辣烫',
	HOTPOT_BUFFET: '火锅（自助）',
	HOTPOT_PER_ITEM: '火锅（论件）',
	HOSTEL_ROOM: '客房',
	HOSTEL_HOTPOT: '客房火锅',
	HOSTEL_COFFEE: '客房咖啡'
}

// 支付方式映射
export const PAYMENT_METHOD = {
	visa: { label: '信用卡支付', icon: '/static/icons/credit-card.svg' },
	paypal: { label: 'PayPal', icon: '/static/icons/paypal.svg' },
	cash_pos: { label: '现金支付', icon: '/static/icons/cash.svg' },
	coin_deduct: { label: '金币抵扣', icon: '/static/icons/coin.svg' },
	coupon: { label: '优惠券', icon: '/static/icons/coupon.svg' }
}
