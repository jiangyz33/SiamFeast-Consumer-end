<template>
	<view class="social-container">
		<!-- 分隔线 -->
		<view class="divider">
			<view class="divider-line"></view>
			<text class="divider-text">or</text>
			<view class="divider-line"></view>
		</view>

		<!-- 社交登录按钮(海外版:Google;Facebook 暂未上线,先隐藏)-->
		<view class="social-buttons">
			<view class="social-btn" @click="handleSocialLogin('google')">
				<image class="social-icon" src="/static/icons/google.svg" mode="aspectFit"></image>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CSocialButtons',
	methods: {
		handleSocialLogin(platform) {
			this.$emit('login', platform)
		}
	}
}
</script>

<style scoped>
.social-container {
	width: 100%;
}

.divider {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin: 48rpx 0;
}

.divider-line {
	flex: 1;
	height: 2rpx;
	background-color: #E6E6E6;
}

.divider-text {
	font-size: 28rpx;
	color: #828282;
	padding: 0 32rpx;
}

.social-buttons {
	display: flex;
	flex-direction: row;
	justify-content: center;
	gap: 48rpx;
}

.social-btn {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background-color: #9191A633;
	display: flex;
	align-items: center;
	justify-content: center;
}

.social-icon {
	width: 48rpx;
	height: 48rpx;
}
</style>
