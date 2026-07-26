<template>
	<view class="login-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-left"></view>
			<view class="lang-switch" @click="switchLanguage">
				<text class="lang-text">{{ currentLangLabel }}</text>
			</view>
		</view>

		<!-- Logo区域 -->
		<view class="logo-section">
			<view class="logo-wrapper">
				<image class="logo" src="/static/logo.png" mode="aspectFill"></image>
			</view>
			<text class="app-name">SiamFeast</text>
		</view>

		<!-- 内容区域 -->
		<view class="content-section">
			<!-- 账号密码登录表单(默认)-->
			<view class="input-section">
				<!-- 手机号 -->
				<view class="input-field" :style="{ borderColor: phoneError ? '#DA3300' : (phoneFocused ? '#F2B131' : '#E0E0E0') }">
					<view class="country-picker">
						<text class="country-flag">{{ selectedCountry.flag }}</text>
						<text class="country-code">{{ selectedCountry.code }}</text>
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
				<view class="input-field" :style="{ borderColor: passwordFocused ? '#F2B131' : '#E0E0E0' }">
					<input
						class="input"
						:password="!showPassword"
						:placeholder="t('login.passwordPlaceholder')"
						placeholder-style="color: #828282;"
						v-model="password"
						@focus="passwordFocused = true"
						@blur="passwordFocused = false"
						@confirm="handleLogin"
					/>
					<view class="password-toggle" @click="showPassword = !showPassword">
						<text class="toggle-text">{{ showPassword ? t('login.hide') : t('login.show') }}</text>
					</view>
				</view>

				<!-- 登录按钮 -->
				<view
					class="login-btn"
					:class="{ 'btn-disabled': !canSubmit || loading }"
					@click="handleLogin"
				>
					<text class="btn-text">{{ loading ? t('common.loading') : t('common.confirm') }}</text>
				</view>
			</view>

			<!-- 左下角:短信登录 / 右下角:注册账号 -->
			<view class="bottom-links">
				<view class="link-item" @click="goSmsLogin('login')">
					<text class="link-text">{{ t('login.smsLogin') }}</text>
				</view>
				<view class="link-item" @click="goRegister">
					<text class="link-text accent">{{ t('login.goRegister') }}</text>
				</view>
			</view>

			<!-- 第三方 OAuth 登录入口(自定义基座才能用)-->
			<!-- #ifdef APP-PLUS -->
			<CSocialButtons v-if="true" @login="handleSocialLogin" />
			<!-- #endif -->
		</view>

		<!-- 协议提示 -->
		<view class="agreement">
			<view class="agreement-check" @click="agreed = !agreed">
				<view class="checkbox" :class="{ 'checkbox-active': agreed }">
					<text v-if="agreed" class="check-icon">&#10003;</text>
				</view>
			</view>
			<text class="agreement-text">{{ t('login.agreementPrefix') }}</text>
			<text class="agreement-link" @click="openAgreement('terms')">{{ t('login.terms') }}</text>
			<text class="agreement-text">{{ t('login.and') }}</text>
			<text class="agreement-link" @click="openAgreement('privacy')">{{ t('login.privacy') }}</text>
		</view>

		<!-- 安全区域底部 -->
		<view class="safe-area-bottom"></view>

	</view>
</template>

<script>
import { validatePhone, getPhoneMaxLength, showToast } from '@/utils/index.js'
import { loginByPassword, setCountryCode } from '@/api/services/auth.js'
import {
	signInWithGoogle,
	signInWithFacebook,
	exchangeOAuthTokenForJwt
} from '@/utils/oauth.js'
import store from '@/store/index.js'
import i18n from '@/i18n/index.js'
import CSocialButtons from '@/components/CSocialButtons.vue'

const COUNTRY_LIST = [
	{ code: '+66',  flag: '\u{1F1F9}\u{1F1ED}', name: 'Thailand',  name_zh: '泰国',  name_th: 'ประเทศไทย', min: 9, max: 10 }
]

