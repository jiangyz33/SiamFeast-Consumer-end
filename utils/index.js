/**
 * 验证手机号格式
 * 不限制位数，只检查非空且为数字
 * @param {string} phone 手机号
 * @returns {boolean}
 */
export function validatePhone(phone) {
	if (!phone || !phone.trim()) return false
	return /^\d+$/.test(phone.trim())
}

/**
 * 格式化手机号显示（隐藏中间4位）
 * @param {string} phone 手机号
 * @returns {string}
 */
export function formatPhone(phone) {
	if (!phone || (phone.length !== 9 && phone.length !== 10)) return phone
	if (phone.length === 9) {
		return phone.replace(/(\d{2})\d{4}(\d{3})/, '$1****$2')
	}
	return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')
}

/**
 * 格式化手机号显示（带横线）- 泰国格式
 * @param {string} phone 手机号
 * @returns {string}
 */
export function formatPhoneWithDash(phone) {
	if (!phone) return phone
	if (phone.length === 9) {
		// 9位：08-1234-567
		return `${phone.slice(0, 2)}-${phone.slice(2, 6)}-${phone.slice(6)}`
	} else if (phone.length === 10) {
		// 10位：081-234-5678
		return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
	}
	return phone
}

/**
 * 验证验证码格式
 * @param {string} code 验证码
 * @param {number} length 验证码长度，默认5位
 * @returns {boolean}
 */
export function validateCode(code, length = 5) {
	const reg = new RegExp(`^\\d{${length}}$`)
	return reg.test(code)
}

/**
 * 存储数据到本地
 * @param {string} key 键名
 * @param {any} value 值
 */
export function setStorage(key, value) {
	try {
		uni.setStorageSync(key, JSON.stringify(value))
	} catch (e) {
		console.error('setStorage error:', e)
	}
}

/**
 * 从本地获取数据
 * @param {string} key 键名
 * @returns {any}
 */
export function getStorage(key) {
	try {
		const value = uni.getStorageSync(key)
		return value ? JSON.parse(value) : null
	} catch (e) {
		console.error('getStorage error:', e)
		return null
	}
}

/**
 * 移除本地存储
 * @param {string} key 键名
 */
export function removeStorage(key) {
	try {
		uni.removeStorageSync(key)
	} catch (e) {
		console.error('removeStorage error:', e)
	}
}

/**
 * 显示提示
 * @param {string} title 提示文字
 * @param {string} icon 图标
 */
export function showToast(title, icon = 'none') {
	uni.showToast({
		title,
		icon,
		duration: 2000
	})
}

/**
 * 显示加载
 * @param {string} title 加载文字
 */
export function showLoading(title = '加载中...') {
	uni.showLoading({
		title,
		mask: true
	})
}

/**
 * 隐藏加载
 */
export function hideLoading() {
	uni.hideLoading()
}

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
	let timer = null
	return function(...args) {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			fn.apply(this, args)
		}, delay)
	}
}

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间
 * @returns {Function}
 */
export function throttle(fn, delay = 300) {
	let lastTime = 0
	return function(...args) {
		const now = Date.now()
		if (now - lastTime >= delay) {
			lastTime = now
			fn.apply(this, args)
		}
	}
}

/**
 * 格式化时间
 * @param {Date|number|string} date 日期
 * @param {string} format 格式
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
	const d = new Date(date)
	const year = d.getFullYear()
	const month = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	const hours = String(d.getHours()).padStart(2, '0')
	const minutes = String(d.getMinutes()).padStart(2, '0')
	const seconds = String(d.getSeconds()).padStart(2, '0')

	return format
		.replace('YYYY', year)
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hours)
		.replace('mm', minutes)
		.replace('ss', seconds)
}

/**
 * 深拷贝
 * @param {any} obj 要拷贝的对象
 * @returns {any}
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') return obj
	if (obj instanceof Date) return new Date(obj)
	if (obj instanceof Array) return obj.map(item => deepClone(item))

	const clone = {}
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			clone[key] = deepClone(obj[key])
		}
	}
	return clone
}

/**
 * 修正 MinIO URL
 * 1. 相对路径 /minio-files/sf-uploads/... → http://34.15.175.23:9000/sf-uploads/...
 * 2. localhost:9000 → 34.15.175.23:9000
 * @param {string} url 原始 URL
 * @returns {string} 修正后的 URL
 */
const OLD_MINIO_HOSTS = ['106.12.91.224:9000', '106.13.161.35:9000', 'localhost:9000', '127.0.0.1:9000']
const NEW_MINIO_BASE = 'http://34.15.175.23:9000'

