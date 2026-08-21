/**
 * 用户足迹管理
 * 记录用户浏览的商品、门店等访问记录
 *
 * 多账号隔离：存储 key 带用户 id（siamfeast_footprint_<userId>）
 * 同一设备切换账号时，每个账号看到的是自己的足迹，互不干扰
 * 未登录（游客）时仍用全局 key（siamfeast_footprint）
 */

import i18n from '@/i18n/index.js'

const FOOTPRINT_KEY_PREFIX = 'siamfeast_footprint'
const LEGACY_FOOTPRINT_KEY = 'siamfeast_footprint'   // 老版本无用户维度的 key
const USER_INFO_KEY = 'siamfeast_userInfo'
const MAX_FOOTPRINT_COUNT = 100 // 最大记录数量

function getCurrentUserId() {
	try {
		const info = uni.getStorageSync(USER_INFO_KEY)
		if (info && info.id) return info.id
		// 兼容直接存了 user 对象或 id 的场景
		if (typeof info === 'number') return info
	} catch (e) {}
	return null
}

function getStorageKey(userId) {
	return userId ? `${FOOTPRINT_KEY_PREFIX}_${userId}` : FOOTPRINT_KEY_PREFIX
}

class FootprintManager {
	constructor() {
		this.userId = getCurrentUserId()
		this.storageKey = getStorageKey(this.userId)
		this.footprints = this.loadFootprints()
	}

	/**
	 * 切换账号 / 登录 / 登出 时调用
	 * - 登录：传 userId，加载该用户的足迹
	 * - 登出：传 null/0，回退到游客（全局 key）
	 * - 首次登录会自动把老版本全局 key 下的数据迁到该用户名下（保留历史）
	 */
	setUser(userId) {
		const newUserId = userId || getCurrentUserId() || null
		if (newUserId === this.userId && this.footprints) return
		this.userId = newUserId
		this.storageKey = getStorageKey(this.userId)
		this.footprints = this.loadFootprints()
	}

	/**
	 * 从本地加载足迹数据
	 * 升级路径：若当前用户 key 没数据，但老全局 key 有数据，则迁移过来一次
	 */
	loadFootprints() {
		const empty = { products: [], stores: [], searches: [] }
		try {
			const raw = uni.getStorageSync(this.storageKey)
			if (raw) {
				return { ...empty, ...JSON.parse(raw) }
			}
			// 数据迁移：老版本全局 key → 当前用户 key（仅一次）
			if (this.userId) {
				const legacy = uni.getStorageSync(LEGACY_FOOTPRINT_KEY)
				if (legacy) {
					try {
						const parsed = { ...empty, ...JSON.parse(legacy) }
						// 把迁移过来的数据写到新 key，并清掉老 key（避免下次又迁）
						uni.setStorageSync(this.storageKey, JSON.stringify(parsed))
						uni.removeStorageSync(LEGACY_FOOTPRINT_KEY)
						return parsed
					} catch (e) {
						console.warn('[footprint] migrate legacy failed:', e)
					}
				}
			}
			return empty
		} catch (e) {
			console.error('加载足迹数据失败:', e)
			return empty
		}
	}

	/**
	 * 保存足迹数据到本地
	 */
	saveFootprints() {
		try {
			uni.setStorageSync(this.storageKey, JSON.stringify(this.footprints))
		} catch (e) {
			console.error('保存足迹数据失败:', e)
		}
	}

	/**
	 * 添加商品浏览记录
	 * @param {Object} product - 商品信息
	 */
	addProductFootprint(product) {
		if (!product || !product.id) return

		// 移除已存在的相同商品记录
		this.footprints.products = this.footprints.products.filter(
			item => item.id !== product.id
		)

		// 添加到最前面
		const footprint = {
			id: product.id,
			name: product.name,
			name_zh: product.name_zh || product.name || '',
			name_en: product.name_en || '',
			name_th: product.name_th || '',
			image: product.image || product.image_url,
			price: product.price,
			originalPrice: product.originalPrice,
			description: product.description,
			tags: product.tags,
			shopId: product.shopId,
			shopName: product.shopName,
			viewTime: Date.now(),
			viewCount: 1
		}

		this.footprints.products.unshift(footprint)

		// 限制最大数量
		if (this.footprints.products.length > MAX_FOOTPRINT_COUNT) {
			this.footprints.products = this.footprints.products.slice(0, MAX_FOOTPRINT_COUNT)
		}

		this.saveFootprints()
	}

	/**
	 * 添加门店浏览记录
	 * @param {Object} store - 门店信息
	 */
	addStoreFootprint(store) {
		if (!store || !store.id) return

		// 移除已存在的相同门店记录
		this.footprints.stores = this.footprints.stores.filter(
			item => item.id !== store.id
		)

		// 添加到最前面
		const footprint = {
			id: store.id,
			name: store.name,
			name_zh: store.name_zh || store.name || '',
			name_en: store.name_en || '',
			name_th: store.name_th || '',
			logo: store.logo || store.image_url,
			address: store.address,
			address_zh: store.address_zh || store.address || '',
			address_en: store.address_en || '',
			address_th: store.address_th || '',
			formatted_address_zh: store.formatted_address_zh || '',
			formatted_address_en: store.formatted_address_en || '',
			formatted_address_th: store.formatted_address_th || '',
			rating: store.rating,
			distance: store.distance,
			status: store.status,
			businessHours: store.businessHours,
			viewTime: Date.now(),
			viewCount: 1
		}

		this.footprints.stores.unshift(footprint)

		// 限制最大数量
		if (this.footprints.stores.length > MAX_FOOTPRINT_COUNT) {
			this.footprints.stores = this.footprints.stores.slice(0, MAX_FOOTPRINT_COUNT)
		}

		this.saveFootprints()
	}

