<template>
	<view class="footprint-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ i18n.t('footprint.title') }}</text>
			<view class="nav-right">
				<text class="clear-btn" @click="showClearConfirm" v-if="hasData">{{ i18n.t('common.clear') }}</text>
			</view>
		</view>

		<!-- Tab切换 -->
		<view class="tab-bar">
			<view
				class="tab-item"
				:class="{ 'tab-active': activeTab === 0 }"
				@click="switchTab(0)"
			>
				<text class="tab-text">{{ i18n.t('footprint.products') }}</text>
				<text class="tab-count" v-if="productCount > 0">({{ productCount }})</text>
			</view>
			<view
				class="tab-item"
				:class="{ 'tab-active': activeTab === 1 }"
				@click="switchTab(1)"
			>
				<text class="tab-text">{{ i18n.t('footprint.stores') }}</text>
				<text class="tab-count" v-if="storeCount > 0">({{ storeCount }})</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">

			<!-- 商品浏览记录 -->
			<view class="product-section" v-if="activeTab === 0">
				<view
					v-for="(item, index) in productFootprints"
					:key="index"
					class="product-item"
					@click="handleProductClick(item)"
				>
					<view class="product-image-wrapper">
						<image class="product-image" :src="item.image || '/static/logo.png'" mode="aspectFill"></image>
					</view>
					<view class="product-info">
						<text class="product-name">{{ item.name }}</text>
						<view class="product-tags" v-if="item.tags && item.tags.length > 0">
							<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{ tag }}</text>
						</view>
						<view class="product-footer">
							<view class="product-price">
								<text class="price-symbol">฿</text>
								<text class="price-num">{{ item.price }}</text>
								<text class="price-original" v-if="item.originalPrice">฿{{ item.originalPrice }}</text>
							</view>
							<text class="view-time">{{ item.viewTimeText }}</text>
						</view>
					</view>
					<view class="delete-btn" @click.stop="deleteProductFootprint(item.id)">
						<image class="delete-icon" src="/static/icons/close.svg" mode="aspectFit"></image>
					</view>
				</view>

				<!-- 空状态 -->
				<view class="empty-state" v-if="productFootprints.length === 0">
					<image class="empty-icon" src="/static/logo.png" mode="aspectFit"></image>
					<text class="empty-text">{{ i18n.t('footprint.noProducts') }}</text>
					<view class="empty-btn" @click="goToMall">
						<text class="empty-btn-text">{{ i18n.t('footprint.goBrowse') }}</text>
					</view>
				</view>
			</view>

			<!-- 门店浏览记录 -->
			<view class="store-section" v-if="activeTab === 1">
				<view
					v-for="(item, index) in storeFootprints"
					:key="index"
					class="store-item"
					@click="handleStoreClick(item)"
				>
					<view class="store-logo-wrapper">
						<image class="store-logo" :src="item.logo || '/static/logo.png'" mode="aspectFill"></image>
					</view>
					<view class="store-info">
						<view class="store-header">
							<text class="store-name">{{ item.name }}</text>
							<view class="store-status" :class="item.status === 'OPEN' ? 'status-open' : 'status-closed'">
								<text class="status-text">{{ item.status === 'OPEN' ? i18n.t('storeSelect.open') : i18n.t('storeSelect.closed') }}</text>
							</view>
						</view>
						<view class="store-rating" v-if="item.rating">
							<image class="star-icon" src="/static/icons/star.svg" mode="aspectFit"></image>
							<text class="rating-text">{{ item.rating }}</text>
						</view>
						<text class="store-address" v-if="item.address">{{ item.address }}</text>
						<view class="store-footer">
							<text class="distance-text" v-if="item.distance">{{ item.distance }}</text>
							<text class="view-time">{{ item.viewTimeText }}</text>
						</view>
					</view>
					<view class="delete-btn" @click.stop="deleteStoreFootprint(item.id)">
						<image class="delete-icon" src="/static/icons/close.svg" mode="aspectFit"></image>
					</view>
				</view>

				<!-- 空状态 -->
				<view class="empty-state" v-if="storeFootprints.length === 0">
					<image class="empty-icon" src="/static/logo.png" mode="aspectFit"></image>
					<text class="empty-text">{{ i18n.t('footprint.noStores') }}</text>
					<view class="empty-btn" @click="goToStoreSelect">
						<text class="empty-btn-text">{{ i18n.t('footprint.goBrowse') }}</text>
					</view>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 清空确认弹窗 -->
		<view class="confirm-modal" v-if="showConfirmModal" @click="hideClearConfirm">
			<view class="modal-content" @click.stop>
				<text class="modal-title">{{ i18n.t('footprint.confirmClear') }}</text>
				<view class="modal-buttons">
					<view class="modal-btn modal-btn-cancel" @click="hideClearConfirm">
						<text class="modal-btn-text">{{ i18n.t('common.cancel') }}</text>
					</view>
					<view class="modal-btn modal-btn-confirm" @click="confirmClear">
						<text class="modal-btn-text">{{ i18n.t('common.confirm') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import footprintManager from '@/utils/footprint.js'
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'

export default {
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			activeTab: 0,
			showConfirmModal: false,
			productFootprints: [],
			storeFootprints: [],
			productCount: 0,
			storeCount: 0
		}
	},
	computed: {
		hasData() {
			return this.productCount > 0 || this.storeCount > 0
		}
	},
	onLoad(options) {
		this.initPage()
		this.loadData()
	},
	onShow() {
		this.loadData()
	},
	methods: {
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20

			// 计算内容区域高度
			const navBarHeight = 44
			const tabBarHeight = 44
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		loadData() {
			// 重新从 localStorage 加载数据
			footprintManager.footprints = footprintManager.loadFootprints()
			console.log('[footprint-page] loadData, stores:', footprintManager.footprints.stores?.length, 'products:', footprintManager.footprints.products?.length)

			// 获取带格式化时间的数据
			this.productFootprints = footprintManager.getProductFootprintsFormatted()
			this.storeFootprints = footprintManager.getStoreFootprintsFormatted()
			console.log('[footprint-page] storeFootprints rendered:', this.storeFootprints.length, 'activeTab:', this.activeTab)

			// 获取统计
			const stats = footprintManager.getFootprintStats()
			this.productCount = stats.productCount
			this.storeCount = stats.storeCount
		},

		goBack() {
			uni.navigateBack()
		},

		switchTab(index) {
			this.activeTab = index
		},

		// 商品点击
		handleProductClick(item) {
			uni.navigateTo({
				url: `/pages/product-detail/index?productId=${item.id}`
			})
		},

		// 门店点击
		handleStoreClick(item) {
			// 跳转到堂食页面
			uni.navigateTo({
				url: `/pages/dinein/index?storeId=${item.id}`
			})
		},

		// 删除商品记录
		deleteProductFootprint(productId) {
			footprintManager.removeProductFootprint(productId)
			this.loadData()
			showToast(this.i18n.t('common.success'))
		},

		// 删除门店记录
		deleteStoreFootprint(storeId) {
			footprintManager.removeStoreFootprint(storeId)
			this.loadData()
			showToast(this.i18n.t('common.success'))
		},

		// 显示清空确认
		showClearConfirm() {
			this.showConfirmModal = true
		},

		// 隐藏清空确认
		hideClearConfirm() {
			this.showConfirmModal = false
		},

		// 确认清空
		confirmClear() {
			if (this.activeTab === 0) {
				footprintManager.clearProductFootprints()
			} else if (this.activeTab === 1) {
				footprintManager.clearStoreFootprints()
			}
			this.loadData()
			this.hideClearConfirm()
			showToast(this.i18n.t('common.success'))
		},

		// 去商城逛逛
		goToMall() {
			uni.navigateTo({
				url: '/pages/mall/index'
			})
		},

		// 去选择门店
		goToStoreSelect() {
			uni.navigateTo({
				url: '/pages/store-select/index'
			})
		}
	}
}
</script>

