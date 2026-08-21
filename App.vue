<script>
import store from './store/index.js'
import { parseShareLink, clearShareParams, ShareType } from './utils/share.js'
import { autoSetPageTitle } from './utils/setPageTitle.js'
import { initPush } from '@/utils/push.js'
import { getPendingCoinConfirmation } from '@/api/services/coinConfirmation.js'
import { showCoinConfirmModal } from '@/utils/coinConfirmModal.js'
import { getBirthdayStatus } from '@/api/services/member.js'

export default {
	globalData: {
		shareInfo: null  // 存储分享信息，供页面使用
	},

	data() {
		return {
			// 上次检查生日的时间戳，30 秒内不重复请求接口（防止 onShow 频繁触发）
			// 注意：刷新/重启 App 会重置；改用时间窗而不是布尔，登录后/改生日后可立即重检
			lastBirthdayCheckAt: 0
		}
	},

	onLaunch: function() {
		console.log('App Launch')
		// 初始化状态
		store.init()

		// 登录态检查放在首页 onLoad 里做（onLaunch 阶段路由还没初始化完成，跳转会失败）

		// #ifdef APP-PLUS

		// 禁用原生导航栏，避免双导航栏问题
		// 注意：onLaunch 阶段 this.$scope 尚未注入，必须用 plus.webview 全局 API
		try {
			if (typeof plus !== 'undefined' && plus.webview) {
				const currentWebview = plus.webview.currentWebview()
				if (currentWebview) {
					const titleNView = currentWebview.getTitleNView && currentWebview.getTitleNView()
					if (titleNView) titleNView.hide()
					currentWebview.addEventListener && currentWebview.addEventListener('titleUpdate', function() {
						const nView = currentWebview.getTitleNView && currentWebview.getTitleNView()
						if (nView) nView.hide()
					})
				}
			}
		} catch (e) {
			console.warn('[App] hide titleNView failed:', e)
		}
		// #endif

		// 隐藏原生 tabBar，使用自定义 tabBar
		uni.hideTabBar({ animation: false, fail: () => {} })
		// App端强制隐藏原生tabBar
		// #ifdef APP-PLUS
		setTimeout(() => { uni.hideTabBar({ animation: false, fail: () => {} }) }, 100)
		setTimeout(() => { uni.hideTabBar({ animation: false, fail: () => {} }) }, 500)
		// #endif
		// 检测是否是分享链接
		this.checkShareLink()

		// LINE 邀请链接入口捕获：code 挂在域名根 query（# 路由之前），页面 onLoad 拿不到，必须在入口全局读
		// #ifdef H5
		this.captureInviteCode()
		// #endif

		// 初始化 UniPush 2.0(APP 端启动时获取 cid + 监听推送)
		// #ifdef APP-PLUS
		initPush()
		// #endif

		// 监听登录成功事件：登录前 App.onShow 已触发过但无 token，登录后需立即重检生日
		uni.$on('loginSuccess', this.checkBirthday)
		// 登出：停止金币确认轮询等登录态相关的周期任务
		uni.$on('logoutSuccess', this.stopCoinConfirmPolling)
	},

	onShow: function() {
		console.log('App Show')
		// H5 端根据当前路由自动设置页面标题
		// #ifdef H5
		try { autoSetPageTitle() } catch (e) {}
		// #endif
		// 金币使用确认：启动轮询（H5 无推送通道，页面开着时 5 秒一次查 pending，检测到立刻弹窗）
		this.startCoinConfirmPolling()
		// 进入前台时检查生日状态(已登录才检查)
		this.checkBirthday()
	},

	onHide: function() {
		console.log('App Hide')
		// 退到后台停止轮询（省请求；回前台 onShow 重启）
		this.stopCoinConfirmPolling()
	},

	methods: {
		// ============ 生日奖励弹窗 ============
		// 触发点：App.onShow + 登录成功（loginSuccess 事件）+ 设置页改完生日
		// 节流：30 秒内不重复请求 /birthday-status 接口（防止 onShow 频繁触发）
		// 弹窗：检查到 claimable 时通过事件通知首页；首页监听器未就绪时由首页 onShow 兜底
		async checkBirthday() {
			const token = uni.getStorageSync('siamfeast_token')
			if (!token) return
			// 30 秒内不重复请求接口
			const now = Date.now()
			if (now - (this.lastBirthdayCheckAt || 0) < 30000) return
			this.lastBirthdayCheckAt = now

			try {
				const res = await getBirthdayStatus()
				if (res && res.code === 0 && res.data && res.data.claimable) {
					// 通知首页弹出生日弹窗
					uni.$emit('showBirthdayModal', {
						reward_type: res.data.reward_type || 'COIN',
						reward_amount: res.data.reward_amount || 0
					})
					// 兜底：若首页监听器还没注册（如冷启动时序竞态），
					// 把 payload 暂存 globalData，首页 onLoad 时主动取一次
					this.globalData.pendingBirthdayPayload = {
						reward_type: res.data.reward_type || 'COIN',
						reward_amount: res.data.reward_amount || 0
					}
				}
			} catch (e) {
				console.warn('[birthday] check failed:', e)
			}
		},

		/**
		 * 检测并处理分享链接
		 */
		checkShareLink() {
			const shareInfo = parseShareLink()

			if (shareInfo) {
				console.log('检测到分享链接:', shareInfo)
				// 存储分享信息到全局数据
				this.globalData.shareInfo = shareInfo
			}
		},

		/**
		 * LINE 邀请链接捕获（仅 H5）
		 * 链接格式：https://h5.siamfeast.com?code=AB12CD（code 在 # 路由之前）
		 * 好友从 LINE 点链接进来时落在 H5 首页路由，必须从 window.location.search 全局读取
		 * 存 storage 后由邀请落地页/注册页消费（注册提交时随 invite_code 带给后端）
		 */
		captureInviteCode() {
			try {
				const code = new URLSearchParams(window.location.search).get('code')
				// 格式校验：邀请码为 4-12 位大写字母/数字，非法直接忽略走普通流程
				if (code && /^[A-Z0-9]{4,12}$/.test(code)) {
					console.log('[App] 捕获到邀请码:', code)
					uni.setStorageSync('invite_code', code)
					// 落到邀请落地页展示引导（仅带 code 进入且无路由目标时）
					if (window.location.hash === '' || window.location.hash === '#' || window.location.hash === '#/') {
						uni.reLaunch({ url: '/pages/invite/index' })
					}
				}
			} catch (e) {
				console.warn('[App] captureInviteCode failed:', e)
			}
		},

		/**
		 * 金币使用确认轮询：H5 无推送通道，页面开着时 5 秒一次查 pending
		 * 检测到收银端发起的授权单 → 立刻弹确认弹窗
		 * onShow 启动 / onHide 停止；未登录静默跳过
		 */
		startCoinConfirmPolling() {
			this.stopCoinConfirmPolling()
			this._coinPollTimer = setInterval(() => {
				this.checkCoinConfirmation(true)
			}, 5000)
			// 启动时立即查一次
			this.checkCoinConfirmation(true)
		},

		stopCoinConfirmPolling() {
			if (this._coinPollTimer) {
				clearInterval(this._coinPollTimer)
				this._coinPollTimer = null
			}
		},

		/**
		 * 查询金币使用确认 pending
		 * @param {boolean} [fromPolling] 轮询触发（跳过 20 秒节流，轮询本身就是节奏）
		 */
		async checkCoinConfirmation(fromPolling) {
			try {
				if (!uni.getStorageSync('siamfeast_token')) return
				// 节流（仅非轮询的重复调用）
				if (!fromPolling) {
					const now = Date.now()
					if (this._lastCoinCheckAt && now - this._lastCoinCheckAt < 20000) return
					this._lastCoinCheckAt = now
				}
				// 已在确认页则不弹（页面自身处理）
				const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
				const top = pages[pages.length - 1]
				if (top && top.route && String(top.route).includes('coin-confirm')) return

				const res = await getPendingCoinConfirmation()
				if (res && res.code === 0 && res.data && res.data.item) {
					showCoinConfirmModal(res.data.item)
				}
			} catch (e) {
				// 静默失败（未登录/接口异常不打扰用户）
			}
		},

		/**
		 * 获取分享信息（供页面调用）
		 */
		getShareInfo() {
			return this.globalData.shareInfo
		},

		/**
		 * 清除分享信息（供页面调用）
		 */
		clearShareInfo() {
			this.globalData.shareInfo = null
			clearShareParams()
		}
	}
}
</script>

