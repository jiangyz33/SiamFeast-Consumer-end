/**
 * 活动工具函数 + API 封装
 *
 * 后端接口(方案 A):
 *  - GET /banners(已增强,返回内嵌 campaign)
 *  - GET /campaigns/:id/claimable-coupons(可领优惠券列表)
 *  - POST /coupons/claim(抢券)
 *
 * ⚠️ 路径注意:后端 consumer 路由无 /user 前缀,直接 /api/v1/campaigns/* /coupons/*
 */

import { get, post } from '@/api/request.js'
import i18n from '@/i18n/index.js'

/**
 * 获取当前语言('zh' / 'en' / 'th')
 */
function getCurrentLang() {
	try {
		return (i18n && i18n.getLanguage && i18n.getLanguage()) || 'zh'
	} catch (e) {
		return 'zh'
	}
}

// ============ 接口封装 ============

/**
 * 获取活动可领优惠券列表
 * @param {number} campaignId 活动 ID
 * @returns {Promise<{campaign_id, coupons: Array}>}
 */
export function getCampaignClaimableCoupons(campaignId) {
	if (!campaignId) return Promise.reject({ code: 'INVALID_PARAMS', message: 'campaignId required' })
	return get(`/campaigns/${campaignId}/claimable-coupons`).then(res => {
		if (res.code === 0) return res.data
		return Promise.reject(res)
	})
}

/**
 * 抢券
 * @param {number} templateId 优惠券模板 ID
 * @returns {Promise<{user_coupon_id, template_id, coupon_name}>}
 *
 * 错误码:
 *  - COUPON_SOLD_OUT        已抢光
 *  - DAILY_QUOTA_EXCEEDED   当日发放总量用尽
 *  - CLAIM_LIMIT_REACHED    用户超过 per_user_limit
 *  - DAILY_LIMIT_REACHED    用户超过 daily_limit
 *  - COUPON_INACTIVE        活动未开始/已结束
 */
export function claimCoupon(templateId) {
	if (!templateId) return Promise.reject({ code: 'INVALID_PARAMS', message: 'templateId required' })
	return post('/coupons/claim', { coupon_id: templateId }).then(res => {
		if (res.code === 0) return res.data
		return Promise.reject(res)
	})
}

// ============ 工具函数 ============

/**
 * 获取当前语言的文案
 * @param {Object} obj 包含 name/name_en/name_th 或 description/description_en/description_th 的对象
 * @param {string} zhKey 中文字段名(默认 'name')
 */
export function getLocalizedText(obj, zhKey = 'name') {
	if (!obj) return ''
	const lang = getCurrentLang()
	const enKey = `${zhKey}_en`
	const thKey = `${zhKey}_th`
	if (lang === 'en' && obj[enKey]) return obj[enKey]
	if (lang === 'th' && obj[thKey]) return obj[thKey]
	return obj[zhKey] || obj[enKey] || obj[thKey] || ''
}

/**
 * 活动类型 → 图标 emoji
 */
export function getCampaignTypeIcon(type) {
	const m = {
		DISCOUNT: '🏷️',
		FULL_REDUCTION: '🎁',
		COUPON_GRANT: '🎫',
		SPECIAL_DATE: '🎊'
	}
	return m[type] || '🎉'
}

/**
 * 活动类型 → 本地化名称
 */
export function getCampaignTypeName(type) {
	const lang = getCurrentLang()
	const m = {
		DISCOUNT: { zh: '折扣活动', en: 'Discount', th: 'โปรโมชัน' },
		FULL_REDUCTION: { zh: '满减活动', en: 'Spend & Save', th: 'ซื้อครบลด' },
		COUPON_GRANT: { zh: '领券活动', en: 'Claim Coupons', th: 'รับคูปอง' },
		SPECIAL_DATE: { zh: '双号日活动', en: 'Double Day', th: 'วันตัวเลขซ้ำ' }
	}
	return (m[type] && m[type][lang]) || type
}

/**
 * 格式化日期范围
 */
export function formatDateRange(startDate, endDate) {
	if (!startDate) return ''
	const fmt = (d) => {
		try {
			const date = new Date(d)
			if (isNaN(date.getTime())) return ''
			const y = date.getFullYear()
			const m = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			return `${y}-${m}-${day}`
		} catch (e) { return '' }
	}
	const start = fmt(startDate)
	const end = fmt(endDate)
	if (start && end) return `${start} ~ ${end}`
	return start
}

/**
 * 抢券错误码 → 用户友好提示
 */
export function resolveClaimErrorMessage(err) {
	if (!err) return '抢券失败'
	const code = err.code || err.bizCode || ''
	const m = {
		COUPON_SOLD_OUT: '已抢光',
		DAILY_QUOTA_EXCEEDED: '今日已领完,明天再来',
		CLAIM_LIMIT_REACHED: '您已领过此券',
		DAILY_LIMIT_REACHED: '今日领取已达上限',
		COUPON_INACTIVE: '活动未开始或已结束',
		UNAUTHENTICATED: '请先登录'
	}
	return m[code] || err.message || '抢券失败'
}

