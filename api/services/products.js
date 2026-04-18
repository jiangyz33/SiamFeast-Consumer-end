/**
 * 商品扩展 API（搜索/新品/热销）
 */
import { USE_MOCK } from '../config.js'
import { get } from '../request.js'

/**
 * 搜索商品
 * @param {Object} params
 * @param {string} params.keyword 搜索关键词
 * @param {number} [params.store_id] 门店ID
 * @param {string} [params.business_type] 业态类型
 * @param {number} [params.category_id] 分类ID
 * @param {string} [params.sort] 排序 (price_asc/price_desc/sales/new)
 * @param {number} [params.limit] 数量限制
 * @returns {Promise}
 */
export function searchProducts(params) {
	if (USE_MOCK) {
		return mockSearchProducts(params)
	}
	return get('/products/search', params)
}

/**
 * 获取新品列表
 * @param {Object} params
 * @param {number} [params.store_id] 门店ID
 * @param {string} [params.business_type] 业态类型
 * @param {number} [params.limit] 数量限制
 * @returns {Promise}
 */
export function getNewProducts(params = {}) {
	if (USE_MOCK) {
		return mockGetNewProducts(params)
	}
	return get('/products/new', params)
}

/**
 * 获取热销列表
 * @param {Object} params
 * @param {number} [params.store_id] 门店ID
 * @param {string} [params.business_type] 业态类型
 * @param {number} [params.limit] 数量限制
 * @returns {Promise}
 */
export function getHotProducts(params = {}) {
	if (USE_MOCK) {
		return mockGetHotProducts(params)
	}
	return get('/products/hot', params)
}

// ===== 模拟数据 =====

const mockProducts = [
	{
		id: 1, store_id: 1, category_id: 1,
		name: '招牌茉莉奶白', name_en: 'Signature Jasmine Milk Tea', name_th: 'ข้าวญี่ปุ่น',
		description: '经典茉莉花茶底，奶香浓郁',
		image_url: '/static/logo.png', price: 18.00,
		business_type: 'BEVERAGE', stock: 100, is_sold_out: false,
		is_active: true, sort_order: 0, sales_count: 1520,
		created_at: '2024-03-15T10:00:00', updated_at: '2024-03-15T10:00:00'
	},
	{
		id: 2, store_id: 1, category_id: 1,
		name: '经典泰式奶茶', name_en: 'Classic Thai Milk Tea', name_th: 'ชาไทย',
		description: '正宗泰式奶茶，香甜丝滑',
		image_url: '/static/logo.png', price: 16.00,
		business_type: 'BEVERAGE', stock: 80, is_sold_out: false,
		is_active: true, sort_order: 1, sales_count: 980,
		created_at: '2024-03-10T10:00:00', updated_at: '2024-03-10T10:00:00'
	},
	{
		id: 3, store_id: 1, category_id: 2,
		name: '冬阴功汤面', name_en: 'Tom Yum Noodle', name_th: 'ก๋วยเตี๋ยวต้มยำ',
		description: '酸辣开胃的泰式经典汤面',
		image_url: '/static/logo.png', price: 28.00,
		business_type: 'NOODLES', stock: 50, is_sold_out: false,
		is_active: true, sort_order: 2, sales_count: 760,
		created_at: '2024-02-20T10:00:00', updated_at: '2024-02-20T10:00:00'
	},
	{
		id: 4, store_id: 1, category_id: 3,
		name: '芒果糯米饭', name_en: 'Mango Sticky Rice', name_th: 'ข้าวเหนียวมะม่วง',
		description: '泰国经典甜品，新鲜芒果搭配椰浆糯米',
		image_url: '/static/logo.png', price: 22.00,
		business_type: 'DESSERT', stock: 30, is_sold_out: false,
		is_active: true, sort_order: 3, sales_count: 650,
		created_at: '2024-04-01T10:00:00', updated_at: '2024-04-01T10:00:00'
	},
	{
		id: 5, store_id: 2, category_id: 1,
		name: '泰式绿咖喱鸡', name_en: 'Green Curry Chicken', name_th: 'แกงเขียวหวานไก่',
		description: '浓郁椰浆绿咖喱配嫩鸡肉',
		image_url: '/static/logo.png', price: 35.00,
		business_type: 'HOTPOT', stock: 40, is_sold_out: false,
		is_active: true, sort_order: 0, sales_count: 430,
		created_at: '2024-04-05T10:00:00', updated_at: '2024-04-05T10:00:00'
	},
	{
		id: 6, store_id: 2, category_id: 2,
		name: '海鲜拼盘', name_en: 'Seafood Platter', name_th: 'จานอาหารทะเล',
		description: '新鲜海鲜组合，含虾、蟹、贝类',
		image_url: '/static/logo.png', price: 88.00,
		business_type: 'SEAFOOD', stock: 20, is_sold_out: false,
		is_active: true, sort_order: 1, sales_count: 320,
		created_at: '2024-03-25T10:00:00', updated_at: '2024-03-25T10:00:00'
	}
]

function mockSearchProducts(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let items = [...mockProducts]
			if (params.keyword) {
				const kw = params.keyword.toLowerCase()
				items = items.filter(p =>
					p.name.includes(kw) ||
					(p.name_en && p.name_en.toLowerCase().includes(kw)) ||
					(p.description && p.description.includes(kw))
				)
			}
			if (params.store_id) {
				items = items.filter(p => p.store_id === Number(params.store_id))
			}
			if (params.business_type) {
				items = items.filter(p => p.business_type === params.business_type)
			}
			if (params.category_id) {
				items = items.filter(p => p.category_id === Number(params.category_id))
			}
			// 排序
			if (params.sort === 'price_asc') {
				items.sort((a, b) => a.price - b.price)
			} else if (params.sort === 'price_desc') {
				items.sort((a, b) => b.price - a.price)
			} else if (params.sort === 'sales') {
				items.sort((a, b) => b.sales_count - a.sales_count)
			} else if (params.sort === 'new') {
				items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
			}
			const limit = params.limit || 20
			items = items.slice(0, limit)
			resolve({
				code: 0, message: 'success',
				data: { items, total: items.length }
			})
		}, 300)
	})
}

function mockGetNewProducts(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let items = [...mockProducts].sort((a, b) =>
				new Date(b.created_at) - new Date(a.created_at)
			)
			if (params.store_id) {
				items = items.filter(p => p.store_id === Number(params.store_id))
			}
			if (params.business_type) {
				items = items.filter(p => p.business_type === params.business_type)
			}
			const limit = params.limit || 20
			items = items.slice(0, limit)
			resolve({
				code: 0, message: 'success',
				data: { items, total: items.length }
			})
		}, 300)
	})
}

function mockGetHotProducts(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let items = [...mockProducts].sort((a, b) => b.sales_count - a.sales_count)
			if (params.store_id) {
				items = items.filter(p => p.store_id === Number(params.store_id))
			}
			if (params.business_type) {
				items = items.filter(p => p.business_type === params.business_type)
			}
			if (params.category_id) {
				items = items.filter(p => p.category_id === Number(params.category_id))
			}
			const limit = params.limit || 20
			items = items.slice(0, limit)
			resolve({
				code: 0, message: 'success',
				data: { items, total: items.length }
			})
		}, 300)
	})
}

export const productsApi = {
	searchProducts,
	getNewProducts,
	getHotProducts
}

export default productsApi