export default {
	components: { CSocialButtons },
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			phone: '',
			password: '',
			showPassword: false,
			agreed: true,
			loading: false,
			phoneFocused: false,
			phoneError: '',
			passwordFocused: false,
			langVersion: 0,
			showCountryPicker: false,
			selectedCountry: COUNTRY_LIST[0],
			countries: COUNTRY_LIST
		}
	},
	computed: {
		currentLangLabel() {
			this.langVersion; const lang = i18n.getLanguage()
			const labels = { zh: '中文', en: 'EN', th: 'ไทย' };
			return labels[lang] || 'EN';
		},
		phoneMaxLength() {
			return getPhoneMaxLength(this.selectedCountry)
		},
		canSubmit() {
			if (!validatePhone(this.phone, this.selectedCountry)) return false
			if (!this.agreed) return false
			return this.password.length >= 6
		}
	},
	onLoad() {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20
		uni.$on("languageChanged", () => { this.langVersion++ })
		// Set default country code
		setCountryCode(this.selectedCountry.code)
	},
	onUnload() {
		uni.$off("languageChanged")
	},
	methods: {
		t(key, params) {
			this.langVersion;
			return i18n.t(key, params)
		},
		selectCountry(c) {
			this.selectedCountry = c
			setCountryCode(c.code)
			this.showCountryPicker = false
			// 切换国家后，如果当前手机号超出新国家的位数上限，截断
			if (this.phone && c.max && this.phone.length > c.max) {
				this.phone = this.phone.slice(0, c.max)
			}
			// 重新校验
			if (this.phone) {
				if (!validatePhone(this.phone, c)) {
					const len = c.min === c.max ? c.min : `${c.min}-${c.max}`
					this.phoneError = this.t('login.phoneInvalid') + ` (${len})`
				} else {
					this.phoneError = ''
				}
			}
		},

		// 手机号实时过滤：去掉非数字
		onPhoneInput(e) {
			const val = (e.detail && e.detail.value) || ''
			const cleaned = val.replace(/\D/g, '').slice(0, this.phoneMaxLength)
			if (cleaned !== val) {
				this.phone = cleaned
				// 触发 v-model 同步
				this.$forceUpdate()
			} else {
				this.phone = cleaned
			}
			// 输入中清空错误（除非已超长）
			if (this.phoneError && validatePhone(this.phone, this.selectedCountry)) {
				this.phoneError = ''
			}
		},

		// 失焦校验
		onPhoneBlur() {
			this.phoneFocused = false
			if (!this.phone) {
				this.phoneError = this.t('login.phoneRequired')
			} else if (!validatePhone(this.phone, this.selectedCountry)) {
				const len = this.selectedCountry.min === this.selectedCountry.max
					? this.selectedCountry.min
					: `${this.selectedCountry.min}-${this.selectedCountry.max}`
				this.phoneError = this.t('login.phoneInvalid') + ` (${len})`
			} else {
				this.phoneError = ''
			}
		},

		async handleLogin() {
			if (!this.canSubmit || this.loading) return

			if (!validatePhone(this.phone, this.selectedCountry)) {
				showToast(this.t('login.phoneRequired'))
				return
			}

			if (!this.agreed) {
				showToast(this.t('login.agreementRequired'))
				return
			}

			this.loading = true

			try {
				const res = await loginByPassword(this.phone, this.password)

				if (res.code !== 0) {
					showToast(this.resolveErrorMessage(res))
					return
				}

				if (res.data && res.data.access_token) {
					store.setToken(res.data.access_token)
					if (res.data.user) {
						store.setUserInfo(res.data.user)
					}
				}

				showToast(this.t('login.loginSuccess'))

				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
					})
				}, 1500)
			} catch (e) {
				console.error('登录失败:', e)
				showToast(this.resolveErrorMessage(e))
			} finally {
				this.loading = false
			}
		},

		resolveErrorMessage(err) {
			const msg = (err && (err.message || err.msg)) || ''
			const code = err && (err.bizCode || err.code)
			// 密码错误的常见 code + 关键词匹配（三语）
			const pwdErrorCodes = [4001, 1001, 401, 'INVALID_CREDENTIALS', 'PASSWORD_INCORRECT', 'LOGIN_FAILED']
			const pwdErrorKeywords = ['密码', 'password', 'Password', 'PASSWORD', 'credential', 'incorrect', '无效', '错误', 'รหัสผ่าน', 'ไม่ถูกต้อง', 'ไม่ถูกต้อง']
			if (pwdErrorCodes.includes(code) || (typeof msg === 'string' && pwdErrorKeywords.some(k => msg.toLowerCase().includes(k.toLowerCase())))) {
				return this.t('login.passwordIncorrect')
			}
			// 后端按 Accept-Language 返回的本地化消息
			if (typeof msg === 'string' && msg.trim()) return msg
			// 兜底：真正的网络错误
			return this.t('common.networkError')
		},

		goSmsLogin(scene = 'login') {
			uni.navigateTo({
				url: '/pages/login/sms?cc=' + encodeURIComponent(this.selectedCountry.code) + '&scene=' + scene
			})
		},

		// 密码登录页(注册过的用户用手机号+密码登录,不需要收码)
		goPasswordLogin() {
			uni.navigateTo({
				url: '/pages/login/password?cc=' + encodeURIComponent(this.selectedCountry.code)
			})
		},

		// 注册页(手机号 + 密码 + 短信验证码一次性填写,无需邮箱)
		goRegister() {
			uni.navigateTo({
				url: '/pages/login/register?cc=' + encodeURIComponent(this.selectedCountry.code)
			})
		},

			switchLanguage() {
				const langs = ['zh', 'en', 'th'];
				const current = i18n.getLanguage();
				const nextIdx = (langs.indexOf(current) + 1) % langs.length;
				i18n.setLanguage(langs[nextIdx]);
				this.langVersion++;
				this.$forceUpdate();
				showToast(this.t('language.switchSuccess'));
			},

		handleSocialLogin(platform) {
			if (!this.agreed) {
				showToast(this.t('login.agreementRequired'))
				return
			}
			if (this.loading) return
			this.doOAuthSocialLogin(platform)
		},

		async doOAuthSocialLogin(platform) {
			this.loading = true
			try {
				// 1. 调对应 OAuth Provider 拉起原生授权,直接换自家 JWT
				//    新工具 signInWithGoogle/Facebook 已经把 uni.login + 提交后端 + 拿 JWT 一站式封装
				let data
				if (platform === 'google') {
					data = await signInWithGoogle()
				} else if (platform === 'facebook') {
					data = await signInWithFacebook()
				} else {
					showToast(`Unsupported platform: ${platform}`)
					return
				}

				// 2. 处理后端返回的 JWT + 用户信息
				//    signInWithGoogle/Facebook 返回的就是 /auth/{provider}-login 接口的 data 字段
				if (data && data.access_token) {
					store.setToken(data.access_token)
					if (data.refresh_token) {
						try { uni.setStorageSync('siamfeast_refresh_token', data.refresh_token) } catch (e) {}
					}
					if (data.user) {
						store.setUserInfo(data.user)
					}
					// 通知 push.js 触发 cid 上报
					uni.$emit('loginSuccess')
				}

				showToast(this.t('login.loginSuccess'))
				setTimeout(() => {
					if (data && data.is_new_user) {
						uni.redirectTo({ url: '/pages/settings/index?newUser=1' })
					} else {
						uni.switchTab({ url: '/pages/index/index' })
					}
				}, 1500)
			} catch (e) {
				console.error(`[social-login] ${platform} failed:`, e)
				showToast(this.resolveSocialErrorMessage(e))
			} finally {
				this.loading = false
			}
		},

		resolveSocialErrorMessage(err) {
			// 取消登录属于用户主动行为,不显示错误
			if (err && err.code === 'CANCELLED') return ''
			// 后端业务返回的本地化消息
			const msg = (err && (err.message || err.msg)) || ''
			if (typeof msg === 'string' && msg.trim()) return msg
			// 兜底
			return this.t('login.loginFailed') || '登录失败,请稍后重试'
		},

		openAgreement(type) {
			uni.navigateTo({
				url: `/pages/agreement/index?type=${type}`
			})
		}
	}
}
</script>

