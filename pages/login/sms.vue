<template>
	<view class="sms-login-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ scene === 'register' ? t('login.goRegister') : t('login.smsLoginTitle') }}</text>
			<view class="nav-right"></view>
		</view>

		<view class="content-section">
			<view class="logo-wrapper">
				<image class="logo" src="/static/logo.png" mode="aspectFill"></image>
			</view>

			<!-- 提示文案 -->
			<view class="hint-section">
				<text class="hint-text">{{ loginMode === 'email' ? t('login.emailLoginHint') : t('login.smsLoginHint') }}</text>
			</view>

			<!-- 手机号 + 验证码输入 -->
			<view class="input-section">
				<!-- 手机号 -->
				<view class="phone-field">
					<view class="country-picker">
						<text class="country-flag">{{ selectedCountry.flag }}</text>
						<text class="country-code">{{ selectedCountry.code }}</text>
					</view>
					<view class="phone-divider"></view>
					<input
						class="phone-input"
						type="number"
						:maxlength="phoneMaxLength"
						:placeholder="t('login.phonePlaceholder')"
						placeholder-style="color: #828282;"
						v-model="phone"
						@input="onPhoneInput"
					/>
				</view>

				<!-- 邮箱（仅邮箱模式显示） -->
				<view class="phone-field" v-if="loginMode === 'email'">
					<view class="country-picker">
						<text class="country-flag">✉️</text>
					</view>
					<view class="phone-divider"></view>
					<input
						class="phone-input"
						type="text"
						:placeholder="t('login.emailPlaceholder')"
						placeholder-style="color: #828282;"
						v-model="email"
					/>
				</view>

				<!-- 验证码 -->
				<view class="code-field">
					<input
						class="code-input"
						type="number"
						:maxlength="6"
						:placeholder="t('login.codePlaceholder')"
						placeholder-style="color: #828282;"
						v-model="code"
					/>
					<view
						class="send-btn"
						:class="{ 'btn-disabled': !canSendCode || sendingCode }"
						@click="handleSendCode"
					>
						<text class="send-text">{{ sendBtnText }}</text>
					</view>
				</view>
			</view>

			<!-- 登录按钮 -->
			<view
				class="login-btn"
				:class="{ 'btn-disabled': !canLogin || logging }"
				@click="handleLogin"
			>
				<text class="btn-text">{{ logging ? t('common.loading') : t('common.confirm') }}</text>
			</view>

			<!-- 切换到其他登录方式（邮箱模式由 SMS 配额用完时自动降级，无需手动切换） -->
			<view class="login-links">
				<view class="switch-link" @click="goPasswordLogin">
					<text class="switch-text">{{ t('login.passwordLogin') }}</text>
				</view>
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

		<!-- 安全区域底部 -->
		<view class="safe-area-bottom"></view>

		<!-- 新用户邀请码弹窗 -->
		<view v-if="showInviteDialog" class="invite-mask" @click="handleSkipInvite">
			<view class="invite-dialog" @click.stop>
				<view class="invite-header">
					<text class="invite-emoji">🎁</text>
					<text class="invite-title">{{ t('login.inviteCodePromptTitle') }}</text>
				</view>
				<text class="invite-desc">{{ t('login.inviteCodePromptDesc') }}</text>
				<view class="invite-input-field">
					<input
						class="invite-input"
						type="text"
						:maxlength="32"
						:placeholder="t('login.inviteCodePlaceholder')"
						placeholder-style="color: #BDBDBD;"
						v-model="inviteCode"
					/>
				</view>
				<view class="invite-buttons">
					<view
						class="invite-btn invite-btn-skip"
						@click="handleSkipInvite"
					>
						<text class="invite-btn-text-skip">{{ t('login.inviteCodeSkip') }}</text>
					</view>
					<view
						class="invite-btn invite-btn-submit"
						:class="{ 'btn-disabled': submittingInvite }"
						@click="handleSubmitInvite"
					>
						<text class="invite-btn-text-submit">
							{{ submittingInvite ? t('common.loading') : t('login.inviteCodeSubmit') }}
						</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import { validatePhone, getPhoneMaxLength, showToast } from '@/utils/index.js'
