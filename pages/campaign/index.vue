<template>
	<view class="campaign-page">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('campaignCenter.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 列表 -->
		<scroll-view
			class="list-scroll"
			scroll-y
			:style="{ height: contentHeight + 'px' }"
			@scrolltolower="loadMore"
			lower-threshold="120"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 活动卡片 -->
			<view
				v-for="camp in items"
				:key="camp.id"
				class="camp-card"
				@click="openDetail(camp)"
			>
				<!-- 封面图（16:9，可空 → 占位） -->
				<view class="camp-cover">
					<image
						v-if="camp.image_url"
						class="camp-cover-img"
						:src="camp.image_url"
						mode="aspectFill"
					></image>
					<view v-else class="camp-cover-placeholder">
						<image class="camp-cover-placeholder-icon" :src="typeIconOf(camp)" mode="aspectFit"></image>
					</view>
					<!-- 状态标签：进行中 / 即将开始（前端自算，已结束后端已过滤） -->
					<view class="camp-status" :class="isUpcoming(camp) ? 'camp-status-upcoming' : 'camp-status-ongoing'">
						<text class="camp-status-text">{{ isUpcoming(camp) ? t('campaignCenter.upcoming') : t('campaignCenter.ongoing') }}</text>
					</view>
				</view>
				<!-- 内容 -->
				<view class="camp-body">
					<view class="camp-body-top">
						<view class="camp-type-tag" :class="'tag-' + simpleType(camp)">
							<text class="camp-type-tag-text">{{ typeNameOf(camp) }}</text>
						</view>
						<text class="camp-desc" v-if="descOf(camp)">{{ descOf(camp) }}</text>
					</view>
					<text class="camp-name">{{ nameOf(camp) }}</text>
					<view class="camp-time-row">
						<image class="camp-time-icon" src="/static/icons/clock.svg" mode="aspectFit"></image>
						<text class="camp-time-text">{{ timeRangeOf(camp) }}</text>
					</view>
				</view>
			</view>

			<!-- 加载中 -->
			<view v-if="loadingMore" class="list-footer">
				<text class="list-footer-text">{{ t('common.loading') }}</text>
			</view>
			<!-- 没有更多 -->
			<view v-else-if="items.length > 0 && !hasMore" class="list-footer">
				<text class="list-footer-text">{{ t('common.noMore') }}</text>
			</view>
			<!-- 空态 -->
			<view v-if="!loading && items.length === 0" class="empty-state">
				<image class="empty-icon" src="/static/icons/campaign-ticket.svg" mode="aspectFit"></image>
				<text class="empty-text">{{ t('campaignCenter.empty') }}</text>
			</view>
		</scroll-view>

		<!-- 活动详情弹窗（复用：含 STORE_OPENING 领开业券 / 领券 / 规则展示全逻辑） -->
		<campaign-detail-modal
			:visible="showDetail"
			:campaign="activeCampaign"
			@close="closeDetail"
			@claimed="onClaimed"
		></campaign-detail-modal>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import { getActiveCampaigns } from '@/api/services/campaign.js'
import CampaignDetailModal from '@/components/campaign-detail-modal.vue'
import {
	getCampaignTypeIcon,
	getCampaignTypeName,
	formatDateRange
} from '@/utils/campaign.js'

export default {
	name: 'CampaignCenter',
	components: { CampaignDetailModal },
	data() {
		return {
			statusBarHeight: 0,
			contentHeight: 500,
			items: [],
			page: 1,
			pageSize: 20,
			total: 0,
			loading: false,
			loadingMore: false,
			refreshing: false,
			// 详情弹窗
			showDetail: false,
			activeCampaign: null
		}
	},
	computed: {
		hasMore() {
			return this.page * this.pageSize < this.total
		}
	},
	onLoad() {
		const sysInfo = uni.getSystemInfoSync()
		this.statusBarHeight = sysInfo.statusBarHeight || 0
		this.contentHeight = sysInfo.windowHeight - this.statusBarHeight - 44
		this.fetchList(true)
	},
	methods: {
		t(key, params) {
			return i18n.t(key, params)
		},
		goBack() {
			uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/index/index' }) })
		},

		/**
		 * 拉取活动列表
		 * 后端已过滤：status=ACTIVE 且 end_date > NOW()（已结束不返回，未开始会返回作预告）
		 * city 参数：同城过滤开业活动用；当前无定位反解城市数据，按文档兼容方案不传
		 */
		async fetchList(reset = false) {
			if (reset) {
				this.page = 1
				this.loading = true
			}
			try {
				const res = await getActiveCampaigns({
					page: this.page,
					page_size: this.pageSize
				})
				if (res && res.code === 0 && res.data) {
					const list = (res.data.items || []).map(c => this.normalize(c))
					this.total = res.data.total || list.length
					if (reset) this.items = list
					else this.items = this.items.concat(list)
				}
			} catch (e) {
				console.warn('[campaign-center] fetchList failed:', e)
			} finally {
				this.loading = false
				this.loadingMore = false
				this.refreshing = false
			}
		},

		/** 统一字段：解析 rules JSON、补三语名/时间 */
		normalize(c) {
			let rules = c.rules
			if (typeof rules === 'string') {
				try { rules = JSON.parse(rules) } catch (e) { rules = {} }
			}
			return {
				id: c.id,
				store_id: c.store_id,
				type: c.campaign_type || c.type || '',
				name: c.name || '',
				name_en: c.name_en || '',
				name_th: c.name_th || '',
				image_url: c.image_url || '',
				start_time: c.start_time || c.start_date || '',
				end_time: c.end_time || c.end_date || '',
				description: c.description || '',
				description_en: c.description_en || '',
				description_th: c.description_th || '',
				applicable_stores: c.applicable_stores,
				extra_data: c.extra_data,
				rules: rules || {},
				_raw: c
			}
		},

		/** 触底加载下一页 */
		loadMore() {
			if (this.loading || this.loadingMore || !this.hasMore) return
			this.loadingMore = true
			this.page++
			this.fetchList(false)
		},

		/** 下拉刷新：重置 page=1 */
		onRefresh() {
			if (this.refreshing) return
			this.refreshing = true
			this.fetchList(true)
		},

		// ── 卡片渲染辅助 ──
		nameOf(camp) {
			const lang = i18n.getLanguage()
			return camp['name_' + lang] || camp.name || ''
		},
		typeIconOf(camp) {
			return getCampaignTypeIcon(String(camp.type || '').toUpperCase())
		},
		typeNameOf(camp) {
			return getCampaignTypeName(String(camp.type || '').toUpperCase())
		},
		simpleType(camp) {
			const t = String(camp.type || '').toUpperCase()
			if (t === 'DISCOUNT' || t === 'STORE_OPENING' || t === 'BANNER_PROMO') return 'discount'
			if (t === 'FULL_REDUCTION') return 'reduction'
			if (t === 'COUPON_GRANT') return 'coupon'
			if (t === 'SPECIAL_DATE') return 'special'
			return 'discount'
		},
		/** 状态：开始时间晚于当前 → 即将开始 */
		isUpcoming(camp) {
			if (!camp.start_time) return false
			return new Date(camp.start_time).getTime() > Date.now()
		},
		timeRangeOf(camp) {
			return formatDateRange(camp.start_time, camp.end_time)
		},
		/** 摘要一行：满减/折扣/券数（与首页活动条同源逻辑，精简版） */
		descOf(camp) {
			const lang = i18n.getLanguage()
			const r = camp.rules || {}
			const type = String(camp.type || '').toUpperCase()
			if (type === 'FULL_REDUCTION' && r.threshold && r.reduction) {
				if (lang === 'zh') return `满${r.threshold}减${r.reduction}`
				if (lang === 'th') return `ลด${r.reduction}เมื่อซื้อครบ${r.threshold}`
				return `฿${r.reduction} off ฿${r.threshold}`
			}
			if ((type === 'DISCOUNT' || type === 'STORE_OPENING') && r.discount_percent) {
				if (lang === 'zh') return `全场${r.discount_percent}% off`
				if (lang === 'th') return `ลด${r.discount_percent}%`
				return `${r.discount_percent}% off`
			}
			if (type === 'COUPON_GRANT') {
				const n = (r.coupon_ids || []).length
				if (n > 0) return lang === 'zh' ? `${n}张券可领` : (lang === 'th' ? `รับคูปอง ${n} ใบ` : `${n} coupon${n > 1 ? 's' : ''} available`)
			}
			if (type === 'SPECIAL_DATE') {
				const parts = []
				if (r.discount_percent) parts.push(`${r.discount_percent}% off`)
				if (r.extra_points) parts.push(lang === 'zh' ? `+${r.extra_points}积分` : `+${r.extra_points} pts`)
				if (r.extra_coins) parts.push(lang === 'zh' ? `+${r.extra_coins}金币` : `+${r.extra_coins} coins`)
				return parts.join(' · ')
			}
			return ''
		},

		// ── 详情弹窗 ──
		openDetail(camp) {
			this.activeCampaign = camp
			this.showDetail = true
		},
		closeDetail() {
			this.showDetail = false
		},
		/** 领券成功后轻刷新列表（券剩余数可能变化） */
		onClaimed() {
			// 不整页刷新，仅保持当前展示；下次进入/下拉刷新更新
		}
	}
}
</script>

<style scoped>
.campaign-page {
	min-height: 100vh;
	background-color: #F7F7F7;
	display: flex;
	flex-direction: column;
}

.nav-bar {
	height: 44px;
	display: flex;
	align-items: center;
	padding: 0 12px;
	background-color: #FFFFFF;
}

.nav-back {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 20px;
	height: 20px;
}

.nav-title {
	flex: 1;
	text-align: center;
	font-size: 17px;
	font-weight: 600;
	color: #1A1A1A;
}

.nav-right {
	width: 40px;
}

.list-scroll {
	flex: 1;
}

/* 活动卡片 */
.camp-card {
	margin: 12px 16px 0;
	background-color: #FFFFFF;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.camp-cover {
	width: 100%;
	height: 0;
	/* 16:9 */
	padding-bottom: 56.25%;
	position: relative;
}

.camp-cover-img {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}

.camp-cover-placeholder {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #FFF6DE 0%, #FFE9B3 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.camp-cover-placeholder-icon {
	width: 72px;
	height: 72px;
}

/* 状态标签 */
.camp-status {
	position: absolute;
	right: 10px;
	top: 10px;
	padding: 4px 10px;
	border-radius: 20px;
	backdrop-filter: blur(4px);
}

.camp-status-ongoing {
	background-color: rgba(46, 164, 98, 0.92);
}

.camp-status-upcoming {
	background-color: rgba(242, 177, 49, 0.95);
}

.camp-status-text {
	font-size: 11px;
	color: #FFFFFF;
	font-weight: 600;
}

/* 内容区 */
.camp-body {
	padding: 12px 14px 14px;
}

.camp-body-top {
	display: flex;
	align-items: center;
}

.camp-type-tag {
	padding: 2px 8px;
	border-radius: 6px;
	margin-right: 8px;
	flex-shrink: 0;
}

.tag-discount { background-color: #FFF0F0; }
.tag-reduction { background-color: #FFF8E1; }
.tag-coupon { background-color: #F3E5F5; }
.tag-special { background-color: #E3F2FD; }

.camp-type-tag-text {
	font-size: 10px;
	color: #666666;
	font-weight: 600;
}

.tag-discount .camp-type-tag-text { color: #D9534F; }
.tag-reduction .camp-type-tag-text { color: #C2890F; }
.tag-coupon .camp-type-tag-text { color: #8E5AB8; }
.tag-special .camp-type-tag-text { color: #3B82C4; }

.camp-desc {
	font-size: 12px;
	color: #999999;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.camp-name {
	margin-top: 8px;
	font-size: 15px;
	font-weight: 600;
	color: #1A1A1A;
	line-height: 1.4;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.camp-time-row {
	margin-top: 8px;
	display: flex;
	align-items: center;
}

.camp-time-icon {
	width: 13px;
	height: 13px;
	margin-right: 5px;
}

.camp-time-text {
	font-size: 12px;
	color: #999999;
}

/* 底部状态 */
.list-footer {
	padding: 16px 0 20px;
	display: flex;
	justify-content: center;
}

.list-footer-text {
	font-size: 12px;
	color: #BBBBBB;
}

/* 空态 */
.empty-state {
	padding: 80px 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.empty-icon {
	width: 64px;
	height: 64px;
	opacity: 0.5;
}

.empty-text {
	margin-top: 16px;
	font-size: 14px;
	color: #999999;
}
</style>
