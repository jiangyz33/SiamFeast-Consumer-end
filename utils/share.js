/**
 * 分享功能工具模块
 * 使用ID作为主要标识，名称仅用于显示
 * 兼容 H5 + App 环境
 */

// 分享链接基础配置
// - 本地自测：FORCE_LOCAL = true，用 window.location.origin（便于自测回链）
// - 上线前：FORCE_LOCAL = false，永远用线上 H5 域名（即便本机 localhost 复制出去也能对外访问）
const FORCE_LOCAL = false
const SHARE_BASE_URL = (() => {
	if (FORCE_LOCAL) {
		// #ifdef H5
		try {
			if (typeof window !== 'undefined' && window.location && window.location.origin) {
				return window.location.origin
			}
		} catch (e) {}
		// #endif
	}
	return 'https://h5.siamfeast.com'
})()

/**
 * 分享类型枚举
 */
export const ShareType = {
	SHOP: 'shop',       // 分享门店
	PRODUCT: 'product'  // 分享菜品
}

/**
 * 简易 URL 参数构建器（兼容 H5 + App）
 */
function buildQueryParams(obj) {
	return Object.keys(obj)
		.filter(key => obj[key] !== undefined && obj[key] !== '')
		.map(key => `${key}=${encodeURIComponent(obj[key])}`)
		.join('&')
}

/**
 * 解析查询字符串为对象（兼容 H5 + App）
 */
function parseQueryString(str) {
	const result = {}
	if (!str) return result
	str.split('&').forEach(pair => {
		const [key, val] = pair.split('=')
		if (key) {
			result[key] = val ? decodeURIComponent(val) : ''
		}
	})
	return result
}

/**
 * 生成分享链接
 * @param {Object} options 分享选项
 * @param {string} options.type 分享类型 'shop' | 'product'
 * @param {number|string} options.id 门店ID或菜品ID（必填）
 * @param {string} [options.shopId] 所属门店ID（分享菜品时必填）
 * @param {string} [options.name] 名称（仅用于显示）
 * @param {number} [options.price] 菜品价格（仅用于显示）
 * @param {string} [options.image] 图片地址（仅用于显示）
 * @param {string} [options.shopName] 门店名称（仅用于显示）
 * @returns {string} 分享链接
 */
export function generateShareLink(options) {
	const { type, id, shopId, name, price, image, shopName } = options

	// 验证必填参数
	if (!id) {
		console.error('分享链接生成失败：缺少ID参数')
		return ''
	}

	// 分享菜品时必须有门店ID
	if (type === ShareType.PRODUCT && !shopId) {
		console.error('分享菜品链接生成失败：缺少门店ID参数')
		return ''
	}

	// 构建分享参数 - 使用短参数名减少链接长度
	const params = {
		s: '1',                        // share标记
		t: type.charAt(0),             // 类型：s=shop, p=product
		id: String(id)
	}

	// 菜品分享需要门店ID
	if (shopId) {
		params.sid = String(shopId)
	}

	// 可选显示参数
	if (name) {
		params.n = name
	}
	if (price !== undefined && price !== null) {
		params.p = String(price)
	}
	if (image) {
		params.img = image
	}
	if (shopName) {
		params.sn = shopName
	}

	return `${SHARE_BASE_URL}/#/?${buildQueryParams(params)}`
}

/**
 * 解析分享链接（兼容 H5 + App）
 * App 环境通过页面 onLoad 的 query 参数传入
 * @param {Object} [query] App 页面 onLoad 传入的 query 对象
 * @returns {Object|null} 分享信息对象，如果不是分享链接则返回null
 */
export function parseShareLink(query) {
	try {
		let params

		// #ifdef H5
		if (!query) {
			// H5 环境：从当前页面 URL 解析
			const url = window.location.href
			if (!url.includes('s=1')) return null

			const hashIndex = url.indexOf('#')
			if (hashIndex === -1) return null

			const queryString = url.substring(hashIndex + 2)
			params = parseQueryString(queryString)
		} else {
			params = query
		}
		// #endif

		// #ifndef H5
		// App 环境：直接使用 query 对象（由 onLoad(options) 传入）
		if (!query || !query.s) return null
		params = query
		// #endif

		// 兼容：如果 params 还没有值，尝试 query
		if (!params) return null

		// 验证是否是分享链接
		if (params.s !== '1') return null

		// 解析类型
		const typeChar = params.t
		const type = typeChar === 's' ? ShareType.SHOP :
		             typeChar === 'p' ? ShareType.PRODUCT : ''

		if (!type) {
			console.error('分享链接类型无效')
			return null
		}

		// 解析ID
		const id = params.id
		if (!id) {
			console.error('分享链接缺少ID参数')
			return null
		}

		// 构建分享信息对象
		const shareInfo = {
			isShare: true,
			type,
			id,
			shopId: params.sid || undefined,
			name: params.n || '',
			price: params.p ? parseFloat(params.p) : undefined,
			image: params.img || '',
			shopName: params.sn || ''
		}

		// 分享菜品时验证门店ID
		if (type === ShareType.PRODUCT && !shareInfo.shopId) {
			console.error('分享菜品链接缺少门店ID参数')
			return null
		}

		return shareInfo
	} catch (e) {
		console.error('解析分享链接失败:', e)
		return null
	}
}

