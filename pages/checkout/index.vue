<template>
	<view class="checkout-page" :data-lang="langVersion">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('checkout.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-state" v-if="loading">
			<text class="loading-text">{{ t('common.loading') }}</text>
		</view>

		<!-- 内容区域 -->
		<scroll-view v-else class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 配送方式选择 -->
				<view class="delivery-type-badge" v-if="false">
					<text class="badge-text">{{ t('checkout.deliveryBadge') }}</text>
				</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 收货地址 -->
			<view class="address-section" v-if="false">
				<view class="section-card">
					<view class="address-content" @click="handleSelectAddress">
						<image class="address-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
						<view class="address-info" v-if="addressInfo">
							<view class="address-header">
								<text class="address-name">{{ addressInfo.name }}</text>
								<text class="address-phone">{{ addressInfo.phone }}</text>
							</view>
							<text class="address-detail">{{ addressInfo.province }}{{ addressInfo.city }}{{ addressInfo.district }}{{ addressInfo.detail }}</text>
						</view>
						<view class="address-info" v-else>
							<text class="address-detail">{{ t('checkout.pleaseSelectAddress') }}</text>
						</view>
						<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
					</view>
				</view>
			</view>

			<!-- 门店信息 -->
			<view class="shop-section" v-else>
				<view class="section-card">
					<view class="shop-content">
						<image class="shop-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
						<view class="shop-info">
							<text class="shop-name">{{ shopInfo["name_" + i18n.getLanguage()] || shopInfo.name }}</text>
							<text class="shop-address">{{ shopInfo['address_' + i18n.getLanguage()] || shopInfo['formatted_address_' + i18n.getLanguage()] || shopInfo.address }}</text>
						</view>
						<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 订单信息 -->
			<view class="order-section">
				<view class="section-card">
					<view class="section-title">
						<text class="title-text">{{ t('checkout.orderInfo') }}</text>
					</view>
					<!-- 商品列表 -->
					<view class="product-list">
						<view class="product-item" v-for="(item, index) in cartItems" :key="index">
							<image class="product-image" :src="item.image || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
							<view class="product-info">
								<text class="product-name">{{ item['name_' + i18n.getLanguage()] || item.name }}</text>
								<view class="product-specs" v-if="item.specs && Object.keys(item.specs).length > 0">
									<text class="specs-text">{{ formatSpecs(item.specs) }}</text>
								</view>
								<view class="product-footer">
									<text class="product-price">฿{{ item.price }}</text>
									<text class="product-quantity">x{{ item.quantity }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 配送时间 -->
			<view class="time-section" v-if="false">
				<view class="section-card">
					<view class="time-row" @click="handleSelectTime">
						<text class="time-label">{{ t('checkout.pickupTime') }}</text>
						<view class="time-value">
							<text class="time-text">{{ selectedTimeLabel }}</text>
							<image class="arrow-icon-small" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider" v-if="false"></view>

			<!-- 支付方式 -->
			<view class="payment-section" v-if="false">
				<view class="section-card">
					<view class="payment-row" @click="handleSelectPayment">
						<text class="payment-label">{{ t('checkout.paymentMethod') }}</text>
						<view class="payment-value">
							<text class="payment-text">{{ selectedPaymentName }}</text>
							<image class="arrow-icon-small" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 优惠券选择 -->
			<!-- 优惠券区：酒水订单时禁用选择，显示提示 -->
			<view class="coupon-section">
				<view class="section-card">
					<!-- 预览未就绪：显示加载中（避免先显示"可用"再变"不可用"的闪烁） -->
					<view v-if="!previewData" class="coupon-row">
						<view class="coupon-left">
							<text class="coupon-label">{{ t('checkout.coupon') }}</text>
							<text class="coupon-count">{{ t('common.loading') }}</text>
						</view>
					</view>
					<!-- 后端判断不可用（纯酒水/活动订单防折上折等） -->
					<view v-else-if="isAllExcludedFromDiscount" class="excluded-hint-row">
						<text class="excluded-hint-text">🚫 {{ t('checkout.excludedFromDiscount') }}</text>
					</view>
					<!-- 正常显示优惠券选择 -->
					<view v-else class="coupon-row" @click="availableCoupons.length > 0 ? (showCouponPicker = true) : null">
						<view class="coupon-left">
							<text class="coupon-label">{{ t('checkout.coupon') }}</text>
							<text class="coupon-count" v-if="availableCoupons.length > 0">{{ t('checkout.couponAvailable', { n: availableCoupons.length }) }}</text>
							<text class="coupon-count" v-else>{{ t('checkout.couponNone') }}</text>
						</view>
						<view class="coupon-right">
							<text class="coupon-selected" v-if="selectedCoupon">{{ formatCouponAmount(selectedCoupon) }}</text>
							<text class="coupon-hint" v-else-if="availableCoupons.length > 0">{{ t('checkout.pleaseSelect') }}</text>
							<text class="coupon-hint" v-else>{{ t('checkout.couponNoAvailable') }}</text>
							<image class="arrow-icon-small" src="/static/icons/arrow-right.svg" mode="aspectFit" v-if="availableCoupons.length > 0"></image>
						</view>
					</view>
					<view class="coupon-selected-info" v-if="selectedCoupon && !isAllExcludedFromDiscount">
						<text class="coupon-name">{{ selectedCoupon.name }}</text>
						<text class="coupon-remove" @click.stop="clearCoupon">×</text>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 金币抵扣：酒水订单时不显示选择区（避免用户误以为能抵扣） -->
			<view class="coin-section" v-if="coinBalance > 0 && !isAllExcludedFromDiscount">
				<view class="section-card">
					<view class="coin-row">
						<view class="coin-left">
							<image class="coin-icon" src="/static/icons/coin.svg" mode="aspectFit"></image>
							<text class="coin-label">{{ t('orderDetail.coinDeduct') }}</text>
							<text class="coin-balance">{{ t("orderDetail.coinsUnit", { n: coinBalance }) }}</text>
						</view>
						<view class="coin-right">
							<text class="coin-deduct" v-if="selectedCoinTier">-฿{{ Number(selectedCoinTier.deduct_amount).toFixed(2) }}</text>
							<switch :checked="useCoins" @change="handleCoinToggle" color="#F2B131" :disabled="!coinDeductAvailable" />
						</view>
					</view>
					<view class="coin-hint-row threshold-not-met" v-if="!coinDeductAvailable">
						<text class="coin-hint">{{ t('checkout.coinThresholdNotMet') }}</text>
					</view>

					<!-- 档位列表（按档位抵扣：用户选一个档位，一次只抵一档） -->
					<view v-if="useCoins && coinTiers.length > 0" class="coin-tier-group">
						<view
							v-for="tier in coinTiers"
							:key="tier.id"
							class="coin-tier-card"
							:class="{
								'coin-tier-active': selectedCoinTierId === tier.id,
								'coin-tier-disabled': !tier.usable
							}"
							@click="selectCoinTier(tier)"
						>
							<view class="coin-tier-main">
								<text class="coin-tier-summary">{{ t('checkout.coinPlanSummary', { coins: tier.coin_amount, amount: Number(tier.deduct_amount).toFixed(2) }) }}</text>
							</view>
							<text class="coin-tier-check" v-if="selectedCoinTierId === tier.id">✓</text>
							<text class="coin-tier-reason" v-else-if="!tier.usable">{{ getTierReasonText(tier) }}</text>
						</view>
					</view>
					<view v-else-if="useCoins && tierLoading" class="coin-tier-loading">
						<text class="coin-tier-loading-text">{{ t('common.loading') }}</text>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider" v-if="coinBalance > 0"></view>

			<!-- 费用明细 -->
			<view class="cost-section">
				<view class="section-card">
					<view class="section-title">
						<text class="title-text">{{ t('checkout.productCost') }}</text>
					</view>
					<view class="shop-name-row">
						<text class="shop-name-text">{{ shopInfo["name_" + i18n.getLanguage()] || shopInfo.name }}</text>
					</view>
					<view class="cost-list">
						<view class="cost-item" v-for="(item, index) in cartItems" :key="index">
							<image class="cost-image" :src="item.image || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
							<view class="cost-info">
								<view class="cost-name-row">
									<text class="cost-name">{{ item['name_' + i18n.getLanguage()] || item.name }}</text>
									<text class="cost-price">฿{{ (item.price * item.quantity).toFixed(2) }}</text>
								</view>
								<text class="cost-specs" v-if="item.specs && Object.keys(item.specs).length > 0">{{ formatSpecs(item.specs) }}</text>
							</view>
						</view>
					</view>
					<view class="cost-row" v-if="false">
						<text class="cost-label">{{ t('checkout.deliveryFee') }}</text>
						<text class="cost-value">฿{{ deliveryFee.toFixed(2) }}</text>
					</view>
					<!-- 活动折扣(含 DISCOUNT / FULL_REDUCTION / SPECIAL_DATE)-->
					<view class="cost-row" v-if="campaignDiscount > 0">
						<text class="cost-label">🎉 {{ campaignName }}</text>
						<text class="cost-value discount">-฿{{ campaignDiscount.toFixed(2) }}</text>
					</view>
					<view class="cost-row" v-if="selectedCoupon && !isAllExcludedFromDiscount">
						<text class="cost-label">
							{{ t('checkout.coupon') }}（{{ selectedCoupon.name }}）
							<text v-if="previewCouponDiscount === 0" class="coupon-skip-hint">{{ t('checkout.couponNotApplicable') }}</text>
						</text>
						<text class="cost-value discount">-฿{{ (previewCouponDiscount !== null ? previewCouponDiscount : 0).toFixed(2) }}</text>
					</view>
					<view class="cost-row" v-if="useCoins && coinDeductAmount > 0">
						<text class="cost-label">{{ t('orderDetail.coinDeduct') }}</text>
						<text class="cost-value discount">-฿{{ (previewCoinDeduct !== null ? previewCoinDeduct : coinDeductAmount).toFixed(2) }}</text>
					</view>
					<view class="total-row">
						<text class="total-label">{{ t('checkout.totalAmount') }}</text>
						<text class="total-value">฿{{ totalPrice }}</text>
					</view>
					<!-- 预计获得金币/积分 -->
					<view class="reward-row" v-if="expectedCoins > 0 || expectedPoints > 0">
						<view class="reward-item" v-if="expectedCoins > 0">
							<text class="reward-icon">🪙</text>
							<text class="reward-text">{{ t('checkout.expectedCoins', { n: expectedCoins }) }}</text>
						</view>
						<view class="reward-item" v-if="expectedPoints > 0">
							<text class="reward-icon">⭐</text>
							<text class="reward-text">{{ t('checkout.expectedPoints', { n: expectedPoints }) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 备注 -->
			<view class="remark-section">
				<view class="section-card">
					<view class="remark-row">
						<text class="remark-label">{{ t('checkout.remark') }}</text>
						<input class="remark-input" v-model="remark" :placeholder="i18n.t('checkout.remarkOptional')" placeholder-class="remark-placeholder" />
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 优惠券选择弹窗 -->
		<view class="coupon-picker-mask" v-if="showCouponPicker" @click="showCouponPicker = false">
			<view class="coupon-picker" @click.stop>
				<view class="picker-header">
					<text class="picker-title">{{ t('checkout.selectCoupon') }}</text>
					<text class="picker-close" @click="showCouponPicker = false">×</text>
				</view>
				<scroll-view class="picker-list" scroll-y @scrolltolower="loadMoreCoupons" :lower-threshold="60">
					<view
						class="picker-item"
						:class="{
							'picker-item-active': selectedCoupon && selectedCoupon.id === coupon.id,
							'picker-item-disabled': isCouponDisabled(coupon)
						}"
						v-for="coupon in availableCoupons"
						:key="coupon.id"
						@click="!isCouponDisabled(coupon) && selectCoupon(coupon)"
					>
						<view class="picker-coupon-amount">
							<text class="picker-coupon-value">{{ formatCouponAmount(coupon) }}</text>
						</view>
						<view class="picker-coupon-info">
							<text class="picker-coupon-name">{{ coupon.name }}</text>
							<text class="picker-coupon-desc" v-if="unavailableCouponIds.includes(coupon.id)">{{ t('checkout.couponNotApplicable') }}</text>
							<text class="picker-coupon-desc" v-else-if="coupon.expectedDiscount !== null && coupon.expectedDiscount <= 0">{{ t('checkout.couponNotStackable') }}</text>
							<text class="picker-coupon-desc" v-else>{{ coupon.description || '' }}</text>
						</view>
						<view class="picker-check" v-if="selectedCoupon && selectedCoupon.id === coupon.id">
							<text class="check-mark">✓</text>
						</view>
					</view>
					<view class="picker-item picker-item-none" @click="clearCoupon">
						<text class="picker-coupon-name">{{ t('checkout.couponNotUse') }}</text>
					</view>
					<!-- 加载更多 / 到底提示 -->
					<view class="picker-more" v-if="couponLoadingMore || couponNoMore">
						<text class="picker-more-text">
							{{ couponLoadingMore ? t('common.loading') : (availableCoupons.length > 0 ? t('common.noMore') : '') }}
						</text>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 底部结算栏 -->
		<view class="bottom-bar">
			<view class="total-section">
				<text class="total-text">{{ t('checkout.totalColon') }}</text>
				<text class="total-price">฿{{ totalPrice }}</text>
			</view>
			<view class="submit-btn" :class="{ 'submit-btn-disabled': submitting || orderingDisabled }" @click="handleSubmit">
				<text class="submit-text">{{ submitting ? i18n.t('checkout.submitting') : i18n.t('checkout.submitOrder') }}</text>
			</view>
		</view>

		<!-- 配送时间选择弹窗 -->
		<view class="picker-mask" v-if="showTimePicker" @click="showTimePicker = false">
			<view class="picker-panel" @click.stop>
				<view class="picker-header">
					<text class="picker-title">{{ t('checkout.selectPickupTime') }}</text>
				</view>
				<view class="picker-list">
					<view
						class="picker-item"
						:class="{ 'picker-item-active': selectedTimeIndex === index }"
						v-for="(time, index) in timeOptions"
						:key="index"
						@click="selectTime(index)"
					>
						<text class="picker-item-text">{{ time.label }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 支付方式选择弹窗 -->
		<view class="picker-mask" v-if="showPaymentPicker" @click="showPaymentPicker = false">
			<view class="picker-panel" @click.stop>
				<view class="picker-header">
					<text class="picker-title">{{ t('checkout.selectPaymentMethod') }}</text>
				</view>
				<view class="picker-list">
					<view
						class="picker-item"
						:class="{ 'picker-item-active': selectedPaymentIndex === index }"
						v-for="(method, index) in paymentMethods"
						:key="index"
						@click="selectPayment(index)"
					>
						<text class="picker-item-text">{{ method.name }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getAddressList } from '@/api/services/address.js'
import { getAvailableCoupons, getMyCoupons } from '@/api/services/coupon.js'
import { createPayment } from '@/api/services/payment.js'
import i18n from '@/i18n/index.js'
import { createOrder, getCoinBalance, getCoinTiers, previewOrder } from '@/api/services/order.js'
import { createGroupBuyOrder } from '@/api/services/groupbuy.js'
import { showToast, fixMinioUrl, getErrorMessage } from '@/utils/index.js'
import appStore from '@/store/index.js'
import { getStore } from '@/api/services/store.js'
import { getConsumerMenuItems } from '@/api/services/menu.js'

const ORDER_SOURCE_MAP = {
	'delivery': 'DELIVERY',
	'pickup': 'TAKEAWAY',
	'dinein': 'DINE_IN_SCAN'
}

export default {
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			shopId: null,
			orderType: 'delivery',
			deliveryType: 'delivery',
			loading: true,
			submitting: false,
			// 本店 C 端点餐被总控关闭（下单被 403 ORDERING_DISABLED 拦截后置 true，禁用提交）
			orderingDisabled: false,
			remark: '',
			cartItems: [],
			addressInfo: null,
			shopInfo: {
				id: 1,
				delivery_enabled: false,
				name: '芭堤雅泰式火锅',
				address: '四惠·远洋天地二期'
			},
			showTimePicker: false,
			selectedTimeIndex: 0,
			timeOptions: [
				{ label: '立即配送', value: 'now' },
				{ label: '30分钟后', value: '30min' },
				{ label: '1小时后', value: '1h' },
				{ label: '1.5小时后', value: '1.5h' }
			],
			showPaymentPicker: false,
			paymentMethods: [
				{ code: 'cash_pos', name: '收银台支付' }
			],
			selectedPaymentIndex: 0,
			availableCoupons: [],
			showCouponPicker: false,
			selectedCoupon: null,
			unavailableCouponIds: [],   // preview 返回 coupon_discount=0 的券 ID（防折上折不可用）
			// 券分页：拉满 100 条覆盖大多数场景；超出则触底加载
			couponPage: 1,
			couponPageSize: 100,
			couponTotal: 0,
			couponLoadingMore: false,
			couponNoMore: false,
		coinBalance: 0,
		useCoins: false,
		coinDeductAmount: 0,
		previewData: null,  // 后端 preview 返回的价格明细(含活动折扣)
			maxCoinUsage: 0,
		// 金币档位（新方案：单档抵扣）
		coinConfig: {
			maxDeductPercent: 10,        // 全局比例上限（%）
			maxDeductAmount: 0           // 本单最大可抵扣金额（仅用于 UI 展示）
		},
		coinTiers: [],                  // GET /coin-tiers 返回的档位列表
		selectedCoinTierId: null,       // 用户选中的档位 ID（null = 不使用金币）
		tierLoading: false,             // 拉档位中
		deliveryFee: 0,
		langVersion: 0
	}
},
	computed: {
		productTotal() {
			return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
		},
		maxDeductAmount() {
			// 优先用后端返回的 max_deduct_amount；兜底按 max_deduct_percent 算（防接口未返回）
			if (this.coinConfig.maxDeductAmount > 0) {
				return this.coinConfig.maxDeductAmount
			}
			return Math.floor(this.productTotal * (this.coinConfig.maxDeductPercent / 100) * 100) / 100
		},
		coinDeductAvailable() {
			return this.maxDeductAmount >= 1 && this.coinBalance > 0
		},
		// 整单是否全部为"不参与减免"分类（如纯酒水订单）
		// 优先用后端 preview 返回的 discount_eligible（更准确），前端预判作兜底
		isAllExcludedFromDiscount() {
			if (this.previewData && this.previewData.discount_eligible === false) return true
			if (this.cartItems.length > 0 && this.cartItems.every(it => it.exclude_from_discount === true)) return true
			return false
		},
		totalPrice() {
			// 优先用后端 preview 的 total_amount(含活动折扣)
			if (this.previewData && this.previewData.total_amount) {
				return Number(this.previewData.total_amount).toFixed(2)
			}
			// 兜底:前端本地计算(不含活动折扣)
			let total = this.productTotal
			if (this.deliveryType === 'delivery') {
				total += this.deliveryFee
			}
			if (this.selectedCoupon) {
				total -= this.selectedCoupon.amount
			}
			if (this.useCoins && this.coinDeductAmount > 0) {
				total -= this.coinDeductAmount
			}
			return Math.max(0, total).toFixed(2)
		},
		// 活动折扣(从 preview 拿)
		campaignDiscount() {
			if (this.previewData && this.previewData.campaign_discount > 0) {
				return Number(this.previewData.campaign_discount)
			}
			return 0
		},
		campaignName() {
			if (!this.previewData) return ''
			const lang = i18n.getLanguage()
			// 优先用后端多语言字段（如果有）
			if (lang === 'en' && this.previewData.campaign_name_en) return this.previewData.campaign_name_en
			if (lang === 'th' && this.previewData.campaign_name_th) return this.previewData.campaign_name_th
			// 后端没返回多语言 → 用 campaign_type 映射到本地多语言文案
			const campaignType = this.previewData.campaign_type || ''
			if (campaignType && lang !== 'zh') {
				const typeNames = {
					DISCOUNT: { en: 'Discount', th: 'โปรโมชัน' },
					FULL_REDUCTION: { en: 'Spend & Save', th: 'ซื้อครบลด' },
					COUPON_GRANT: { en: 'Claim Coupons', th: 'รับคูปอง' },
					SPECIAL_DATE: { en: 'Special Date', th: 'วันพิเศษ' },
					STORE_OPENING: { en: 'Opening Discount', th: 'ส่วนลดเปิดร้านใหม่' }
				}
				const mapped = typeNames[campaignType]
				if (mapped && mapped[lang]) return mapped[lang]
			}
			return this.previewData.campaign_name || ''
		},
		// preview 返回的优惠券折扣(可能因防折上折变为 0)
		previewCouponDiscount() {
			if (this.previewData && this.previewData.coupon_discount !== undefined) {
				return Number(this.previewData.coupon_discount)
			}
			return null
		},
		// 预计获得金币（preview 返回）
		expectedCoins() {
			if (this.previewData && this.previewData.expected_coins) {
				return Number(this.previewData.expected_coins) || 0
			}
			return 0
		},
		// 预计获得积分（preview 返回）
		expectedPoints() {
			if (this.previewData && this.previewData.expected_points) {
				return Number(this.previewData.expected_points) || 0
			}
			return 0
		},
		// preview 返回的金币抵扣
		previewCoinDeduct() {
			if (this.previewData && this.previewData.coin_deduct !== undefined) {
				return Number(this.previewData.coin_deduct)
			}
			return null
		},
		// 当前选中的金币档位对象（来自 coinTiers）
		selectedCoinTier() {
			if (this.selectedCoinTierId === null) return null
			return this.coinTiers.find(t => t.id === this.selectedCoinTierId) || null
		},
		// 按当前语言取档位的不可用原因
		getTierReasonText() {
			return (tier) => {
				if (!tier) return ''
				const lang = i18n.getLanguage()
				if (lang === 'en') return tier.reason_en || tier.reason || ''
				if (lang === 'th') return tier.reason_th || tier.reason || ''
				return tier.reason || ''
			}
		},
		selectedTimeLabel() {
			return this.timeOptions[this.selectedTimeIndex]?.label || i18n.t('checkout.deliveryBadge')
		},
		selectedPaymentName() {
			if (this.paymentMethods.length === 0) return i18n.t('common.loading')
			return this.paymentMethods[this.selectedPaymentIndex]?.name || i18n.t('checkout.pleaseSelect')
		},
		selectedPaymentCode() {
			if (this.paymentMethods.length === 0) return 'cash_pos'
			return this.paymentMethods[this.selectedPaymentIndex]?.code || 'cash_pos'
		}
	},
	onLoad(options) {
		if (options.orderType) {
			this.orderType = options.orderType
			if (this.orderType === 'dinein') {
				this.deliveryType = 'pickup'
			} else if (this.orderType === 'delivery') {
				this.deliveryType = 'delivery'
			}
		}
		if (options.shopId) {
			this.shopId = parseInt(options.shopId)
		}
		if (options.shopName) {
			this.shopInfo.name = decodeURIComponent(options.shopName)
		}
		if (options.products) {
			try {
				this.cartItems = JSON.parse(decodeURIComponent(options.products))
			} catch (e) {
				console.error('解析购物车数据失败', e)
			}
			if (!this.shopId && this.cartItems.length > 0 && this.cartItems[0].store_id) {
				this.shopId = this.cartItems[0].store_id
			}
			// 修正已有 image 字段（可能是相对路径，需要拼 minio 完整 URL）
			this.cartItems.forEach(it => {
				if (it.image) it.image = fixMinioUrl(it.image) || '/static/images/img-placeholder.svg'
			})
			// 兜底：对缺图片的 item 反查 menu 接口（覆盖 reorder / 列表 / 直接跳转等入口）
			this.enrichCartImagesFromMenu()
		}
		this.initPage()
			// Guard: no store selected
			if (!this.shopId) {
				uni.showToast({ title: i18n.t("dinein.selectStoreTitle") || "请选择门店", icon: "none" })
				setTimeout(() => uni.navigateBack(), 1500)
				return
			}

		this.loadCheckoutData()

		// 延迟调 preview(等 loadCheckoutData 拿到金币配置后)
		setTimeout(() => { this.loadPreview() }, 500)

		uni.$on('addressSelected', (address) => {
			this.addressInfo = address
		})
		uni.$on('languageChanged', this.onLanguageChanged)
	},
	onUnload() {
		uni.$off('addressSelected')
		uni.$off('languageChanged', this.onLanguageChanged)
	},
	methods: {
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		onLanguageChanged() {
			this.langVersion++
		},

		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const bottomBarHeight = 64
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - bottomBarHeight - safeAreaBottom - this.statusBarHeight
		},

		// 兜底：购物车里缺图片的 item，从 menu 接口反查补全
		// 覆盖场景：reorder 接口没返回 image_url、order.detail_items 没图片字段、上游 handleReorder 没做 enrich
		async enrichCartImagesFromMenu() {
			const needImage = this.cartItems.filter(it => !it.image || it.image === '/static/images/img-placeholder.svg')
			if (needImage.length === 0 || !this.shopId) return
			try {
				const res = await getConsumerMenuItems(this.shopId, { page_size: 200 })
				if (!res || res.code !== 0 || !res.data) return
				const menuItems = res.data.items || res.data || []
				const imgMap = {}
				for (const m of menuItems) {
					if (m.id && m.image_url) imgMap[m.id] = m.image_url
				}
				this.cartItems.forEach(it => {
					const itemId = it.id || it.menu_item_id
					if ((!it.image || it.image === '/static/images/img-placeholder.svg') && imgMap[itemId]) {
						it.image = fixMinioUrl(imgMap[itemId]) || '/static/images/img-placeholder.svg'
					}
				})
			} catch (e) {
				console.warn('[checkout] enrich cart images failed:', e)
			}
		},

		async loadCheckoutData() {
			this.loading = true
			try {
				if (this.shopId) {
					try {
						const storeRes = await getStore(this.shopId)
						if (storeRes.code === 0 && storeRes.data) {
							const s = storeRes.data
							this.shopInfo = {
								id: s.id,
								name: s.name,
								name_en: s.name_en || '',
								name_th: s.name_th || '',
								address: s.address || '',
								address_zh: s.address_zh || '',
								address_en: s.address_en || '',
								address_th: s.address_th || '',
								formatted_address_zh: s.formatted_address_zh || '',
								formatted_address_en: s.formatted_address_en || '',
								formatted_address_th: s.formatted_address_th || '',
								phone: s.phone || '',
								delivery_fee: s.config?.delivery_fee || 0,
								business_types: s.business_types || []
							}
							this.deliveryFee = s.config?.delivery_fee || 0
						// Lock delivery type based on store's delivery_enabled
						this.deliveryType = s.delivery_enabled ? 'delivery' : 'pickup'
						}
					} catch (e) {
						console.error('加载门店详情失败:', e)
					}
				} else {
					const currentStore = appStore.getCurrentStore()
					if (currentStore) {
						this.shopInfo = {
							id: currentStore.id,
							name: currentStore.name,
							name_en: currentStore.name_en || '',
							name_th: currentStore.name_th || '',
							address: currentStore.address,
							address_zh: currentStore.address_zh || '',
							address_en: currentStore.address_en || '',
							address_th: currentStore.address_th || '',
							formatted_address_zh: currentStore.formatted_address_zh || '',
							formatted_address_en: currentStore.formatted_address_en || '',
							formatted_address_th: currentStore.formatted_address_th || '',
							phone: currentStore.phone || '',
							delivery_fee: currentStore.config?.delivery_fee || 0,
							business_types: currentStore.business_types || []
						}
						this.deliveryFee = currentStore.config?.delivery_fee || 0
					}
				}

				const [addressRes, couponRes, coinRes] = await Promise.allSettled([
					getAddressList(),
					getAvailableCoupons({
						order_amount: this.productTotal,
						order_type: this.orderType,
						...(this.shopId ? { store_id: this.shopId } : {})
					}),
					getCoinBalance()
				])

				if (addressRes.status === 'fulfilled' && addressRes.value.code === 0 && addressRes.value.data) {
					const addressData = addressRes.value.data
					const addresses = Array.isArray(addressData) ? addressData : (addressData.items || [])
					const defaultAddr = addresses.find(a => a.is_default || a.isDefault) || addresses[0]
					if (defaultAddr) {
						this.addressInfo = defaultAddr
					}
				}

				// 优惠券 - 优先用available接口，回退到my接口
				let couponItems = []
				let couponTotal = 0
				let couponNoMore = false
				if (couponRes.status === 'fulfilled' && couponRes.value.code === 0 && couponRes.value.data) {
					const raw = couponRes.value.data
					const items = raw.items || raw || []
					couponItems = Array.isArray(items) ? items : []
					couponTotal = Number(raw.total) || couponItems.length
					// available 接口当前默认 page_size=100，若返回量 < page_size → 到底
					couponNoMore = couponItems.length < this.couponPageSize
				}
				// 如果available接口返回空，尝试从my接口获取可用优惠券
				if (couponItems.length === 0) {
					try {
						const myRes = await getMyCoupons({ status: 'all' })
						if (myRes.code === 0 && myRes.data) {
							const myItems = myRes.data.items || myRes.data || []
							couponItems = (Array.isArray(myItems) ? myItems : []).filter(c => c.status === 'UNUSED' || c.status === 'CLAIMED' || c.status === 'ACTIVE')
							couponTotal = couponItems.length
							couponNoMore = true   // 兜底路径，一次性拉满不再追加
						}
					} catch(e) { console.log('fallback getMyCoupons failed:', e) }
				}
				this.couponTotal = couponTotal
				this.couponNoMore = couponNoMore
				if (couponItems.length > 0) {
					const lang = i18n.getLanguage()
					this.availableCoupons = couponItems.map(c => {
						const tpl = c.template || {}
						return {
							id: c.id,
							coupon_code: c.coupon_code || '',
							type: c.type || tpl.type || c.coupon_type || '',   // FIXED/PERCENT/ITEM
							name: tpl['name_' + lang] || tpl.name || c['name_' + lang] || c.name || c.coupon_name || '',
							amount: c.value || tpl.discount_value || c.discount_value || c.amount || 0,
							minSpend: tpl.min_order_amount || c.min_order_amount || c.min_spend || 0,
							valid_end: c.valid_end || c.validity_end || '',
							description: tpl['description_' + lang] || tpl.description || c['description_' + lang] || c.description || '',
							// 后端 /coupons/available 返回该字段时，表示该券在当前订单下的实际抵扣额
							// expected_discount = 0 ⇒ 本单不可用（防折上折/纯酒水等），加载阶段直接剔除
							// 字段未返回 ⇒ 兼容旧后端，回退到"选中后由 preview 判定"
							expectedDiscount: c.expected_discount !== undefined
								? Number(c.expected_discount) || 0
								: null
						}
					}).filter(c => {
						// 过滤掉菜品券（ITEM 类型仅线下核销，不参与下单）
						if (String(c.type).toUpperCase() === 'ITEM') return false
						// 过滤掉无金额的券 + 不满足门槛的券
						if (!(c.amount > 0 && (!c.minSpend || this.productTotal >= c.minSpend))) return false
						// expected_discount <= 0 的券（防折上折）不再隐藏，保留展示但标注"不可叠加"
						return true
					})
					// 不自动选券——让用户自己选（避免混合订单/活动订单默认选中但不生效）
				}

				if (coinRes.status === 'fulfilled' && coinRes.value.code === 0 && coinRes.value.data) {
					this.coinBalance = coinRes.value.data.coin_balance || 0
				}
			} catch (e) {
				console.error('加载结算数据失败:', e)
				showToast(i18n.t('checkout.loadFailed'))
			} finally {
				this.loading = false
			}
		},


		formatSpecs(specs) {
			if (!specs) return ''
			const lang = i18n.state.language
			const langMessages = i18n.state.messages[lang] || {}
			const specLabels = (langMessages.productDetail && langMessages.productDetail.specLabels) || {}
			const specOptions = (langMessages.productDetail && langMessages.productDetail.specOptions) || {}
			const skipKeys = ['pricing', 'remark', 'topping_ids', 'quantity', 'group_price', 'original_price', 'group_buy_item_id', 'is_group_buy']
			const normalizeVal = (v) => {
				if (v === null || v === undefined || v === '') return ''
				if (Array.isArray(v)) return v.map(normalizeVal).filter(Boolean).join(', ')
				if (typeof v === 'object') return v.name || v.label || v.value || ''
				return specOptions[v] || v
			}
			return Object.entries(specs)
				.filter(([k, v]) => {
					if (skipKeys.includes(k)) return false
					if (v === null || v === undefined || v === '') return false
					if (Array.isArray(v)) return v.length > 0
					if (typeof v === 'object') return !!(v.name || v.label || v.value)
					return true
				})
				.map(([key, val]) => {
					const label = specLabels[key] || key
					const optionLabel = normalizeVal(val)
					if (!optionLabel) return ''
					return `${label}：${optionLabel}`
				})
				.filter(Boolean)
				.join(' / ')
		},

		goBack() {
			uni.navigateBack()
		},

		handleSelectAddress() {
			uni.navigateTo({
				url: '/pages/address/index?select=true'
			})
		},

		handleSelectTime() {
			this.showTimePicker = true
		},

		selectTime(index) {
			this.selectedTimeIndex = index
			this.showTimePicker = false
		},

		handleSelectPayment() {
			if (this.paymentMethods.length === 0) {
				showToast(i18n.t('checkout.paymentNone'))
				return
			}
			this.showPaymentPicker = true
		},

		selectPayment(index) {
			this.selectedPaymentIndex = index
			this.showPaymentPicker = false
		},

		// 格式化券面额：FIXED→฿X / PERCENT→7折 / ITEM→菜品券
		formatCouponAmount(coupon) {
			if (!coupon) return ''
			const type = String(coupon.type || coupon.couponType || '').toUpperCase()
			if (type === 'ITEM') return this.i18n.t('coupons.itemVoucher')
			if (type === 'PERCENT') {
				const v = Number(coupon.amount) || 0
				const lang = i18n.getLanguage()
				if (lang === 'zh') return `${(10 - v / 10).toFixed(1).replace('.0', '')}折`
				if (lang === 'th') return `ลด ${v}%`
				return `${v}% OFF`
			}
			return `฿${Number(coupon.amount || 0).toFixed(2)}`
		},

		// 判断券是否被禁用（防折上折 or preview 返回 0）
		isCouponDisabled(coupon) {
			if (!coupon) return true
			// preview 实测不可用
			if (this.unavailableCouponIds.includes(coupon.id)) return true
			// expected_discount <= 0 → 与活动冲突（防折上折）
			if (coupon.expectedDiscount !== null && coupon.expectedDiscount <= 0) return true
			return false
		},

		selectCoupon(coupon) {
			this.selectedCoupon = coupon
			this.showCouponPicker = false
			// 优惠券变化 → 档位可用性可能变化，先清空选中，preview 完再拉档位
			this.selectedCoinTierId = null
			this.loadPreview().then(() => {
				if (this.useCoins) this.loadCoinTiers()
			})
		},

		clearCoupon() {
			this.selectedCoupon = null
			this.showCouponPicker = false
			this.selectedCoinTierId = null
			this.loadPreview().then(() => {
				if (this.useCoins) this.loadCoinTiers()
			})
		},

		// 触底加载更多可用券（仅超过 100 张时触发）
		async loadMoreCoupons() {
			if (this.couponLoadingMore || this.couponNoMore) return
			this.couponLoadingMore = true
			try {
				const nextPage = this.couponPage + 1
				const params = {
					order_amount: this.productTotal,
					order_type: this.orderType,
					...(this.shopId ? { store_id: this.shopId } : {}),
					page: nextPage,
					page_size: this.couponPageSize
				}
				const res = await getAvailableCoupons(params)
				if (res && res.code === 0 && res.data) {
					const raw = res.data
					const items = Array.isArray(raw.items) ? raw.items : (Array.isArray(raw) ? raw : [])
					if (items.length === 0) {
						this.couponNoMore = true
					} else {
						const lang = i18n.getLanguage()
						const newOnes = items.map(c => {
							const tpl = c.template || {}
							return {
								id: c.id,
								coupon_code: c.coupon_code || '',
								type: c.type || tpl.type || c.coupon_type || '',
								name: tpl['name_' + lang] || tpl.name || c['name_' + lang] || c.name || c.coupon_name || '',
								amount: c.value || tpl.discount_value || c.discount_value || c.amount || 0,
								minSpend: tpl.min_order_amount || c.min_order_amount || c.min_spend || 0,
								valid_end: c.valid_end || c.validity_end || '',
								description: tpl['description_' + lang] || tpl.description || c['description_' + lang] || c.description || '',
								expectedDiscount: c.expected_discount !== undefined
									? Number(c.expected_discount) || 0
									: null
							}
						}).filter(c => {
							if (String(c.type).toUpperCase() === 'ITEM') return false
							if (!(c.amount > 0 && (!c.minSpend || this.productTotal >= c.minSpend))) return false
							// expected_discount <= 0 的券（防折上折）不再隐藏
							return true
						})
						// 去重：避免跨页重复
						const existingIds = new Set(this.availableCoupons.map(c => c.id))
						const deduped = newOnes.filter(c => !existingIds.has(c.id))
						if (deduped.length === 0) {
							this.couponNoMore = true
						} else {
							this.availableCoupons = this.availableCoupons.concat(deduped)
							this.couponPage = nextPage
							if (newOnes.length < this.couponPageSize) this.couponNoMore = true
						}
					}
				} else {
					this.couponNoMore = true
				}
			} catch (e) {
				console.warn('[checkout] loadMoreCoupons failed:', e)
			} finally {
				this.couponLoadingMore = false
			}
		},

		// ============ 结算预览(含活动折扣) ============
		async loadPreview() {
			if (!this.cartItems || this.cartItems.length === 0) return
			try {
				const previewBody = {
					store_id: this.shopId,
					items: this.cartItems.map(item => {
						const mapped = {
							menu_item_id: item.id || item.menu_item_id,
							quantity: item.quantity,
							unit_price: item.price,
							specs: item.specs || {}
						}
						// 复购场景：带 selection 时直接用结构化选择提交
						if (item.selection && typeof item.selection === 'object' && Object.keys(item.selection).length > 0) {
							Object.assign(mapped, item.selection)
						}
						return mapped
					}),
					order_type: this.orderType === 'dinein' ? 'DINE_IN' : (this.deliveryType === 'delivery' ? 'DELIVERY' : 'PICKUP')
				}
				if (this.selectedCoupon) {
					previewBody.coupon_id = this.selectedCoupon.id
				}
				// 按档位抵扣：开启金币且选了档位时，传 coin_tier_id
				if (this.useCoins && this.selectedCoinTierId) {
					previewBody.coin_tier_id = this.selectedCoinTierId
				}
				const res = await previewOrder(previewBody)
				if (res && res.code === 0 && res.data) {
					this.previewData = res.data
					// 选了券但 preview 返回 coupon_discount=0 → 标记该券不可用（防折上折）
					if (this.selectedCoupon && Number(res.data.coupon_discount) === 0) {
						if (!this.unavailableCouponIds.includes(this.selectedCoupon.id)) {
							this.unavailableCouponIds.push(this.selectedCoupon.id)
						}
					}
					// 同步档位数据
					if (res.data.coin_tier_id && res.data.coin_tier_id !== this.selectedCoinTierId) {
						this.selectedCoinTierId = res.data.coin_tier_id
					}
				} else if (res && (res.code === 'COIN_TIER_NOT_FOUND' || res.code === 'COIN_TIER_NOT_USABLE')) {
					// 档位失效：清空选择 + 重新拉档位
					this.selectedCoinTierId = null
					await this.loadCoinTiers()
				}
			} catch (e) {
				console.warn('[checkout] preview failed:', e)
				// 兼容 request.js 已经把错误对象包装过的场景
				if (e && (e.code === 'COIN_TIER_NOT_FOUND' || e.code === 'COIN_TIER_NOT_USABLE')) {
					this.selectedCoinTierId = null
					await this.loadCoinTiers()
				}
				// 门店 C 端点餐被关闭：禁用提交按钮（三语提示由 request 层 getErrorMessage toast）
				if (e && e.code === 'ORDERING_DISABLED') {
					this.orderingDisabled = true
				}
				// 跨店用券：清掉所选券，让用户重新选（提示由 request 层 toast）
				if (e && e.code === 'COUPON_STORE_NOT_MATCH') {
					if (this.selectedCoupon) {
						this.unavailableCouponIds.push(this.selectedCoupon.id)
						this.selectedCoupon = null
					}
				}
				// 菜品不存在/跨店下单等错误 → 用本地计算兜底，避免 UI 卡在"加载中"
				const code = e && (e.code || e.bizCode)
				if (code === 'MENU_ITEM_NOT_FOUND') {
					// 设置一个最小 previewData，让优惠券行不再显示"加载中"
					this.previewData = {
						subtotal: this.productTotal,
						campaign_discount: 0,
						coupon_discount: 0,
						coin_deduct: 0,
						total_amount: this.productTotal,
						discount_eligible: true
					}
					// 提示用户菜品不存在
					showToast(i18n.t('checkout.itemNotFound') || '部分商品不存在或已下架')
				}
			}
		},

		// 拉取金币档位列表（新方案：按档位抵扣）
		// 入参用 preview 接口返回的权威 subtotal/campaign_discount/coupon_discount
		async loadCoinTiers() {
			if (this.tierLoading) return
			this.tierLoading = true
			try {
				const subtotal = (this.previewData && this.previewData.subtotal) || this.productTotal
				const campaignDiscount = (this.previewData && Number(this.previewData.campaign_discount)) || 0
				const couponDiscount = (this.previewData && Number(this.previewData.coupon_discount)) || 0
				const res = await getCoinTiers({
					subtotal,
					campaign_discount: campaignDiscount,
					coupon_discount: couponDiscount
				})
				if (res && res.code === 0 && res.data) {
					this.coinTiers = res.data.tiers || []
					if (res.data.coin_balance !== undefined) {
						this.coinBalance = res.data.coin_balance
					}
					if (res.data.max_deduct_percent) {
						this.coinConfig.maxDeductPercent = res.data.max_deduct_percent
					}
					// 校验当前选中档位是否仍可用
					if (this.selectedCoinTierId !== null) {
						const sel = this.coinTiers.find(t => t.id === this.selectedCoinTierId)
						if (!sel || !sel.usable) {
							this.selectedCoinTierId = null
						}
					}
				} else {
					this.coinTiers = []
				}
			} catch (e) {
				console.warn('[checkout] loadCoinTiers failed:', e)
				this.coinTiers = []
			} finally {
				this.tierLoading = false
			}
		},

		// 用户点击某个档位
		selectCoinTier(tier) {
			if (!tier || !tier.usable) {
				// 不可用：toast 显示对应语言的不可用原因
				const reason = this.getTierReasonText(tier)
				if (reason) showToast(reason)
				return
			}
			if (this.selectedCoinTierId === tier.id) {
				// 再次点击同一个 → 取消选择
				this.selectedCoinTierId = null
			} else {
				this.selectedCoinTierId = tier.id
			}
			// 触发 preview 更新金额（后端会按档位重算）
			this.loadPreview()
		},

			async handleCoinToggle(e) {
				this.useCoins = e.detail.value
				// 关闭：清空档位 + 不传 coin_tier_id
				if (!this.useCoins) {
					this.selectedCoinTierId = null
					await this.loadPreview()
					return
				}
				// 开启：先校验门槛 + 拉档位
				if (!this.coinDeductAvailable) {
					this.useCoins = false
					uni.showModal({
						title: '',
						content: this.i18n.t('checkout.coinThresholdNotMet'),
						showCancel: false,
						confirmText: this.i18n.t('common.confirm')
					})
					return
				}
				// 先 preview 一次（不传 tier_id），拿 subtotal/campaign/coupon 权威值
				await this.loadPreview()
				// 再拉档位
				await this.loadCoinTiers()
				// 档位为空或全部不可用时提示
				const hasUsable = this.coinTiers.some(t => t.usable)
				if (this.coinTiers.length === 0 || !hasUsable) {
					this.useCoins = false
					uni.showModal({
						title: '',
						content: this.i18n.t('checkout.coinTierUnavailable'),
						showCancel: false,
						confirmText: this.i18n.t('common.confirm')
					})
				}
			},

		async handleSubmit() {
			if (this.submitting || this.orderingDisabled) return

			if (this.deliveryType === 'delivery' && !this.addressInfo) {
				showToast(i18n.t('checkout.pleaseSelectAddress'))
				return
			}

			this.submitting = true

			try {
				let orderRes
				if (this.orderType === 'groupbuy') {
					const groupItem = this.cartItems[0]
					const gbData = {
						group_buy_item_id: groupItem.id,
						quantity: groupItem.quantity
					}
					if (this.deliveryType === 'delivery' && this.addressInfo) {
						gbData.delivery_type = 'delivery'
						gbData.address_id = this.addressInfo.id
					} else {
						gbData.delivery_type = 'pickup'
					}
					gbData.remark = this.remark
					orderRes = await createGroupBuyOrder(gbData)
				} else {
					const orderData = {
						store_id: this.shopInfo.id,
					order_type: this.shopInfo.business_types?.[0] || 'SEAFOOD_NOODLE',
						order_source: ORDER_SOURCE_MAP[this.orderType] || ORDER_SOURCE_MAP[this.deliveryType],
						items: this.cartItems.map(item => {
							const mapped = {
								menu_item_id: item.id,
								item_name: item.name || '',
								item_name_en: item.name_en || null,
								item_name_th: item.name_th || null,
								quantity: item.quantity,
								unit_price: item.price,
								specs: item.specs || {},
								remark: ''
							}
							// 复购场景：后端 reorder 接口返回的 selection 是扁平结构化数据，可直接提交
							if (item.selection && typeof item.selection === 'object' && Object.keys(item.selection).length > 0) {
								Object.assign(mapped, item.selection)
							}
							return mapped
						}),
						remark: this.remark,
						table_number: this.orderType === 'dinein' ? (this.cartItems[0]?.table_number || '') : '',
						extra_data: {

								store_name: this.shopInfo.name || '',
								store_name_en: this.shopInfo.name_en || '',
								store_name_th: this.shopInfo.name_th || '',
							store_address: this.shopInfo.address || '',
							store_address_zh: this.shopInfo.formatted_address_zh || this.shopInfo.address_zh || this.shopInfo.address || '',
							store_address_en: this.shopInfo.formatted_address_en || this.shopInfo.address_en || '',
							store_address_th: this.shopInfo.formatted_address_th || this.shopInfo.address_th || ''
					}
					}

					if (this.selectedCoupon) {
						orderData.coupon_id = this.selectedCoupon.id
					}

					if (this.useCoins && this.selectedCoinTierId) {
						orderData.coin_tier_id = this.selectedCoinTierId
					}

					if (this.deliveryType === 'delivery' && this.addressInfo) {
						orderData.address_id = this.addressInfo.id
					}

					orderRes = await createOrder(orderData)
				}

				if (orderRes.code === 0 && orderRes.data) {
					const orderId = orderRes.data.id || orderRes.data.order_id
					const orderNo = orderRes.data.order_no || ''
					const totalAmount = orderRes.data.total_amount || parseFloat(this.totalPrice)
					const uniqueCode = orderRes.data.unique_code || ''

					uni.redirectTo({
						url: '/pages/payment-success/index?orderId=' + orderId + '&orderNo=' + encodeURIComponent(orderNo) + '&orderType=' + this.orderType + '&totalAmount=' + totalAmount + '&uniqueCode=' + encodeURIComponent(uniqueCode)
					})
				} else {
					showToast(orderRes.message || i18n.t('checkout.createOrderFailed'))
				}
			} catch (e) {
				console.error('提交订单失败:', e)
				// 门店 C 端点餐开关中途被关闭：展示三语提示并禁用提交按钮，防止反复提交
				if (e?.code === 'ORDERING_DISABLED') {
					this.orderingDisabled = true
					showToast(getErrorMessage(e) || i18n.t('error.orderingDisabled'))
				} else {
					showToast(i18n.t('checkout.submitFailed'))
				}
			} finally {
				this.submitting = false
			}
		},

		generatePickupCode() {
			return Math.floor(1000 + Math.random() * 9000).toString()
		}
	}
}
</script>

