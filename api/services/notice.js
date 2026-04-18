/**
 * 全局公告通知相关 API
 */
import { USE_MOCK } from '../config.js'
import { get } from '../request.js'

/**
 * 获取全局公告通知
 * @returns {Promise} 返回 { code: 0, data: { content, ... } }
 */
export function getGlobalNotice() {
	if (USE_MOCK) {
		return Promise.resolve({
			code: 0,
			message: 'success',
			data: {
				id: 1,
				content: '欢迎光临暹罗盛宴！新用户专享首单优惠，详情请咨询店员。',
				is_active: true
			}
		})
	}
	return get('/notices/global', {}, { silent: true })
}

export const noticeApi = {
	getGlobalNotice
}

export default noticeApi
