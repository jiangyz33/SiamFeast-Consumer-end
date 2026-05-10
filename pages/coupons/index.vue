<template>
	<view class="coupons-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ i18n.t('coupons.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 分类标签 -->
		<view class="category-tabs">
			<view
				v-for="(tab, index) in tabs"
				:key="index"
				class="tab-item"
				:class="{ 'tab-active': activeTab === index }"
				@click="switchTab(index)"
			>
				<text class="tab-text">{{ tab.name }}</text>
			</view>
		</view>

		<!-- 优惠券列表 -->
		<scroll-view class="coupon-list" scroll-y :style="{ height: contentHeight + 'px' }">
			<view class="list-container">
				<view
					v-for="item in currentCoupons"
					:key="'my-' + item.id"
					class="coupon-card"
					:class="{ 'coupon-expired': item.isExpired, 'coupon-locked': item.isLocked }"
				>
					<!-- 左侧金额区域 -->
					<view class="coupon-left">
						<view class="coupon-amount">
							<text class="amount-symbol">฿</text>
							<text class="amount-num">{{ item.amount }}</text>
						</view>
						<text class="coupon-condition">{{ i18n.t("coupons.minSpend", { amount: item.minSpend }) }}</text>
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
							<text class="validity-text">{{ item.validity }}</text>
						</view>
						<view class="coupon-desc" v-if="item.description">
							<text class="desc-text">{{ item.description }}</text>
						</view>
						<view class="coupon-action" v-if="item.isAvailable">
							<view class="use-btn" @click="handleUseCoupon(item)">
								<text class="use-text">{{ i18n.t("coupons.immediateUse") }}</text>
							</view>
						</view>
						<view class="coupon-action" v-else>
							<text class="expired-text">{{ getStatusLabel(item) }}</text>
						</view>
					</view>

					<!-- 装饰圆形 -->
					<view class="circle-left"></view>
					<view class="circle-right"></view>
				</view>

				<!-- 无优惠券提示 -->
				<view class="empty-section" v-if="!loading && currentCoupons.length === 0">
					<image class="empty-icon" src="/static/images/empty-coupon.svg" mode="aspectFit"></image>
					<text class="empty-title">{{ i18n.t("common.empty.coupon") }}</text>
					<text class="empty-desc">{{ i18n.t("common.empty.couponDesc") }}</text>
				</view>

				<!-- 加载状态 -->
				<view class="loading-state" v-if="loading">
					<text class="loading-text">{{ i18n.t("common.loading") }}</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>
	</view>
</template>

<script>
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import { getMyCoupons } from '@/api/services/coupon.js'

export default {
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			activeTab: 0,
			tabs: [],
			coupons: [],
			loading: false
		}
	},
	computed: {
		tabType() {
			return this.tabs[this.activeTab].type
		},
		currentCoupons() {
			if (this.tabType === 'all') return this.coupons
			return this.coupons.filter(c => {
				if (this.tabType === 'available') return c.isAvailable
				if (this.tabType === 'used') return c.isUsed
				if (this.tabType === 'expired') return c.isExpired && !c.isUsed
				return true
			})
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
			const tabsHeight = 44
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabsHeight - safeAreaBottom - this.statusBarHeight

			this.tabs = [
				{ name: this.i18n.t("coupons.tabAll"), type: "all" },
				{ name: this.i18n.t("coupons.available"), type: "available" },
				{ name: this.i18n.t("coupons.used"), type: "used" },
				{ name: this.i18n.t("coupons.expired"), type: "expired" }
			]
		},

		async loadData() {
			this.loading = true
			try {
				const res = await getMyCoupons({ status: 'all' })

				if (res && res.code === 0 && res.data) {
					const raw = res.data
					const items = raw.items || raw.list || raw || []
					this.coupons = (Array.isArray(items) ? items : []).map(c => this.normalizeCoupon(c))
				} else {
					this.coupons = []
				}
			} catch (e) {
				console.error('loadData error:', e)
				this.coupons = []
			} finally {
				this.loading = false
			}
		},

		normalizeCoupon(c) {
			const tpl = c.template || {}
			const status = (c.status || '').toUpperCase()
			const validEnd = c.valid_end || c.end_date || ''
			const validStart = c.valid_start || c.start_date || ''

			let isExpired = false
			let isAvailable = false
			let isUsed = false
			let isLocked = false

			if (status === 'USED') {
				isUsed = true
			} else if (status === 'LOCKED') {
				isLocked = true
			} else if (validEnd && new Date(validEnd) < new Date()) {
				isExpired = true
			} else if (status === 'UNUSED' || status === 'ACTIVE' || status === 'CLAIMED') {
				isAvailable = true
			}

			let validity = ''
			if (validStart && validEnd) {
				validity = validStart.substring(0, 10).replace(/-/g, '.') + ' - ' + validEnd.substring(0, 10).replace(/-/g, '.')
			} else if (validEnd) {
				validity = validEnd.substring(0, 10).replace(/-/g, '.') + ' ' + this.i18n.t('coupons.expireEnd')
			}

			return {
				id: c.id,
				name: tpl.name || c.name || '',
				amount: c.value || tpl.discount_value || c.discount_value || c.amount || 0,
				minSpend: tpl.min_order_amount || c.min_order_amount || c.min_spend || 0,
				type: (tpl.coupon_tag || c.coupon_tag || '').toLowerCase() || 'all',
				tag: tpl.coupon_tag || '',
				validity: validity,
				description: tpl.description || c.description || '',
				isExpired: isExpired,
				isAvailable: isAvailable,
				isUsed: isUsed,
				isLocked: isLocked
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

		getStatusLabel(item) {
			if (item.isUsed) return this.i18n.t('coupons.used')
			if (item.isLocked) return this.i18n.t('coupons.locked')
			return this.i18n.t('coupons.expired')
		},

		goBack() {
			uni.navigateBack()
		},

		switchTab(index) {
			this.activeTab = index
		},

		handleUseCoupon(item) {
			uni.navigateTo({
				url: '/pages/mall/index'
			})
		}
	}
}
</script>

<style scoped>
.coupons-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #FFFFFF;
}

