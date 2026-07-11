/**
 * 模拟数据 - 订单相关
 */

// 生成模拟 unique_code (UUID v4)
function generateUniqueCode() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0
		const v = c === 'x' ? r : (r & 0x3 | 0x8)
		return v.toString(16)
	})
}

// 模拟订单数据
export const mockOrders = [
	{
		id: 1,
		order_no: 'SF00120240310120000',
		unique_code: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7',
		store_id: 1,
		user_id: 1,
		order_type: 'SEAFOOD_NOODLES',
		order_source: 'DINE_IN_SCAN',
		table_number: 'A01',
		subtotal: 83.00,
		discount_amount: 0,
		coin_deduct_amount: 0,
		total_amount: 83.00,
		coins_used: 0,
		status: 'PREPARING',
		payment_method: 'cash_pos',
		paid_at: '2024-03-10T12:05:00',
		remark: '不要香菜',
		shopName: '芭堤雅泰式火锅',
		statusText: '制作中',
		deliveryType: 'pickup',
		createTime: '2024-03-10 12:30:00',
		created_at: '2024-03-10T12:00:00',
		items: [
			{ id: 1, item_name: '招牌茉莉奶白', image_url: '/static/images/img-placeholder.svg', quantity: 2, unit_price: 18.00, subtotal: 36.00, specs_config: { temperature: 'ice', sugar: 'half' } },
			{ id: 2, item_name: '泰式冬阴功锅底', image_url: '/static/images/img-placeholder.svg', quantity: 1, unit_price: 28.00, subtotal: 28.00, specs_config: {} },
			{ id: 3, item_name: '麻辣牛肉串', image_url: '/static/images/img-placeholder.svg', quantity: 1, unit_price: 15.00, subtotal: 15.00, specs_config: {} }
		],
		totalQuantity: 4
	},
	{
		id: 2,
		order_no: 'SF00120240309180000',
		unique_code: 'b2c3d4e5-f6a7-4890-b1c2-d3e4f5a6b7c8',
		store_id: 1,
		user_id: 1,
		order_type: 'HOTPOT',
		order_source: 'DINE_IN_CASHIER',
		table_number: 'B03',
		subtotal: 45.00,
		discount_amount: 0,
		coin_deduct_amount: 0,
		total_amount: 45.00,
		coins_used: 0,
		status: 'COMPLETED',
		payment_method: 'cash_pos',
		paid_at: '2024-03-09T18:05:00',
		remark: '',
		shopName: '芭堤雅泰式火锅',
		statusText: '已完成',
		deliveryType: 'pickup',
		createTime: '2024-03-09 18:20:00',
		created_at: '2024-03-09T18:00:00',
		items: [
			{ id: 4, item_name: '麻辣牛肉串', image_url: '/static/images/img-placeholder.svg', quantity: 3, unit_price: 15.00, subtotal: 45.00, specs_config: {} }
		],
		totalQuantity: 3
	},
	{
		id: 3,
		order_no: 'SF00120240308100000',
		unique_code: 'c3d4e5f6-a7b8-4901-c2d3-e4f5a6b7c8d9',
		store_id: 1,
		user_id: 1,
		order_type: 'BEVERAGE',
		order_source: 'TAKEAWAY',
		table_number: null,
		subtotal: 22.00,
		discount_amount: 0,
		coin_deduct_amount: 0,
		total_amount: 22.00,
		coins_used: 0,
		status: 'PENDING_PAYMENT',
		payment_method: null,
		paid_at: null,
		remark: '',
		shopName: '芭堤雅泰式火锅',
		statusText: '待支付',
		deliveryType: 'delivery',
		createTime: '2024-03-08 10:15:00',
		created_at: '2024-03-08T10:00:00',
		items: [
			{ id: 5, item_name: '芒果糯米饭', image_url: '/static/images/img-placeholder.svg', quantity: 1, unit_price: 22.00, subtotal: 22.00, specs_config: {} }
		],
		totalQuantity: 1
	},
	{
		id: 4,
		order_no: 'SF00120240307140000',
		unique_code: 'd4e5f6a7-b8c9-4012-d3e4-f5a6b7c8d9e0',
		store_id: 1,
		user_id: 1,
		order_type: 'MALA_TANG',
		order_source: 'DELIVERY',
		table_number: null,
		subtotal: 60.00,
		discount_amount: 10.00,
		coin_deduct_amount: 5.00,
		total_amount: 45.00,
		coins_used: 5,
		status: 'READY',
		payment_method: 'coin_deduct',
		paid_at: '2024-03-07T14:05:00',
		remark: '多加辣',
		shopName: '芭堤雅泰式火锅',
		statusText: '待取餐',
		deliveryType: 'delivery',
		createTime: '2024-03-07 14:00:00',
		created_at: '2024-03-07T14:00:00',
		items: [
			{ id: 6, item_name: '麻辣烫（称重）', image_url: '/static/images/img-placeholder.svg', quantity: 1, unit_price: 60.00, subtotal: 60.00, specs_config: { weight_grams: 500, soup_base: 'tom_yum', spice_level: 3 } }
		],
		totalQuantity: 1
	}
]

