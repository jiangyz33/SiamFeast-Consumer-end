<template>
	<view class="agreement-page" :data-lang="langVersion">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ pageTitle }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<view class="agreement-content">
				<!-- 服务条例内容（三语） -->
				<!-- 服务条例 / 隐私政策：数据驱动三语渲染（内容见 ./content.js，甲方确认稿） -->
				<template v-if="agreementType === 'terms' || agreementType === 'privacy'">
					<view class="section" v-for="(row, idx) in agreementRows" :key="'r' + idx">
						<text v-if="row.cls === 'section-title'" class="section-title">{{ row[lang] }}</text>
						<text v-else-if="row.cls === 'update-time'" class="update-time">{{ row[lang] }}</text>
						<text v-else-if="row.cls === 'heading'" class="heading">{{ row[lang] }}</text>
						<text v-else class="paragraph" :class="{ sub: row.cls.indexOf('sub') > -1 }">{{ row[lang] }}</text>
					</view>
				</template>
				<template v-else-if="agreementType === 'about'">
					<!-- 中文 -->
					<view v-if="lang === 'zh'">
					<view class="section">
						<text class="section-title">关于我们</text>
					</view>
					<view class="section about-logo">
						<image class="logo-image" src="/static/logo.png" mode="aspectFit"></image>
						<text class="app-name">SiamFeast</text>
						<text class="slogan">品味泰式美食，享受品质生活</text>
					</view>
					<view class="section">
						<text class="heading">品牌介绍</text>
						<text class="paragraph">SiamFeast是一家专注于泰式美食的餐饮品牌，致力于为顾客提供正宗、健康、美味的泰式料理体验。</text>
						<text class="paragraph">我们精选优质食材，由资深泰式料理主厨精心烹制，为您呈现地道的泰国风味。</text>
					</view>
					<view class="section">
						<text class="heading">我们的特色</text>
						<text class="paragraph sub">• 正宗泰式风味，原汁原味</text>
						<text class="paragraph sub">• 新鲜食材，健康美味</text>
						<text class="paragraph sub">• 多种业态，满足不同需求</text>
						<text class="paragraph sub">• 便捷服务，品质保障</text>
					</view>
					<view class="section">
						<text class="heading">服务内容</text>
						<text class="paragraph sub">• 堂食服务：舒适的就餐环境，优质的服务体验</text>
						<text class="paragraph sub">• 外卖配送：快速送达，美味到家</text>
						<text class="paragraph sub">• 自取服务：线上点单，到店自取</text>
						<text class="paragraph sub">• 会员服务：积分奖励，专属优惠</text>
					</view>
					</view>

					<!-- English -->
					<view v-else-if="lang === 'en'">
					<view class="section">
						<text class="section-title">About Us</text>
					</view>
					<view class="section about-logo">
						<image class="logo-image" src="/static/logo.png" mode="aspectFit"></image>
						<text class="app-name">SiamFeast</text>
						<text class="slogan">Savor authentic Thai cuisine, enjoy a quality lifestyle</text>
					</view>
					<view class="section">
						<text class="heading">Brand Introduction</text>
						<text class="paragraph">SiamFeast is a Thai cuisine brand dedicated to providing customers with an authentic, healthy, and delicious Thai culinary experience.</text>
						<text class="paragraph">We carefully select premium ingredients, prepared by veteran Thai chefs to bring you genuine Thai flavors.</text>
					</view>
					<view class="section">
						<text class="heading">Our Features</text>
						<text class="paragraph sub">• Authentic Thai flavors, true to tradition</text>
						<text class="paragraph sub">• Fresh ingredients, healthy and delicious</text>
						<text class="paragraph sub">• Diverse dining options for every need</text>
						<text class="paragraph sub">• Convenient service, quality guaranteed</text>
					</view>
					<view class="section">
						<text class="heading">Our Services</text>
						<text class="paragraph sub">• Dine-in: comfortable setting and attentive service</text>
						<text class="paragraph sub">• Delivery: fast and fresh to your door</text>
						<text class="paragraph sub">• Pickup: order online, pick up in store</text>
						<text class="paragraph sub">• Membership: rewards and exclusive offers</text>
					</view>
					</view>

					<!-- ไทย -->
					<view v-else-if="lang === 'th'">
					<view class="section">
						<text class="section-title">เกี่ยวกับเรา</text>
					</view>
					<view class="section about-logo">
						<image class="logo-image" src="/static/logo.png" mode="aspectFit"></image>
						<text class="app-name">SiamFeast</text>
						<text class="slogan">ลิ้มรสอาหารไทยแท้ ดื่มด่ำชีวิตคุณภาพ</text>
					</view>
					<view class="section">
						<text class="heading">แนะนำแบรนด์</text>
						<text class="paragraph">SiamFeast คือแบรนด์อาหารไทยที่มุ่งมั่นนำเสนอประสบการณ์อาหารไทยแท้ที่ถูกต้อง มีคุณภาพ และรสชาติอร่อยให้กับลูกค้า</text>
						<text class="paragraph">เราคัดสรรวัตถุดิบคุณภาพดี ปรุงโดยเชฟอาหารไทยผู้เชี่ยวชาญ เพื่อนำเสนอรสชาติไทยแท้ให้คุณได้สัมผัส</text>
					</view>
					<view class="section">
						<text class="heading">เอกลักษณ์ของเรา</text>
						<text class="paragraph sub">• รสชาติไทยแท้ ดั้งเดิม</text>
						<text class="paragraph sub">• วัตถุดิบสดใหม่ อร่อยและมีคุณค่า</text>
						<text class="paragraph sub">• รูปแบบบริการหลากหลาย ตอบโจทย์ทุกความต้องการ</text>
						<text class="paragraph sub">• บริการสะดวก รับประกันคุณภาพ</text>
					</view>
					<view class="section">
						<text class="heading">บริการของเรา</text>
						<text class="paragraph sub">• บริการทานที่ร้าน: บรรยากาศรับรองสบาย บริการเอาใจใส่</text>
						<text class="paragraph sub">• บริการจัดส่ง: ส่งไวและสดใหม่ถึงบ้าน</text>
						<text class="paragraph sub">• บริการรับเอง: สั่งออนไลน์ รับสินค้าที่ร้าน</text>
						<text class="paragraph sub">• บริการสมาชิก: สะสมแต้ม รับสิทธิพิเศษ</text>
					</view>
					</view>
				</template>

				<!-- 底部占位 -->
				<view class="bottom-placeholder"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'
