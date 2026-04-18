<template>
	<view class="upgrade-overlay" v-if="visible" @click.self="handleClose">
		<view class="upgrade-container">
			<!-- 背景光效 -->
			<view class="glow-bg">
				<view class="glow-ring glow-ring-1"></view>
				<view class="glow-ring glow-ring-2"></view>
				<view class="glow-ring glow-ring-3"></view>
			</view>

			<!-- 粒子效果 -->
			<view class="particles">
				<view
					v-for="i in 20"
					:key="i"
					class="particle"
					:style="{ animationDelay: (i * 0.1) + 's' }"
				></view>
			</view>

			<!-- 主内容 -->
			<view class="upgrade-content" :class="{ 'animate-in': animateIn }">
				<!-- 皇冠图标 -->
				<view class="crown-wrapper">
					<view class="crown-glow"></view>
					<view class="crown-icon">
						<text class="crown-text">♛</text>
					</view>
				</view>

				<!-- VIP 标识 -->
				<view class="vip-badge">
					<text class="vip-text">VIP</text>
				</view>

				<!-- 标题 -->
				<text class="upgrade-title">{{ i18n.t('upgrade.congratulations') }}</text>
				<text class="upgrade-subtitle">{{ i18n.t('upgrade.becomePlatinum') }}</text>

				<!-- 等级卡片 -->
				<view class="level-card">
					<view class="level-from">
						<text class="level-label">{{ i18n.t('upgrade.from') }}</text>
						<text class="level-name from-name">{{ i18n.t('member.normalMember') }}</text>
					</view>
					<view class="level-arrow">
						<view class="arrow-line"></view>
						<text class="arrow-head">▸</text>
						<view class="arrow-line"></view>
					</view>
					<view class="level-to">
						<text class="level-label">{{ i18n.t('upgrade.to') }}</text>
						<text class="level-name to-name">{{ i18n.t('member.platinumMember') }}</text>
					</view>
				</view>

				<!-- 权益列表 -->
				<view class="benefits-list">
					<view class="benefit-item" v-for="(item, idx) in benefits" :key="idx">
						<text class="benefit-check">✓</text>
						<text class="benefit-text">{{ item }}</text>
					</view>
				</view>

				<!-- 按钮 -->
				<view class="upgrade-btn" @click="handleClose">
					<text class="btn-label">{{ i18n.t('upgrade.enjoyNow') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'

export default {
	props: {
		visible: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			i18n: i18n,
			animateIn: false
		}
	},
	computed: {
		benefits() {
			return [
				this.i18n.t('upgrade.benefitBirthday'),
				this.i18n.t('upgrade.benefitDiscount'),
				this.i18n.t('upgrade.benefitPriority')
			]
		}
	},
	watch: {
		visible(val) {
			if (val) {
				setTimeout(() => {
					this.animateIn = true
				}, 100)
			} else {
				this.animateIn = false
			}
		}
	},
	methods: {
		handleClose() {
			this.animateIn = false
			setTimeout(() => {
				this.$emit('close')
			}, 300)
		}
	}
}
</script>

<style scoped>
.upgrade-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.75);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.upgrade-container {
	width: 320px;
	height: 460px;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	border-radius: 20px;
}

/* 背景光效 */
.glow-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(180deg, #1a0a00 0%, #3d1c00 30%, #6b3a10 60%, #936c2a 100%);
}

.glow-ring {
	position: absolute;
	top: 50%;
	left: 50%;
	border-radius: 50%;
	border: 2px solid rgba(242, 177, 49, 0.2);
	transform: translate(-50%, -50%);
	animation: glow-expand 2s ease-out infinite;
}

.glow-ring-1 {
	width: 100px;
	height: 100px;
	animation-delay: 0s;
}

.glow-ring-2 {
	width: 180px;
	height: 180px;
	animation-delay: 0.5s;
}

.glow-ring-3 {
	width: 260px;
	height: 260px;
	animation-delay: 1s;
}

@keyframes glow-expand {
	0% {
		opacity: 1;
		transform: translate(-50%, -50%) scale(0.8);
	}
	100% {
		opacity: 0;
		transform: translate(-50%, -50%) scale(1.5);
	}
}

/* 粒子效果 */
.particles {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
}

.particle {
	position: absolute;
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background-color: #FFD700;
	top: 50%;
	left: 50%;
	opacity: 0;
	animation: particle-float 3s ease-out infinite;
}

.particle:nth-child(odd) {
	background-color: #F2B131;
	width: 3px;
	height: 3px;
}

@keyframes particle-float {
	0% {
		opacity: 0;
		transform: translate(-50%, -50%) translate(0, 0) scale(0);
	}
	20% {
		opacity: 1;
		transform: translate(-50%, -50%) translate(var(--tx, 50px), var(--ty, -80px)) scale(1);
	}
	100% {
		opacity: 0;
		transform: translate(-50%, -50%) translate(var(--tx2, 30px), var(--ty2, -150px)) scale(0.3);
	}
}

