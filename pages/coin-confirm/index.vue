<template>
	<view class="confirm-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部品牌区（渐变 hero） -->
		<view class="hero" :style="{ paddingTop: statusBarHeight + 30 + 'px' }">
			<view class="hero-coin-wrap">
				<image class="hero-coin" src="/static/icons/redeem-coin.svg" mode="aspectFit"></image>
			</view>
			<text class="hero-title">{{ t('coinConfirm.title') }}</text>
			<text class="hero-subtitle">{{ t('coinConfirm.subtitle') }}</text>

			<!-- 倒计时进度条（贴 hero 底部） -->
			<view class="hero-progress" v-if="item && !handled">
				<view class="hero-progress-fill" :style="{ width: progressPercent + '%' }"></view>
			</view>
		</view>

		<!-- 内容卡（上浮叠压 hero） -->
		<view class="content-card">
			<!-- 授权单信息 -->
			<block v-if="item">
				<!-- 门店行 -->
				<view class="store-row">
					<view class="store-icon-wrap">
						<image class="store-icon" src="/static/icons/campaign-store.svg" mode="aspectFit"></image>
					</view>
					<view class="store-info">
						<text class="store-name">{{ storeName }}</text>
						<text class="store-sub" v-if="item.cashier_name">{{ t('coinConfirm.cashier') }} · {{ item.cashier_name }}</text>
					</view>
				</view>

				<!-- 核心金额区 -->
				<view class="amount-block">
					<text class="amount-label">{{ t('coinConfirm.deductLabel') }}</text>
					<view class="amount-main">
						<text class="amount-currency">฿</text>
						<text class="amount-value">{{ formatAmount(item.amount) }}</text>
					</view>
					<view class="amount-coins">
						<image class="amount-coins-icon" src="/static/icons/coin.svg" mode="aspectFit"></image>
						<text class="amount-coins-text">{{ t('coinConfirm.useCoins', { n: item.coins }) }}</text>
					</view>
				</view>

				<!-- 有效期行 -->
				<view class="time-row" v-if="!handled">
					<image class="time-icon" src="/static/icons/clock.svg" mode="aspectFit"></image>
					<text class="time-text" :class="{ 'time-urgent': countdown <= 30 }">
						{{ countdown > 0 ? t('coinConfirm.countdown', { n: countdown }) : t('coinConfirm.expired') }}
					</text>
				</view>
			</block>

			<!-- 加载中 -->
			<view class="state-block" v-else-if="loading">
				<text class="state-text">{{ t('common.loading') }}</text>
			</view>

			<!-- 无待确认 -->
			<view class="state-block" v-else>
				<image class="state-icon" src="/static/icons/check.svg" mode="aspectFit"></image>
				<text class="state-text">{{ t('coinConfirm.noPending') }}</text>
			</view>

			<!-- 处理结果 -->
			<view class="result-block" v-if="result === 'approved'">
				<view class="result-badge result-badge-approved">
					<image class="result-badge-icon" src="/static/icons/check.svg" mode="aspectFit"></image>
				</view>
				<text class="result-text approved">{{ t('coinConfirm.approvedText') }}</text>
			</view>
			<view class="result-block" v-if="result === 'denied'">
				<view class="result-badge result-badge-denied">
					<image class="result-badge-icon" src="/static/icons/delete.svg" mode="aspectFit"></image>
				</view>
				<text class="result-text denied">{{ t('coinConfirm.deniedText') }}</text>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-area" v-if="item && !handled">
			<view class="approve-btn" :class="{ 'approve-btn-disabled': submitting || countdown <= 0 }" @click="handleApprove">
				<text class="approve-btn-text">{{ submitting ? t('common.loading') : t('coinConfirm.approve') }}</text>
			</view>
			<view class="deny-btn" @click="handleDeny">
				<text class="deny-btn-text">{{ t('coinConfirm.deny') }}</text>
			</view>
		</view>

		<!-- 结果后的返回 -->
		<view class="action-area" v-if="handled">
			<view class="approve-btn" @click="goHome">
				<text class="approve-btn-text">{{ t('coinConfirm.backHome') }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import {
	getPendingCoinConfirmation,
	approveCoinConfirmation,
	denyCoinConfirmation
} from '@/api/services/coinConfirmation.js'

// 倒计时进度条：以进入页面时第一次拿到的 expires_in 为总量
const PROGRESS_TOTAL_SECONDS = 120

export default {
	name: 'CoinConfirm',
	data() {
		return {
			statusBarHeight: 0,
			loading: true,
			item: null,
			countdown: 0,
			initialSeconds: PROGRESS_TOTAL_SECONDS,
			timer: null,
			submitting: false,
			result: ''   // '' | 'approved' | 'denied'
		}
	},
	computed: {
		handled() {
			return this.result !== ''
		},
		// 门店名三语：按 APP 语言取，缺失回退
		storeName() {
			const it = this.item || {}
			const lang = i18n.getLanguage()
			return it['store_name_' + lang] || it.store_name || ''
		},
		// hero 底部倒计时进度条宽度（金色随时间收缩）
		progressPercent() {
			if (!this.initialSeconds) return 0
			return Math.max(0, Math.min(100, (this.countdown / this.initialSeconds) * 100))
		}
	},
	onLoad(options) {
		const sysInfo = uni.getSystemInfoSync()
		this.statusBarHeight = sysInfo.statusBarHeight || 0
		// 支持 auth_id 直达（推送 Data 携带）；仍以 pending 接口数据为准
		this.loadPending()
	},
	onShow() {
		// 从其他页面返回时刷新（处理过/过期后回来）
		if (!this.loading && !this.result) this.loadPending()
	},
	onUnload() {
		this.stopTimer()
	},
	beforeDestroy() {
		this.stopTimer()
	},
	methods: {
		t(key, params) {
			return i18n.t(key, params)
		},
		goHome() {
			uni.switchTab({ url: '/pages/index/index' })
		},
		formatAmount(v) {
			const n = Number(v) || 0
			return n % 1 === 0 ? n.toLocaleString() : n.toFixed(2)
		},

		async loadPending() {
			this.loading = true
			try {
				const res = await getPendingCoinConfirmation()
				if (res && res.code === 0 && res.data && res.data.item) {
					this.item = res.data.item
					const secs = Number(this.item.expires_in) || 120
					this.initialSeconds = Math.max(secs, 1)
					this.startTimer(secs)
				} else {
					this.item = null
					this.stopTimer()
				}
			} catch (e) {
				console.warn('[coin-confirm] loadPending failed:', e)
				this.item = null
			} finally {
				this.loading = false
			}
		},

		startTimer(seconds) {
			this.stopTimer()
			this.countdown = Math.max(0, seconds)
			this.timer = setInterval(() => {
				this.countdown--
				if (this.countdown <= 0) {
					this.stopTimer()
				}
			}, 1000)
		},

		stopTimer() {
			if (this.timer) {
				clearInterval(this.timer)
				this.timer = null
			}
		},

		async handleApprove() {
			if (this.submitting || this.countdown <= 0 || !this.item) return
			this.submitting = true
			try {
				await approveCoinConfirmation(this.item.auth_id)
				this.result = 'approved'
				this.stopTimer()
				uni.showToast({ title: this.t('coinConfirm.approvedText'), icon: 'success' })
			} catch (e) {
				this.handleConfirmError(e)
			} finally {
				this.submitting = false
			}
		},

		async handleDeny() {
			if (this.submitting || !this.item) return
			this.submitting = true
			try {
				await denyCoinConfirmation(this.item.auth_id)
				this.result = 'denied'
				this.stopTimer()
				uni.showToast({ title: this.t('coinConfirm.deniedText'), icon: 'none' })
			} catch (e) {
				this.handleConfirmError(e)
			} finally {
				this.submitting = false
			}
		},

		/**
		 * 409 COIN_CONFIRM_STATUS：已处理过或已过期 → 刷新 pending 同步最新状态
		 */
		handleConfirmError(e) {
			const code = e && (e.code || e.bizCode)
			if (code === 'COIN_CONFIRM_STATUS' || code === 409) {
				uni.showToast({ title: this.t('coinConfirm.statusConflict'), icon: 'none' })
				this.result = ''
				this.loadPending()
			} else {
				const msg = (e && e.message) || this.t('coinConfirm.operateFailed')
				uni.showToast({ title: msg, icon: 'none' })
			}
		}
	}
}
</script>

<style scoped>
.confirm-page {
	min-height: 100vh;
	background-color: #F6F7F9;
	display: flex;
	flex-direction: column;
}

/* ── 顶部品牌区 ── */
.hero {
	background: linear-gradient(160deg, #F2B131 0%, #E09A1B 62%, #D18C0E 100%);
	padding-bottom: 56rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	border-radius: 0 0 48rpx 48rpx;
}

.hero-coin-wrap {
	width: 132rpx;
	height: 132rpx;
	border-radius: 66rpx;
	background: rgba(255, 255, 255, 0.22);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.hero-coin {
	width: 96rpx;
	height: 96rpx;
}

.hero-title {
	margin-top: 24rpx;
	font-size: 40rpx;
	font-weight: 700;
	color: #FFFFFF;
	letter-spacing: 2rpx;
}

.hero-subtitle {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
	text-align: center;
	padding: 0 70rpx;
	line-height: 1.5;
}

/* 倒计时进度条 */
.hero-progress {
	margin-top: 28rpx;
	width: 320rpx;
	height: 8rpx;
	border-radius: 4rpx;
	background-color: rgba(255, 255, 255, 0.3);
	overflow: hidden;
}

.hero-progress-fill {
	height: 100%;
	border-radius: 4rpx;
	background-color: #FFFFFF;
	transition: width 1s linear;
}

/* ── 内容卡 ── */
.content-card {
	margin: -36rpx 32rpx 0;
	padding: 36rpx 36rpx 40rpx;
	background-color: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 8rpx 32rpx rgba(224, 154, 27, 0.12);
	position: relative;
}

/* 门店行 */
.store-row {
	display: flex;
	align-items: center;
	padding-bottom: 26rpx;
	border-bottom: 2rpx solid #F5F5F5;
}

.store-icon-wrap {
	width: 72rpx;
	height: 72rpx;
	border-radius: 20rpx;
	background: linear-gradient(150deg, #FFF6DE 0%, #FFE9B3 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.store-icon {
	width: 44rpx;
	height: 44rpx;
}

.store-info {
	margin-left: 20rpx;
	display: flex;
	flex-direction: column;
	flex: 1;
	overflow: hidden;
}

.store-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #1A1A1A;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.store-sub {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: #999999;
}

/* 核心金额区 */
.amount-block {
	padding: 36rpx 0 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.amount-label {
	font-size: 24rpx;
	color: #999999;
}

.amount-main {
	margin-top: 12rpx;
	display: flex;
	align-items: baseline;
}

.amount-currency {
	font-size: 40rpx;
	font-weight: 700;
	color: #D9534F;
	margin-right: 4rpx;
}

.amount-value {
	font-size: 88rpx;
	font-weight: 800;
	color: #D9534F;
	line-height: 1.1;
	letter-spacing: 2rpx;
}

.amount-coins {
	margin-top: 16rpx;
	display: flex;
	align-items: center;
	background-color: #FFF8E1;
	border-radius: 28rpx;
	padding: 8rpx 24rpx;
}

.amount-coins-icon {
	width: 30rpx;
	height: 30rpx;
	margin-right: 8rpx;
}

.amount-coins-text {
	font-size: 26rpx;
	color: #C2890F;
	font-weight: 600;
}

/* 有效期行 */
.time-row {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-top: 24rpx;
	border-top: 2rpx solid #F5F5F5;
}

.time-icon {
	width: 26rpx;
	height: 26rpx;
	margin-right: 8rpx;
	opacity: 0.6;
}

.time-text {
	font-size: 26rpx;
	color: #666666;
}

.time-urgent {
	color: #D9534F;
	font-weight: 600;
}

/* 空/加载态 */
.state-block {
	padding: 40rpx 0 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.state-icon {
	width: 64rpx;
	height: 64rpx;
	opacity: 0.45;
	margin-bottom: 16rpx;
}

.state-text {
	font-size: 26rpx;
	color: #999999;
}

/* 结果态 */
.result-block {
	padding: 30rpx 0 6rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.result-badge {
	width: 96rpx;
	height: 96rpx;
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.result-badge-approved {
	background-color: #E6F5ED;
}

.result-badge-denied {
	background-color: #F2F2F2;
}

.result-badge-icon {
	width: 48rpx;
	height: 48rpx;
}

.result-text {
	margin-top: 16rpx;
	font-size: 30rpx;
	font-weight: 600;
}

.result-text.approved {
	color: #2EA462;
}

.result-text.denied {
	color: #999999;
}

/* ── 操作区 ── */
.action-area {
	margin: 40rpx 32rpx 60rpx;
	display: flex;
	flex-direction: column;
}

.approve-btn {
	height: 96rpx;
	border-radius: 48rpx;
	background: linear-gradient(135deg, #F2B131 0%, #E09A1B 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10rpx 24rpx rgba(242, 177, 49, 0.35);
}

.approve-btn-disabled {
	background-color: #D9D9D9;
	box-shadow: none;
}

.approve-btn-text {
	font-size: 32rpx;
	color: #FFFFFF;
	font-weight: 700;
	letter-spacing: 2rpx;
}

.deny-btn {
	margin-top: 20rpx;
	height: 96rpx;
	border-radius: 48rpx;
	border: 2rpx solid #E0E0E0;
	background-color: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
}

.deny-btn-text {
	font-size: 30rpx;
	color: #999999;
}
</style>
