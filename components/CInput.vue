<template>
	<view class="input-field" :style="{ borderColor: focused ? '#F2B131' : '#E0E0E0' }">
		<input
			class="input"
			:type="type"
			:placeholder="placeholder"
			:placeholder-style="'color: #828282;'"
			:value="modelValue"
			:maxlength="maxlength"
			:password="password && !showPassword"
			@input="onInput"
			@focus="onFocus"
			@blur="onBlur"
		/>
		<view v-if="password" class="password-toggle" @click="togglePassword">
			<text class="toggle-icon">{{ showPassword ? '隐藏' : '显示' }}</text>
		</view>
		<view v-if="rightText" class="right-text" @click="$emit('rightClick')">
			<text class="link-text">{{ rightText }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CInput',
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		placeholder: {
			type: String,
			default: '请输入'
		},
		type: {
			type: String,
			default: 'text'
		},
		password: {
			type: Boolean,
			default: false
		},
		maxlength: {
			type: Number,
			default: 100
		},
		rightText: {
			type: String,
			default: ''
		}
	},
	emits: ['update:modelValue', 'rightClick'],
	data() {
		return {
			focused: false,
			showPassword: false
		}
	},
	methods: {
		onInput(e) {
			this.$emit('update:modelValue', e.detail.value)
		},
		onFocus() {
			this.focused = true
		},
		onBlur() {
			this.focused = false
		},
		togglePassword() {
			this.showPassword = !this.showPassword
		}
	}
}
</script>

<style scoped>
.input-field {
	display: flex;
	align-items: center;
	flex-direction: row;
	height: 88rpx;
	background-color: #FFFFFF;
	border-radius: 16rpx;
	border: 2rpx solid #E0E0E0;
	padding: 0 32rpx;
	margin-bottom: 32rpx;
}

.input {
	flex: 1;
	font-size: 28rpx;
	color: #282332;
}

.password-toggle {
	padding: 16rpx;
}

.toggle-icon {
	font-size: 24rpx;
	color: #828282;
}

.right-text {
	padding: 16rpx 0;
}

.link-text {
	font-size: 28rpx;
	color: #019EFF;
}
</style>