<style scoped>
.footprint-page {
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
	width: 60px;
	display: flex;
	justify-content: flex-end;
}

.clear-btn {
	font-size: 14px;
	color: #00000099;
}

/* Tab切换 */
.tab-bar {
	display: flex;
	background-color: #FFFFFF;
	border-bottom: 1px solid #F3F3F3;
}

.tab-item {
	flex: 1;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
}

.tab-text {
	font-size: 14px;
	color: #00000099;
}

.tab-count {
	font-size: 12px;
	color: #00000099;
}

.tab-active .tab-text,
.tab-active .tab-count {
	color: #F2B131;
	font-weight: 500;
}

.tab-active {
	border-bottom: 2px solid #F2B131;
}

/* 内容区域 */
.content-scroll {
	flex: 1;
	background-color: #FFFFFF;
}

/* 商品列表 */
.product-section {
	padding: 0 16px;
}

.product-item {
	display: flex;
	align-items: center;
	padding: 14px 0;
	border-bottom: 1px solid #F3F3F3;
	position: relative;
}

.product-image-wrapper {
	width: 80px;
	height: 80px;
	margin-right: 12px;
	flex-shrink: 0;
}

.product-image {
	width: 100%;
	height: 100%;
	border-radius: 8px;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.product-name {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.product-tags {
	display: flex;
	gap: 4px;
}

.tag {
	font-size: 10px;
	color: #F2B131;
	background-color: rgba(242, 177, 49, 0.1);
	padding: 2px 6px;
	border-radius: 4px;
}

.product-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.product-price {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 12px;
	color: #F2B131;
	font-weight: 500;
}

.price-num {
	font-size: 16px;
	color: #F2B131;
	font-weight: 700;
}

.price-original {
	font-size: 12px;
	color: #00000066;
	text-decoration: line-through;
	margin-left: 4px;
}

.view-time {
	font-size: 12px;
	color: #00000066;
}

.delete-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
}

.delete-icon {
	width: 16px;
	height: 16px;
	opacity: 0.5;
}

/* 门店列表 */
.store-section {
	padding: 0 16px;
}

.store-item {
	display: flex;
	align-items: center;
	padding: 14px 0;
	border-bottom: 1px solid #F3F3F3;
	position: relative;
}

.store-logo-wrapper {
	width: 56px;
	height: 56px;
	margin-right: 12px;
	flex-shrink: 0;
}

.store-logo {
	width: 100%;
	height: 100%;
	border-radius: 8px;
}

.store-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.store-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.store-name {
	font-size: 14px;
	font-weight: 600;
	color: #000000CC;
}

.store-status {
	padding: 2px 8px;
	border-radius: 4px;
}

.status-open {
	background-color: rgba(82, 196, 26, 0.15);
}

.status-closed {
	background-color: rgba(0, 0, 0, 0.08);
}

.status-text {
	font-size: 10px;
	font-weight: 500;
}

.status-open .status-text {
	color: #52C41A;
}

.status-closed .status-text {
	color: #999999;
}

.store-rating {
	display: flex;
	align-items: center;
	gap: 4px;
}

.star-icon {
	width: 12px;
	height: 12px;
}

.rating-text {
	font-size: 12px;
	color: #F2B131;
	font-weight: 500;
}

.store-address {
	font-size: 12px;
	color: #00000099;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.store-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.distance-text {
	font-size: 12px;
	color: #F2B131;
	font-weight: 500;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80px 0;
}

.empty-icon {
	width: 80px;
	height: 80px;
	opacity: 0.5;
	margin-bottom: 16px;
}

.empty-text {
	font-size: 14px;
	color: #00000099;
	margin-bottom: 20px;
}

.empty-btn {
	background-color: #F2B131;
	padding: 10px 24px;
	border-radius: 20px;
}

.empty-btn-text {
	font-size: 14px;
	font-weight: 500;
	color: #FFFFFF;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}

/* 确认弹窗 */
.confirm-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	width: 280px;
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 24px;
}

.modal-title {
	font-size: 16px;
	color: #000000CC;
	text-align: center;
	margin-bottom: 24px;
}

.modal-buttons {
	display: flex;
	gap: 16px;
}

.modal-btn {
	flex: 1;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 20px;
}

.modal-btn-cancel {
	background-color: #F3F3F3;
}

.modal-btn-confirm {
	background-color: #F2B131;
}

.modal-btn-text {
	font-size: 14px;
	font-weight: 500;
}

.modal-btn-cancel .modal-btn-text {
	color: #00000099;
}

.modal-btn-confirm .modal-btn-text {
	color: #FFFFFF;
}
</style>
