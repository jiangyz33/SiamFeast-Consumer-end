<template>
	<view class="verify-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="goBack">
				<image class="back-icon-img" src="/static/icons/back.svg" mode="aspectFit"></image>
			</view>
		</view>

		<!-- 标题区域 -->
		<view class="title-section">
			<text class="main-title">请输入验证码</text>
			<text class="sub-title">验证码已发送到您的短信</text>
			<text class="phone-number">{{ formatPhone }}</text>
		</view>

		<!-- 验证码输入区域 -->
		<view class="code-section" @click="focusInput">
			<view class="code-boxes">
				<view
					v-for="(item, index) in codeLength"
					:key="index"
					class="code-box"
					:class="{ 'code-box-active': currentIndex === index }"
				>
					<text class="code-text">{{ code[index] || '' }}</text>
					<view v-if="currentIndex === index && focused" class="cursor"></view>
				</view>
			</view>
			<input
				ref="codeInput"
				class="hidden-input"
				type="number"
				:maxlength="codeLength"
				v-model="code"
				:focus="inputFocus"
				@input="onCodeInput"
				@focus="onFocus"
				@blur="onBlur"
			/>
		</view>

		<!-- 重新发送 -->
		<view class="resend-section">
			<text v-if="countdown > 0" class="resend-text disabled">{{ countdown }}s后重新发送</text>
			<text v-else class="resend-text" @click="resendCode">重新发送</text>
		</view>

		<!-- 调试提示（开发环境显示验证码） -->
		<view class="debug-hint" v-if="debugCode">
			<text class="debug-text">验证码: {{ debugCode }}</text>
		</view>

		<!-- 底部按钮 -->
		<view class="button-section">
			<view
				class="login-btn"
				:class="{ 'btn-disabled': code.length < codeLength || loading }"
				@click="handleVerify"
			>
				<text class="btn-text">{{ loading ? '处理中...' : btnText }}</text>
			</view>
		</view>

		<!-- 安全区域底部 -->
		<view class="safe-area-bottom"></view>
	</view>
</template>

<script>
import { formatPhoneWithDash, showToast } from '@/utils/index.js'
import { sendCode, loginByCode, register } from '@/api/index.js'
import store from '@/store/index.js'

// 模拟验证码存储（用于验证注册时的验证码）
const mockCodes = {}

export default {
	data() {
		return {
			statusBarHeight: 20,
			phone: '',
			code: '',
			codeLength: 6,
			inputFocus: true,
			focused: true,
			countdown: 60,
			timer: null,
			loading: false,
			debugCode: '', // 开发环境显示验证码
			loginType: 'login', // login 或 register
			password: '', // 注册时的密码
			inviteCode: '' // 注册时的邀请码
		}
	},
	computed: {
		formatPhone() {
			return formatPhoneWithDash(this.phone)
		},
		currentIndex() {
			return Math.min(this.code.length, this.codeLength - 1)
		},
		btnText() {
			if (this.loading) return '处理中...'
			return this.loginType === 'register' ? '注册' : '登录'
		}
	},
	onLoad(options) {
		// 获取状态栏高度
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20

		// 获取手机号
		if (options.phone) {
			this.phone = options.phone
		}

		// 获取登录类型
		this.loginType = options.type || 'login' // login 或 register

		// 如果是注册类型， 获取密码和邀请码
		if (this.loginType === 'register') {
			if (options.password) {
				this.password = decodeURIComponent(options.password)
			}
			if (options.inviteCode) {
				this.inviteCode = decodeURIComponent(options.inviteCode)
			}
		}

		// 开始倒计时
		this.startCountdown()

		// 自动发送验证码
		this.sendVerifyCode()
	},
	onUnload() {
		// 清除定时器
		if (this.timer) {
			clearInterval(this.timer)
		}
	},
	methods: {
		// 返回
		goBack() {
			uni.navigateBack()
		},

		// 聚焦输入框
		focusInput() {
			this.inputFocus = true
			this.focused = true
		},

		// 输入事件
		onCodeInput(e) {
			this.code = e.detail.value.replace(/\D/g, '').slice(0, this.codeLength)

			// 自动提交
			if (this.code.length === this.codeLength) {
				setTimeout(() => {
					this.handleVerify()
				}, 300)
			}
		},

		// 获得焦点
		onFocus() {
			this.inputFocus = true
			this.focused = true
		},

		// 失去焦点
		onBlur() {
			this.inputFocus = false
			this.focused = false
		},

		// 开始倒计时
		startCountdown() {
			this.countdown = 60
			this.timer = setInterval(() => {
				this.countdown--
				if (this.countdown <= 0) {
					clearInterval(this.timer)
					this.timer = null
				}
			}, 1000)
		},

		// 发送验证码
		async sendVerifyCode() {
			try {
				const res = await sendCode(this.phone)

				// 开发环境显示验证码
				if (res.data && res.data._debug_code) {
					this.debugCode = res.data._debug_code
				}

				showToast('验证码已发送')
			} catch (e) {
				console.error('发送验证码失败:', e)
				showToast('发送失败，请重试')
			}
		},

		// 重新发送验证码
		async resendCode() {
			if (this.countdown > 0) return

			this.code = ''
			await this.sendVerifyCode()
			this.startCountdown()
		},

		// 验证登录/注册
		async handleVerify() {
			if (this.code.length < this.codeLength) {
				showToast('请输入完整验证码')
				return
			}

			if (this.loading) return

			this.loading = true

			try {
				let res

				if (this.loginType === 'register') {
					// 注册流程：验证码验证 + 注册
					res = await register({
						phone: this.phone,
						sms_code: this.code,
						password: this.password,
						invite_code: this.inviteCode
					})
				} else {
					// 普通验证码登录
					res = await loginByCode(this.phone, this.code)
				}

				if (res.code !== 0) {
					showToast(res.message || (this.loginType === 'register' ? '注册失败' : '登录失败'))
					this.loading = false
					return
				}

				// 保存登录信息
				if (res.data && res.data.access_token) {
					store.setToken(res.data.access_token)
					if (res.data.user) {
						store.setUserInfo(res.data.user)
					}
				}

				showToast(this.loginType === 'register' ? '注册成功' : '登录成功')

				// 跳转到首页
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
					})
				}, 1500)
			} catch (e) {
				console.error(this.loginType === 'register' ? '注册失败:' : '登录失败:', e)
				showToast('网络错误，请稍后重试')
				this.loading = false
			}
		}
	}
}
</script>

