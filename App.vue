<script>
import store from './store/index.js'
import { parseShareLink, clearShareParams, ShareType } from './utils/share.js'
import { autoSetPageTitle } from './utils/setPageTitle.js'
import { initPush } from '@/utils/push.js'

export default {
	globalData: {
		shareInfo: null  // 存储分享信息，供页面使用
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

		// 初始化 UniPush 2.0(APP 端启动时获取 cid + 监听推送)
		// #ifdef APP-PLUS
		initPush()
		// #endif
	},

	onShow: function() {
		console.log('App Show')
		// H5 端根据当前路由自动设置页面标题
		// #ifdef H5
		try { autoSetPageTitle() } catch (e) {}
		// #endif
	},

	onHide: function() {
		console.log('App Hide')
	},

	methods: {
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