import { sendSMSCode, smsLogin, resolveSMSErrorMessage, toE164 } from '@/utils/sms.js'
import { setCountryCode, checkPhone, sendEmailCode, loginByEmailCode } from '@/api/services/auth.js'
import { post } from '@/api/request.js'
import store from '@/store/index.js'

const COUNTRY_LIST = [
	{ code: '+66',  flag: '\u{1F1F9}\u{1F1ED}', name: 'Thailand',  min: 9, max: 10 }
]

export default {
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			phone: '',
			code: '',
			email: '',           // 邮箱验证码模式用
			loginMode: 'sms',    // 'sms' 或 'email'，默认短信
			selectedCountry: COUNTRY_LIST[0],
			countries: COUNTRY_LIST,
			agreed: true,
			sendingCode: false,
			logging: false,
			cooldown: 0,
			scene: 'login',  // 'login' 或 'register',决定后端发码场景和登录语义
			// 新用户邀请码弹窗
			showInviteDialog: false,
			inviteCode: '',
			submittingInvite: false,
			pendingRedirect: null,  // 邀请码弹窗关闭后执行的跳转
			cooldownTimer: null,
			showCountryPicker: false,
			langVersion: 0
		}
	},
	computed: {
		phoneMaxLength() {
			return getPhoneMaxLength(this.selectedCountry)
		},
		fullPhoneNumber() {
			return toE164(this.selectedCountry.code, this.phone)
		},
		canSendCode() {
			if (this.loginMode === 'email') {
				// 邮箱模式：手机号 + 邮箱都必须填
				return validatePhone(this.phone, this.selectedCountry)
					&& /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)
					&& this.cooldown === 0
			}
			return validatePhone(this.phone, this.selectedCountry) && this.cooldown === 0
		},
		canLogin() {
			// 登录中 / 已登录 → 禁用按钮
			if (this.logging) return false
			if (this.loginMode === 'email') {
				return validatePhone(this.phone, this.selectedCountry)
					&& /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)
					&& this.code.length >= 4
					&& this.agreed
			}
			return validatePhone(this.phone, this.selectedCountry)
				&& this.code.length >= 4
				&& this.agreed
		},
		sendBtnText() {
			if (this.cooldown > 0) {
				return this.cooldown + 's'
			}
			return this.t('login.getCode')
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
		// scene 参数:'login'(默认)或 'register'
		this.scene = (options.scene === 'register') ? 'register' : 'login'
		setCountryCode(this.selectedCountry.code)

		// 后端自建 SMS 服务,任何环境都可用
	},
	onUnload() {
		if (this.cooldownTimer) clearInterval(this.cooldownTimer)
	},
	created() {
		uni.$on('languageChanged', this.onLanguageChanged)
	},
	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
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
		selectCountry(c) {
			this.selectedCountry = c
			setCountryCode(c.code)
			this.showCountryPicker = false
			this.phone = ''
		},
		onLanguageChanged() {
			this.langVersion++
		},

		onPhoneInput(e) {
			const val = (e.detail && e.detail.value) || ''
			const cleaned = val.replace(/\D/g, '').slice(0, this.phoneMaxLength)
			this.phone = cleaned
		},

		// 发送验证码
		async handleSendCode() {
			if (!this.canSendCode || this.sendingCode) return
			if (!validatePhone(this.phone, this.selectedCountry)) {
				showToast(this.t('login.phoneInvalid'))
				return
			}
			if (this.loginMode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
				showToast(this.t('login.emailInvalid'))
				return
			}
			if (!this.agreed) {
				showToast(this.t('login.agreementRequired'))
				return
			}

			this.sendingCode = true
			try {
				// 邮箱模式：直接调 sendEmailCode（不消耗短信额度，跳过 check-phone）
				if (this.loginMode === 'email') {
					await sendEmailCode(this.fullPhoneNumber, this.email.trim())
					this.startCooldown()
					showToast(this.t('login.codeSent'))
					return
				}

				// SMS 模式：先调 check-phone 校验（不消耗短信额度）：
				// - 登录场景下未注册 → 引导跳注册
				// - 注册场景下已注册 → 引导跳登录
				try {
					const checkRes = await checkPhone(this.fullPhoneNumber)
					const checkData = (checkRes && checkRes.data) || {}
					if (this.scene === 'login' && !checkData.registered) {
						uni.showModal({
							title: '',
							content: this.i18n.t('error.phoneNotRegistered'),
							confirmText: this.i18n.t('common.confirm'),
							showCancel: false,
							success: () => {
								uni.redirectTo({ url: '/pages/login/register?scene=register' })
							}
						})
						return
					}
					if (this.scene === 'register' && checkData.registered) {
						uni.showModal({
							title: '',
							content: this.i18n.t('error.phoneAlreadyRegistered'),
							confirmText: this.i18n.t('common.confirm'),
							showCancel: false,
							success: () => {
								uni.redirectTo({ url: '/pages/login/sms?scene=login' })
							}
						})
						return
					}
				} catch (e) {
					console.warn('[sms-login] check-phone failed, fallback to send:', e)
				}
				// 校验通过，发送验证码（统一接口：SMS 优先，额度用完自动降级邮箱）
				const data = await sendSMSCode(this.fullPhoneNumber, this.scene)
				this.startCooldown()
				// 根据实际渠道展示不同 UI
				if (data && data.channel === 'email' && data.email) {
					// SMS 额度用完，后端已自动降级到邮箱
					uni.showModal({
						title: '',
						content: this.i18n.t('login.codeSentToEmail', { email: data.email }),
						showCancel: false,
						confirmText: this.i18n.t('common.confirm')
					})
				} else {
					showToast(this.t('login.codeSent'))
				}
				// 剩 ≤1 条 SMS 配额 → 显著提示（800ms 后弹，避免和成功提示冲突）
				if (data && data.warning) {
					setTimeout(() => {
						uni.showModal({
							title: '',
							content: this.i18n.t('login.quotaWarning', { warning: data.warning }),
							showCancel: false,
							confirmText: this.i18n.t('common.confirm')
						})
					}, 800)
				}
			} catch (e) {
				console.error('[sms-login] sendCode failed:', e)
				// 短信额度用完 → 自动切换到邮箱模式 + 提示用户
				const code = e && (e.code || e.bizCode)
				// SMS 配额用完 + 未绑邮箱 → 引导用户绑邮箱
				if (code === 'SMS_QUOTA_NO_EMAIL') {
					uni.showModal({
						title: '',
						content: this.i18n.t('login.quotaExhausted'),
						showCancel: false,
						confirmText: this.i18n.t('common.confirm')
					})
					return
				}
				if (this.loginMode === 'sms' && (
					code === 'SMS_QUOTA_EXCEEDED' ||
					code === 'SMS_QUOTA_EXHAUSTED' ||
					code === 'RATE_LIMITED'
				)) {
					// 自动切换到邮箱登录模式
					this.loginMode = 'email'
					this.code = ''
					this.cooldown = 0
					if (this.cooldownTimer) {
						clearInterval(this.cooldownTimer)
						this.cooldownTimer = null
					}
					// 提示用户短信已用完，已切换到邮箱
					uni.showModal({
						title: '',
						content: this.i18n.t('login.smsQuotaExceededAutoSwitch'),
						showCancel: false,
						confirmText: this.i18n.t('common.confirm'),
					})
					return
				}
				showToast(resolveSMSErrorMessage(e))
			} finally {
				this.sendingCode = false
			}
		},

		// 启动 60s 倒计时
		startCooldown() {
			this.cooldown = 60
			this.cooldownTimer = setInterval(() => {
				this.cooldown--
				if (this.cooldown <= 0) {
					clearInterval(this.cooldownTimer)
					this.cooldownTimer = null
				}
			}, 1000)
		},

		// 切换 SMS / 邮箱模式
		toggleLoginMode() {
			this.loginMode = (this.loginMode === 'sms') ? 'email' : 'sms'
			this.code = ''        // 切换模式清空验证码（不同通道）
			this.cooldown = 0     // 重置倒计时
			if (this.cooldownTimer) {
				clearInterval(this.cooldownTimer)
				this.cooldownTimer = null
			}
		},

		// 登录
		async handleLogin() {
			if (!this.canLogin || this.logging) return
			this.logging = true
			try {
				// 邮箱模式 vs SMS 模式走不同接口
				const data = this.loginMode === 'email'
					? await loginByEmailCode(this.fullPhoneNumber, this.code)
					: await smsLogin(this.fullPhoneNumber, this.code, this.scene)
				if (data && data.access_token) {
					store.setToken(data.access_token)
					if (data.refresh_token) {
						try { uni.setStorageSync('siamfeast_refresh_token', data.refresh_token) } catch (e) {}
					}
					if (data.user) {
						store.setUserInfo(data.user)
					}
					// 通知 push.js 触发 cid 上报(用户登录后才允许上报)
					uni.$emit('loginSuccess')
					showToast(this.t('login.loginSuccess'))
					// 首次注册 → 弹出邀请码询问弹窗(关闭后再跳转)
					// 老用户 → 直接进首页
					setTimeout(() => {
						if (data.is_new_user) {
							this.showInviteDialog = true
						} else {
							uni.switchTab({ url: '/pages/index/index' })
						}
					}, 800)
				} else {
					showToast(this.t('login.loginFailed'))
				}
			} catch (e) {
				console.error('[sms-login] login failed:', e)
				const code = e && (e.code || e.bizCode)
				// 429 限流：邮箱登录接口 60s 限流，给用户明确提示
				if (code === 429 || code === 'RATE_LIMITED' || code === 'RATE_LIMIT_INTERVAL') {
					showToast(this.i18n.t('login.loginRateLimited'))
					return
				}
				// CODE_INVALID/CODE_NOT_SENT：输入框标红
				if (code === 'CODE_INVALID' || code === 'INVALID_VERIFY_CODE') {
					this.codeError = this.i18n.t('login.codeInvalid')
					return
				}
				if (code === 'CODE_NOT_SENT') {
					this.codeError = this.i18n.t('login.codeNotSent')
					return
				}
				showToast(resolveSMSErrorMessage(e))
			} finally {
				this.logging = false
			}
		},

		goBack() {
			uni.navigateBack()
		},
		goPasswordLogin() {
			uni.redirectTo({ url: '/pages/login/index' })
		},
		openAgreement(type) {
			uni.navigateTo({ url: `/pages/agreement/index?type=${type}` })
		},

		// ============ 新用户邀请码弹窗 ============

		// 关闭弹窗 → 不绑定邀请码 → 进首页
		handleSkipInvite() {
			this.showInviteDialog = false
			this.inviteCode = ''
			this.goHomeAfterLogin()
		},

		// 提交邀请码
		async handleSubmitInvite() {
			const code = (this.inviteCode || '').trim()
			if (!code) {
				showToast(this.t('login.inviteCodeRequired'))
				return
			}
			if (this.submittingInvite) return
			this.submittingInvite = true
			try {
				const res = await post('/referrals/bind', { invite_code: code })
				if (res && res.code === 0) {
					showToast(this.t('login.inviteCodeBound'))
					this.showInviteDialog = false
					this.inviteCode = ''
					setTimeout(() => this.goHomeAfterLogin(), 800)
				} else {
					showToast((res && res.message) || this.t('login.inviteCodeInvalid'))
				}
			} catch (e) {
				console.error('[sms-login] bind invite failed:', e)
				showToast((e && e.message) || this.t('login.inviteCodeInvalid'))
			} finally {
				this.submittingInvite = false
			}
		},

		goHomeAfterLogin() {
			uni.switchTab({ url: '/pages/index/index' })
		}
	}
}
</script>