<style scoped>
.login-page {
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
	justify-content: flex-end;
	padding: 0 32rpx;
}

.lang-text {
	font-size: 26rpx;
	color: #828282;
	padding: 12rpx 24rpx;
	border: 2rpx solid #E0E0E0;
	border-radius: 32rpx;
}

.logo-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 100rpx;
	padding-bottom: 60rpx;
}

.logo-wrapper {
	width: 188rpx;
	height: 188rpx;
	border-radius: 50%;
	overflow: hidden;
	background-color: #F7F7F7;
	display: flex;
	align-items: center;
	justify-content: center;
}

.logo {
	width: 188rpx;
	height: 188rpx;
}

.app-name {
	font-size: 48rpx;
	font-weight: 600;
	color: #000000;
	margin-top: 32rpx;
	letter-spacing: -0.5rpx;
}

.content-section {
	flex: 1;
	padding: 0 48rpx;
	display: flex;
	flex-direction: column;
}

.input-field {
	display: flex;
	align-items: center;
	height: 88rpx;
	background-color: #FFFFFF;
	border-radius: 16rpx;
	border: 2rpx solid #E0E0E0;
	padding: 0 32rpx;
	margin-bottom: 32rpx;
	transition: border-color 0.3s;
}

.field-error {
	color: #DA3300;
	font-size: 24rpx;
	margin-top: -20rpx;
	margin-bottom: 16rpx;
	margin-left: 32rpx;
}

