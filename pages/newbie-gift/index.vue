<template>
	<view class="newbie-gift-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">新人礼包</text>
			<view class="nav-right"></view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-state" v-if="loading">
			<text class="loading-text">{{ t('common.loading') }}</text>
		</view>

		<!-- 内容区域 -->
		<scroll-view v-else class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 顶部横幅 -->
			<view class="banner-section">
				<image class="banner-image" src="/static/images/banner-placeholder.svg" mode="aspectFill"></image>
			</view>

			<!-- 礼包说明 -->
			<view class="intro-section">
				<text class="intro-title">{{ packInfo.pack_name || '新人专享福利' }}</text>
				<text class="intro-desc">{{ packInfo.pack_description || '注册即享多重好礼，超值优惠券等你来领' }}</text>
			</view>

			<!-- 已领取提示 -->
			<view class="claimed-tip" v-if="packInfo.is_received">
				<text class="claimed-tip-text">礼包已全部领取</text>
			</view>

			<!-- 优惠券列表 -->
			<view class="coupon-list">
				<view
					v-for="(item, index) in coupons"
					:key="index"
					class="coupon-item"
					:class="{ 'coupon-item-claimed': item.claimed }"
				>
					<view class="coupon-left">
						<view class="coupon-price">
							<text class="price-symbol">฿</text>
							<text class="price-num">{{ item.amount }}</text>
						</view>
						<text class="coupon-condition">满{{ item.min_spend }}可用</text>
					</view>
					<view class="coupon-divider"></view>
					<view class="coupon-right">
						<view class="coupon-info">
							<text class="coupon-name">{{ item.name }}</text>
							<text class="coupon-desc">有效期{{ item.validity_days }}天</text>
						</view>
						<view class="coupon-btn" @click="handleClaim(item, index)">
							<text class="coupon-btn-text">{{ item.claimed ? t('campaign.claimed') : t('campaign.claimNow') }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 一键领取 -->
			<view class="claim-all-section" v-if="!packInfo.is_received">
				<view class="claim-all-btn" @click="handleClaimAll">
					<text class="claim-all-text">一键领取全部</text>
				</view>
			</view>

			<!-- 使用规则 -->
			<view class="rules-section">
				<view class="rules-title">
					<text class="rules-title-text">使用规则</text>
				</view>
				<view class="rules-list">
					<text class="rules-item">1. 新用户注册后即可领取新人礼包优惠券；</text>
					<text class="rules-item">2. 每张优惠券仅限使用一次，不可叠加使用；</text>
					<text class="rules-item">3. 优惠券自领取之日起30天内有效；</text>
					<text class="rules-item">4. 优惠券仅限堂食和外卖订单使用；</text>
					<text class="rules-item">5. 本活动最终解释权归SiamFeast所有。</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="1"></custom-tabbar>
	</view>
</template>

<script>
import { getNewbiePack, receiveNewbiePack, receiveCoupon } from '@/api/services/coupon.js'
import { claimCampaign } from '@/api/services/campaign.js'
import { showToast } from '@/utils/index.js'
import CustomTabbar from '@/components/custom-tabbar.vue'

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			statusBarHeight: 20,
			contentHeight: 500,
			loading: true,
			packInfo: {
				pack_name: '',
				pack_description: '',
				is_received: false,
				total_value: 0
			},
			coupons: []
		}
	},
	onLoad() {
		this.initPage()
		this.loadNewbiePack()
	},
	methods: {
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadNewbiePack() {
			this.loading = true
			try {
				const res = await getNewbiePack()
				if (res.code === 0 && res.data) {
					// 后端返回: received(非is_received), coupons[].discount_value, min_order_amount
					const d = res.data
					this.packInfo = {
						pack_name: d.pack_name || '新人专享福利',
						pack_description: d.pack_description || '',
						is_received: d.is_received || d.received || false,
						total_value: d.total_value || 0
					}
					this.coupons = (d.coupons || []).map(c => ({
						...c,
						amount: c.discount_value || c.amount || 0,
						min_spend: c.min_order_amount || c.min_spend || 0,
						validity_days: c.valid_days || c.validity_days || 30,
						claimed: this.packInfo.is_received
					}))
				}
			} catch (e) {
				console.error('加载新人礼包失败:', e)
				showToast('加载失败')
			} finally {
				this.loading = false
			}
		},

		async handleClaim(item, index) {
			if (item.claimed) {
				showToast(i18n.t('campaign.claimed'))
				return
			}

			try {
				// 先尝试通过活动接口领取
				const res = await claimCampaign(item.id, { coupon_id: item.id })
				if (res.code === 0) {
					this.coupons[index].claimed = true
					showToast('领取成功')
				} else {
					// 降级：通过优惠券接口领取
					const couponRes = await receiveCoupon(item.id)
					if (couponRes.code === 0) {
						this.coupons[index].claimed = true
						showToast('领取成功')
					} else {
						showToast(couponRes.message || '领取失败')
					}
				}
			} catch (e) {
				console.error('领取优惠券失败:', e)
				showToast('领取失败')
			}
		},

		async handleClaimAll() {
			const unclaimed = this.coupons.filter(c => !c.claimed)
			if (unclaimed.length === 0) {
				showToast('已全部领取')
				return
			}

			try {
				// 先尝试一键领取接口
				const res = await receiveNewbiePack()
				if (res.code === 0) {
					this.coupons.forEach((c, i) => {
						this.coupons[i].claimed = true
					})
					this.packInfo.is_received = true
					showToast('全部领取成功')
				} else {
					showToast(res.message || '领取失败')
				}
			} catch (e) {
				console.error('一键领取失败:', e)
				// 降级：逐个领取
				try {
					await Promise.allSettled(
						unclaimed.map(item => receiveCoupon(item.id))
					)
					this.coupons.forEach((c, i) => {
						this.coupons[i].claimed = true
					})
					this.packInfo.is_received = true
					showToast('全部领取成功')
				} catch (e2) {
					showToast('领取失败')
				}
			}
		},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.newbie-gift-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #F2B131;
}