<style scoped>
.sms-login-page {
	min-height: 100vh;
	background-color: #FFFFFF;
	display: flex;
	flex-direction: column;
}

.status-bar { width: 100%; }

.nav-bar {
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
}
.nav-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.back-icon { width: 20px; height: 20px; }
.nav-title { font-size: 32rpx; font-weight: 600; color: #3C3C3C; }
.nav-right { width: 32px; }

.content-section {
	flex: 1;
	padding: 24px 32px 0;
}

.logo-wrapper {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	overflow: hidden;
	background-color: #F7F7F7;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 20px auto 16px;
}
.logo { width: 100px; height: 100px; }

.hint-section {
	text-align: center;
	margin-bottom: 28px;
}
.hint-text {
	font-size: 26rpx;
	color: #828282;
}

.input-section {
	margin-bottom: 28px;
}

.phone-field {
	display: flex;
	align-items: center;
	height: 48px;
	background-color: #F5F5F5;
	border-radius: 12px;
	padding: 0 16px;
	margin-bottom: 12px;
}
.country-picker {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
	padding: 8rpx 0;
}
.country-flag { font-size: 40rpx; }
.country-code { font-size: 30rpx; color: #282332; font-weight: 500; }
.picker-arrow { font-size: 20rpx; color: #828282; margin-left: 6rpx; }
.phone-divider { width: 2rpx; height: 48rpx; background-color: #E0E0E0; margin: 0 24rpx; }
.phone-input { flex: 1; font-size: 30rpx; height: 96rpx; }

/* 国家选择器弹窗 */
.country-mask {
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
.country-sheet {
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
	line-height: 1;
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
.item-flag {
	font-size: 40rpx;
	margin-right: 20rpx;
}
.item-name {
	flex: 1;
	font-size: 30rpx;
	color: #1A1A1A;
}
.item-code {
	font-size: 28rpx;
	color: #828282;
	margin-right: 16rpx;
}
.item-check {
	font-size: 32rpx;
	color: #F2B131;
	font-weight: 600;
}

.code-field {
	display: flex;
	align-items: center;
	gap: 10px;
}
.code-input {
	flex: 1;
	height: 96rpx;
	background-color: #F5F5F5;
	border-radius: 24rpx;
	padding: 0 32rpx;
	font-size: 30rpx;
}
.send-btn {
	width: 220rpx;
	height: 96rpx;
	background-color: rgba(242, 177, 49, 0.15);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.send-btn.btn-disabled { opacity: 0.5; }
.send-text { font-size: 26rpx; color: #F2B131; font-weight: 600; }

.login-btn {
	height: 96rpx;
	background-color: #F2B131;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 16rpx;
}
.login-btn.btn-disabled { opacity: 0.5; }
.btn-text { font-size: 32rpx; font-weight: 700; color: #FFFFFF; }

.login-links {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	margin-top: 40rpx;
}
.switch-link { padding: 8rpx; }
.switch-text { font-size: 26rpx; color: #F2B131; }
.link-divider { font-size: 26rpx; color: #CCCCCC; }

.agreement {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	margin-top: auto;
	padding-bottom: 24px;
	padding-top: 24px;
}
.agreement-check { margin-right: 6px; }
.checkbox {
	width: 18px;
	height: 18px;
	border-radius: 4px;
	border: 1px solid #E0E0E0;
	display: flex;
	align-items: center;
	justify-content: center;
}
.checkbox-active { background-color: #F2B131; border-color: #F2B131; }
.check-icon { font-size: 12px; color: #FFFFFF; font-weight: 700; }
.agreement-text { font-size: 12px; color: #828282; }
.agreement-link { font-size: 12px; color: #019EFF; }

.safe-area-bottom {
	height: constant(safe-area-inset-bottom);
	height: env(safe-area-inset-bottom);
}

/* 新用户邀请码弹窗 */
.invite-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.6);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 48rpx;
}

.invite-dialog {
	width: 100%;
	max-width: 600rpx;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	padding: 48rpx 40rpx 32rpx;
	position: relative;
}

.invite-header {
	text-align: center;
	margin-bottom: 20rpx;
}

.invite-emoji {
	font-size: 80rpx;
	display: block;
	margin-bottom: 16rpx;
}

.invite-title {
	display: block;
	font-size: 34rpx;
	font-weight: 600;
	color: #1A1A1A;
}

.invite-desc {
	display: block;
	font-size: 26rpx;
	color: #828282;
	line-height: 1.5;
	text-align: center;
	margin-bottom: 32rpx;
	padding: 0 24rpx;
}

.invite-input-field {
	height: 96rpx;
	border: 2rpx solid #E0E0E0;
	border-radius: 16rpx;
	padding: 0 24rpx;
	margin-bottom: 32rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	background-color: #FAFAFA;
}

.invite-input {
	flex: 1;
	font-size: 30rpx;
	color: #1A1A1A;
	height: 96rpx;
}

.invite-buttons {
	display: flex;
	flex-direction: row;
	gap: 16rpx;
}

.invite-btn {
	flex: 1;
	height: 88rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.invite-btn-skip {
	background-color: #F5F5F5;
}

.invite-btn-submit {
	background-color: #F2B131;
}

.invite-btn-submit.btn-disabled {
	opacity: 0.5;
}

.invite-btn-text-skip {
	font-size: 28rpx;
	color: #666666;
}

.invite-btn-text-submit {
	font-size: 28rpx;
	color: #FFFFFF;
	font-weight: 600;
}
</style>
