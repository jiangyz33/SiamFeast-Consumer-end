/**
 * 模拟数据 - 活动/促销相关
 */

// 模拟活动列表
const mockCampaigns = [
	{
		id: 1,
		name: '限时特惠',
		name_en: 'Flash Sale',
		description: '全场满30减20',
		description_en: '$20 off every $30',
		type: 'discount',
		banner_url: '/static/logo.png',
		status: 'active',
		start_time: '2024-01-01T00:00:00',
		end_time: '2025-12-31T23:59:59',
		rules: { min_spend: 30, discount_amount: 20 },
		products: [
			{ id: 1, name: '招牌茉莉奶白', price: 18.00, original_price: 25.00, image_url: '/static/logo.png', sales_count: 1520 },
			{ id: 2, name: '经典泰式奶茶', price: 16.00, original_price: 22.00, image_url: '/static/logo.png', sales_count: 980 }
		],
		created_at: '2024-01-01T00:00:00'
	},
	{
		id: 2,
		name: '拼单优惠',
		name_en: 'Group Buy',
		description: '邀请好友一起下单享折扣',
		description_en: 'Order with friends for discounts',
		type: 'group',
		banner_url: '/static/logo.png',
		status: 'active',
		start_time: '2024-01-01T00:00:00',
		end_time: '2025-12-31T23:59:59',
		rules: { min_members: 2, discount_rate: 0.85 },
		products: [
			{ id: 7, name: '泰式柠檬茶', price: 12.00, original_price: null, image_url: '/static/logo.png', sales_count: 680 },
			{ id: 8, name: '菠萝炒饭', price: 26.00, original_price: null, image_url: '/static/logo.png', sales_count: 520 }
		],
		created_at: '2024-01-01T00:00:00'
	},
	{
		id: 3,
		name: '新品尝鲜',
		name_en: 'New Tasting',
		description: '新品上市限时9折',
		description_en: '10% off new items',
		type: 'new_product',
		banner_url: '/static/logo.png',
		status: 'active',
		start_time: '2024-03-01T00:00:00',
		end_time: '2025-06-30T23:59:59',
		rules: { discount_rate: 0.9 },
		products: [
			{ id: 4, name: '芒果糯米饭', price: 22.00, original_price: 28.00, image_url: '/static/logo.png', sales_count: 650 }
		],
		created_at: '2024-03-01T00:00:00'
	}
]

/**
 * 模拟获取进行中的活动
 */
export function mockGetActiveCampaigns(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let campaigns = mockCampaigns.filter(c => c.status === 'active')
			if (params.type) {
				campaigns = campaigns.filter(c => c.type === params.type)
			}
			resolve({
				code: 0,
				message: 'success',
				data: campaigns
			})
		}, 300)
	})
}

/**
 * 模拟获取活动详情
 */
export function mockGetCampaign(campaignId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const campaign = mockCampaigns.find(c => c.id === parseInt(campaignId))
			if (campaign) {
				resolve({ code: 0, message: 'success', data: campaign })
			} else {
				reject({ code: 40401, message: '活动不存在' })
			}
		}, 200)
	})
}

/**
 * 模拟领取活动优惠
 */
export function mockClaimCampaign(campaignId, data = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 0,
				message: 'success',
				data: {
					campaign_id: campaignId,
					claimed: true,
					user_coupon_id: Date.now()
				}
			})
		}, 300)
	})
}

/**
 * 重置模拟数据（用于测试）
 */
export function mockResetCampaignData() {
	// 目前campaign没有需要重置的状态
}

export default {
	mockCampaigns,
	mockGetActiveCampaigns,
	mockGetCampaign,
	mockClaimCampaign
}
