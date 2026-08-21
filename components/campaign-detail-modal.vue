<template>
	<view v-if="visible" class="campaign-mask" @click="handleMaskClick">
		<view class="campaign-container" @click.stop>
			<!-- 关闭按钮 -->
			<view class="close-btn" @click="handleClose">
				<text class="close-text">×</text>
			</view>

			<scroll-view scroll-y class="campaign-scroll">
				<!-- 顶部 banner 大图 -->
				<view class="banner-section">
					<image
						v-if="campaign.image_url"
						class="banner-image"
						:src="campaign.image_url"
						mode="aspectFill"
					></image>
					<view v-else class="banner-placeholder">
						<image class="banner-placeholder-icon" :src="typeIcon" mode="aspectFit"></image>
					</view>
				</view>

				<!-- 活动标题 -->
				<view class="title-section">
					<view class="title-row">
						<image class="type-icon" :src="typeIcon" mode="aspectFit"></image>
						<text class="campaign-name">{{ campaignName }}</text>
					</view>
					<!-- SPECIAL_DATE 活动用日期模式文案；其他活动用时间窗口 -->
				<text class="campaign-period" v-if="campaignType === 'SPECIAL_DATE' && datePatternText">{{ datePatternText }}</text>
				<text class="campaign-period" v-else>{{ formatDateRange(campaign.start_date || campaign.start_time, campaign.end_date || campaign.end_time) }}</text>
					<view class="type-tag" :class="`type-tag-${campaignType}`">
						<text class="type-tag-text">{{ typeName }}</text>
					</view>
				</view>

				<!-- DISCOUNT / FULL_REDUCTION / SPECIAL_DATE:纯展示 -->
				<view v-if="isDiscountType" class="rules-section">
					<view class="section-header">
						<text class="section-title">{{ t('campaign.rules') }}</text>
						<view class="section-line"></view>
					</view>
					<text v-if="rulesDescription" class="rules-desc">{{ rulesDescription }}</text>
					<!-- 满减规则：满 X 减 Y（核心字段，rules.reduction + rules.threshold） -->
					<view v-if="fullReductionText" class="rules-hint rules-hint-highlight">
						<view class="rules-hint-dot"></view>
						<text class="rules-hint-text">{{ fullReductionText }}</text>
					</view>
					<!-- 折扣规则：全场 X% off（DISCOUNT 类型且未在 extraBonusText 展示时） -->
					<view v-else-if="discountRuleText" class="rules-hint rules-hint-highlight">
						<view class="rules-hint-dot"></view>
						<text class="rules-hint-text">{{ discountRuleText }}</text>
					</view>
					<!-- 最低消费（活动级门槛，区别于单券门槛） -->
					<view v-if="minSpendText" class="rules-hint">
						<view class="rules-hint-dot rules-hint-dot-plain"></view>
						<text class="rules-hint-text">{{ minSpendText }}</text>
					</view>
					<!-- SPECIAL_DATE：日期模式 + 折扣/奖励 -->
					<view v-if="datePatternText" class="rules-hint">
						<view class="rules-hint-dot rules-hint-dot-plain"></view>
						<text class="rules-hint-text">{{ t('campaign.datePattern') }}：{{ datePatternText }}</text>
					</view>
					<view v-if="extraBonusText" class="rules-hint rules-hint-highlight">
						<view class="rules-hint-dot"></view>
						<text class="rules-hint-text">{{ extraBonusText }}</text>
					</view>
					<!-- 适用门店范围 -->
					<view v-if="applicableScopeText" class="rules-hint">
						<view class="rules-hint-dot rules-hint-dot-plain"></view>
						<text class="rules-hint-text">{{ applicableScopeText }}</text>
					</view>
					<view v-if="campaignRules.stackable === false" class="rules-hint">
						<view class="rules-hint-dot rules-hint-dot-plain"></view>
						<text class="rules-hint-text">{{ t('campaign.notStackable') }}</text>
					</view>
					<view class="rules-hint">
						<view class="rules-hint-dot rules-hint-dot-plain"></view>
						<text class="rules-hint-text">{{ t('campaign.autoApply') }}</text>
					</view>
				</view>

				<!-- 领券区：COUPON_GRANT 或 SPECIAL_DATE (含 coupon_ids) -->
				<view v-if="isCouponGrantType" class="coupons-section">
					<view class="section-header">
						<text class="section-title">{{ t('campaign.claimableCoupons') }}</text>
						<view class="section-line"></view>
					</view>

					<!-- SPECIAL_DATE 类型且当天未命中 → 提示"仅限特定日期可领" -->
					<view v-if="isSpecialDateType && !dateMatched" class="date-not-matched">
						<text class="date-not-matched-text">{{ t('campaign.specialDateNotToday') }}</text>
					</view>

					<view v-else-if="loadingCoupons" class="loading-row">
						<text class="loading-text">{{ t('common.loading') }}</text>
					</view>

					<view v-else-if="claimableCoupons.length === 0" class="empty-row">
						<text class="empty-text">{{ t('campaign.noCoupons') }}</text>
					</view>

					<view v-else>
						<view
							v-for="coupon in claimableCoupons"
							:key="coupon.coupon_id"
							class="coupon-card"
						>
							<view class="coupon-left">
								<text class="coupon-value">{{ formatCouponValue(coupon) }}</text>
								<text v-if="coupon.min_spend > 0" class="coupon-threshold">
									{{ t('campaign.spendThreshold', { amount: coupon.min_spend }) }}
								</text>
								<text v-else class="coupon-threshold">{{ t('campaign.noThreshold') }}</text>
							</view>
							<view class="coupon-divider"></view>
							<view class="coupon-right">
								<text class="coupon-name">{{ getCouponName(coupon) }}</text>
								<text class="coupon-remaining">{{ formatRemaining(coupon) }}</text>
								<text class="coupon-validity" v-if="formatValidity(coupon)">{{ formatValidity(coupon) }}</text>
								<view
									class="claim-btn"
									:class="{
										'claim-btn-disabled': !coupon.user_can_claim || claimingId === coupon.coupon_id,
										'claim-btn-done': coupon.user_claimed
									}"
									@click="handleClaim(coupon)"
								>
									<text class="claim-btn-text">
										{{ getCouponBtnText(coupon) }}
									</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 底部 CTA(仅 DISCOUNT/FULL_REDUCTION)；点餐入口临时下线，下单按钮隐藏 -->
			<view v-if="isDiscountType && ORDERING_ENABLED" class="footer-cta">
				<view class="order-btn" @click="handleOrderNow">
					<text class="order-btn-text">{{ t('campaign.orderNow') }}</text>
				</view>
			</view>

			<!-- 开业活动领券区（STORE_OPENING）：专用接口领取，一店一券 -->
			<view v-if="isStoreOpeningType" class="footer-cta opening-cta">
				<view
					class="order-btn"
					:class="{ 'order-btn-disabled': openingClaiming || openingClaimed }"
					@click="handleClaimOpeningCoupon"
				>
					<text class="order-btn-text">
						{{ openingClaiming ? t('common.loading') : (openingClaimed ? t('opening.claimed') : t('opening.claimCoupon')) }}
					</text>
				</view>
				<!-- 开业权益摘要（opening-info 或 rules 快照） -->
				<view v-if="openingBenefitsText" class="opening-benefits-hint">
					<text class="opening-benefits-text">{{ openingBenefitsText }}</text>
				</view>
			</view>
			<!-- 底部:我的优惠券(仅 COUPON_GRANT) -->
			<view v-if="isCouponGrantType" class="footer-coupons-link" @click="handleViewMyCoupons">
				<text class="footer-coupons-text">{{ t('campaign.myCoupons') }} →</text>
			</view>
		</view>
	</view>
