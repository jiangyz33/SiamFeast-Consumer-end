<template>
	<view class="member-code-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('memberCode.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<view class="code-card">
				<view class="card-header">
					<view class="user-row">
						<image class="user-avatar" :src="userInfo.avatar_url || '/static/images/04_default_avatar.png'" mode="aspectFill"></image>
						<view class="user-info">
							<text class="user-name">{{ userInfo.nickname || '' }}</text>
							<text class="user-level">{{ levelNameText }}</text>
						</view>
					</view>
				</view>

				<view class="qr-section" v-if="qrImageUrl">
					<image class="qr-image" :src="qrImageUrl" mode="aspectFit"></image>
				</view>
				<view class="qr-section qr-placeholder" v-else>
					<text class="placeholder-text">...</text>
				</view>

				<view class="code-text-section">
					<text class="code-label">{{ t('memberCode.memberCode') }}</text>
					<text class="code-value">{{ memberToken || '---' }}</text>
				</view>

				<!-- 60 秒倒计时 -->
				<view class="countdown-row" v-if="countdown > 0">
					<text class="countdown-text">⏱ {{ countdown }}{{ t('memberCode.secondsUnit') }}</text>
				</view>

				<!-- 手动刷新按钮 -->
				<view class="refresh-btn" @click="refreshToken">
					<text class="refresh-text">{{ refreshing ? t('common.loading') : t('memberCode.refresh') }}</text>
				</view>

				<text class="code-hint">{{ t('memberCode.hint') }}</text>
				<text class="code-hint-warning">⚠️ {{ t('memberCode.dynamicHint') }}</text>
			</view>
		</scroll-view>
	<canvas canvas-id="qrCanvasMember" style="position:fixed;left:-9999px;width:200px;height:200px;"></canvas>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import { getMemberInfo, getMembershipTiers, getQRToken } from '@/api/services/member.js'
import { generateQRImage } from '@/utils/qrcode.js'
import { showToast } from '@/utils/index.js'

export default {
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			userInfo: {},
			membershipTiers: [],
			// 动态会员码（替代老的静态 invite_code 二维码）
			memberToken: '',       // 10 位字母数字，60 秒一次性
			qrImageUrl: '',
			countdown: 0,          // 剩余秒数
			countdownTimer: null,  // 倒计时定时器
			refreshing: false
		}
	},
	onLoad() {
		this.initPage()
	},
	onReady() {
		this.loadData()
	},
	onShow() {
		// 页面恢复前台时，如果 token 已过期或不存在，主动刷新
		if (!this.memberToken || this.countdown <= 0) {
			this.refreshToken()
		}
	},
	onHide() {
		// 页面隐藏时停止倒计时（避免后台浪费）
		this.clearCountdown()
	},
	onUnload() {
		this.clearCountdown()
	},
	created() {
		uni.$on('languageChanged', this.onLanguageChanged)
	},

	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
		this.clearCountdown()
	},

	computed: {
		levelNameText() {
			void this.langVersion
			const tierCode = (this.userInfo.level_name || this.userInfo.membership_tier || '').toUpperCase()
			if (tierCode && this.membershipTiers.length > 0) {
				const tier = this.membershipTiers.find(t => (t.code || '').toUpperCase() === tierCode)
				if (tier) {
					const lang = i18n.getLanguage()
					return tier['name_' + lang] || tier.name || ''
				}
			}
			const m = {
				REGULAR: { zh: '普通会员', en: 'Regular', th: 'สมาชิกทั่วไป' },
				GOLD: { zh: '金卡会员', en: 'Gold', th: 'สมาชิกโกลด์' },
				VIP: { zh: 'VIP 会员', en: 'VIP', th: 'สมาชิก VIP' },
				PLATINUM: { zh: 'VIP 会员', en: 'VIP', th: 'สมาชิก VIP' },
				SILVER: { zh: '普通会员', en: 'Regular', th: 'สมาชิกทั่วไป' },
				DIAMOND: { zh: 'VIP 会员', en: 'VIP', th: 'สมาชิก VIP' }
			}
			const lang = i18n.getLanguage()
			if (tierCode && m[tierCode] && m[tierCode][lang]) return m[tierCode][lang]
			return this.userInfo.level_name || ''
		}
	},

	methods: {
		onLanguageChanged() {
			this.langVersion++
		},
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadData() {
			try {
				const [memberRes, tiersRes] = await Promise.all([
					getMemberInfo(),
					getMembershipTiers()
				])

				if (tiersRes && tiersRes.code === 0 && tiersRes.data) {
					this.membershipTiers = (tiersRes.data.tiers || []).filter(t => t.is_active !== false)
				}

				if (memberRes.code === 0 && memberRes.data) {
					const d = memberRes.data
					this.userInfo = {
						nickname: d.nickname || d.name || '',
						level_name: d.level_name || d.membership_tier || '',
						avatar_url: d.avatar_url || '/static/images/04_default_avatar.png'
					}
				}

				// 加载完会员信息后，获取动态 token 生成二维码
				this.refreshToken()
			} catch (e) {
				console.error('[member-code] loadData failed:', e)
			}
		},

		/**
		 * 获取动态会员码 token（10 位字母数字，60 秒一次性）
		 * 每次调会让旧 token 失效；被收银员扫描后也立即失效
		 */
		async refreshToken() {
			if (this.refreshing) return
			this.refreshing = true
			this.clearCountdown()
			try {
				const res = await getQRToken()
				const data = (res && res.data) || res || {}
				const token = data.token
				const expiresIn = Number(data.expires_in) || 60
				if (!token) {
					console.error('[member-code] no token in response')
					return
				}
				this.memberToken = token
				// 重新生成二维码
				this.qrImageUrl = await generateQRImage(token, {
					size: 200,
					canvasId: 'qrCanvasMember',
					componentInstance: this
				})
				// 启动倒计时
				this.startCountdown(expiresIn)
			} catch (e) {
				console.error('[member-code] refreshToken failed:', e)
				showToast(i18n.t('memberCode.refreshFailed') || '刷新失败，请重试')
			} finally {
				this.refreshing = false
			}
		},

		/**
		 * 启动倒计时：到期后自动刷新
		 */
		startCountdown(seconds) {
			this.countdown = seconds
			this.countdownTimer = setInterval(() => {
				this.countdown--
				if (this.countdown <= 0) {
					this.clearCountdown()
					// 自动刷新
					this.refreshToken()
				}
			}, 1000)
		},

		clearCountdown() {
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer)
				this.countdownTimer = null
			}
			this.countdown = 0
		},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.member-code-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}