export function fixMinioUrl(url) {
	if (!url) return url
	for (const old of OLD_MINIO_HOSTS) {
		if (url.includes(old)) {
			return url.replace(old, '34.15.175.23:9000')
		}
	}
	if (url.startsWith('/minio-files/')) {
		return NEW_MINIO_BASE + '/' + url.replace('/minio-files/', '')
	}
	if (url.startsWith('/') && !url.startsWith('/static')) {
		return NEW_MINIO_BASE + url
	}
	if (!url.startsWith('http') && !url.startsWith('/static') && !url.startsWith('data:')) {
		return NEW_MINIO_BASE + '/sf-uploads/' + url
	}
	return url
}

/**
 * Get localized name from an object with name/name_en/name_th fields
 * @param {Object} obj - object with name, name_en, name_th fields
 * @param {string} lang - language code (zh/en/th)
 * @returns {string}
 */
export function getLocalName(obj, lang) {
	if (!obj) return ''
	const l = lang || 'zh'
	if (l === 'en') return obj.name_en || obj.name || obj.name_th || ''
	if (l === 'th') return obj.name_th || obj.name || obj.name_en || ''
	return obj.name || obj.name_en || obj.name_th || ''
}

/**
 * Get localized description from an object with description/description_en/description_th fields
 * @param {Object} obj - object with description fields
 * @param {string} lang - language code (zh/en/th)
 * @returns {string}
 */
export function getLocalDesc(obj, lang) {
	if (!obj) return ''
	const l = lang || 'zh'
	if (l === 'en') return obj.description_en || obj.description || obj.description_th || ''
	if (l === 'th') return obj.description_th || obj.description || obj.description_en || ''
	return obj.description || obj.description_en || obj.description_th || ''
}

/**
 * Map backend error codes to i18n-friendly messages
 * @param {Object} error - error object with code/message fields
 * @returns {string} user-friendly error message
 */
/**
 * Haversine formula to calculate distance between two GPS coordinates
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {Object} { distanceKm, distanceText, walkMinutes, bikeMinutes, walkText, bikeText }
 */
export function calcDistance(lat1, lng1, lat2, lng2) {
	const R = 6371
	const toRad = d => d * Math.PI / 180
	const dLat = toRad(lat2 - lat1)
	const dLng = toRad(lng2 - lng1)
	const a = Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const distanceKm = R * c

	const distanceText = distanceKm < 1
		? Math.round(distanceKm * 1000) + 'm'
		: distanceKm.toFixed(1) + 'km'

	const walkMinutes = Math.round(distanceKm / 5 * 60)
	const bikeMinutes = Math.round(distanceKm / 15 * 60)

	const walkText = walkMinutes < 60 ? walkMinutes + 'min' : (walkMinutes / 60).toFixed(1) + 'h'
	const bikeText = bikeMinutes < 60 ? bikeMinutes + 'min' : (bikeMinutes / 60).toFixed(1) + 'h'

	return { distanceKm, distanceText, walkMinutes, bikeMinutes, walkText, bikeText }
}

/**
 * Get user's current GPS location (gcj02 coordinate system)
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function getUserLocation() {
	return new Promise((resolve, reject) => {
		uni.getLocation({
			type: 'gcj02',
			success: res => resolve({ latitude: res.latitude, longitude: res.longitude }),
			fail: err => reject(err)
		})
	})
}

/**
 * Map backend error codes to i18n-friendly messages
 * @param {Object} error - error object with code/message fields
 * @returns {string} user-friendly error message
 */
export function getErrorMessage(error) {
	const code = error?.code || error?.data?.code || ''
	const codeMap = {
		'UNAUTHENTICATED': 'error.unauthenticated',
		'TOKEN_INVALID': 'error.tokenInvalid',
		'PERMISSION_DENIED': 'error.permissionDenied',
		'INVALID_PARAM': 'error.invalidParam',
		'NOT_FOUND': 'error.notFound',
		'STATUS_CONFLICT': 'error.statusConflict',
		'GROUP_BUY_NOT_SUPPORTED': 'error.groupBuyNotSupported',
		'GROUP_BUY_SOLD_OUT': 'error.soldOut',
		'GROUP_BUY_LIMIT_EXCEEDED': 'error.limitExceeded',
		'GROUP_BUY_EXPIRED': 'error.expired',
		'GROUP_BUY_NOT_ACTIVE': 'error.notActive',
		'ROOM_BOOKED': 'error.roomBooked',
		'NO_PRICING': 'error.noPricing',
		'INVALID_PRICING': 'error.invalidPricing',
		'INVALID_DATE_RANGE': 'error.invalidDateRange',
		'CAPABILITY_DENIED': 'error.capabilityDenied',
		'CAPABILITY_DISABLED': 'error.capabilityDisabled',
	}
	const i18nKey = codeMap[code]
	if (i18nKey) {
		try {
			const i18n = require('@/i18n/index.js').default || require('@/i18n/index.js')
			return (i18n.t ? i18n : i18n.default).t(i18nKey)
		} catch (e) {
			// fallback
		}
	}
	return error?.message || '请求失败'
}
