<template>
	<view class="change-phone-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('changePhone.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<scroll-view scroll-y class="content-scroll">
			<!-- 当前绑定 -->
			<view class="current-section">
				<text class="current-label">{{ t('changePhone.currentPhone') }}</text>
				<text class="current-phone">{{ maskPhone(currentPhone) }}</text>
			</view>

			<!-- 步骤 1:验证旧号 -->
			<view class="step-section" v-if="step === 1">
				<view class="step-header">
					<view class="step-num">1</view>
					<text class="step-title">{{ t('changePhone.step1Title') }}</text>
				</view>

				<view class="input-row">
					<input
						class="phone-input"
						type="number"
						:maxlength="20"
						v-model="oldPhoneInput"
						:placeholder="t('changePhone.oldPhonePlaceholder')"
						placeholder-style="color: #BDBDBD;"
					/>
					<view
						class="send-btn"
						:class="{ 'btn-disabled': oldSending || oldCooldown > 0 }"
						@click="handleSendOldCode"
					>
						<text class="send-btn-text">
							{{ oldCooldown > 0 ? `${oldCooldown}s` : (oldSending ? t('common.loading') : t('changePhone.getOldCode')) }}
						</text>
					</view>
				</view>

				<view class="code-input-row">
					<input
						class="code-input"
						type="number"
						:maxlength="6"
						v-model="oldCode"
						:placeholder="t('changePhone.oldCodePlaceholder')"
						placeholder-style="color: #BDBDBD;"
					/>
				</view>

				<view
					class="next-btn"
					:class="{ 'btn-disabled': !canGoStep2 }"
					@click="goToStep2"
				>
					<text class="next-btn-text">{{ t('changePhone.next') }}</text>
				</view>
			</view>

			<!-- 步骤 1 完成提示(步骤 2 时显示) -->
			<view class="step-section step-done-section" v-if="step === 2">
				<view class="step-header">
					<view class="step-num step-num-done">✓</view>
					<text class="step-title">{{ t('changePhone.step1Title') }}</text>
					<text class="step-done-tag">{{ t('changePhone.verified') }}</text>
				</view>
			</view>

			<!-- 步骤 2:绑定新号 -->
			<view class="step-section" v-if="step === 2">
				<view class="step-header">
					<view class="step-num">2</view>
					<text class="step-title">{{ t('changePhone.step2Title') }}</text>
				</view>

				<view class="input-row">
					<view class="country-picker">
						<text class="country-flag">🇹🇭</text>
						<text class="country-code">+66</text>
					</view>
					<input
						class="new-phone-input"
						type="number"
						:maxlength="10"
						v-model="newPhoneInput"
						:placeholder="t('changePhone.newPhonePlaceholder')"
						placeholder-style="color: #BDBDBD;"
						@input="onNewPhoneInput"
					/>
					<view
						class="send-btn"
						:class="{ 'btn-disabled': newSending || newCooldown > 0 || !newPhoneInput }"
						@click="handleSendNewCode"
					>
						<text class="send-btn-text">
							{{ newCooldown > 0 ? `${newCooldown}s` : (newSending ? t('common.loading') : t('changePhone.getNewCode')) }}
						</text>
					</view>
				</view>

				<view class="code-input-row">
					<input
						class="code-input"
						type="number"
						:maxlength="6"
						v-model="newCode"
						:placeholder="t('changePhone.newCodePlaceholder')"
						placeholder-style="color: #BDBDBD;"
					/>
				</view>
			</view>

			<!-- 提示 -->
			<view class="hint-section">
				<text class="hint-text">• {{ t('changePhone.hint1') }}</text>
				<text class="hint-text">• {{ t('changePhone.hint2') }}</text>
			</view>

			<view style="height: 200rpx;"></view>
		</scroll-view>

		<!-- 底部按钮 -->
		<view class="footer">
			<view
				class="confirm-btn"
				:class="{ 'btn-disabled': !canSubmit || submitting }"
				@click="handleSubmit"
			>
				<text class="confirm-btn-text">{{ submitting ? t('common.loading') : t('changePhone.confirm') }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getUserInfo } from '@/api/services/auth.js'
import { sendChangePhoneSMS, changePhone } from '@/api/services/auth.js'
import { showToast } from '@/utils/index.js'
import store from '@/store/index.js'
import i18n from '@/i18n/index.js'

