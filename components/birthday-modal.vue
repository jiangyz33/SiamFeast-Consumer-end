<template>
	<view v-if="visible" class="birthday-mask" @click="handleMaskClick">
		<view class="birthday-dialog" @click.stop>
			<!-- 关闭按钮 -->
			<view class="close-btn" @click="handleClose">
				<text class="close-text">×</text>
			</view>

			<!-- 顶部装饰(蛋糕动画)-->
			<view class="hero-section">
				<view class="confetti confetti-1">🎉</view>
				<view class="confetti confetti-2">✨</view>
				<view class="confetti confetti-3">🎈</view>
				<view class="confetti confetti-4">⭐</view>
				<text class="cake-emoji">🎂</text>
			</view>

			<!-- 标题 -->
			<view class="title-section">
				<text class="main-title">{{ t('birthday.happyBirthday') }}</text>
				<text class="subtitle">{{ t('birthday.claimable') }}</text>
			</view>

			<!-- 奖励卡片 -->
			<view class="reward-card" :class="`reward-card-${rewardType}`">
				<text class="reward-icon">{{ rewardIcon }}</text>
				<view class="reward-info">
					<text class="reward-amount">{{ displayRewardAmount }}</text>
					<text class="reward-unit">{{ rewardUnit }}</text>
				</view>
			</view>

			<!-- 领取按钮 -->
			<view
				class="claim-btn"
				:class="{ 'btn-disabled': claiming }"
				@click="handleClaim"
			>
				<text class="claim-btn-text">
					{{ claiming ? t('common.loading') : t('birthday.claim') }}
				</text>
			</view>

			<!-- 提示 -->
			<text class="hint-text">{{ t('birthday.hint') }}</text>
		</view>

		<!-- 领取成功弹窗(覆盖在主弹窗上)-->
		<view v-if="claimResult" class="result-mask" @click.stop="closeResult">
			<view class="result-dialog" @click.stop>
				<text class="result-emoji">🎁</text>
				<text class="result-title">{{ t('birthday.claimSuccess') }}</text>
				<view class="result-reward">
					<text class="result-reward-icon">{{ rewardIcon }}</text>
					<text class="result-reward-amount">{{ claimResult.reward_amount }}</text>
					<text class="result-reward-unit">{{ rewardUnit }}</text>
				</view>
				<view class="result-btn" @click.stop="closeResult">
					<text class="result-btn-text">{{ t('common.confirm') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { claimBirthday } from '@/api/services/member.js'
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'

const REWARD_ICON = {
	COIN: '💰',
	POINT: '⭐',
	COUPON: '🎫'
}

export default {
	name: 'BirthdayModal',
	props: {
		visible: { type: Boolean, default: false },
		rewardType: { type: String, default: 'COIN' },
		rewardAmount: { type: Number, default: 0 }
	},
	data() {
		return {
			claiming: false,
			claimResult: null,
			langVersion: 0
		}
	},
	computed: {
		rewardIcon() {
			return REWARD_ICON[this.rewardType] || '🎁'
		},
		displayRewardAmount() {
			if (this.rewardType === 'COUPON') {
				return '1'
			}
			return String(this.rewardAmount || 0)
		},
		rewardUnit() {
			const lang = i18n.getLanguage?.() || 'zh'
			const units = {
				COIN: { zh: '金币', en: 'coins', th: 'เหรียญ' },
				POINT: { zh: '积分', en: 'pts', th: 'แต้ม' },
				COUPON: { zh: '张券', en: 'coupon', th: 'คูปอง' }
			}
			const u = units[this.rewardType]
			return u ? u[lang] : ''
		}
	},
	methods: {
		t(key) {
			void this.langVersion
			return i18n.t(key)
		},
		async handleClaim() {
			if (this.claiming) return
			this.claiming = true
			try {
				const res = await claimBirthday()
				if (res && res.code === 0 && res.data) {
					this.claimResult = res.data
					this.$emit('claimed', res.data)
				} else {
					this.handleClaimError(res)
				}
			} catch (e) {
				console.error('[birthday] claim failed:', e)
				this.handleClaimError(e)
			} finally {
				this.claiming = false
			}
		},
		handleClaimError(err) {
			const code = err && (err.code || err.bizCode)
			const errMap = {
				not_birthday_today: this.t('birthday.errors.not_birthday_today'),
				already_claimed: this.t('birthday.errors.already_claimed'),
				disabled: this.t('birthday.errors.disabled'),
				no_birthday: this.t('birthday.errors.no_birthday'),
				BIRTHDAY_COUPON_UNAVAILABLE: this.t('birthday.errors.BIRTHDAY_COUPON_UNAVAILABLE')
			}
			const msg = (code && errMap[code]) || (err && err.message) || this.t('birthday.errors.DEFAULT')
			showToast(msg)
			// 如果是 already_claimed 或 disabled,直接关闭弹窗
			if (code === 'already_claimed' || code === 'disabled' || code === 'not_birthday_today' || code === 'no_birthday') {
				setTimeout(() => this.handleClose(), 800)
			}
		},
		handleMaskClick() {
			// 不响应遮罩点击(强制点关闭按钮才关)
		},
		handleClose() {
			this.$emit('close')
		},
		closeResult() {
			this.claimResult = null
			this.$emit('close')
		}
	}
}
</script>

<style scoped>
.birthday-mask {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background-color: rgba(0,0,0,0.7);
	z-index: 9998;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 48rpx;
}

.birthday-dialog {
	width: 100%;
	max-width: 600rpx;
	background: linear-gradient(180deg, #FFE4B5 0%, #FFFFFF 60%);
	border-radius: 24rpx;
	padding: 48rpx 32rpx 32rpx;
	position: relative;
	text-align: center;
}

.close-btn {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background-color: rgba(0,0,0,0.1);
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-text {
	color: #666666;
	font-size: 40rpx;
	line-height: 1;
}

/* 顶部装饰 */
.hero-section {
	position: relative;
	height: 160rpx;
	margin-bottom: 24rpx;
}

.cake-emoji {
	font-size: 120rpx;
	display: block;
	line-height: 1;
	animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-12rpx); }
}

.confetti {
	position: absolute;
	font-size: 40rpx;
	opacity: 0.8;
	animation: floatUp 3s ease-out infinite;
}

.confetti-1 { top: 0; left: 40rpx; animation-delay: 0s; }
.confetti-2 { top: 20rpx; right: 60rpx; animation-delay: 0.5s; }
.confetti-3 { top: 60rpx; left: 80rpx; animation-delay: 1s; }
.confetti-4 { top: 40rpx; right: 40rpx; animation-delay: 1.5s; }

@keyframes floatUp {
	0% { transform: translateY(20rpx); opacity: 0; }
	20% { opacity: 1; }
	100% { transform: translateY(-40rpx); opacity: 0; }
}

/* 标题 */
.title-section {
	margin-bottom: 32rpx;
}

.main-title {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #FF6B9D;
	margin-bottom: 8rpx;
}

.subtitle {
	display: block;
	font-size: 26rpx;
	color: #666666;
}

/* 奖励卡片 */
.reward-card {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	padding: 32rpx 24rpx;
	border-radius: 16rpx;
	margin-bottom: 32rpx;
	background-color: #FFFFFF;
	border: 2rpx dashed #F2B131;
}

.reward-card-COIN {
	background: linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 100%);
}

.reward-card-POINT {
	background: linear-gradient(135deg, #F3E5F5 0%, #FFFFFF 100%);
}

.reward-card-COUPON {
	background: linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%);
}

.reward-icon {
	font-size: 56rpx;
	margin-right: 16rpx;
}

.reward-info {
	display: flex;
	flex-direction: row;
	align-items: baseline;
}

.reward-amount {
	font-size: 56rpx;
	font-weight: 700;
	color: #FF6B9D;
}

.reward-unit {
	font-size: 24rpx;
	color: #828282;
	margin-left: 8rpx;
}

/* 领取按钮 */
.claim-btn {
	height: 96rpx;
	background: linear-gradient(90deg, #FF6B9D 0%, #F2B131 100%);
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(255, 107, 157, 0.3);
}

.claim-btn.btn-disabled {
	opacity: 0.6;
}

.claim-btn-text {
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
}

.hint-text {
	display: block;
	font-size: 22rpx;
	color: #999999;
	margin-top: 8rpx;
}

/* 领取成功弹窗 */
.result-mask {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background-color: rgba(0,0,0,0.85);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 60rpx;
}

.result-dialog {
	width: 100%;
	max-width: 560rpx;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	padding: 48rpx 32rpx 32rpx;
	text-align: center;
}

.result-emoji {
	display: block;
	font-size: 100rpx;
	margin-bottom: 16rpx;
}

.result-title {
	display: block;
	font-size: 34rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-bottom: 24rpx;
}

.result-reward {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	padding: 24rpx;
	background-color: #FFF8E1;
	border-radius: 16rpx;
	margin-bottom: 32rpx;
}

.result-reward-icon {
	font-size: 48rpx;
	margin-right: 12rpx;
}

.result-reward-amount {
	font-size: 56rpx;
	font-weight: 700;
	color: #FF6B9D;
}

.result-reward-unit {
	font-size: 26rpx;
	color: #828282;
	margin-left: 8rpx;
}

.result-btn {
	height: 80rpx;
	background-color: #F2B131;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.result-btn-text {
	color: #FFFFFF;
	font-size: 30rpx;
	font-weight: 600;
}
</style>
