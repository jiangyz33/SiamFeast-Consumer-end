<template>
	<view class="coupons-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('coupons.title') }}</text>
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
		<scroll-view class="coupon-list" scroll-y :style="{ height: contentHeight + 'px' }" @scrolltolower="loadMore" :lower-threshold="80">
			<view class="list-container">
				<view
					v-for="item in currentCoupons"
					:key="'my-' + item.id"
					class="coupon-card"
					:class="{ 'coupon-expired': item.isExpired, 'coupon-locked': item.isLocked }"
				>
					<!-- 左侧金额区域 -->
					<view class="coupon-left">
						<!-- ITEM 菜品券：无金额，显示碗图标 -->
						<view v-if="item.couponType === 'ITEM'" class="coupon-amount item-coupon-amount">
							<view class="item-coupon-icon">
								<svg viewBox="0 0 32 32" fill="currentColor">
									<path d="M4 14 L28 14 L26 24 Q26 27 23 27 L9 27 Q6 27 6 24 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
									<path d="M2 14 L30 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
									<path d="M10 10 Q10 7 12 7 Q12 5 14 5 M18 9 Q18 6 20 6 Q20 4 22 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
								</svg>
							</view>
						</view>
						<!-- PERCENT 折扣券：显示折扣文案 -->
						<view v-else-if="item.couponType === 'PERCENT'" class="coupon-amount">
							<text class="amount-num percent-text">{{ formatPercentValue(item.amount) }}</text>
						</view>
						<!-- FIXED 固定金额券 -->
						<view v-else class="coupon-amount">
							<text class="amount-symbol">฿</text>
							<text class="amount-num">{{ item.amount }}</text>
						</view>
						<text class="coupon-condition" v-if="item.couponType === 'ITEM'">{{ t('coupons.itemVoucher') }}</text>
						<text class="coupon-condition" v-else>{{ t("coupons.minSpend", { amount: item.minSpend }) }}</text>
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
						<!-- 移除「立即使用」按钮：通用券在堂食/外卖下单时自动可用，无需跳转。
							 只保留已用/已过期等状态文本（可用券不显示按钮）。 -->
						<view class="coupon-action" v-if="!item.isAvailable">
							<text class="expired-text">{{ getStatusLabel(item) }}</text>
						</view>
						<!-- 可用券：线下核销按钮（弹出二维码） -->
						<view class="coupon-action coupon-action-row" v-if="item.isAvailable">
							<view class="redeem-btn" @click="showRedeemModal(item)">
								<text class="redeem-btn-text">{{ t('coupons.offlineRedeem') }}</text>
							</view>
						</view>
					</view>

					<!-- 装饰圆形 -->
					<view class="circle-left"></view>
					<view class="circle-right"></view>
				</view>

				<!-- 无优惠券提示 -->
				<view class="empty-section" v-if="!loading && currentCoupons.length === 0">
					<image class="empty-icon" src="/static/images/empty-coupon.svg" mode="aspectFit"></image>
					<text class="empty-title">{{ t("common.empty.coupon") }}</text>
					<text class="empty-desc">{{ t("common.empty.couponDesc") }}</text>
				</view>

				<!-- 加载状态 -->
				<view class="loading-state" v-if="loading">
					<text class="loading-text">{{ t("common.loading") }}</text>
				</view>

				<!-- 加载更多 / 到底提示 -->
				<view class="loading-state" v-if="!loading && currentCoupons.length > 0">
					<text class="loading-text" v-if="loadingMore">{{ t("common.loading") }}</text>
					<text class="loading-text" v-else-if="noMore">{{ t("common.noMore") }}</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 线下核销二维码弹窗 -->
		<coupon-redeem-modal
			:visible="showRedeemModalFlag"
			:coupon="redeemCoupon"
			@close="showRedeemModalFlag = false"
		/>
	</view>
</template>

<script>
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import { getMyCoupons } from '@/api/services/coupon.js'
import CouponRedeemModal from '@/components/coupon-redeem-modal.vue'