.status-bar { width: 100%; background: linear-gradient(135deg, #936c2a 0%, #6b3a10 100%); }
.nav-bar {
	height: 44px;
	background: linear-gradient(135deg, #936c2a 0%, #6b3a10 100%);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
}
.nav-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.back-icon { width: 24px; height: 24px; }
.nav-title { font-size: 16px; font-weight: 700; color: #FFFFFF; }
.nav-right { width: 32px; }
.content-scroll { flex: 1; background-color: #F3F3F3; }

.code-card {
	margin: 24px 16px;
	padding: 24px;
	background: linear-gradient(135deg, #FFF8E7 0%, #F5E6C8 50%, #E8D5AA 100%);
	border-radius: 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.card-header {
	width: 100%;
	margin-bottom: 20px;
}
.user-row {
	display: flex;
	align-items: center;
	gap: 12px;
}
.user-avatar {
	width: 44px;
	height: 44px;
	border-radius: 22px;
}
.user-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
}
.user-name {
	font-size: 16px;
	font-weight: 700;
	color: #6b3a10;
}
.user-level {
	font-size: 12px;
	color: #936c2a;
}

.qr-section {
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 12px;
	margin-bottom: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.qr-image {
	width: 200px;
	height: 200px;
}
.qr-placeholder {
	width: 224px;
	height: 224px;
}
.placeholder-text {
	color: #ccc;
	font-size: 14px;
}

.code-text-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 12px;
}
.code-label {
	font-size: 12px;
	color: #936c2a;
	margin-bottom: 4px;
}
.code-value {
	font-size: 22px;
	font-weight: 700;
	color: #6b3a10;
	letter-spacing: 3px;
}

.code-hint {
	font-size: 12px;
	color: #936c2a99;
	text-align: center;
}

/* 60 秒倒计时 */
.countdown-row {
	margin: 8px 0 12px;
}
.countdown-text {
	font-size: 13px;
	color: #B5750C;
	font-weight: 600;
}

/* 手动刷新按钮 */
.refresh-btn {
	padding: 8px 24px;
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	border-radius: 18px;
	margin-bottom: 12px;
	box-shadow: 0 2px 6px rgba(242, 177, 49, 0.25);
}
.refresh-text {
	font-size: 13px;
	color: #FFFFFF;
	font-weight: 600;
}

.code-hint-warning {
	font-size: 11px;
	color: #B5750C;
	text-align: center;
	margin-top: 4px;
	line-height: 1.4;
}
</style>
