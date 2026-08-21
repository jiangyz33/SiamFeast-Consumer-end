<template>
	<view class="referral-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('mine.inviteCodeTitle') }}</text>
			<view class="nav-right"></view>
		</view>

		<scroll-view class="page-content" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 邀请码卡片 -->
			<view class="code-card">
				<view class="code-card-bg"></view>
				<view class="code-card-content">
					<text class="code-label">{{ t('mine.myReferral') }}</text>
					<view class="code-display">
						<text class="code-text">{{ referralCode || '---' }}</text>
					</view>
					<view class="code-actions">
						<view class="action-btn-half copy-btn" @click="copyCode">
							<text class="copy-text">{{ t('mine.copyCode') }}</text>
						</view>
						<view class="action-btn-half share-btn" @click="shareLink">
							<text class="copy-text">{{ t('mine.shareToLine') }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 统计 -->
			<view class="stats-row">
				<view class="stat-box">
					<text class="stat-num">{{ stats.totalReferrals }}</text>
					<text class="stat-label">{{ t('mine.invitedCount') }}</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-box">
					<text class="stat-num">{{ stats.coinsEarned }}</text>
					<text class="stat-label">{{ t('mine.coinsEarned') }}</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-box">
					<text class="stat-num">{{ stats.pointsEarned }}</text>
					<text class="stat-label">{{ t('mine.pointsEarned') }}</text>
				</view>
			</view>

			<!-- 待激活积分提示（仅当 pending_points > 0 时显示） -->
			<view class="pending-row" v-if="pendingPoints > 0">
				<view class="pending-info">
					<text class="pending-points-label">{{ t('mine.pendingPoints') }}</text>
					<text class="pending-points-num">{{ pendingPoints }}</text>
					<text class="pending-count" v-if="pendingCount > 0">（{{ pendingCount }} {{ t('mine.pendingCountUnit') }}）</text>
				</view>
				<text class="pending-rules" v-if="pendingRules">{{ pendingRules }}</text>
			</view>

			<!-- Tab 切换 -->
			<view class="tab-bar">
				<view class="tab-item" :class="{ 'tab-active': activeTab === 0 }" @click="switchTab(0)">
					<text class="tab-text">{{ t('mine.invitedUsers') }}</text>
				</view>
				<view class="tab-item" :class="{ 'tab-active': activeTab === 1 }" @click="switchTab(1)">
					<text class="tab-text">{{ t('mine.rewardRecords') }}</text>
				</view>
				<!-- 任务记录 tab：点击直接跳转到任务页 -->
				<view class="tab-item tab-link" @click="goToTasks">
					<text class="tab-text">{{ t('mine.taskRecords') }}</text>
					<text class="tab-arrow">›</text>
				</view>
			</view>

			<!-- 已邀请用户列表 -->
			<view class="list-section" v-if="activeTab === 0">
				<view class="list-item" v-for="item in referees" :key="item.id">
					<view class="item-left">
						<view class="avatar-circle">
							<!-- 有头像显示头像，否则显示昵称首字母 -->
							<image v-if="getRefereeAvatar(item)" class="avatar-img" :src="getRefereeAvatar(item)" mode="aspectFill"></image>
							<text v-else class="avatar-letter">{{ (getRefereeName(item) || '?').charAt(0) }}</text>
						</view>
						<view class="item-info">
							<view class="item-name-row">
								<text class="item-name">{{ getRefereeName(item) || t('mine.anonymousUser') }}</text>
								<!-- 激活状态徽章：首单已消费 = 已激活，否则待激活 -->
								<text class="activation-badge" :class="isRefereeActivated(item) ? 'badge-activated' : 'badge-pending'">
									{{ isRefereeActivated(item) ? t('mine.activated') : t('mine.pendingActivation') }}
								</text>
							</view>
							<text class="item-date">{{ formatDate(item.created_at) }}</text>
							<!-- 显示从该被邀请人获得的金币数 -->
							<text class="item-earned" v-if="item.total_coins_earned > 0">+{{ item.total_coins_earned }} {{ t('mine.coinUnit') }}</text>
						</view>
					</view>
					<view class="item-level">
						<text class="level-text" :class="{ 'level-direct': item.level === 1, 'level-indirect': item.level === 2 }">
							{{ item.level === 1 ? 'L1' : 'L2' }}
						</text>
					</view>
				</view>
				<view class="empty-tip" v-if="!loading && referees.length === 0">
					<text class="empty-text">{{ t('mine.noReferees') }}</text>
				</view>
			</view>

			<!-- 奖励记录列表 -->
			<view class="list-section" v-if="activeTab === 1">
				<view class="reward-item" v-for="item in rewards" :key="item.id">
					<view class="reward-left">
						<text class="reward-type">{{ getRewardTypeName(item.reward_type || item.type || item.remark) }}</text>
						<!-- 来自哪笔订单（如有 order_id）-->
						<text class="reward-from" v-if="item.order_id">{{ t('mine.orderNo') }} #{{ item.order_id }}</text>
						<text class="reward-date">{{ formatDate(item.created_at || item.granted_at) }}</text>
					</view>
					<view class="reward-right">
						<!-- 金币奖励 -->
						<text v-if="getRewardValue(item).type === 'coin'" class="reward-coins">+{{ getRewardValue(item).value }} {{ t('mine.coinUnit') }}</text>
						<!-- 积分奖励 -->
						<text v-else-if="getRewardValue(item).type === 'point'" class="reward-coins">+{{ getRewardValue(item).value }} {{ t('mine.pointUnit') }}</text>
						<!-- 未知类型兜底 -->
						<text v-else class="reward-coins">{{ getRewardValue(item).value }}</text>
					</view>
				</view>
				<view class="empty-tip" v-if="!loading && rewards.length === 0">
					<text class="empty-text">{{ t('mine.noRewards') }}</text>
				</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<!-- 分享指引弹窗 -->
		<view class="share-guide-mask" v-if="showShareGuide" @click="showShareGuide = false">
			<view class="share-guide-modal" @click.stop>
				<view class="share-guide-close" @click="showShareGuide = false">
					<text class="share-guide-close-icon">×</text>
				</view>
				<view class="share-guide-header">
					<text class="share-guide-icon">🔗</text>
					<text class="share-guide-title">{{ t('mine.shareGuideTitle') }}</text>
				</view>
				<text class="share-guide-content">{{ t('mine.shareGuideContent') }}</text>
				<view class="share-guide-btn" @click="showShareGuide = false">
					<text class="share-guide-btn-text">{{ t('mine.shareGuideConfirm') }}</text>
				</view>
				<view class="share-guide-tip">
					<text class="share-guide-tip-text">{{ t('mine.linkCopied') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import i18n from '@/i18n/index.js'
	import { fixMinioUrl } from '@/utils/index.js'
	import { shareInviteToLine, buildInviteUrl } from '@/utils/lineShare.js'
	import { getMyReferralInfo, getMyReferees, getMyReferralRewards } from '@/api/services/referral.js'

	export default {
		data() {
			return {
			langVersion: 0,
				statusBarHeight: 0,
				contentHeight: 0,
				referralCode: '',
				// LINE 分享链接（my-info 返回 invite_url，空时用 buildInviteUrl 兜底）
				inviteUrl: '',
				// 待激活积分（来自 /referrals/my-info，仅展示）
				pendingPoints: 0,
				pendingCount: 0,
				pendingRules: '',
				stats: {
					totalReferrals: 0,
					coinsEarned: 0,
					pointsEarned: 0
				},
				activeTab: 0,
				referees: [],
				rewards: [],
				loading: false,
				showShareGuide: false
			}
		},
		computed: {
			i18n() { return i18n }
		},
		onLoad() {
			const sysInfo = uni.getSystemInfoSync()
			this.statusBarHeight = sysInfo.statusBarHeight || 0
			this.contentHeight = sysInfo.windowHeight - this.statusBarHeight - 44
		},
		onShow() {
			this.loadReferralInfo()
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
			goBack() {
				uni.navigateBack()
			},
			async loadReferralInfo() {
				this.loading = true
				try {
					const res = await getMyReferralInfo()
					// my-info response
					if (res.code === 0 && res.data) {
						const data = res.data
						this.referralCode = data.referral_code || ''
						this.inviteUrl = data.invite_url || ''
						// pending points (display only)
						this.pendingPoints = data.pending_points ?? 0
						this.pendingCount = data.pending_count ?? 0
						this.pendingRules = data.pending_rules || ''
						const totalReferrals = data.total_referees ?? data.total_referrals ?? 0
						const coinsEarned = data.total_coins_earned ?? data.coins_earned ?? data.total_coins ?? data.pending_rewards ?? 0
						const pointsEarned = data.total_points_earned ?? data.points_earned ?? data.total_points ?? 0
						this.stats = { totalReferrals, coinsEarned, pointsEarned }
						// stats assigned
					}
					// my-info 可能不返回 points_earned，单独拉一次 rewards 列表做兜底累加
					if (!this.stats.pointsEarned) {
						await this.aggregateFromRewards()
					}
					await this.loadList()
				} catch (e) {
					console.error('loadReferralInfo error', e)
				} finally {
					this.loading = false
				}
			},

			/**
			 * 从 my-rewards 列表按 reward_unit 累加金币/积分
			 * 用于 my-info 接口未返回统计时的兜底
			 */
			async aggregateFromRewards() {
				try {
					const res = await getMyReferralRewards({ page: 1, page_size: 100 })
					if (res.code !== 0 || !res.data) return
					const d = res.data
					const items = Array.isArray(d) ? d : (d.items || d.list || d.rewards || [])
					if (!items.length) return
					let totalCoins = 0
					let totalPoints = 0
					items.forEach(it => {
						const parsed = this.getRewardValue(it)
						if (parsed.type === 'coin') totalCoins += parsed.value
						else if (parsed.type === 'point') totalPoints += parsed.value
					})
					// aggregated from rewards
					// 整体赋值确保响应式
					this.stats = {
						totalReferrals: this.stats.totalReferrals,
						coinsEarned: this.stats.coinsEarned || totalCoins,
						pointsEarned: this.stats.pointsEarned || totalPoints
					}
				} catch (e) {
					console.error('[referral] aggregateFromRewards error:', e)
				}
			},
			async loadList() {
				if (this.activeTab === 0) {
					const res = await getMyReferees({ page: 1, page_size: 50 })
					// my-referees response
					if (res.code === 0 && res.data) {
						// 兼容多种返回形态：items / list / referees / 裸数组
						const d = res.data
						const items = Array.isArray(d) ? d : (d.items || d.list || d.referees || d.users || [])
						this.referees = items
						// 调试已清除
					}
				} else {
					const res = await getMyReferralRewards({ page: 1, page_size: 50 })
					// my-rewards response
					if (res.code === 0 && res.data) {
						const d = res.data
						const items = Array.isArray(d) ? d : (d.items || d.list || d.rewards || [])
						this.rewards = items
						// 调试已清除
					}
				}
			},
			switchTab(index) {
				if (this.activeTab === index) return
				this.activeTab = index
				this.loadList()
			},

			// 跳转到任务记录页（邀请任务档位制）
			goToTasks() {
				uni.navigateTo({ url: '/pages/tasks/index' })
			},
			copyCode() {
				if (!this.referralCode) return
				uni.setClipboardData({
					data: this.referralCode,
					success: () => {
						uni.showToast({ title: i18n.t('mine.copied'), icon: 'success' })
					}
				})
			},
			/**
			 * 分享邀请到 LINE（第一期：链接统一落 H5 邀请页 ?code=XXX）
			 * 链接优先用 my-info 返回的 invite_url（后端 SF_INVITE_BASE_URL 拼好），空时本地兜底拼
			 * H5 → line.me/R/share；APP 已装 LINE → line:// scheme 秒开；未装 → 弹窗复制/网页版
			 */
			shareLink() {
				if (!this.referralCode) return
				const url = this.inviteUrl || buildInviteUrl(this.referralCode)
				shareInviteToLine(url)
			},
			getRewardTypeName(type) {
				void this.langVersion
				const key = String(type || '').toUpperCase()
				const map = {
					'SIGN_UP': i18n.t('mine.rewardSignUp'),
					'FIRST_ORDER': i18n.t('mine.rewardFirstOrder'),
					'ORDER_COMMISSION': i18n.t('mine.rewardCommission'),
					'ORDER_REBATE': i18n.t('mine.rewardCommission')
				}
				return map[key] || type || ''
			},

			formatDate(dateStr) {
				if (!dateStr) return ''
				// 2026-07-05T05:44:02.601665Z → 2026-07-05 05:44
				const m = dateStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
				if (m) return m[1] + ' ' + m[2]
				return dateStr
			},

			// 被邀请人昵称（兼容 referee_nickname / nickname / username）
			getRefereeName(item) {
				if (!item) return ''
				return item.referee_nickname || item.nickname || item.referee_username || item.username || ''
			},

			// 被邀请人头像（兼容 referee_avatar / avatar）
			getRefereeAvatar(item) {
				if (!item) return ''
				const url = item.referee_avatar || item.avatar || ''
				return url ? fixMinioUrl(url) : ''
			},

			/**
			 * 判断被邀请人是否已激活（首单消费）
			 * 优先级：
			 * 1. item 自身的激活字段（多种命名兼容）
			 * 2. rewards 列表里是否有该 referee 的 FIRST_ORDER 类型记录
			 * 3. 兜底：order_count / has_ordered / first_order_amount 等订单相关字段
			 */
			isRefereeActivated(item) {
				if (!item) return false
				// 1. 显式字段（多种命名兼容）
				if (item.first_order_at) return true
				if (typeof item.is_activated === 'boolean') return item.is_activated
				if (typeof item.has_first_order === 'boolean') return item.has_first_order
				if (typeof item.has_ordered === 'boolean') return item.has_ordered
				if (typeof item.is_first_order_done === 'boolean') return item.is_first_order_done
				// order_count / first_order_amount 是数值，> 0 视为已激活
				if (typeof item.order_count === 'number' && item.order_count > 0) return true
				if (typeof item.total_orders === 'number' && item.total_orders > 0) return true
				if (Number(item.first_order_amount) > 0) return true
				// 2. 从 rewards 列表查 FIRST_ORDER 记录（最可靠）
				const refereeId = item.id || item.referee_id || item.user_id
				if (refereeId && Array.isArray(this.rewards)) {
					const hit = this.rewards.some(r => {
						const rType = String(r.reward_type || r.type || '').toUpperCase()
						const rRefereeId = r.referee_id || r.invitee_id || r.referee_user_id
						return rType === 'FIRST_ORDER' && rRefereeId === refereeId
					})
					if (hit) return true
				}
				// 3. 兜底：后端修复后，total_rewards / total_coins_earned 实时从 referral_rewards 表算
				// total_rewards > 0 = 有 GRANTED 奖励（FIRST_ORDER/ORDER_COMMISSION）= 已首单消费
				// total_coins_earned > 0 = 有 GRANTED 积分奖励（语义是 POINT 总额）= 已首单消费
				// 注册时 SIGN_UP 是 PENDING 不会让这两个字段 > 0，安全
				if (Number(item.total_rewards) > 0) return true
				if (Number(item.total_coins_earned) > 0) return true
				// 4. 真兜底：无任何已激活信号
				return false
			},

			/**
			 * 解析奖励记录的实际值和类型
			 * 后端实际返回（2026-07-05）：
			 *   { reward_type: 'FIRST_ORDER' / 'ORDER_COMMISSION' / 'SIGN_UP',
			 *     reward_amount: 100,
			 *     coin_tx_id: 220,    ← 有 coin_tx_id 表示是金币奖励
			 *     point_tx_id: 999,   ← 有 point_tx_id 表示是积分奖励
			 *     status: 'GRANTED' }
			 * 也兼容老格式（coins / points / reward_unit 等）
			 * @returns {{type: 'coin'|'point'|'none', value: number}}
			 */
			getRewardValue(item) {
				if (!item) return { type: 'none', value: 0 }
				const amount = Number(item.reward_amount ?? item.coins ?? item.coin ?? item.points ?? item.point ?? item.reward_points ?? 0)

				// 优先级：reward_unit > tx_id > 字段名 > 默认金币
				// 注意：后端返积分时也可能有 coin_tx_id（SQL JOIN coin_transactions 表导致），所以 reward_unit 权威性最高
				let type = 'none'
				const unit = (item.reward_unit || item.unit || '').toUpperCase()
				if (unit === 'POINT' || unit === 'POINTS') {
					type = 'point'
				} else if (unit === 'COIN') {
					type = 'coin'
				} else if (item.point_tx_id != null && item.coin_tx_id == null) {
					type = 'point'
				} else if (item.coin_tx_id != null && item.point_tx_id == null) {
					type = 'coin'
				} else if (item.coins || item.coin) {
					type = 'coin'
				} else if (item.points || item.point || item.reward_points) {
					type = 'point'
				} else if (amount > 0) {
					type = 'coin'
				}

				return { type, value: amount }
			}
		}
	}
</script>

<style scoped>
.referral-page {
	width: 100vw;
	min-height: 100vh;
	background-color: #F7F7F7;
}

.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 44px;
	padding: 0 16px;
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
}

.nav-back {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 20px;
	height: 20px;
}

.nav-title {
	font-size: 17px;
	font-weight: 600;
	color: #fff;
}

.nav-right {
	width: 32px;
}

/* 邀请码卡片 - 与首页member-card同风格 */
.code-card {
	margin: 16px;
	border-radius: 12px;
	overflow: hidden;
	position: relative;
	background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%);
	padding: 24px;
	box-shadow: 0 4px 16px rgba(242, 177, 49, 0.12);
}

.code-card::before {
	content: '';
	position: absolute;
	top: -30px;
	right: -30px;
	width: 100px;
	height: 100px;
	background: radial-gradient(circle, rgba(242, 177, 49, 0.2) 0%, transparent 70%);
	border-radius: 50%;
}

.code-label {
	font-size: 14px;
	color: rgba(93, 64, 55, 0.6);
	display: block;
	margin-bottom: 12px;
}

.code-display {
	background-color: #fff;
	border-radius: 8px;
	padding: 12px 16px;
	margin-bottom: 16px;
	text-align: center;
	border: 1px solid rgba(242, 177, 49, 0.2);
}

.code-text {
	font-size: 28px;
	font-weight: 700;
	color: #5D4037;
	letter-spacing: 4px;
}

.code-actions {
	display: flex;
	gap: 12px;
	margin-top: 4px;
}

.action-btn-half {
	flex: 1;
	border-radius: 20px;
	padding: 10px 0;
	text-align: center;
	box-shadow: 0 2px 8px rgba(242, 177, 49, 0.3);
}

.copy-btn {
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
}

.share-btn {
	background: linear-gradient(135deg, #FF8A65 0%, #FF6E40 100%);
}

.copy-text {
	font-size: 14px;
	font-weight: 600;
	color: #fff;
}

/* 分享指引弹窗 */
.share-guide-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 32px;
}

.share-guide-modal {
	width: 100%;
	max-width: 360px;
	background-color: #FFFFFF;
	border-radius: 16px;
	padding: 24px 20px;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: stretch;
}

.share-guide-close {
	position: absolute;
	top: 12px;
	right: 12px;
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #F5F5F5;
	border-radius: 14px;
}

.share-guide-close-icon {
	font-size: 20px;
	color: #666;
	line-height: 1;
}

.share-guide-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 16px;
}

