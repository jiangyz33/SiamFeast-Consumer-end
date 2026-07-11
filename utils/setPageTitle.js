/**
 * 设置页面标题（H5 浏览器标签页 + 移动端 webview）
 * 在 H5 环境下设置 document.title
 * 在 APP / 小程序环境用 uni.setNavigationBarTitle
 * @param {string} title 标题文本
 */
export function setPageTitle(title) {
	if (!title) return
	try {
		// #ifdef H5
		if (typeof document !== 'undefined') {
			document.title = title
		}
		// #endif
		// #ifndef H5
		if (typeof uni !== 'undefined' && uni.setNavigationBarTitle) {
			uni.setNavigationBarTitle({ title })
		}
		// #endif
	} catch (e) {
		console.warn('[setPageTitle] failed:', e)
	}
}

/**
 * 页面路径 → i18n 标题 key 映射
 * 用于 H5 自动设置浏览器标签页标题
 */
export const PAGE_TITLE_MAP = {
	'pages/index/index': 'nav.home',
	'pages/order/index': 'order.title',
	'pages/member/index': 'mine.title',
	'pages/dinein/index': '',  // 堂食点餐页用门店名，不固定
	'pages/dinein-stores/index': 'dinein.welcome',
	'pages/mall/index': 'mall.title',
	'pages/products/index': 'products.productList',
	'pages/product-detail/index': 'productDetail.specs',
	'pages/checkout/index': 'checkout.title',
	'pages/payment-success/index': 'payment.success',
	'pages/order-detail/index': 'orderDetail.title',
	'pages/exchange-success/index': 'exchange.title',
	'pages/member-code/index': 'memberCode.title',
	'pages/points-mall/index': 'pointsMall.title',
	'pages/new-products/index': 'newProducts.title',
	'pages/hot-products/index': 'hotProducts.title',
	'pages/coupons/index': 'coupons.myCouponsTitle',
	'pages/claim-coupons/index': 'coupons.claimCenter',
	'pages/address/index': 'address.title',
	'pages/message/index': 'message.title',
	'pages/settings/index': 'settings.title',
	'pages/footprint/index': 'footprint.title',
	'pages/referral/index': 'mine.myReferral',
	'pages/store-select/index': 'storeSelect.title',
	'pages/login/index': 'login.title',
	'pages/login/verify': 'login.title',
	'pages/agreement/index': 'agreement.terms',
	'pages/group/index': 'groupBuy.title',
	'pages/group-detail/index': 'groupBuy.title',
	'pages/discount/index': 'discount.searchPlaceholder',
	'pages/newbie-gift/index': 'newProducts.title',
}

// i18n 实例缓存（main.js 启动时注入）
let _i18n = null
export function setI18nInstance(i18n) {
	_i18n = i18n
}

/**
 * 根据当前页面路径自动设置标题
 * @param {string} [path] 当前页面路径，不传则从 H5 location.pathname 解析
 */
export function autoSetPageTitle(path) {
	try {
		// 获取当前路径
		let currentPath = path
		if (!currentPath) {
			// #ifdef H5
			if (typeof window !== 'undefined' && window.location) {
				// hash 路由：location.pathname 永远是 /
				// history 路由：pathname 是真实路径
				let hash = window.location.hash.replace(/^#/, '')
				if (hash) {
					currentPath = hash.split('?')[0].replace(/^\//, '')
				}
				if (!currentPath) {
					currentPath = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '')
					currentPath = currentPath.split('?')[0].split('#')[0]
				}
			}
			// #endif
		}
		if (!currentPath) {
			setPageTitle('SiamFeast')
			return
		}

		// 匹配映射表
		const titleKey = PAGE_TITLE_MAP[currentPath]
		if (!titleKey) {
			// 兜底：用 APP 名
			setPageTitle('SiamFeast')
			return
		}

		// 从 i18n 取标题
		let title = 'SiamFeast'
		if (_i18n && _i18n.t) {
			const translated = _i18n.t(titleKey)
			if (translated && translated !== titleKey) title = translated
		}
		setPageTitle(title)
	} catch (e) {
		console.warn('[autoSetPageTitle] failed:', e)
		setPageTitle('SiamFeast')
	}
}