	/**
	 * 添加搜索记录
	 * @param {string} keyword - 搜索关键词
	 */
	addSearchFootprint(keyword) {
		if (!keyword || typeof keyword !== 'string') return

		keyword = keyword.trim()
		if (!keyword) return

		// 移除已存在的相同搜索记录
		this.footprints.searches = this.footprints.searches.filter(
			item => item.keyword !== keyword
		)

		// 添加到最前面
		this.footprints.searches.unshift({
			keyword: keyword,
			searchTime: Date.now()
		})

		// 限制最大数量（搜索记录最多50条）
		if (this.footprints.searches.length > 50) {
			this.footprints.searches = this.footprints.searches.slice(0, 50)
		}

		this.saveFootprints()
	}

	/**
	 * 获取商品浏览记录
	 * @param {number} limit - 限制数量，默认全部
	 * @returns {Array}
	 */
	getProductFootprints(limit = 0) {
		const products = this.footprints.products || []
		return limit > 0 ? products.slice(0, limit) : products
	}

	/**
	 * 获取门店浏览记录
	 * @param {number} limit - 限制数量，默认全部
	 * @returns {Array}
	 */
	getStoreFootprints(limit = 0) {
		const stores = this.footprints.stores || []
		return limit > 0 ? stores.slice(0, limit) : stores
	}

	/**
	 * 获取搜索记录
	 * @param {number} limit - 限制数量，默认全部
	 * @returns {Array}
	 */
	getSearchFootprints(limit = 0) {
		const searches = this.footprints.searches || []
		return limit > 0 ? searches.slice(0, limit) : searches
	}

	/**
	 * 获取最近浏览的商品ID列表
	 * @param {number} limit - 限制数量
	 * @returns {Array}
	 */
	getRecentProductIds(limit = 10) {
		return this.footprints.products
			.slice(0, limit)
			.map(item => item.id)
	}

	/**
	 * 删除单个商品浏览记录
	 * @param {number} productId - 商品ID
	 */
	removeProductFootprint(productId) {
		this.footprints.products = this.footprints.products.filter(
			item => item.id !== productId
		)
		this.saveFootprints()
	}

	/**
	 * 删除单个门店浏览记录
	 * @param {number} storeId - 门店ID
	 */
	removeStoreFootprint(storeId) {
		this.footprints.stores = this.footprints.stores.filter(
			item => item.id !== storeId
		)
		this.saveFootprints()
	}

	/**
	 * 删除单个搜索记录
	 * @param {string} keyword - 搜索关键词
	 */
	removeSearchFootprint(keyword) {
		this.footprints.searches = this.footprints.searches.filter(
			item => item.keyword !== keyword
		)
		this.saveFootprints()
	}

	/**
	 * 清空商品浏览记录
	 */
	clearProductFootprints() {
		this.footprints.products = []
		this.saveFootprints()
	}

	/**
	 * 清空门店浏览记录
	 */
	clearStoreFootprints() {
		this.footprints.stores = []
		this.saveFootprints()
	}

	/**
	 * 清空搜索记录
	 */
	clearSearchFootprints() {
		this.footprints.searches = []
		this.saveFootprints()
	}

	/**
	 * 清空所有足迹记录（仅当前账号）
	 */
	clearAllFootprints() {
		this.footprints = {
			products: [],
			stores: [],
			searches: []
		}
		this.saveFootprints()
	}

	/**
	 * 获取足迹统计信息
	 * @returns {Object}
	 */
	getFootprintStats() {
		return {
			productCount: this.footprints.products.length,
			storeCount: this.footprints.stores.length,
			searchCount: this.footprints.searches.length,
			totalCount: this.footprints.products.length +
					   this.footprints.stores.length +
					   this.footprints.searches.length
		}
	}

	/**
	 * 格式化时间为友好显示（按当前 i18n 语言渲染）
	 * @param {number} timestamp - 时间戳
	 * @returns {string}
	 */
	formatTime(timestamp) {
		if (!timestamp) return ''

		const now = Date.now()
		const diff = now - timestamp

		// 1分钟内
		if (diff < 60 * 1000) {
			return i18n.t('footprint.justNow')
		}
		// 1小时内
		if (diff < 60 * 60 * 1000) {
			return i18n.t('footprint.minutesAgo', { n: Math.floor(diff / (60 * 1000)) })
		}
		// 24小时内
		if (diff < 24 * 60 * 60 * 1000) {
			return i18n.t('footprint.hoursAgo', { n: Math.floor(diff / (60 * 60 * 1000)) })
		}
		// 7天内
		if (diff < 7 * 24 * 60 * 60 * 1000) {
			return i18n.t('footprint.daysAgo', { n: Math.floor(diff / (24 * 60 * 60 * 1000)) })
		}
		// 超过7天显示日期
		const date = new Date(timestamp)
		return i18n.t('footprint.monthDay', { m: date.getMonth() + 1, d: date.getDate() })
	}

	/**
	 * 获取带格式化时间的商品记录
	 * @param {number} limit - 限制数量
	 * @returns {Array}
	 */
	getProductFootprintsFormatted(limit = 0) {
		const products = this.getProductFootprints(limit)
		return products.map(item => ({
			...item,
			viewTimeText: this.formatTime(item.viewTime)
		}))
	}

	/**
	 * 获取带格式化时间的门店记录
	 * @param {number} limit - 限制数量
	 * @returns {Array}
	 */
	getStoreFootprintsFormatted(limit = 0) {
		const stores = this.getStoreFootprints(limit)
		return stores.map(item => ({
			...item,
			viewTimeText: this.formatTime(item.viewTime)
		}))
	}
}

// 导出单例
const footprintManager = new FootprintManager()
export default footprintManager