.share-guide-icon {
	font-size: 36px;
	margin-bottom: 8px;
}

.share-guide-title {
	font-size: 16px;
	font-weight: 700;
	color: #1A1A1A;
	text-align: center;
}

.share-guide-content {
	font-size: 13px;
	color: #444444;
	line-height: 1.7;
	white-space: pre-line;
	margin-bottom: 20px;
}

.share-guide-btn {
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	border-radius: 22px;
	padding: 12px 0;
	text-align: center;
}

.share-guide-btn-text {
	font-size: 15px;
	font-weight: 600;
	color: #FFFFFF;
}

.share-guide-tip {
	margin-top: 16px;
	text-align: center;
}

.share-guide-tip-text {
	font-size: 12px;
	color: #999;
}

/* 统计 - 与首页stat-num/stat-label同风格 */
.stats-row {
	display: flex;
	align-items: center;
	background-color: #fff;
	margin: 0 16px;
	border-radius: 12px;
	padding: 16px 0;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 待激活积分提示行 */
.pending-row {
	margin: 8px 16px 0;
	padding: 10px 14px;
	background-color: #FFF8E1;
	border-left: 3px solid #F2B131;
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.pending-info {
	display: flex;
	flex-direction: row;
	align-items: baseline;
	gap: 6px;
}
.pending-points-label {
	font-size: 12px;
	color: #6B6B6B;
}
.pending-points-num {
	font-size: 16px;
	font-weight: 700;
	color: #B5750C;
}
.pending-count {
	font-size: 11px;
	color: #828282;
}
.pending-rules {
	font-size: 11px;
	color: #828282;
	line-height: 1.5;
}

.stat-box {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
}

.stat-num {
	font-size: 20px;
	font-weight: 700;
	color: #5D4037;
}

.stat-label {
	font-size: 11px;
	color: rgba(93, 64, 55, 0.5);
}

.stat-divider {
	width: 1px;
	height: 30px;
	background-color: #f0ebe3;
}

/* Tab */
.tab-bar {
	display: flex;
	margin: 16px 16px 0;
	background-color: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
}

.tab-item {
	flex: 1;
	padding: 12px 0;
	text-align: center;
	position: relative;
}

.tab-text {
	font-size: 14px;
	color: #999;
}

.tab-active .tab-text {
	color: #5D4037;
	font-weight: 600;
}

/* 任务记录 tab：跳转入口样式（带箭头） */
.tab-link {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2px;
}
.tab-arrow {
	font-size: 16px;
	color: #BDBDBD;
	line-height: 1;
	margin-left: 2px;
}

.tab-active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 30%;
	right: 30%;
	height: 3px;
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	border-radius: 2px;
}

/* 列表 */
.list-section {
	margin: 0 16px;
	background-color: #fff;
	border-radius: 0 0 12px 12px;
	padding: 0 16px;
}

.list-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 0;
	border-bottom: 1px solid #f5f5f5;
}

