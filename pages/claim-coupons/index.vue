<template>
	<view class="claim-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ i18n.t('coupons.claimCenter') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="coupon-list" scroll-y :style="{ height: contentHeight + 'px' }">
			<view class="list-container">
				<view v-if="claimableCoupons.length > 0">
					<view
						v-for="item in claimableCoupons"
						:key="'claim-' + item.id"
						class="coupon-card"
					>
						<!-- 左侧金额区域 -->
						<view class="coupon-left">
							<view class="coupon-amount">
								<text class="amount-symbol">฿</text>
								<text class="amount-num">{{ item.amount }}</text>
							</view>
							<text class="coupon-condition">{{ i18n.t('coupons.minSpend', { amount: item.minSpend }) }}</text>
						</view>

						<!-- 右侧信息区域 -->
						<view class="coupon-right">
							<view class="coupon-info">
								<text class="coupon-name">{{ item.name }}</text>
								<view class="coupon-type-tag">
									<text class="type-text">{{ getTypeName(item.tag) }}</text>
								</view>
							</view>
							<view class="coupon-validity">
								<text class="validity-text">{{ i18n.t('coupons.validDays', { days: item.validDays }) }}</text>
							</view>
							<view class="coupon-desc" v-if="item.description">
								<text class="desc-text">{{ item.description }}</text>
							</view>

							<view class="coupon-limit" v-if="item.perUserLimit > 0">
								<view class="limit-bar-bg">
									<view class="limit-bar-fill" :style="{ width: Math.min(item.claimedCount / item.perUserLimit * 100, 100) + '%' }"></view>
								</view>
								<text class="limit-text">{{ i18n.t("coupons.claimedCount", { claimed: item.claimedCount, total: item.perUserLimit }) }}</text>
							</view>
							<view class="coupon-action">
								<view class="claim-btn" @click="handleClaim(item)">
									<text class="claim-btn-text">{{ i18n.t('coupons.claim') }}</text>
								</view>
							</view>
						</view>

						<!-- 装饰圆形 -->
						<view class="circle-left"></view>
						<view class="circle-right"></view>
					</view>
				</view>

				<!-- 空状态 -->
				<view class="empty-state" v-if="!loading && claimableCoupons.length === 0">
					<image class="empty-icon" src="/static/images/empty-coupon.svg" mode="aspectFit"></image>
					<text class="empty-title">{{ i18n.t("common.empty.coupon") }}</text>
					<text class="empty-desc">{{ i18n.t("coupons.noClaimable") }}</text>
				</view>

				<!-- 加载状态 -->
				<view class="loading-state" v-if="loading">
					<text class="loading-text">{{ i18n.t("common.loading") }}</text>
				</view>
			</view>

			<view class="bottom-placeholder"></view>
		</scroll-view>
	</view>
</template>

<script>
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import { getReceivableCoupons, receiveCoupon, getMyCoupons } from '@/api/services/coupon.js'

export default {
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			claimableCoupons: [],
			loading: false
		}
	},
	onLoad() {
		this.initPage()
		this.loadData()
	},
	methods: {
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadData() {
			this.loading = true
			try {
				const [claimRes, myRes] = await Promise.allSettled([
					getReceivableCoupons(),
					getMyCoupons({ status: 'all' })
				])

				// Get my claimed template IDs for marking already-claimed
				let myTemplateIds = new Set()
				if (myRes.status === 'fulfilled' && myRes.value && myRes.value.code === 0 && myRes.value.data) {
					const raw = myRes.value.data
					const items = raw.items || raw.list || raw || []
					if (Array.isArray(items)) {
						myTemplateIds = new Set(items.map(c => c.template_id || (c.template && c.template.id) || c.id))
					}
				}

				if (claimRes.status === 'fulfilled' && claimRes.value && claimRes.value.code === 0 && claimRes.value.data) {
					const raw = claimRes.value.data
					const items = raw.items || raw.list || raw || []
					this.claimableCoupons = (Array.isArray(items) ? items : []).map(c => this.normalizeClaimable(c, myTemplateIds)).filter(Boolean)
				} else {
					this.claimableCoupons = []
				}
			} catch (e) {
				console.error('loadData error:', e)
			} finally {
				this.loading = false
			}
		},

		normalizeClaimable(c, myTemplateIds) {
				const alreadyClaimed = myTemplateIds.has(c.id) ||
					(c.per_user_limit && c.claimed_count >= c.per_user_limit)
				if (alreadyClaimed) return null
				return {
					id: c.id,
					name: c.name || '',
					amount: c.discount_value || c.amount || 0,
					minSpend: c.min_order_amount || c.min_amount || c.min_spend || 0,
					type: (c.coupon_tag || '').toLowerCase() || 'all',
					tag: c.coupon_tag || '',
					validDays: c.valid_days || 30,
					description: c.description || '',
					perUserLimit: c.per_user_limit || 0,
					claimedCount: c.claimed_count || 0
				}
			},

		getTypeName(tag) {
			if (tag === 'DINE_IN') return this.i18n.t('coupons.dineInOnly')
			if (tag === 'DELIVERY') return this.i18n.t('coupons.deliveryOnly')
			if (tag === 'GENERAL') return this.i18n.t('coupons.general')
			if (tag === 'dinein') return this.i18n.t('coupons.dineInOnly')
			if (tag === 'delivery') return this.i18n.t('coupons.deliveryOnly')
			return this.i18n.t('coupons.general')
		},

			async handleClaim(item) {
				try {
					const res = await receiveCoupon(item.id)
					if (res.code === 0) {
						showToast(this.i18n.t('coupons.claimSuccess'))
						const idx = this.claimableCoupons.findIndex(c => c.id === item.id)
						if (idx >= 0) this.claimableCoupons.splice(idx, 1)
					} else {
						showToast(res.message || this.i18n.t('coupons.claimFailed'))
					}
				} catch (e) {
					console.error('handleClaim error:', e)
					showToast(this.i18n.t('coupons.claimFailed'))
				}
			},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.claim-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #FFFFFF;
}