export default {
	components: { CouponRedeemModal },
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			activeTab: 0,
			tabs: [],
			coupons: [],
			loading: false,
			showRedeemModalFlag: false,
			redeemCoupon: {},
			// 分页：默认拉满 200 条覆盖常见场景；超过则按需追加
			page: 1,
			pageSize: 200,
			total: 0,
			loadingMore: false,
			noMore: false
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
	created() {
		uni.$on('languageChanged', this.onLanguageChanged)
	},

	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},

	methods: {
		onLanguageChanged() {
			this.langVersion++
		},
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
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
			this.page = 1
			this.noMore = false
			try {
				const res = await getMyCoupons({ status: 'all', page: this.page, page_size: this.pageSize })

				if (res && res.code === 0 && res.data) {
					const raw = res.data
					const items = raw.items || raw.list || raw || []
					this.coupons = (Array.isArray(items) ? items : []).map(c => this.normalizeCoupon(c))
					// 分页元数据
					this.total = Number(raw.total) || this.coupons.length
					// 数据量不足一页 → 标记到底
					if (this.coupons.length < this.pageSize) this.noMore = true
				} else {
					this.coupons = []
					this.total = 0
				}
			} catch (e) {
				console.error('loadData error:', e)
				this.coupons = []
			} finally {
				this.loading = false
			}
		},

		// 分页加载更多
		async loadMore() {
			if (this.loadingMore || this.noMore || this.loading) return
			this.loadingMore = true
			try {
				const nextPage = this.page + 1
				const res = await getMyCoupons({ status: 'all', page: nextPage, page_size: this.pageSize })
				if (res && res.code === 0 && res.data) {
					const raw = res.data
					const items = raw.items || raw.list || raw || []
					const newOnes = (Array.isArray(items) ? items : []).map(c => this.normalizeCoupon(c))
					if (newOnes.length === 0) {
						this.noMore = true
					} else {
						this.coupons = this.coupons.concat(newOnes)
						this.page = nextPage
						if (newOnes.length < this.pageSize) this.noMore = true
					}
				} else {
					this.noMore = true
				}
			} catch (e) {
				console.error('loadMore error:', e)
			} finally {
				this.loadingMore = false
			}
		},

		normalizeCoupon(c) {
			const tpl = c.template || {}
			const lang = i18n.getLanguage()
			const status = (c.status || '').toUpperCase()
			// 有效期判定（按 valid_type 区分）：
			//   FIXED            → 用 valid_end（实例字段，user 领取时算）
			//   DAYS_AFTER_CLAIM → 不用模板 end_date（30 年占位，会显示成 2056），仅展示"领取后 N 天"
			//   未知 / 缺失       → 兜底用 valid_end || end_date（维持原行为）
			const validType = (c.valid_type || tpl.valid_type || '').toUpperCase()
			const validDays = Number(c.valid_days || tpl.valid_days || 0)
			// valid_end / valid_start：FIXED 时返回（券模板窗口）；DAYS_AFTER_CLAIM 时省略
			const validEnd = c.valid_end || ''
			const validStart = c.valid_start || ''
			// expire_at：用户实例真实到期日（领取 + valid_days，或 FIXED 的 valid_end）
			const expireAt = c.expire_at || ''

			let isExpired = false
			let isAvailable = false
			let isUsed = false
			let isLocked = false

			if (status === 'USED') {
				isUsed = true
			} else if (status === 'LOCKED') {
				isLocked = true
			} else if (expireAt && new Date(expireAt) < new Date()) {
				// 优先用 expire_at 判过期
				isExpired = true
			} else if (!expireAt && validEnd && new Date(validEnd) < new Date()) {
				// 兜底：FIXED 类型且后端没返回 expire_at 时，按 valid_end 判
				isExpired = true
			} else if (status === 'UNUSED' || status === 'ACTIVE' || status === 'CLAIMED') {
				isAvailable = true
			}

			// 渲染文案（按 8-04 回执优先级）：
			// 1. expire_at（用户实例真实到期日，最实用）
			// 2. valid_type + valid_days（DAYS_AFTER_CLAIM 时）
			// 3. valid_start + valid_end（FIXED 时）
			let validity = ''
			if (expireAt) {
				// 真实到期日：2026-09-01 → 「有效期至 2026.09.01」
				validity = expireAt.substring(0, 10).replace(/-/g, '.') + ' ' + this.i18n.t('coupons.expireEnd')
			} else if (validType === 'DAYS_AFTER_CLAIM' && validDays > 0) {
				// DAYS_AFTER_CLAIM 但后端没返回 expire_at 时，回退到规则展示
				validity = this.i18n.t('coupons.validDays', { days: validDays })
			} else if (validType === 'FIXED' && validStart && validEnd) {
				// FIXED：显示起止日期
				validity = validStart.substring(0, 10).replace(/-/g, '.') + ' - ' + validEnd.substring(0, 10).replace(/-/g, '.')
			}

			return {
				id: c.id,
				// 后端列表接口已返回 user_coupon_id，透传给 QR 弹窗使用（实例 ID，单人独有）
				userCouponId: c.user_coupon_id || c.id,
				name: tpl['name_' + lang] || tpl.name || c['name_' + lang] || c.name || '',
				amount: c.value || tpl.discount_value || c.discount_value || c.amount || 0,
				minSpend: tpl.min_order_amount || c.min_order_amount || c.min_spend || 0,
				type: (tpl.coupon_tag || c.coupon_tag || '').toLowerCase() || 'all',
				couponType: String(c.type || tpl.type || c.coupon_type || '').toUpperCase(),   // FIXED/PERCENT/ITEM
				tag: tpl.coupon_tag || '',
				validity: validity,
				description: tpl['description_' + lang] || tpl.description || c['description_' + lang] || c.description || '',
				isExpired: isExpired,
				isAvailable: isAvailable,
				isUsed: isUsed,
				isLocked: isLocked
			}
		},

		// PERCENT 折扣券格式化：30 → 中文"7折" / 英文"30% OFF" / 泰文"ลด 30%"
		formatPercentValue(value) {
			const v = Number(value) || 0
			const lang = i18n.getLanguage()
			if (lang === 'zh') return `${(10 - v / 10).toFixed(1).replace('.0', '')}折`
			if (lang === 'th') return `ลด ${v}%`
			return `${v}% OFF`
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

		showRedeemModal(item) {
			if (!item || !item.id) return
			this.redeemCoupon = item
			this.showRedeemModalFlag = true
		},

		goBack() {
			uni.navigateBack()
		},

		switchTab(index) {
			this.activeTab = index
		},
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
}

/* 菜品券特殊样式 */
.item-coupon-amount {
	justify-content: center;
}
.item-coupon-icon {
	width: 36px;
	height: 36px;
	color: #FFFFFF;
}
.item-coupon-icon svg {
	width: 100%;
	height: 100%;
}

/* PERCENT 折扣券 */
.percent-text {
	font-size: 22px;
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

/* 线下核销按钮 */
.coupon-action-row {
	justify-content: flex-end;
}
.redeem-btn {
	padding: 6px 14px;
	border-radius: 14px;
	background-color: rgba(242, 177, 49, 0.12);
	border: 1px solid #F2B131;
}
.redeem-btn-text {
	font-size: 12px;
	color: #B5750C;
	font-weight: 600;
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