// ============ Mock 数据(开发期用,后端就绪后可删)============

/**
 * Mock:可领优惠券列表
 * 开发期前端独立测试用,后端接口就绪后删除
 */
export function mockClaimableCoupons(campaignId) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				campaign_id: campaignId,
				coupons: [
					{
						id: 15,
						template_id: 15,
						name: '满 200 减 30',
						name_en: '$30 off $200+',
						name_th: 'ลด 30 เมื่อซื้อครบ 200',
						coupon_type: 'FULL_REDUCTION',
						discount_value: 30,
						min_amount: 200,
						total_quantity: 200,
						claimed_count: 113,
						remaining: 87,
						user_claimed: false,
						user_can_claim: true
					},
					{
						id: 16,
						template_id: 16,
						name: '满 500 减 100',
						name_en: '$100 off $500+',
						name_th: 'ลด 100 เมื่อซื้อครบ 500',
						coupon_type: 'FULL_REDUCTION',
						discount_value: 100,
						min_amount: 500,
						total_quantity: 100,
						claimed_count: 100,
						remaining: 0,
						user_claimed: false,
						user_can_claim: false
					},
					{
						id: 17,
						template_id: 17,
						name: '海鲜火锅 5 折券',
						name_en: '50% off Seafood Hotpot',
						name_th: 'ลด 50% หม้อไฟอาหารทะเล',
						coupon_type: 'PERCENTAGE',
						discount_value: 0.5,
						min_amount: 0,
						total_quantity: 50,
						claimed_count: 20,
						remaining: 30,
						user_claimed: true,
						user_can_claim: false
					}
				]
			})
		}, 300) // 模拟网络延迟
	})
}

/**
 * Mock:抢券
 */
export function mockClaimCoupon(templateId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (templateId === 16) {
				reject({ code: 'COUPON_SOLD_OUT', message: '已抢光' })
			} else {
				resolve({
					user_coupon_id: Math.floor(Math.random() * 10000) + 1,
					template_id: templateId,
					coupon_name: 'Mock 券'
				})
			}
		}, 500)
	})
}

/**
 * Mock:活动详情(用于首页 banner 测试)
 */
export function getMockCampaigns() {
	return [
		{
			id: 22,
			name: '海鲜火锅 8 折',
			name_en: 'Seafood Hotpot 20% Off',
			name_th: 'หม้อไฟอาหารทะเล ลด 20%',
			type: 'DISCOUNT',
			image_url: 'https://minio.siamfeast.com/sf-uploads/banner_image/2026/07/65ed2454-9d74-4b20-9a24-afa1716fbf8b.png',
			rules: {
				discount_type: 'PERCENTAGE',
				discount_value: 0.8,
				stackable: false,
				description: '全场海鲜火锅享 8 折优惠',
				description_en: '20% off all seafood hotpot',
				description_th: 'ลด 20% หม้อไฟอาหารทะเลทุกรายการ'
			},
			start_date: '2026-07-22T00:00:00Z',
			end_date: '2026-08-22T23:59:59Z',
			status: 'ACTIVE'
		},
		{
			id: 23,
			name: '满 200 减 20',
			name_en: '$20 off $200+',
			name_th: 'ลด 20 เมื่อซื้อครบ 200',
			type: 'FULL_REDUCTION',
			image_url: 'https://minio.siamfeast.com/sf-uploads/banner_image/2026/07/65ed2454-9d74-4b20-9a24-afa1716fbf8b.png',
			rules: {
				threshold_amount: 200,
				discount_amount: 20,
				stackable: false,
				description: '消费满 200 元立减 20',
				description_en: '$20 off when you spend $200+',
				description_th: 'ลด 20 เมื่อซื้อครบ 200'
			},
			start_date: '2026-07-22T00:00:00Z',
			end_date: '2026-08-22T23:59:59Z',
			status: 'ACTIVE'
		},
		{
			id: 25,
			name: '国庆抢券节',
			name_en: 'National Day Coupon Festival',
			name_th: 'เทศกาลรับคูปองวันชาติ',
			type: 'COUPON_GRANT',
			image_url: 'https://minio.siamfeast.com/sf-uploads/banner_image/2026/07/65ed2454-9d74-4b20-9a24-afa1716fbf8b.png',
			rules: {
				coupon_template_ids: [15, 16, 17],
				description: '活动期间可领取多张优惠券',
				description_en: 'Claim multiple coupons during the event',
				description_th: 'รับคูปองหลายใบระหว่างกิจกรรม'
			},
			start_date: '2026-07-22T00:00:00Z',
			end_date: '2026-08-22T23:59:59Z',
			status: 'ACTIVE'
		}
	]
}
