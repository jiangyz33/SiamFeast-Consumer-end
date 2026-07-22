<template>
	<view class="password-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('login.passwordLogin') }}</text>
			<view class="nav-right"></view>
		</view>

		<view class="form-container">
			<view class="title-section">
				<text class="main-title">{{ t('login.passwordLogin') }}</text>
				<text class="sub-title">{{ t('login.passwordLoginDesc') }}</text>
			</view>

			<view class="form-section">
				<!-- 手机号 -->
				<view class="input-field" :style="{ borderColor: phoneError ? '#DA3300' : (phoneFocused ? '#F2B131' : '#E0E0E0') }">
					<view class="country-picker">
						<text class="country-flag">{{ selectedCountry.flag }}</text>
						<text class="country-code">{{ selectedCountry.code }}</text>
						<text class="picker-arrow">&#9662;</text>
					</view>
					<view class="phone-divider"></view>
					<input
						class="input"
						type="number"
						:maxlength="phoneMaxLength"
						:placeholder="t('login.phonePlaceholder')"
						placeholder-style="color: #828282;"
						v-model="phone"
						@focus="phoneFocused = true; phoneError = ''"
						@input="onPhoneInput"
					/>
				</view>
				<text v-if="phoneError" class="field-error">{{ phoneError }}</text>

				<!-- 密码 -->
				<view class="input-field" :style="{ borderColor: pwdFocused ? '#F2B131' : '#E0E0E0' }">
					<input
						class="input"
						:password="!showPwd"
						:placeholder="t('login.passwordPlaceholder')"
						placeholder-style="color: #828282;"
						v-model="password"
						@focus="pwdFocused = true"
						@blur="pwdFocused = false"
						@confirm="handleLogin"
					/>
					<view class="pwd-toggle" @click="showPwd = !showPwd">
						<text class="pwd-toggle-text">{{ showPwd ? t('login.hide') : t('login.show') }}</text>
					</view>
				</view>

				<!-- 忘记密码 -->
				<view class="forgot-link" @click="goForgotPassword">
					<text class="forgot-text">{{ t('login.forgotPassword') }}</text>
				</view>

				<!-- 登录按钮 -->
				<view
					class="login-btn"
					:class="{ 'btn-disabled': !canSubmit || logging }"
					@click="handleLogin"
				>
					<text class="btn-text">{{ logging ? t('common.loading') : t('common.confirm') }}</text>
				</view>
			</view>

			<!-- 切换到短信登录 -->
			<view class="switch-section">
				<text class="switch-prefix">{{ t('login.noPassword') }}</text>
				<text class="switch-link" @click="goSmsLogin">{{ t('login.smsLogin') }}</text>
			</view>
		</view>

	</view>
</template>

<script>
import { validatePhone, getPhoneMaxLength, showToast } from '@/utils/index.js'
import { loginByPassword, setCountryCode } from '@/api/services/auth.js'
import store from '@/store/index.js'
import i18n from '@/i18n/index.js'

const COUNTRY_LIST = [
	{ code: '+66',  flag: '\u{1F1F9}\u{1F1ED}', name: 'Thailand',  name_zh: '泰国',  name_th: 'ประเทศไทย', min: 9, max: 10 }
]

export default {
	data() {
		return {
			i18n,
			statusBarHeight: 20,
			selectedCountry: COUNTRY_LIST[0],
			phone: '',
			password: '',
			phoneFocused: false,
			pwdFocused: false,
			phoneError: '',
			showPwd: false,
			showCountryPicker: false,
			logging: false,
			COUNTRY_LIST,
			langVersion: 0
		}
	},
	onLoad(options) {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20
		if (options.cc) {
			const cc = decodeURIComponent(options.cc)
			const found = COUNTRY_LIST.find(c => c.code === cc)
			if (found) this.selectedCountry = found
		}
		setCountryCode(this.selectedCountry.code)
	},
	computed: {
		phoneMaxLength() {
			return getPhoneMaxLength(this.selectedCountry)
		},
		fullPhoneNumber() {
			return this.selectedCountry.code + this.phone
		},
		canSubmit() {
			return this.phone && this.password && this.password.length >= 6
		}
	},
	methods: {
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		currentLangName(c) {
			const lang = i18n.getLanguage?.() || 'zh'
			if (lang === 'zh') return c.name_zh
			if (lang === 'th') return c.name_th
			return c.name
		},
		onPhoneInput(e) {
			const val = (e.detail && e.detail.value) || ''
			const cleaned = val.replace(/\D/g, '').slice(0, this.phoneMaxLength)
			this.phone = cleaned
		},
		selectCountry(c) {
			this.selectedCountry = c
			setCountryCode(c.code)
			this.showCountryPicker = false
			this.phone = ''
		},
		goBack() {
			uni.navigateBack()
		},
		goSmsLogin() {
			uni.redirectTo({
				url: '/pages/login/sms?cc=' + encodeURIComponent(this.selectedCountry.code) + '&scene=login'
			})
		},
		goForgotPassword() {
			uni.navigateTo({
				url: '/pages/login/sms?cc=' + encodeURIComponent(this.selectedCountry.code) + '&scene=reset_password'
			})
		},
		async handleLogin() {
			if (!this.canSubmit || this.logging) return
			if (!validatePhone(this.phone, this.selectedCountry)) {
				this.phoneError = this.t('login.phoneInvalid')
				return
			}
			this.logging = true
			try {
				const res = await loginByPassword(this.phone, this.password)
				if (res.code === 0 && res.data) {
					const data = res.data
					if (data.access_token) store.setToken(data.access_token)
					if (data.refresh_token) {
						try { uni.setStorageSync('siamfeast_refresh_token', data.refresh_token) } catch (e) {}
					}
					if (data.user) store.setUserInfo(data.user)
					// 通知 push.js 触发 cid 上报
					uni.$emit('loginSuccess')
					showToast(this.t('login.loginSuccess'))
					setTimeout(() => {
						uni.switchTab({ url: '/pages/index/index' })
					}, 800)
				} else {
					showToast(res.message || this.t('login.loginFailed'))
				}
			} catch (e) {
				console.error('[password-login] failed:', e)
				const code = e && (e.code || e.bizCode)
				let msg = this.t('login.loginFailed')
				if (code === 'INVALID_CREDENTIALS') {
					msg = this.t('login.invalidCredentials') || '手机号或密码错误'
				} else if (code === 'RATE_LIMITED') {
					msg = this.t('login.tooManyRequests') || '操作过于频繁,请稍后再试'
				} else if (code === 'USER_NOT_FOUND') {
					msg = this.t('login.userNotFound') || '用户不存在,请先注册'
				} else if (e && e.message) {
					msg = e.message
				}
				showToast(msg)
			} finally {
				this.logging = false
			}
		}
	}
}
</script>

