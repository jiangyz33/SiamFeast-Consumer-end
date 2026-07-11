<template>
	<view class="message-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('message.title') }}</text>
			<view class="nav-right" @click="handleMarkAllRead" v-if="hasUnread">
				<text class="mark-all-text">{{ t('message.markAllRead') }}</text>
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
						<view class="message-icon-bg" :style="{ backgroundColor: item.iconData.bg }"><image class="message-icon-inner" :src="item.iconData.icon" mode="aspectFit"></image></view>
						<view class="unread-dot" v-if="!item.isRead"></view>
					</view>
					<view class="message-content">
						<view class="message-header">
							<text class="message-title">{{ item.title }}</text>
							<text class="message-time">{{ item.time }}</text>
						</view>
						<text class="message-desc">{{ item.description }}</text>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-state" v-if="loading">
				<text class="loading-text">{{ t('common.loading') }}</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && messages.length === 0">
				<image class="empty-icon" src="/static/images/empty-message.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ t('common.empty.message') }}</text>
				<text class="empty-desc">{{ t('common.empty.messageDesc') }}</text>
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
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			messages: [],
			rawMessages: [],
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
	created() {
		uni.$on('languageChanged', this.onLanguageChanged)
	},

	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},

	methods: {
		onLanguageChanged() {
			this.langVersion++
			// 切语言时用新语言重新 normalize 已加载的消息
			this.refreshMessagesForLang()
		},
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
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
					// 保留原始数据，切语言时可以重新 normalize
					this.rawMessages = items
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
				const type = m.notification_type || m.type || 'SYSTEM'
				const lang = i18n.getLanguage()
				const iconMap = {
					ORDER_STATUS: { icon: '/static/icons/order.svg', bg: '#FFF3E0' },
					ORDER: { icon: '/static/icons/order.svg', bg: '#FFF3E0' },
					PROMOTION: { icon: '/static/icons/coupon.svg', bg: '#FCE4EC' },
					COUPON: { icon: '/static/icons/coupon.svg', bg: '#FCE4EC' },
					COIN: { icon: '/static/icons/coin.svg', bg: '#FFF8E1' },
					POINT: { icon: '/static/icons/coin.svg', bg: '#FFF8E1' },
					MEMBER: { icon: '/static/icons/member.svg', bg: '#F3E5F5' },
					SYSTEM: { icon: '/static/icons/message.svg', bg: '#E3F2FD' }
				}
				// type → i18n key 映射（type 大小写不统一，统一转小写再匹配）
				const typeToI18n = {
					'system': 'message.system',
					'order': 'message.order',
					'order_status': 'message.order',
					'promotion': 'message.promotion',
					'coupon': 'message.promotion',
					'coin': 'message.promotion',
					'point': 'message.promotion',
					'member': 'message.system'
				}
				const typeKey = typeToI18n[type.toLowerCase()] || 'message.system'
				// 标题优先级：后端多语言字段 → i18n 类型映射 → 后端默认 title
				const fallbackTitle = m['title_' + lang] || m.title || m.title_en || ''
				const title = (typeKey && i18n.t(typeKey)) || fallbackTitle
				// 描述：优先取多语言字段，回退到 body/description
				const description = m['body_' + lang] || m['description_' + lang]
					|| m.body || m.description || ''

				let time = ''
				if (m.sent_at) {
					const d = new Date(m.sent_at)
					const now = new Date()
					const isToday = d.toDateString() === now.toDateString()
					const hh = String(d.getHours()).padStart(2, '0')
					const mm = String(d.getMinutes()).padStart(2, '0')
					if (isToday) {
						time = hh + ':' + mm
					} else {
						time = (d.getMonth()+1) + '/' + d.getDate() + ' ' + hh + ':' + mm
					}
				}
				return {
					id: m.id,
					type: type,
					title: title,
					iconData: iconMap[type] || iconMap.SYSTEM,
					description: description,
					time: time,
					isRead: m.is_read
				}
		},

		// 切语言后重新 normalize 已有消息（触发响应式更新）
		refreshMessagesForLang() {
			if (!this.rawMessages || this.rawMessages.length === 0) return
			this.messages = this.rawMessages.map(m => this.normalizeMessage(m))
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

.message-icon-bg {
	width: 44px;
	height: 44px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.message-icon-inner {
	width: 24px;
	height: 24px;
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