/* 导航栏 */
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

/* 分类标签 */
.category-tabs {
	height: 44px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	padding: 0 16px;
	gap: 24px;
	border-bottom: 1px solid #F3F3F3;
}

.tab-item {
	padding: 8px 0;
	position: relative;
}

.tab-text {
	font-size: 14px;
	color: #828282;
}

.tab-active .tab-text {
	color: #F2B131;
	font-weight: 600;
}

.tab-active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 20px;
	height: 2px;
	background-color: #F2B131;
	border-radius: 1px;
}

/* 优惠券列表 */
.coupon-list {
	flex: 1;
}

.list-container {
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
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

.coupon-expired {
	opacity: 0.6;
}

	.coupon-locked {
		opacity: 0.75;
	}

	.coupon-locked .coupon-left {
		background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
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

.coupon-expired .coupon-left {
	background: linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%);
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
	font-weight: 800;
	color: #FFFFFF;
	line-height: 1;
}

.coupon-condition {
	font-size: 10px;
	color: #FFFFFF;
	margin-top: 4px;
}

/* 右侧信息区域 */
.coupon-right {
	flex: 1;
	padding: 14px 16px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	border-left: 1px dashed rgba(0, 0, 0, 0.1);
	margin-left: -1px;
}

.coupon-info {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.coupon-name {
	font-size: 14px;
	font-weight: 600;
	color: #3C3C3C;
}

.coupon-type-tag {
	display: inline-flex;
	align-self: flex-start;
	background-color: rgba(242, 177, 49, 0.15);
	padding: 2px 8px;
	border-radius: 4px;
}

.coupon-expired .coupon-type-tag {
	background-color: rgba(0, 0, 0, 0.08);
}

.type-text {
	font-size: 10px;
	color: #F2B131;
}

.coupon-expired .type-text {
	color: #949494;
}

.coupon-validity {
	margin-top: 4px;
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
	display: flex;
	justify-content: flex-end;
	margin-top: 4px;
}

.use-btn {
	background: linear-gradient(135deg, #F2B131 0%, #E5A42B 100%);
	padding: 6px 18px;
	border-radius: 14px;
	box-shadow: 0 2px 6px rgba(242, 177, 49, 0.3);
}

.use-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
}

.expired-text {
	font-size: 12px;
	color: #949494;
}

/* 加载状态 */
.loading-state {
	display: flex;
	justify-content: center;
	padding: 20px 0;
}

.loading-text {
	font-size: 14px;
	color: #00000099;
}

/* 装饰圆形 - 模拟优惠券锯齿边缘 */
.circle-left,
.circle-right {
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
.empty-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 0;
}

.empty-title {
	font-size: 15px;
	color: #333;
	font-weight: 500;
	margin-bottom: 6px;
}

.empty-desc {
	font-size: 13px;
	color: #999;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}
</style>
