/**
 * 模拟数据 - 配送相关
 */

// 模拟配送信息
const mockDeliveries = {
	1: {
		order_id: 1,
		delivery_type: 'pickup',
		status: 'PREPARING',
		carrier: null,
		tracking_no: null,
		estimated_time: null,
		address: null,
		shop: {
			name: '芭堤雅泰式火锅',
			address: '四惠·远洋天地二期',
			phone: '010-88886666'
		}
	},
	2: {
		order_id: 2,
		delivery_type: 'pickup',
		status: 'COMPLETED',
		carrier: null,
		tracking_no: null,
		estimated_time: null,
		address: null,
		shop: {
			name: '芭堤雅泰式火锅',
			address: '四惠·远洋天地二期',
			phone: '010-88886666'
		}
	},
	3: {
		order_id: 3,
		delivery_type: 'delivery',
		status: 'PENDING',
		carrier: '顺丰同城',
		tracking_no: 'SF2024030800001',
		estimated_time: 30,
		address: {
			name: '张三',
			phone: '138****8888',
			detail: '北京市朝阳区某某小区某某号楼某某室'
		},
		shop: {
			name: '芭堤雅泰式火锅',
			address: '四惠·远洋天地二期',
			phone: '010-88886666'
		}
	},
	4: {
		order_id: 4,
		delivery_type: 'delivery',
		status: 'DELIVERING',
		carrier: '美团配送',
		tracking_no: 'MT2024030700001',
		estimated_time: 15,
		address: {
			name: '李四',
			phone: '139****9999',
			detail: '北京市海淀区中关村大街某某号'
		},
		shop: {
			name: '芭堤雅泰式火锅',
			address: '四惠·远洋天地二期',
			phone: '010-88886666'
		}
	}
}

/**
 * 模拟获取订单配送信息
 */
export function mockGetOrderDelivery(orderId) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const delivery = mockDeliveries[parseInt(orderId)] || {
				order_id: orderId,
				delivery_type: 'pickup',
				status: 'PENDING',
				carrier: null,
				tracking_no: null,
				estimated_time: null,
				address: null,
				shop: {
					name: 'SiamFeast',
					address: '曼谷市中心',
					phone: '02-000-0000'
				}
			}
			resolve({
				code: 0,
				message: 'success',
				data: delivery
			})
		}, 200)
	})
}

export default {
	mockDeliveries,
	mockGetOrderDelivery
}
