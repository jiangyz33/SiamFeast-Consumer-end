<template>
	<view v-if="visible" class="campaign-mask" @click="handleMaskClick">
		<view class="campaign-container" @click.stop>
			<!-- 关闭按钮 -->
			<view class="close-btn" @click="handleClose">
				<text class="close-text">×</text>
			</view>

			<scroll-view scroll-y class="campaign-scroll">
				<!-- 顶部 banner 大图 -->
				<view class="banner-section">
					<image
						v-if="campaign.image_url"
						class="banner-image"
						:src="campaign.image_url"
						mode="aspectFill"
					></image>
					<view v-else class="banner-placeholder">
						<text class="banner-placeholder-text">{{ typeIcon }}</text>
					</view>
				</view>

				<!-- 活动标题 -->
				<view class="title-section">
					<view class="title-row">
						<text class="type-icon">{{ typeIcon }}</text>
						<text class="campaign-name">{{ campaignName }}</text>
					</view>
					<text class="campaign-period">{{ formatDateRange(campaign.start_date, campaign.end_date) }}</text>
					<view class="type-tag" :class="`type-tag-${campaign.type}`">
						<text class="type-tag-text">{{ typeName }}</text>
					</view>
				</view>

				<!-- DISCOUNT / FULL_REDUCTION:纯展示 -->
				<view v-if="isDiscountType" class="rules-section">
					<view class="section-header">
						<text class="section-title">{{ t('campaign.rules') }}</text>
						<view class="section-line"></view>
					</view>
					<text class="rules-desc">{{ rulesDescription }}</text>
					<view v-if="campaign.rules && campaign.rules.stackable === false" class="rules-hint">
						<text class="rules-hint-text">• {{ t('campaign.notStackable') }}</text>
					</view>
					<view class="rules-hint">
						<text class="rules-hint-text">• {{ t('campaign.autoApply') }}</text>
					</view>
				</view>

				<!-- COUPON_GRANT:可领优惠券列表 -->
				<view v-if="isCouponGrantType" class="coupons-section">
					<view class="section-header">
						<text class="section-title">{{ t('campaign.claimableCoupons') }}</text>
						<view class="section-line"></view>
					</view>

					<view v-if="loadingCoupons" class="loading-row">
						<text class="loading-text">{{ t('common.loading') }}</text>
					</view>

					<view v-else-if="claimableCoupons.length === 0" class="empty-row">
						<text class="empty-text">{{ t('campaign.noCoupons') }}</text>
					</view>

					<view v-else>
						<view
							v-for="coupon in claimableCoupons"
							:key="coupon.template_id"
							class="coupon-card"
						>
							<view class="coupon-left">
								<text class="coupon-value">{{ formatCouponValue(coupon) }}</text>
								<text v-if="coupon.min_amount > 0" class="coupon-threshold">
									{{ t('campaign.spendThreshold', { amount: coupon.min_amount }) }}
								</text>
								<text v-else class="coupon-threshold">{{ t('campaign.noThreshold') }}</text>
							</view>
							<view class="coupon-divider"></view>
							<view class="coupon-right">
								<text class="coupon-name">{{ getCouponName(coupon) }}</text>
								<text class="coupon-remaining">{{ t('campaign.remaining', { n: coupon.remaining, total: coupon.total_quantity }) }}</text>
								<view
									class="claim-btn"
									:class="{
										'claim-btn-disabled': !coupon.user_can_claim || claimingId === coupon.template_id,
										'claim-btn-done': coupon.user_claimed
									}"
									@click="handleClaim(coupon)"
								>
									<text class="claim-btn-text">
										{{ getCouponBtnText(coupon) }}
									</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 底部 CTA(仅 DISCOUNT/FULL_REDUCTION) -->
			<view v-if="isDiscountType" class="footer-cta">
				<view class="order-btn" @click="handleOrderNow">
					<text class="order-btn-text">{{ t('campaign.orderNow') }}</text>
				</view>
			</view>

			<!-- 底部:我的优惠券(仅 COUPON_GRANT) -->
			<view v-if="isCouponGrantType" class="footer-coupons-link" @click="handleViewMyCoupons">
				<text class="footer-coupons-text">{{ t('campaign.myCoupons') }} →</text>
			</view>
		</view>
	</view>
</template>

<script>
import {
	getCampaignClaimableCoupons,
	claimCoupon,
	mockClaimableCoupons,
	mockClaimCoupon,
	getCampaignTypeIcon,
	getCampaignTypeName,
	formatDateRange,
	resolveClaimErrorMessage,
	getLocalizedText
} from '@/utils/campaign.js'
import i18n from '@/i18n/index.js'