<style scoped>
.checkout-page {
	min-height: 100vh;
	background-color: #FFFFFF;
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
	border-bottom: 1px solid #F3F3F3;
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

.loading-state {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-text {
	font-size: 14px;
	color: #949494;
}

.content-scroll {
	flex: 1;
	background-color: #F3F3F3;
}

.delivery-type-badge {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 10px 16px;
	background-color: #FFFFFF;
}
.badge-text {
	font-size: 13px;
	font-weight: 600;
	color: #F2B131;
	padding: 4px 16px;
	background-color: #FFF8E1;
	border-radius: 14px;
}

.divider {
	height: 6px;
	background-color: #F3F3F3;
}

.section-card {
	background-color: #FFFFFF;
	border-radius: 8px;
	margin: 0 16px;
	padding: 10px 16px;
}

.section-title {
	padding: 10px 0;
}

.title-text {
	font-size: 14px;
	font-weight: 700;
	color: #000000CC;
}

.address-content {
	display: flex;
	align-items: center;
}

.address-icon {
	width: 20px;
	height: 20px;
	margin-right: 12px;
}

.address-info {
	flex: 1;
}

.address-header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 4px;
}

.address-name {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
}

.address-phone {
	font-size: 14px;
	color: #00000099;
}

.address-detail {
	font-size: 12px;
	color: #00000099;
}

.arrow-icon {
	width: 20px;
	height: 20px;
}

.shop-content {
	display: flex;
	align-items: center;
}

.shop-icon {
	width: 20px;
	height: 20px;
	margin-right: 12px;
}

.shop-info {
	flex: 1;
}

.shop-name {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
	display: block;
	margin-bottom: 4px;
}

.shop-address {
	font-size: 12px;
	color: #00000099;
}

.product-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.product-item {
	display: flex;
	align-items: center;
}

.product-image {
	width: 56px;
	height: 56px;
	border-radius: 8px;
	margin-right: 10px;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 4px;
}

.product-name {
	font-size: 12px;
	color: #000000CC;
}

.product-specs {
	display: flex;
}

.specs-text {
	font-size: 11px;
	color: #949494;
}

.product-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.product-price {
	font-size: 12px;
	font-weight: 500;
	color: #000000CC;
}

.product-quantity {
	font-size: 12px;
	color: #00000099;
}

.time-row, .payment-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.time-label, .payment-label {
	font-size: 12px;
	font-weight: 500;
	color: #00000099;
}

.time-value, .payment-value {
	display: flex;
	align-items: center;
}

.time-text, .payment-text {
	font-size: 12px;
	color: #00000099;
	margin-right: 4px;
}

.arrow-icon-small {
	width: 16px;
	height: 16px;
}

/* 优惠券选择 */
.coupon-section .section-card {
	padding: 12px 16px;
}

.coupon-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

/* 酒水/排除分类提示行 */
.excluded-hint-row {
	padding: 12px 0;
	text-align: center;
}
.excluded-hint-text {
	font-size: 12px;
	color: #999;
	line-height: 1.5;
}

.coupon-row .coupon-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.coupon-label {
	font-size: 12px;
	font-weight: 500;
	color: #00000099;
}

.coupon-count {
	font-size: 11px;
	color: #F2B131;
}

.coupon-row .coupon-right {
	display: flex;
	align-items: center;
}

.coupon-selected {
	font-size: 12px;
	color: #DA3300;
	font-weight: 500;
	margin-right: 4px;
}

.coupon-hint {
	font-size: 12px;
	color: #00000066;
	margin-right: 4px;
}

.coupon-selected-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 8px;
	padding-top: 8px;
	border-top: 1px dashed #F3F3F3;
}

