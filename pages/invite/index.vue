<template>
	<view class="invite-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="page-body" :style="{ paddingTop: statusBarHeight + 'px' }">
			<!-- 品牌区 -->
			<view class="brand-section">
				<view class="brand-logo">
					<text class="brand-emoji">🍽️</text>
				</view>
				<text class="brand-name">SiamFeast</text>
			</view>

			<!-- 邀请卡 -->
			<view class="invite-card">
				<text class="invite-title">{{ t('invite.title') }}</text>
				<text class="invite-subtitle">{{ t('invite.subtitle') }}</text>

				<!-- 邀请码展示 -->
				<view class="code-box" v-if="inviteCode">
					<text class="code-label">{{ t('invite.inviterCode') }}</text>
					<text class="code-value">{{ inviteCode }}</text>
				</view>

				<!-- 奖励说明 -->
				<view class="reward-box">
					<view class="reward-item">
						<text class="reward-icon">🎁</text>
						<text class="reward-text">{{ t('invite.rewardDesc') }}</text>
					</view>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-section">
				<view class="register-btn" @click="goRegister">
					<text class="register-btn-text">{{ t('invite.registerNow') }}</text>
				</view>
				<view class="login-link" @click="goLogin">
					<text class="login-link-text">{{ t('invite.hasAccount') }}</text>
					<text class="login-link-action">{{ t('invite.goLogin') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'

export default {
	name: 'InviteLanding',
	data() {
		return {
			statusBarHeight: 0,
			inviteCode: ''
		}
	},
	onLoad(options) {
		const sysInfo = uni.getSystemInfoSync()
		this.statusBarHeight = sysInfo.statusBarHeight || 0

		// 已登录用户点邀请链接：无注册场景，记下邀请码后直接进首页
		if (uni.getStorageSync('siamfeast_token')) {
			uni.reLaunch({ url: '/pages/index/index' })
			return
		}

		// 邀请码来源优先级：路由参数 > 入口捕获的 storage（LINE 链接 ?code= 由 App.vue 存入）
		const fromQuery = options.code || options.invite_code || ''
		const fromStorage = uni.getStorageSync('invite_code') || ''
		const code = fromQuery || fromStorage
		if (code && /^[A-Z0-9]{4,12}$/.test(code)) {
			this.inviteCode = code
			// 统一写回 storage，注册页预填从这里读
			uni.setStorageSync('invite_code', code)
		}
	},
	methods: {
		t(key, params) {
			return i18n.t(key, params)
		},
		goRegister() {
			uni.reLaunch({ url: '/pages/login/register' })
		},
		goLogin() {
			uni.reLaunch({ url: '/pages/login/index' })
		}
	}
}
</script>

<style scoped>
.invite-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 45%);
	display: flex;
	flex-direction: column;
}

.brand-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 80rpx 0 40rpx;
}

.brand-logo {
	width: 140rpx;
	height: 140rpx;
	border-radius: 70rpx;
	background: linear-gradient(135deg, #F2B131 0%, #E09A1B 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(242, 177, 49, 0.35);
}

.brand-emoji {
	font-size: 64rpx;
}

.brand-name {
	margin-top: 24rpx;
	font-size: 40rpx;
	font-weight: 700;
	color: #1A1A1A;
	letter-spacing: 2rpx;
}

.invite-card {
	margin: 20rpx 48rpx 0;
	padding: 56rpx 40rpx;
	background-color: #FFFFFF;
	border-radius: 28rpx;
	box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
	display: flex;
	flex-direction: column;
	align-items: center;
}

.invite-title {
	font-size: 40rpx;
	font-weight: 700;
	color: #1A1A1A;
}

.invite-subtitle {
	margin-top: 16rpx;
	font-size: 28rpx;
	color: #666666;
	text-align: center;
	line-height: 1.5;
}

.code-box {
	margin-top: 40rpx;
	padding: 20rpx 48rpx;
	background-color: #FFF8E1;
	border: 2rpx dashed #F2B131;
	border-radius: 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.code-label {
	font-size: 24rpx;
	color: #C2890F;
}

.code-value {
	margin-top: 8rpx;
	font-size: 44rpx;
	font-weight: 700;
	letter-spacing: 6rpx;
	color: #C2890F;
}

.reward-box {
	margin-top: 36rpx;
	width: 100%;
}

.reward-item {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx;
	background-color: #FAFAFA;
	border-radius: 12rpx;
}

.reward-icon {
	font-size: 30rpx;
	margin-right: 12rpx;
}

.reward-text {
	font-size: 26rpx;
	color: #333333;
}

.action-section {
	margin-top: 72rpx;
	padding: 0 48rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.register-btn {
	width: 100%;
	height: 92rpx;
	background: linear-gradient(135deg, #F2B131 0%, #E09A1B 100%);
	border-radius: 46rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(242, 177, 49, 0.35);
}

.register-btn-text {
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
}

.login-link {
	margin-top: 32rpx;
	display: flex;
	align-items: center;
}

.login-link-text {
	font-size: 26rpx;
	color: #999999;
}

.login-link-action {
	margin-left: 8rpx;
	font-size: 26rpx;
	color: #C2890F;
	font-weight: 600;
}
</style>
