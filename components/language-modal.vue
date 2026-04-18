<template>
	<view class="language-modal" v-if="visible" @click="handleMaskClick">
		<view class="modal-content" @click.stop>
			<view class="modal-header">
				<text class="modal-title">{{ i18n.t('language.title') }}</text>
				<view class="close-btn" @click="handleClose">
					<text class="close-text">×</text>
				</view>
			</view>
			<view class="language-list">
				<view
					v-for="lang in languages"
					:key="lang.code"
					class="language-item"
					:class="{ 'language-active': currentLanguage === lang.code }"
					@click="handleSelectLanguage(lang.code)"
				>
					<text class="language-name">{{ lang.nativeName }}</text>
					<view class="check-icon" v-if="currentLanguage === lang.code">
						<text class="check-text">✓</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'

export default {
	name: 'LanguageModal',
	props: {
		visible: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			i18n: i18n,
			currentLanguage: i18n.getLanguage(),
			languages: i18n.getLanguages()
		}
	},
	methods: {
		handleMaskClick() {
			this.handleClose()
		},

		handleClose() {
			this.$emit('close')
		},

		handleSelectLanguage(code) {
			if (this.currentLanguage !== code) {
				this.currentLanguage = code
				i18n.setLanguage(code)
				this.$emit('change', code)
			}
			this.handleClose()
		}
	},
	watch: {
		visible(val) {
			if (val) {
				this.currentLanguage = i18n.getLanguage()
			}
		}
	}
}
</script>

<style scoped>
.language-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	width: 300px;
	background-color: #FFFFFF;
	border-radius: 12px;
	overflow: hidden;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	border-bottom: 1px solid #F3F3F3;
}

.modal-title {
	font-size: 16px;
	font-weight: 600;
	color: #000000CC;
}

.close-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-text {
	font-size: 24px;
	color: #00000066;
	line-height: 1;
}

.language-list {
	padding: 8px 0;
}

.language-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 16px;
	transition: background-color 0.2s;
}

.language-item:active {
	background-color: #F3F3F3;
}

.language-active {
	background-color: rgba(242, 177, 49, 0.08);
}

.language-name {
	font-size: 15px;
	color: #000000CC;
}

.language-active .language-name {
	color: #F2B131;
	font-weight: 500;
}

.check-icon {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-text {
	font-size: 18px;
	color: #F2B131;
	font-weight: 600;
}
</style>
