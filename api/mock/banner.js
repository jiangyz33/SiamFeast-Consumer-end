/**
 * 模拟数据 - 轮播图
 */

// 模拟首页轮播图
const mockHomeBanners = [
	{
		id: 1,
		title: '新品上市',
		image_url: '/static/logo.png',
		link_type: 'PAGE',
		link_value: '/pages/new-products/index',
		position: 'HOME',
		store_id: null,
		sort_order: 0,
		is_active: true,
		start_time: null,
		end_time: null,
		created_at: '2024-01-01T00:00:00',
		updated_at: '2024-01-01T00:00:00'
	},
	{
		id: 2,
		title: '限时优惠',
		image_url: '/static/logo.png',
		link_type: 'PAGE',
		link_value: '/pages/discount/index',
		position: 'HOME',
		store_id: null,
		sort_order: 1,
		is_active: true,
		start_time: null,
		end_time: null,
		created_at: '2024-01-01T00:00:00',
		updated_at: '2024-01-01T00:00:00'
	},
	{
		id: 3,
		title: '积分商城',
		image_url: '/static/logo.png',
		link_type: 'PAGE',
		link_value: '/pages/points-mall/index',
		position: 'HOME',
		store_id: null,
		sort_order: 2,
		is_active: true,
		start_time: null,
		end_time: null,
		created_at: '2024-01-01T00:00:00',
		updated_at: '2024-01-01T00:00:00'
	}
]

// 模拟商城轮播图
const mockMallBanners = [
	{
		id: 10,
		title: '新人专享',
		image_url: '/static/logo.png',
		link_type: 'PAGE',
		link_value: '/pages/newbie-gift/index',
		position: 'MALL',
		store_id: null,
		sort_order: 0,
		is_active: true,
		start_time: null,
		end_time: null,
		created_at: '2024-01-01T00:00:00',
		updated_at: '2024-01-01T00:00:00'
	},
	{
		id: 11,
		title: '热销推荐',
		image_url: '/static/logo.png',
		link_type: 'PAGE',
		link_value: '/pages/hot-products/index',
		position: 'MALL',
		store_id: null,
		sort_order: 1,
		is_active: true,
		start_time: null,
		end_time: null,
		created_at: '2024-01-01T00:00:00',
		updated_at: '2024-01-01T00:00:00'
	},
	{
		id: 12,
		title: '满减活动',
		image_url: '/static/logo.png',
		link_type: 'PAGE',
		link_value: '/pages/discount/index',
		position: 'MALL',
		store_id: null,
		sort_order: 2,
		is_active: true,
		start_time: null,
		end_time: null,
		created_at: '2024-01-01T00:00:00',
		updated_at: '2024-01-01T00:00:00'
	},
	{
		id: 13,
		title: '拼团优惠',
		image_url: '/static/logo.png',
		link_type: 'PAGE',
		link_value: '/pages/group/index',
		position: 'MALL',
		store_id: null,
		sort_order: 3,
		is_active: true,
		start_time: null,
		end_time: null,
		created_at: '2024-01-01T00:00:00',
		updated_at: '2024-01-01T00:00:00'
	}
]

/**
 * 模拟获取首页轮播图
 */
export function mockGetHomeBanners() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: mockHomeBanners
			})
		}, 200)
	})
}

/**
 * 模拟获取店铺轮播图
 */
export function mockGetStoreBanners(storeId) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: []
			})
		}, 200)
	})
}

/**
 * 模拟获取商城轮播图
 */
export function mockGetMallBanners() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: mockMallBanners
			})
		}, 200)
	})
}

/**
 * 模拟获取新人礼包轮播图
 */
export function mockGetNewbieBanners() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: []
			})
		}, 200)
	})
}

export default {
	mockHomeBanners,
	mockMallBanners,
	mockGetHomeBanners,
	mockGetStoreBanners,
	mockGetMallBanners,
	mockGetNewbieBanners
}
