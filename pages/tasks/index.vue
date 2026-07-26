<template>
	<view class="tasks-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('tasks.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<scroll-view scroll-y class="content-scroll" @refresherrefresh="onRefresh" :refresher-enabled="true" :refresher-triggered="refreshing">
			<!-- 头部信息 -->
			<view class="header-section">
				<text class="header-title">{{ t('tasks.headerTitle') }}</text>
				<text class="header-subtitle">{{ t('tasks.headerSubtitle') }}</text>
			</view>

			<!-- 任务列表 -->
			<view class="tasks-section" v-if="!loading && tasks.length > 0">
				<view class="section-label">{{ t('tasks.sectionAll') }}</view>

				<task-card
					v-for="item in tasks"
					:key="item.task_id"
					:task="item.task"
					:userTask="item"
					:loading="claimingId === item.task_id"
					@claim="handleClaim"
				></task-card>
			</view>

			<!-- 加载中 -->
			<view v-if="loading" class="loading-section">
				<text class="loading-text">{{ t('common.loading') }}</text>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && tasks.length === 0" class="empty-section">
				<text class="empty-icon">📋</text>
				<text class="empty-text">{{ t('tasks.empty') }}</text>
			</view>

			<view style="height: 100rpx;"></view>
		</scroll-view>

		<!-- 领取成功弹窗 -->
		<view v-if="claimResult" class="result-mask" @click="closeClaimResult">
			<view class="result-dialog" @click.stop>
				<text class="result-emoji">🎉</text>
				<text class="result-title">{{ t('tasks.claimSuccess') }}</text>
				<view class="result-reward">
					<text class="result-reward-icon">{{ claimRewardIcon }}</text>
					<text class="result-reward-amount">{{ claimResult.reward_amount }}</text>
					<text class="result-reward-unit">{{ claimRewardUnit }}</text>
				</view>
				<view class="result-btn" @click="closeClaimResult">
					<text class="result-btn-text">{{ t('common.confirm') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getTasks, claimTask } from '@/api/services/tasks.js'
import { showToast } from '@/utils/index.js'
import TaskCard from '@/components/task-card.vue'
import i18n from '@/i18n/index.js'

const REWARD_ICON = { POINT: '⭐', COIN: '💰', COUPON: '🎫' }

export default {
	components: { TaskCard },
	data() {
		return {
			statusBarHeight: 20,
			tasks: [],
			loading: false,
			refreshing: false,
			claimingId: null,
			claimResult: null,
			langVersion: 0
		}
	},
	onLoad() {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 20
		this.loadTasks()
	},
	onShow() {
		// 每次进入刷新任务进度
		this.loadTasks(false)
	},
	computed: {
		claimRewardIcon() {
			if (!this.claimResult) return '🎁'
			return REWARD_ICON[this.claimResult.reward_type] || '🎁'
		},
		claimRewardUnit() {
			if (!this.claimResult) return ''
			const lang = i18n.getLanguage?.() || 'zh'
			const units = {
				POINT: { zh: '积分', en: 'pts', th: 'แต้ม' },
				COIN: { zh: '金币', en: 'coins', th: 'เหรียญ' },
				COUPON: { zh: '券', en: 'coupon', th: 'คูปอง' }
			}
			const u = units[this.claimResult.reward_type]
			return u ? u[lang] : ''
		}
	},
	methods: {
		t(key) {
			void this.langVersion
			return i18n.t(key)
		},
		async loadTasks(showLoading = true) {
			if (showLoading) this.loading = true
			try {
				const res = await getTasks()
				if (res && res.code === 0 && res.data) {
					const items = res.data.items || res.data || []
					// 过滤掉没有 task 子对象的脏数据
					this.tasks = items.filter(it => it.task)
				} else {
					this.tasks = []
				}
			} catch (e) {
				console.error('[tasks] load failed:', e)
				this.tasks = []
			} finally {
				this.loading = false
				this.refreshing = false
			}
		},
		async onRefresh() {
			this.refreshing = true
			await this.loadTasks(false)
		},
		async handleClaim(taskId) {
			if (this.claimingId) return
			this.claimingId = taskId
			try {
				const res = await claimTask(taskId)
				if (res && res.code === 0 && res.data) {
					// 显示成功弹窗
					this.claimResult = res.data

					// 本地更新任务状态
					const taskItem = this.tasks.find(it => it.task_id === taskId)
					if (taskItem) {
						taskItem.status = 'CLAIMED'
					}
				} else {
					this.handleClaimError(res)
				}
			} catch (e) {
				console.error('[tasks] claim failed:', e)
				this.handleClaimError(e)
			} finally {
				this.claimingId = null
			}
		},
		handleClaimError(err) {
			const code = err && (err.code || err.bizCode)
			if (code === 'TASK_NOT_CLAIMABLE') {
				showToast(this.t('tasks.errors.TASK_NOT_CLAIMABLE'))
			} else {
				showToast((err && err.message) || this.t('tasks.errors.DEFAULT'))
			}
		},
		closeClaimResult() {
			this.claimResult = null
		},
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.tasks-page {
	min-height: 100vh;
	background-color: #F5F5F5;
	display: flex;
	flex-direction: column;
}

.status-bar { width: 100%; }

.nav-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 32rpx;
	background-color: #FFFFFF;
}

.nav-left, .nav-right {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon { width: 40rpx; height: 40rpx; }

.nav-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1A1A1A;
}

.content-scroll { flex: 1; }

/* 头部 */
.header-section {
	padding: 40rpx 32rpx 24rpx;
	background: linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%);
}

.header-title {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #1A1A1A;
	margin-bottom: 8rpx;
}

.header-subtitle {
	display: block;
	font-size: 26rpx;
	color: #828282;
}

/* 任务列表 */
.tasks-section {
	padding: 0 32rpx;
}

.section-label {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	color: #666666;
	margin-bottom: 16rpx;
	margin-top: 8rpx;
}

/* 加载/空状态 */
.loading-section, .empty-section {
	padding: 120rpx 0;
	text-align: center;
}

.loading-text {
	font-size: 28rpx;
	color: #828282;
}

.empty-icon {
	display: block;
	font-size: 100rpx;
	margin-bottom: 24rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #828282;
}

/* 成功弹窗 */
.result-mask {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background-color: rgba(0,0,0,0.7);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 60rpx;
}

.result-dialog {
	width: 100%;
	max-width: 560rpx;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	padding: 48rpx 32rpx 32rpx;
	text-align: center;
}

.result-emoji {
	display: block;
	font-size: 100rpx;
	margin-bottom: 16rpx;
}

.result-title {
	display: block;
	font-size: 34rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-bottom: 24rpx;
}

.result-reward {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	padding: 24rpx;
	background-color: #FFF8E1;
	border-radius: 16rpx;
	margin-bottom: 32rpx;
}

.result-reward-icon {
	font-size: 48rpx;
	margin-right: 12rpx;
}

.result-reward-amount {
	font-size: 56rpx;
	font-weight: 700;
	color: #F2B131;
}

.result-reward-unit {
	font-size: 26rpx;
	color: #828282;
	margin-left: 8rpx;
}

.result-btn {
	height: 80rpx;
	background-color: #F2B131;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.result-btn-text {
	color: #FFFFFF;
	font-size: 30rpx;
	font-weight: 600;
}
</style>