/* 国家区号选择器 */
.country-picker {
	display: flex;
	align-items: center;
	gap: 6rpx;
	flex-shrink: 0;
	padding-right: 12rpx;
}

.country-flag {
	font-size: 32rpx;
}

.country-code {
	font-size: 28rpx;
	color: #282332;
	font-weight: 500;
}

.picker-arrow {
	font-size: 18rpx;
	color: #828282;
}

.phone-divider {
	width: 2rpx;
	height: 36rpx;
	background-color: #E0E0E0;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.input {
	flex: 1;
	font-size: 28rpx;
	color: #282332;
}

.password-toggle {
	padding: 16rpx;
}

.toggle-text {
	font-size: 24rpx;
	color: #828282;
}

/* 新登录页样式 */
/* 底部链接区:左下短信登录,右下注册账号 */
.bottom-links {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 8rpx;
	margin-top: 16rpx;
}

.link-item {
	padding: 8rpx 0;
}

.link-text {
	font-size: 28rpx;
	color: #828282;
}

.link-text.accent {
	color: #F2B131;
	font-weight: 600;
}

.welcome-section {
	padding: 80rpx 40rpx 60rpx;
	text-align: center;
}

.welcome-title {
	display: block;
	font-size: 44rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-bottom: 16rpx;
}

.welcome-subtitle {
	display: block;
	font-size: 28rpx;
	color: #828282;
}

.sms-btn {
	margin-top: 80rpx !important;
	height: 96rpx !important;
	font-size: 32rpx;
}

.register-btn {
	margin-top: 24rpx !important;
	height: 96rpx !important;
	font-size: 32rpx;
	background-color: #FFFFFF !important;
	border: 2rpx solid #F2B131 !important;
	color: #F2B131 !important;
}

.register-btn .btn-text {
	color: #F2B131 !important;
}

/* 老登录按钮样式(保留) */
.login-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 80rpx;
	background-color: #F2B131;
	border-radius: 16rpx;
	margin-top: 16rpx;
}

.btn-disabled {
	opacity: 0.5;
}

.btn-text {
	font-size: 32rpx;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.6);
}

.login-links {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;
	padding: 0 8rpx;
}

.switch-text {
	font-size: 26rpx;
	color: #019EFF;
}

.register-text {
	font-size: 26rpx;
	color: #F2B131;
	font-weight: 500;
}

.divider {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin: 48rpx 0 32rpx;
}

.divider-line {
	flex: 1;
	height: 2rpx;
	background-color: #E6E6E6;
}

.divider-text {
	padding: 0 32rpx;
	font-size: 28rpx;
	color: #828282;
}

.social-section {
	margin-bottom: 32rpx;
}

.social-buttons {
	display: flex;
	flex-direction: row;
	justify-content: center;
	gap: 64rpx;
}

.social-btn {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background-color: #FFFFFF;
	border: 2rpx solid #E0E0E0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.social-icon-img {
	width: 48rpx;
	height: 48rpx;
}

.agreement {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	margin-top: auto;
	padding-bottom: 32rpx;
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

/* 国家选择弹窗 */
.picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4);
	z-index: 999;
	display: flex;
	align-items: center;
}

.picker-sheet {
	width: 100%;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	margin-top: 35vh;
	max-height: 70vh;
	display: flex;
	flex-direction: column;
}

.picker-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 32rpx;
	border-bottom: 2rpx solid #F0F0F0;
}

.picker-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #3C3C3C;
}

.picker-close {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-text {
	font-size: 28rpx;
	color: #828282;
}

.picker-list {
	max-height: 60vh;
}

.picker-item {
	display: flex;
	align-items: center;
	padding: 24rpx 32rpx;
	border-bottom: 1rpx solid #F5F5F5;
}

.picker-item-active {
	background-color: #FFF8E1;
}

.picker-flag {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.picker-name {
	flex: 1;
	font-size: 28rpx;
	color: #3C3C3C;
}

.picker-code {
	font-size: 28rpx;
	color: #828282;
	margin-right: 16rpx;
}

.picker-check {
	font-size: 28rpx;
	color: #F2B131;
	font-weight: 600;
}

.safe-area-bottom {
	height: constant(safe-area-inset-bottom);
	height: env(safe-area-inset-bottom);
}
</style>
