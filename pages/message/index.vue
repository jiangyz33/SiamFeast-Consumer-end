<template>
	<view class="message-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ i18n.t('message.title') }}</text>
			<view class="nav-right" @click="handleMarkAllRead" v-if="hasUnread">
				<text class="mark-all-text">{{ i18n.t('message.markAllRead') }}</text>
			</view>
			<view class="nav-right" v-else></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 消息列表 -->
			<view class="message-list" v-if="messages.length > 0">
				<view
					v-for="(item, index) in messages"
					:key="item.id"
					class="message-item"
					:class="{ 'message-unread': !item.isRead }"
					@click="handleMessageClick(item)"
				>
					<view class="message-icon-wrapper">
						<image class="message-icon" :src="item.icon" mode="aspectFill"></image>
						<view class="unread-dot" v-if="!item.isRead"></view>
					</view>
					<view class="message-content">
						<view class="message-header">
							<text class="message-title">{{ i18n.t(`message.${item.type}`) }}</text>
							<text class="message-time">{{ item.time }}</text>
						</view>
						<text class="message-desc">{{ item.description }}</text>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-state" v-if="loading">
				<text class="loading-text">{{ i18n.t('common.loading') }}</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && messages.length === 0">
				<image class="empty-icon" src="/static/logo.png" mode="aspectFit"></image>
				<text class="empty-text">{{ i18n.t('message.noMessages') }}</text>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 自定义底部导航栏 -->
		<custom-tabbar :current="0"></custom-tabbar>
	</view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar.vue'
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import { getMessages, getUnreadCount, markAsRead, markAllAsRead } from '@/api/services/notification.js'

export default {
	components: {
		CustomTabbar
	},
	data() {
		return {
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			messages: [],
			unreadCount: 0,
			loading: false
		}
	},
	computed: {
		hasUnread() {
			return this.unreadCount > 0
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
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadData() {
			if (this.loading) return
			this.loading = true

			try {
				const [msgRes, countRes] = await Promise.allSettled([
					getMessages({ type: 'all' }),
					getUnreadCount()
				])

				if (msgRes.status === 'fulfilled' && msgRes.value.code === 0 && msgRes.value.data) {
					const items = msgRes.value.data.items || []
					this.messages = items.map(m => this.normalizeMessage(m))
				}

				if (countRes.status === 'fulfilled' && countRes.value.code === 0 && countRes.value.data) {
					this.unreadCount = countRes.value.data.unread_count || 0
				}
			} catch (e) {
				console.error('loadData error:', e)
			} finally {
				this.loading = false
			}
		},

		normalizeMessage(m) {
			return {
				id: m.id,
				type: m.type,
				icon: m.icon || '/static/logo.png',
				description: m.description || '',
				time: m.time || '',
				isRead: m.is_read
			}
		},

		goBack() {
			uni.navigateBack()
		},

		async handleMessageClick(item) {
			if (!item.isRead) {
				try {
					const res = await markAsRead(item.id)
					if (res.code === 0) {
						item.isRead = true
						this.unreadCount = Math.max(0, this.unreadCount - 1)
					}
				} catch (e) {
					console.error('markAsRead error:', e)
				}
			}

			// 根据消息类型跳转
			if (item.type === 'order') {
				uni.navigateTo({ url: '/pages/orders/index' })
			} else if (item.type === 'promotion') {
				uni.navigateTo({ url: '/pages/coupons/index' })
			}
		},

		async handleMarkAllRead() {
			try {
				const res = await markAllAsRead()
				if (res.code === 0) {
					this.messages.forEach(m => {
						m.isRead = true
					})
					this.unreadCount = 0
					showToast(this.i18n.t('message.allRead'))
				} else {
					showToast(this.i18n.t('message.markReadFailed'))
				}
			} catch (e) {
				console.error('markAllAsRead error:', e)
				showToast(this.i18n.t('message.markReadFailed'))
			}
		}
	}
}
</script>

<style scoped>
.message-page {
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
	min-width: 60px;
	display: flex;
	justify-content: flex-end;
}

.mark-all-text {
	font-size: 13px;
	color: #F2B131;
}

.content-scroll {
	flex: 1;
	background-color: #FFFFFF;
}

.message-list {
	padding: 0;
}

.message-item {
	display: flex;
	align-items: center;
	padding: 14px 16px;
	background-color: #FFFFFF;
	border-bottom: 1px solid #F3F3F3;
}

.message-unread {
	background-color: #FFFBF0;
}

.message-icon-wrapper {
	position: relative;
	margin-right: 12px;
}

.message-icon {
	width: 40px;
	height: 40px;
	border-radius: 8px;
}

.unread-dot {
	position: absolute;
	top: -2px;
	right: -2px;
	width: 8px;
	height: 8px;
	background-color: #DA3300;
	border-radius: 50%;
	border: 1px solid #FFFFFF;
}

.message-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.message-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.message-title {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
}

.message-time {
	font-size: 12px;
	color: #00000099;
}

.message-desc {
	font-size: 13px;
	color: #00000099;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
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

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100px 0;
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
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}
</style>