</template>

<script>
import {
	getCampaignClaimableCoupons,
	claimCoupon,
	mockClaimableCoupons,
	mockClaimCoupon,
	getCampaignTypeIcon,
	getCampaignTypeName,
	formatDateRange,
	resolveClaimErrorMessage,
	getLocalizedText
} from '@/utils/campaign.js'
import { getStores, getOpeningInfo, claimOpeningCoupon } from '@/api/services/store.js'
import { ORDERING_ENABLED } from '@/utils/featureFlags.js'
import i18n from '@/i18n/index.js'

// ⚠️ 开发期用 mock,后端就绪后改成 false
const USE_MOCK = false

export default {
	name: 'CampaignDetailModal',
	props: {
		visible: { type: Boolean, default: false },
		campaign: { type: Object, default: () => ({}) }
	},
	data() {
		return {
			ORDERING_ENABLED: ORDERING_ENABLED,
			loadingCoupons: false,
			claimableCoupons: [],
			claimingId: null,  // 正在抢的 template_id,用于 loading
			langVersion: 0,
			dateMatched: true,   // SPECIAL_DATE 当天是否命中日期模式（从 claimable-coupons 接口取）
			storeNameMap: {},    // store_id → 多语言门店名映射（拉一次门店列表建索引）
			// STORE_OPENING 开业活动状态
			openingInfo: null,       // opening-info 接口数据（user_claimed / has_coupon / 权益）
			openingClaiming: false,  // 领取中
			openingClaimed: false    // 本地已领取标记
		}
	},
	computed: {
		// 兼容 /banners（嵌套 campaign.type）和 /campaigns（顶层 campaign_type）两种字段
		campaignType() {
			if (!this.campaign) return ''
			return this.campaign.type || this.campaign.campaign_type || ''
		},
		// 兼容 rules 是对象（/banners 已预处理）或 JSON 字符串（/campaigns 原始）
		campaignRules() {
			if (!this.campaign) return {}
			const r = this.campaign.rules
			if (r && typeof r === 'object') return r
			if (typeof r === 'string') {
				try { return JSON.parse(r) || {} } catch (e) { return {} }
			}
			return {}
		},
		isDiscountType() {
			const t = this.campaignType
			return t === 'DISCOUNT' || t === 'FULL_REDUCTION' || t === 'SPECIAL_DATE'
		},
		// 是否展示领券区：COUPON_GRANT 类型，或 SPECIAL_DATE 类型含 coupon_ids
		isCouponGrantType() {
			const t = this.campaignType
			if (t === 'COUPON_GRANT') return true
			if (t === 'SPECIAL_DATE') {
				const ids = this.campaignRules.coupon_ids
				return Array.isArray(ids) && ids.length > 0
			}
			return false
		},
		// 开业活动（STORE_OPENING）：rules 快照含开业券/折扣/奖励，领券走专用接口
		isStoreOpeningType() {
			return this.campaignType === 'STORE_OPENING'
		},
		// 开业活动关联的门店 id（rules 快照或 extra_data）
		openingStoreId() {
			const c = this.campaign || {}
			// extra_data 兼容对象与 JSON 字符串两种形态（后端列表接口返回字符串）
			let extra = c.extra_data
			if (typeof extra === 'string') {
				try { extra = JSON.parse(extra) } catch (e) { extra = null }
			}
			return (extra && extra.store_id) || c.store_id || null
		},
		// 开业权益摘要：🏷️折扣 + ⭐积分 + 💰金币（opening-info 优先，回退 rules 快照）
		openingBenefitsText() {
			if (!this.isStoreOpeningType) return ''
			const src = this.openingInfo || this.campaignRules || {}
			const parts = []
			if (Number(src.discount_percent) > 0) parts.push(`${src.discount_percent}% OFF`)
			if (Number(src.extra_points) > 0) parts.push(this.t('opening.extraPoints', { n: src.extra_points }))
			if (Number(src.extra_coins) > 0) parts.push(this.t('opening.extraCoins', { n: src.extra_coins }))
			return parts.join(' · ')
		},
		// 是否为 SPECIAL_DATE 类型（用于显示"仅限特定日期"等特殊提示）
		isSpecialDateType() {
			return this.campaignType === 'SPECIAL_DATE'
		},
		typeIcon() {
			return getCampaignTypeIcon(this.campaignType)
		},
		typeName() {
			return getCampaignTypeName(this.campaignType)
		},
		campaignName() {
			return getLocalizedText(this.campaign, 'name')
		},
		rulesDescription() {
			if (!this.campaign) return ''
			const lang = i18n.getLanguage()
			// 兼容两种数据格式:
			// 1. 后端方案 A 文档:rules.description / rules.description_en / rules.description_th
			// 2. 后端实际实现:campaign.description / description_en / description_th(顶层)
			const rulesObj = this.campaignRules || {}
			const campObj = this.campaign
			// 优先取当前语言的描述
			const langKey = lang === 'en' ? 'description_en' : (lang === 'th' ? 'description_th' : 'description')
			const fromRules = rulesObj[langKey] || ''
			const fromCampaign = campObj[langKey] || ''
			// 当前语言有值 → 显示
			if (fromRules) return fromRules
			if (fromCampaign) return fromCampaign
			// 非中文环境下：如果只有中文描述且当前语言不是中文 → 不显示（避免中文硬编码出现在泰文/英文界面）
			if (lang !== 'zh') return ''
			// 中文环境：兜底用中文
			return rulesObj.description || campObj.description || ''
		},
		// 双号日 (SPECIAL_DATE) 特有：活动额外奖励的积分/金币（后端下发才显示）
		// 文档 2.1：bonus 字段在 rules 嵌套对象里
		extraBonusText() {
			if (this.campaignType !== 'SPECIAL_DATE') return ''
			const rules = this.campaignRules || {}
			const parts = []
			const pts = Number(rules.extra_points)
			const coins = Number(rules.extra_coins)
			if (pts > 0) parts.push(this.t('campaign.extraPoints', { n: pts }))
			if (coins > 0) parts.push(this.t('campaign.extraCoins', { n: coins }))
			// 折扣
			const pct = Number(rules.discount_percent)
			if (pct > 0) parts.push(`-${pct}%`)
			return parts.join('　')
		},
		// SPECIAL_DATE 日期模式文案（双号日 / MM-DD）
		datePatternText() {
			if (this.campaignType !== 'SPECIAL_DATE') return ''
			const rules = this.campaignRules || {}
			const patterns = rules.date_patterns || []
			if (patterns.length === 0) return ''
			const lang = i18n.getLanguage()
			const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			const monthNamesTh = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
			const formatMD = (mm, dd) => {
				const m = parseInt(mm, 10)
				const d = parseInt(dd, 10)
				if (lang === 'en') {
					if (m >= 1 && m <= 12) return `${monthNamesEn[m - 1]} ${d}`
				}
				if (lang === 'th') {
					if (m >= 1 && m <= 12) return `${d} ${monthNamesTh[m - 1]}`
				}
				return `${m}月${d}日`
			}
			const formatPattern = (p) => {
				if (p === '**-**') return this.t('campaign.doubleDay')
				// 区间模式：MM-DD~MM-DD（含跨年：开始>结束）
				if (p.includes('~')) {
					const [start, end] = p.split('~')
					const [sm, sd] = start.split('-')
					const [em, ed] = end.split('-')
					const rangeText = `${formatMD(sm, sd)} ~ ${formatMD(em, ed)}`
					// 跨年区间（开始月份>结束月份，如 12-20~01-05）
					if (parseInt(sm, 10) > parseInt(em, 10)) {
						return rangeText + `（${this.t('campaign.crossYear')}）`
					}
					return rangeText
				}
				// 单日模式：MM-DD
				const [mm, dd] = p.split('-')
				return formatMD(mm, dd)
			}
			const parts = patterns.map(formatPattern)
			return parts.join(' / ')
		},
		// 满减规则文案：满 X 减 Y（FULL_REDUCTION 类型核心字段）
		// 后端字段：rules.reduction（减免额）+ rules.threshold（门槛额）
		fullReductionText() {
			if (this.campaignType !== 'FULL_REDUCTION') return ''
			const r = this.campaignRules || {}
			const threshold = Number(r.threshold)
			const reduction = Number(r.reduction)
			if (threshold > 0 && reduction > 0) {
				return this.t('campaign.fullReductionRule', { threshold, reduction })
			}
			return ''
		},
		// 折扣规则文案：DISCOUNT 类型展示（SPECIAL_DATE 的折扣走 extraBonusText）
		// 后端字段：rules.discount_percent
		discountRuleText() {
			if (this.campaignType !== 'DISCOUNT') return ''
			const pct = Number((this.campaignRules || {}).discount_percent)
			if (pct > 0) return this.t('campaign.discountRule', { percent: pct })
			return ''
		},
		// 活动级最低消费（区别于单券 min_spend）
		// 后端字段：rules.min_spend 或 rules.min_order_amount
		minSpendText() {
			const r = this.campaignRules || {}
			const amount = Number(r.min_spend || r.min_order_amount || 0)
			if (amount > 0) return this.t('campaign.minSpendLabel', { amount })
			return ''
		},
		// 适用范围文案
		// banner 嵌套 campaign 可能无 store_id（被后端预处理为 is_global）；/campaigns 返回 is_global/applicable_stores
		applicableScopeText() {
			if (!this.campaign) return ''
			const lang = i18n.getLanguage()
			// 全门店
			if (this.campaign.is_global === true) {
				return this.t('campaign.allStoresScope')
			}
			// 指定门店：尝试显示具体名称
			if (this.campaign.is_global === false) {
				let stores = this.campaign.applicable_stores
				if (typeof stores === 'string') {
					try { stores = JSON.parse(stores) } catch (e) { stores = [] }
				}
				if (Array.isArray(stores) && stores.length > 0) {
					// 1 家 → 直接显示门店名
					if (stores.length === 1) {
						const name = this.getStoreName(stores[0])
						return name || this.t('campaign.specificStoresScope')
					}
					// 2-3 家 → 显示门店名列表
					if (stores.length <= 3) {
						const names = stores.map(id => this.getStoreName(id)).filter(Boolean)
						if (names.length > 0) return names.join(' / ')
					}
					// 4+ 家 → 显示"适用 N 家门店"
					return this.t('campaign.applicableStores', { n: stores.length })
				}
				return this.t('campaign.specificStoresScope')
			}
			// banner 嵌套：单店 campaign
			if (this.campaign.store_id) {
				const name = this.getStoreName(this.campaign.store_id)
				return name || this.t('campaign.specificStoresScope')
			}
			return ''
		},
	},
	watch: {
		visible(val) {
			if (val) {
				if (this.isCouponGrantType) {
					this.loadClaimableCoupons()
				}
				// 开业活动：拉 opening-info 判断是否已领券
				if (this.isStoreOpeningType && this.openingStoreId) {
					this.loadOpeningInfo()
				}
				// 弹窗打开时拉门店列表（用于显示活动适用门店名称）
				this.loadStoreNames()
			} else if (!val) {
				// 关闭弹窗时重置
				this.claimableCoupons = []
				this.claimingId = null
				this.openingInfo = null
				this.openingClaimed = false
			}
		}
	},
	methods: {
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		formatDateRange,
		getCouponName(coupon) {
			return getLocalizedText(coupon, 'name')
		},
		formatCouponValue(coupon) {
			// ITEM 菜品券：无金额，显示"菜品券"标签
			if (coupon.type === 'ITEM') {
				return this.t('campaign.itemVoucher')
			}
			// PERCENT 折扣券：value=30 表示减免30%（即7折）
			if (coupon.type === 'PERCENT') {
				const v = Number(coupon.value) || 0
				const lang = i18n.getLanguage()
				if (lang === 'zh') {
					// 中文"折"：10 - value/10，如 30 → 7折
					const discount = (10 - v / 10).toFixed(1).replace('.0', '')
					return `${discount}折`
				}
				if (lang === 'th') return `ลด ${v}%`
				return `${v}% OFF`
			}
			return `฿${coupon.value}`
		},
		formatRemaining(coupon) {
			// total_quota = -1 表示无限制
			if (coupon.total_quota < 0) {
				return this.t('campaign.remainingUnlimited', { claimed: coupon.claimed_count })
			}
			return this.t('campaign.remaining', { n: coupon.remaining, total: coupon.total_quota })
		},
		/**
		 * 券有效期展示（按 valid_type 区分）：
		 * - DAYS_AFTER_CLAIM → 「领取后 N 天有效」（不显示模板 end_date，避免 2056 占位）
		 * - FIXED             → 显示 start_date ~ end_date
		 * - 其他 / 缺失        → 不展示
		 */
		formatValidity(coupon) {
			if (!coupon) return ''
			const validType = String(coupon.valid_type || '').toUpperCase()
			const validDays = Number(coupon.valid_days || 0)
			if (validType === 'DAYS_AFTER_CLAIM' && validDays > 0) {
				return this.t('coupons.validDays', { days: validDays })
			}
			if (validType === 'FIXED' && coupon.end_date) {
				const start = coupon.start_date ? coupon.start_date.substring(0, 10) : ''
				const end = coupon.end_date.substring(0, 10)
				return start ? `${start} ~ ${end}` : end
			}
			return ''
		},
		getCouponBtnText(coupon) {
			if (this.claimingId === coupon.coupon_id) return this.t('common.loading')
			if (coupon.user_claimed) return this.t('campaign.claimed')
			if (coupon.total_quota >= 0 && coupon.remaining <= 0) return this.t('campaign.soldOut')
			if (!coupon.user_can_claim) return this.t('campaign.cannotClaim')
			return this.t('campaign.claimNow')
		},

		// 拉门店列表，建 store_id → 多语言名映射（用于显示活动适用门店名称）
		async loadStoreNames() {
			if (Object.keys(this.storeNameMap).length > 0) return  // 已加载过不重复拉
			try {
				const res = await getStores({ page_size: 200 })
				if (res && res.code === 0 && res.data) {
					const items = Array.isArray(res.data) ? res.data : (res.data.items || [])
					const map = {}
					for (const s of items) {
						if (s && s.id) {
							map[s.id] = {
								name: s.name || '',
								name_zh: s.name_zh || s.name || '',
								name_en: s.name_en || '',
								name_th: s.name_th || ''
							}
						}
					}
					this.storeNameMap = map
				}
			} catch (e) {
				console.warn('[campaign-modal] loadStoreNames failed:', e)
			}
		},

		// 取门店名（按当前语言）
		getStoreName(storeId) {
			if (!storeId) return ''
			const s = this.storeNameMap[storeId]
			if (!s) return ''
			const lang = i18n.getLanguage()
			return s['name_' + lang] || s.name || s.name_en || ''
		},

		async loadClaimableCoupons() {
			if (!this.campaign || !this.campaign.id) return
			this.loadingCoupons = true
			try {
				const data = USE_MOCK
					? await mockClaimableCoupons(this.campaign.id)
					: await getCampaignClaimableCoupons(this.campaign.id)
				this.claimableCoupons = (data && data.coupons) || []
				// SPECIAL_DATE 专用：当天是否命中日期模式
				if (data && typeof data.date_matched === 'boolean') {
					this.dateMatched = data.date_matched
				} else {
					this.dateMatched = true   // COUPON_GRANT 等其他类型默认 true
				}
			} catch (e) {
				console.error('[campaign-modal] load coupons failed:', e)
				this.claimableCoupons = []
				this.dateMatched = false
			} finally {
				this.loadingCoupons = false
			}
		},

		/**
		 * 加载开业信息（STORE_OPENING）：判断 user_claimed 已领取置灰
		 */
		async loadOpeningInfo() {
			try {
				const res = await getOpeningInfo(this.openingStoreId)
				if (res && res.code === 0 && res.data) {
					this.openingInfo = res.data
					this.openingClaimed = !!(res.data.user_claimed)
				}
			} catch (e) {
				console.warn('[campaign-modal] loadOpeningInfo failed:', e)
			}
		},

		/**
		 * 领取开业券（STORE_OPENING）：专用接口，一店一券
		 */
		async handleClaimOpeningCoupon() {
			if (this.openingClaiming || this.openingClaimed) return
			this.openingClaiming = true
			try {
				await claimOpeningCoupon(this.openingStoreId)
				this.openingClaimed = true
				uni.showToast({ title: this.t('campaign.claimSuccess'), icon: 'success' })
				this.$emit('claimed', { type: 'STORE_OPENING', store_id: this.openingStoreId })
			} catch (e) {
				console.error('[campaign-modal] claim opening coupon failed:', e)
				const msg = resolveClaimErrorMessage(e)
				this.$emit('close')
				setTimeout(() => {
					uni.showModal({
						title: this.t('coupons.claimFailed'),
						content: msg,
						showCancel: false,
						confirmText: this.t('common.confirm')
					})
				}, 100)
				// 已领过：本地置灰
				const code = e && (e.code || e.bizCode)
				if (code === 'CLAIM_LIMIT_REACHED' || /已经|already|claimed|领过/i.test(msg || '')) {
					this.openingClaimed = true
				}
			} finally {
				this.openingClaiming = false
			}
		},

		async handleClaim(coupon) {
			if (!coupon.user_can_claim || this.claimingId) return
			this.claimingId = coupon.coupon_id
			try {
				if (USE_MOCK) {
					await mockClaimCoupon(coupon.coupon_id)
				} else {
					// 从活动入口领取 → 传 campaign_id，按"每人每活动"维度计数
					await claimCoupon(coupon.coupon_id, this.campaign && this.campaign.id)
				}
				// 成功:本地更新
				coupon.user_claimed = true
				coupon.user_can_claim = false
				coupon.claimed_count += 1
				coupon.remaining = Math.max(0, coupon.remaining - 1)
				uni.showToast({ title: this.t('campaign.claimSuccess'), icon: 'success' })
				this.$emit('claimed', coupon)
			} catch (e) {
				console.error('[campaign-modal] claim failed:', e)
				const msg = resolveClaimErrorMessage(e)
				// 关闭活动弹窗再弹 modal，避免 uni-modal z-index (999) 被活动弹窗 z-index (9998) 盖住
				this.$emit('close')
				setTimeout(() => {
					uni.showModal({
						title: this.t('coupons.claimFailed'),
						content: msg,
						showCancel: false,
						confirmText: this.t('common.confirm')
					})
				}, 100)
				// 已领取场景：标记本地状态，避免用户重复点击
				const code = e && (e.code || e.bizCode)
				if (code === 'CLAIM_LIMIT_REACHED' || code === 409 && /已经|already|claimed|领过/i.test(msg)) {
					coupon.user_claimed = true
					coupon.user_can_claim = false
				}
			} finally {
				this.claimingId = null
			}
		},

		handleOrderNow() {
			this.$emit('close')
			// 构建跳转 URL：如果活动指定了门店，传 store_ids 参数让门店列表页只显示这些门店
			let url = '/pages/dinein-stores/index'
			const c = this.campaign || {}
			const storeIds = this.getCampaignStoreIds()
			if (storeIds.length > 0) {
				url += '?store_ids=' + encodeURIComponent(storeIds.join(','))
			}
			setTimeout(() => {
				uni.navigateTo({ url })
			}, 100)
		},

		// 获取活动适用的门店 ID 列表
		getCampaignStoreIds() {
			const c = this.campaign || {}
			// 指定门店
			if (c.is_global === false) {
				let stores = c.applicable_stores
				if (typeof stores === 'string') {
					try { stores = JSON.parse(stores) } catch (e) { stores = [] }
				}
				if (Array.isArray(stores) && stores.length > 0) return stores
			}
			// 单店 campaign
			if (c.store_id) return [c.store_id]
			// 全门店 → 空数组（不过滤）
			return []
		},
		handleViewMyCoupons() {
			this.$emit('close')
			setTimeout(() => {
				uni.navigateTo({ url: '/pages/coupons/index' })
			}, 200)
		},
		handleMaskClick() {
			this.handleClose()
		},
		handleClose() {
			this.$emit('close')
		}
	}
}
</script>

