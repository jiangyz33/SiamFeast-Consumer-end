/**
 * 金币使用确认 — 全局弹窗
 *
 * 收银端发起金币使用请求时，C 端（网页端/APP）直接弹窗：
 *   「收银员请求在【门店】为您使用 N 金币（抵扣 ฿X）…」
 *   【确认使用】→ approve   【拒绝】→ deny
 *
 * 使用场景：App.vue onShow 查到 pending / push.js 在线收到 COIN_CONFIRM 透传。
 * 完整信息展示（倒计时/收银员详情）仍在确认页 pages/coin-confirm（推送点击通知直达）。
 */

import i18n from '@/i18n/index.js'
import {
	approveCoinConfirmation,
	denyCoinConfirmation
} from '@/api/services/coinConfirmation.js'

let showing = false
// 同一授权单的弹窗冷却：approve/deny 请求失败（如网络抖动）后 pending 仍在，
// 5 秒轮询会再次弹出 —— 冷却期内不重弹，避免网络持续差时陷入"每5秒弹一次"的循环
const REPOP_COOLDOWN_MS = 45000
let lastAuthId = ''
let lastShownAt = 0

/**
 * 弹出金币使用确认弹窗
 * @param {Object} item pending 接口返回的授权单（auth_id/coins/amount/store_name 三语/cashier_name）
 */
export function showCoinConfirmModal(item) {
	if (!item || !item.auth_id || showing) return
	// 同一张授权单冷却期内不重复弹（收银端重新发起会生成新 auth_id，不受影响）
	if (item.auth_id === lastAuthId && Date.now() - lastShownAt < REPOP_COOLDOWN_MS) return
	showing = true
	lastAuthId = item.auth_id
	lastShownAt = Date.now()

	const lang = i18n.getLanguage()
	const storeName = item['store_name_' + lang] || item.store_name || ''
	const coins = Number(item.coins) || 0
	const amount = Number(item.amount) || 0
	const amountText = amount % 1 === 0 ? String(amount) : amount.toFixed(2)

	uni.showModal({
		title: i18n.t('coinConfirm.modalTitle'),
		content: i18n.t('coinConfirm.modalContent', { store: storeName, coins, amount: amountText }),
		confirmText: i18n.t('coinConfirm.approve'),
		cancelText: i18n.t('coinConfirm.deny'),
		confirmColor: '#E09A1B',
		success: async (res) => {
			try {
				if (res.confirm) {
					await approveCoinConfirmation(item.auth_id)
					uni.showToast({ title: i18n.t('coinConfirm.approvedText'), icon: 'success' })
				} else if (res.cancel) {
					await denyCoinConfirmation(item.auth_id)
					uni.showToast({ title: i18n.t('coinConfirm.deniedText'), icon: 'none' })
				}
			} catch (e) {
				// 409：已处理过或已过期（授权单 120 秒时效）
				const code = e && (e.code || e.bizCode)
				if (code === 'COIN_CONFIRM_STATUS' || code === 409) {
					uni.showToast({ title: i18n.t('coinConfirm.statusConflict'), icon: 'none' })
				} else {
					uni.showToast({ title: (e && e.message) || i18n.t('coinConfirm.operateFailed'), icon: 'none' })
				}
			} finally {
				showing = false
			}
		},
		fail: () => {
			showing = false
		}
	})
}
