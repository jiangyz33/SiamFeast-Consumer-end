/**
 * 金币使用确认制（C 端）
 *
 * 流程：收银端发起金币使用请求 → 用户 APP 收到推送/查 pending
 *   → 确认页展示门店/收银员/金币数/抵扣金额/倒计时
 *   → 用户【确认使用】/【拒绝】→ 收银端轮询到结果后才能提交订单
 *
 * 后端约束：授权单 120 秒有效（Redis TTL），一次性（扣减成功即删），
 * 一个用户同时只有一张待确认单（重复发起覆盖旧的）。
 */

import { get, post } from '@/api/request.js'

/**
 * 查询当前待确认的金币授权单
 * GET /api/v1/user/coin-confirmations/pending （C 端 token）
 * @returns {Promise} { item: null } 或 { item: { auth_id, coins, amount, store_name(三语), cashier_name, expires_in, ... } }
 */
export function getPendingCoinConfirmation() {
	return get('/user/coin-confirmations/pending')
}

/**
 * 确认使用金币
 * POST /api/v1/user/coin-confirmations/{auth_id}/approve
 */
export function approveCoinConfirmation(authId) {
	return post(`/user/coin-confirmations/${authId}/approve`)
}

/**
 * 拒绝使用金币
 * POST /api/v1/user/coin-confirmations/{auth_id}/deny
 */
export function denyCoinConfirmation(authId) {
	return post(`/user/coin-confirmations/${authId}/deny`)
}