<style scoped>
.campaign-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.7);
	z-index: 9998;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 32rpx;
}

.campaign-container {
	width: 100%;
	max-width: 680rpx;
	max-height: 80vh;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	overflow: hidden;
	position: relative;
	/* 不用 flex 布局，scroll-view 用 calc 高度 */
}

.close-btn {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background-color: rgba(0,0,0,0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.close-text {
	color: #FFFFFF;
	font-size: 40rpx;
	line-height: 1;
}

/* scroll-view 用 calc 高度：80vh 减去底部按钮区（约 220rpx） */
.campaign-scroll {
	height: calc(80vh - 220rpx);
	max-height: calc(80vh - 220rpx);
}

/* Banner 大图 */
.banner-section {
	width: 100%;
	height: 320rpx;
	background-color: #F5F5F5;
}

.banner-image {
	width: 100%;
	height: 100%;
}

.banner-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #FFF6DE 0%, #FFE9B3 100%);
}

.banner-placeholder-icon {
	width: 120rpx;
	height: 120rpx;
}

/* 标题区 */
.title-section {
	padding: 32rpx 32rpx 16rpx;
	position: relative;
}

.title-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 12rpx;
}

.type-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 12rpx;
	flex-shrink: 0;
}

.campaign-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #1A1A1A;
	flex: 1;
	line-height: 1.3;
}

