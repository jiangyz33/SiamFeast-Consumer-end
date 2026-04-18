/**
 * 用户足迹管理
 * 记录用户浏览的商品、门店等访问记录
 */

const FOOTPRINT_KEY = 'siamfeast_footprint'
const MAX_FOOTPRINT_COUNT = 100 // 最大记录数量

class FootprintManager {
	constructor() {
		this.footprints = this.loadFootprints()
	}

	/**
	 * 从本地加载足迹数据
	 */
	loadFootprints() {
		try {
			const data = uni.getStorageSync(FOOTPRINT_KEY)
			return data ? JSON.parse(data) : {
				products: [],    // 商品浏览记录
				stores: [],      // 门店浏览记录
				searches: []     // 搜索记录
			}
		} catch (e) {
			console.error('加载足迹数据失败:', e)
			return {
				products: [],
				stores: [],
				searches: []
			}
		}
	}

	/**
	 * 保存足迹数据到本地
	 */
	saveFootprints() {
		try {
			uni.setStorageSync(FOOTPRINT_KEY, JSON.stringify(this.footprints))
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
		console.log('[footprint] addStoreFootprint called:', store)
		if (!store || !store.id) {
			console.warn('[footprint] addStoreFootprint skipped: store=', store)
			return
		}

		// 移除已存在的相同门店记录
		this.footprints.stores = this.footprints.stores.filter(
			item => item.id !== store.id
		)

		// 添加到最前面
		const footprint = {
			id: store.id,
			name: store.name,
			logo: store.logo || store.image_url,
			address: store.address,
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
	 * 清空所有足迹记录
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
	 * 格式化时间为友好显示
	 * @param {number} timestamp - 时间戳
	 * @returns {string}
	 */
	formatTime(timestamp) {
		if (!timestamp) return ''

		const now = Date.now()
		const diff = now - timestamp

		// 1分钟内
		if (diff < 60 * 1000) {
			return '刚刚'
		}
		// 1小时内
		if (diff < 60 * 60 * 1000) {
			return `${Math.floor(diff / (60 * 1000))}分钟前`
		}
		// 24小时内
		if (diff < 24 * 60 * 60 * 1000) {
			return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
		}
		// 7天内
		if (diff < 7 * 24 * 60 * 60 * 1000) {
			return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
		}
		// 超过7天显示日期
		const date = new Date(timestamp)
		return `${date.getMonth() + 1}月${date.getDate()}日`
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
