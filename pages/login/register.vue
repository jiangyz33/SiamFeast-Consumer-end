<template>
	<view class="register-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('login.goRegister') }}</text>
			<view class="nav-right"></view>
		</view>

		<view class="form-container">
			<view class="title-section">
				<text class="main-title">{{ t('login.goRegister') }}</text>
				<text class="sub-title">{{ t('login.registerDesc') }}</text>
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
					/>
					<view class="pwd-toggle" @click="showPwd = !showPwd">
						<text class="pwd-toggle-text">{{ showPwd ? t('login.hide') : t('login.show') }}</text>
					</view>
				</view>
				<text class="field-hint">{{ t('login.passwordHint') }}</text>

				<!-- 确认密码 -->
				<view class="input-field" :style="{ borderColor: pwd2Focused ? '#F2B131' : '#E0E0E0' }">
					<input
						class="input"
						:password="!showPwd2"
						:placeholder="t('login.confirmPasswordPlaceholder')"
						placeholder-style="color: #828282;"
						v-model="confirmPassword"
						@focus="pwd2Focused = true"
						@blur="pwd2Focused = false"
						@input="onConfirmPasswordInput"
					/>
					<view class="pwd-toggle" @click="showPwd2 = !showPwd2">
						<text class="pwd-toggle-text">{{ showPwd2 ? t('login.hide') : t('login.show') }}</text>
					</view>
				</view>
				<text v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</text>

				<!-- 邀请码(可选) -->
				<view class="invite-section">
					<view class="input-field invite-field" :style="{ borderColor: inviteFocused ? '#F2B131' : '#E0E0E0' }">
						<input
							class="input"
							:placeholder="t('login.inviteCodePlaceholder')"
							placeholder-style="color: #828282;"
							v-model="inviteCode"
							@focus="inviteFocused = true"
							@blur="inviteFocused = false"
						/>
					</view>
					<view class="invite-tip">
						<text class="invite-tip-icon">🎁</text>
						<text class="invite-tip-text">{{ t('login.inviteCodeHint') }}</text>
						<text v-if="inviteCode" class="invite-tip-filled">{{ t('login.inviteCodeFilled') }}</text>
					</view>
				</view>

				<!-- 生日(必填) -->
				<view class="birthday-section">
					<view class="input-field birthday-field" :style="{ borderColor: birthdayError ? '#DA3300' : '#E0E0E0' }">
						<picker mode="date" :value="birthday" :end="maxBirthdayDate" :start="minBirthdayDate" @change="onBirthdayChange">
							<view class="birthday-picker">
								<text v-if="birthday" class="birthday-text">{{ birthday }}</text>
								<text v-else class="birthday-placeholder">{{ t('login.birthdayPlaceholder') }}</text>
								<text class="birthday-suffix">🎂</text>
							</view>
						</picker>
					</view>
					<text v-if="birthdayError" class="field-error">{{ birthdayError }}</text>
				</view>

				<!-- 短信验证码 -->
				<view class="code-field">
					<view class="input-field code-input-field" :style="{ borderColor: codeError ? '#DA3300' : (codeFocused ? '#F2B131' : '#E0E0E0') }">
						<input
							class="input code-input"
							type="number"
							:maxlength="6"
							:placeholder="t('login.codePlaceholder')"
							placeholder-style="color: #828282;"
							v-model="code"
							@focus="codeFocused = true; codeError = ''"
						/>
					</view>
					<view
						class="send-btn"
						:class="{ 'btn-disabled': !canSendCode || sendingCode }"
						@click="handleSendCode"
					>
						<text class="send-text">{{ sendingCode ? t('common.loading') : (cooldown > 0 ? `${cooldown}s` : t('login.getCode')) }}</text>
					</view>
				</view>
				<text v-if="codeError" class="field-error">{{ codeError }}</text>
			</view>

			<!-- 注册按钮 -->
			<view
				class="login-btn"
				:class="{ 'btn-disabled': !canSubmit || submitting }"
				@click="handleRegister"
			>
				<text class="btn-text">{{ submitting ? t('common.loading') : t('login.register') }}</text>
			</view>

			<!-- 协议 -->
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
		</view>

	</view>
