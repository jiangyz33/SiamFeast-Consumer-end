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

		<!-- 注册模式：先填写信息 -->
		<view v-if="isRegister && !codeSent" class="register-form">
			<view class="title-section">
				<text class="main-title">{{ i18n.t('login.goRegister') }}</text>
				<text class="sub-title">{{ i18n.t('login.registerDesc') }}</text>
			</view>

			<view class="form-section">
				<!-- 手机号 -->
				<view class="input-field" :style="{ borderColor: phoneFocused ? '#F2B131' : '#E0E0E0' }">
					<text class="phone-prefix">+66</text>
					<input
						class="input"
						type="text"
						:placeholder="i18n.t('login.phonePlaceholder')"
						placeholder-style="color: #828282;"
						v-model="phone"
						@focus="phoneFocused = true"
						@blur="phoneFocused = false"
					/>
				</view>

				<!-- 密码 -->
				<view class="input-field" :style="{ borderColor: pwdFocused ? '#F2B131' : '#E0E0E0' }">
					<input
						class="input"
						:password="!showPwd"
						:placeholder="i18n.t('login.passwordPlaceholder')"
						placeholder-style="color: #828282;"
						v-model="password"
						@focus="pwdFocused = true"
						@blur="pwdFocused = false"
					/>
					<view class="pwd-toggle" @click="showPwd = !showPwd">
						<text class="pwd-toggle-text">{{ showPwd ? 'Hide' : 'Show' }}</text>
					</view>
				</view>

				<!-- 确认密码 -->
				<view class="input-field" :style="{ borderColor: pwd2Focused ? '#F2B131' : '#E0E0E0' }">
					<input
						class="input"
						:password="!showPwd2"
						:placeholder="i18n.t('login.confirmPasswordPlaceholder')"
						placeholder-style="color: #828282;"
						v-model="confirmPassword"
						@focus="pwd2Focused = true"
						@blur="pwd2Focused = false"
					/>
				</view>

				<!-- 邀请码（可选） -->
				<view class="input-field invite-field" :style="{ borderColor: inviteFocused ? '#F2B131' : '#E0E0E0' }">
					<input
						class="input"
						:placeholder="i18n.t('login.inviteCodePlaceholder')"
						placeholder-style="color: #828282;"
						v-model="inviteCode"
						@focus="inviteFocused = true"
						@blur="inviteFocused = false"
					/>
				</view>
			</view>

			<!-- 下一步按钮 -->
			<view class="button-section">
				<view
					class="login-btn"
					:class="{ 'btn-disabled': !canGoNext || sendingCode }"
					@click="handleSendCode"
				>
					<text class="btn-text">{{ sendingCode ? i18n.t('common.loading') : i18n.t('login.getCode') }}</text>
				</view>
			</view>

			<!-- 协议 -->
			<view class="agreement">
				<view class="agreement-check" @click="agreed = !agreed">
					<view class="checkbox" :class="{ 'checkbox-active': agreed }">
						<text v-if="agreed" class="check-icon">✓</text>
					</view>
				</view>
				<text class="agreement-text">{{ i18n.t('login.agreementPrefix') }}</text>
				<text class="agreement-link" @click="openAgreement('terms')">{{ i18n.t('login.terms') }}</text>
				<text class="agreement-text">{{ i18n.t('login.and') }}</text>
				<text class="agreement-link" @click="openAgreement('privacy')">{{ i18n.t('login.privacy') }}</text>
			</view>
		</view>

		<!-- 验证码输入（登录模式 或 注册已发送验证码） -->
		<view v-else class="code-area">
			<view class="title-section">
				<text class="main-title">{{ i18n.t('login.enterCode') }}</text>
				<text class="sub-title">{{ i18n.t('login.codeSent') }}</text>
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
				<text v-if="countdown > 0" class="resend-text disabled">{{ countdown }}s {{ i18n.t('login.resendHint') }}</text>
				<text v-else class="resend-text" @click="resendCode">{{ i18n.t('login.resend') }}</text>
			</view>

			<!-- 调试提示（开发环境显示验证码） -->
			<view class="debug-hint" v-if="debugCode">
				<text class="debug-text">Code: {{ debugCode }}</text>
			</view>

			<!-- 底部按钮 -->
			<view class="button-section">
				<view
					class="login-btn"
					:class="{ 'btn-disabled': code.length < codeLength || loading }"
					@click="handleVerify"
				>
					<text class="btn-text">{{ loading ? i18n.t('common.loading') : btnText }}</text>
				</view>
			</view>
		</view>

		<!-- 安全区域底部 -->
		<view class="safe-area-bottom"></view>
	</view>
</template>

<script>
import { formatPhoneWithDash, validatePhone, showToast } from '@/utils/index.js'
import { sendCode, loginByCode, register } from '@/api/index.js'
import i18n from '@/i18n/index.js'
import store from '@/store/index.js'

