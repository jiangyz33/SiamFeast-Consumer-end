<template>
	<view class="share-modal-overlay" v-if="visible" :data-lang="langVersion" @click.stop>
		<view class="share-modal-container" @click.stop>
			<!-- 关闭按钮 -->
			<view class="close-btn" @click="handleClose">
				<text class="close-icon">×</text>
			</view>

			<!-- 门店分享内容 -->
			<view class="share-content" v-if="shareInfo.type === 'shop'">
				<view class="share-header">
					<image class="share-image" :src="shareInfo.image || defaultImage" mode="aspectFill"></image>
					<view class="share-title-row">
						<text class="share-type-tag">{{ i18n.t('share.shopRecommend') }}</text>
						<text class="share-name">{{ shareInfo.name || i18n.t('share.shopDefaultName') }}</text>
						<text class="share-id">ID: {{ shareInfo.id }}</text>
					</view>
				</view>
				<view class="share-desc">
					<text class="desc-text">{{ i18n.t('share.shopDesc') }}</text>
				</view>
			</view>

			<!-- 菜品分享内容 -->
			<view class="share-content" v-else-if="shareInfo.type === 'product'">
				<view class="share-header">
					<image class="share-image" :src="shareInfo.image || defaultImage" mode="aspectFill"></image>
					<view class="share-title-row">
						<text class="share-type-tag">{{ i18n.t('share.productRecommend') }}</text>
						<text class="share-name">{{ shareInfo.name || i18n.t('share.productDefaultName') }}</text>
						<view class="share-price-row" v-if="shareInfo.price">
							<text class="share-price-label">฿</text>
							<text class="share-price">{{ shareInfo.price }}</text>
						</view>
						<text class="share-shop-name" v-if="shareInfo.shopName">{{ shareInfo.shopName }}</text>
						<text class="share-id">{{ i18n.t('share.productIdLabel') }}: {{ shareInfo.id }} | {{ i18n.t('share.shopIdLabel') }}: {{ shareInfo.shopId }}</text>
					</view>
				</view>
				<view class="share-desc">
					<text class="desc-text">{{ i18n.t('share.productDesc') }}</text>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="share-actions">
				<view class="action-btn primary-btn" @click="handleConfirm">
					<text class="btn-text">{{ i18n.t('share.viewNow') }}</text>
				</view>
				<view class="action-btn secondary-btn" @click="handleClose">
					<text class="btn-text">{{ i18n.t('share.cancel') }}</text>
				</view>
			</view>

			<!-- 提示信息 -->
			<view class="share-tip">
				<text class="tip-text">{{ i18n.t('share.linkCopied') }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { clearShareParams } from '@/utils/share.js'
import i18n from '@/i18n/index.js'

export default {
	name: 'ShareModal',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		shareInfo: {
			type: Object,
			default: () => ({
				type: '',
				id: '',
				shopId: '',
				name: '',
				price: undefined,
				image: '',
				shopName: ''
			})
		}
	},
	data() {
		return {
			i18n: i18n,
			defaultImage: '/static/images/img-placeholder.svg',
			langVersion: 0
		}
	},
	mounted() {
		uni.$on('languageChanged', this.onLanguageChanged)
	},
	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},
	methods: {
		onLanguageChanged() {
			this.langVersion++
		},

		handleClose() {
			clearShareParams()
			this.$emit('close')
		},

		handleConfirm() {
			this.$emit('confirm', this.shareInfo)
		}
	}
}
</script>

<style scoped>
.share-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.share-modal-container {
	width: 320px;
	background-color: #FFFFFF;
	border-radius: 16px;
	padding: 24px 20px;
	position: relative;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.close-btn {
	position: absolute;
	top: 12px;
	right: 12px;
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #F5F5F5;
	border-radius: 14px;
}

.close-icon {
	font-size: 20px;
	color: #666666;
	line-height: 1;
}

.share-content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.share-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
}

.share-image {
	width: 120px;
	height: 120px;
	border-radius: 12px;
	background-color: #F5F5F5;
}

.share-title-row {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
}

.share-type-tag {
	font-size: 12px;
	color: #FFFFFF;
	background-color: #F2B131;
	padding: 4px 12px;
	border-radius: 12px;
}

.share-name {
	font-size: 18px;
	font-weight: 700;
	color: #333333;
	text-align: center;
	max-width: 260px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.share-id {
	font-size: 11px;
	color: #999999;
}

.share-price-row {
	display: flex;
	align-items: baseline;
}

.share-price-label {
	font-size: 14px;
	font-weight: 600;
	color: #F2B131;
}

.share-price {
	font-size: 24px;
	font-weight: 700;
	color: #F2B131;
}

.share-shop-name {
	font-size: 13px;
	color: #666666;
}

.share-desc {
	margin-top: 12px;
	text-align: center;
}

.desc-text {
	font-size: 14px;
	color: #666666;
}

.share-actions {
	margin-top: 24px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.action-btn {
	height: 48px;
	border-radius: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.primary-btn {
	background-color: #F2B131;
}

.primary-btn .btn-text {
	font-size: 16px;
	font-weight: 600;
	color: #FFFFFF;
}

.secondary-btn {
	background-color: #F5F5F5;
}

.secondary-btn .btn-text {
	font-size: 16px;
	color: #666666;
}

.share-tip {
	margin-top: 16px;
	text-align: center;
}

.tip-text {
	font-size: 12px;
	color: #999999;
}
</style>
