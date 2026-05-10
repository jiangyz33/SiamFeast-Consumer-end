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
			<!-- 输入框区域 -->
			<view class="input-section">
				<!-- 手机号输入框 -->
				<view class="input-field" :style="{ borderColor: phoneFocused ? '#F2B131' : '#E0E0E0' }">
					<text class="phone-prefix">+66</text>
					<input
						class="input"
						type="text"
						:placeholder="t('login.phonePlaceholder')"
						placeholder-style="color: #828282;"
						v-model="phone"
						@focus="phoneFocused = true"
						@blur="phoneFocused = false"
					/>
				</view>

				<!-- 密码输入框 -->
				<view class="input-field" :style="{ borderColor: passwordFocused ? '#F2B131' : '#E0E0E0' }">
					<input
						class="input"
						:password="!showPassword"
						:placeholder="t('login.passwordPlaceholder')"
						placeholder-style="color: #828282;"
						v-model="password"
						@focus="passwordFocused = true"
						@blur="passwordFocused = false"
					/>
					<view class="password-toggle" @click="showPassword = !showPassword">
						<text class="toggle-text">{{ showPassword ? 'Hide' : 'Show' }}</text>
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

				<!-- 登录链接 -->
				<view class="login-links">
					<view class="switch-login" @click="goSmsLogin">
						<text class="switch-text">{{ t('login.codeLogin') }}</text>
					</view>
					<view class="register-link" @click="goRegister">
						<text class="register-text">{{ t('login.goRegister') }}</text>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider">
				<view class="divider-line"></view>
				<text class="divider-text">or</text>
				<view class="divider-line"></view>
			</view>

			<!-- 社交登录 -->
			<view class="social-section">
				<view class="social-buttons">
					<view class="social-btn google" @click="socialLogin('google')">
						<image class="social-icon-img" src="/static/icons/google.svg" mode="aspectFit"></image>
					</view>
					<view class="social-btn facebook" @click="socialLogin('facebook')">
						<image class="social-icon-img" src="/static/icons/facebook.svg" mode="aspectFit"></image>
					</view>
				</view>
			</view>

			<!-- 协议提示 -->
			<view class="agreement">
				<view class="agreement-check" @click="agreed = !agreed">
					<view class="checkbox" :class="{ 'checkbox-active': agreed }">
						<text v-if="agreed" class="check-icon">✓</text>
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
	</view>
</template>

<script>
import { validatePhone, showToast } from '@/utils/index.js'
import { loginByPassword } from '@/api/index.js'
import store from '@/store/index.js'
import i18n from '@/i18n/index.js'

export default {
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
			passwordFocused: false,
				langVersion: 0
		}
	},
	computed: {
		currentLangLabel() {
					this.langVersion; const lang = i18n.getLanguage()
				const labels = { zh: '中文', en: 'EN', th: 'ไทย' };
				return labels[lang] || 'EN';
			},
			canSubmit() {
			if (!validatePhone(this.phone)) return false
			if (!this.agreed) return false
			return this.password.length >= 6
		}
	},
	onLoad() {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20
				uni.$on("languageChanged", () => { this.langVersion++ })
		},
		onUnload() {
			uni.$off("languageChanged")
		},
	methods: {
			t(key, params) {
				this.langVersion; // reactive dependency
				return i18n.t(key, params)
			},
		// 处理登录
		async handleLogin() {
			if (!this.canSubmit || this.loading) return

			if (!validatePhone(this.phone)) {
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
					showToast(res.message || this.t('login.loginFailed'))
					return
				}

				// 保存登录信息
				if (res.data && res.data.access_token) {
					store.setToken(res.data.access_token)
					if (res.data.user) {
						store.setUserInfo(res.data.user)
					}
				}

				showToast(this.t('login.loginSuccess'))

				// 跳转到首页
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
					})
				}, 1500)
			} catch (e) {
				console.error('登录失败:', e)
				showToast(this.t('common.networkError'))
			} finally {
				this.loading = false
			}
		},

		// 验证码登录
		goSmsLogin() {
			if (!validatePhone(this.phone)) {
				showToast(this.t('login.phoneRequired'))
				return
			}
			uni.navigateTo({
				url: '/pages/login/verify?phone=' + encodeURIComponent(this.phone) + '&type=login'
			})
		},

		// 语言切换
			switchLanguage() {
				const langs = ['zh', 'en', 'th'];
				const current = i18n.getLanguage();
				const nextIdx = (langs.indexOf(current) + 1) % langs.length;
				i18n.setLanguage(langs[nextIdx]);
				showToast(this.t('language.switchSuccess'));
			},

			// 注册
			goRegister() {
				uni.navigateTo({
					url: '/pages/login/verify?type=register'
				})
			},

			// 社交登录
		socialLogin(platform) {
			if (!this.agreed) {
				showToast(this.t('login.agreementRequired'))
				return
			}
			showToast(`${platform} login coming soon`)
		},

		// 打开协议
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

	.lang-switch {
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

.input-section {
	/* 输入框区域 */
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

.switch-login {
	display: flex;
	justify-content: flex-end;
	margin-top: 20rpx;
	padding-right: 8rpx;
}

.switch-text {
	font-size: 26rpx;
	color: #019EFF;
}

.login-links {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20rpx;
		padding: 0 8rpx;
	}

	.register-link {
		display: flex;
		align-items: center;
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

.social-btn.google {
	border-color: #E0E0E0;
}

.social-btn.facebook {
	border-color: #E0E0E0;
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

.safe-area-bottom {
	height: constant(safe-area-inset-bottom);
	height: env(safe-area-inset-bottom);
}
</style>
