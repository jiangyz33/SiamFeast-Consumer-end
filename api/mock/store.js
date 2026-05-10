/**
 * 模拟数据 - 门店相关
 */

// 模拟门店列表
export const mockStores = [
	{
		id: 1,
		name: '芭堤雅泰式火锅',
		name_en: 'Pattaya Thai Hotpot',
		name_th: 'พัทยา',
		code: 'PTH001',
		address: '四惠·远洋天地二期',
		address_en: 'Sihui Yuanyang Tiandi Phase II',
		phone: '02-123-4567',
		latitude: 13.7563,
		longitude: 100.5018,
		formatted_address: '四惠·远洋天地二期',
		place_id: 'ChIJ_mock_pattaya',
		delivery_radius_m: 5000,
		geo_source: 'MANUAL',
		geocode_status: 'SUCCESS',
		business_types: ['HOTPOT', 'MALA_TANG'],
		status: 'OPEN',
		delivery_enabled: true,
		banner: '/static/images/banner-placeholder.svg',
		logo: '/static/images/store-placeholder.svg',
		rating: '4.7',
		businessHours: '11:00-22:00',
		distance: '600m',
		bikeTime: '骑行15分钟',
		walkTime: '步行11分钟',
		config: {
			opening_time: '11:00:00',
			closing_time: '22:00:00',
			is_24_hours: false,
			closed_days: [],
			coin_rate: 1.0,
			delivery_fee: 5.0,
			min_delivery_amount: 20.0
		},
		created_at: '2024-01-01T00:00:00'
	},
	{
		id: 2,
		name: '茉莉奶白万达店',
		name_en: 'Jasmine Milk Tea Wanda',
		name_th: 'มะลิ',
		code: 'JMT001',
		address: '朝阳区万达广场B1层',
		address_en: 'Wanda Plaza B1, Chaoyang',
		phone: '02-234-5678',
		latitude: 13.7400,
		longitude: 100.5300,
		formatted_address: '朝阳区万达广场B1层',
		place_id: 'ChIJ_mock_jasmine',
		delivery_radius_m: 5000,
		geo_source: 'MANUAL',
		geocode_status: 'SUCCESS',
		business_types: ['BEVERAGE'],
		status: 'OPEN',
		delivery_enabled: true,
		banner: '/static/images/banner-placeholder.svg',
		logo: '/static/images/store-placeholder.svg',
		rating: '4.8',
		businessHours: '10:00-22:00',
		distance: '1.2km',
		bikeTime: '骑行20分钟',
		walkTime: '步行25分钟',
		config: {
			opening_time: '10:00:00',
			closing_time: '22:00:00',
			is_24_hours: false,
			closed_days: [],
			coin_rate: 1.0,
			delivery_fee: 3.0,
			min_delivery_amount: 15.0
		},
		created_at: '2024-01-15T00:00:00'
	},
	{
		id: 3,
		name: '茶颜悦色',
		name_en: 'Modern China Tea Shop',
		name_th: 'ชาจีนสมัยใหม่',
		code: 'MCT001',
		address: '三里屯太古里北区',
		address_en: 'Sanlitun Taikoo Li North',
		phone: '02-345-6789',
		latitude: 13.7450,
		longitude: 100.5400,
		formatted_address: '三里屯太古里北区',
		place_id: 'ChIJ_mock_chayan',
		delivery_radius_m: 3000,
		geo_source: 'MANUAL',
		geocode_status: 'SUCCESS',
		business_types: ['BEVERAGE'],
		status: 'OPEN',
		delivery_enabled: false,
		banner: '/static/images/banner-placeholder.svg',
		logo: '/static/images/store-placeholder.svg',
		rating: '4.9',
		businessHours: '10:00-23:00',
		distance: '2.5km',
		bikeTime: '骑行30分钟',
		walkTime: '步行45分钟',
		config: {
			opening_time: '10:00:00',
			closing_time: '23:00:00',
			is_24_hours: false,
			closed_days: [],
			coin_rate: 1.0,
			delivery_fee: 0,
			min_delivery_amount: 0
		},
		created_at: '2024-02-01T00:00:00'
	}
]

/**
 * 模拟获取门店列表
 */
export function mockGetStores(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let stores = [...mockStores]

			// 状态筛选
			if (params.status_filter) {
				stores = stores.filter(s => s.status === params.status_filter)
			}

			resolve({
				code: 0,
				message: 'success',
				data: stores
			})
		}, 300)
	})
}

/**
 * 模拟获取门店详情
 */
export function mockGetStore(storeId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const store = mockStores.find(s => s.id === parseInt(storeId))
			if (store) {
				resolve({
					code: 0,
					message: 'success',
					data: store
				})
			} else {
				reject({
					code: 40202,
					message: '门店不存在'
				})
			}
		}, 300)
	})
}

export default {
	mockStores,
	mockGetStores,
	mockGetStore
}