.list-item:last-child {
	border-bottom: none;
}

.item-left {
	display: flex;
	align-items: center;
	gap: 10px;
}

.avatar-circle {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 6px rgba(242, 177, 49, 0.2);
}

.avatar-letter {
	font-size: 16px;
	font-weight: 600;
	color: #fff;
}

.avatar-img {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.item-info {
	display: flex;
	flex-direction: column;
}

.item-name-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 6px;
	flex-wrap: wrap;
}

.item-name {
	font-size: 14px;
	color: #5D4037;
}

/* 邀请激活状态徽章 */
.activation-badge {
	font-size: 10px;
	padding: 1px 6px;
	border-radius: 6px;
	font-weight: 500;
	line-height: 1.4;
}
.activation-badge.badge-activated {
	color: #FFFFFF;
	background-color: #4CAF50;
}
.activation-badge.badge-pending {
	color: #B5750C;
	background-color: #FFF8E1;
}

.item-date {
	font-size: 11px;
	color: #bbb;
	margin-top: 2px;
}

/* 该被邀请人带来的金币奖励 */
.item-earned {
	font-size: 11px;
	color: #F2B131;
	font-weight: 600;
	margin-top: 4px;
}

.level-text {
	font-size: 11px;
	font-weight: 600;
	color: #fff;
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	padding: 2px 8px;
	border-radius: 10px;
}

/* 直邀（L1）保持金色，间邀（L2）用灰蓝色区分 */
.level-text.level-indirect {
	background: linear-gradient(135deg, #8E9AAE 0%, #6B7889 100%);
}

.reward-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 0;
	border-bottom: 1px solid #f5f5f5;
}

.reward-item:last-child {
	border-bottom: none;
}

.reward-left {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.reward-type {
	font-size: 14px;
	color: #5D4037;
	font-weight: 500;
}

.reward-from {
	font-size: 11px;
	color: #999;
}

.reward-date {
	font-size: 11px;
	color: #bbb;
}

.reward-coins {
	font-size: 16px;
	font-weight: 700;
	color: #F2B131;
}

.empty-tip {
	padding: 40px 0;
	text-align: center;
}

.empty-text {
	font-size: 13px;
	color: #bbb;
}

.bottom-space {
	height: 30px;
}
</style>
