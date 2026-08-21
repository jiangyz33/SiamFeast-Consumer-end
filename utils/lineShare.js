/**
 * LINE 分享邀请（第一期：分享 → LINE → 落 H5）
 *
 * 流程：
 *   用户点「分享到 LINE」→ 拉起 LINE 选好友/群，发送文案 + H5 邀请链接
 *   → 好友在 LINE 点链接 → 打开 H5（invite_url 域名根 query 带 code）
 *   → App.vue 入口捕获 code 存 storage → 邀请落地页/注册页自动预填邀请码
 *
 * 三端行为：
 *   H5       → location.href 跳 line.me/R/share（未装 LINE 自动落下载页）
 *   APP 已装 → line:// msg scheme 秒开 LINE 好友选择器
 *   APP 未装 → 弹窗：复制链接 / 打开 LINE 网页版分享
 *
 * 第二期（APP 唤起/商店跳转/延迟深度链接）不在本文件范围。
 */

import i18n from '@/i18n/index.js'

/**
 * 邀请链接兜底拼接：my-info 未返回 invite_url 时使用
 * 格式与后端 SF_INVITE_BASE_URL 拼出的一致：<H5域名>?code=XXX
 */
export function buildInviteUrl(referralCode) {
	if (!referralCode) return ''
	let base = ''
	// #ifdef H5
	try {
		if (typeof window !== 'undefined' && window.location) {
			base = window.location.origin
		}
	} catch (e) {}
	// #endif
	// APP / 小程序兜底（链接最终在浏览器/LINE 内打开）
	if (!base) base = 'https://h5.siamfeast.com'
	return `${base}?code=${encodeURIComponent(referralCode)}`
}

/**
 * 分享邀请到 LINE（第一期：链接统一落 H5）
 * @param {string} inviteUrl  my-info 返回的 invite_url（或 buildInviteUrl 兜底值）
 */
export function shareInviteToLine(inviteUrl) {
	if (!inviteUrl) {
		uni.showToast({ title: i18n.t('mine.shareFail'), icon: 'none' })
		return
	}

	const full = getShareText() + ' ' + inviteUrl
	const encoded = encodeURIComponent(full)

	// #ifdef H5
	// line.me/R/share：移动端拉起 LINE / PC 打开网页发送框；未装 LINE 落下载页
	window.location.href = 'https://line.me/R/share?text=' + encoded
	// #endif

	// #ifdef APP-PLUS
	const isAndroid = uni.getSystemInfoSync().platform === 'android'
	let installed = false
	try {
		installed = plus.runtime.isApplicationExist(
			isAndroid ? { pname: 'jp.naver.line.android' } : { urlscheme: 'line://' }
		)
	} catch (e) {
		console.warn('[lineShare] isApplicationExist failed:', e)
	}
	if (installed) {
		// 原生秒开 LINE 好友/群选择器
		plus.runtime.openURL('line://msg/text/' + encoded)
	} else {
		uni.showModal({
			title: i18n.t('mine.lineNotInstalled'),
			content: i18n.t('mine.lineCopyAndShare'),
			confirmText: i18n.t('mine.copyLink'),
			cancelText: i18n.t('mine.openWebShare'),
			success: (res) => {
				if (res.confirm) {
					uni.setClipboardData({ data: inviteUrl })
				} else if (res.cancel) {
					plus.runtime.openURL('https://line.me/R/share?text=' + encoded)
				}
			}
		})
	}
	// #endif
}

/**
 * 分享文案（三语，跟随 APP 语言）
 */
function getShareText() {
	return i18n.t('mine.lineShareText')
}