<style scoped>
.verify-page {
	min-height: 100vh;
	background-color: #FFFFFF;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
}

.nav-bar {
	height: 88rpx;
	display: flex;
	align-items: center;
	padding: 0 32rpx;
}

.nav-left {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon-img {
	width: 48rpx;
	height: 48rpx;
}

.title-section {
	padding: 32rpx 72rpx;
}

.main-title {
	font-size: 60rpx;
	font-weight: 700;
	color: #282332;
	letter-spacing: -2rpx;
}

.sub-title {
	display: block;
	font-size: 32rpx;
	color: #8F92A1;
	margin-top: 24rpx;
	letter-spacing: -2rpx;
}

.phone-number {
	display: block;
	font-size: 32rpx;
	font-weight: 700;
	color: #282332;
	margin-top: 16rpx;
	letter-spacing: -2rpx;
}

.code-section {
	padding: 64rpx 72rpx;
	position: relative;
}

.code-boxes {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 24rpx;
}

.code-box {
	flex: 1;
	height: 140rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom: 4rpx solid #E0E0E0;
	position: relative;
}

.code-box-active {
	border-bottom-color: #F2B131;
}

.code-text {
	font-size: 100rpx;
	font-weight: 700;
	color: #413C55;
	line-height: 1;
}

.cursor {
	position: absolute;
	bottom: 8rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 4rpx;
	height: 60rpx;
	background-color: #F2B131;
	animation: blink 1s infinite;
}

@keyframes blink {
	0%, 50% {
		opacity: 1;
	}
	51%, 100% {
		opacity: 0;
	}
}

.hidden-input {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	z-index: 10;
}

.resend-section {
	padding: 32rpx 72rpx;
	display: flex;
	justify-content: center;
}

.resend-text {
	font-size: 28rpx;
	color: #019EFF;
}

.resend-text.disabled {
	color: #828282;
}

.debug-hint {
	padding: 24rpx 72rpx;
	display: flex;
	justify-content: center;
	background-color: #FFF7E6;
	margin: 24rpx 48rpx;
	border-radius: 16rpx;
}

.debug-text {
	font-size: 28rpx;
	color: #F2B131;
	font-weight: 600;
}

.button-section {
	padding: 32rpx 48rpx;
	margin-top: auto;
}

.login-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 80rpx;
	background-color: #F2B131;
	border-radius: 16rpx;
}

.btn-disabled {
	opacity: 0.5;
}

.btn-text {
	font-size: 32rpx;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.6);
}

.safe-area-bottom {
	height: constant(safe-area-inset-bottom);
	height: env(safe-area-inset-bottom);
}
</style>
