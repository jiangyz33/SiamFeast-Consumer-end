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
					<text class="code-value">{{ memberCode }}</text>
				</view>

				<text class="code-hint">{{ t('memberCode.hint') }}</text>
			</view>
		</scroll-view>
	<canvas canvas-id="qrCanvasMember" style="position:fixed;left:-9999px;width:200px;height:200px;"></canvas>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import { getMemberInfo } from '@/api/services/member.js'
import { getMyReferralInfo } from '@/api/services/referral.js'
import { generateQRImage } from '@/utils/qrcode.js'

export default {
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			memberCode: '',
			userInfo: {},
			qrImageUrl: ''
		}
	},
	onLoad() {
		this.initPage()
	},
	onReady() {
		this.loadData()
	},
	created() {
		uni.$on('languageChanged', this.onLanguageChanged)
	},

	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},

	computed: {
		levelNameText() {
			void this.langVersion
			const level = (this.userInfo.level_name || this.userInfo.membership_tier || '').toUpperCase()
			const m = {
				REGULAR: { zh: '普通会员', en: 'Regular', th: 'สมาชิกทั่วไป' },
				SILVER: { zh: '银卡会员', en: 'Silver', th: 'สมาชิกซิลเวอร์' },
				GOLD: { zh: '金卡会员', en: 'Gold', th: 'สมาชิกโกลด์' },
				PLATINUM: { zh: '铂金会员', en: 'Platinum', th: 'สมาชิกแพลตินัม' },
				DIAMOND: { zh: '钻石会员', en: 'Diamond', th: 'สมาชิกไดมอนด์' }
			}
			const lang = i18n.getLanguage()
			if (level && m[level] && m[level][lang]) return m[level][lang]
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
		},async generateQR() {
				const qrData = this.memberCode
				if (!qrData) return
				try {
					this.qrImageUrl = await generateQRImage(qrData, { size: 200, canvasId: 'qrCanvasMember', componentInstance: this })
				} catch (err) {
					console.error('[member-code] generateQR error:', err)
				}
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
				const [memberRes, referralRes] = await Promise.all([
					getMemberInfo(),
					getMyReferralInfo()
				])

				if (memberRes.code === 0 && memberRes.data) {
					const d = memberRes.data
					this.memberCode = d.invite_code
					this.userInfo = {
						nickname: d.nickname || d.name || '',
						level_name: d.level_name || d.membership_tier || '',
						avatar_url: d.avatar_url || '/static/images/04_default_avatar.png'
					}
				}

				if (!this.memberCode && referralRes.code === 0 && referralRes.data) {
					this.memberCode = referralRes.data.referral_code
				}

				if (this.memberCode) {
					this.$nextTick(() => {
						this.generateQR()
					})
				}
			} catch (e) {
				console.error('[member-code] loadData failed:', e)
			}
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
</style>