import { TERMS_ROWS, PRIVACY_ROWS } from './content.js'

export default {
	data() {
		return {
			statusBarHeight: 20,
			contentHeight: 500,
			agreementType: 'terms', // terms, privacy, about
			langVersion: 0
		}
	},
	computed: {
		lang() {
			void this.langVersion
			return i18n.getLanguage()
		},
		agreementRows() {
			void this.langVersion
			return this.agreementType === 'privacy' ? PRIVACY_ROWS : TERMS_ROWS
		},
		pageTitle() {
			void this.langVersion
			if (this.agreementType === 'about') return i18n.t('agreement.about')
			if (this.agreementType === 'terms') return i18n.t('agreement.terms')
			if (this.agreementType === 'privacy') return i18n.t('agreement.privacy')
			return i18n.t('agreement.terms')
		}
	},
	onLoad(options) {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20

		const navBarHeight = 44
		const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
		this.contentHeight = systemInfo.windowHeight - navBarHeight - safeAreaBottom - this.statusBarHeight

		// 获取协议类型
		if (options.type) {
			this.agreementType = options.type
		}
		uni.$on('languageChanged', this.onLanguageChanged)
	},
	onUnload() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},
	methods: {
		onLanguageChanged() {
			this.langVersion++
		},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.agreement-page {
	min-height: 100vh;
	background-color: #FFFFFF;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #FFFFFF;
}

/* 导航栏 */
.nav-bar {
	height: 44px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	border-bottom: 1px solid #F3F3F3;
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
	color: #000000CC;
}

.nav-right {
	width: 32px;
}

/* 内容区域 */
.content-scroll {
	flex: 1;
}

.agreement-content {
	padding: 20px 16px;
}

.section {
	margin-bottom: 24px;
}

.section-title {
	font-size: 20px;
	font-weight: 700;
	color: #000000;
	display: block;
	margin-bottom: 12px;
}

.update-time {
	font-size: 12px;
	color: #00000099;
	display: block;
	line-height: 1.8;
}

.heading {
	font-size: 15px;
	font-weight: 600;
	color: #000000CC;
	display: block;
	margin-bottom: 12px;
	margin-top: 8px;
}

.paragraph {
	font-size: 14px;
	color: #00000099;
	line-height: 1.8;
	display: block;
	margin-bottom: 8px;
}

.paragraph.sub {
	padding-left: 16px;
}

/* 关于我们 */
.about-logo {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30px 0;
}

.logo-image {
	width: 80px;
	height: 80px;
	border-radius: 16px;
	margin-bottom: 16px;
}

.app-name {
	font-size: 24px;
	font-weight: 700;
	color: #000000;
	margin-bottom: 8px;
}

.slogan {
	font-size: 14px;
	color: #00000099;
}

/* 底部占位 */
.bottom-placeholder {
	height: 30px;
}
</style>
