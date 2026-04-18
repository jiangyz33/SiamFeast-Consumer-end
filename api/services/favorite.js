/**
 * 收藏相关 API
 */
import { USE_MOCK } from '../config.js'
import { get, post, del } from '../request.js'
import {
	mockGetFavorites,
	mockCheckFavorite,
	mockAddFavorite,
	mockRemoveFavorite
} from '../mock/favorite.js'

/**
 * 获取收藏列表
 * @param {Object} params
 * @param {string} params.type 收藏类型 (product/store) — 内部映射为 favorite_type
 * @returns {Promise}
 */
export function getFavorites(params = {}) {
	if (USE_MOCK) {
		return mockGetFavorites(params)
	}
	// 后端参数名为 favorite_type，值为 MENU_ITEM/STORE
	const mapping = { product: 'MENU_ITEM', store: 'STORE' }
	const queryParams = { ...params }
	if (params.type) {
		queryParams.favorite_type = mapping[params.type] || params.type
		delete queryParams.type
	}
	return get('/favorites', queryParams)
}

/**
 * 检查是否已收藏
 * 注意：后端不提供独立检查接口，从收藏列表中判断
 * @param {Object} data
 * @param {number} data.target_id 目标ID
 * @param {string} data.type 类型 (product/store)
 * @returns {Promise}
 */
export function checkFavorite(data) {
	if (USE_MOCK) {
		return mockCheckFavorite(data)
	}
	// 后端无 check 接口，通过列表查询判断
	const mapping = { product: 'MENU_ITEM', store: 'STORE' }
	return get('/favorites', {
		favorite_type: mapping[data.type] || data.type
	}).then(res => {
		const items = res.data?.items || res.data || []
		const found = items.some(item => item.target_id === data.target_id || item.menu_item_id === data.target_id)
		return { code: 0, data: { is_favorited: found } }
	})
}

/**
 * 添加收藏
 * 注意：后端 OpenAPI 未定义此接口，保留用于 mock 开发
 * @param {Object} data
 * @param {number} data.target_id 目标ID
 * @param {string} data.type 类型 (product/store)
 * @param {string} [data.name] 名称
 * @param {string} [data.image_url] 图片
 * @param {number} [data.price] 价格
 * @returns {Promise}
 */
export function addFavorite(data) {
	if (USE_MOCK) {
		return mockAddFavorite(data)
	}
	// 后端 FavoriteCreate: {favorite_type, menu_item_id?, store_id?}
	const mapping = { product: "MENU_ITEM", store: "STORE" }
	const favoriteType = mapping[data.type] || data.type || "MENU_ITEM"
	const payload = { favorite_type: favoriteType }
	if (favoriteType === "MENU_ITEM") {
		payload.menu_item_id = data.target_id || data.menu_item_id
	} else {
		payload.store_id = data.target_id || data.store_id
	}
	return post('/favorites', payload)
}

/**
 * 取消收藏
 * 注意：后端 OpenAPI 未定义此接口，保留用于 mock 开发
 * @param {Object} data
 * @param {number} data.target_id 目标ID
 * @param {string} data.type 类型 (product/store)
 * @returns {Promise}
 */
export function removeFavorite(data) {
	if (USE_MOCK) {
		return mockRemoveFavorite(data)
	}
	// 后端 DELETE /favorites/{favorite_id}，需要收藏记录ID
	const mapping = { product: "MENU_ITEM", store: "STORE" }
	return get('/favorites', { favorite_type: mapping[data.type] || data.type }).then(res => {
		const items = res.data?.items || res.data || []
		const targetId = data.target_id || data.menu_item_id
		const match = items.find(item => {
			if (data.type === "store" || data.type === "STORE") return item.store_id === targetId
			return item.menu_item_id === targetId
		})
		if (match && match.id) {
			return del(`/favorites/${match.id}`)
		}
		return Promise.reject({ code: -1, message: "收藏记录不存在" })
	})
}

export const favoriteApi = {
	getFavorites,
	checkFavorite,
	addFavorite,
	removeFavorite
}

export default favoriteApi