<style>
/* 全局样式 */

/*
 * 系统弹窗置顶：uni.showModal / showToast 固定 z-index 999，
 * 会被业务弹窗（优惠券核销 9998 / 活动详情 9998 / 生日 9999 等）盖住。
 * 金币使用确认等系统级弹窗必须盖过所有业务弹窗，否则轮询弹出的确认框用户不可见。
 */
uni-modal,
uni-modal .uni-modal {
	z-index: 10999 !important;
}

uni-toast,
uni-toast .uni-toast,
uni-toast .uni-sample-toast {
	z-index: 10999 !important;
}

page {
	background-color: #FFFFFF;
	font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
	font-size: 28rpx;
	color: #282332;
	box-sizing: border-box;
}

/* H5环境下隐藏原生导航栏 */
.uni-page-head {
	display: none !important;
}

	/* H5环境下隐藏原生TabBar */
.uni-tabbar {
	display: none !important;
}
	.uni-tabbar-bottom {
	display: none !important;
}

/* 清除默认样式 */
view, text, image, input, button {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
	color: transparent;
}

/* 安全区域适配 */
.safe-area-bottom {
	height: constant(safe-area-inset-bottom);
	height: env(safe-area-inset-bottom);
}

/* 主题色 */
.text-primary {
	color: #F2B131;
}