<style scoped>
.password-page {
	min-height: 100vh;
	background-color: #FFFFFF;
}

.status-bar {
	width: 100%;
}

.nav-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 32rpx;
}

.nav-left, .nav-right {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.nav-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1A1A1A;
}

.form-container {
	padding: 40rpx 48rpx;
}

.title-section {
	margin-bottom: 60rpx;
}

.main-title {
	display: block;
	font-size: 48rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-bottom: 16rpx;
}

.sub-title {
	display: block;
	font-size: 28rpx;
	color: #828282;
}

.form-section {
	margin-bottom: 40rpx;
}

.input-field {
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 96rpx;
	border: 2rpx solid #E0E0E0;
	border-radius: 16rpx;
	padding: 0 24rpx;
	margin-bottom: 24rpx;
}

.country-picker {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.country-flag {
	font-size: 36rpx;
	margin-right: 8rpx;
}

.country-code {
	font-size: 30rpx;
	color: #1A1A1A;
}

.picker-arrow {
	font-size: 20rpx;
	color: #828282;
	margin-left: 6rpx;
}

.phone-divider {
	width: 2rpx;
	height: 36rpx;
	background-color: #E0E0E0;
	margin: 0 16rpx;
}

.input {
	flex: 1;
	font-size: 30rpx;
	color: #1A1A1A;
}

.pwd-toggle {
	padding: 8rpx 16rpx;
}

.pwd-toggle-text {
	font-size: 24rpx;
	color: #F2B131;
}

.field-error {
	display: block;
	font-size: 24rpx;
	color: #DA3300;
	margin-top: -16rpx;
	margin-bottom: 16rpx;
	margin-left: 8rpx;
}

.forgot-link {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 32rpx;
	margin-top: -8rpx;
}

.forgot-text {
	font-size: 26rpx;
	color: #F2B131;
}

.login-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 96rpx;
	background-color: #F2B131;
	border-radius: 16rpx;
}

.btn-disabled {
	opacity: 0.5;
}

.btn-text {
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
}

.switch-section {
	text-align: center;
	margin-top: 48rpx;
}

.switch-prefix {
	font-size: 26rpx;
	color: #828282;
}

.switch-link {
	font-size: 26rpx;
	color: #F2B131;
	margin-left: 8rpx;
}

/* 国家选择器 */
.country-picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.5);
	z-index: 999;
	display: flex;
	align-items: flex-end;
}

.country-picker-sheet {
	width: 100%;
	background-color: #FFFFFF;
	border-radius: 24rpx 24rpx 0 0;
	max-height: 70vh;
}

.sheet-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 32rpx;
	border-bottom: 2rpx solid #F0F0F0;
}

.sheet-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1A1A1A;
}

.sheet-close {
	font-size: 48rpx;
	color: #828282;
}

.sheet-list {
	max-height: 60vh;
}

.country-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 28rpx 32rpx;
	border-bottom: 2rpx solid #F5F5F5;
}

.country-active {
	background-color: #FFF8E1;
}

.country-flag-lg {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.country-name {
	flex: 1;
	font-size: 30rpx;
	color: #1A1A1A;
}

.country-code-text {
	font-size: 28rpx;
	color: #828282;
}
</style>