export default {
	data() {
		return {
			statusBarHeight: 20,
			currentPhone: '',
			oldPhoneInput: '',
			oldCode: '',
			newPhoneInput: '',
			newCode: '',
			oldSending: false,
			newSending: false,
			oldCooldown: 0,
			newCooldown: 0,
			oldTimer: null,
			newTimer: null,
			submitting: false,
			step: 1,  // 1 = 验证旧号,2 = 绑定新号
			langVersion: 0
		}
	},
	onLoad() {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 20
		this.loadCurrentPhone()
	},
	onUnload() {
		if (this.oldTimer) clearInterval(this.oldTimer)
		if (this.newTimer) clearInterval(this.newTimer)
	},
	computed: {
		fullNewPhone() {
			if (!this.newPhoneInput) return ''
			return '+66' + String(this.newPhoneInput).replace(/^0+/, '')
		},
		canGoStep2() {
			// 步骤 1 → 步骤 2 的条件:旧号填了 + 验证码 4-8 位
			return !!this.oldPhoneInput && /^\d{4,8}$/.test(this.oldCode)
		},
		canSubmit() {
			return this.oldPhoneInput
				&& this.oldCode
				&& this.newPhoneInput
				&& this.newCode
				&& /^\d{4,8}$/.test(this.oldCode)
				&& /^\d{4,8}$/.test(this.newCode)
		}
	},
	methods: {
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		maskPhone(phone) {
			if (!phone || phone.length < 6) return phone
			return phone.substring(0, 4) + '****' + phone.substring(phone.length - 2)
		},
		async loadCurrentPhone() {
			try {
				const userInfo = store.getUserInfo()
				if (userInfo && userInfo.phone) {
					this.currentPhone = userInfo.phone
					this.oldPhoneInput = userInfo.phone
					return
				}
				const res = await getUserInfo()
				if (res && res.code === 0 && res.data && res.data.phone) {
					this.currentPhone = res.data.phone
					this.oldPhoneInput = res.data.phone
				}
			} catch (e) {
				console.error('[change-phone] load phone failed:', e)
			}
		},
		onNewPhoneInput(e) {
			let val = (e.detail && e.detail.value) || ''
			val = String(val).replace(/[^\d]/g, '').slice(0, 10)
			this.newPhoneInput = val
		},
		startOldCooldown() {
			this.oldCooldown = 60
			this.oldTimer = setInterval(() => {
				this.oldCooldown--
				if (this.oldCooldown <= 0) {
					clearInterval(this.oldTimer)
					this.oldTimer = null
				}
			}, 1000)
		},
		startNewCooldown() {
			this.newCooldown = 60
			this.newTimer = setInterval(() => {
				this.newCooldown--
				if (this.newCooldown <= 0) {
					clearInterval(this.newTimer)
					this.newTimer = null
				}
			}, 1000)
		},
		goToStep2() {
			if (!this.canGoStep2) {
				showToast(this.t('changePhone.fillOldCodeFirst'))
				return
			}
			// 前端只做格式校验,实际旧码正确性由最终 /change-phone 接口校验
			this.step = 2
		},
		async handleSendOldCode() {
			if (this.oldSending || this.oldCooldown > 0) return
			if (!this.oldPhoneInput) {
				showToast(this.t('changePhone.errors.OLD_PHONE_MISMATCH'))
				return
			}
			this.oldSending = true
			try {
				const phone = String(this.oldPhoneInput).startsWith('+')
					? this.oldPhoneInput
					: '+66' + String(this.oldPhoneInput).replace(/^0+/, '')
				await sendChangePhoneSMS('old', phone)
				this.startOldCooldown()
				showToast(this.t('changePhone.codeSent'))
			} catch (e) {
				console.error('[change-phone] send old code failed:', e)
				this.handleSMSError(e)
			} finally {
				this.oldSending = false
			}
		},
		async handleSendNewCode() {
			if (this.newSending || this.newCooldown > 0 || !this.newPhoneInput) return
			if (!this.fullNewPhone) {
				showToast(this.t('changePhone.newPhonePlaceholder'))
				return
			}
			this.newSending = true
			try {
				await sendChangePhoneSMS('new', this.fullNewPhone)
				this.startNewCooldown()
				showToast(this.t('changePhone.codeSent'))
			} catch (e) {
				console.error('[change-phone] send new code failed:', e)
				this.handleSMSError(e)
			} finally {
				this.newSending = false
			}
		},
		handleSMSError(err) {
			const code = err && (err.code || err.bizCode)
			const errMap = {
				OLD_PHONE_MISMATCH: this.t('changePhone.errors.OLD_PHONE_MISMATCH'),
				NEW_PHONE_SAME_AS_OLD: this.t('changePhone.errors.NEW_PHONE_SAME_AS_OLD'),
				NO_PHONE_BOUND: this.t('changePhone.errors.NO_PHONE_BOUND'),
				PHONE_ALREADY_BOUND: this.t('changePhone.errors.PHONE_ALREADY_BOUND'),
				RATE_LIMITED: this.t('changePhone.errors.RATE_LIMITED'),
				INVALID_PHONE: this.t('changePhone.errors.INVALID_PHONE'),
				INVALID_TYPE: this.t('changePhone.errors.INVALID_TYPE')
			}
			const msg = (code && errMap[code]) || (err && err.message) || this.t('changePhone.errors.DEFAULT')
			showToast(msg)
		},
		async handleSubmit() {
			if (!this.canSubmit || this.submitting) return
			this.submitting = true
			try {
				const oldPhone = String(this.oldPhoneInput).startsWith('+')
					? this.oldPhoneInput
					: '+66' + String(this.oldPhoneInput).replace(/^0+/, '')

				const res = await changePhone(
					oldPhone,
					this.oldCode,
					this.fullNewPhone,
					this.newCode
				)

				if (res && res.code === 0) {
					// 成功:更新本地用户信息
					try {
						const userInfo = store.getUserInfo()
						if (userInfo) {
							userInfo.phone = this.fullNewPhone
							store.setUserInfo(userInfo)
						}
					} catch (e) {}

					uni.showToast({
						title: this.t('changePhone.success'),
						icon: 'success',
						duration: 1500
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					this.handleSubmitError(res)
				}
			} catch (e) {
				console.error('[change-phone] submit failed:', e)
				this.handleSubmitError(e)
			} finally {
				this.submitting = false
			}
		},
		handleSubmitError(err) {
			const code = err && (err.code || err.bizCode)
			const errMap = {
				OLD_PHONE_MISMATCH: this.t('changePhone.errors.OLD_PHONE_MISMATCH'),
				NEW_PHONE_SAME_AS_OLD: this.t('changePhone.errors.NEW_PHONE_SAME_AS_OLD'),
				OLD_CODE_INVALID: this.t('changePhone.errors.OLD_CODE_INVALID'),
				NEW_CODE_INVALID: this.t('changePhone.errors.NEW_CODE_INVALID'),
				NO_PHONE_BOUND: this.t('changePhone.errors.NO_PHONE_BOUND'),
				PHONE_ALREADY_BOUND: this.t('changePhone.errors.PHONE_ALREADY_BOUND'),
				PHONE_CHANGE_LIMIT: this.t('changePhone.errors.PHONE_CHANGE_LIMIT')
			}
			const msg = (code && errMap[code]) || (err && err.message) || this.t('changePhone.errors.DEFAULT')
			showToast(msg)
		},
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.change-phone-page {
	min-height: 100vh;
	background-color: #F5F5F5;
	display: flex;
	flex-direction: column;
}

.status-bar { width: 100%; }

.nav-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 32rpx;
	background-color: #FFFFFF;
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

.content-scroll { flex: 1; }

/* 当前绑定 */
.current-section {
	margin: 24rpx 32rpx;
	padding: 24rpx 28rpx;
	background-color: #FFF8E1;
	border-radius: 12rpx;
	border-left: 6rpx solid #F2B131;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.current-label {
	font-size: 26rpx;
	color: #666666;
}

.current-phone {
	font-size: 28rpx;
	color: #1A1A1A;
	font-weight: 600;
}

/* 步骤区 */
.step-section {
	margin: 0 32rpx 24rpx;
	padding: 32rpx 28rpx;
	background-color: #FFFFFF;
	border-radius: 16rpx;
}

.step-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 24rpx;
}

.step-num {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background-color: #F2B131;
	color: #FFFFFF;
	font-size: 24rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16rpx;
}

.step-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1A1A1A;
}

.step-num-done {
	background-color: #4CAF50 !important;
}

.step-done-section {
	opacity: 0.7;
}

.step-done-tag {
	margin-left: 16rpx;
	padding: 4rpx 16rpx;
	background-color: rgba(76, 175, 80, 0.15);
	color: #4CAF50;
	font-size: 22rpx;
	border-radius: 8rpx;
}

.next-btn {
	height: 88rpx;
	background-color: #F2B131;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 24rpx;
}

.next-btn.btn-disabled {
	opacity: 0.5;
}

.next-btn-text {
	color: #FFFFFF;
	font-size: 30rpx;
	font-weight: 600;
}

/* 输入行 */
.input-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.phone-input, .new-phone-input {
	flex: 1;
	height: 88rpx;
	background-color: #FAFAFA;
	border: 2rpx solid #E0E0E0;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #1A1A1A;
}

.country-picker {
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 88rpx;
	padding: 0 16rpx;
	background-color: #FAFAFA;
	border: 2rpx solid #E0E0E0;
	border-radius: 12rpx;
}

.country-flag { font-size: 32rpx; margin-right: 8rpx; }
.country-code { font-size: 28rpx; color: #1A1A1A; }

.send-btn {
	min-width: 180rpx;
	height: 88rpx;
	background-color: rgba(242, 177, 49, 0.15);
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 16rpx;
}

.send-btn.btn-disabled { opacity: 0.5; }

.send-btn-text {
	font-size: 24rpx;
	color: #F2B131;
	font-weight: 600;
}

/* 验证码输入 */
.code-input-row {
	margin-bottom: 8rpx;
}

.code-input {
	width: 100%;
	height: 88rpx;
	background-color: #FAFAFA;
	border: 2rpx solid #E0E0E0;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #1A1A1A;
	letter-spacing: 8rpx;
}

/* 提示 */
.hint-section {
	margin: 0 32rpx;
	padding: 16rpx 0;
}

.hint-text {
	display: block;
	font-size: 24rpx;
	color: #828282;
	line-height: 1.6;
	margin-bottom: 8rpx;
}

/* 底部按钮 */
.footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 16rpx 32rpx;
	background-color: #FFFFFF;
	box-shadow: 0 -2rpx 8rpx rgba(0,0,0,0.04);
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.confirm-btn {
	height: 96rpx;
	background-color: #F2B131;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.confirm-btn.btn-disabled { opacity: 0.5; }

.confirm-btn-text {
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
}
</style>
