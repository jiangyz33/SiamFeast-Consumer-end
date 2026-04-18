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
				<!-- 我的优惠券区域 -->
				<view class="section-header" v-if="coupons.length > 0">
					<text class="section-title">我的优惠券</text>
					<text class="section-count">{{ coupons.length }}张</text>
				</view>
				<view
					v-for="item in currentCoupons"
					:key="'my-' + item.id"
					class="coupon-card"
					:class="{ 'coupon-expired': item.isExpired }"
				>
					<!-- 左侧金额区域 -->
					<view class="coupon-left">
						<view class="coupon-amount">
							<text class="amount-symbol">฿</text>
							<text class="amount-num">{{ item.amount }}</text>
						</view>
						<text class="coupon-condition">满{{ item.minSpend }}可用</text>
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
								<text class="use-text">去使用</text>
							</view>
						</view>
						<view class="coupon-action" v-else>
							<text class="expired-text">已过期</text>
						</view>
					</view>

					<!-- 装饰圆形 -->
					<view class="circle-left"></view>
					<view class="circle-right"></view>
				</view>

				<!-- 无我的优惠券提示 -->
				<view class="empty-section" v-if="!loading && coupons.length === 0 && claimableCoupons.length === 0">
					<text class="empty-text">暂无优惠券</text>
				</view>

				<!-- 领券中心区域 -->
				<view class="section-header claimable-header" v-if="claimableCoupons.length > 0">
					<text class="section-title">领券中心</text>
				</view>
				<view
					v-for="item in claimableCoupons"
					:key="'claim-' + item.id"
					class="coupon-card coupon-card-claimable"
				>
					<!-- 左侧金额区域 -->
					<view class="coupon-left">
						<view class="coupon-amount">
							<text class="amount-symbol">฿</text>
							<text class="amount-num">{{ item.amount }}</text>
						</view>
						<text class="coupon-condition">满{{ item.minSpend }}可用</text>
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
							<text class="validity-text">领取后{{ item.validDays }}天内有效</text>
						</view>
						<view class="coupon-desc" v-if="item.description">
							<text class="desc-text">{{ item.description }}</text>
						</view>
						<view class="coupon-action">
							<view class="claim-btn" v-if="!item.claimed" @click="handleClaim(item)">
								<text class="claim-btn-text">领取</text>
							</view>
							<view class="claimed-btn" v-else>
								<text class="claimed-btn-text">已领取</text>
							</view>
						</view>
					</view>

					<!-- 装饰圆形 -->
					<view class="circle-left"></view>
					<view class="circle-right"></view>
				</view>

				<!-- 加载状态 -->
				<view class="loading-state" v-if="loading">
					<text class="loading-text">加载中...</text>
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
import { getMyCoupons, getReceivableCoupons, receiveCoupon } from '@/api/services/coupon.js'