.coupon-selected-info .coupon-name {
	font-size: 11px;
	color: #00000099;
}

.coupon-remove {
	font-size: 16px;
	color: #00000066;
	padding: 0 4px;
}

/* 优惠券弹窗 */
.coupon-picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: flex-end;
	z-index: 999;
}

.coupon-picker {
	width: 100%;
	height: 70vh;
	background-color: #FFFFFF;
	border-radius: 16px 16px 0 0;
	padding: 16px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.coupon-picker .picker-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 12px;
	border-bottom: 1px solid #F3F3F3;
	margin-bottom: 8px;
	flex-shrink: 0;
}

.coupon-picker .picker-title {
	font-size: 14px;
	font-weight: 700;
	color: #000000CC;
}

.coupon-picker .picker-close {
	font-size: 20px;
	color: #00000066;
	padding: 4px 8px;
}

/* scroll-view 必须给定高度才能内部滚动；用 flex: 1 + min-height: 0 占满剩余空间 */
.coupon-picker .picker-list {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.coupon-picker .picker-item {
	display: flex;
	align-items: center;
	padding: 12px;
	border-radius: 8px;
	border: 1px solid #F3F3F3;
}

.coupon-picker .picker-item-active {
	border-color: #F2B131;
	background-color: #FFF8E8;
}

.coupon-picker .picker-item-disabled {
	opacity: 0.45;
}
.coupon-picker .picker-item-disabled .picker-coupon-name {
	color: #999;
}
.coupon-picker .picker-item-disabled .picker-coupon-desc {
	color: #DA3300;
	font-size: 11px;
}

.picker-coupon-amount {
	min-width: 60px;
}

.picker-coupon-value {
	font-size: 16px;
	font-weight: 700;
	color: #DA3300;
}

.picker-coupon-info {
	flex: 1;
	padding-left: 12px;
}

.picker-coupon-name {
	font-size: 13px;
	font-weight: 500;
	color: #000000CC;
	display: block;
}

.picker-coupon-desc {
	font-size: 11px;
	color: #949494;
	margin-top: 2px;
	display: block;
}

.picker-check {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background-color: #F2B131;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-mark {
	font-size: 14px;
	color: #FFFFFF;
}

.picker-item-none {
	padding: 16px 12px;
	justify-content: center;
}

.picker-more {
	padding: 12px 0;
	text-align: center;
}
.picker-more-text {
	font-size: 11px;
	color: #999;
}

/* 金币抵扣 */
.coin-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.coin-hint-row {
	margin-top: 8px;
	padding: 0 4px;
}

.coin-hint {
	font-size: 11px;
	color: #FF6B00;
	line-height: 1.4;
}

.coin-hint-row.threshold-not-met .coin-hint {
	color: #999999;
}

/* 双方案选择卡片 */
/* 金币档位列表（按档位抵扣） */
.coin-tier-group {
	margin-top: 12px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.coin-tier-card {
	padding: 12px 14px;
	border-radius: 10px;
	background-color: #FAFAFA;
	border: 1.5px solid #E5E5E5;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: border-color 0.15s, background-color 0.15s;
}

.coin-tier-card.coin-tier-active {
	border-color: #F2B131;
	background-color: #FFF8E1;
}

.coin-tier-card.coin-tier-disabled {
	opacity: 0.55;
}

.coin-tier-main {
	flex: 1;
	min-width: 0;
}

.coin-tier-summary {
	font-size: 13px;
	font-weight: 600;
	color: #1A1A1A;
}

.coin-tier-check {
	font-size: 16px;
	font-weight: 700;
	color: #F2B131;
	margin-left: 8px;
	flex-shrink: 0;
}

.coin-tier-reason {
	font-size: 11px;
	color: #999;
	margin-left: 8px;
	flex-shrink: 0;
	max-width: 50%;
	text-align: right;
}

.coin-tier-loading {
	margin-top: 12px;
	padding: 16px;
	text-align: center;
}

.coin-tier-loading-text {
	font-size: 12px;
	color: #999;
}

.coin-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.coin-icon {
	width: 20px;
	height: 20px;
}

.coin-label {
	font-size: 12px;
	font-weight: 500;
	color: #00000099;
}

.coin-balance {
	font-size: 11px;
	color: #949494;
}

.coin-right {
	display: flex;
	align-items: center;
	gap: 8px;
}

.coin-limit {
				font-size: 10px;
				color: #F2B131;
				margin-left: 4px;
			}

			.coin-deduct {
	font-size: 12px;
	color: #DA3300;
}

.shop-name-row {
	padding: 8px 0;
	border-bottom: 1px solid #F3F3F3;
}

.shop-name-text {
	font-size: 10px;
	color: #00000099;
}

.cost-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 10px 0;
	border-bottom: 1px solid #F3F3F3;
}

.cost-item {
	display: flex;
	align-items: center;
}

.cost-image {
	width: 56px;
	height: 56px;
	border-radius: 8px;
	margin-right: 10px;
}

.cost-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.cost-name-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.cost-name {
	font-size: 12px;
	color: #000000CC;
}

.cost-specs {
	font-size: 10px;
	color: #949494;
}

.cost-price {
	font-size: 12px;
	color: #000000CC;
}

.cost-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 0;
}

