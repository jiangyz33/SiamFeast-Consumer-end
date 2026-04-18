<template>
	<view
		class="btn"
		:class="{ 'btn-disabled': disabled }"
		:style="{
			backgroundColor: bgColor,
			color: textColor,
			borderRadius: radius + 'rpx'
		}"
		@click="handleClick"
	>
		<text class="btn-text">{{ text }}</text>
	</view>
</template>

<script>
export default {
	name: 'CButton',
	props: {
		text: {
			type: String,
			default: '继续'
		},
		bgColor: {
			type: String,
			default: '#F2B131'
		},
		textColor: {
			type: String,
			default: 'rgba(0, 0, 0, 0.6)'
		},
		radius: {
			type: [Number, String],
			default: 16
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ['click'],
	methods: {
		handleClick() {
			if (!this.disabled) {
				this.$emit('click')
			}
		}
	}
}
</script>

<style scoped>
.btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 80rpx;
	width: 100%;
}

.btn-disabled {
	opacity: 0.5;
}

.btn-text {
	font-size: 32rpx;
	font-weight: 700;
}
</style>
