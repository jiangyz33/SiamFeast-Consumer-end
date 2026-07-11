/**
 * 密码相关 API
 */
import { USE_MOCK } from '../config.js'
import { post } from '../request.js'
import store from '../../store/index.js'

/**
 * 模拟重置密码
 */
function mockResetPassword(data) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const { old_password, new_password } = data
			const userInfo = store.getUserInfo()

			// 模拟验证旧密码
			if (old_password !== '123456') {
				return resolve({
					code: -1,
					message: '旧密码错误'
				})
			}

			if (new_password.length < 6) {
				return resolve({
					code: -1,
					message: '新密码长度不能少于6位'
				})
			}

			resolve({
				code: 0,
				message: '密码修改成功'
			})
		}, 500)
	})
}

/**
 * 修改密码（已登录用户，使用旧密码）
 * POST /password/change
 * @param {Object} data
 * @param {string} data.old_password 旧密码
 * @param {string} data.new_password 新密码（≥6 位）
 * @returns {Promise}
 */
export function resetPassword(data) {
	if (USE_MOCK) {
		return mockResetPassword(data)
	}
	return post('/password/change', {
		old_password: data.old_password,
		new_password: data.new_password
	})
}

export const passwordApi = {
	resetPassword
}

export default passwordApi