// ⚠️ 开发期用 mock,后端就绪后改成 false
const USE_MOCK = false

export default {
	name: 'CampaignDetailModal',
	props: {
		visible: { type: Boolean, default: false },
		campaign: { type: Object, default: () => ({}) }
	},
	data() {
		return {
			loadingCoupons: false,
			claimableCoupons: [],
			claimingId: null,  // 正在抢的 template_id,用于 loading
			langVersion: 0
		}
	},
	computed: {
		isDiscountType() {
			return this.campaign && (this.campaign.type === 'DISCOUNT' || this.campaign.type === 'FULL_REDUCTION')
		},
		isCouponGrantType() {
			return this.campaign && this.campaign.type === 'COUPON_GRANT'
		},
		typeIcon() {
			return getCampaignTypeIcon(this.campaign && this.campaign.type)
		},
		typeName() {
			return getCampaignTypeName(this.campaign && this.campaign.type)
		},
		campaignName() {
			return getLocalizedText(this.campaign, 'name')
		},
		rulesDescription() {
			const rules = this.campaign && this.campaign.rules
			if (!rules) return ''
			return getLocalizedText(rules, 'description')
		}
	},
	watch: {
		visible(val) {
			if (val && this.isCouponGrantType) {
				this.loadClaimableCoupons()
			} else if (!val) {
				// 关闭弹窗时重置
				this.claimableCoupons = []
				this.claimingId = null
			}
		}
	},
	methods: {
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		formatDateRange,
		getCouponName(coupon) {
			return getLocalizedText(coupon, 'name')
		},
		formatCouponValue(coupon) {
			if (coupon.coupon_type === 'PERCENTAGE') {
				const pct = Math.round((1 - coupon.discount_value) * 10)
				return `${pct}折`
			}
			return `฿${coupon.discount_value}`
		},
		getCouponBtnText(coupon) {
			if (this.claimingId === coupon.template_id) return this.t('common.loading')
			if (coupon.user_claimed) return this.t('campaign.claimed')
			if (coupon.remaining <= 0) return this.t('campaign.soldOut')
			if (!coupon.user_can_claim) return this.t('campaign.cannotClaim')
			return this.t('campaign.claimNow')
		},

		async loadClaimableCoupons() {
			if (!this.campaign || !this.campaign.id) return
			this.loadingCoupons = true
			try {
				const data = USE_MOCK
					? await mockClaimableCoupons(this.campaign.id)
					: await getCampaignClaimableCoupons(this.campaign.id)
				this.claimableCoupons = (data && data.coupons) || []
			} catch (e) {
				console.error('[campaign-modal] load coupons failed:', e)
				this.claimableCoupons = []
			} finally {
				this.loadingCoupons = false
			}
		},

		async handleClaim(coupon) {
			if (!coupon.user_can_claim || this.claimingId) return
			this.claimingId = coupon.template_id
			try {
				if (USE_MOCK) {
					await mockClaimCoupon(coupon.template_id)
				} else {
					await claimCoupon(coupon.template_id)
				}
				// 成功:本地更新
				coupon.user_claimed = true
				coupon.user_can_claim = false
				coupon.claimed_count += 1
				coupon.remaining = Math.max(0, coupon.remaining - 1)
				uni.showToast({ title: this.t('campaign.claimSuccess'), icon: 'success' })
				this.$emit('claimed', coupon)
			} catch (e) {
				console.error('[campaign-modal] claim failed:', e)
				const msg = resolveClaimErrorMessage(e)
				uni.showToast({ title: msg, icon: 'none' })
			} finally {
				this.claimingId = null
			}
		},

		handleOrderNow() {
			this.$emit('close')
			uni.switchTab({ url: '/pages/index/index' })
		},
		handleViewMyCoupons() {
			this.$emit('close')
			setTimeout(() => {
				uni.navigateTo({ url: '/pages/coupons/index' })
			}, 200)
		},
		handleMaskClick() {
			this.handleClose()
		},
		handleClose() {
			this.$emit('close')
		}
	}
}
</script>

<style scoped>
.campaign-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.7);
	z-index: 9998;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60rpx 32rpx;
}

.campaign-container {
	width: 100%;
	max-width: 680rpx;
	max-height: 85vh;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	overflow: hidden;
	position: relative;
	display: flex;
	flex-direction: column;
}

