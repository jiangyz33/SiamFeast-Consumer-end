<template>
	<view v-if="visible" class="crm-mask" @click="handleMaskClick">
		<view class="crm-container" @click.stop>
			<view class="close-btn" @click="handleClose">
				<text class="close-text">×</text>
			</view>

			<view class="crm-card">
				<view class="crm-header">
					<text class="crm-title">{{ t('coupons.offlineRedeemTitle') }}</text>
					<text class="crm-coupon-name">{{ coupon.name }}</text>
					<!-- FIXED：显示金额 -->
					<view class="crm-amount-row" v-if="coupon.amount && coupon.couponType !== 'PERCENT' && coupon.couponType !== 'ITEM'">
						<text class="crm-amount-symbol">฿</text>
						<text class="crm-amount">{{ coupon.amount }}</text>
					</view>
					<!-- PERCENT：显示折扣文案 -->
					<view class="crm-amount-row" v-else-if="coupon.couponType === 'PERCENT'">
						<text class="crm-amount">{{ formatPercentValue(coupon.amount) }}</text>
					</view>
					<!-- ITEM：不显示金额行 -->
				</view>

				<view class="crm-qr-wrap">
					<image v-if="qrImageUrl" class="crm-qr" :src="qrImageUrl" mode="aspectFit"></image>
					<view v-else class="crm-qr crm-qr-loading">
						<text class="crm-loading-text">...</text>
					</view>
				</view>

				<view class="crm-code-row" v-if="displayCode">
					<text class="crm-code-label">{{ t('coupons.couponIdLabel') }}</text>
					<text class="crm-code-value">{{ displayCode }}</text>
				</view>

				<text class="crm-hint">{{ t('coupons.offlineRedeemHint') }}</text>
				<text class="crm-hint-warning">⚠️ {{ t('coupons.redeemNoScreenshot') }}</text>
			</view>
		</view>
		<canvas :canvas-id="canvasId" style="position:fixed;left:-9999px;width:200px;height:200px;"></canvas>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import { generateQRImage } from '@/utils/qrcode.js'
import { getCouponDisplayCode } from '@/api/services/coupon.js'

export default {
	name: 'CouponRedeemModal',
	props: {
		visible: { type: Boolean, default: false },
		coupon: { type: Object, default: () => ({}) }
	},
	data() {
		return {
			langVersion: 0,
			qrImageUrl: '',
			displayCode: '',   // 15 位数字 Y（用于 QR 内容 + 明文展示）
			canvasId: 'qrCanvasCouponRedeem_' + Math.random().toString(36).slice(2, 8)
		}
	},
	watch: {
		visible(val) {
			if (val) {
				this.qrImageUrl = ''
				this.displayCode = ''
				this.$nextTick(() => { this.generateQR() })
			} else {
				this.qrImageUrl = ''
				this.displayCode = ''
			}
		}
	},
	methods: {
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		// PERCENT 折扣券格式化
		formatPercentValue(value) {
			const v = Number(value) || 0
			const lang = i18n.getLanguage()
			if (lang === 'zh') return `${(10 - v / 10).toFixed(1).replace('.0', '')}折`
			if (lang === 'th') return `ลด ${v}%`
			return `${v}% OFF`
		},
		async generateQR() {
			// QR 内容 = display_code（15 位数字 Y，Feistel 加密后的展示码）
			// 调 GET /coupons/:id/display 获取，比 user_coupon_id（自增整数，可枚举）安全
			const id = this.coupon && (this.coupon.userCouponId || this.coupon.id)
			if (!id) return
			try {
				const res = await getCouponDisplayCode(id)
				const code = res && res.data && res.data.display_code
				if (!code) {
					console.error('[coupon-redeem-modal] no display_code in response')
					return
				}
				this.displayCode = code
				this.qrImageUrl = await generateQRImage(code, {
					size: 200,
					canvasId: this.canvasId,
					componentInstance: this
				})
			} catch (e) {
				console.error('[coupon-redeem-modal] generateQR error:', e)
			}
		},
		handleClose() { this.$emit('close') },
		handleMaskClick() { this.$emit('close') }
	}
}
</script>

<style scoped>
.crm-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.7);
	z-index: 9998;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60rpx 32rpx;
}

.crm-container {
	width: 100%;
	max-width: 680rpx;
	max-height: 85vh;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	overflow: hidden;
	position: relative;
}

.close-btn {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}
.close-text {
	color: #828282;
	font-size: 40rpx;
	line-height: 1;
}

.crm-card {
	padding: 48rpx 32rpx 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.crm-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 24rpx;
}
.crm-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-bottom: 8rpx;
}
.crm-coupon-name {
	font-size: 26rpx;
	color: #6B6B6B;
	margin-bottom: 12rpx;
	text-align: center;
}
.crm-amount-row {
	display: flex;
	flex-direction: row;
	align-items: baseline;
}
.crm-amount-symbol {
	font-size: 28rpx;
	color: #DA3300;
	font-weight: 700;
	margin-right: 2rpx;
}
.crm-amount {
	font-size: 56rpx;
	color: #DA3300;
	font-weight: 700;
	line-height: 1;
}

.crm-qr-wrap {
	background-color: #FFFFFF;
	border-radius: 16rpx;
	padding: 16rpx;
	margin-bottom: 24rpx;
	border: 2rpx solid #F2B131;
}
.crm-qr {
	width: 360rpx;
	height: 360rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.crm-qr-loading {
	background-color: #FAFAFA;
}
.crm-loading-text {
	color: #ccc;
	font-size: 28rpx;
}

.crm-code-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 12rpx;
	padding: 12rpx 24rpx;
	background-color: #FFF8E1;
	border-radius: 12rpx;
	margin-bottom: 16rpx;
}
.crm-code-label {
	font-size: 24rpx;
	color: #828282;
}
.crm-code-value {
	font-size: 28rpx;
	font-weight: 700;
	color: #5D4037;
	letter-spacing: 2rpx;
}

.crm-hint {
	font-size: 24rpx;
	color: #828282;
	text-align: center;
	line-height: 1.5;
}

.crm-hint-warning {
	font-size: 22rpx;
	color: #B5750C;
	text-align: center;
	margin-top: 8rpx;
	line-height: 1.4;
}
</style>
