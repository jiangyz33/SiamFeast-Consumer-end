/**
 * API 配置
 */

// 是否使用模拟数据（开发阶段设为 true）
export const USE_MOCK = false

// API 基础地址
export const API_BASE_URL = 'http://34.15.175.23:8082/api/v1'

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
