/**
 * 拼团 API 服务
 */
import { get, post } from '../request.js'

const groupbuyApi = {
	/**
	 * 获取拼团商品列表
	 * @param {Object} params - { store_id, page, page_size }
	 */
	getProducts(params = {}) {
		return get('/group-buy/products', params)
	},

	/**
	 * 获取拼团商品详情
	 * @param {number} id - 拼团商品 ID
	 */
	getProductDetail(id) {
		return get(`/group-buy/products/${id}`)
	},

	/**
	 * 通过分享码获取拼团信息
	 * @param {string} shareCode - 分享码
	 */
	getByShareCode(shareCode) {
		return get(`/group-buy/share/${shareCode}`)
	},

	/**
	 * 创建拼团订单
	 * @param {Object} data - { group_buy_item_id, quantity }
	 */
	createOrder(data) {
		return post('/group-buy/orders', data)
	}
}

export const getGroupBuyProducts = groupbuyApi.getProducts
export const getGroupBuyProductDetail = groupbuyApi.getProductDetail
export const getGroupBuyByShareCode = groupbuyApi.getByShareCode
export const createGroupBuyOrder = groupbuyApi.createOrder
export default groupbuyApi