/**
 * 清除分享参数（兼容 H5 + App）
 * H5：清除 URL 中的查询参数
 * App：无操作（App 环境通过页面路由参数传入，无需清理）
 */
export function clearShareParams() {
	// #ifdef H5
	try {
		const url = window.location.href
		const hashIndex = url.indexOf('#')

		if (hashIndex !== -1) {
			const hashPart = url.substring(hashIndex)
			const queryIndex = hashPart.indexOf('?')

			if (queryIndex !== -1) {
				const hashPath = hashPart.substring(0, queryIndex)
				const newUrl = url.substring(0, hashIndex) + hashPath
				window.history.replaceState(null, '', newUrl)
			}
		}
	} catch (e) {
		console.error('清除分享参数失败:', e)
	}
	// #endif
}

/**
 * 复制文本到剪贴板（兼容 H5 + App）
 * @param {string} text 要复制的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
export function copyToClipboard(text) {
	return new Promise((resolve) => {
		uni.setClipboardData({
			data: text,
			success: () => resolve(true),
			fail: () => resolve(false)
		})
	})
}

/**
 * 分享门店
 * @param {Object} shopInfo 门店信息
 * @param {string|number} shopInfo.id 门店ID（必填）
 * @param {string} [shopInfo.name] 门店名称
 * @param {string} [shopInfo.logo] 门店logo
 * @param {string} [shopInfo.banner] 门店横幅
 * @returns {Promise<{success: boolean, link: string}>}
 */
export async function shareShop(shopInfo) {
	if (!shopInfo.id) {
		console.error('分享门店失败：缺少门店ID')
		return { success: false, link: '' }
	}

	const link = generateShareLink({
		type: ShareType.SHOP,
		id: shopInfo.id,
		name: shopInfo.name,
		image: shopInfo.logo || shopInfo.banner
	})

	if (!link) {
		return { success: false, link: '' }
	}

	const success = await copyToClipboard(link)
	return { success, link }
}

/**
 * 分享菜品
 * @param {Object} productInfo 菜品信息
 * @param {string|number} productInfo.id 菜品ID（必填）
 * @param {string} [productInfo.name] 菜品名称
 * @param {number} [productInfo.price] 菜品价格
 * @param {string} [productInfo.image] 菜品图片
 * @param {Object} shopInfo 门店信息
 * @param {string|number} shopInfo.id 门店ID（必填）
 * @param {string} [shopInfo.name] 门店名称
 * @returns {Promise<{success: boolean, link: string}>}
 */
export async function shareProduct(productInfo, shopInfo) {
	if (!productInfo.id) {
		console.error('分享菜品失败：缺少菜品ID')
		return { success: false, link: '' }
	}

	if (!shopInfo.id) {
		console.error('分享菜品失败：缺少门店ID')
		return { success: false, link: '' }
	}

	const link = generateShareLink({
		type: ShareType.PRODUCT,
		id: productInfo.id,
		shopId: shopInfo.id,
		name: productInfo.name,
		price: productInfo.price,
		image: productInfo.image,
		shopName: shopInfo.name
	})

	if (!link) {
		return { success: false, link: '' }
	}

	const success = await copyToClipboard(link)
	return { success, link }
}

/**
 * 根据分享信息获取跳转URL
 * @param {Object} shareInfo 分享信息
 * @returns {string} 跳转URL
 */
export function getShareTargetUrl(shareInfo) {
	if (!shareInfo || !shareInfo.type || !shareInfo.id) {
		return ''
	}

	if (shareInfo.type === ShareType.SHOP) {
		// 跳转到门店页面
		return `/pages/dinein/index?shopId=${shareInfo.id}`
	} else if (shareInfo.type === ShareType.PRODUCT) {
		// 跳转到商品详情页，必须带上门店ID
		if (!shareInfo.shopId) {
			console.error('无法跳转：缺少门店ID')
			return ''
		}
		return `/pages/product-detail/index?productId=${shareInfo.id}&shopId=${shareInfo.shopId}`
	}

	return ''
}