.text-secondary {
	color: #828282;
}

.text-link {
	color: #019EFF;
}

.bg-primary {
	background-color: #F2B131;
}

.bg-white {
	background-color: #FFFFFF;
}

/* 页面淡入动画 — 美团风格 */
/* #ifdef H5 */
uni-page-body {
	animation: pageFadeIn 0.3s ease-out;
}

@keyframes pageFadeIn {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 骨架屏闪烁动画 */
.skeleton {
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: skeletonShimmer 1.5s ease-in-out infinite;
	border-radius: 8rpx;
}

.skeleton-circle {
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: skeletonShimmer 1.5s ease-in-out infinite;
	border-radius: 50%;
}

.skeleton-text {
	height: 28rpx;
	margin-bottom: 16rpx;
}

.skeleton-text-short {
	width: 40%;
}

.skeleton-text-medium {
	width: 65%;
}

.skeleton-text-long {
	width: 90%;
}

.skeleton-image {
	width: 100%;
	height: 200rpx;
}

.skeleton-card {
	width: 100%;
	height: 160rpx;
	margin-bottom: 16rpx;
}

@keyframes skeletonShimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

/* 图片懒加载占位 */
.lazy-image-placeholder {
	background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
	background-size: 200% 100%;
	animation: skeletonShimmer 1.5s ease-in-out infinite;
}
/* #endif */

/* 全局空状态样式 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
}

.empty-icon {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 32rpx;
}

.empty-title {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 12rpx;
}

.empty-desc {
	font-size: 26rpx;
	color: #999;
	margin-bottom: 24rpx;
}

.empty-text {
	font-size: 26rpx;
	color: #999;
}

/* Flex 布局 */
.flex {
	display: flex;
}

.flex-column {
	flex-direction: column;
}

.flex-center {
	align-items: center;
	justify-content: center;
}

.flex-between {
	justify-content: space-between;
}

.flex-1 {
	flex: 1;
}

/* 文字样式 */
.text-bold {
	font-weight: 700;
}

.text-center {
	text-align: center;
}

/* 边距 */
.p-24 {
	padding: 24rpx;
}

.p-48 {
	padding: 48rpx;
}

.mt-16 {
	margin-top: 16rpx;
}

.mt-32 {
	margin-top: 32rpx;
}

.mb-16 {
	margin-bottom: 16rpx;
}

.mb-32 {
	margin-bottom: 32rpx;
}
</style>