.nav-bar {
	height: 44px;
	background-color: #F2B131;
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
	color: #FFFFFF;
}

.nav-right {
	width: 32px;
}

.loading-state {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #F3F3F3;
}

.loading-text {
	font-size: 14px;
	color: #949494;
}

.content-scroll {
	flex: 1;
}

.banner-section {
	padding: 10px 16px;
}

.banner-image {
	width: 100%;
	height: 150px;
	border-radius: 12px;
}

.intro-section {
	padding: 0 16px 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}

.intro-title {
	font-size: 20px;
	font-weight: 700;
	color: #F35500;
}

.intro-desc {
	font-size: 14px;
	color: #666666;
}

.claimed-tip {
	padding: 8px 16px;
	display: flex;
	justify-content: center;
}

.claimed-tip-text {
	font-size: 14px;
	color: #949494;
}

.coupon-list {
	padding: 0 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.coupon-item {
	display: flex;
	align-items: center;
	height: 80px;
	background: linear-gradient(90deg, #FFB16D 0%, #F35500 100%);
	border-radius: 12px;
	padding: 0 4px;
}

.coupon-item-claimed {
	opacity: 0.6;
}

.coupon-left {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 16px;
	min-width: 80px;
}

.coupon-price {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 14px;
	font-weight: 700;
	color: #FFFFFF;
}

.price-num {
	font-size: 32px;
	font-weight: 700;
	color: #FFFFFF;
}

.coupon-condition {
	font-size: 10px;
	color: #FFFFFF;
}

.coupon-divider {
	width: 1px;
	height: 50px;
	background-color: rgba(255, 255, 255, 0.3);
}

.coupon-right {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 12px;
}

.coupon-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.coupon-name {
	font-size: 14px;
	font-weight: 500;
	color: #FFFFFF;
}

.coupon-desc {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.8);
}

.coupon-btn {
	background: linear-gradient(180deg, #FF9350 0%, #FF2D2D 100%);
	border-radius: 16px;
	padding: 8px 16px;
}

.coupon-btn-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
}

.claim-all-section {
	padding: 20px 16px;
	display: flex;
	justify-content: center;
}

.claim-all-btn {
	background: linear-gradient(90deg, #F2B131 0%, #F35500 100%);
	border-radius: 24px;
	padding: 14px 60px;
}

.claim-all-text {
	font-size: 16px;
	font-weight: 500;
	color: #FFFFFF;
}

.rules-section {
	margin: 0 16px;
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 16px;
}

.rules-title {
	margin-bottom: 12px;
}

.rules-title-text {
	font-size: 14px;
	font-weight: 700;
	color: #333333;
}

.rules-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.rules-item {
	font-size: 12px;
	color: #666666;
	line-height: 1.6;
}

.bottom-placeholder {
	height: 20px;
}
</style>
