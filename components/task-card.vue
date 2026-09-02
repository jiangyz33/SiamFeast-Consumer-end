<template>
	<view class="task-card" :class="{
		'task-card-completed': isCompleted,
		'task-card-claimed': isClaimed,
		'task-card-locked': locked
	}">
		<!-- 任务信息 -->
		<view class="task-info">
			<view class="task-header">
				<text class="task-icon">{{ locked ? '🔒' : typeIcon }}</text>
				<text class="task-name">{{ taskName }}</text>
				<view class="task-type-tag" v-if="taskTypeLabel && !locked">
					<text class="task-type-text">{{ taskTypeLabel }}</text>
				</view>
			</view>

			<text class="task-desc" v-if="task.description && !locked">{{ task.description }}</text>

			<!-- 进度（锁定时不显示进度条，显示锁定提示） -->
			<view v-if="locked" class="locked-tip">
				<text class="locked-tip-text">{{ t('tasks.inviteLocked') }}</text>
			</view>
			<view v-else class="progress-section">
				<view class="progress-bar">
					<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
				</view>
				<text class="progress-text">{{ userTask.progress }} / {{ task.target_count }}</text>
			</view>
		</view>

		<!-- 奖励 + 按钮 -->
		<view class="task-action">
			<view class="reward-info" :class="{ 'reward-info-locked': locked }">
				<text class="reward-icon">{{ rewardIcon }}</text>
				<text class="reward-amount">{{ task.reward_amount }}</text>
				<text class="reward-unit">{{ rewardUnit }}</text>
			</view>

			<!-- 锁定态：不显示按钮 -->
			<view v-if="locked" class="action-btn action-locked">
				<text class="action-text">{{ t('tasks.locked') }}</text>
			</view>
			<view v-else-if="isClaimed" class="action-btn action-claimed">
				<text class="action-text">{{ t('tasks.claimed') }}</text>
			</view>
			<view
				v-else-if="isCompleted"
				class="action-btn action-claim"
				:class="{ 'btn-loading': loading }"
				@click="handleClaim"
			>
				<text class="action-text">{{ loading ? t('common.loading') : t('tasks.claim') }}</text>
			</view>
			<view v-else class="action-btn action-in-progress">
				<text class="action-text">{{ t('tasks.inProgress') }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import { resolveTaskName } from '@/utils/index.js'

const TYPE_ICON = {
	INVITE: '🎯',
	PURCHASE: '🛍️',
	SIGN_IN: '📅',
	CUSTOM: '✨'
}

const REWARD_ICON = {
	POINT: '⭐',
	COIN: '💰',
	COUPON: '🎫'
}

export default {
	name: 'TaskCard',
	props: {
		task: { type: Object, required: true },        // task 子对象
		userTask: { type: Object, required: true },    // user_task 主对象(含 progress/status)
		loading: { type: Boolean, default: false },
		locked: { type: Boolean, default: false }       // INVITE 任务高档锁定态（低档未达成）
	},
	computed: {
		isCompleted() {
			return this.userTask.status === 'COMPLETED'
		},
		isClaimed() {
			return this.userTask.status === 'CLAIMED'
		},
		progressPercent() {
			const target = Number(this.task.target_count) || 1
			const cur = Number(this.userTask.progress) || 0
			return Math.min(100, Math.round((cur / target) * 100))
		},
		taskName() {
			return resolveTaskName(this.task)
		},
		typeIcon() {
			return TYPE_ICON[this.task.task_type] || '📋'
		},
		taskTypeLabel() {
			const lang = i18n.getLanguage?.() || 'zh'
			const labels = {
				INVITE: { zh: '邀请', en: 'Invite', th: 'เชิญ' },
				PURCHASE: { zh: '消费', en: 'Purchase', th: 'ซื้อ' },
				SIGN_IN: { zh: '签到', en: 'Sign-in', th: 'เช็คอิน' },
				CUSTOM: { zh: '任务', en: 'Task', th: 'ภารกิจ' }
			}
			const t = labels[this.task.task_type]
			return t ? t[lang] : ''
		},
		rewardIcon() {
			return REWARD_ICON[this.task.reward_type] || '🎁'
		},
		rewardUnit() {
			const lang = i18n.getLanguage?.() || 'zh'
			const units = {
				POINT: { zh: '积分', en: 'pts', th: 'แต้ม' },
				COIN: { zh: '金币', en: 'coins', th: 'เหรียญ' },
				COUPON: { zh: '券', en: 'coupon', th: 'คูปอง' }
			}
			const u = units[this.task.reward_type]
			return u ? u[lang] : ''
		}
	},
	methods: {
		t(key) {
			return i18n.t(key)
		},
		handleClaim() {
			if (this.loading) return
			this.$emit('claim', this.task.id)
		}
	}
}
</script>

<style scoped>
.task-card {
	display: flex;
	flex-direction: row;
	background-color: #FFFFFF;
	border-radius: 16rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.task-card-completed {
	border: 2rpx solid #F2B131;
	background-color: #FFFDE7;
}

.task-card-claimed {
	opacity: 0.6;
}

/* 锁定态（INVITE 任务高档未解锁） */
.task-card-locked {
	background-color: #F9F9F9;
	border: 2rpx dashed #E0E0E0;
	opacity: 0.85;
}

.locked-tip {
	margin-top: 12rpx;
	padding: 8rpx 12rpx;
	background-color: rgba(130, 130, 130, 0.08);
	border-radius: 8rpx;
}
.locked-tip-text {
	font-size: 22rpx;
	color: #828282;
	line-height: 1.4;
}

.reward-info-locked {
	opacity: 0.5;
}

.action-locked {
	background-color: #E0E0E0;
}

/* 任务信息 */
.task-info {
	flex: 1;
	margin-right: 24rpx;
}

.task-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 8rpx;
}

.task-icon {
	font-size: 36rpx;
	margin-right: 12rpx;
}

.task-name {
	flex: 1;
	font-size: 30rpx;
	font-weight: 600;
	color: #1A1A1A;
}

.task-type-tag {
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	background-color: #F5F5F5;
	margin-left: 8rpx;
}

.task-type-text {
	font-size: 20rpx;
	color: #828282;
}

.task-desc {
	display: block;
	font-size: 24rpx;
	color: #666666;
	line-height: 1.4;
	margin-bottom: 12rpx;
}

/* 进度条 */
.progress-section {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-top: 8rpx;
}

.progress-bar {
	flex: 1;
	height: 12rpx;
	background-color: #F0F0F0;
	border-radius: 6rpx;
	overflow: hidden;
	margin-right: 16rpx;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #F2B131 0%, #FF8F00 100%);
	border-radius: 6rpx;
	transition: width 0.3s;
}

.progress-text {
	font-size: 24rpx;
	color: #666666;
	font-weight: 500;
	min-width: 80rpx;
	text-align: right;
}

/* 奖励 + 按钮 */
.task-action {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: space-between;
	min-width: 180rpx;
}

.reward-info {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 16rpx;
}

.reward-icon {
	font-size: 28rpx;
	margin-right: 6rpx;
}

.reward-amount {
	font-size: 36rpx;
	font-weight: 700;
	color: #F2B131;
	margin-right: 4rpx;
}

.reward-unit {
	font-size: 22rpx;
	color: #828282;
}

/* 按钮 */
.action-btn {
	min-width: 140rpx;
	height: 64rpx;
	border-radius: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 24rpx;
}

.action-claim {
	background-color: #F2B131;
}

.action-claim.btn-loading {
	opacity: 0.6;
}

.action-claimed {
	background-color: #E0E0E0;
}

.action-in-progress {
	background-color: #F5F5F5;
}

.action-text {
	font-size: 24rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.action-in-progress .action-text {
	color: #828282;
}

.action-claimed .action-text {
	color: #666666;
}
</style>
