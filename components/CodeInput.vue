<template>
	<view class="code-input-container">
		<view class="code-boxes">
			<view
				v-for="(item, index) in codeLength"
				:key="index"
				class="code-box"
				:class="{ 'code-box-active': currentIndex === index }"
				@click="focusInput"
			>
				<text class="code-text">{{ code[index] || '' }}</text>
				<view v-if="currentIndex === index && focused" class="cursor"></view>
			</view>
		</view>
		<input
			ref="inputRef"
			class="hidden-input"
			type="number"
			:maxlength="codeLength"
			:value="code"
			:focus="autoFocus"
			@input="onInput"
			@focus="onFocus"
			@blur="onBlur"
		/>
	</view>
</template>

<script>
export default {
	name: 'CodeInput',
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		length: {
			type: Number,
			default: 5
		},
		autoFocus: {
			type: Boolean,
			default: true
		}
	},
	emits: ['update:modelValue', 'complete'],
	data() {
		return {
			focused: false,
			codeLength: this.length
		}
	},
	computed: {
		code() {
			return this.modelValue || ''
		},
		currentIndex() {
			return this.code.length
		}
	},
	methods: {
		onInput(e) {
			const value = e.detail.value.replace(/\D/g, '').slice(0, this.codeLength)
			this.$emit('update:modelValue', value)
			if (value.length === this.codeLength) {
				this.$emit('complete', value)
			}
		},
		onFocus() {
			this.focused = true
		},
		onBlur() {
			this.focused = false
		},
		focusInput() {
			this.$refs.inputRef && this.$refs.inputRef.focus()
		}
	}
}
</script>

<style scoped>
.code-input-container {
	position: relative;
	width: 100%;
}

.code-boxes {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 0 20rpx;
}

.code-box {
	width: 80rpx;
	height: 140rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom: 4rpx solid #E0E0E0;
	position: relative;
}

.code-box-active {
	border-bottom-color: #F2B131;
}

.code-text {
	font-size: 100rpx;
	font-weight: 700;
	color: #413C55;
	line-height: 1;
}

.cursor {
	position: absolute;
	bottom: 4rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 4rpx;
	height: 80rpx;
	background-color: #F2B131;
	animation: blink 1s infinite;
}

@keyframes blink {
	0%, 50% {
		opacity: 1;
	}
	51%, 100% {
		opacity: 0;
	}
}

.hidden-input {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	z-index: 10;
}
</style>
