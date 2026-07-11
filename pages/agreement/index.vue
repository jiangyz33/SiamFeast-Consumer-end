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
				<template v-if="agreementType === 'terms'">
					<!-- 中文 -->
					<view v-if="lang === 'zh'">
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
							<text class="paragraph sub">（1）遵守泰国相关法律法规；</text>
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
					</view>

					<!-- English -->
					<view v-else-if="lang === 'en'">
						<view class="section">
							<text class="section-title">Terms of Service</text>
							<text class="update-time">Updated: January 1, 2024</text>
							<text class="update-time">Effective: January 1, 2024</text>
						</view>
						<view class="section">
							<text class="heading">1. Acceptance of the Terms of Service</text>
							<text class="paragraph">1.1 The ownership and operation of all services provided by SiamFeast (hereinafter "the Platform") belong to the Platform.</text>
							<text class="paragraph">1.2 Before using any of the services provided by the Platform, users should carefully read these Terms of Service.</text>
							<text class="paragraph">1.3 Once a user registers and uses the Platform's services, the user is deemed to have understood and fully agreed to all provisions of these Terms.</text>
						</view>
						<view class="section">
							<text class="heading">2. Service Overview</text>
							<text class="paragraph">2.1 The Platform is a food service platform that provides users with online ordering, delivery, and dine-in reservation services.</text>
							<text class="paragraph">2.2 Services provided by the Platform include but are not limited to: browsing dishes, placing orders, online payment, order tracking, membership points, and coupon redemption.</text>
							<text class="paragraph">2.3 Users must register an account to use the Platform's services. Please provide true, accurate, and complete personal information when registering.</text>
						</view>
						<view class="section">
							<text class="heading">3. User Account</text>
							<text class="paragraph">3.1 After successful registration, users will receive a Platform account, which the user is responsible for managing.</text>
							<text class="paragraph">3.2 Users bear legal responsibility for all activities and events conducted under their account.</text>
							<text class="paragraph">3.3 If users discover any illegal use of their account or security vulnerabilities, please notify the Platform immediately.</text>
							<text class="paragraph">3.4 The Platform reserves the right to freeze or ban user accounts, including but not limited to the following situations:</text>
							<text class="paragraph sub">(1) Publishing illegal or non-compliant information;</text>
							<text class="paragraph sub">(2) Malicious fake orders, arbitrage, or similar behavior;</text>
							<text class="paragraph sub">(3) Impersonating another person's identity or information;</text>
							<text class="paragraph sub">(4) Other violations of these Terms or relevant laws and regulations.</text>
						</view>
						<view class="section">
							<text class="heading">4. User Code of Conduct</text>
							<text class="paragraph">4.1 When using the Platform's services, users must comply with the following principles:</text>
							<text class="paragraph sub">(1) Comply with applicable Thai laws and regulations;</text>
							<text class="paragraph sub">(2) Do not use the network service system for any illegal purpose;</text>
							<text class="paragraph sub">(3) Comply with all network protocols, rules, and procedures related to network services;</text>
							<text class="paragraph sub">(4) Do not engage in any behavior through the Platform that may adversely affect the normal operation of the Internet;</text>
							<text class="paragraph sub">(5) Do not use the Platform to transmit any harassing, defamatory, abusive, threatening, vulgar, obscene, or other illegal information.</text>
						</view>
						<view class="section">
							<text class="heading">5. Orders and Payment</text>
							<text class="paragraph">5.1 Placing an order on the Platform indicates the user accepts the price, specifications, delivery method, and other information of the product/service.</text>
							<text class="paragraph">5.2 After submitting an order, the user may cancel it before the merchant accepts it; after the merchant accepts, cancellation must be negotiated with the merchant.</text>
							<text class="paragraph">5.3 The Platform supports multiple payment methods, including online payment and in-store payment.</text>
							<text class="paragraph">5.4 In case of payment abnormalities, please contact customer service promptly.</text>
						</view>
						<view class="section">
							<text class="heading">6. Delivery Service</text>
							<text class="paragraph">6.1 Delivery service is provided by the Platform or partner delivery providers.</text>
							<text class="paragraph">6.2 Delivery times are for reference only; actual delivery times may be delayed due to weather, traffic, or other reasons.</text>
							<text class="paragraph">6.3 Users should ensure the delivery address is accurate and someone is available to receive the order. Losses caused by incorrect addresses or no one being available to receive the order are the user's responsibility.</text>
						</view>
						<view class="section">
							<text class="heading">7. Returns, Exchanges, and Refunds</text>
							<text class="paragraph">7.1 Food is a special commodity; returns and exchanges are generally not supported unless there is a quality issue.</text>
							<text class="paragraph">7.2 In case of food safety issues, please contact customer service within 2 hours of receiving the product and provide relevant evidence. We will assist in handling the matter.</text>
							<text class="paragraph">7.3 Refunds will be returned to the user's payment account via the original payment method. The exact arrival time depends on the bank's processing time.</text>
						</view>
						<view class="section">
							<text class="heading">8. Membership and Points</text>
							<text class="paragraph">8.1 The Platform provides membership services. Users can accumulate points through consumption.</text>
							<text class="paragraph">8.2 Points can be redeemed for products or coupons in the Points Mall. Specific redemption rules are shown on the Mall page.</text>
							<text class="paragraph">8.3 Points cannot be transferred or withdrawn. The validity period is subject to specific activity rules.</text>
							<text class="paragraph">8.4 The Platform reserves the right to adjust membership tier rules and points rules based on operational needs.</text>
						</view>
						<view class="section">
							<text class="heading">9. Intellectual Property</text>
							<text class="paragraph">9.1 All content on the Platform, including but not limited to text, images, audio, video, software, programs, and layout designs, is owned by the Platform.</text>
							<text class="paragraph">9.2 Without the Platform's written permission, users may not copy, reproduce, link to, disseminate, or use such content for other commercial purposes.</text>
						</view>
						<view class="section">
							<text class="heading">10. Disclaimer</text>
							<text class="paragraph">10.1 The Platform does not guarantee that network services will definitely meet users' requirements or that network services will not be interrupted.</text>
							<text class="paragraph">10.2 The Platform is not responsible for service interruptions or losses caused by force majeure or third-party reasons.</text>
							<text class="paragraph">10.3 Users bear the consequences of violating these Terms or relevant laws and regulations.</text>
						</view>
						<view class="section">
							<text class="heading">11. Revision of Terms</text>
							<text class="paragraph">11.1 The Platform reserves the right to modify any provisions of these Terms at any time.</text>
							<text class="paragraph">11.2 The revised Terms take effect once published on the Platform. Continued use of the Platform's services constitutes acceptance of the revised Terms.</text>
							<text class="paragraph">11.3 If users do not agree with the revised Terms, they may choose to stop using the Platform's services.</text>
						</view>
					</view>

					<!-- ไทย -->
					<view v-else-if="lang === 'th'">
						<view class="section">
							<text class="section-title">เงื่อนไขการให้บริการ</text>
							<text class="update-time">อัปเดต: 1 มกราคม 2024</text>
							<text class="update-time">มีผลบังคับใช้: 1 มกราคม 2024</text>
						</view>
						<view class="section">
							<text class="heading">1. การยอมรับเงื่อนไขการให้บริการ</text>
							<text class="paragraph">1.1 กรรมสิทธิ์และสิทธิ์ในการดำเนินงานบริการทั้งหมดของ SiamFeast (ต่อไปนี้เรียก "แพลตฟอร์ม") เป็นของแพลตฟอร์ม</text>
							<text class="paragraph">1.2 ก่อนใช้บริการใด ๆ ที่แพลตฟอร์มให้บริการ ผู้ใช้ควรอ่านเงื่อนไขการให้บริการนี้อย่างละเอียด</text>
							<text class="paragraph">1.3 เมื่อผู้ใช้ลงทะเบียนและใช้บริการของแพลตฟอร์ม ถือว่าผู้ใช้ได้เข้าใจและยอมรับเนื้อหาทั้งหมดของเงื่อนไขนี้อย่างสมบูรณ์</text>
						</view>
						<view class="section">
							<text class="heading">2. ภาพรวมบริการ</text>
							<text class="paragraph">2.1 แพลตฟอร์มเป็นแพลตฟอร์มบริการอาหารที่ให้บริการสั่งอาหารออนไลน์ การจัดส่ง และการจองทานที่ร้านแก่ผู้ใช้</text>
							<text class="paragraph">2.2 บริการที่แพลตฟอร์มให้บริการรวมถึงแต่ไม่จำกัดเพียง: การดูเมนู การสั่งอาหารออนไลน์ การชำระเงินออนไลน์ การติดตามคำสั่ง คะแนนสมาชิก และการรับและใช้คูปอง</text>
							<text class="paragraph">2.3 ผู้ใช้ต้องลงทะเบียนบัญชีเพื่อใช้บริการของแพลตฟอร์ม โปรดให้ข้อมูลส่วนบุคคลที่ถูกต้อง แม่นยำ และครบถ้วนเมื่อลงทะเบียน</text>
						</view>
						<view class="section">
							<text class="heading">3. บัญชีผู้ใช้</text>
							<text class="paragraph">3.1 หลังจากลงทะเบียนสำเร็จ ผู้ใช้จะได้รับบัญชีแพลตฟอร์มซึ่งผู้ใช้มีหน้าที่จัดการด้วยตนเอง</text>
							<text class="paragraph">3.2 ผู้ใช้ต้องรับผิดชอบตามกฎหมายสำหรับกิจกรรมและเหตุการณ์ทั้งหมดที่เกิดขึ้นภายใต้บัญชีของตน</text>
							<text class="paragraph">3.3 หากผู้ใช้พบการใช้บัญชีอย่างผิดกฎหมายหรือช่องโหว่ด้านความปลอดภัย โปรดแจ้งแพลตฟอร์มทันที</text>
							<text class="paragraph">3.4 แพลตฟอร์มขอสงวนสิทธิ์ในการระงับหรือระงับบัญชีผู้ใช้ รวมถึงแต่ไม่จำกัดเพียงกรณีต่อไปนี้:</text>
							<text class="paragraph sub">(1) เผยแพร่ข้อมูลที่ผิดกฎหมายหรือไม่เป็นไปตามข้อบังคับ</text>
							<text class="paragraph sub">(2) การสั่งซื้อปลอมโดยไม่สุจริต การฉ้อโกง หรือพฤติกรรมที่คล้ายคลึงกัน</text>
							<text class="paragraph sub">(3) การแอบอ้างเป็นบุคคลอื่นหรือใช้ข้อมูลของผู้อื่น</text>
							<text class="paragraph sub">(4) การละเมิเงื่อนไขนี้หรือกฎหมายและข้อบังคับที่เกี่ยวข้องอื่น ๆ</text>
						</view>
						<view class="section">
							<text class="heading">4. หลักปฏิบัติของผู้ใช้</text>
							<text class="paragraph">4.1 เมื่อใช้บริการของแพลตฟอร์ม ผู้ใช้ต้องปฏิบัติตามหลักการดังต่อไปนี้:</text>
							<text class="paragraph sub">(1) ปฏิบัติตามกฎหมายและข้อบังคับของไทยที่เกี่ยวข้อง</text>
							<text class="paragraph sub">(2) ไม่ใช้ระบบบริการเครือข่ายเพื่อวัตถุประสงค์ที่ผิดกฎหมายใด ๆ</text>
							<text class="paragraph sub">(3) ปฏิบัติตามโปรโตคอลเครือข่าย กฎ และขั้นตอนทั้งหมดที่เกี่ยวข้องกับบริการเครือข่าย</text>
							<text class="paragraph sub">(4) ไม่ดำเนินการใด ๆ ผ่านแพลตฟอร์มที่อาจส่งผลกระทบต่อการทำงานปกติของอินเทอร์เน็ต</text>
							<text class="paragraph sub">(5) ไม่ใช้แพลตฟอร์มเพื่อส่งข้อมูลที่รบกวน ใส่ร้าย ดูถูก ข่มขู่ หยาบคาย ลามกอนาจาร หรือผิดกฎหมายอื่น ๆ</text>
						</view>
						<view class="section">
							<text class="heading">5. คำสั่งซื้อและการชำระเงิน</text>
							<text class="paragraph">5.1 การสั่งซื้อบนแพลตฟอร์มถือว่าผู้ใช้ยอมรับราคา ข้อมูลจำเพาะ วิธีการจัดส่ง และข้อมูลอื่น ๆ ของสินค้า/บริการ</text>
							<text class="paragraph">5.2 หลังส่งคำสั่งซื้อ ผู้ใช้สามารถยกเลิกได้ก่อนร้านค้ารับคำสั่ง หลังร้านค้ารับคำสั่งแล้ว การยกเลิกต้องเจรจากับร้านค้า</text>
							<text class="paragraph">5.3 แพลตฟอร์มรองรับวิธีการชำระเงินหลายแบบ รวมถึงการชำระออนไลน์และการชำระที่ร้าน</text>
							<text class="paragraph">5.4 หากมีความผิดปกติในการชำระเงิน โปรดติดต่อฝ่ายบริการลูกค้าทันที</text>
						</view>
						<view class="section">
							<text class="heading">6. บริการจัดส่ง</text>
							<text class="paragraph">6.1 บริการจัดส่งให้บริการโดยแพลตฟอร์มหรือพันธมิตรจัดส่ง</text>
							<text class="paragraph">6.2 เวลาจัดส่งเป็นเพียงข้อมูลอ้างอิง เวลาจัดส่งจริงอาจล่าช้าเนื่องจากสภาพอากาศ การจราจร หรือเหตุผลอื่น ๆ</text>
							<text class="paragraph">6.3 ผู้ใช้ควรตรวจสอบให้แน่ใจว่าที่อยู่จัดส่งถูกต้องและมีผู้รับ ความสูญเสียที่เกิดจากที่อยู่ผิดพลาดหรือไม่มีผู้รับเป็นความรับผิดชอบของผู้ใช้</text>
						</view>
						<view class="section">
							<text class="heading">7. การคืนสินค้า การเปลี่ยน และการคืนเงิน</text>
							<text class="paragraph">7.1 อาหารเป็นสินค้าพิเศษ โดยทั่วไปไม่รองรับการคืนหรือเปลี่ยน เว้นแต่มีปัญหาด้านคุณภาพ</text>
							<text class="paragraph">7.2 หากมีปัญหาด้านความปลอดภัยของอาหาร โปรดติดต่อฝ่ายบริการลูกค้าภายใน 2 ชั่วโมงหลังได้รับสินค้าและให้หลักฐานที่เกี่ยวข้อง เราจะช่วยเหลือดำเนินการ</text>
							<text class="paragraph">7.3 การคืนเงินจะถูกส่งกลับไปยังบัญชีการชำระเงินของผู้ใช้ผ่านวิธีการชำระเดิม เวลาที่เงินเข้าบัญชีขึ้นอยู่กับเวลาดำเนินการของธนาคาร</text>
						</view>
						<view class="section">
							<text class="heading">8. สมาชิกและคะแนน</text>
							<text class="paragraph">8.1 แพลตฟอร์มให้บริการสมาชิก ผู้ใช้สามารถสะสมคะแนนผ่านการบริโภค</text>
							<text class="paragraph">8.2 คะแนนสามารถแลกเป็นสินค้าหรือคูปองได้ในห้างคะแนน กฎการแลกที่เฉพาะเจาะจงแสดงบนหน้าห้าง</text>
							<text class="paragraph">8.3 คะแนนไม่สามารถโอนหรือถอนเป็นเงินได้ ระยะเวลาที่ใช้ได้ขึ้นอยู่กับกฎกิจกรรมเฉพาะ</text>
							<text class="paragraph">8.4 แพลตฟอร์มขอสงวนสิทธิ์ในการปรับเปลี่ยนกฎระดับสมาชิกและกฎคะแนนตามความต้องการด้านการดำเนินงาน</text>
						</view>
						<view class="section">
							<text class="heading">9. ทรัพย์สินทางปัญญา</text>
							<text class="paragraph">9.1 เนื้อหาทั้งหมดบนแพลตฟอร์ม รวมถึงแต่ไม่จำกัดเพียงข้อความ รูปภาพ เสียง วิดีโอ ซอฟต์แวร์ โปรแกรม และการออกแบบเลย์เอาต์ เป็นของแพลตฟอร์ม</text>
							<text class="paragraph">9.2 หากไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากแพลตฟอร์ม ผู้ใช้ไม่สามารถคัดลอก ทำซ้ำ เชื่อมโยง เผยแพร่ หรือใช้เนื้อหาเพื่อวัตถุประสงค์ทางการค้าอื่น ๆ</text>
						</view>
						<view class="section">
							<text class="heading">10. ข้อจำกัดความรับผิด</text>
							<text class="paragraph">10.1 แพลตฟอร์มไม่รับประกันว่าบริการเครือข่ายจะตอบสนองความต้องการของผู้ใช้หรือไม่ถูกขัดจังหวะ</text>
							<text class="paragraph">10.2 แพลตฟอร์มไม่รับผิดชอบต่อการหยุดชะงักของบริการหรือความสูญเสียที่เกิดจากเหตุสุดวิสัยหรือเหตุผลของบุคคลที่สาม</text>
							<text class="paragraph">10.3 ผู้ใช้ต้องรับผิดชอบต่อผลกระทบที่เกิดจากการละเมิดเงื่อนไขนี้หรือกฎหมายและข้อบังคับที่เกี่ยวข้อง</text>
						</view>
						<view class="section">
							<text class="heading">11. การแก้ไขเงื่อนไข</text>
							<text class="paragraph">11.1 แพลตฟอร์มขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดใด ๆ ของเงื่อนไขนี้ได้ตลอดเวลา</text>
							<text class="paragraph">11.2 เงื่อนไขที่แก้ไขแล้วจะมีผลบังคับใช้เมื่อเผยแพร่บนแพลตฟอร์ม การใช้บริการของแพลตฟอร์มต่อไปถือว่ายอมรับเงื่อนไขที่แก้ไขแล้ว</text>
							<text class="paragraph">11.3 หากผู้ใช้ไม่ยอมรับเงื่อนไขที่แก้ไขแล้ว สามารถเลือกที่จะหยุดใช้บริการของแพลตฟอร์ม</text>
						</view>
					</view>
				</template>

				<!-- 隐私条例内容（三语） -->
				<template v-else-if="agreementType === 'privacy'">
					<!-- 中文 -->
					<view v-if="lang === 'zh'">
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
					</view>

					<!-- English -->
					<view v-else-if="lang === 'en'">
						<view class="section">
							<text class="section-title">Privacy Policy</text>
							<text class="update-time">Updated: January 1, 2024</text>
							<text class="update-time">Effective: January 1, 2024</text>
						</view>
						<view class="section">
							<text class="heading">1. Introduction</text>
							<text class="paragraph">1.1 SiamFeast (hereinafter "the Platform") takes user privacy protection very seriously.</text>
							<text class="paragraph">1.2 This Privacy Policy is intended to explain how we collect, use, store, and protect your personal information.</text>
							<text class="paragraph">1.3 Before using the Platform's services, please carefully read and understand this Privacy Policy.</text>
						</view>
						<view class="section">
							<text class="heading">2. Information Collection</text>
							<text class="paragraph">2.1 The information we collect includes:</text>
							<text class="paragraph sub">(1) Registration information: phone number, nickname, avatar, etc.;</text>
							<text class="paragraph sub">(2) Order information: delivery address, contact information, order records, etc.;</text>
							<text class="paragraph sub">(3) Payment information: payment method, payment records, etc.;</text>
							<text class="paragraph sub">(4) Device information: device model, operating system, unique device identifier, etc.;</text>
							<text class="paragraph sub">(5) Location information: used to provide nearby stores, delivery services, etc.;</text>
							<text class="paragraph sub">(6) Log information: access time, browsing history, operation records, etc.</text>
							<text class="paragraph">2.2 We only collect the above information when you have authorized consent.</text>
						</view>
						<view class="section">
							<text class="heading">3. Information Use</text>
							<text class="paragraph">3.1 We use the collected information to:</text>
							<text class="paragraph sub">(1) Provide, maintain, and improve our services;</text>
							<text class="paragraph sub">(2) Process your orders and payment requests;</text>
							<text class="paragraph sub">(3) Send you service notifications and marketing information (with your consent);</text>
							<text class="paragraph sub">(4) Conduct data analysis to improve user experience;</text>
							<text class="paragraph sub">(5) Ensure transaction security and prevent fraud;</text>
							<text class="paragraph sub">(6) Comply with legal and regulatory requirements.</text>
						</view>
						<view class="section">
							<text class="heading">4. Information Sharing</text>
							<text class="paragraph">4.1 We will not sell your personal information to third parties.</text>
							<text class="paragraph">4.2 We may share your information with third parties in the following situations:</text>
							<text class="paragraph sub">(1) With your explicit consent;</text>
							<text class="paragraph sub">(2) With service-providing partners (such as delivery providers and payment providers), but only the information necessary to provide the service;</text>
							<text class="paragraph sub">(3) As required by laws and regulations or by government departments according to law;</text>
							<text class="paragraph sub">(4) To protect the rights, property, or safety of the Platform, users, or the public.</text>
						</view>
						<view class="section">
							<text class="heading">5. Information Storage and Protection</text>
							<text class="paragraph">5.1 We adopt industry-standard security measures to protect your personal information, including but not limited to:</text>
							<text class="paragraph sub">(1) Encrypted data storage and transmission;</text>
							<text class="paragraph sub">(2) Access control and permission management;</text>
							<text class="paragraph sub">(3) Security audit and monitoring;</text>
							<text class="paragraph sub">(4) Regular security assessments and vulnerability remediation.</text>
							<text class="paragraph">5.2 Your information is stored on servers located in China.</text>
							<text class="paragraph">5.3 We retain information for no longer than necessary to fulfill the purposes described in this Policy.</text>
						</view>
						<view class="section">
							<text class="heading">6. Your Rights</text>
							<text class="paragraph">6.1 You have the following rights regarding your personal information:</text>
							<text class="paragraph sub">(1) Right of access: you have the right to access the personal information we hold about you;</text>
							<text class="paragraph sub">(2) Right to correct: you have the right to correct inaccurate or incomplete personal information;</text>
							<text class="paragraph sub">(3) Right to delete: in certain circumstances, you have the right to request deletion of your personal information;</text>
							<text class="paragraph sub">(4) Right to withdraw consent: you have the right to withdraw consent previously given to us;</text>
							<text class="paragraph sub">(5) Right to deactivate: you have the right to deactivate your account.</text>
							<text class="paragraph">6.2 To exercise the above rights, please contact our customer service.</text>
						</view>
						<view class="section">
							<text class="heading">7. Cookies and Similar Technologies</text>
							<text class="paragraph">7.1 We use cookies and similar technologies to:</text>
							<text class="paragraph sub">(1) Remember your login status and preference settings;</text>
							<text class="paragraph sub">(2) Analyze how you use our services;</text>
							<text class="paragraph sub">(3) Personalize your user experience.</text>
							<text class="paragraph">7.2 You can manage cookies through your browser settings, but this may affect the use of certain features.</text>
						</view>
						<view class="section">
							<text class="heading">8. Third-Party Links</text>
							<text class="paragraph">8.1 Our services may contain links to third-party websites or services.</text>
							<text class="paragraph">8.2 We are not responsible for the privacy practices of third parties. We recommend that you read their privacy policies.</text>
						</view>
						<view class="section">
							<text class="heading">9. Protection of Minors</text>
							<text class="paragraph">9.1 Our services are not directed at minors under the age of 14.</text>
							<text class="paragraph">9.2 If you are a minor between 14 and 18 years old, please use our services under the guidance of a guardian.</text>
							<text class="paragraph">9.3 If we discover that we have collected personal information of minors without verifiable parental consent, we will delete the relevant information as soon as possible.</text>
						</view>
						<view class="section">
							<text class="heading">10. Updates to the Privacy Policy</text>
							<text class="paragraph">10.1 We may update this Privacy Policy from time to time.</text>
							<text class="paragraph">10.2 The updated Policy will be published on the Platform. We recommend that you review it periodically.</text>
							<text class="paragraph">10.3 If you continue to use our services after the Policy changes, it means you accept the revised Policy.</text>
						</view>
					</view>

					<!-- ไทย -->
					<view v-else-if="lang === 'th'">
						<view class="section">
							<text class="section-title">นโยบายความเป็นส่วนตัว</text>
							<text class="update-time">อัปเดต: 1 มกราคม 2024</text>
							<text class="update-time">มีผลบังคับใช้: 1 มกราคม 2024</text>
						</view>
						<view class="section">
							<text class="heading">1. บทนำ</text>
							<text class="paragraph">1.1 SiamFeast (ต่อไปนี้เรียก "แพลตฟอร์ม") ให้ความสำคัญอย่างยิ่งต่อการคุ้มครองความเป็นส่วนตัวของผู้ใช้</text>
							<text class="paragraph">1.2 นโยบายความเป็นส่วนตัวนี้มีวัตถุประสงค์เพื่ออธิบายวิธีที่เราเก็บรวบรวม ใช้ จัดเก็บ และปกป้องข้อมูลส่วนบุคคลของคุณ</text>
							<text class="paragraph">1.3 ก่อนใช้บริการของแพลตฟอร์ม โปรดอ่านและเข้าใจนโยบายความเป็นส่วนตัวนี้อย่างละเอียด</text>
						</view>
						<view class="section">
							<text class="heading">2. การเก็บรวบรวมข้อมูล</text>
							<text class="paragraph">2.1 ข้อมูลที่เราเก็บรวบรวมรวมถึง:</text>
							<text class="paragraph sub">(1) ข้อมูลการลงทะเบียน: หมายเลขโทรศัพท์ ชื่อเล่น รูปประจำตัว ฯลฯ</text>
							<text class="paragraph sub">(2) ข้อมูลคำสั่งซื้อ: ที่อยู่จัดส่ง ข้อมูลการติดต่อ บันทึกคำสั่งซื้อ ฯลฯ</text>
							<text class="paragraph sub">(3) ข้อมูลการชำระเงิน: วิธีการชำระเงิน บันทึกการชำระเงิน ฯลฯ</text>
							<text class="paragraph sub">(4) ข้อมูลอุปกรณ์: รุ่นอุปกรณ์ ระบบปฏิบัติการ ตัวระบุอุปกรณ์เฉพาะ ฯลฯ</text>
							<text class="paragraph sub">(5) ข้อมูลตำแหน่ง: ใช้เพื่อให้บริการร้านค้าใกล้เคียง บริการจัดส่ง ฯลฯ</text>
							<text class="paragraph sub">(6) ข้อมูลบันทึก: เวลาเข้าถึง ประวัติการเรียกดู บันทึกการดำเนินการ ฯลฯ</text>
							<text class="paragraph">2.2 เราเก็บรวบรวมข้อมูลข้างต้นเฉพาะเมื่อคุณให้ความยินยอม</text>
						</view>
						<view class="section">
							<text class="heading">3. การใช้ข้อมูล</text>
							<text class="paragraph">3.1 เราใช้ข้อมูลที่เก็บรวบรวมเพื่อ:</text>
							<text class="paragraph sub">(1) ให้บริการ บำรุงรักษา และปรับปรุงบริการของเรา</text>
							<text class="paragraph sub">(2) ดำเนินการคำสั่งซื้อและคำขอชำระเงินของคุณ</text>
							<text class="paragraph sub">(3) ส่งการแจ้งเตือนบริการและข้อมูลการตลาด (ด้วยความยินยอมของคุณ)</text>
							<text class="paragraph sub">(4) ทำการวิเคราะห์ข้อมูลเพื่อปรับปรุงประสบการณ์ผู้ใช้</text>
							<text class="paragraph sub">(5) รับประกันความปลอดภัยในการทำธุรกรรมและป้องกันการฉ้อโกง</text>
							<text class="paragraph sub">(6) ปฏิบัติตามข้อกำหนดของกฎหมายและข้อบังคับ</text>
						</view>
						<view class="section">
							<text class="heading">4. การแบ่งปันข้อมูล</text>
							<text class="paragraph">4.1 เราจะไม่ขายข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สาม</text>
							<text class="paragraph">4.2 เราอาจแบ่งปันข้อมูลของคุณกับบุคคลที่สามในกรณีต่อไปนี้:</text>
							<text class="paragraph sub">(1) ได้รับความยินยอมอย่างชัดแจ้งจากคุณ</text>
							<text class="paragraph sub">(2) แบ่งปันกับพันธมิตรที่ให้บริการ (เช่น ผู้ให้บริการจัดส่ง ผู้ให้บริการชำระเงิน) เฉพาะข้อมูลที่จำเป็นสำหรับการให้บริการ</text>
							<text class="paragraph sub">(3) ตามที่กฎหมายกำหนดหรือตามคำขอของหน่วยงานรัฐบาลตามกฎหมาย</text>
							<text class="paragraph sub">(4) เพื่อปกป้องสิทธิ์ ทรัพย์สิน หรือความปลอดภัยของแพลตฟอร์ม ผู้ใช้ หรือสาธารณะ</text>
						</view>
						<view class="section">
							<text class="heading">5. การจัดเก็บและการปกป้องข้อมูล</text>
							<text class="paragraph">5.1 เราใช้มาตรการความปลอดภัยตามมาตรฐานอุตสาหกรรมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณ รวมถึงแต่ไม่จำกัดเพียง:</text>
							<text class="paragraph sub">(1) การเข้ารหัสข้อมูลในการจัดเก็บและส่งข้อมูล</text>
							<text class="paragraph sub">(2) การควบคุมการเข้าถึงและการจัดการสิทธิ์</text>
							<text class="paragraph sub">(3) การตรวจสอบและติดตามด้านความปลอดภัย</text>
							<text class="paragraph sub">(4) การประเมินความปลอดภัยเป็นระยะและการแก้ไขช่องโหว่</text>
							<text class="paragraph">5.2 ข้อมูลของคุณจัดเก็บบนเซิร์ฟเวอร์ในประเทศจีน</text>
							<text class="paragraph">5.3 เราเก็บรักษาข้อมูลไม่นานเกินกว่าที่จำเป็นเพื่อบรรลุวัตถุประสงค์ที่อธิบายไว้ในนโยบายนี้</text>
						</view>
						<view class="section">
							<text class="heading">6. สิทธิของคุณ</text>
							<text class="paragraph">6.1 คุณมีสิทธิดังต่อไปนี้เกี่ยวกับข้อมูลส่วนบุคคลของคุณ:</text>
							<text class="paragraph sub">(1) สิทธิในการเข้าถึง: คุณมีสิทธิเข้าถึงข้อมูลส่วนบุคคลที่เราเก็บเกี่ยวกับคุณ</text>
							<text class="paragraph sub">(2) สิทธิในการแก้ไข: คุณมีสิทธิแก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้องหรือไม่ครบถ้วน</text>
							<text class="paragraph sub">(3) สิทธิในการลบ: ในบางกรณี คุณมีสิทธิร้องขอให้ลบข้อมูลส่วนบุคคลของคุณ</text>
							<text class="paragraph sub">(4) สิทธิในการถอนความยินยอม: คุณมีสิทธิถอนความยินยอมที่ให้ไว้กับเราก่อนหน้านี้</text>
							<text class="paragraph sub">(5) สิทธิในการปิดบัญชี: คุณมีสิทธิปิดบัญชีของคุณ</text>
							<text class="paragraph">6.2 หากต้องการใช้สิทธิข้างต้น โปรดติดต่อฝ่ายบริการลูกค้าของเรา</text>
						</view>
						<view class="section">
							<text class="heading">7. คุกกี้และเทคโนโลยีที่คล้ายคลึงกัน</text>
							<text class="paragraph">7.1 เราใช้คุกกี้และเทคโนโลยีที่คล้ายคลึงกันเพื่อ:</text>
							<text class="paragraph sub">(1) จดจำสถานะการเข้าสู่ระบบและการตั้งค่าของคุณ</text>
							<text class="paragraph sub">(2) วิเคราะห์ว่าคุณใช้บริการของเราอย่างไร</text>
							<text class="paragraph sub">(3) ปรับประสบการณ์การใช้งานของคุณให้เป็นส่วนตัว</text>
							<text class="paragraph">7.2 คุณสามารถจัดการคุกกี้ผ่านการตั้งค่าเบราว์เซอร์ แต่อาจส่งผลกระทบต่อการใช้งานคุณสมบัติบางอย่าง</text>
						</view>
						<view class="section">
							<text class="heading">8. ลิงก์ของบุคคลที่สาม</text>
							<text class="paragraph">8.1 บริการของเราอาจมีลิงก์ไปยังเว็บไซต์หรือบริการของบุคคลที่สาม</text>
							<text class="paragraph">8.2 เราไม่รับผิดชอบต่อแนวปฏิบัติด้านความเป็นส่วนตัวของบุคคลที่สาม ขอแนะนำให้คุณอ่านนโยบายความเป็นส่วนตัวของบุคคลที่สาม</text>
						</view>
						<view class="section">
							<text class="heading">9. การคุ้มครองผู้เยาว์</text>
							<text class="paragraph">9.1 บริการของเราไม่ได้มุ่งเป้าไปที่ผู้เยาว์ที่มีอายุต่ำกว่า 14 ปี</text>
							<text class="paragraph">9.2 หากคุณเป็นผู้เยาว์ที่มีอายุระหว่าง 14-18 ปี โปรดใช้บริการของเราภายใต้การดูแลของผู้ปกครอง</text>
							<text class="paragraph">9.3 หากเราพบว่าเราได้เก็บรวบรวมข้อมูลส่วนบุคคลของผู้เยาว์โดยไม่ได้รับความยินยอมจากผู้ปกครองที่พิสูจน์ได้ เราจะลบข้อมูลที่เกี่ยวข้องโดยเร็วที่สุด</text>
						</view>
						<view class="section">
							<text class="heading">10. การอัปเดตนโยบายความเป็นส่วนตัว</text>
							<text class="paragraph">10.1 เราอาจอัปเดตนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว</text>
							<text class="paragraph">10.2 นโยบายที่อัปเดตแล้วจะถูกเผยแพร่บนแพลตฟอร์ม ขอแนะนำให้คุณตรวจสอบเป็นระยะ</text>
							<text class="paragraph">10.3 หากคุณใช้บริการของเราต่อหลังจากการเปลี่ยนแปลงนโยบาย ถือว่าคุณยอมรับนโยบายที่แก้ไขแล้ว</text>
						</view>
					</view>
				</template>

				<!-- 关于我们内容（三语） -->
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