.campaign-period {
	display: block;
	font-size: 24rpx;
	color: #828282;
	margin-bottom: 16rpx;
}

.type-tag {
	align-self: flex-start;
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	margin-top: 4rpx;
}

.type-tag-DISCOUNT { background-color: #E3F2FD; }
.type-tag-FULL_REDUCTION { background-color: #FFF3E0; }
.type-tag-COUPON_GRANT { background-color: #F3E5F5; }
.type-tag-SPECIAL_DATE { background-color: #FFE4E1; }

.type-tag-text {
	font-size: 22rpx;
	color: #1A1A1A;
}

/* 规则区 */
.rules-section {
	padding: 16rpx 32rpx 32rpx;
}

.section-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-right: 16rpx;
}

.section-line {
	flex: 1;
	height: 2rpx;
	background-color: #E0E0E0;
}

.rules-desc {
	display: block;
	font-size: 28rpx;
	color: #333333;
	line-height: 1.6;
	margin-bottom: 16rpx;
}

.rules-hint {
	margin-top: 8rpx;
	display: flex;
	align-items: flex-start;
}

/* 规则行左侧圆点（替代原 emoji 前缀） */
.rules-hint-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 6rpx;
	background-color: #F2B131;
	margin: 12rpx 12rpx 0 4rpx;
	flex-shrink: 0;
}

.rules-hint-dot-plain {
	background-color: #D9D9D9;
}

.rules-hint-text {
	font-size: 24rpx;
	color: #828282;
	line-height: 1.6;
}

.rules-hint-highlight {
	margin-top: 12rpx;
	padding: 12rpx 16rpx;
	background-color: #FFF8E1;
	border-radius: 8rpx;
}

.rules-hint-highlight .rules-hint-text {
	font-size: 26rpx;
	color: #E5A02E;
	font-weight: 500;
}

/* 领券区 */
.coupons-section {
	padding: 16rpx 32rpx 24rpx;
}

.loading-row, .empty-row {
	padding: 60rpx 0;
	text-align: center;
}

/* SPECIAL_DATE 当天未命中日期模式提示 */
.date-not-matched {
	padding: 40rpx 24rpx;
	text-align: center;
	background-color: #FFF8E1;
	border-radius: 12rpx;
	margin-top: 16rpx;
}
.date-not-matched-text {
	font-size: 26rpx;
	color: #B5750C;
	line-height: 1.5;
}

.loading-text, .empty-text {
	font-size: 26rpx;
	color: #828282;
}

.coupon-card {
	display: flex;
	flex-direction: row;
	height: 200rpx;
	background-color: #FFF8E1;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
	overflow: hidden;
	border: 2rpx solid #F2B131;
}

.coupon-left {
	width: 220rpx;
	padding: 24rpx 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #F2B131 0%, #FF8A00 100%);
}

.coupon-value {
	font-size: 48rpx;
	font-weight: 700;
	color: #FFFFFF;
	line-height: 1;
}

.coupon-threshold {
	font-size: 22rpx;
	color: rgba(255,255,255,0.9);
	margin-top: 8rpx;
	text-align: center;
}

.coupon-divider {
	width: 2rpx;
	height: 100%;
	background-color: rgba(242, 177, 49, 0.3);
	position: relative;
}

.coupon-divider::before, .coupon-divider::after {
	content: '';
	position: absolute;
	left: -8rpx;
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background-color: #FFFFFF;
}

.coupon-divider::before { top: -8rpx; }
.coupon-divider::after { bottom: -8rpx; }

.coupon-right {
	flex: 1;
	padding: 20rpx 24rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.coupon-name {
	font-size: 26rpx;
	font-weight: 600;
	color: #1A1A1A;
	margin-bottom: 8rpx;
	line-height: 1.3;
}

.coupon-remaining {
	font-size: 22rpx;
	color: #828282;
	margin-bottom: 12rpx;
}

.coupon-validity {
	display: block;
	font-size: 20rpx;
	color: #B5750C;
	margin-bottom: 8rpx;
	line-height: 1.3;
}

.claim-btn {
	align-self: flex-end;
	padding: 8rpx 20rpx;
	border-radius: 24rpx;
	background-color: #F2B131;
}

.claim-btn-text {
	font-size: 24rpx;
	color: #FFFFFF;
	font-weight: 600;
}

.claim-btn-disabled {
	opacity: 0.5;
}

.claim-btn-done {
	background-color: #BDBDBD;
}

/* 底部 CTA */
.footer-cta {
	padding: 16rpx 32rpx 24rpx;
	border-top: 2rpx solid #F0F0F0;
}

.order-btn {
	height: 80rpx;
	background-color: #F2B131;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.order-btn-disabled {
	background-color: #D9D9D9;
}

.order-btn-text {
	color: #FFFFFF;
	font-size: 30rpx;
	font-weight: 600;
}

/* 开业活动权益摘要 */
.opening-cta {
	flex-direction: column;
}

.opening-benefits-hint {
	margin-top: 16rpx;
	padding: 12rpx 20rpx;
	background-color: #FFF8E1;
	border-radius: 12rpx;
}

.opening-benefits-text {
	font-size: 24rpx;
	color: #C2890F;
}

.footer-coupons-link {
	padding: 20rpx 32rpx 28rpx;
	border-top: 2rpx solid #F0F0F0;
	text-align: center;
}

.footer-coupons-text {
	font-size: 26rpx;
	color: #F2B131;
	font-weight: 600;
}
</style>
