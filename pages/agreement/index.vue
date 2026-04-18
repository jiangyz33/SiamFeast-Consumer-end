<template>
	<view class="agreement-page">
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
				<!-- 服务条例内容 -->
				<template v-if="agreementType === 'terms'">
					<view class="section">
						<text class="section-title">服务条例</text>
						<text class="update-time">更新日期：2024年1月1日</text>
						<text class="update-time">生效日期：2024年1月1日</text>
					</view>

					<view class="section">
						<text class="heading">一、服务条款的确认和接纳</text>
						<text class="paragraph">1.1 SiamFeast（以下简称"本平台"）的各项服务的所有权和运营权归本平台所有。</text>
						<text class="paragraph">1.2 用户在使用本平台提供的各项服务之前，应仔细阅读本服务条例。</text>
						<text class="paragraph">1.3 用户一旦注册使用本平台的服务，即视为用户已了解并完全同意本服务条例各项内容。</text>
					</view>

					<view class="section">
						<text class="heading">二、服务简介</text>
						<text class="paragraph">2.1 本平台是一个餐饮服务平台，为用户提供在线点餐、外卖配送、堂食预订等服务。</text>
						<text class="paragraph">2.2 本平台提供的服务包括但不限于：浏览菜品、在线下单、在线支付、订单追踪、会员积分、优惠券领取与使用等。</text>
						<text class="paragraph">2.3 用户须通过注册账号使用本平台服务，注册时请提供真实、准确、完整的个人资料。</text>
					</view>

					<view class="section">
						<text class="heading">三、用户账号</text>
						<text class="paragraph">3.1 用户注册成功后，将获得一个本平台账号，该账号由用户自行负责管理。</text>
						<text class="paragraph">3.2 用户对以其用户账号进行的所有活动和事件负法律责任。</text>
						<text class="paragraph">3.3 用户若发现任何非法使用账号或存在安全漏洞的情况，请立即通知本平台。</text>
						<text class="paragraph">3.4 本平台有权对用户账号进行冻结、封禁等处理，包括但不限于以下情况：</text>
						<text class="paragraph sub">（1）发布违法、违规信息；</text>
						<text class="paragraph sub">（2）恶意刷单、套利等行为；</text>
						<text class="paragraph sub">（3）冒用他人身份或信息；</text>
						<text class="paragraph sub">（4）其他违反本条例或法律法规的行为。</text>
					</view>

					<view class="section">
						<text class="heading">四、用户行为规范</text>
						<text class="paragraph">4.1 用户在使用本平台服务时，必须遵守以下原则：</text>
						<text class="paragraph sub">（1）遵守中国有关的法律和法规；</text>
						<text class="paragraph sub">（2）不得为任何非法目的而使用网络服务系统；</text>
						<text class="paragraph sub">（3）遵守所有与网络服务有关的网络协议、规定和程序；</text>
						<text class="paragraph sub">（4）不得利用本平台服务进行任何可能对互联网正常运转造成不利影响的行为；</text>
						<text class="paragraph sub">（5）不得利用本平台服务传输任何骚扰性的、中伤他人的、辱骂性的、恐吓性的、庸俗淫秽的或其他任何非法的信息资料。</text>
					</view>

					<view class="section">
						<text class="heading">五、订单与支付</text>
						<text class="paragraph">5.1 用户在本平台下单即表示接受商品/服务的价格、规格、配送方式等信息。</text>
						<text class="paragraph">5.2 订单提交后，用户可在商家未接单前取消订单；商家接单后，取消订单需与商家协商。</text>
						<text class="paragraph">5.3 本平台支持多种支付方式，包括在线支付、到店支付等。</text>
						<text class="paragraph">5.4 如遇支付异常，请及时联系客服处理。</text>
					</view>

					<view class="section">
						<text class="heading">六、配送服务</text>
						<text class="paragraph">6.1 外卖配送服务由本平台或合作配送方提供。</text>
						<text class="paragraph">6.2 配送时间仅供参考，实际配送时间可能因天气、交通等原因有所延迟。</text>
						<text class="paragraph">6.3 用户应确保收货地址准确、有人签收，因地址错误或无人签收导致的损失由用户自行承担。</text>
					</view>

					<view class="section">
						<text class="heading">七、退换货与退款</text>
						<text class="paragraph">7.1 食品属于特殊商品，非质量问题一般不支持退换。</text>
						<text class="paragraph">7.2 如遇食品安全问题，请在收到商品后2小时内联系客服，提供相关凭证，我们将协助处理。</text>
						<text class="paragraph">7.3 退款将原路返回至用户支付账户，具体到账时间以银行处理时间为准。</text>
					</view>

					<view class="section">
						<text class="heading">八、会员与积分</text>
						<text class="paragraph">8.1 本平台提供会员服务，用户可通过消费累积积分。</text>
						<text class="paragraph">8.2 积分可在积分商城兑换商品或优惠券，具体兑换规则以商城页面显示为准。</text>
						<text class="paragraph">8.3 积分不可转让、不可提现，有效期以具体活动规则为准。</text>
						<text class="paragraph">8.4 本平台有权根据运营需要调整会员等级规则和积分规则。</text>
					</view>

					<view class="section">
						<text class="heading">九、知识产权</text>
						<text class="paragraph">9.1 本平台的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等的知识产权归本平台所有。</text>
						<text class="paragraph">9.2 未经本平台书面许可，用户不得复制、转载、链接、传播或用于其他商业目的。</text>
					</view>

					<view class="section">
						<text class="heading">十、免责声明</text>
						<text class="paragraph">10.1 本平台不保证网络服务一定能满足用户的要求，也不保证网络服务不会中断。</text>
						<text class="paragraph">10.2 因不可抗力或第三方原因导致的服务中断或损失，本平台不承担责任。</text>
						<text class="paragraph">10.3 用户因违反本条例或相关法律法规而导致的任何后果，由用户自行承担。</text>
					</view>

					<view class="section">
						<text class="heading">十一、条例修改</text>
						<text class="paragraph">11.1 本平台有权随时修改本条例的任何条款。</text>
						<text class="paragraph">11.2 修改后的条例一经在本平台公布即生效，用户继续使用本平台服务即视为接受修改后的条例。</text>
						<text class="paragraph">11.3 如用户不同意修改后的条例，可选择停止使用本平台服务。</text>
					</view>

					<view class="section">
						<text class="heading">十二、联系我们</text>
						<text class="paragraph">如对本服务条例有任何疑问，可通过以下方式联系我们：</text>
						<text class="paragraph">客服电话：400-XXX-XXXX</text>
						<text class="paragraph">客服邮箱：support@siamfeast.com</text>
						<text class="paragraph">工作时间：周一至周日 9:00-22:00</text>
					</view>
				</template>

				<!-- 隐私条例内容 -->
				<template v-else-if="agreementType === 'privacy'">
					<view class="section">
						<text class="section-title">隐私条例</text>
						<text class="update-time">更新日期：2024年1月1日</text>
						<text class="update-time">生效日期：2024年1月1日</text>
					</view>

					<view class="section">
						<text class="heading">一、引言</text>
						<text class="paragraph">1.1 SiamFeast（以下简称"本平台"）非常重视用户的隐私保护。</text>
						<text class="paragraph">1.2 本隐私条例旨在向您说明我们如何收集、使用、存储和保护您的个人信息。</text>
						<text class="paragraph">1.3 在使用本平台服务前，请仔细阅读并理解本隐私条例。</text>
					</view>

					<view class="section">
						<text class="heading">二、信息收集</text>
						<text class="paragraph">2.1 我们收集的信息包括：</text>
						<text class="paragraph sub">（1）注册信息：手机号码、昵称、头像等；</text>
						<text class="paragraph sub">（2）订单信息：收货地址、联系方式、订单记录等；</text>
						<text class="paragraph sub">（3）支付信息：支付方式、支付记录等；</text>
						<text class="paragraph sub">（4）设备信息：设备型号、操作系统、唯一设备标识符等；</text>
						<text class="paragraph sub">（5）位置信息：用于提供附近门店、配送服务等；</text>
						<text class="paragraph sub">（6）日志信息：访问时间、浏览记录、操作记录等。</text>
						<text class="paragraph">2.2 我们仅在您授权同意的情况下收集上述信息。</text>
					</view>

					<view class="section">
						<text class="heading">三、信息使用</text>
						<text class="paragraph">3.1 我们使用收集的信息用于：</text>
						<text class="paragraph sub">（1）为您提供、维护、改进我们的服务；</text>
						<text class="paragraph sub">（2）处理您的订单和支付请求；</text>
						<text class="paragraph sub">（3）向您发送服务通知、营销信息（经您同意）；</text>
						<text class="paragraph sub">（4）进行数据分析以改善用户体验；</text>
						<text class="paragraph sub">（5）保障交易安全，预防欺诈；</text>
						<text class="paragraph sub">（6）遵守法律法规的要求。</text>
					</view>

					<view class="section">
						<text class="heading">四、信息共享</text>
						<text class="paragraph">4.1 我们不会向第三方出售您的个人信息。</text>
						<text class="paragraph">4.2 在以下情况下，我们可能会与第三方共享您的信息：</text>
						<text class="paragraph sub">（1）获得您的明确同意；</text>
						<text class="paragraph sub">（2）与提供服务的合作伙伴共享（如配送服务商、支付服务商），但仅限于提供服务所需的信息；</text>
						<text class="paragraph sub">（3）法律法规要求或政府部门依法要求；</text>
						<text class="paragraph sub">（4）保护本平台、用户或公众的权益、财产或安全。</text>
					</view>

					<view class="section">
						<text class="heading">五、信息存储与保护</text>
						<text class="paragraph">5.1 我们采用行业标准的安全措施保护您的个人信息，包括但不限于：</text>
						<text class="paragraph sub">（1）数据加密存储和传输；</text>
						<text class="paragraph sub">（2）访问控制和权限管理；</text>
						<text class="paragraph sub">（3）安全审计和监控；</text>
						<text class="paragraph sub">（4）定期安全评估和漏洞修复。</text>
						<text class="paragraph">5.2 您的信息存储在位于中国的服务器上。</text>
						<text class="paragraph">5.3 我们保留信息的时间不超过实现本条例所述目的所需的期限。</text>
					</view>

					<view class="section">
						<text class="heading">六、您的权利</text>
						<text class="paragraph">6.1 您对自己的个人信息享有以下权利：</text>
						<text class="paragraph sub">（1）访问权：您有权访问我们持有的您的个人信息；</text>
						<text class="paragraph sub">（2）更正权：您有权更正不准确或不完整的个人信息；</text>
						<text class="paragraph sub">（3）删除权：在特定情况下，您有权要求删除您的个人信息；</text>
						<text class="paragraph sub">（4）撤回同意权：您有权撤回之前给予我们的同意；</text>
						<text class="paragraph sub">（5）注销账号：您有权注销您的账号。</text>
						<text class="paragraph">6.2 如需行使上述权利，请联系我们的客服。</text>
					</view>

					<view class="section">
						<text class="heading">七、Cookie和类似技术</text>
						<text class="paragraph">7.1 我们使用Cookie和类似技术来：</text>
						<text class="paragraph sub">（1）记住您的登录状态和偏好设置；</text>
						<text class="paragraph sub">（2）分析您如何使用我们的服务；</text>
						<text class="paragraph sub">（3）个性化您的使用体验。</text>
						<text class="paragraph">7.2 您可以通过浏览器设置管理Cookie，但这可能影响某些功能的使用。</text>
					</view>

					<view class="section">
						<text class="heading">八、第三方链接</text>
						<text class="paragraph">8.1 我们的服务可能包含指向第三方网站或服务的链接。</text>
						<text class="paragraph">8.2 我们不对第三方的隐私做法负责，建议您阅读第三方的隐私政策。</text>
					</view>

					<view class="section">
						<text class="heading">九、未成年人保护</text>
						<text class="paragraph">9.1 我们的服务不面向14周岁以下的未成年人。</text>
						<text class="paragraph">9.2 如果您是14-18周岁的未成年人，请在监护人指导下使用我们的服务。</text>
						<text class="paragraph">9.3 如果我们发现在未获得可证实的父母同意的情况下收集了未成年人的个人信息，我们会尽快删除相关信息。</text>
					</view>

					<view class="section">
						<text class="heading">十、隐私条例的更新</text>
						<text class="paragraph">10.1 我们可能会不时更新本隐私条例。</text>
						<text class="paragraph">10.2 更新后的条例将在本平台公布，建议您定期查阅。</text>
						<text class="paragraph">10.3 如果您在条例变更后继续使用我们的服务，即表示您接受修订后的条例。</text>
					</view>

					<view class="section">
						<text class="heading">十一、联系我们</text>
						<text class="paragraph">如果您对本隐私条例有任何疑问、意见或建议，可通过以下方式联系我们：</text>
						<text class="paragraph">客服电话：400-XXX-XXXX</text>
						<text class="paragraph">客服邮箱：privacy@siamfeast.com</text>
						<text class="paragraph">工作时间：周一至周日 9:00-22:00</text>
						<text class="paragraph">我们将在15个工作日内回复您的请求。</text>
					</view>
				</template>

				<!-- 关于我们内容 -->
				<template v-else-if="agreementType === 'about'">
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

					<view class="section">
						<text class="heading">联系我们</text>
						<text class="paragraph">客服电话：400-XXX-XXXX</text>
						<text class="paragraph">客服邮箱：support@siamfeast.com</text>
						<text class="paragraph">公司地址：北京市朝阳区XXX路XXX号</text>
						<text class="paragraph">工作时间：周一至周日 9:00-22:00</text>
					</view>

					<view class="section">
						<text class="heading">关注我们</text>
						<text class="paragraph">微信公众号：SiamFeast泰式美食</text>
						<text class="paragraph">微博：@SiamFeast泰式美食</text>
					</view>
				</template>

				<!-- 底部占位 -->
				<view class="bottom-placeholder"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: 20,
			contentHeight: 500,
			agreementType: 'terms', // terms, privacy, about
			pageTitle: '服务条例'
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

		// 设置页面标题
		switch (this.agreementType) {
			case 'terms':
				this.pageTitle = '服务条例'
				break
			case 'privacy':
				this.pageTitle = '隐私条例'
				break
			case 'about':
				this.pageTitle = '关于我们'
				break
			default:
				this.pageTitle = '服务条例'
		}
	},
	methods: {
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