.close-btn {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background-color: rgba(0,0,0,0.4);
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

.campaign-scroll {
	flex: 1;
}

/* Banner 大图 */
.banner-section {
	width: 100%;
	height: 320rpx;
	background-color: #F5F5F5;
}

.banner-image {
	width: 100%;
	height: 100%;
}

.banner-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #F2B131 0%, #FF8A00 100%);
}

.banner-placeholder-text {
	font-size: 120rpx;
}

/* 标题区 */
.title-section {
	padding: 32rpx 32rpx 16rpx;
	position: relative;
}

.title-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 12rpx;
}

.type-icon {
	font-size: 36rpx;
	margin-right: 12rpx;
}

.campaign-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #1A1A1A;
	flex: 1;
	line-height: 1.3;
}

.campaign-period {
	display: block;
	font-size: 24rpx;
	color: #828282;
	margin-bottom: 16rpx;
}

.type-tag {
	align-self: flex-start;
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	margin-top: 4rpx;
}

.type-tag-DISCOUNT { background-color: #E3F2FD; }
.type-tag-FULL_REDUCTION { background-color: #FFF3E0; }
.type-tag-COUPON_GRANT { background-color: #F3E5F5; }

.type-tag-text {
	font-size: 22rpx;
	color: #1A1A1A;
}

/* 规则区 */
.rules-section {
	padding: 16rpx 32rpx 32rpx;
}

.section-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-right: 16rpx;
}

.section-line {
	flex: 1;
	height: 2rpx;
	background-color: #E0E0E0;
}

.rules-desc {
	display: block;
	font-size: 28rpx;
	color: #333333;
	line-height: 1.6;
	margin-bottom: 16rpx;
}

.rules-hint {
	margin-top: 8rpx;
}

.rules-hint-text {
	font-size: 24rpx;
	color: #828282;
	line-height: 1.6;
}

/* 领券区 */
.coupons-section {
	padding: 16rpx 32rpx 24rpx;
}

.loading-row, .empty-row {
	padding: 60rpx 0;
	text-align: center;
}

.loading-text, .empty-text {
	font-size: 26rpx;
	color: #828282;
}

.coupon-card {
	display: flex;
	flex-direction: row;
	height: 200rpx;
	background-color: #FFF8E1;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
	overflow: hidden;
	border: 2rpx solid #F2B131;
}

.coupon-left {
	width: 220rpx;
	padding: 24rpx 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #F2B131 0%, #FF8A00 100%);
}

.coupon-value {
	font-size: 48rpx;
	font-weight: 700;
	color: #FFFFFF;
	line-height: 1;
}

.coupon-threshold {
	font-size: 22rpx;
	color: rgba(255,255,255,0.9);
	margin-top: 8rpx;
	text-align: center;
}

.coupon-divider {
	width: 2rpx;
	height: 100%;
	background-color: rgba(242, 177, 49, 0.3);
	position: relative;
}

.coupon-divider::before, .coupon-divider::after {
	content: '';
	position: absolute;
	left: -8rpx;
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background-color: #FFFFFF;
}

.coupon-divider::before { top: -8rpx; }
.coupon-divider::after { bottom: -8rpx; }

.coupon-right {
	flex: 1;
	padding: 20rpx 24rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.coupon-name {
	font-size: 26rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-bottom: 8rpx;
	line-height: 1.3;
}

.coupon-remaining {
	font-size: 22rpx;
	color: #828282;
	margin-bottom: 12rpx;
}

.claim-btn {
	align-self: flex-end;
	padding: 8rpx 20rpx;
	border-radius: 24rpx;
	background-color: #F2B131;
}

.claim-btn-text {
	font-size: 24rpx;
	color: #FFFFFF;
	font-weight: 600;
}

.claim-btn-disabled {
	opacity: 0.5;
}

.claim-btn-done {
	background-color: #BDBDBD;
}

/* 底部 CTA */
.footer-cta {
	padding: 16rpx 32rpx 24rpx;
	border-top: 2rpx solid #F0F0F0;
}

.order-btn {
	height: 80rpx;
	background-color: #F2B131;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.order-btn-text {
	color: #FFFFFF;
	font-size: 30rpx;
	font-weight: 600;
}

.footer-coupons-link {
	padding: 20rpx 32rpx 28rpx;
	border-top: 2rpx solid #F0F0F0;
	text-align: center;
}

.footer-coupons-text {
	font-size: 26rpx;
	color: #F2B131;
	font-weight: 600;
}
</style>
