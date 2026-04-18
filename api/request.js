/**
 * 网络请求封装
 */
import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_KEY, RESPONSE_CODE } from './config.js'

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
				if (statusCode === 200) {
					// 业务状态码判断
					if (responseData.code === RESPONSE_CODE.SUCCESS) {
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
								title: err.message || '请求失败',
								icon: 'none'
							})
							}
						}
						reject(err)
					} else {
						// 业务错误
						if (!silent) {
						uni.showToast({
							title: responseData.message || '请求失败',
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
					resolve(data)
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
	del,
	upload
}
