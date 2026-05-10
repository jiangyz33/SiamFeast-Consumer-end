<template>
	<view class="points-mall-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ i18n.t('pointsMall.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 会员等级区域 -->
			<view class="member-level-section" :class="{ 'platinum-section': currentLevel === 1 }">
				<view class="level-header">
					<view class="level-titles">
                        <text class="level-title" :class="{ 'level-active': currentLevel === 0 }">{{ i18n.t('member.normal') }}</text>
                        <text class="level-title" :class="{ 'level-active': currentLevel === 1 }">{{ i18n.t('member.platinum') }}</text>
                    </view>
                </view>
                <view class="level-info">
                    <text class="level-status">{{ currentLevel === 0 ? i18n.t('member.normalMember') : i18n.t('member.platinumMember') }}</text>
                    <view class="platinum-badge" v-if="currentLevel === 1">
                        <text class="platinum-icon">♛</text>
                    </view>
                    <view class="upgrade-btn" :class="{ 'upgrade-btn-disabled': !canUpgrade }" @click="handleUpgrade" v-if="currentLevel === 0">
                        <text class="upgrade-text">{{ i18n.t('member.upgrade') }}</text>
                    </view>
                </view>
                <view class="progress-section" v-if="currentLevel === 0">
                    <view class="progress-bar">
                        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
                    </view>
                    <text class="progress-text">{{ i18n.t('member.consumption') }} {{ consumedAmount }}/{{ totalAmount }}</text>
                </view>
                <view class="level-benefit" v-if="currentLevel === 0">
                    <text class="benefit-text">{{ i18n.t('member.platinumBenefit') }}</text>
                </view>
                <view class="level-benefit platinum-benefit" v-if="currentLevel === 1">
                    <text class="benefit-text">{{ i18n.t('upgrade.benefitBirthday') }} · {{ i18n.t('upgrade.benefitDiscount') }} · {{ i18n.t('upgrade.benefitPriority') }}</text>
                </view>
            </view>

            <!-- 统计数据区域 -->
            <view class="stats-section">
                <view class="stat-item" @click="handleBalanceClick">
                    <text class="stat-value">{{ userBalance }}</text>
                    <text class="stat-label">{{ i18n.t('member.balance') }}</text>
                </view>
                <view class="stat-item">
                    <text class="stat-value">{{ userPoints }}</text>
                    <text class="stat-label">{{ i18n.t('member.points') }}</text>
                </view>
                <view class="stat-item" @click="handleNewUserPackClick">
                    <text class="stat-value">{{ newUserCoupons }}</text>
                    <text class="stat-label">{{ i18n.t('member.newUserPack') }}</text>
                </view>
            </view>

            <!-- 兑换Tab -->
            <view class="exchange-tabs">
                <view
                    class="exchange-tab"
                    :class="{ 'tab-active': activeTab === 0 }"
                    @click="switchTab(0)"
                >
                    <text class="tab-text">{{ i18n.t('member.pointsExchange') }}</text>
                </view>
                <view
                    class="exchange-tab"
                    :class="{ 'tab-active': activeTab === 1 }"
                    @click="switchTab(1)"
                >
                    <text class="tab-text">{{ i18n.t('member.balanceExchange') }}</text>
                </view>
            </view>

            <!-- 积分兑换商品列表 -->
            <view class="products-grid" v-if="activeTab === 0">
                <view
                    class="product-card"
                    v-for="item in pointsBenefits"
                    :key="item.id"
                    @click="handleProductClick(item)"
                >
                    <image class="product-image" :src="item.image_url || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
                    <view class="product-info">
                        <text class="product-name">{{ item["name_" + i18n.getLanguage()] || item.name || item.name_en }}</text>
                        <view class="product-footer">
                            <view class="points-cost">
                                <text class="cost-num">{{ item.point_price }}</text>
                                <text class="cost-unit">{{ i18n.t('member.points') }}</text>
                            </view>
                            <view class="exchange-btn" @click.stop="handleExchange(item)">
                                <text class="exchange-text">{{ i18n.t('member.exchange') }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-if="pointsBenefits.length === 0" class="empty-state">
                    <image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
                        <text class="empty-title">{{ i18n.t("common.empty.product") }}</text>
                        <text class="empty-desc">{{ i18n.t("common.empty.productDesc") }}</text>
                </view>
            </view>

            <!-- 余额兑换商品列表 -->
            <view class="products-grid" v-if="activeTab === 1">
                <view
                    class="product-card"
                    v-for="item in balanceBenefits"
                    :key="item.id"
                    @click="handleProductClick(item)"
                >
                    <image class="product-image" :src="item.image_url || '/static/images/img-placeholder.svg'" mode="aspectFill"></image>
                    <view class="product-info">
                        <text class="product-name">{{ item["name_" + i18n.getLanguage()] || item.name || item.name_en }}</text>
                        <view class="product-footer">
                            <view class="points-cost">
							<image class="coin-icon" src="/static/icons/coin.svg" mode="aspectFit"></image>
                                <text class="cost-num">{{ item.coin_price }}</text>
                            </view>
                            <view class="exchange-btn" @click.stop="handleExchange(item)">
                                <text class="exchange-text">{{ i18n.t('member.exchange') }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-if="balanceBenefits.length === 0" class="empty-state">
                    <image class="empty-icon" src="/static/images/empty-product.svg" mode="aspectFit"></image>
                        <text class="empty-title">{{ i18n.t("common.empty.product") }}</text>
                        <text class="empty-desc">{{ i18n.t("common.empty.productDesc") }}</text>
                </view>
            </view>

            <!-- 底部占位 -->
            <view class="bottom-placeholder"></view>
        </scroll-view>

        <!-- 升级动画 -->
        <upgrade-animation
            :visible="showUpgradeAnimation"
            @close="handleUpgradeAnimationClose"
        ></upgrade-animation>

        <!-- 收货地址弹窗 -->
        <view class="address-modal-mask" v-if="showAddressModal" @click="showAddressModal = false">
            <view class="address-modal" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">填写收货信息</text>
                    <view class="modal-close" @click="showAddressModal = false">
                        <text class="close-text">✕</text>
                    </view>
                </view>
                <view class="modal-body">
                    <view class="form-item">
                        <text class="form-label">收货人</text>
                        <input class="form-input" v-model="recipientForm.name" placeholder="请输入姓名" />
                    </view>
                    <view class="form-item">
                        <text class="form-label">联系电话</text>
                        <input class="form-input" v-model="recipientForm.phone" placeholder="请输入手机号" type="number" />
                    </view>
                    <view class="form-item">
                        <text class="form-label">收货地址</text>
                        <textarea class="form-textarea" v-model="recipientForm.address" placeholder="请输入详细地址" />
                    </view>
                </view>
                <view class="modal-footer">
                    <view class="modal-btn modal-btn-cancel" @click="showAddressModal = false">
                        <text class="modal-btn-text cancel">取消</text>
                    </view>
                    <view class="modal-btn modal-btn-confirm" @click="confirmExchange">
                        <text class="modal-btn-text confirm">确认兑换</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import UpgradeAnimation from '@/components/upgrade-animation.vue'
import { getAddressList } from '@/api/services/address.js'
import {
	getMemberProgress,
	getMemberPoints,
	getMemberBalance,
	getMemberInfo,
	getPointsBenefits,
	getBalanceBenefits,
	exchangeBenefit
} from '@/api/services/member.js'

export default {
    components: {
        UpgradeAnimation
    },
    data() {
        return {
            i18n: i18n,
            statusBarHeight: 20,
            contentHeight: 500,
            currentLevel: 0,
            consumedAmount: 0,
            totalAmount: 200,
            userPoints: 0,
            userBalance: 0,
            newUserCoupons: 0,
            activeTab: 0,
            pointsBenefits: [],
            balanceBenefits: [],
            showUpgradeAnimation: false,
            defaultAddress: null,
            showAddressModal: false,
            pendingExchangeItem: null,
            recipientForm: {
                name: '',
                phone: '',
                address: ''
            }
        }
    },
    computed: {
        progressPercent() {
            if (this.totalAmount <= 0) return 0
            return Math.min((this.consumedAmount / this.totalAmount) * 100, 100)
        },
        canUpgrade() {
            return this.consumedAmount >= this.totalAmount
        }
    },
    onLoad() {
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

            const navBarHeight = 44
            const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
            this.contentHeight = systemInfo.windowHeight - navBarHeight - safeAreaBottom - this.statusBarHeight
        },

        async loadData() {
            try {
                const [progressRes, pointsRes, balanceRes, pointsBenefitsRes, balanceBenefitsRes, memberInfoRes, addressRes] = await Promise.allSettled([
                    getMemberProgress(),
                    getMemberPoints(),
                    getMemberBalance(),
                    getPointsBenefits(),
                    getBalanceBenefits(),
                    getMemberInfo(),
                    getAddressList()
                ])

                if (progressRes.status === 'fulfilled' && progressRes.value.code === 0 && progressRes.value.data) {
                    const d = progressRes.value.data
                    this.consumedAmount = d.current_spent || 0
                    this.totalAmount = d.required_for_next || 200
                    const isBackendPlatinum = d.current_tier === 'PLATINUM'
                    const hasMetGoal = this.consumedAmount >= this.totalAmount
                    const hasSeenAnimation = this.hasSeenUpgradeAnimation()
                    console.log('[points-mall] progress:', JSON.stringify(d), 'isBackendPlatinum:', isBackendPlatinum, 'hasMetGoal:', hasMetGoal, 'hasSeenAnimation:', hasSeenAnimation)
                    // Backend platinum OR user has seen animation before = show platinum directly
                    if (isBackendPlatinum || hasSeenAnimation) {
                        this.currentLevel = 1
                    } else if (hasMetGoal) {
                        // Goal met but animation not seen = play animation
                        this.currentLevel = 0
                        this.showUpgradeAnimation = true
                        this.markUpgradeAnimationShown()
                    } else {
                        this.currentLevel = 0
                    }
                }
                if (pointsRes.status === 'fulfilled' && pointsRes.value.code === 0 && pointsRes.value.data) {
                    this.userPoints = pointsRes.value.data.balance || 0
                }
                if (balanceRes.status === 'fulfilled' && balanceRes.value.code === 0 && balanceRes.value.data) {
                    this.userBalance = balanceRes.value.data.balance || 0
                }
                if (memberInfoRes.status === 'fulfilled' && memberInfoRes.value.code === 0 && memberInfoRes.value.data) {
                    this.newUserCoupons = memberInfoRes.value.data.new_user_coupons || 0
                }
                if (pointsBenefitsRes.status === 'fulfilled' && pointsBenefitsRes.value.code === 0 && pointsBenefitsRes.value.data) {
                    this.pointsBenefits = pointsBenefitsRes.value.data.items || []
                }
                if (balanceBenefitsRes.status === 'fulfilled' && balanceBenefitsRes.value.code === 0 && balanceBenefitsRes.value.data) {
                    this.balanceBenefits = balanceBenefitsRes.value.data.items || []
                }
                if (addressRes.status === 'fulfilled' && addressRes.value.code === 0 && addressRes.value.data) {
                    const addrData = addressRes.value.data
                    const addresses = Array.isArray(addrData) ? addrData : (addrData.items || [])
                    this.defaultAddress = addresses.find(a => a.is_default || a.isDefault) || addresses[0] || null
                }
            } catch (e) {
                console.error('加载积分商城数据失败:', e)
            }
        },

        goBack() {
            uni.navigateBack()
        },

        switchTab(index) {
            this.activeTab = index
        },

        handleUpgrade() {
            if (!this.canUpgrade) return
            this.currentLevel = 1
            this.showUpgradeAnimation = true
            this.markUpgradeAnimationShown()
        },

        handleUpgradeAnimationClose() {
            this.showUpgradeAnimation = false
            this.currentLevel = 1
            this.markUpgradeAnimationShown()
        },

        hasSeenUpgradeAnimation() {
            const UPGRADE_SHOWN_KEY = 'siamfeast_upgrade_shown_platinum'
            try {
                return !!uni.getStorageSync(UPGRADE_SHOWN_KEY)
            } catch (e) {
                return false
            }
        },

        markUpgradeAnimationShown() {
            const UPGRADE_SHOWN_KEY = 'siamfeast_upgrade_shown_platinum'
            try {
                uni.setStorageSync(UPGRADE_SHOWN_KEY, '1')
            } catch (e) {
                // ignore
            }
        },

        handleBalanceClick() {
            showToast(this.i18n.t('member.balanceDetail'))
        },

        handleNewUserPackClick() {
            showToast(this.i18n.t('member.newUserPack'))
        },

        handleProductClick(item) {
            showToast(`${item.name || item.name_en}`)
        },

        async handleExchange(item) {
            if (this.activeTab === 0 && item.point_price && this.userPoints < item.point_price) {
                showToast(this.i18n.t('member.pointsNotEnough'))
                return
            }

            this.pendingExchangeItem = item
            this.recipientForm = {
                name: '',
                phone: '',
                address: ''
            }
            if (this.defaultAddress) {
                this.recipientForm.name = this.defaultAddress.contact_name || this.defaultAddress.name || ''
                this.recipientForm.phone = this.defaultAddress.contact_phone || this.defaultAddress.phone || ''
                this.recipientForm.address = this.defaultAddress.address || this.defaultAddress.detail || ''
            }
            this.showAddressModal = true
        },

        async confirmExchange() {
            const form = this.recipientForm
            if (!form.name.trim()) {
                showToast('请输入收货人姓名')
                return
            }
            if (!form.phone.trim()) {
                showToast('请输入联系电话')
                return
            }
            if (!form.address.trim()) {
                showToast('请输入收货地址')
                return
            }

            const item = this.pendingExchangeItem
            if (!item) return

            this.showAddressModal = false
            try {
                const exchangeParams = {
                    benefit_id: item.id,
                    exchange_type: this.activeTab === 0 ? 'points' : 'balance',
                    quantity: 1,
                    recipient_name: form.name.trim(),
                    recipient_phone: form.phone.trim(),
                    recipient_address: form.address.trim()
                }
                if (this.activeTab === 0 && item.point_price) {
                    exchangeParams.points_amount = item.point_price
                }
                if (this.activeTab === 1 && item.coin_price) {
                    exchangeParams.coin_amount = item.coin_price
                }
                await exchangeBenefit(exchangeParams)
                showToast(this.i18n.t('member.exchangeSuccess'))
                this.loadData()
            } catch (e) {
                console.error('兑换失败:', e)
                showToast('兑换失败')
            }
        }
    }
}
</script>

<style scoped>
.points-mall-page {
    min-height: 100vh;
    background-color: #F3F3F3;
    display: flex;
    flex-direction: column;
}

.status-bar {
    width: 100%;
    background: linear-gradient(135deg, #936c2a 0%, #6b3a10 100%);
}

.nav-bar {
    height: 44px;
    background: linear-gradient(135deg, #936c2a 0%, #6b3a10 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
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
    color: #FFFFFF;
}

.nav-right {
    width: 32px;
}

.content-scroll {
    flex: 1;
    background-color: #FFFFFF;
}

/* 会员等级区域 */
.member-level-section {
    background: linear-gradient(135deg, #FFF8E7 0%, #F5E6C8 50%, #E8D5AA 100%);
    padding: 16px;
    position: relative;
    overflow: hidden;
}

.member-level-section::after {
    content: 'VIP';
    position: absolute;
    top: 8px;
    right: 14px;
    font-size: 32px;
    font-weight: 900;
    color: rgba(147, 108, 42, 0.06);
    letter-spacing: 2px;
}

.level-header {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
}

.level-titles {
    display: flex;
    gap: 35px;
}

.level-title {
    font-size: 14px;
    font-weight: 700;
    color: #936c2a91;
}

.level-title.level-active {
    color: #936c2a;
}

.level-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.level-status {
    font-size: 14px;
    font-weight: 700;
    color: #936c2a;
}

.upgrade-btn {
    background: linear-gradient(135deg, #936c2a 0%, #b8892e 100%);
    border-radius: 14px;
    padding: 4px 12px;
    box-shadow: 0 2px 6px rgba(147, 108, 42, 0.3);
}

.upgrade-btn-disabled {
    background: #CCCCCC;
    box-shadow: none;
    opacity: 0.6;
}

.upgrade-text {
    font-size: 10px;
    font-weight: 600;
    color: #FFFFFF;
    letter-spacing: 0.5px;
}

.progress-section {
    margin-bottom: 8px;
}

.progress-bar {
    height: 4px;
    background-color: rgba(147, 108, 42, 0.15);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 6px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #936c2a 0%, #F2B131 100%);
    border-radius: 2px;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 14px;
    font-weight: 700;
    color: #936c2a;
}

.level-benefit {
    display: flex;
    justify-content: center;
    margin-top: 8px;
}

.benefit-text {
    font-size: 10px;
    font-weight: 500;
    color: #936c2a;
    background-color: rgba(147, 108, 42, 0.1);
    padding: 4px 12px;
    border-radius: 13px;
    border: 1px solid rgba(147, 108, 42, 0.15);
}

/* 统计数据区域 */
.stats-section {
    display: flex;
    justify-content: space-around;
    padding: 12px 0;
    background-color: #FFFFFF;
    border-bottom: 1px solid #F3F3F3;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #000000CC;
}

.stat-label {
    font-size: 14px;
    font-weight: 500;
    color: #000000CC;
}

/* 兑换Tab */
.exchange-tabs {
    display: flex;
    padding: 12px 16px;
    gap: 12px;
    background-color: #FFFFFF;
}
.exchange-tab {
    flex: 1;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background-color: #F3F3F3;
    transition: all 0.2s ease;
}
.exchange-tab.tab-active {
    background: linear-gradient(135deg, #936c2a 0%, #b8892e 100%);
    box-shadow: 0 3px 10px rgba(147, 108, 42, 0.3);
}
.tab-text {
    font-size: 14px;
    color: #000000CC;
}
.tab-active .tab-text {
    color: #FFFFFF;
    font-weight: 500;
}

/* 商品列表 */
.products-grid {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    gap: 10px;
    background-color: #FFFFFF;
}
.product-card {
    width: calc(50% - 5px);
    background-color: #FFFFFF;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #F3F3F3;
}
.product-image {
    width: 100%;
    height: 140px;
}
.product-info {
    padding: 8px 10px;
    background-color: #fffbf4;
}
.product-name {
    font-size: 11px;
    font-weight: 500;
    color: #000000CC;
    opacity: 0.9;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 8px;
}
.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.points-cost {
    display: flex;
    align-items: baseline;
    gap: 2px;
}
			.coin-icon {
				width: 14px;
				height: 14px;
				margin-right: 2px;
			}

.cost-symbol {
    font-size: 12px;
    font-weight: 700;
    color: #936c2a;
}
.cost-num {
    font-size: 16px;
    font-weight: 700;
    color: #936c2a;
}
.cost-unit {
    font-size: 10px;
    color: #936c2a;
}
.exchange-btn {
    background-color: #936c2a;
    border-radius: 12px;
    padding: 4px 12px;
}
.exchange-text {
    font-size: 12px;
    color: #FFFFFF;
}
/* 底部占位 */
.bottom-placeholder {
    height: 20px;
}
/* 空状态 */
.empty-state {
    width: 100%;
    padding: 40px 0;
    display: flex;
    justify-content: center;
}
.empty-title {
    font-size: 15px;
    color: #333;
    font-weight: 500;
    margin-bottom: 6px;
}
.empty-desc {
    font-size: 13px;
    color: #999;
}

/* 铂金权益 */
.platinum-benefit .benefit-text {
	background-color: rgba(107, 58, 16, 0.12);
	border-color: rgba(107, 58, 16, 0.2);
}

/* 铂金会员样式 */
.platinum-section {
    background: linear-gradient(135deg, #E8D5AA 0%, #D4C090 30%, #C9B47E 60%, #B8A06A 100%) !important;
    border: 1px solid rgba(201, 180, 126, 0.5);
}

.platinum-section::after {
    content: '♛' !important;
    font-size: 80px !important;
    color: rgba(201, 180, 126, 0.08) !important;
}

.platinum-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #FFD700 0%, #F2B131 50%, #c49a3c 100%);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(242, 177, 49, 0.4);
}

.platinum-icon {
    font-size: 16px;
    color: #1a0a00;
}

/* 收货地址弹窗 */
.address-modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}
.address-modal {
    width: 85%;
    background-color: #FFFFFF;
    border-radius: 12px;
    overflow: hidden;
}
.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #F3F3F3;
}
.modal-title {
    font-size: 16px;
    font-weight: 700;
    color: #000000CC;
}
.modal-close {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.close-text {
    font-size: 18px;
    color: #999999;
}
.modal-body {
    padding: 16px;
}
.form-item {
    margin-bottom: 14px;
}
.form-item:last-child {
    margin-bottom: 0;
}
.form-label {
    font-size: 13px;
    font-weight: 500;
    color: #000000CC;
    margin-bottom: 6px;
    display: block;
}
.form-input {
    width: 100%;
    height: 40px;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 14px;
    color: #000000CC;
    box-sizing: border-box;
}
.form-textarea {
    width: 100%;
    height: 72px;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    color: #000000CC;
    box-sizing: border-box;
}
.modal-footer {
    display: flex;
    gap: 12px;
    padding: 0 16px 16px;
}
.modal-btn {
    flex: 1;
    height: 44px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.modal-btn-cancel {
    background-color: #F3F3F3;
}
.modal-btn-confirm {
    background-color: #936c2a;
}
.modal-btn-text {
    font-size: 15px;
    font-weight: 500;
}
.modal-btn-text.cancel {
    color: #00000099;
}
.modal-btn-text.confirm {
    color: #FFFFFF;
}
</style>


