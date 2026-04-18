<script>
import store from './store/index.js'
import { parseShareLink, clearShareParams, ShareType } from './utils/share.js'

export default {
	globalData: {
		shareInfo: null  // 存储分享信息，供页面使用
	},

	onLaunch: function() {
		console.log('App Launch')
		// 初始化状态
		store.init()

		// 检测是否是分享链接
		this.checkShareLink()
	},

	onShow: function() {
		console.log('App Show')
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
