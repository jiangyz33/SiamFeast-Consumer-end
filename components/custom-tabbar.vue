<template>
	<view class="custom-tabbar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
		<view
			v-for="(item, index) in tabList"
			:key="index"
			class="tabbar-item"
			@click="switchTab(item, index)"
		>
			<image
				class="tabbar-icon"
				:src="currentIndex === index ? item.selectedIconPath : item.iconPath"
				mode="aspectFit"
			></image>
			<text class="tabbar-text" :class="{ 'tabbar-active': currentIndex === index }">
				{{ t(item.textKey) }}
			</text>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'

export default {
	name: 'CustomTabbar',
	props: {
		current: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			i18n: i18n,
			currentIndex: 0,
			safeAreaBottom: 0,
			// 语言切换时自增，让模板上 i18n.t(...) 重新求值（i18n.state 不是响应式，必须靠这个触发）
			langVersion: 0,
			tabList: [
				{
					pagePath: '/pages/index/index',
					textKey: 'nav.home',
					iconPath: '/static/icons/home.svg',
					selectedIconPath: '/static/icons/home-active.svg'
				},
				{
					pagePath: '/pages/order/index',
					textKey: 'nav.order',
					iconPath: '/static/icons/order.svg',
					selectedIconPath: '/static/icons/order-active.svg'
				},
				{
					pagePath: '/pages/member/index',
					textKey: 'nav.mine',
					iconPath: '/static/icons/user.svg',
					selectedIconPath: '/static/icons/user-active.svg'
				}
			]
		}
	},
	created() {
		const systemInfo = uni.getSystemInfoSync()
		this.safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
		// Initial detection from route
		this.detectFromRoute()
		// Listen for tabbarUpdate event (emitted by pages onShow)
		uni.$on('tabbarUpdate', () => {
			this.detectFromRoute()
		})
		// 监听语言切换：让 tabbar 文字立刻跟随
		uni.$on('languageChanged', this.onLanguageChanged)
	},
	beforeDestroy() {
		uni.$off('tabbarUpdate')
		uni.$off('languageChanged', this.onLanguageChanged)
	},
	methods: {
		onLanguageChanged() {
			this.langVersion++
		},
		t(key) {
			// 读 langVersion 触发响应式依赖；返回真正的翻译
			void this.langVersion
			return i18n.t(key)
		},
		detectFromRoute() {
			const pages = getCurrentPages()
			const currentPage = pages[pages.length - 1]
			if (currentPage) {
				const path = '/' + currentPage.route
				const idx = this.tabList.findIndex(t => t.pagePath === path)
				if (idx >= 0) this.currentIndex = idx
			}
		},
		switchTab(item, index) {
			if (this.currentIndex === index) return
			this.currentIndex = index
			uni.switchTab({
				url: item.pagePath
			})
		}
	}
}
</script>

<style scoped>
.custom-tabbar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 50px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-around;
	border-top: 1px solid #E5E5E5;
	z-index: 999;
}

.tabbar-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
}

.tabbar-icon {
	width: 24px;
	height: 24px;
	margin-bottom: 2px;
	transition: transform 0.2s ease;
}

.tabbar-item:active .tabbar-icon {
	transform: scale(0.85);
}

.tabbar-text {
	font-size: 10px;
	color: #828282;
}

.tabbar-active {
	color: #F2B131;
}
</style>