export default {
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			activeTab: 0,
			tabs: [
				{ name: '全部', type: 'all' },
				{ name: '仅限堂食', type: 'dinein' },
				{ name: '仅限外卖', type: 'delivery' }
			],
			coupons: [],
			claimableCoupons: [],
			loading: false
		}
	},
	computed: {
		currentCoupons() {
			const tabType = this.tabs[this.activeTab].type
			if (tabType === 'all') {
				return this.coupons
			}
			return this.coupons.filter(coupon => {
					const tag = (coupon.tag || '').toLowerCase()
					return tag === tabType || coupon.type === tabType
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
		},

		async loadData() {
			this.loading = true
			try {
				const [myRes, claimRes] = await Promise.allSettled([
					getMyCoupons({ status: 'all' }),
					getReceivableCoupons()
				])

				// 我的优惠券
				if (myRes.status === 'fulfilled' && myRes.value.code === 0 && myRes.value.data) {
					const items = myRes.value.data.items || myRes.value.data || []
					this.coupons = (Array.isArray(items) ? items : []).map(c => this.normalizeMyCoupon(c))
				}

				// 可领取优惠券
				if (claimRes.status === 'fulfilled' && claimRes.value.code === 0 && claimRes.value.data) {
					const items = claimRes.value.data.items || claimRes.value.data || []
					const myTemplateIds = new Set(this.coupons.map(c => c.templateId))
					this.claimableCoupons = (Array.isArray(items) ? items : []).map(c => this.normalizeClaimable(c, myTemplateIds))
				}
			} catch (e) {
				console.error('loadData error:', e)
			} finally {
				this.loading = false
			}
		},

		normalizeMyCoupon(c) {
			const tpl = c.template || {}
			const status = (c.status || '').toUpperCase()
			const validEnd = c.valid_end || ''
			const validStart = c.valid_start || ''

			let isExpired = false
			let isAvailable = false
			if (status === 'USED') {
				isExpired = true
			} else if (validEnd && new Date(validEnd) < new Date()) {
				isExpired = true
			} else if (status === 'UNUSED') {
				isAvailable = true
			}

			let validity = ''
			if (validStart && validEnd) {
				validity = validStart.substring(0, 10).replace(/-/g, '.') + ' - ' + validEnd.substring(0, 10).replace(/-/g, '.')
			} else if (validEnd) {
				validity = validEnd.substring(0, 10).replace(/-/g, '.') + ' 到期'
			}

			return {
				id: c.id,
				templateId: c.template_id || tpl.id || c.id,
				name: tpl.name || c.name || '',
				amount: tpl.discount_value || c.discount_value || c.amount || 0,
				minSpend: tpl.min_order_amount || c.min_order_amount || c.min_spend || 0,
				type: (tpl.coupon_tag || c.coupon_tag || '').toLowerCase() || 'all',
				tag: tpl.coupon_tag || '',
				validity: validity,
				description: tpl.description || c.description || '',
				isExpired: isExpired,
				isAvailable: isAvailable
			}
		},

		normalizeClaimable(c, myTemplateIds) {
			const alreadyClaimed = myTemplateIds.has(c.id) || 
				(c.per_user_limit && c.claimed_count >= c.per_user_limit)
			return {
				id: c.id,
				name: c.name || '',
				amount: c.discount_value || c.amount || 0,
				minSpend: c.min_order_amount || c.min_amount || c.min_spend || 0,
				type: (c.coupon_tag || '').toLowerCase() || 'all',
				tag: c.coupon_tag || '',
				validDays: c.valid_days || 30,
				validity: '',
				description: c.description || '',
				claimed: alreadyClaimed,
				isExpired: false,
				isAvailable: false
			}
		},

		getTypeName(tag) {
			if (tag === 'DINE_IN') return '仅限堂食'
			if (tag === 'DELIVERY') return '仅限外卖'
			if (tag === 'GENERAL') return '通用'
			if (tag === 'dinein') return '仅限堂食'
			if (tag === 'delivery') return '仅限外卖'
			return '通用'
		},

		goBack() {
			uni.navigateBack()
		},

		switchTab(index) {
			this.activeTab = index
		},

		async handleClaim(item) {
			if (item.claimed) return
			try {
				const res = await receiveCoupon(item.id)
				if (res.code === 0) {
					item.claimed = true
					showToast('领取成功')
					// 刷新我的优惠券列表
					await this.loadData()
				} else {
					showToast(res.message || '领取失败')
				}
			} catch (e) {
				console.error('handleClaim error:', e)
				showToast('领取失败')
			}
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

/* 区域标题 */
.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 4px 0;
}

.section-title {
	font-size: 14px;
	font-weight: 600;
	color: #3C3C3C;
}

.section-count {
	font-size: 12px;
	color: #949494;
}

.claimable-header {
	margin-top: 8px;
	padding-top: 8px;
	border-top: 1px dashed #E0E0E0;
}

/* 优惠券卡片 */
.coupon-card {
	display: flex;
	background-color: #FFFFFF;
	border-radius: 8px;
	overflow: hidden;
	position: relative;
}

.coupon-expired {
	opacity: 0.6;
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
	font-size: 32px;
	font-weight: 700;
	color: #FFFFFF;
}

.coupon-condition {
	font-size: 10px;
	color: #FFFFFF;
	margin-top: 4px;
}

/* 右侧信息区域 */
.coupon-right {
	flex: 1;
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
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
	background-color: #F2B131;
	padding: 6px 16px;
	border-radius: 14px;
}

.use-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
}

.claim-btn {
	background-color: #FF6B35;
	padding: 6px 16px;
	border-radius: 14px;
}

.claim-btn-text {
	font-size: 12px;
	font-weight: 500;
	color: #FFFFFF;
}

.claimed-btn {
	background-color: #C0C0C0;
	padding: 6px 16px;
	border-radius: 14px;
}

.claimed-btn-text {
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

/* 装饰圆形 */
.circle-left,
.circle-right {
	position: absolute;
	width: 16px;
	height: 16px;
	background-color: #F3F3F3;
	border-radius: 50%;
	top: 50%;
	transform: translateY(-50%);
}

.circle-left {
	left: 92px;
}

.circle-right {
	left: 92px;
}

/* 空状态 */
.empty-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 0;
}

.empty-text {
	font-size: 14px;
	color: #00000099;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}
</style>
