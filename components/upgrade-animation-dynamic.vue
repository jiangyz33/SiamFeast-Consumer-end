<template>
	<view v-if="visible" class="upgrade-mask" @click="handleMaskClick">
		<view
			class="upgrade-dialog"
			:style="{
				background: tier ? `linear-gradient(135deg, ${tier.color_primary || '#F2B131'} 0%, ${tier.color_secondary || '#FF8A00'} 100%)` : ''
			}"
			@click.stop
		>
			<!-- 关闭按钮 -->
			<view class="close-btn" @click="handleClose">
				<text class="close-text">×</text>
			</view>

			<!-- 顶部装饰（彩带动画） -->
			<view class="hero-section">
				<view class="confetti confetti-1">🎉</view>
				<view class="confetti confetti-2">✨</view>
				<view class="confetti confetti-3">🎈</view>
				<view class="confetti confetti-4">⭐</view>
				<text class="tier-icon">{{ tier ? (tier.icon || '⭐') : '⭐' }}</text>
			</view>

			<!-- 标题 -->
			<view class="title-section">
				<text class="main-title">{{ t('upgrade.congratsTitle') }}</text>
				<text class="subtitle">{{ tierName }}</text>
			</view>

			<!-- 奖励卡片（仅 tier.reward_type 有值时显示） -->
			<view v-if="tier && tier.reward_type && tier.reward_amount" class="reward-card">
				<text class="reward-emoji">{{ tier.reward_emoji || '🎁' }}</text>
				<text class="reward-text">{{ rewardText }}</text>
			</view>

			<!-- 知道了按钮（奖励已自动到账，不需要领取） -->
			<view class="got-it-btn" @click="handleClose">
				<text class="got-it-btn-text">{{ t('upgrade.gotIt') }}</text>
			</view>

			<!-- 提示 -->
			<text class="hint-text">{{ t('upgrade.rewardAutoGranted') }}</text>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'

export default {
	name: 'UpgradeAnimationDynamic',
	props: {
		visible: { type: Boolean, default: false },
		// 当前升到的档位配置对象（包含 code/name/icon/color/reward_*）
		tier: { type: Object, default: null }
	},
	data() {
		return { langVersion: 0 }
	},
	computed: {
		tierName() {
			if (!this.tier) return ''
			const lang = i18n.getLanguage()
			return this.tier['name_' + lang] || this.tier.name || ''
		},
		rewardText() {
			if (!this.tier) return ''
			const lang = i18n.getLanguage()
			return this.tier['reward_text_' + lang] || this.tier.reward_text || ''
		}
	},
	methods: {
		t(key) {
			void this.langVersion
			return i18n.t(key)
		},
		handleClose() { this.$emit('close') },
		handleMaskClick() { this.$emit('close') }
	}
}
</script>

<style scoped>
.upgrade-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.75);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60rpx 32rpx;
}

.upgrade-dialog {
	width: 100%;
	max-width: 600rpx;
	border-radius: 24rpx;
	padding: 60rpx 40rpx 40rpx;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
	overflow: hidden;
}

.close-btn {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}
.close-text {
	color: #FFFFFF;
	font-size: 40rpx;
	line-height: 1;
}

/* 顶部装饰 */
.hero-section {
	position: relative;
	width: 100%;
	height: 200rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16rpx;
}
.tier-icon {
	font-size: 160rpx;
	line-height: 1;
	filter: drop-shadow(0 4rpx 12rpx rgba(0, 0, 0, 0.2));
	animation: bounce-in 0.6s ease-out;
}
@keyframes bounce-in {
	0% { transform: scale(0); opacity: 0; }
	60% { transform: scale(1.2); }
	100% { transform: scale(1); opacity: 1; }
}

/* 彩带 */
.confetti {
	position: absolute;
	font-size: 40rpx;
	opacity: 0.8;
	animation: float-up 2s ease-out infinite;
}
.confetti-1 { top: 20rpx; left: 40rpx; animation-delay: 0s; }
.confetti-2 { top: 40rpx; right: 60rpx; animation-delay: 0.3s; }
.confetti-3 { bottom: 40rpx; left: 80rpx; animation-delay: 0.6s; }
.confetti-4 { bottom: 20rpx; right: 40rpx; animation-delay: 0.9s; }
@keyframes float-up {
	0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
	100% { transform: translateY(-30rpx) rotate(20deg); opacity: 0; }
}

/* 标题 */
.title-section {
	text-align: center;
	margin-bottom: 24rpx;
}
.main-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	opacity: 0.9;
	margin-bottom: 8rpx;
}
.subtitle {
	font-size: 48rpx;
	font-weight: 700;
	color: #FFFFFF;
	line-height: 1.2;
}

/* 奖励卡片 */
.reward-card {
	width: 100%;
	background-color: rgba(255, 255, 255, 0.25);
	border-radius: 16rpx;
	padding: 24rpx 32rpx;
	margin-bottom: 24rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 16rpx;
}
.reward-emoji {
	font-size: 56rpx;
	line-height: 1;
}
.reward-text {
	flex: 1;
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
	line-height: 1.4;
}

/* 知道了按钮 */
.got-it-btn {
	width: 100%;
	height: 88rpx;
	background-color: #FFFFFF;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}
.got-it-btn-text {
	font-size: 30rpx;
	font-weight: 700;
	color: #5D4037;
}

.hint-text {
	font-size: 22rpx;
	color: #FFFFFF;
	opacity: 0.7;
	text-align: center;
	line-height: 1.4;
}
</style>