// 订单状态映射
export const ORDER_STATUS_MAP = {
	'PENDING_PAYMENT': { text: '待支付', color: '#F2B131' },
	'PAID': { text: '已支付', color: '#1890FF' },
	'PREPARING': { text: '制作中', color: '#1890FF' },
	'READY': { text: '待取餐', color: '#52C41A' },
	'COMPLETED': { text: '已完成', color: '#52C41A' },
	'CANCELLED': { text: '已取消', color: '#999999' }
}

// 兑换订单状态映射
export const EXCHANGE_STATUS_MAP = {
	'PENDING_REDEEM': { text: '待核销', color: '#F2B131' },
	'REDEEMED': { text: '已核销', color: '#52C41A' },
	'EXPIRED': { text: '已过期', color: '#999999' },
	'CANCELLED': { text: '已取消', color: '#999999' }
}

// 轮询计数器（模拟收银端扫码后状态变化）
const _pollCounters = {}

// 兑换订单轮询计数器
const _exchangePollCounters = {}

/**
 * 模拟获取用户订单列表
 */
export function mockGetUserOrders(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let orders = [...mockOrders]

			// 状态筛选
			if (params.status_filter) {
				orders = orders.filter(o => o.status === params.status_filter)
			}

			// 订单类型筛选
			if (params.order_type) {
				orders = orders.filter(o => o.order_type === params.order_type)
			}

			// 按时间倒序
			orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

			// 分页
			const offset = params.offset || 0
			const limit = params.limit || 20
			const paginatedOrders = orders.slice(offset, offset + limit)

			resolve({
				code: 0,
				message: 'success',
				data: {
					items: paginatedOrders.map(o => ({
						id: o.id,
						order_no: o.order_no,
						unique_code: o.unique_code,
						order_type: o.order_type,
						status: o.status,
						statusText: ORDER_STATUS_MAP[o.status]?.text || o.status,
						total_amount: o.total_amount,
						coin_deduct_amount: o.coin_deduct_amount,
						coins_used: o.coins_used,
						created_at: o.created_at,
						shopName: o.shopName,
						items: o.items,
						totalQuantity: o.totalQuantity
					})),
					total: orders.length,
					page: Math.floor(offset / limit) + 1,
					page_size: limit
				}
			})
		}, 300)
	})
}

/**
 * 模拟获取订单详情
 */
export function mockGetOrderDetail(orderId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const order = mockOrders.find(o => o.id === parseInt(orderId))
			if (order) {
				resolve({
					code: 0,
					message: 'success',
					data: order
				})
			} else {
				reject({
					code: 40304,
					message: '订单不存在'
				})
			}
		}, 200)
	})
}

/**
 * 模拟创建订单
 */