export default {
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			phone: '',
			code: '',
			codeLength: 6,
			inputFocus: true,
			focused: true,
			countdown: 0,
			timer: null,
			loading: false,
			sendingCode: false,
			debugCode: '',
			loginType: 'login',
			password: '',
			confirmPassword: '',
			inviteCode: '',
			codeSent: false,
			agreed: true,
			showPwd: false,
			showPwd2: false,
			phoneFocused: false,
			pwdFocused: false,
			pwd2Focused: false,
			inviteFocused: false
		}
	},
	computed: {
		isRegister() {
			return this.loginType === 'register'
		},
		formatPhone() {
			return formatPhoneWithDash(this.phone)
		},
		currentIndex() {
			return Math.min(this.code.length, this.codeLength - 1)
		},
		btnText() {
			return this.isRegister ? i18n.t('login.goRegister') : i18n.t('login.login')
		},
		canGoNext() {
			return validatePhone(this.phone)
				&& this.password.length >= 6
				&& this.password === this.confirmPassword
				&& this.agreed
		}
	},
	onLoad(options) {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20

		if (options.phone) {
			this.phone = options.phone
		}
		this.loginType = options.type || 'login'

		if (this.isRegister && options.password) {
			this.password = decodeURIComponent(options.password)
		}
		if (this.isRegister && options.inviteCode) {
			this.inviteCode = decodeURIComponent(options.inviteCode)
		}

		// Login mode or register with phone pre-filled: go straight to code input
		if (!this.isRegister || this.phone) {
			this.codeSent = true
			this.startCountdown()
			this.sendVerifyCode()
		}
	},
	onUnload() {
		if (this.timer) {
			clearInterval(this.timer)
		}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},

		openAgreement(type) {
			uni.navigateTo({
				url: `/pages/agreement/index?type=${type}`
			})
		},

		// ===== Register step 1: send code =====

		async handleSendCode() {
			if (!this.canGoNext || this.sendingCode) return

			if (!validatePhone(this.phone)) {
				showToast(i18n.t('login.phoneInvalid'))
				return
			}
			if (this.password.length < 6) {
				showToast(i18n.t('settings.passwordTooShort'))
				return
			}
			if (this.password !== this.confirmPassword) {
				showToast(i18n.t('settings.passwordMismatch'))
				return
			}
			if (!this.agreed) {
				showToast(i18n.t('login.agreementRequired'))
				return
			}

			this.sendingCode = true
			try {
				await this.sendVerifyCode()
				this.codeSent = true
				this.startCountdown()
			} finally {
				this.sendingCode = false
			}
		},

		// ===== Code input =====

		focusInput() {
			this.inputFocus = true
			this.focused = true
		},

		onCodeInput(e) {
			this.code = e.detail.value.replace(/\D/g, '').slice(0, this.codeLength)
			if (this.code.length === this.codeLength) {
				setTimeout(() => {
					this.handleVerify()
				}, 300)
			}
		},

		onFocus() {
			this.inputFocus = true
			this.focused = true
		},

		onBlur() {
			this.inputFocus = false
			this.focused = false
		},

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

		async sendVerifyCode() {
			try {
				const purpose = this.isRegister ? 'register' : 'login'
				const res = await sendCode(this.phone, purpose)
				if (res.data && res.data._debug_code) {
					this.debugCode = res.data._debug_code
				}
				showToast(i18n.t('login.codeSentToast'))
			} catch (e) {
				console.error('sendCode error:', e)
				showToast(i18n.t('login.codeSendFailed'))
			}
		},

		async resendCode() {
			if (this.countdown > 0) return
			this.code = ''
			await this.sendVerifyCode()
			this.startCountdown()
		},

		// ===== Verify =====

		async handleVerify() {
			if (this.code.length < this.codeLength) return
			if (this.loading) return
			this.loading = true

			try {
				let res

				// Both register and login use sms-login (auto-registers new users)
				res = await loginByCode(this.phone, this.code)

				if (res.code !== 0) {
					showToast(res.message || (this.isRegister ? i18n.t('login.registerFailed') : i18n.t('login.loginFailed')))
					this.loading = false
					return
				}

				if (res.data && res.data.access_token) {
					store.setToken(res.data.access_token)
					if (res.data.user) {
						store.setUserInfo(res.data.user)
					}
				}

				showToast(this.isRegister ? i18n.t('login.registerSuccess') : i18n.t('login.loginSuccess'))

				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
					})
				}, 1500)
			} catch (e) {
				console.error('handleVerify error:', e)
				showToast(i18n.t('common.networkError'))
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

/* Title */
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

/* Register form */
.form-section {
	padding: 32rpx 48rpx 0;
}

.input-field {
	display: flex;
	align-items: center;
	height: 88rpx;
	background-color: #FFFFFF;
	border-radius: 16rpx;
	border: 2rpx solid #E0E0E0;
	padding: 0 32rpx;
	margin-bottom: 24rpx;
	transition: border-color 0.3s;
}

.input {
	flex: 1;
	font-size: 28rpx;
	color: #282332;
}

.phone-prefix {
	font-size: 28rpx;
	color: #282332;
	font-weight: 500;
	margin-right: 16rpx;
}

.pwd-toggle {
	padding: 16rpx;
}

.pwd-toggle-text {
	font-size: 24rpx;
	color: #828282;
}

.invite-field {
	border-style: dashed;
}

/* Agreement */
.agreement {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	padding: 24rpx 48rpx;
}

.agreement-check {
	margin-right: 12rpx;
}

.checkbox {
	width: 36rpx;
	height: 36rpx;
	border-radius: 8rpx;
	border: 2rpx solid #E0E0E0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.checkbox-active {
	background-color: #F2B131;
	border-color: #F2B131;
}

.check-icon {
	font-size: 24rpx;
	color: #FFFFFF;
	font-weight: 700;
}

.agreement-text {
	font-size: 24rpx;
	color: #828282;
}

.agreement-link {
	font-size: 24rpx;
	color: #019EFF;
}

/* Code input */
.code-area {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.code-section {
	padding: 64rpx 72rpx;
	position: relative;
}

.code-boxes {
	display: flex;
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
	0%, 50% { opacity: 1; }
	51%, 100% { opacity: 0; }
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

/* Button */
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
