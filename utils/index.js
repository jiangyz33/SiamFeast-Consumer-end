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
 * 修正 MinIO URL（本地开发时后端返回 localhost:9000）
 * @param {string} url 原始 URL
 * @returns {string} 修正后的 URL
 */
export function fixMinioUrl(url) {
	if (!url) return url
	const from = "localhost:9000"
	const to = "106.12.91.224:9000"
	if (url.includes(from)) {
		return url.replace(from, to)
	}
	return url
}
