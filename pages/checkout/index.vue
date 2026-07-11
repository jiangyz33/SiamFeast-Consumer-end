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
			<view class="coupon-section">
				<view class="section-card">
					<view class="coupon-row" @click="availableCoupons.length > 0 ? (showCouponPicker = true) : null">
						<view class="coupon-left">
							<text class="coupon-label">{{ t('checkout.coupon') }}</text>
							<text class="coupon-count" v-if="availableCoupons.length > 0">{{ t('checkout.couponAvailable', { n: availableCoupons.length }) }}</text>
							<text class="coupon-count" v-else>{{ t('checkout.couponNone') }}</text>
						</view>
						<view class="coupon-right">
							<text class="coupon-selected" v-if="selectedCoupon">-฿{{ selectedCoupon.amount.toFixed(2) }}</text>
							<text class="coupon-hint" v-else-if="availableCoupons.length > 0">{{ t('checkout.pleaseSelect') }}</text>
							<text class="coupon-hint" v-else>{{ t('checkout.couponNoAvailable') }}</text>
							<image class="arrow-icon-small" src="/static/icons/arrow-right.svg" mode="aspectFit" v-if="availableCoupons.length > 0"></image>
						</view>
					</view>
					<view class="coupon-selected-info" v-if="selectedCoupon">
						<text class="coupon-name">{{ selectedCoupon.name }}</text>
						<text class="coupon-remove" @click.stop="clearCoupon">×</text>
					</view>
				</view>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 金币抵扣 -->
			<view class="coin-section" v-if="coinBalance > 0">
				<view class="section-card">
					<view class="coin-row">
						<view class="coin-left">
							<image class="coin-icon" src="/static/icons/coin.svg" mode="aspectFit"></image>
							<text class="coin-label">{{ t('orderDetail.coinDeduct') }}</text>
							<!-- 显示用户当前金币余额（不再本地算 maxCoinUsage，由后端 used_coins 决定）-->
							<text class="coin-balance">{{ t("orderDetail.coinsUnit", { n: coinBalance }) }}</text>
						</view>
						<view class="coin-right">
							<text class="coin-deduct" v-if="useCoins">-฿{{ coinDeductAmount }}</text>
							<switch :checked="useCoins" @change="handleCoinToggle" color="#F2B131" :disabled="!coinDeductAvailable" />
						</view>
					</view>
					<view class="coin-hint-row" v-if="maxDeductAmount > 0">
						<!-- 后端文档建议：不要展示金币数（分段累进模型下没有简单 rate），只展示金额 -->
						<text class="coin-hint">{{ t('checkout.coinMaxDeductAmount', { amount: maxDeductAmount.toFixed(2) }) }}</text>
					</view>
					<view class="coin-hint-row threshold-not-met" v-if="!coinDeductAvailable">
						<text class="coin-hint">{{ t('checkout.coinThresholdNotMet') }}</text>
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
					<view class="cost-row" v-if="selectedCoupon">
						<text class="cost-label">{{ t('checkout.coupon') }}（{{ selectedCoupon.name }}）</text>
						<text class="cost-value discount">-฿{{ selectedCoupon.amount.toFixed(2) }}</text>
					</view>
					<view class="cost-row" v-if="useCoins && coinDeductAmount > 0">
						<text class="cost-label">{{ t('orderDetail.coinDeduct') }}</text>
						<text class="cost-value discount">-฿{{ coinDeductAmount.toFixed(2) }}</text>
					</view>
					<view class="total-row">
						<text class="total-label">{{ t('checkout.totalAmount') }}</text>
						<text class="total-value">฿{{ totalPrice }}</text>
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
				<scroll-view class="picker-list" scroll-y>
					<view
						class="picker-item"
						:class="{ 'picker-item-active': selectedCoupon && selectedCoupon.id === coupon.id }"
						v-for="coupon in availableCoupons"
						:key="coupon.id"
						@click="selectCoupon(coupon)"
					>
						<view class="picker-coupon-amount">
							<text class="picker-coupon-value">฿{{ coupon.amount.toFixed(2) }}</text>
						</view>
						<view class="picker-coupon-info">
							<text class="picker-coupon-name">{{ coupon.name }}</text>
							<text class="picker-coupon-desc">{{ coupon.description || '' }}</text>
						</view>
						<view class="picker-check" v-if="selectedCoupon && selectedCoupon.id === coupon.id">
							<text class="check-mark">✓</text>
						</view>
					</view>
					<view class="picker-item picker-item-none" @click="clearCoupon">
						<text class="picker-coupon-name">{{ t('checkout.couponNotUse') }}</text>
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
			<view class="submit-btn" :class="{ 'submit-btn-disabled': submitting }" @click="handleSubmit">
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
import { getPaymentMethods } from '@/api/services/payment.js'
import { createPayment } from '@/api/services/payment.js'
import i18n from '@/i18n/index.js'
import { createOrder, getCoinBalance, calculateCoinDeduct } from '@/api/services/order.js'
import { createGroupBuyOrder } from '@/api/services/groupbuy.js'
import { showToast } from '@/utils/index.js'
import appStore from '@/store/index.js'
import { getStore } from '@/api/services/store.js'

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
			paymentMethods: [],
			selectedPaymentIndex: 0,
			availableCoupons: [],
			showCouponPicker: false,
			selectedCoupon: null,
		coinBalance: 0,
		useCoins: false,
		coinDeductAmount: 0,
			maxCoinUsage: 0,
		// 金币抵扣配置（来自后端 /user-orders/calculate-coin-deduct 响应）
		coinConfig: {
			maxDeductPercent: 10,        // 每单最大抵扣比例（%），后端配置
			maxDeductAmount: 0,          // 本单最大可抵扣金额
			usedCoins: 0                 // 实际使用的金币数
		},
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
		totalPrice() {
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
		}
		this.initPage()
			// Guard: no store selected
			if (!this.shopId) {
				uni.showToast({ title: i18n.t("dinein.selectStoreTitle") || "请选择门店", icon: "none" })
				setTimeout(() => uni.navigateBack(), 1500)
				return
			}

		this.loadCheckoutData()

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

				const [addressRes, paymentRes, couponRes, coinRes] = await Promise.allSettled([
					getAddressList(),
					getPaymentMethods(this.shopId),
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

				if (paymentRes.status === 'fulfilled' && paymentRes.value.code === 0 && paymentRes.value.data) {
					this.paymentMethods = paymentRes.value.data.methods || []
				}

				// 优惠券 - 优先用available接口，回退到my接口
				let couponItems = []
				if (couponRes.status === 'fulfilled' && couponRes.value.code === 0 && couponRes.value.data) {
					const items = couponRes.value.data.items || couponRes.value.data || []
					couponItems = Array.isArray(items) ? items : []
				}
				// 如果available接口返回空，尝试从my接口获取可用优惠券
				if (couponItems.length === 0) {
					try {
						const myRes = await getMyCoupons({ status: 'all' })
						if (myRes.code === 0 && myRes.data) {
							const myItems = myRes.data.items || myRes.data || []
							couponItems = (Array.isArray(myItems) ? myItems : []).filter(c => c.status === 'UNUSED' || c.status === 'CLAIMED' || c.status === 'ACTIVE')
						}
					} catch(e) { console.log('fallback getMyCoupons failed:', e) }
				}
				if (couponItems.length > 0) {
					const lang = i18n.getLanguage()
					this.availableCoupons = couponItems.map(c => {
						const tpl = c.template || {}
						return {
							id: c.id,
							coupon_code: c.coupon_code || '',
							name: tpl['name_' + lang] || tpl.name || c['name_' + lang] || c.name || c.coupon_name || '',
							amount: c.value || tpl.discount_value || c.discount_value || c.amount || 0,
							min_spend: tpl.min_order_amount || c.min_order_amount || c.min_spend || 0,
							valid_end: c.valid_end || c.validity_end || '',
							description: tpl['description_' + lang] || tpl.description || c['description_' + lang] || c.description || ''
						}
					}).filter(c => c.amount > 0 && (!c.min_spend || this.productTotal >= c.min_spend))
					if (this.availableCoupons.length > 0) {
						this.selectedCoupon = this.availableCoupons.reduce((best, c) => c.amount > best.amount ? c : best, this.availableCoupons[0])
					}
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
			return Object.entries(specs).map(([key, val]) => {
				const label = specLabels[key] || key
				const optionLabel = specOptions[val] || val
				return `${label}：${optionLabel}`
			}).join(' / ')
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

		selectCoupon(coupon) {
			this.selectedCoupon = coupon
			this.showCouponPicker = false
		},

		clearCoupon() {
			this.selectedCoupon = null
			this.showCouponPicker = false
		},

			async handleCoinToggle(e) {
				this.useCoins = e.detail.value
				if (this.useCoins && !this.coinDeductAvailable) {
					this.useCoins = false
					uni.showModal({
						title: '',
						content: this.i18n.t('checkout.coinThresholdNotMet'),
						showCancel: false,
						confirmText: this.i18n.t('common.confirm')
					})
					return
				}
				if (this.useCoins && this.coinBalance > 0) {
				try {
					// 后端 A 算法分段累进，会自动按 max_deduct_percent 上限、按余额上限、按订单金额上限算
					// 前端直接传用户全部余额，让后端算实际使用金币数（used_coins）和实际抵扣额（deduct_amount）
					const coinsToSend = this.coinBalance
					const res = await calculateCoinDeduct(this.productTotal, coinsToSend)
					if (res.code === 0 && res.data) {
						if (res.data.max_coins) this.maxCoinUsage = res.data.max_coins
						// 保存后端配置（来自 coin_deduction_configs 表）
						if (res.data.max_deduct_percent) this.coinConfig.maxDeductPercent = res.data.max_deduct_percent
						if (res.data.max_deduct_amount) this.coinConfig.maxDeductAmount = res.data.max_deduct_amount
						if (res.data.used_coins !== undefined) this.coinConfig.usedCoins = res.data.used_coins
						// 实际抵扣金额（A 算法分段累进计算后的值）
						let deduct = res.data.deduct_amount || 0
						// 双重保险：再按 maxDeductAmount 兜底一次
						if (deduct > this.maxDeductAmount) {
							deduct = this.maxDeductAmount
						}
						if (deduct <= 0) {
							this.useCoins = false
							this.coinDeductAmount = 0
							uni.showModal({
								title: '',
								content: this.i18n.t('checkout.coinDeductUnavailable'),
								showCancel: false,
								confirmText: this.i18n.t('common.confirm')
							})
						} else {
							this.coinDeductAmount = deduct
						}
					}
				} catch (e) {
					this.useCoins = false
					this.coinDeductAmount = 0
				}
			} else {
				this.coinDeductAmount = 0
			}
			},

		async handleSubmit() {
			if (this.submitting) return

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
						items: this.cartItems.map(item => ({
							menu_item_id: item.id,
							item_name: item.name || '',
							quantity: item.quantity,
							unit_price: item.price,
							specs: item.specs || {},
							remark: ''
						})),
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

					if (this.useCoins && this.coinDeductAmount > 0) {
						orderData.use_coins = true
						// 直接用后端 calculateCoinDeduct 接口返回的 used_coins
						// （A 算法分段累进计算出的实际使用金币数，已包含余额/上限/比例约束）
						// 兜底：如果接口没返回 used_coins，用 coinConfig 保存的值；再没有就用 coinDeductAmount（隐含 1:1）
						const usedCoins = this.coinConfig.usedCoins
							|| Math.ceil(this.coinDeductAmount)
						// 双重保险：不超过用户余额
						orderData.coins_to_use = Math.min(usedCoins, this.coinBalance)
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
				showToast(i18n.t('checkout.submitFailed'))
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
	background-color: #FFFFFF;
	border-radius: 16px 16px 0 0;
	padding: 16px;
	max-height: 50vh;
}

.coupon-picker .picker-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 12px;
	border-bottom: 1px solid #F3F3F3;
	margin-bottom: 8px;
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

.coupon-picker .picker-list {
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