</template>

<script>
import { validatePhone, getPhoneMaxLength, showToast } from '@/utils/index.js'
import { setCountryCode } from '@/api/services/auth.js'
import { sendSMSCode, smsLogin, resolveSMSErrorMessage } from '@/utils/sms.js'
import { post, patch } from '@/api/request.js'
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
			confirmPassword: '',
			inviteCode: '',
			code: '',
			birthday: '',
			phoneFocused: false,
			pwdFocused: false,
			pwd2Focused: false,
			inviteFocused: false,
			codeFocused: false,
			phoneError: '',
			confirmPasswordError: '',
			birthdayError: '',
			codeError: '',
			showPwd: false,
			showPwd2: false,
			showCountryPicker: false,
			sendingCode: false,
			submitting: false,
			cooldown: 0,
			cooldownTimer: null,
			agreed: false,
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
	onUnload() {
		if (this.cooldownTimer) clearInterval(this.cooldownTimer)
	},
	computed: {
		phoneMaxLength() {
			return getPhoneMaxLength(this.selectedCountry)
		},
		fullPhoneNumber() {
			return this.selectedCountry.code + this.phone
		},
		// 生日 picker:最早 1900-01-01,最晚今天(不能选未来日期)
		minBirthdayDate() {
			return '1900-01-01'
		},
		maxBirthdayDate() {
			const now = new Date()
			const yyyy = now.getFullYear()
			const mm = String(now.getMonth() + 1).padStart(2, '0')
			const dd = String(now.getDate()).padStart(2, '0')
			return `${yyyy}-${mm}-${dd}`
		},
		canSendCode() {
			return this.phone && this.cooldown === 0
		},
		canSubmit() {
			return this.phone
				&& this.password && this.password.length >= 6
				&& this.confirmPassword === this.password
				&& this.code && /^\d{4,8}$/.test(this.code)
				&& this.birthday && /^\d{4}-\d{2}-\d{2}$/.test(this.birthday)
				&& this.agreed
		},
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
		onConfirmPasswordInput() {
			if (this.confirmPassword && this.confirmPassword !== this.password) {
				this.confirmPasswordError = this.t('login.passwordMismatch')
			} else {
				this.confirmPasswordError = ''
			}
		},
		onBirthdayChange(e) {
			const val = (e.detail && e.detail.value) || ''
			this.birthday = val
			this.birthdayError = ''
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
		openAgreement(type) {
			uni.navigateTo({ url: `/pages/agreement/index?type=${type}` })
		},

		// 发送短信验证码
		async handleSendCode() {
			if (!this.canSendCode || this.sendingCode) return
			if (!validatePhone(this.phone, this.selectedCountry)) {
				this.phoneError = this.t('login.phoneInvalid')
				return
			}
			this.sendingCode = true
			try {
				await sendSMSCode(this.fullPhoneNumber, 'register')
				this.cooldown = 60
				this.cooldownTimer = setInterval(() => {
					this.cooldown--
					if (this.cooldown <= 0) {
						clearInterval(this.cooldownTimer)
						this.cooldownTimer = null
					}
				}, 1000)
				showToast(this.t('login.codeSent'))
			} catch (e) {
				console.error('[register] sendCode failed:', e)
				showToast(resolveSMSErrorMessage(e))
			} finally {
				this.sendingCode = false
			}
		},

		// 注册主流程:短信验证码登录 → 补全密码 + 邀请码
		async handleRegister() {
			if (!this.canSubmit || this.submitting) return
			if (!validatePhone(this.phone, this.selectedCountry)) {
				this.phoneError = this.t('login.phoneInvalid')
				return
			}
			if (this.password !== this.confirmPassword) {
				this.confirmPasswordError = this.t('login.passwordMismatch')
				return
			}
			this.submitting = true
			try {
				// 1. 短信验证码登录(登录即注册,scene=register)
				const data = await smsLogin(this.fullPhoneNumber, this.code, 'register')
				if (!data || !data.access_token) {
					showToast(this.t('login.registerFailed'))
					return
				}

				// 2. 存 token
				store.setToken(data.access_token)
				if (data.refresh_token) {
					try { uni.setStorageSync('siamfeast_refresh_token', data.refresh_token) } catch (e) {}
				}
				if (data.user) {
					store.setUserInfo(data.user)
				}
				// 通知 push.js 触发 cid 上报
				uni.$emit('loginSuccess')

				// 3. 并行补全:设置密码 + 设置生日 + 绑定邀请码(可选)
				const tasks = [
					post('/password/change', {
						old_password: '',
						new_password: this.password
					}),
					// 更新生日(PATCH /users/me)
					patch('/users/me', {
						birthday: this.birthday
					})
				]
				if (this.inviteCode && this.inviteCode.trim()) {
					tasks.push(post('/referrals/bind', {
						invite_code: this.inviteCode.trim()
					}))
				}
				const results = await Promise.allSettled(tasks)
				const failed = results.filter(r => r.status === 'rejected')
				if (failed.length > 0) {
					console.warn('[register] 部分信息补全失败', failed)
				}

				showToast(this.t('login.registerSuccess'))
				setTimeout(() => {
					uni.switchTab({ url: '/pages/index/index' })
				}, 1000)
			} catch (e) {
				console.error('[register] failed:', e)
				if (e && e.code === 'CODE_INVALID') {
					this.codeError = this.t('login.codeInvalid') || '验证码错误'
				} else {
					showToast(resolveSMSErrorMessage(e) || this.t('login.registerFailed'))
				}
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style scoped>
.register-page {
	min-height: 100vh;
	background-color: #FFFFFF;
}

.status-bar { width: 100%; }

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

.back-icon { width: 40rpx; height: 40rpx; }

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
	background-color: #FFFFFF;
}

.invite-field {
	border-style: dashed;
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

.field-hint {
	display: block;
	font-size: 24rpx;
	color: #828282;
	margin-top: -16rpx;
	margin-bottom: 16rpx;
	margin-left: 8rpx;
}

.invite-section {
	margin-top: 16rpx;
}

.invite-tip {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-top: 12rpx;
	margin-bottom: 24rpx;
	padding: 16rpx 20rpx;
	background-color: #FFF8E1;
	border-radius: 12rpx;
	border-left: 6rpx solid #F2B131;
}

.invite-tip-icon {
	font-size: 28rpx;
	margin-right: 12rpx;
}

.invite-tip-text {
	font-size: 24rpx;
	color: #666666;
	flex: 1;
	line-height: 1.4;
}

.invite-tip-filled {
	font-size: 24rpx;
	color: #52C41A;
	margin-left: 12rpx;
	font-weight: 600;
}

/* 验证码输入 + 发送按钮 */
/* 生日字段 */
.birthday-section {
	margin-top: 16rpx;
}

.birthday-field {
	display: flex;
	align-items: center;
	padding: 0 24rpx;
}

.birthday-picker {
	flex: 1;
	height: 96rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.birthday-text {
	font-size: 30rpx;
	color: #1A1A1A;
	font-weight: 500;
}

.birthday-placeholder {
	font-size: 30rpx;
	color: #828282;
}

.birthday-suffix {
	font-size: 36rpx;
}

.code-field {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 16rpx;
}

.code-input-field {
	flex: 1;
	margin-bottom: 0;
}

.code-input {
	text-align: left;
}

.send-btn {
	width: 200rpx;
	height: 96rpx;
	background-color: rgba(242, 177, 49, 0.15);
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.send-btn.btn-disabled {
	opacity: 0.5;
}

.send-text {
	font-size: 26rpx;
	color: #F2B131;
	font-weight: 600;
}

.login-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 96rpx;
	background-color: #F2B131;
	border-radius: 16rpx;
	margin-top: 40rpx;
}

.btn-disabled {
	opacity: 0.5;
}

.btn-text {
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
}

/* 协议 */
.agreement {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	margin-top: 32rpx;
	padding: 0 16rpx;
}

.agreement-check {
	margin-right: 12rpx;
}

.checkbox {
	width: 32rpx;
	height: 32rpx;
	border-radius: 8rpx;
	border: 2rpx solid #E0E0E0;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #FFFFFF;
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
	color: #F2B131;
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
