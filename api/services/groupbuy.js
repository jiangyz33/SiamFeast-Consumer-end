/**
 * 拼团 API 服务
 */
import { get, post } from '../request.js'

/**
 * 获取拼团商品列表
 * GET /group-buy/products
 * @param {Object} params - { store_id, page, page_size }
 * @returns {Promise}
 */
export function getGroupBuyProducts(params = {}) {
	return get('/group-buy/products', params)
}

/**
 * 获取拼团商品详情
 * GET /group-buy/products/:id
 * @param {number} id - 拼团商品 ID
 * @returns {Promise}
 */
export function getGroupBuyProductDetail(id) {
	return get(`/group-buy/products/${id}`)
}

/**
 * 创建拼团订单
 * POST /group-buy/orders
 * @param {Object} data - { group_buy_item_id, quantity }
 * @returns {Promise}
 */
export function createGroupBuyOrder(data) {
	return post('/group-buy/orders', data)
}

export const groupbuyApi = {
	getGroupBuyProducts,
	getGroupBuyProductDetail,
	createGroupBuyOrder
}

export default groupbuyApi
