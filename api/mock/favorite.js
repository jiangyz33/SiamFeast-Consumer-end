/**
 * 模拟数据 - 收藏相关
 */

// 模拟收藏列表
let mockFavorites = []

/**
 * 获取收藏列表
 */
export function mockGetFavorites(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let items = [...mockFavorites]
			if (params.type && params.type !== 'all') {
				items = items.filter(f => f.type === params.type)
			}
			resolve({
				code: 0,
				message: 'success',
				data: {
					items: items,
					total: items.length
				}
			})
		}, 300)
	})
}

/**
 * 检查是否已收藏
 */
export function mockCheckFavorite(data) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const exists = mockFavorites.some(
				f => f.target_id === data.target_id && f.type === data.type
			)
			resolve({
				code: 0,
				message: 'success',
				data: { is_favorited: exists }
			})
		}, 200)
	})
}

/**
 * 添加收藏
 */
export function mockAddFavorite(data) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const exists = mockFavorites.some(
				f => f.target_id === data.target_id && f.type === data.type
			)
			if (exists) {
				return resolve({ code: -1, message: '已收藏' })
			}
			mockFavorites.push({
				id: Date.now(),
				target_id: data.target_id,
				type: data.type,
				name: data.name || '',
				image_url: data.image_url || '',
				price: data.price || 0,
				created_at: new Date().toISOString()
			})
			resolve({
				code: 0,
				message: '收藏成功',
				data: { id: Date.now() }
			})
		}, 300)
	})
}

/**
 * 取消收藏
 */
export function mockRemoveFavorite(data) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const idx = mockFavorites.findIndex(
				f => f.target_id === data.target_id && f.type === data.type
			)
			if (idx >= 0) {
				mockFavorites.splice(idx, 1)
			}
			resolve({
				code: 0,
				message: '取消收藏成功'
			})
		}, 300)
	})
}

export default {
	mockGetFavorites,
	mockCheckFavorite,
	mockAddFavorite,
	mockRemoveFavorite
}
