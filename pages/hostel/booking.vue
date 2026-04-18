<template>
	<view class="booking-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">预订确认</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 客房信息 -->
			<view class="room-summary">
				<image class="room-image" :src="roomImage" mode="aspectFill"></image>
				<view class="room-summary-info">
					<text class="room-name">{{ roomName }}</text>
					<text class="room-store">{{ storeName }}</text>
					<view class="room-price-row">
						<text class="price-symbol">฿</text>
						<text class="price-num">{{ roomPrice }}</text>
						<text class="price-unit">/晚</text>
					</view>
				</view>
			</view>

			<!-- 入住日期 -->
			<view class="section-card">
				<view class="section-header">
					<text class="section-title">入住信息</text>
				</view>
				<view class="date-info">
					<view class="date-block">
						<text class="date-label">入住日期</text>
						<text class="date-value">{{ checkIn }}</text>
					</view>
					<view class="date-arrow">
						<view class="nights-badge" v-if="nights > 0">
							<text class="nights-text">{{ nights }}晚</text>
						</view>
						<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
					</view>
					<view class="date-block">
						<text class="date-label">退房日期</text>
						<text class="date-value">{{ checkOut }}</text>
					</view>
				</view>
				<view class="guest-row" v-if="capacity">
					<text class="guest-label">最大入住</text>
					<text class="guest-value">{{ capacity }}人</text>
				</view>
			</view>

			<!-- 入住人信息 -->
			<view class="section-card">
				<view class="section-header">
					<text class="section-title">入住人信息</text>
				</view>
				<view class="form-group">
					<text class="form-label">姓名</text>
					<input class="form-input" v-model="guestInfo.name" placeholder="请输入入住人姓名" />
				</view>
				<view class="form-group">
					<text class="form-label">手机号</text>
					<input class="form-input" v-model="guestInfo.phone" placeholder="请输入手机号" type="number" />
				</view>
				<view class="form-group">
					<text class="form-label">身份证/护照号</text>
					<input class="form-input" v-model="guestInfo.id_number" placeholder="请输入证件号（选填）" />
				</view>
				<view class="form-group">
					<text class="form-label">入住人数</text>
					<view class="guest-count-control">
						<view class="count-btn" @click="changeGuestCount(-1)">
							<text class="count-btn-text">-</text>
						</view>
						<text class="count-num">{{ guestCount }}</text>
						<view class="count-btn" @click="changeGuestCount(1)">
							<text class="count-btn-text">+</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 备注 -->
			<view class="section-card">
				<view class="section-header">
					<text class="section-title">备注</text>
				</view>
				<textarea class="remark-input" v-model="remark" placeholder="特殊需求、预计到店时间等（选填）" maxlength="200"></textarea>
			</view>

			<!-- 费用明细 -->
			<view class="section-card">
				<view class="section-header">
					<text class="section-title">费用明细</text>
				</view>
				<view class="fee-row">
					<text class="fee-label">房费 ({{ roomPrice }} x {{ nights }}晚)</text>
					<text class="fee-value">฿{{ roomTotal }}</text>
				</view>
				<view class="fee-row" v-if="deposit > 0">
					<text class="fee-label">押金</text>
					<text class="fee-value">฿{{ deposit }}</text>
				</view>
				<view class="fee-row fee-total">
					<text class="fee-label">合计</text>
					<text class="fee-value fee-total-value">฿{{ totalAmount }}</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部提交栏 -->
		<view class="submit-bar">
			<view class="submit-info">
				<text class="submit-total-label">总计</text>
				<view class="submit-price">
					<text class="price-symbol">฿</text>
					<text class="price-num">{{ totalAmount }}</text>
				</view>
			</view>
			<view class="submit-btn" :class="{ 'submit-btn-disabled': submitting }" @click="handleSubmit">
				<text class="submit-btn-text">{{ submitting ? '提交中...' : '确认预订' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { showToast } from '@/utils/index.js'
import appStore from '@/store/index.js'
import { createBooking } from '@/api/services/hostel.js'

export default {
	data() {
		return {
			statusBarHeight: 20,
			contentHeight: 500,
			submitting: false,
			// 路由参数
			roomId: null,
			roomName: '',
			roomPrice: 0,
			roomImage: '',
			checkIn: '',
			checkOut: '',
			nights: 1,
			storeId: null,
			storeName: '',
			capacity: 0,
			// 表单
			guestInfo: {
				name: '',
				phone: '',
				id_number: ''
			},
			guestCount: 1,
			remark: '',
			deposit: 0
		}
	},
	computed: {
		roomTotal() {
			return Math.round(this.roomPrice * this.nights * 100) / 100
		},
		totalAmount() {
			return Math.round((this.roomTotal + this.deposit) * 100) / 100
		}
	},
	onLoad(options) {
		this.initPage()
		this.roomId = options.roomId ? parseInt(options.roomId) : null
		this.roomName = options.roomName ? decodeURIComponent(options.roomName) : '客房'
		this.roomPrice = options.roomPrice ? parseFloat(options.roomPrice) : 0
		this.roomImage = options.roomImage ? decodeURIComponent(options.roomImage) : '/static/logo.png'
		this.checkIn = options.checkIn || ''
		this.checkOut = options.checkOut || ''
		this.nights = options.nights ? parseInt(options.nights) : 1
		this.storeId = options.storeId ? parseInt(options.storeId) : null
		this.storeName = options.storeName ? decodeURIComponent(options.storeName) : ''
		this.capacity = options.capacity ? parseInt(options.capacity) : 0

		// 填充用户信息
		const userInfo = appStore.getUserInfo()
		if (userInfo) {
			this.guestInfo.name = userInfo.nickname || userInfo.name || ''
			this.guestInfo.phone = userInfo.phone || ''
		}
	},
	methods: {
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const submitBarHeight = 64
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - submitBarHeight - safeAreaBottom - this.statusBarHeight
		},

		goBack() {
			uni.navigateBack()
		},

		changeGuestCount(delta) {
			const newCount = this.guestCount + delta
			if (newCount < 1) return
			if (this.capacity > 0 && newCount > this.capacity) {
				showToast(`最多入住${this.capacity}人`)
				return
			}
			this.guestCount = newCount
		},

		async handleSubmit() {
			if (this.submitting) return

			// 验证
			if (!this.guestInfo.name.trim()) {
				showToast('请输入入住人姓名')
				return
			}
			if (!this.guestInfo.phone.trim()) {
				showToast('请输入手机号')
				return
			}
			if (!this.roomId) {
				showToast('客房信息异常')
				return
			}

			this.submitting = true

			try {
				const bookingData = {
					store_id: this.storeId,
					room_id: this.roomId,
					order_source: 'DINE_IN_SCAN',
					extra_data: {
						check_in_date: this.checkIn,
						check_out_date: this.checkOut,
						guest_count: this.guestCount,
						deposit_amount: this.deposit,
						guest_info: {
							name: this.guestInfo.name,
							phone: this.guestInfo.phone,
							id_number: this.guestInfo.id_number
						}
					},
					remark: this.remark
				}

				const res = await createBooking(bookingData)

				if (res.code === 0 && res.data) {
					showToast('预订成功')
					setTimeout(() => {
						uni.redirectTo({
							url: `/pages/order-detail/index?orderId=${res.data.order_id || res.data.id}`
						})
					}, 1500)
				}
			} catch (e) {
				console.error('预订失败:', e)
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style scoped>
.booking-page {
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

/* 内容区域 */
.content-scroll {
	flex: 1;
}

/* 客房信息摘要 */
.room-summary {
	display: flex;
	gap: 12px;
	padding: 16px;
	background-color: #FFFFFF;
}

.room-image {
	width: 100px;
	height: 80px;
	border-radius: 8px;
	flex-shrink: 0;
}

.room-summary-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.room-name {
	font-size: 16px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.9);
}

.room-store {
	font-size: 12px;
	color: #949494;
}

.room-price-row {
	display: flex;
	align-items: baseline;
	gap: 2px;
	margin-top: 4px;
}

.price-symbol {
	font-size: 12px;
	font-weight: 600;
	color: #2D6A4F;
}

.price-num {
	font-size: 20px;
	font-weight: 700;
	color: #2D6A4F;
}

.price-unit {
	font-size: 11px;
	color: #949494;
}

/* 区块卡片 */
.section-card {
	background-color: #FFFFFF;
	margin-top: 10px;
	padding: 16px;
}

.section-header {
	margin-bottom: 12px;
}

.section-title {
	font-size: 15px;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.9);
}

/* 日期信息 */
.date-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.date-block {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.date-label {
	font-size: 12px;
	color: #949494;
}

.date-value {
	font-size: 15px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.9);
}

.date-arrow {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0 12px;
}

.nights-badge {
	background-color: #2D6A4F;
	border-radius: 10px;
	padding: 2px 8px;
}

.nights-text {
	font-size: 11px;
	color: #FFFFFF;
	font-weight: 500;
}

.arrow-icon {
	width: 14px;
	height: 14px;
}

.guest-row {
	display: flex;
	justify-content: space-between;
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid #F3F3F3;
}

.guest-label {
	font-size: 13px;
	color: #949494;
}

.guest-value {
	font-size: 13px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.9);
}

/* 表单 */
.form-group {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 0;
	border-bottom: 1px solid #F5F5F5;
}

.form-group:last-child {
	border-bottom: none;
}

.form-label {
	font-size: 14px;
	color: rgba(0, 0, 0, 0.8);
	width: 100px;
	flex-shrink: 0;
}

.form-input {
	flex: 1;
	font-size: 14px;
	color: rgba(0, 0, 0, 0.9);
	text-align: right;
}

.guest-count-control {
	display: flex;
	align-items: center;
	gap: 16px;
}

.count-btn {
	width: 30px;
	height: 30px;
	border-radius: 15px;
	background-color: #F5F5F5;
	display: flex;
	align-items: center;
	justify-content: center;
}

.count-btn-text {
	font-size: 16px;
	color: rgba(0, 0, 0, 0.8);
}

.count-num {
	font-size: 16px;
	font-weight: 600;
	color: rgba(0, 0, 0, 0.9);
	min-width: 20px;
	text-align: center;
}

/* 备注 */
.remark-input {
	width: 100%;
	height: 80px;
	font-size: 14px;
	color: rgba(0, 0, 0, 0.9);
	line-height: 20px;
}

/* 费用明细 */
.fee-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 0;
}

.fee-label {
	font-size: 14px;
	color: rgba(0, 0, 0, 0.6);
}

.fee-value {
	font-size: 14px;
	color: rgba(0, 0, 0, 0.9);
	font-weight: 500;
}

.fee-total {
	border-top: 1px solid #F3F3F3;
	padding-top: 12px;
	margin-top: 4px;
}

.fee-total .fee-label {
	font-weight: 600;
	color: rgba(0, 0, 0, 0.9);
}

.fee-total-value {
	font-size: 18px;
	font-weight: 700;
	color: #2D6A4F;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}

/* 底部提交栏 */
.submit-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 64px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	padding: 0 16px;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.submit-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.submit-total-label {
	font-size: 12px;
	color: #949494;
}

.submit-price {
	display: flex;
	align-items: baseline;
}

.submit-price .price-symbol {
	font-size: 12px;
	color: #2D6A4F;
}

.submit-price .price-num {
	font-size: 22px;
	font-weight: 700;
	color: #2D6A4F;
}

.submit-btn {
	background-color: #2D6A4F;
	padding: 12px 32px;
	border-radius: 22px;
}

.submit-btn-disabled {
	opacity: 0.5;
}

.submit-btn-text {
	font-size: 16px;
	font-weight: 600;
	color: #FFFFFF;
}
</style>
