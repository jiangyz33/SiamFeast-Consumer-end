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
					<view class="copy-btn" @click="copyCode">
						<text class="copy-text">{{ t('mine.copyCode') }}</text>
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

			<!-- Tab 切换 -->
			<view class="tab-bar">
				<view class="tab-item" :class="{ 'tab-active': activeTab === 0 }" @click="switchTab(0)">
					<text class="tab-text">{{ t('mine.invitedUsers') }}</text>
				</view>
				<view class="tab-item" :class="{ 'tab-active': activeTab === 1 }" @click="switchTab(1)">
					<text class="tab-text">{{ t('mine.rewardRecords') }}</text>
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
							<text class="item-name">{{ getRefereeName(item) || t('mine.anonymousUser') }}</text>
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
	</view>
</template>

<script>
	import i18n from '@/i18n/index.js'
	import { fixMinioUrl } from '@/utils/index.js'
	import { getMyReferralInfo, getMyReferees, getMyReferralRewards } from '@/api/services/referral.js'

	export default {
		data() {
			return {
			langVersion: 0,
				statusBarHeight: 0,
				contentHeight: 0,
				referralCode: '',
				stats: {
					totalReferrals: 0,
					coinsEarned: 0,
					pointsEarned: 0
				},
				activeTab: 0,
				referees: [],
				rewards: [],
				loading: false
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
					console.log('[referral] my-info response:', JSON.stringify(res).substring(0, 500))
					if (res.code === 0 && res.data) {
						const data = res.data
						this.referralCode = data.referral_code || ''
						const totalReferrals = data.total_referees ?? data.total_referrals ?? 0
						const coinsEarned = data.total_coins_earned ?? data.coins_earned ?? data.total_coins ?? data.pending_rewards ?? 0
						const pointsEarned = data.total_points_earned ?? data.points_earned ?? data.total_points ?? 0
						this.stats = { totalReferrals, coinsEarned, pointsEarned }
						console.log('[referral] stats assigned (initial):', JSON.stringify(this.stats))
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
					console.log('[referral] aggregated from rewards:', { totalCoins, totalPoints })
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
					console.log('[referral] my-referees response:', JSON.stringify(res).substring(0, 500))
					if (res.code === 0 && res.data) {
						// 兼容多种返回形态：items / list / referees / 裸数组
						const d = res.data
						const items = Array.isArray(d) ? d : (d.items || d.list || d.referees || d.users || [])
						this.referees = items
					}
				} else {
					const res = await getMyReferralRewards({ page: 1, page_size: 50 })
					console.log('[referral] my-rewards response:', JSON.stringify(res).substring(0, 500))
					if (res.code === 0 && res.data) {
						const d = res.data
						const items = Array.isArray(d) ? d : (d.items || d.list || d.rewards || [])
						this.rewards = items
					}
				}
			},
			switchTab(index) {
				if (this.activeTab === index) return
				this.activeTab = index
				this.loadList()
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

.copy-btn {
	background: linear-gradient(135deg, #F2B131 0%, #E5A02E 100%);
	border-radius: 20px;
	padding: 10px 0;
	text-align: center;
	width: 60%;
	margin: 0 auto;
	box-shadow: 0 2px 8px rgba(242, 177, 49, 0.3);
}

.copy-text {
	font-size: 14px;
	font-weight: 600;
	color: #fff;
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

.item-name {
	font-size: 14px;
	color: #5D4037;
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