.nav-bar {
	height: 44px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
}

.nav-back {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 24px;
	height: 24px;
}

.nav-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}

.nav-right {
	width: 32px;
}

.coupon-list {
	flex: 1;
}

.list-container {
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

/* 优惠券卡片 */
.coupon-card {
	display: flex;
	background-color: #FFFFFF;
	border-radius: 8px;
	overflow: hidden;
	position: relative;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* 左侧金额区域 */
.coupon-left {
	width: 100px;
	background: linear-gradient(135deg, #F2B131 0%, #E5A42B 100%);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 16px 8px;
	position: relative;
}

.coupon-amount {
	display: flex;
	align-items: baseline;
}

.amount-symbol {
	font-size: 14px;
	font-weight: 600;
	color: #FFFFFF;
}

.amount-num {
	font-size: 36px;
	font-weight: 700;
	color: #FFFFFF;
	line-height: 1;
}

.coupon-condition {
	font-size: 10px;
	color: rgba(255, 255, 255, 0.85);
	margin-top: 4px;
}

/* 右侧信息区域 */
.coupon-right {
	flex: 1;
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	gap: 4px;
	border-left: 1px dashed rgba(0, 0, 0, 0.1);
	margin-left: -1px;
}

.coupon-info {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.coupon-name {
	font-size: 13px;
	font-weight: 600;
	color: #3C3C3C;
}

.coupon-type-tag {
	display: inline-flex;
	align-self: flex-start;
	align-items: center;
	justify-content: center;
	background-color: rgba(242, 177, 49, 0.15);
	padding: 3px 8px;
	border-radius: 4px;
	min-width: 40px;
}

.type-text {
	font-size: 10px;
	color: #F2B131;
}

.coupon-validity {
	margin-top: 2px;
}

.validity-text {
	font-size: 11px;
	color: #949494;
}

.coupon-desc {
	margin-top: 2px;
}

.desc-text {
	font-size: 11px;
	color: #949494;
}

.coupon-action {
	margin-top: 4px;
	display: flex;
	justify-content: flex-end;
}

.claim-btn {
	padding: 6px 18px;
	background: linear-gradient(135deg, #F2B131 0%, #E5A42B 100%);
	border-radius: 14px;
	box-shadow: 0 2px 6px rgba(242, 177, 49, 0.3);
}

.claim-btn:active {
	opacity: 0.85;
}

.claim-btn-text {
	font-size: 12px;
	font-weight: 600;
	color: #FFFFFF;
}

/* 限领进度 */
.coupon-limit {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 6px;
}

.limit-bar-bg {
	flex: 1;
	height: 4px;
	background-color: #F3F3F3;
	border-radius: 2px;
	overflow: hidden;
}

.limit-bar-fill {
	height: 100%;
	background: linear-gradient(90deg, #F2B131, #E5A42B);
	border-radius: 2px;
	transition: width 0.3s;
}

.limit-text {
	font-size: 10px;
	color: #F2B131;
	white-space: nowrap;
}

/* 装饰圆形 - 优惠券锯齿边缘 */
.circle-left, .circle-right {
	position: absolute;
	width: 14px;
	height: 14px;
	background-color: #F3F3F3;
	border-radius: 50%;
	left: 93px;
}

.circle-left {
	top: -7px;
}

.circle-right {
	bottom: -7px;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 0;
}

.empty-icon {
	width: 80px;
	height: 80px;
	opacity: 0.5;
	margin-bottom: 16px;
}

.empty-title {
	font-size: 14px;
	color: #00000099;
}

.empty-desc {
	font-size: 12px;
	color: #949494;
	margin-top: 4px;
}

/* 加载状态 */
.loading-state {
	padding: 40px 0;
	display: flex;
	justify-content: center;
}

.loading-text {
	font-size: 12px;
	color: #949494;
}

.bottom-placeholder {
	height: 20px;
}
</style>
