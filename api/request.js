/**
 * 网络请求封装
 */
import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_KEY, RESPONSE_CODE } from './config.js'
import { getErrorMessage } from '../utils/index.js'

const MINIO_BASE = 'http://34.15.175.23:9000'
const OLD_MINIO_HOSTS = ['106.12.91.224:9000', '106.13.161.35:9000', 'localhost:9000', '127.0.0.1:9000']
const IMAGE_KEYS = ['image_url', 'logo_url', 'avatar_url', 'banner_url', 'icon_url', 'cover_url', 'img_url', 'photo_url', 'background_image_url', 'banner_image', 'thumb_url']

/**
 * 递归修正后端返回的图片相对路径为完整 MinIO URL
 */
function fixImageUrls(obj) {
	if (!obj || typeof obj !== 'object') return obj
	if (Array.isArray(obj)) return obj.forEach(fixImageUrls)
	for (const key of Object.keys(obj)) {
		const val = obj[key]
		if (typeof val === 'string' && IMAGE_KEYS.includes(key)) {
			if (val.includes('example.com')) {
				obj[key] = ''
			} else if (OLD_MINIO_HOSTS.some(h => val.includes(h))) {
				let fixed = val; for (const h of OLD_MINIO_HOSTS) { fixed = fixed.replace(h, '34.15.175.23:9000') }; obj[key] = fixed
			} else if (val.startsWith('/minio-files/')) {
				obj[key] = MINIO_BASE + val.replace('/minio-files/', '/')
			} else if (val.startsWith('/') && !val.startsWith('/static')) {
				obj[key] = MINIO_BASE + val
			} else if (!val.startsWith('http') && !val.startsWith('/static') && !val.startsWith('data:')) {
				obj[key] = MINIO_BASE + '/sf-uploads/' + val
			} else if (val.includes('localhost:9000')) {
				obj[key] = val.replace('localhost:9000', '34.15.175.23:9000')
			}
		} else if (typeof val === 'object' && val !== null) {
			fixImageUrls(val)
		}
	}
}

