/**
 * 活动/促销相关 API
 */
import { USE_MOCK } from '../config.js'
import { get, post } from '../request.js'
import { mockGetActiveCampaigns, mockGetCampaign, mockClaimCampaign } from '../mock/campaign.js'

/**
 * 获取进行中的活动列表
 * @param {Object} params
 * @param {string} [params.type] 活动类型 (discount/group/new_product)
 * @returns {Promise}
 */
export function getActiveCampaigns(params = {}) {
	if (USE_MOCK) {
		return mockGetActiveCampaigns(params)
	}
	return get('/campaigns', { status: 'ACTIVE', ...params })
}

/**
 * 获取活动详情
 * @param {number} campaignId 活动ID
 * @returns {Promise}
 */
export function getCampaign(campaignId) {
	if (USE_MOCK) {
		return mockGetCampaign(campaignId)
	}
	return get(`/campaigns/${campaignId}`)
}

/**
 * 领取活动优惠（单个）
 * @param {number} campaignId 活动ID
 * @param {Object} data 领取数据
 * @param {number} [data.coupon_id] 优惠券ID（新人礼包中指定某张券）
 * @returns {Promise}
 */
export function claimCampaign(campaignId, data = {}) {
	if (USE_MOCK) {
		return mockClaimCampaign(campaignId, data)
	}
	// 后端使用优惠券模板认领接口
	const templateId = data.coupon_id || campaignId
	return post(`/campaigns/coupons/${templateId}/claim`, data)
}

export const campaignApi = {
	getActiveCampaigns,
	getCampaign,
	claimCampaign
}

export default campaignApi
