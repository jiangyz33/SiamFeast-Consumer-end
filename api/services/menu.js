/**
 * 菜单相关 API
 */
import { USE_MOCK } from '../config.js'
import { get, post, put, del } from '../request.js'
import {
	mockCategories,
	mockMenuItems,
	mockGetCategories,
	mockGetMenuItems,
	mockGetMenuItem
} from '../mock/menu.js'

/**
 * 获取菜单分类列表（管理端）
 * @param {number} storeId 门店ID
 * @returns {Promise}
 */
export function getCategories(storeId) {
	if (USE_MOCK) {
		return mockGetCategories(storeId)
	}
	return get('/menu/categories', { store_id: storeId })
}

/**
 * 获取菜单分类列表（C端，全局分类）
 * 后端已改为查询全局分类（store_id=0），不再按门店查询
 * @param {string} [businessType] 业态类型过滤（可选），如 'hotpot'
 * @returns {Promise}
 */
export function getConsumerCategories(businessType) {
	return get('/public/categories', businessType ? { business_type: businessType } : {})
}

/**
 * 获取全局分类列表（C端，公开，无需认证）
 * @returns {Promise}
 */
export function getGlobalCategories() {
	return get('/menu/categories/global', {}, { silent: true })
}

/**
 * 获取门店菜单分类（C端，按门店分组展示）
 * @param {number} storeId 门店ID
 * @returns {Promise}
 */
export function getStoreMenuCategories(storeId) {
	return get('/store/menu-categories', { store_id: storeId })
}

/**
 * 获取分类详情
 * @param {number} categoryId 分类ID
 * @returns {Promise}
 */
export function getCategory(categoryId) {
	if (USE_MOCK) {
		return new Promise((resolve, reject) => {
			const category = mockCategories.find(c => c.id === parseInt(categoryId))
			if (category) {
				resolve({ code: 0, data: category })
			} else {
				reject({ code: 40301, message: '分类不存在' })
			}
		})
	}
	return get(`/menu/categories/${categoryId}`)
}

/**
 * 创建分类（仅管理员）
 * @param {Object} data 分类数据
 * @returns {Promise}
 */
export function createCategory(data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: Date.now(), ...data }
				})
			}, 300)
		})
	}
	return post('/menu/categories', data)
}

/**
 * 更新分类
 * @param {number} categoryId 分类ID
 * @param {Object} data 更新数据
 * @returns {Promise}
 */
export function updateCategory(categoryId, data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: categoryId, ...data }
				})
			}, 300)
		})
	}
	return put(`/menu/categories/${categoryId}`, data)
}

/**
 * 删除分类
 * @param {number} categoryId 分类ID
 * @returns {Promise}
 */
export function deleteCategory(categoryId) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: categoryId }
				})
			}, 300)
		})
	}
	return del(`/menu/categories/${categoryId}`)
}

/**
 * 获取菜品列表（管理端）
 * @param {Object} params 查询参数
 * @param {number} params.store_id 门店ID（必填）
 * @param {number} params.category_id 分类ID
 * @param {string} params.business_type 业态类型
 * @param {boolean} params.is_active_only 仅启用的
 * @param {string} params.search 搜索关键词
 * @returns {Promise}
 */
export function getMenuItems(params) {
	if (USE_MOCK) {
		return mockGetMenuItems(params)
	}
	return get('/menu-items', params)
}

/**
 * 获取菜品列表（C端）
 * @param {number} storeId 门店ID
 * @param {Object} params 查询参数
 * @param {number} params.category_id 分类ID
 * @returns {Promise}
 */
export function getConsumerMenuItems(storeId, params = {}) {
	return get('/public/menu-items', { store_id: storeId, ...params })
}

/**
 * 获取菜品详情
 * @param {number} itemId 菜品ID
 * @returns {Promise}
 */
export function getMenuItem(itemId) {
	if (USE_MOCK) {
		return mockGetMenuItem(itemId)
	}
	return get(`/menu-items/${itemId}`)
}

/**
 * 创建菜品（仅管理员）
 * @param {Object} data 菜品数据
 * @returns {Promise}
 */
export function createMenuItem(data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: Date.now(), ...data }
				})
			}, 300)
		})
	}
	return post('/menu-items', data)
}

/**
 * 更新菜品
 * @param {number} itemId 菜品ID
 * @param {Object} data 更新数据
 * @returns {Promise}
 */
export function updateMenuItem(itemId, data) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: itemId, ...data }
				})
			}, 300)
		})
	}
	return put(`/menu-items/${itemId}`, data)
}

/**
 * 删除菜品
 * @param {number} itemId 菜品ID
 * @returns {Promise}
 */
export function deleteMenuItem(itemId) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: { id: itemId }
				})
			}, 300)
		})
	}
	return del(`/menu-items/${itemId}`)
}

/**
 * 获取热销菜品
 * 使用 /products/hot 接口（后端无 /menu-items/hot）
 * @param {number} storeId 门店ID
 * @param {number} limit 数量限制
 * @returns {Promise}
 */
export function getHotItems(storeId, limit = 10) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			const items = mockMenuItems.filter(i => i.tags && i.tags.includes('热销')).slice(0, limit)
			resolve({ code: 0, data: items })
		})
	}
	return get('/products/hot', { store_id: storeId, limit })
}

/**
 * 获取新品推荐
 * 使用 /products/new 接口（后端无 /menu-items/new）
 * @param {number} storeId 门店ID
 * @param {number} limit 数量限制
 * @returns {Promise}
 */
export function getNewItems(storeId, limit = 10) {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			const items = mockMenuItems.filter(i => i.tags && i.tags.includes('新品')).slice(0, limit)
			resolve({ code: 0, data: items })
		})
	}
	return get('/products/new', { store_id: storeId, limit })
}

// 导出模块对象
export const menuApi = {
	getCategories,
	getCategory,
	createCategory,
	updateCategory,
	deleteCategory,
	getMenuItems,
	getMenuItem,
	createMenuItem,
	updateMenuItem,
	deleteMenuItem,
	getHotItems,
	getNewItems
}

export default menuApi