export function mockCreateOrder(orderData) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
			const orderNo = `SF001${timestamp}`
			const uniqueCode = generateUniqueCode()

			// 计算金额
			let subtotal = 0
			const items = orderData.items.map(item => {
				const price = 18 + Math.random() * 20
				const itemSubtotal = price * item.quantity
				subtotal += itemSubtotal
				return {
					menu_item_id: item.menu_item_id,
					item_name: `商品${item.menu_item_id}`,
					quantity: item.quantity,
					unit_price: price,
					subtotal: itemSubtotal,
					specs: item.specs || {},
					remark: item.remark || ''
				}
			})

			// 计算金币抵扣
			let coinDeductAmount = 0
			let coinsUsed = 0
			if (orderData.use_coins && orderData.coins_to_use > 0) {
				coinsUsed = orderData.coins_to_use
				coinDeductAmount = coinsUsed
			}

			const totalAmount = Math.max(0, subtotal - coinDeductAmount)
			const newOrderId = mockOrders.length + 1

			// Track for polling simulation
			_pollCounters[newOrderId] = 0

			resolve({
				code: 0,
				message: 'success',
				data: {
					id: newOrderId,
					order_no: orderNo,
					unique_code: uniqueCode,
					order_type: orderData.order_type,
					store_id: orderData.store_id,
					status: 'PENDING_PAYMENT',
					subtotal: subtotal,
					coin_deduct_amount: coinDeductAmount,
					coins_used: coinsUsed,
					total_amount: totalAmount,
					items_count: items.length,
					items: items
				}
			})
		}, 500)
	})
}

/**
 * 模拟取消订单
 */
export function mockCancelOrder(orderId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const orderIndex = mockOrders.findIndex(o => o.id === parseInt(orderId))
			if (orderIndex > -1) {
				if (mockOrders[orderIndex].status === 'PENDING_PAYMENT') {
					mockOrders[orderIndex].status = 'CANCELLED'
					resolve({
						code: 0,
						message: 'success',
						data: { id: orderId, status: 'CANCELLED' }
					})
				} else {
					reject({
						code: 40305,
						message: '订单状态不允许取消'
					})
				}
			} else {
				reject({
					code: 40304,
					message: '订单不存在'
				})
			}
		}, 300)
	})
}

/**
 * 模拟获取订单状态（支持轮询模拟收银端扫码）
 */
export function mockGetOrderStatus(orderId) {
	const id = parseInt(orderId)
	return new Promise((resolve) => {
		setTimeout(() => {
			const order = mockOrders.find(o => o.id === id)
			let status = order?.status || 'PENDING_PAYMENT'

			// 模拟新创建订单的支付状态变化
			if (_pollCounters[id] !== undefined) {
				_pollCounters[id]++
				if (_pollCounters[id] >= 3) {
					status = 'PAID'
					delete _pollCounters[id]
				} else {
					status = 'PENDING_PAYMENT'
				}
			}

			resolve({
				code: 0,
				data: {
					order_id: id,
					status: status
				}
			})
		}, 200)
	})
}

/**
 * 模拟获取兑换订单状态（支持轮询模拟收银端核销）
 */
export function mockGetExchangeOrderStatus(orderId) {
	const id = parseInt(orderId)
	return new Promise((resolve) => {
		setTimeout(() => {
			// 模拟新兑换订单的核销状态变化
			if (_exchangePollCounters[id] !== undefined) {
				_exchangePollCounters[id]++
				if (_exchangePollCounters[id] >= 3) {
					delete _exchangePollCounters[id]
					resolve({
						code: 0,
						data: {
							order_id: id,
							status: 'REDEEMED'
						}
					})
					return
				}
			}

			resolve({
				code: 0,
				data: {
					order_id: id,
					status: 'PENDING_REDEEM'
				}
			})
		}, 200)
	})
}

// 导出内部引用供 member mock 使用
export { _exchangePollCounters, generateUniqueCode }

export default {
	mockOrders,
	ORDER_STATUS_MAP,
	EXCHANGE_STATUS_MAP,
	mockGetUserOrders,
	mockGetOrderDetail,
	mockCreateOrder,
	mockCancelOrder,
	mockGetOrderStatus,
	mockGetExchangeOrderStatus
}