/**
 * 通用请求方法
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
export function request(options) {
	return new Promise((resolve, reject) => {
		const { url, method = 'GET', data = {}, header = {}, showLoading = false, loadingText = '加载中...', silent = false } = options

		// 显示加载
		if (showLoading) {
			uni.showLoading({ title: loadingText, mask: true })
		}

		// 获取 token
		const token = uni.getStorageSync(TOKEN_KEY) || ''

		// 构建请求头
		const requestHeader = {
			'Content-Type': 'application/json',
			...header
		}

		// 添加认证头
		if (token) {
			requestHeader['Authorization'] = `Bearer ${token}`
		}

		uni.request({
			url: `${API_BASE_URL}${url}`,
			method,
			data,
			header: requestHeader,
			timeout: REQUEST_TIMEOUT,
			success: (res) => {
				if (showLoading) {
					uni.hideLoading()
				}

				const { statusCode, data: responseData } = res

				// HTTP 状态码判断
				if (statusCode >= 200 && statusCode < 300) {
					// 兼容两种响应格式：
					// 1. {code: 0, data: {...}} — 带包装的格式
					// 2. 裸数据 — 后端直接返回，无 code 字段
					if (responseData === null || responseData === undefined) {
					resolve({ code: 0, message: 'success', data: null })
				} else if (responseData.code === undefined) {
					// 先检查后端错误格式：{detail: {code, message}}
					if (responseData.detail && responseData.detail.code) {
						const err = responseData.detail
						if (err.code === 40001 || err.code === 40004) {
							uni.removeStorageSync(TOKEN_KEY)
							uni.removeStorageSync('siamfeast_userInfo')
							if (!silent) uni.showToast({ title: err.message || '请重新登录', icon: 'none' })
							setTimeout(() => { uni.reLaunch({ url: '/pages/login/index' }) }, 1500)
						} else {
							if (!silent) uni.showToast({ title: getErrorMessage(err) || err.message || '请求失败', icon: 'none' })
						}
						reject(err)
						return
					}
					// 裸数据响应，视为成功，包装为统一格式
					fixImageUrls(responseData)
					resolve({ code: 0, message: 'success', data: responseData })
				} else if (typeof responseData.code === 'string') {
					// code 为字符串：区分业务数据与后端错误
					// 业务对象如门店: {id, name, code: 'RST_XXX', ...}
					// 后端错误: {code: 'NOT_FOUND', message: '...'}
					if (responseData.id !== undefined || responseData.items !== undefined || responseData.access_token !== undefined || responseData.total !== undefined) {
						fixImageUrls(responseData)
						resolve({ code: 0, message: 'success', data: responseData })
					} else {
						if (!silent) uni.showToast({ title: getErrorMessage(responseData) || responseData.message || '请求失败', icon: 'none' })
						reject(responseData)
					}
				} else if (responseData.code === RESPONSE_CODE.SUCCESS) {
						fixImageUrls(responseData)
						resolve(responseData)
					} else if (responseData.code === RESPONSE_CODE.UNAUTHORIZED) {
						// token 过期或无效，清除登录状态
						uni.removeStorageSync(TOKEN_KEY)
						uni.removeStorageSync('siamfeast_userInfo')

						// 跳转到登录页
						if (!silent) {
						uni.showToast({
							title: '请重新登录',
							icon: 'none'
						})
						}
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/login/index'
							})
						}, 1500)
						reject(responseData)
					} else if (responseData.detail && responseData.detail.code) {
						// 后端错误格式：{ detail: { code, message } }
						const err = responseData.detail
						if (err.code === 40001 || err.code === 40004) {
							// 未授权 / 用户不存在
							uni.removeStorageSync(TOKEN_KEY)
							uni.removeStorageSync('siamfeast_userInfo')
							if (!silent) {
							uni.showToast({
								title: err.message || '请重新登录',
								icon: 'none'
							})
							}
							setTimeout(() => {
								uni.reLaunch({
									url: '/pages/login/index'
								})
							}, 1500)
						} else {
							if (!silent) {
							uni.showToast({
								title: getErrorMessage(err) || err.message || '请求失败',
								icon: 'none'
							})
							}
						}
						reject(err)
					} else {
						// 业务错误
						if (!silent) {
						uni.showToast({
							title: getErrorMessage(responseData) || responseData.message || '请求失败',
							icon: 'none'
						})
						}
						reject(responseData)
					}
				} else if (statusCode === 401 || statusCode === 403) {
					// 未授权
					uni.removeStorageSync(TOKEN_KEY)
					uni.removeStorageSync('siamfeast_userInfo')
					if (!silent) {
					uni.showToast({
						title: '请重新登录',
						icon: 'none'
					})
					}
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/login/index'
						})
					}, 1500)
					reject({ code: 401, message: '未授权' })
				} else {
					// 422 参数校验 / 其他 HTTP 错误
					let errMsg = '请求失败'
					if (statusCode === 422 && responseData.detail) {
						if (Array.isArray(responseData.detail)) {
							errMsg = responseData.detail.map(e => {
								const field = e.loc ? e.loc.join('.') : ''
								return field ? `${field}: ${e.msg}` : e.msg
							}).join('; ')
						} else if (responseData.detail.message) {
							errMsg = responseData.detail.message
						}
					} else if (responseData.detail && responseData.detail.message) {
						errMsg = responseData.detail.message
					} else if (responseData.message) {
						errMsg = responseData.message
					}
					if (!silent) {
					uni.showToast({
						title: errMsg,
						icon: 'none'
					})
					}
					reject({ code: statusCode, message: errMsg })
				}
			},
			fail: (err) => {
				if (showLoading) {
					uni.hideLoading()
				}
				if (!silent) {
				uni.showToast({
					title: '网络连接失败',
					icon: 'none'
				})
				}
				reject({ code: -1, message: '网络连接失败', error: err })
			}
		})
	})
}

/**
 * GET 请求
 */
export function get(url, data = {}, options = {}) {
	return request({
		url,
		method: 'GET',
		data,
		...options
	})
}

/**
 * POST 请求
 */
export function post(url, data = {}, options = {}) {
	return request({
		url,
		method: 'POST',
		data,
		...options
	})
}

/**
 * PUT 请求
 */
export function put(url, data = {}, options = {}) {
	return request({
		url,
		method: 'PUT',
		data,
		...options
	})
}

/**
 * PATCH 请求
 */
export function patch(url, data = {}, options = {}) {
	return request({
		url,
		method: 'PATCH',
		data,
		...options
	})
}

/**
 * DELETE 请求
 */
export function del(url, data = {}, options = {}) {
	return request({
		url,
		method: 'DELETE',
		data,
		...options
	})
}

/**
 * 文件上传
 * @param {string} url 上传接口路径
 * @param {string} filePath 本地文件路径
 * @param {string} [name='file'] 文件字段名
 * @param {Object} [formData={}] 额外表单数据
 * @returns {Promise}
 */
export function upload(url, filePath, name = 'file', formData = {}) {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync(TOKEN_KEY) || ''
		const fullUrl = url.startsWith('http') ? url : API_BASE_URL + url

		uni.uploadFile({
			url: fullUrl,
			filePath,
			name,
			formData,
			header: {
				'Authorization': token ? `Bearer ${token}` : ''
			},
			success: (res) => {
				try {
					const data = JSON.parse(res.data)
					if (data.code === undefined && !data.detail) {
						resolve({ code: 0, message: 'success', data })
					} else {
						resolve(data)
					}
				} catch (e) {
					resolve({ code: -1, message: '解析响应失败' })
				}
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

export default {
	request,
	get,
	post,
	put,
	patch,
	del,
	upload
}