.particle:nth-child(1) { --tx: 60px; --ty: -70px; --tx2: 80px; --ty2: -140px; }
.particle:nth-child(2) { --tx: -50px; --ty: -90px; --tx2: -70px; --ty2: -160px; }
.particle:nth-child(3) { --tx: 70px; --ty: -40px; --tx2: 100px; --ty2: -100px; }
.particle:nth-child(4) { --tx: -80px; --ty: -60px; --tx2: -110px; --ty2: -120px; }
.particle:nth-child(5) { --tx: 40px; --ty: -100px; --tx2: 20px; --ty2: -170px; }
.particle:nth-child(6) { --tx: -30px; --ty: -80px; --tx2: -50px; --ty2: -150px; }
.particle:nth-child(7) { --tx: 90px; --ty: -30px; --tx2: 120px; --ty2: -80px; }
.particle:nth-child(8) { --tx: -90px; --ty: -50px; --tx2: -120px; --ty2: -100px; }
.particle:nth-child(9) { --tx: 20px; --ty: -110px; --tx2: 0px; --ty2: -180px; }
.particle:nth-child(10) { --tx: -60px; --ty: -70px; --tx2: -40px; --ty2: -130px; }
.particle:nth-child(11) { --tx: 80px; --ty: -60px; --tx2: 60px; --ty2: -110px; }
.particle:nth-child(12) { --tx: -40px; --ty: -90px; --tx2: -80px; --ty2: -160px; }
.particle:nth-child(13) { --tx: 50px; --ty: -80px; --tx2: 70px; --ty2: -140px; }
.particle:nth-child(14) { --tx: -70px; --ty: -40px; --tx2: -90px; --ty2: -90px; }
.particle:nth-child(15) { --tx: 30px; --ty: -100px; --tx2: 10px; --ty2: -170px; }
.particle:nth-child(16) { --tx: -20px; --ty: -70px; --tx2: -60px; --ty2: -130px; }
.particle:nth-child(17) { --tx: 100px; --ty: -20px; --tx2: 80px; --ty2: -70px; }
.particle:nth-child(18) { --tx: -100px; --ty: -30px; --tx2: -80px; --ty2: -80px; }
.particle:nth-child(19) { --tx: 10px; --ty: -110px; --tx2: -20px; --ty2: -180px; }
.particle:nth-child(20) { --tx: -10px; --ty: -90px; --tx2: 30px; --ty2: -150px; }

/* 主内容 */
.upgrade-content {
	position: relative;
	z-index: 2;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30px 24px 40px;
	opacity: 0;
	transform: scale(0.6) translateY(30px);
	transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.upgrade-content.animate-in {
	opacity: 1;
	transform: scale(1) translateY(0);
}

/* 皇冠 */
.crown-wrapper {
	position: relative;
	margin-bottom: 12px;
}

.crown-glow {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 80px;
	height: 80px;
	transform: translate(-50%, -50%);
	background: radial-gradient(circle, rgba(242, 177, 49, 0.4) 0%, transparent 70%);
	border-radius: 50%;
	animation: crown-pulse 1.5s ease-in-out infinite;
}

@keyframes crown-pulse {
	0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
	50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
}

.crown-icon {
	width: 60px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: crown-bounce 0.8s ease-out 0.4s both;
}

.crown-text {
	font-size: 42px;
	color: #FFD700;
	text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

@keyframes crown-bounce {
	0% { transform: scale(0) rotate(-20deg); }
	50% { transform: scale(1.3) rotate(10deg); }
	70% { transform: scale(0.9) rotate(-5deg); }
	100% { transform: scale(1) rotate(0deg); }
}

/* VIP 标识 */
.vip-badge {
	background: linear-gradient(135deg, #FFD700 0%, #F2B131 50%, #c49a3c 100%);
	border-radius: 6px;
	padding: 4px 16px;
	margin-bottom: 16px;
	box-shadow: 0 2px 10px rgba(242, 177, 49, 0.5);
}

.vip-text {
	font-size: 18px;
	font-weight: 900;
	color: #1a0a00;
	letter-spacing: 4px;
}

/* 标题 */
.upgrade-title {
	font-size: 22px;
	font-weight: 700;
	color: #FFD700;
	margin-bottom: 6px;
	text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.upgrade-subtitle {
	font-size: 14px;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.85);
	margin-bottom: 20px;
}

/* 等级卡片 */
.level-card {
	display: flex;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 12px 16px;
	margin-bottom: 16px;
	width: 100%;
}

.level-from,
.level-to {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.level-label {
	font-size: 10px;
	color: rgba(255, 255, 255, 0.5);
}

.level-name {
	font-size: 14px;
	font-weight: 600;
}

.from-name {
	color: rgba(255, 255, 255, 0.6);
}

.to-name {
	color: #FFD700;
	text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
}

.level-arrow {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 0 8px;
}

.arrow-line {
	width: 12px;
	height: 1px;
	background-color: rgba(255, 215, 0, 0.4);
}

.arrow-head {
	color: #FFD700;
	font-size: 16px;
}

/* 权益列表 */
.benefits-list {
	width: 100%;
	margin-bottom: 24px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.benefit-item {
	display: flex;
	align-items: center;
	gap: 8px;
	background-color: rgba(255, 255, 255, 0.08);
	border-radius: 8px;
	padding: 8px 12px;
}

.benefit-check {
	font-size: 14px;
	color: #FFD700;
	font-weight: 700;
}

.benefit-text {
	font-size: 13px;
	color: rgba(255, 255, 255, 0.85);
}

/* 按钮 */
.upgrade-btn {
	background: linear-gradient(135deg, #FFD700 0%, #F2B131 50%, #c49a3c 100%);
	border-radius: 25px;
	padding: 12px 48px;
	box-shadow: 0 4px 15px rgba(242, 177, 49, 0.4);
}

.upgrade-btn:active {
	opacity: 0.8;
	transform: scale(0.96);
}

.btn-label {
	font-size: 16px;
	font-weight: 700;
	color: #1a0a00;
}
</style>
