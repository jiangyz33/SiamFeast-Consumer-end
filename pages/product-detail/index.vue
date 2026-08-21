<template>
	<view class="product-detail-page" :data-lang="langVersion">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('productDetail.specs') }}</text>
			<view class="nav-right">
				<view class="fav-btn" @click="handleToggleFavorite">
					<image
						class="fav-icon"
						:src="isFavorited ? '/static/icons/favorited.svg' : '/static/icons/favorite.svg'"
						mode="aspectFit"
					></image>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-wrapper" v-if="loading">
			<text class="loading-text">{{ t('common.loading') }}</text>
		</view>

		<!-- 内容区域 -->
		<scroll-view v-else class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 商品图片 -->
			<view class="product-image-section">
				<image class="product-image" :src="fixMinioUrl(product.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
				<view class="new-badge" v-if="product.is_new_product">
					<text class="new-badge-text">{{ i18n.t('productDetail.new') }}</text>
				</view>
			</view>

			<!-- 商品信息卡片 -->
			<view class="product-info-card">
				<view class="price-row">
					<view class="price-main">
						<text class="price-symbol">฿</text>
						<text class="price-num">{{ product.price }}</text>
					</view>
					<text class="price-original" v-if="product.original_price && Number(product.original_price) > Number(product.price)">฿{{ product.original_price }}</text>
				</view>
				<text class="product-name">{{ product['name_' + i18n.getLanguage()] || product.name || product.name_en }}</text>

				<!-- 所属门店（点餐入口下线期间不显示跳店行） -->
				<view class="shop-row" v-if="ORDERING_ENABLED && shopInfo.name" @click="goToShop">
					<image class="shop-row-logo" :src="shopInfo.logo" mode="aspectFill"></image>
					<text class="shop-row-name">{{ shopInfo.name }}</text>
					<text class="shop-row-arrow">›</text>
				</view>

				<!-- 标签 -->
				<view class="product-tags" v-if="product.tags && product.tags.length > 0">
					<text class="tag" v-for="(tag, idx) in product.tags" :key="idx">{{ tag }}</text>
				</view>

				<!-- 销量统计 -->
				<view class="stats-row" v-if="product.sales_count || product.repeat_customers">
					<view class="stat-item" v-if="product.sales_count">
						<text class="stat-num">{{ product.sales_count }}</text>
						<text class="stat-label">{{ t('mine.monthlySales') }}</text>
					</view>
					<view class="stat-divider" v-if="product.sales_count && product.repeat_customers"></view>
					<view class="stat-item" v-if="product.repeat_customers">
						<text class="stat-num">{{ product.repeat_customers }}</text>
						<text class="stat-label">回头客</text>
					</view>
					<view class="stat-divider" v-if="product.weekly_sales"></view>
					<view class="stat-item" v-if="product.weekly_sales">
						<text class="stat-num">{{ product.weekly_sales }}</text>
						<text class="stat-label">周售</text>
					</view>
				</view>
			</view>

			<!-- 商品详情 -->
			<view class="detail-card">
				<text class="card-title">{{ t('productDetail.detailTitle') }}</text>
				<view class="detail-content">
					<image
						v-if="product.detail_image"
						class="detail-image"
						:src="product.detail_image"
						mode="widthFix"
					></image>
					<text class="detail-text" v-if="product.description">{{ product['description_' + i18n.getLanguage()] || product.description }}</text>
					<text class="detail-text" v-else>{{ product['name_' + i18n.getLanguage()] || product.name || product.name_en }}</text>
				</view>
			</view>

			<!-- 购买须知 -->
			<view class="notice-card">
				<text class="card-title">{{ t('productDetail.purchaseNotice') }}</text>
				<view class="notice-list">
					<view class="notice-item">
						<text class="notice-dot">·</text>
						<text class="notice-text">{{ t('productDetail.noticeImage') }}</text>
					</view>
					<view class="notice-item">
						<text class="notice-dot">·</text>
						<text class="notice-text">{{ t('productDetail.noticeAllergy') }}</text>
					</view>
				</view>
			</view>

			<!-- 更多推荐 -->
			<view class="recommend-card" v-if="recommendations.length > 0">
				<text class="card-title">{{ t('productDetail.recommend') }}</text>
				<view class="recommend-list">
					<view
						v-for="item in recommendations"
						:key="item.id"
						class="recommend-item"
						@click="handleRecommendClick(item)"
					>
						<image class="recommend-image" :src="fixMinioUrl(item.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
						<text class="recommend-name">{{ item['name_' + i18n.getLanguage()] || item.name || item.name_en }}</text>
						<view class="recommend-price">
							<text class="recommend-price-symbol">฿</text>
							<text class="recommend-price-num">{{ item.price }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部购买栏（点餐入口临时下线：隐藏加购/立即购买，保留分享） -->
		<view class="buy-bar" v-if="!loading">
			<view class="buy-bar-left">
				<view class="bar-action" @click="handleShareProduct">
					<image class="bar-action-icon" src="/static/icons/share.svg" mode="aspectFit"></image>
					<text class="bar-action-text">{{ t('productDetail.share') }}</text>
				</view>
			</view>
			<view class="buy-bar-right" v-if="ORDERING_ENABLED">
				<view class="buy-btn buy-btn-cart" @click="handleAddToCart">
					<text class="buy-btn-text">{{ t('productDetail.addToCart') }}</text>
				</view>
				<view class="buy-btn buy-btn-now" @click="handleBuyNow">
					<text class="buy-btn-text">{{ t('productDetail.buyNow') }}</text>
				</view>
			</view>
		</view>

		<!-- 分享弹窗 -->
		<share-modal
			:visible="showShareModal"
			:shareInfo="shareInfo"
			@close="handleShareModalClose"
			@confirm="handleShareConfirm"
		></share-modal>

		<!-- 规格选择弹窗 -->
		<view v-if="showSpecsModal" class="specs-mask" @click="closeSpecsModal">
			<view class="specs-sheet" @click.stop>
				<!-- 商品概要 -->
				<view class="specs-header">
					<image class="specs-product-img" :src="fixMinioUrl(product.image_url) || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
					<view class="specs-product-info">
						<text class="specs-product-name">{{ product['name_' + i18n.getLanguage()] || product.name }}</text>
						<view class="specs-product-price">
							<text class="specs-price-symbol">฿</text>
							<text class="specs-price-num">{{ getSpecPrice() * specsQuantity }}</text>
						</view>
					</view>
					<view class="specs-close" @click="closeSpecsModal">
						<text class="specs-close-text">×</text>
					</view>
				</view>

				<scroll-view scroll-y class="specs-body">
					<!-- 规格(单选) -->
					<view class="spec-group" v-if="itemOptions && itemOptions.specs && itemOptions.specs.length > 0">
						<text class="spec-group-title">{{ t('productDetail.specSize') }}</text>
						<view class="spec-options">
							<view
								v-for="spec in itemOptions.specs"
								:key="spec.id"
								class="spec-option"
								:class="{ 'spec-option-active': selectedSpec && selectedSpec.id === spec.id }"
								@click="selectSpec(spec)"
							>
								<text class="spec-option-name">{{ _optionName(spec) }}</text>
								<text class="spec-option-price" v-if="spec.price_diff > 0">+฿{{ spec.price_diff }}</text>
							</view>
						</view>
					</view>

					<!-- 口味(单选) -->
					<view class="spec-group" v-if="itemOptions && itemOptions.flavors && itemOptions.flavors.length > 0">
						<text class="spec-group-title">{{ t('productDetail.specFlavor') }}</text>
						<view class="spec-options">
							<view
								v-for="flavor in itemOptions.flavors"
								:key="flavor.id"
								class="spec-option"
								:class="{ 'spec-option-active': selectedFlavor && selectedFlavor.id === flavor.id }"
								@click="selectFlavor(flavor)"
							>
								<text class="spec-option-name">{{ _optionName(flavor) }}</text>
								<text class="spec-option-price" v-if="flavor.price_diff > 0">+฿{{ flavor.price_diff }}</text>
							</view>
						</view>
					</view>

					<!-- 加料(多选) -->
					<view class="spec-group" v-if="itemOptions && itemOptions.toppings && itemOptions.toppings.length > 0">
						<text class="spec-group-title">{{ t('productDetail.specTopping') }}</text>
						<view class="spec-options">
							<view
								v-for="topping in itemOptions.toppings"
								:key="topping.id"
								class="spec-option"
								:class="{ 'spec-option-active': selectedToppings.some(t => t.id === topping.id) }"
								@click="toggleTopping(topping)"
							>
								<text class="spec-option-name">{{ _optionName(topping) }}</text>
								<text class="spec-option-price" v-if="topping.price_diff > 0">+฿{{ topping.price_diff }}</text>
							</view>
						</view>
					</view>
				</scroll-view>

				<!-- 数量 + 按钮 -->
				<view class="specs-footer">
					<view class="specs-qty">
						<view class="qty-btn" @click="specsQtyDecrease"><text class="qty-text">−</text></view>
						<text class="qty-num">{{ specsQuantity }}</text>
						<view class="qty-btn" @click="specsQtyIncrease"><text class="qty-text">+</text></view>
					</view>
					<view class="specs-actions">
						<view class="specs-btn specs-btn-cart" @click="specsConfirmAddToCart">
							<text class="specs-btn-text">{{ t('productDetail.addToCart') }}</text>
						</view>
						<view class="specs-btn specs-btn-now" @click="specsConfirmBuyNow">
							<text class="specs-btn-text">{{ t('productDetail.buyNow') }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { showToast, fixMinioUrl } from '@/utils/index.js'
import { shareProduct, ShareType } from '@/utils/share.js'
import ShareModal from '@/components/share-modal.vue'
import i18n from '@/i18n/index.js'
import appStore from '@/store/index.js'
import { ORDERING_ENABLED } from '@/utils/featureFlags.js'
import { getMenuItem, getMenuItemOptions } from '@/api/services/menu.js'
import footprintManager from '@/utils/footprint.js'
import { getAvailableCoupons } from '@/api/services/coupon.js'
import { getHotProducts } from '@/api/services/products.js'
import { checkFavorite, addFavorite, removeFavorite } from '@/api/services/favorite.js'
import { getStore } from '@/api/services/store.js'

export default {
	components: {
		ShareModal
	},
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			ORDERING_ENABLED: ORDERING_ENABLED,
			statusBarHeight: 20,
			contentHeight: 500,
			loading: false,
			productId: null,
			shopId: null,
			product: {},
			shopInfo: {},
			maxCoupon: null,
			recommendations: [],
			isFavorited: false,
			showShareModal: false,
			shareInfo: {
				type: 'product',
				id: '',
				name: '',
				image: ''
			},
			// 规格选择
			itemOptions: null,          // 后端返回的 options(flavors/specs/toppings)
			showSpecsModal: false,      // 规格弹窗
			selectedFlavor: null,       // 选中的口味
			selectedSpec: null,         // 选中的规格
			selectedToppings: [],       // 选中的加料(多选)
			specsQuantity: 1,           // 规格弹窗里的数量
			langVersion: 0
		}
	},
	onLoad(options) {
		this.initPage()
		if (options.productId) {
			this.productId = parseInt(options.productId)
		}
		if (options.shopId) {
			this.shopId = parseInt(options.shopId)
		} else {
			const currentStore = appStore.getCurrentStore()
			if (currentStore) {
				this.shopId = currentStore.id
			}
		}
		if (this.productId) {
			this.loadProductDetail()
		}
		uni.$on('languageChanged', this.onLanguageChanged)
	},
	onUnload() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},
	methods: {
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		fixMinioUrl,

		onLanguageChanged() {
			this.langVersion++
		},

		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const buyBarHeight = 56
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - buyBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadProductDetail() {
			if (this.loading) return
			this.loading = true

			try {
				const [detailRes, couponRes, favRes] = await Promise.allSettled([
					getMenuItem(this.productId),
					getAvailableCoupons({ order_amount: 0, ...(this.shopId ? { store_id: this.shopId } : {}) }),
					checkFavorite({ target_id: this.productId, type: 'product' })
				])

				// 商品详情
				if (detailRes.status === 'fulfilled' && detailRes.value.code === 0 && detailRes.value.data) {
					this.product = detailRes.value.data

					// 始终用商品自身的 store_id（商品永远只属于一个门店，URL 的 shopId 可能传错）
					if (this.product.store_id) {
						this.shopId = this.product.store_id
					}
					// 如果有规格，加载 options
					if (this.product.has_options) {
						this.loadItemOptions()
					}

					// 拉取门店信息（用于展示店铺名）
					if (this.shopId) {
						this.loadShopInfo()
					}

				// 记录商品浏览足迹
				if (this.product && this.product.id) {
					footprintManager.addProductFootprint({
						id: this.product.id,
						name: this.product.name,
						name_zh: this.product.name_zh || this.product.name,
						name_en: this.product.name_en,
						name_th: this.product.name_th,
						image: fixMinioUrl(this.product.image_url),
						price: this.product.price,
						tags: this.product.tags,
						shopId: this.shopId,
						shopName: this.shopInfo?.name || ''
					})
				}
				}

				// 可用优惠券 - 找最大面额
				if (couponRes.status === 'fulfilled' && couponRes.value.code === 0 && couponRes.value.data) {
					const items = couponRes.value.data.items || []
					const applicable = items.map(c => {
						const tpl = c.template || {}
						return { ...c, amount: tpl.discount_value || c.amount || 0, min_spend: tpl.min_order_amount || c.min_spend || 0 }
					}).filter(c => !c.min_spend || c.min_spend <= (this.product.price || 0))
					if (applicable.length > 0) {
						applicable.sort((a, b) => b.amount - a.amount)
						this.maxCoupon = applicable[0]
					}
				}

				// 收藏状态
				if (favRes.status === 'fulfilled' && favRes.value.code === 0 && favRes.value.data) {
					this.isFavorited = favRes.value.data.is_favorited || false
				}

				// 加载推荐
				this.loadRecommendations()
			} catch (e) {
				console.error('loadProductDetail error:', e)
			} finally {
				this.loading = false
			}
		},

		async loadShopInfo() {
			if (!this.shopId) return
			try {
				const res = await getStore(this.shopId)
				if (res && res.code === 0 && res.data) {
					const s = res.data
					const lang = i18n.getLanguage()
					this.shopInfo = {
						id: s.id,
						name: s['name_' + lang] || s.name || '',
						name_zh: s.name_zh || s.name || '',
						name_en: s.name_en || '',
						name_th: s.name_th || '',
						logo: fixMinioUrl(s.logo_url || s.logo) || '/static/images/store-placeholder.svg'
					}
				}
			} catch (e) {
				console.warn('[product-detail] loadShopInfo failed:', e)
			}
		},

		async loadRecommendations() {
			try {
				const res = await getHotProducts({ limit: 5, ...(this.shopId ? { store_id: this.shopId } : {}) })
				if (res.code === 0 && res.data) {
					const items = res.data.items || []
					this.recommendations = items.filter(p => p.id !== this.productId).slice(0, 4)
				}
			} catch (e) {
				console.error('loadRecommendations error:', e)
			}
		},

		goBack() {
			uni.navigateBack()
		},
		goToShop() {
			if (this.shopId) {
				uni.navigateTo({ url: `/pages/dinein/index?shopId=${this.shopId}` })
			}
		},

		async handleToggleFavorite() {
			try {
				if (this.isFavorited) {
					const res = await removeFavorite({ target_id: this.productId, type: 'product' })
					if (res.code === 0) {
						this.isFavorited = false
						showToast('已取消收藏')
					}
				} else {
					const res = await addFavorite({
						target_id: this.productId,
						type: 'product',
						name: this.product.name || '',
						image_url: fixMinioUrl(this.product.image_url) || '',
						price: this.product.price || 0
					})
					if (res.code === 0) {
						this.isFavorited = true
						showToast('收藏成功')
					}
				}
			} catch (e) {
				console.error('handleToggleFavorite error:', e)
			}
		},

		// ============ 菜品规格 ============
		async loadItemOptions() {
			try {
				const res = await getMenuItemOptions(this.productId, this.shopId)
				if (res && res.code === 0 && res.data) {
					this.itemOptions = res.data
					if (this.itemOptions.flavors && this.itemOptions.flavors.length > 0) {
						this.selectedFlavor = this.itemOptions.flavors[0]
					}
					if (this.itemOptions.specs && this.itemOptions.specs.length > 0) {
						this.selectedSpec = this.itemOptions.specs[0]
					}
				}
			} catch (e) {
				console.warn('[product-detail] load options failed:', e)
			}
		},
		hasSpecs() {
			return this.itemOptions && (
				(this.itemOptions.flavors && this.itemOptions.flavors.length > 0) ||
				(this.itemOptions.specs && this.itemOptions.specs.length > 0) ||
				(this.itemOptions.toppings && this.itemOptions.toppings.length > 0)
			)
		},
		getSpecPrice() {
			let price = Number(this.product.price) || 0
			if (this.selectedFlavor) price += Number(this.selectedFlavor.price_diff) || 0
			if (this.selectedSpec) price += Number(this.selectedSpec.price_diff) || 0
			if (this.selectedToppings) {
				this.selectedToppings.forEach(t => { price += Number(t.price_diff) || 0 })
			}
			return price
		},
		_optionName(opt) {
			const lang = i18n.getLanguage()
			return opt['name_' + lang] || opt.name || ''
		},
		getSpecsText() {
			const parts = []
			if (this.selectedSpec) parts.push(this._optionName(this.selectedSpec))
			if (this.selectedFlavor) parts.push(this._optionName(this.selectedFlavor))
			if (this.selectedToppings) {
				this.selectedToppings.forEach(t => parts.push(this._optionName(t)))
			}
			return parts.join(' / ')
		},
		buildSpecsObject() {
			const specs = {}
			if (this.selectedSpec) specs.spec = { id: this.selectedSpec.id, name: this._optionName(this.selectedSpec), price_diff: this.selectedSpec.price_diff }
			if (this.selectedFlavor) specs.flavor = { id: this.selectedFlavor.id, name: this._optionName(this.selectedFlavor), price_diff: this.selectedFlavor.price_diff }
			if (this.selectedToppings && this.selectedToppings.length > 0) {
				specs.toppings = this.selectedToppings.map(t => ({ id: t.id, name: this._optionName(t), price_diff: t.price_diff }))
			}
			return specs
		},
		toggleTopping(topping) {
			const idx = this.selectedToppings.findIndex(t => t.id === topping.id)
			if (idx >= 0) { this.selectedToppings.splice(idx, 1) }
			else { this.selectedToppings.push(topping) }
		},
		selectFlavor(flavor) { this.selectedFlavor = flavor },
		selectSpec(spec) { this.selectedSpec = spec },
		openSpecsModal() { this.specsQuantity = 1; this.showSpecsModal = true },
		closeSpecsModal() { this.showSpecsModal = false },
		specsQtyIncrease() { this.specsQuantity++ },
		specsQtyDecrease() { if (this.specsQuantity > 1) this.specsQuantity-- },
		specsConfirmAddToCart() {
			appStore.addToCart(this.shopId, {
				id: this.product.id || this.productId,
				name: this.product.name || '',
				name_en: this.product.name_en || '',
				name_th: this.product.name_th || '',
				price: this.getSpecPrice(),
				image: fixMinioUrl(this.product.image_url) || '',
				quantity: this.specsQuantity,
				specs: this.buildSpecsObject(),
				specs_text: this.getSpecsText(),
				store_id: this.shopId
			})
			this.showSpecsModal = false
			showToast(this.i18n.t('dinein.addToCart'))
		},
		specsConfirmBuyNow() {
			const productData = {
				id: this.product.id || this.productId,
				name: this.product.name || '',
				name_en: this.product.name_en || '',
				name_th: this.product.name_th || '',
				price: this.getSpecPrice(),
				image: fixMinioUrl(this.product.image_url) || '',
				quantity: this.specsQuantity,
				specs: this.buildSpecsObject(),
				specs_text: this.getSpecsText(),
				store_id: this.shopId
			}
			const productsStr = encodeURIComponent(JSON.stringify([productData]))
			this.showSpecsModal = false
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=dinein&shopId=${this.shopId || ''}&shopName=${encodeURIComponent(this.product.store_name || '')}&products=${productsStr}`
			})
		},

		handleAddToCart() {
			if (this.product.is_sold_out) {
				showToast(this.i18n.t('dinein.soldOut'))
				return
			}
			if (this.hasSpecs()) {
				this.openSpecsModal()
				return
			}
			appStore.addToCart(this.shopId, {
				id: this.product.id || this.productId,
				name: this.product.name || '',
				name_en: this.product.name_en || '',
				name_th: this.product.name_th || '',
				price: this.product.price || 0,
				image: fixMinioUrl(this.product.image_url) || '',
				quantity: 1,
				specs: {},
				store_id: this.shopId
			})
			showToast(this.i18n.t('dinein.addToCart'))
		},

		handleBuyNow() {
			if (this.product.is_sold_out) {
				showToast('商品已售罄')
				return
			}
			// 如果有规格,弹规格选择
			if (this.hasSpecs()) {
				this.openSpecsModal()
				return
			}
			const productData = {
				id: this.product.id || this.productId,
				name: this.product.name || '',
				name_en: this.product.name_en || '',
				name_th: this.product.name_th || '',
				price: this.product.price || 0,
				image: fixMinioUrl(this.product.image_url) || '',
				quantity: 1,
				specs: {},
				store_id: this.shopId
			}
			uni.navigateTo({
				url: `/pages/checkout/index?orderType=dinein&shopId=${this.shopId}&products=${encodeURIComponent(JSON.stringify([productData]))}`
			})
		},

		handleRecommendClick(item) {
			uni.redirectTo({
				url: `/pages/product-detail/index?productId=${item.id}&shopId=${this.shopId || ''}`
			})
		},

		async handleShareProduct() {
			try {
				const lang = i18n.getLanguage()
				const productName = this.product['name_' + lang] || this.product.name || ''
				const shopName = ''
				const result = await shareProduct(
					{
						id: this.productId,
						name: productName,
						price: this.product.price || 0,
						image: fixMinioUrl(this.product.image_url) || ''
					},
					{
						id: this.shopId || 1,
						name: shopName
					}
				)

				if (result.success) {
					this.shareInfo = {
						type: 'product',
						id: this.productId,
						name: productName,
						price: this.product.price || 0,
						image: fixMinioUrl(this.product.image_url) || '',
						shopId: this.shopId || 1,
						shopName: shopName
					}
					this.showShareModal = true
					showToast(i18n.t('productDetail.linkCopied'))
				} else {
					showToast(i18n.t('productDetail.copyFailed'))
				}
			} catch (e) {
				console.error('分享失败:', e)
				showToast(i18n.t('productDetail.shareFailed'))
			}
		},

		handleShareModalClose() {
			this.showShareModal = false
		},

		handleShareConfirm() {
			this.showShareModal = false
			showToast('欢迎光临！')
		}
	}
}
</script>

<style scoped>
.product-detail-page {
	min-height: 100vh;
	background-color: #F5F5F5;
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
	display: flex;
	align-items: center;
	justify-content: center;
}

.fav-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.fav-icon {
	width: 22px;
	height: 22px;
}

/* 加载状态 */
.loading-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-text {
	font-size: 14px;
	color: #949494;
}

/* 内容区域 */
.content-scroll {
	flex: 1;
	background-color: #F5F5F5;
}

/* 商品图片 */
.product-image-section {
	width: 100%;
	height: 280px;
	background-color: #FFFFFF;
	position: relative;
}

/* 新品角标 */
.new-badge {
	position: absolute;
	top: 12px;
	left: 12px;
	background: linear-gradient(135deg, #FF6B6B 0%, #DA3300 100%);
	padding: 4px 12px;
	border-radius: 6px;
	z-index: 2;
	box-shadow: 0 2px 6px rgba(218, 51, 0, 0.3);
}
.new-badge-text {
	font-size: 12px;
	color: #FFFFFF;
	font-weight: 700;
	line-height: 1.2;
}

.product-image {
	width: 100%;
	height: 100%;
}

/* 商品信息卡片 */
.product-info-card {
	background-color: #FFFFFF;
	padding: 16px;
	margin-bottom: 10px;
}

.price-row {
	display: flex;
	align-items: baseline;
	gap: 8px;
	margin-bottom: 8px;
}

.price-main {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 14px;
	font-weight: 600;
	color: #DA3300;
}

.price-num {
	font-size: 28px;
	font-weight: 700;
	color: #DA3300;
}

.price-original {
	font-size: 14px;
	color: #949494;
	text-decoration: line-through;
}

.product-name {
	font-size: 18px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.9);
	margin-bottom: 6px;
}

/* 所属门店行 */
.shop-row {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	margin-bottom: 6px;
	background-color: #FFF8E1;
	border-radius: 8px;
}
.shop-row-logo {
	width: 28px;
	height: 28px;
	border-radius: 6px;
	flex-shrink: 0;
}
.shop-row-name {
	flex: 1;
	font-size: 15px;
	font-weight: 600;
	color: #5D4037;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.shop-row-arrow {
	font-size: 20px;
	color: #F2B131;
	line-height: 1;
}

.product-desc {
	font-size: 13px;
	color: #949494;
	line-height: 18px;
	margin-bottom: 8px;
}

.product-tags {
	display: flex;
	gap: 6px;
	margin-bottom: 10px;
}

.tag {
	font-size: 11px;
	color: #F2B131;
	background-color: rgba(242, 177, 49, 0.15);
	padding: 2px 8px;
	border-radius: 4px;
}

/* 销量统计 */
.stats-row {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 0;
	border-top: 1px solid #F5F5F5;
	margin-top: 4px;
}

.stat-item {
	display: flex;
	align-items: baseline;
	gap: 4px;
}

.stat-num {
	font-size: 14px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.8);
}

.stat-label {
	font-size: 11px;
	color: #949494;
}

.stat-divider {
	width: 1px;
	height: 12px;
	background-color: #E5E5E5;
}

/* 领券减价 */
.coupon-tag {
	display: inline-flex;
	background-color: #FFF5F0;
	border: 1px solid #FFD5C0;
	border-radius: 4px;
	padding: 4px 10px;
	margin-top: 8px;
}

.coupon-tag-text {
	font-size: 12px;
	color: #DA3300;
	font-weight: 500;
}

/* 详情卡片 */
.detail-card,
.notice-card,
.recommend-card {
	background-color: #FFFFFF;
	padding: 16px;
	margin-bottom: 10px;
}

.card-title {
	font-size: 15px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.9);
	margin-bottom: 12px;
}

.detail-content {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.detail-image {
	width: 100%;
	border-radius: 8px;
}

.detail-text {
	font-size: 13px;
	color: #666666;
	line-height: 20px;
}

/* 购买须知 */
.notice-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.notice-item {
	display: flex;
	align-items: flex-start;
	gap: 6px;
}

.notice-dot {
	font-size: 14px;
	color: #949494;
}

.notice-text {
	font-size: 12px;
	color: #949494;
	line-height: 18px;
}

/* 更多推荐 */
.recommend-list {
	display: flex;
	gap: 10px;
	overflow-x: auto;
}

.recommend-item {
	width: 120px;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.recommend-image {
	width: 120px;
	height: 120px;
	border-radius: 8px;
}

.recommend-name {
	font-size: 13px;
	font-weight: 500;
	color: rgba(0, 0, 0, 0.8);
	lines: 1;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.recommend-price {
	display: flex;
	align-items: baseline;
}

.recommend-price-symbol {
	font-size: 11px;
	font-weight: 600;
	color: #DA3300;
}

.recommend-price-num {
	font-size: 15px;
	font-weight: 700;
	color: #DA3300;
}

/* 底部占位 */
.bottom-placeholder {
	height: 70px;
}

/* 底部购买栏 */
.buy-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 56px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	padding: 0 16px;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
	z-index: 100;
}

.buy-bar-left {
	display: flex;
	align-items: center;
	margin-right: 16px;
}

.bar-action {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
}

.bar-action-icon {
	width: 22px;
	height: 22px;
}

.bar-action-text {
	font-size: 10px;
	color: #949494;
}

.buy-bar-right {
	flex: 1;
	display: flex;
	gap: 10px;
}

.buy-btn {
	flex: 1;
	height: 40px;
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.buy-btn-cart {
	background-color: #F2B131;
}

.buy-btn-now {
	background-color: #DA3300;
}

.buy-btn-text {
	font-size: 14px;
	font-weight: 600;
	color: #FFFFFF;
}

/* ============ 规格选择弹窗 ============ */
.specs-mask {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background-color: rgba(0,0,0,0.6);
	z-index: 9999;
	display: flex;
	align-items: flex-end;
}

.specs-sheet {
	width: 100%;
	max-height: 80vh;
	background-color: #FFFFFF;
	border-radius: 24rpx 24rpx 0 0;
	display: flex;
	flex-direction: column;
}

.specs-header {
	display: flex;
	flex-direction: row;
	padding: 24rpx;
	border-bottom: 1px solid #F0F0F0;
}

.specs-product-img {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	margin-right: 20rpx;
}

.specs-product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.specs-product-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-bottom: 8rpx;
}

.specs-product-price {
	display: flex;
	flex-direction: row;
	align-items: baseline;
}

.specs-price-symbol {
	font-size: 24rpx;
	color: #F2B131;
}

.specs-price-num {
	font-size: 40rpx;
	font-weight: 700;
	color: #F2B131;
}

.specs-close {
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.specs-close-text {
	font-size: 40rpx;
	color: #999;
	line-height: 1;
}

.specs-body {
	flex: 1;
	padding: 0 24rpx;
	max-height: 500rpx;
}

.spec-group {
	padding: 24rpx 0;
	border-bottom: 1px solid #F8F8F8;
}

.spec-group-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-bottom: 16rpx;
}

.spec-options {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.spec-option {
	padding: 12rpx 24rpx;
	border: 2rpx solid #E0E0E0;
	border-radius: 12rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	background-color: #FAFAFA;
}

.spec-option-active {
	border-color: #F2B131;
	background-color: #FFF8E1;
}

.spec-option-name {
	font-size: 26rpx;
	color: #333;
}

.spec-option-active .spec-option-name {
	color: #F2B131;
	font-weight: 600;
}

.spec-option-price {
	font-size: 22rpx;
	color: #999;
	margin-left: 8rpx;
}

.spec-option-active .spec-option-price {
	color: #F2B131;
}

.specs-footer {
	padding: 20rpx 24rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	border-top: 1px solid #F0F0F0;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 16rpx;
}

.specs-qty {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8rpx;
}

.qty-btn {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background-color: #F5F5F5;
	display: flex;
	align-items: center;
	justify-content: center;
}

.qty-text {
	font-size: 32rpx;
	color: #333;
}

.qty-num {
	font-size: 30rpx;
	font-weight: 600;
	color: #1A1A1A;
	min-width: 48rpx;
	text-align: center;
}

.specs-actions {
	flex: 1;
	display: flex;
	flex-direction: row;
	gap: 12rpx;
}

.specs-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.specs-btn-cart {
	background-color: #F2B131;
}

.specs-btn-now {
	background-color: #FF6B9D;
}

.specs-btn-text {
	color: #FFFFFF;
	font-size: 28rpx;
	font-weight: 600;
}
</style>
