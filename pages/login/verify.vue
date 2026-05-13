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
					<view class="country-picker" @click="showCountryPicker = true">
						<text class="country-flag">{{ selectedCountry.flag }}</text>
						<text class="country-code">{{ selectedCountry.code }}</text>
						<text class="picker-arrow">&#9662;</text>
					</view>
					<view class="phone-divider"></view>
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
						<text v-if="agreed" class="check-icon">&#10003;</text>
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
				<text class="phone-number">{{ selectedCountry.flag }} {{ selectedCountry.code }} {{ formatPhone }}</text>
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

			<!-- 调试提示 -->
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

		<!-- 国家选择弹窗 -->
		<view class="picker-mask" v-if="showCountryPicker" @click="showCountryPicker = false">
			<view class="picker-sheet" @click.stop>
				<view class="picker-header">
					<text class="picker-title">{{ i18n.t('login.selectCountry') }}</text>
					<view class="picker-close" @click="showCountryPicker = false">
						<text class="close-text">&#10005;</text>
					</view>
				</view>
				<scroll-view class="picker-list" scroll-y>
					<view
						v-for="(c, i) in countries"
						:key="i"
						class="picker-item"
						:class="{ 'picker-item-active': selectedCountry.code === c.code }"
						@click="selectCountry(c)"
					>
						<text class="picker-flag">{{ c.flag }}</text>
						<text class="picker-name">{{ c.name }}</text>
						<text class="picker-code">{{ c.code }}</text>
						<text v-if="selectedCountry.code === c.code" class="picker-check">&#10003;</text>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 安全区域底部 -->
		<view class="safe-area-bottom"></view>
	</view>
</template>

<script>
import { formatPhoneWithDash, validatePhone, showToast } from '@/utils/index.js'
import { sendCode, loginByCode, register, setCountryCode } from '@/api/services/auth.js'
import i18n from '@/i18n/index.js'
import store from '@/store/index.js'

const COUNTRY_LIST = [
	{ code: '+66',  flag: '\u{1F1F9}\u{1F1ED}', name: 'Thailand',    name_zh: '泰国',    name_th: 'ประเทศไทย' },
	{ code: '+86',  flag: '\u{1F1E8}\u{1F1F3}', name: 'China',       name_zh: '中国',    name_th: 'จีน' },
	{ code: '+852', flag: '\u{1F1ED}\u{1F1F0}', name: 'Hong Kong',   name_zh: '香港',    name_th: 'ฮ่องกง' },
	{ code: '+853', flag: '\u{1F1F2}\u{1F1F4}', name: 'Macau',       name_zh: '澳门',    name_th: 'มาเกา' },
	{ code: '+886', flag: '\u{1F1F9}\u{1F1FC}', name: 'Taiwan',      name_zh: '台湾',    name_th: 'ไต้วัน' },
	{ code: '+65',  flag: '\u{1F1F8}\u{1F1EC}', name: 'Singapore',   name_zh: '新加坡',  name_th: 'สิงคโปร์' },
	{ code: '+60',  flag: '\u{1F1F2}\u{1F1FE}', name: 'Malaysia',    name_zh: '马来西亚', name_th: 'มาเลเซีย' },
	{ code: '+84',  flag: '\u{1F1FB}\u{1F1F3}', name: 'Vietnam',     name_zh: '越南',    name_th: 'เวียดนาม' },
	{ code: '+95',  flag: '\u{1F1F2}\u{1F1E6}', name: 'Myanmar',     name_zh: '缅甸',    name_th: 'พม่า' },
	{ code: '+855', flag: '\u{1F1F0}\u{1F1ED}', name: 'Cambodia',    name_zh: '柬埔寨',  name_th: 'กัมพูชา' },
	{ code: '+856', flag: '\u{1F1F1}\u{1F1E6}', name: 'Laos',        name_zh: '老挝',    name_th: 'ลาว' },
	{ code: '+62',  flag: '\u{1F1EE}\u{1F1E9}', name: 'Indonesia',   name_zh: '印尼',    name_th: 'อินโดนีเซีย' },
	{ code: '+63',  flag: '\u{1F1F5}\u{1F1ED}', name: 'Philippines', name_zh: '菲律宾',  name_th: 'ฟิลิปปินส์' },
	{ code: '+82',  flag: '\u{1F1F0}\u{1F1F7}', name: 'South Korea', name_zh: '韩国',    name_th: 'เกาหลีใต้' },
	{ code: '+81',  flag: '\u{1F1EF}\u{1F1F5}', name: 'Japan',       name_zh: '日本',    name_th: 'ญี่ปุ่น' },
	{ code: '+91',  flag: '\u{1F1EE}\u{1F1F3}', name: 'India',       name_zh: '印度',    name_th: 'อินเดีย' },
	{ code: '+1',   flag: '\u{1F1FA}\u{1F1F8}', name: 'USA',         name_zh: '美国',    name_th: 'อเมริกา' },
	{ code: '+44',  flag: '\u{1F1EC}\u{1F1E7}', name: 'UK',          name_zh: '英国',    name_th: 'อังกฤษ' },
	{ code: '+61',  flag: '\u{1F1E6}\u{1F1FA}', name: 'Australia',   name_zh: '澳大利亚', name_th: 'ออสเตรเลีย' },
]

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
			inviteFocused: false,
			showCountryPicker: false,
			selectedCountry: COUNTRY_LIST[0],
			countries: COUNTRY_LIST
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

		// Restore selected country code from login page
		if (options.cc) {
			const cc = decodeURIComponent(options.cc)
			const found = COUNTRY_LIST.find(c => c.code === cc)
			if (found) this.selectedCountry = found
		}
		setCountryCode(this.selectedCountry.code)

		if (this.isRegister && options.password) {
			this.password = decodeURIComponent(options.password)
		}
		if (this.isRegister && options.inviteCode) {
			this.inviteCode = decodeURIComponent(options.inviteCode)
		}

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

		selectCountry(c) {
			this.selectedCountry = c
			setCountryCode(c.code)
			this.showCountryPicker = false
		},

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

		async handleVerify() {
			if (this.code.length < this.codeLength) return
			if (this.loading) return
			this.loading = true

			try {
				let res

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