.cost-label {
	font-size: 12px;
	color: #00000099;
}

.cost-value {
	font-size: 12px;
	color: #00000099;
}

.cost-value.discount {
	color: #DA3300;
}

.coupon-skip-hint {
	display: inline-block;
	margin-left: 6px;
	font-size: 11px;
	color: #999;
	font-style: italic;
}

.total-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 8px;
	border-top: 1px solid #F3F3F3;
}

.total-label {
	font-size: 14px;
	color: #000000CC;
}

.total-value {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
}

/* 预计获得金币/积分 */
.reward-row {
	display: flex;
	gap: 16px;
	padding: 8px 12px 0;
}
.reward-item {
	display: flex;
	align-items: center;
	gap: 4px;
}
.reward-icon {
	font-size: 14px;
}
.reward-text {
	font-size: 12px;
	color: #F2B131;
	font-weight: 600;
}

.remark-row {
	display: flex;
	align-items: center;
}

.remark-label {
	font-size: 12px;
	color: #00000099;
	width: 50px;
}

.remark-input {
	flex: 1;
	font-size: 12px;
	color: #000000CC;
}

.remark-placeholder {
	color: #00000066;
}

.bottom-placeholder {
	height: 20px;
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 64px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.total-section {
	display: flex;
	align-items: center;
}

.total-text {
	font-size: 14px;
	color: #000000CC;
}

.total-price {
	font-size: 20px;
	font-weight: 700;
	color: #DA3300;
}

.submit-btn {
	background-color: #F2B131;
	border-radius: 22px;
	padding: 12px 32px;
}

.submit-btn-disabled {
	opacity: 0.6;
}

.submit-text {
	font-size: 16px;
	font-weight: 500;
	color: #FFFFFF;
}

/* 通用弹窗样式 */
.picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: flex-end;
	z-index: 999;
}

.picker-panel {
	width: 100%;
	background-color: #FFFFFF;
	border-radius: 16px 16px 0 0;
	padding: 16px;
	max-height: 50vh;
}

.picker-header {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-bottom: 12px;
	border-bottom: 1px solid #F3F3F3;
	margin-bottom: 8px;
}

.picker-title {
	font-size: 14px;
	font-weight: 700;
	color: #000000CC;
}

.picker-list {
	display: flex;
	flex-direction: column;
}

.picker-item {
	height: 48px;
	display: flex;
	align-items: center;
	padding: 0 16px;
	border-radius: 8px;
}

.picker-item-active {
	background-color: #FFF8E8;
}

.picker-item-text {
	font-size: 14px;
	color: #000000CC;
}

.picker-item-active .picker-item-text {
	font-weight: 700;
	color: #F2B131;
}
</style>
