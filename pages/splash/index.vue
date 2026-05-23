<template>
	<view class="splash-page">
		<image class="splash-bg" src="/static/images/03_splash.png" mode="aspectFill"></image>
		<view class="splash-loading">
			<view class="dot dot1" :class="{ 'dot-animate': started }"></view>
			<view class="dot dot2" :class="{ 'dot-animate': started }"></view>
			<view class="dot dot3" :class="{ 'dot-animate': started }"></view>
		</view>
	</view>
</template>

<script>
	import { parseShareLink, clearShareParams } from '@/utils/share.js'

	export default {
		data() {
			return {
				started: false
			}
		},
		onLoad() {
			this.checkShareLink()
			setTimeout(() => { this.started = true }, 50)
			setTimeout(() => { this.goHome() }, 2200)
		},
		methods: {
			checkShareLink() {
				const shareInfo = parseShareLink()
				if (shareInfo) {
					getApp().globalData.shareInfo = shareInfo
				}
			},
			goHome() {
				uni.reLaunch({ url: '/pages/index/index' })
			}
		}
	}
</script>

<style scoped>
.splash-page {
	width: 100vw;
	height: 100vh;
	position: relative;
	overflow: hidden;
}

.splash-bg {
	width: 100%;
	height: 100%;
}

.splash-loading {
	position: absolute;
	bottom: 80px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	gap: 8px;
}

.dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.5);
}

.dot.dot-animate {
	animation: dotBounce 1.2s ease-in-out infinite;
}

.dot2.dot-animate {
	animation-delay: 0.2s;
}

.dot3.dot-animate {
	animation-delay: 0.4s;
}

@keyframes dotBounce {
	0%, 80%, 100% {
		transform: scale(1);
		opacity: 0.5;
	}
	40% {
		transform: scale(1.5);
		opacity: 1;
	}
}
</style>
