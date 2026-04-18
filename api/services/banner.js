/**
 * 轮播图相关 API
 */
import { USE_MOCK } from '../config.js'
import { get } from '../request.js'
import {
	mockGetHomeBanners,
	mockGetStoreBanners,
	mockGetMallBanners,
	mockGetNewbieBanners
} from '../mock/banner.js'

/**
 * 获取首页轮播图
 * @returns {Promise}
 */
export function getHomeBanners() {
	if (USE_MOCK) {
		return mockGetHomeBanners()
	}
	return get('/banners', { position: 'HOME' })
}

/**
 * 获取店铺轮播图
 * @param {number} storeId 门店ID
 * @returns {Promise}
 */
export function getStoreBanners(storeId) {
	if (USE_MOCK) {
		return mockGetStoreBanners(storeId)
	}
	return get('/banners', { position: 'STORE', store_id: storeId })
}

/**
 * 获取商城轮播图
 * @returns {Promise}
 */
export function getMallBanners() {
	if (USE_MOCK) {
		return mockGetMallBanners()
	}
	return get('/banners', { position: 'MALL' })
}

/**
 * 获取新人礼包轮播图
 * @returns {Promise}
 */
export function getNewbieBanners() {
	if (USE_MOCK) {
		return mockGetNewbieBanners()
	}
	return get('/banners', { position: 'NEWBIE' })
}

// 导出模块对象
export const bannerApi = {
	getHomeBanners,
	getStoreBanners,
	getMallBanners,
	getNewbieBanners
}

export default bannerApi
