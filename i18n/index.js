/**
 * 多语言配置
 */

const messages = {
	// 中文
	zh: {
		common: {
			confirm: '确认',
			cancel: '取消',
			back: '返回',
			loading: '加载中...',
			success: '成功',
			fail: '失败',
			pleaseSelect: '请选择',
			noData: '暂无数据',
			networkError: '网络错误，请稍后重试',
			loginExpired: '登录已过期，请重新登录',
			clear: '清空'
		},
		nav: {
			home: '首页',
			order: '订单',
			mine: '我的'
		},
		index: {
			storeLocation: '门店位置',
			switchStore: '切换门店',
			dineIn: '堂食',
			dineInDesc: '优惠提前领',
			mall: '商城',
			mallDesc: '更多美食饮品',
			memberLevel: '普通会员',
			coupons: '优惠券',
			points: '积分',
			newProducts: '新品上市',
			newProductsDesc: '即可探索',
			hotList: '热销榜单',
			hotListDesc: '人气必吃榜',
			pointsMall: '积分商城',
			pointsMallDesc: '积分兑好礼'
		},
		storeSelect: {
			title: '选择门店',
			currentLocation: '当前位置',
			locating: '正在定位...',
			refresh: '刷新',
			nearbyStores: '附近门店',
			storeCount: '共{count}家',
			open: '营业中',
			closed: '休息中',
			confirmSelect: '确认选择',
			pleaseSelectStore: '请先选择门店',
			selected: '已选择',
			noStores: '暂无附近门店',
			noCoords: '该门店暂无位置信息',
			dblclickHint: '双击可在地图上定位',
			loadFailed: '加载门店失败',
			searchPlaceholder: '搜索地址',
			gpsMode: 'GPS定位',
			pickMode: '地图选点',
			businessTypes: {
				hotpot: '火锅',
				malaTang: '麻辣烫',
				beverage: '饮品',
				barbecue: '烧烤',
				hostel: '民宿',
				hostelHotpot: '民宿火锅',
				hostelCoffee: '民宿咖啡'
			},
		},
		hostel: {
			rooms: '客房',
			checkIn: '入住',
			checkOut: '退房',
			selectDate: '请选择',
			nights: '晚',
			noRooms: '暂无可用客房',
			full: '已满',
			person: '人',
			beds: '床',
			perNight: '晚',
			book: '预订',
			roomFull: '该房间已满'
		},
		dinein: {
			newCustomerOffer: '新客专享优惠',
			newCustomerDesc: '满50减10·仅限堂食',
			addToCart: '已加入购物车',
			checkout: '去结算',
			shareSuccess: '链接已复制',
			shareFail: '复制失败，请重试',
			shareFailed: '分享失败，请重试',
			welcome: '欢迎光临！'
		},
		productDetail: {
			specs: '规格',
			quantity: '数量',
			addToCart: '加入购物车',
			buyNow: '立即购买',
			hot: '热销',
			new: '新品',
			recommend: '推荐',
			selectSpecs: '选择规格',
			confirm: '确认',
			specLabels: {
				temperature: '温度',
				sugar: '糖度',
				size: '杯型',
				spice_level: '辣度'
			},
			specOptions: {
				hot: '热',
				ice: '冷',
				full: '全糖',
				half: '半糖',
				little: '少糖',
				none: '无糖',
				small: '小杯',
				medium: '中杯',
				large: '大杯',
				mild: '微辣',
				medium_spice: '中辣',
				hot_spice: '辣',
				extra_hot: '特辣'
			}
		},
		cart: {
			title: '购物车',
			empty: '购物车是空的',
			goShopping: '去逛逛',
			total: '合计',
			settle: '结算',
			selected: '已选'
		},
		checkout: {
			title: '确认订单',
			dineIn: '堂食',
			takeaway: '外卖',
			subtotal: '商品小计',
			deliveryFee: '配送费',
			packFee: '包装费',
			discount: '优惠',
			total: '实付',
			submitOrder: '提交订单',
			selectCoupon: '选择优惠券',
			noCoupon: '暂无可用优惠券',
			remark: '备注',
			remarkPlaceholder: '请输入备注信息',
			tableNumber: '桌号',
			pleaseSelectTable: '请选择桌号'
		},
		payment: {
			title: '支付',
			waiting: '等待支付',
			success: '支付成功',
			failed: '支付失败',
			orderTotal: '订单金额',
			payNow: '立即支付',
			payAgain: '重新支付',
			viewOrder: '查看订单',
			backHome: '返回首页',
			payMethods: {
				wechat: '微信支付',
				alipay: '支付宝',
				cash: '现金支付'
			}
		},
		order: {
			title: '我的订单',
			all: '全部',
			pending: '待付款',
			preparing: '制作中',
			ready: '待取餐',
			completed: '已完成',
			cancelled: '已取消',
			orderNumber: '订单号',
			orderTime: '下单时间',
			cancelOrder: '取消订单',
			reorder: '再来一单',
			cancelSuccess: '订单已取消',
			noOrders: '暂无订单'
		},
		orderDetail: {
			title: '订单详情',
			orderInfo: '订单信息',
			storeInfo: '门店信息',
			paymentInfo: '支付信息',
			orderStatus: '订单状态',
			productList: '商品列表'
		},
		mine: {
			title: '我的',
			memberCenter: '会员中心',
			myCoupons: '我的优惠券',
			myPoints: '我的积分',
			myAddress: '我的地址',
			language: '语言设置',
			settings: '设置',
			feedback: '意见反馈',
			aboutUs: '关于我们',
			logout: '退出登录',
			logoutConfirm: '确定要退出登录吗？',
			myFeatures: '我的功能',
			footprint: '足迹',
			invoice: '开发票',
			specialCoupon: '天降优惠券',
			coupon: '优惠券',
			couponCondition: '满20元可用',
			receiveNow: '立即领取',
			recommendedStores: '好店推荐',
			enterStore: '进店',
			monthlySales: '月售',
			score: '分',
		},
		login: {
			title: '登录',
			notLoggedIn: '未登录',
			clickToLogin: '点击登录',
			phonePlaceholder: '请输入手机号',
			codePlaceholder: '请输入验证码',
			getCode: '获取验证码',
			resend: '重新发送({seconds}s)',
			login: '登录',
			phoneRequired: '请输入手机号',
			phoneInvalid: '手机号格式不正确',
			codeRequired: '请输入验证码',
			loginSuccess: '登录成功',
			loginFailed: '登录失败',
			passwordLogin: '密码登录',
			codeLogin: '验证码登录',
			passwordPlaceholder: '请输入密码',
			agreementPrefix: '我已阅读并同意',
			terms: '《服务条款》',
			and: '和',
			privacy: '《隐私政策》',
			agreementRequired: '请先同意服务条款和隐私政策'
		},
		settings: {
			title: '设置',
			accountSettings: '账号设置',
			generalSettings: '通用设置',
			aboutSection: '关于',
			nickname: '用户名称',
			editNickname: '修改用户名称',
			nicknamePlaceholder: '请输入用户名称',
			avatar: '头像',
			phone: '手机号',
			changePassword: '修改密码',
			notifications: '消息通知',
			language: '语言',
			currentLanguage: '简体中文',
			cache: '清除缓存',
			cacheClear: '缓存已清除',
			cacheClearConfirm: '确定清除缓存吗？',
			oldPassword: '旧密码',
			newPassword: '新密码',
			confirmPassword: '确认密码',
			oldPasswordPlaceholder: '请输入旧密码',
			newPasswordPlaceholder: '请输入新密码（至少6位）',
			confirmPasswordPlaceholder: '请再次输入新密码',
			passwordMismatch: '两次密码输入不一致',
			passwordTooShort: '密码长度不能少于6位',
			passwordChanged: '密码修改成功',
			notificationEnabled: '通知已开启',
			notificationDisabled: '通知已关闭',
			about: '关于我们',
			privacy: '隐私政策',
			agreement: '用户协议',
			version: '版本',
			logout: '退出登录',
		birthday: '出生日期',
		editBirthday: '修改出生日期',
		birthdayPlaceholder: '请选择出生日期',
		birthdaySaveSuccess: '出生日期已更新',
		notSet: '未设置'
		},
		language: {
			title: '语言设置',
			zh: '中文',
			en: 'English',
			th: 'ภาษาไทย',
			switchSuccess: '语言切换成功'
		},
		message: {
			title: '消息',
			noMessages: '暂无消息',
			system: '系统通知',
			promotion: '优惠活动',
			order: '订单消息',
			markAllRead: '全部已读',
			allRead: '已全部标记为已读',
			markReadFailed: '标记失败'
		},
		coupons: {
			title: '优惠券',
			available: '可用',
			used: '已使用',
			expired: '已过期',
			receive: '领取',
			received: '已领取',
			immediateUse: '立即使用',
			noCoupons: '暂无优惠券',
			receiveSuccess: '领取成功',
			receiveFailed: '领取失败'
		},
		address: {
			title: '我的地址',
			add: '添加地址',
			edit: '编辑地址',
			delete: '删除',
			default: '默认',
			setDefault: '设为默认',
			contact: '联系人',
			contactPlaceholder: '请输入收货人姓名',
			phone: '电话',
			phonePlaceholder: '请输入手机号',
			address: '详细地址',
			addressPlaceholder: '请输入详细地址',
			pleaseSelectAddress: '请选择地址',
			save: '保存',
			deleteConfirm: '确定要删除这个地址吗？',
			noAddress: '暂无地址',
			getLocation: '获取定位',
			locating: '正在定位...',
			locationSuccess: '定位成功',
			locationFailed: '定位失败',
			region: '所在地区',
			selectRegion: '选择地区',
			province: '省/直辖市',
			city: '市',
			district: '区/县',
			houseNumber: '门牌号',
			houseNumberPlaceholder: '例：8号楼2单元1201室',
			label: '标签',
			labelHome: '家',
			labelCompany: '公司',
			labelSchool: '学校',
			labelOther: '其他',
			remark: '备注',
			remarkPlaceholder: '例：放在门口',
			nameRequired: '请输入收货人姓名',
			phoneRequired: '请输入手机号',
			phoneInvalid: '手机号格式不正确',
			addressRequired: '请输入详细地址',
			saveSuccess: '保存成功',
			saveFailed: '保存失败',
			deleteSuccess: '删除成功',
			deleteFailed: '删除失败',
			setDefaultSuccess: '设置成功',
			setDefaultFailed: '设置失败',
			confirmBack: '信息未保存，确定返回吗？'
		},
		points: {
			title: '我的积分',
			currentPoints: '当前积分',
			history: '积分明细',
			earn: '获得',
			spend: '消费',
			noHistory: '暂无积分记录'
		},
		mall: {
			title: '商城',
			categories: '分类',
			hot: '热销',
			new: '新品',
			all: '全部'
		},
		newProducts: {
			title: '新品上市',
			explore: '即可探索'
		},
		hotProducts: {
			title: '热销榜单',
			subtitle: '人气必吃榜'
		},
		pointsMall: {
			title: '积分商城',
			exchange: '兑换',
			myPoints: '我的积分',
			exchangeSuccess: '兑换成功',
			exchangeFailed: '兑换失败',
			pointsNotEnough: '积分不足'
		},
		agreement: {
			terms: '服务条款',
			privacy: '隐私政策',
			about: '关于我们'
		},
		footprint: {
			title: '我的足迹',
			products: '商品',
			stores: '门店',
			searches: '搜索',
			noProducts: '暂无商品浏览记录',
			noStores: '暂无门店浏览记录',
			noSearches: '暂无搜索记录',
			goBrowse: '去逛逛',
			confirmClear: '确定要清空当前记录吗？',
			clearSuccess: '清空成功'
		},
		member: {
			normal: '普通',
			platinum: '铂金',
			normalMember: '普通会员',
			platinumMember: '铂金会员',
			platinumBenefit: '升级铂金后可享生日礼物',
			consumption: '消费',
			upgrade: '升级',
			upgradeTip: '继续消费升级铂金会员',
			balance: '余额',
			points: '积分',
			newUserPack: '新人券包',
			pointsExchange: '积分兑换',
			balanceExchange: '余额兑换',
			exchange: '兑换',
			exchangeConfirm: '确认兑换',
			exchangeSuccess: '兑换成功',
			exchangeFor: '兑换',
			use: '使用',
			pointsNotEnough: '积分不足',
			balanceDetail: '余额明细'
		},
		upgrade: {
			congratulations: '恭喜升级',
			becomePlatinum: '您已成功升级为铂金会员',
			from: '原等级',
			to: '新等级',
			enjoyNow: '立即享受',
			benefitBirthday: '生日专属礼物',
			benefitDiscount: '专属折扣优惠',
			benefitPriority: '优先预订特权',
			animationShown: 'shown'
		}
	},
	// 英文
	en: {
		common: {
			confirm: 'Confirm',
			cancel: 'Cancel',
			back: 'Back',
			loading: 'Loading...',
			success: 'Success',
			fail: 'Failed',
			pleaseSelect: 'Please select',
			noData: 'No data',
			networkError: 'Network error, please try again',
			loginExpired: 'Login expired, please login again',
			clear: 'Clear'
		},
		nav: {
			home: 'Home',
			order: 'Orders',
			mine: 'Me'
		},
		index: {
			storeLocation: 'Store Location',
			switchStore: 'Switch Store',
			dineIn: 'Dine In',
			dineInDesc: 'Get coupons early',
			mall: 'Mall',
			mallDesc: 'More food & drinks',
			memberLevel: 'Member',
			coupons: 'Coupons',
			points: 'Points',
			newProducts: 'New Arrivals',
			newProductsDesc: 'Explore now',
			hotList: 'Best Sellers',
			hotListDesc: 'Popular picks',
			pointsMall: 'Points Mall',
			pointsMallDesc: 'Redeem rewards'
		},
		storeSelect: {
			title: 'Select Store',
			currentLocation: 'Current Location',
			locating: 'Locating...',
			refresh: 'Refresh',
			nearbyStores: 'Nearby Stores',
			storeCount: '{count} stores',
			open: 'Open',
			closed: 'Closed',
			confirmSelect: 'Confirm',
			pleaseSelectStore: 'Please select a store',
			selected: 'Selected',
			noStores: 'No nearby stores',
			noCoords: 'Store location not available',
			dblclickHint: 'Double-click to locate on map',
			loadFailed: 'Failed to load stores',
			searchPlaceholder: 'Search address',
			gpsMode: 'GPS',
			pickMode: 'Pick on Map',
			businessTypes: {
				hotpot: 'Hotpot',
				malaTang: 'Malatang',
				beverage: 'Beverage',
				barbecue: 'Barbecue',
				hostel: 'Hostel',
				hostelHotpot: 'Hostel Hotpot',
				hostelCoffee: 'Hostel Coffee'
			},
		},
		hostel: {
			rooms: 'Rooms',
			checkIn: 'Check-in',
			checkOut: 'Check-out',
			selectDate: 'Select',
			nights: ' nights',
			noRooms: 'No rooms available',
			full: 'Full',
			person: ' guests',
			beds: ' beds',
			perNight: ' night',
			book: 'Book',
			roomFull: 'Room is full'
		},
		dinein: {
			rating: 'Rating',
			businessHours: 'Hours',
			distance: 'Distance',
			bikeTime: 'Bike',
			walkTime: 'Walk',
			categories: {
				discount: 'Deals',
				group: 'Group',
				dishes: 'Menu'
			},
			newCustomerOffer: 'New Customer Offer',
			newCustomerDesc: '$10 off $50 · Dine in only',
			addToCart: 'Added to cart',
			checkout: 'Checkout',
			shareSuccess: 'Link copied',
			shareFail: 'Copy failed, please try again',
			shareFailed: 'Share failed, please try again',
			welcome: 'Welcome!'
		},
		productDetail: {
			specs: 'Options',
			quantity: 'Qty',
			addToCart: 'Add to Cart',
			buyNow: 'Buy Now',
			hot: 'Hot',
			new: 'New',
			recommend: 'Recommended',
			selectSpecs: 'Select Options',
			confirm: 'Confirm',
			specLabels: {
				temperature: 'Temperature',
				sugar: 'Sugar',
				size: 'Size',
				spice_level: 'Spice Level'
			},
			specOptions: {
				hot: 'Hot',
				ice: 'Ice',
				full: 'Full',
				half: 'Half',
				little: 'Less',
				none: 'None',
				small: 'Small',
				medium: 'Medium',
				large: 'Large',
				mild: 'Mild',
				medium_spice: 'Medium',
				hot_spice: 'Hot',
				extra_hot: 'Extra Hot'
			}
		},
		cart: {
			title: 'Cart',
			empty: 'Your cart is empty',
			goShopping: 'Shop Now',
			total: 'Total',
			settle: 'Checkout',
			selected: 'Selected'
		},
		checkout: {
			title: 'Checkout',
			dineIn: 'Dine In',
			takeaway: 'Takeaway',
			subtotal: 'Subtotal',
			deliveryFee: 'Delivery Fee',
			packFee: 'Packing Fee',
			discount: 'Discount',
			total: 'Total',
			submitOrder: 'Place Order',
			selectCoupon: 'Select Coupon',
			noCoupon: 'No coupons available',
			remark: 'Note',
			remarkPlaceholder: 'Add a note',
			tableNumber: 'Table',
			pleaseSelectTable: 'Select table'
		},
		payment: {
			title: 'Payment',
			waiting: 'Waiting for payment',
			success: 'Payment Successful',
			failed: 'Payment Failed',
			orderTotal: 'Order Total',
			payNow: 'Pay Now',
			payAgain: 'Try Again',
			viewOrder: 'View Order',
			backHome: 'Back to Home',
			payMethods: {
				wechat: 'WeChat Pay',
				alipay: 'Alipay',
				cash: 'Cash'
			}
		},
		order: {
			title: 'My Orders',
			all: 'All',
			pending: 'Pending',
			preparing: 'Preparing',
			ready: 'Ready',
			completed: 'Completed',
			cancelled: 'Cancelled',
			orderNumber: 'Order No.',
			orderTime: 'Order Time',
			cancelOrder: 'Cancel',
			reorder: 'Reorder',
			cancelSuccess: 'Order cancelled',
			noOrders: 'No orders'
		},
		orderDetail: {
			title: 'Order Details',
			orderInfo: 'Order Info',
			storeInfo: 'Store Info',
			paymentInfo: 'Payment Info',
			orderStatus: 'Status',
			productList: 'Items'
		},
		mine: {
			title: 'Me',
			memberCenter: 'Membership',
			myCoupons: 'My Coupons',
			myPoints: 'My Points',
			myAddress: 'My Address',
			language: 'Language',
			settings: 'Settings',
			feedback: 'Feedback',
			aboutUs: 'About Us',
			logout: 'Logout',
			logoutConfirm: 'Are you sure you want to logout?',
			myFeatures: 'My Features',
			footprint: 'Footprint',
			invoice: 'Invoice',
			specialCoupon: 'Special Coupon',
			coupon: 'Coupon',
			couponCondition: 'Min. spend ฿20',
			receiveNow: 'Get Now',
			recommendedStores: 'Recommended Stores',
			enterStore: 'Enter',
			monthlySales: 'Monthly',
			score: ''
		},
		login: {
			title: 'Login',
			notLoggedIn: 'Not logged in',
			clickToLogin: 'Tap to login',
			phonePlaceholder: 'Phone number',
			codePlaceholder: 'Verification code',
			getCode: 'Get Code',
			resend: 'Resend ({seconds}s)',
			login: 'Login',
			phoneRequired: 'Please enter phone number',
			phoneInvalid: 'Invalid phone number',
			codeRequired: 'Please enter code',
			loginSuccess: 'Login successful',
			loginFailed: 'Login failed',
			passwordLogin: 'Password',
			codeLogin: 'SMS Code',
			passwordPlaceholder: 'Password',
			agreementPrefix: 'I agree to the',
			terms: 'Terms of Service',
			and: 'and',
			privacy: 'Privacy Policy',
			agreementRequired: 'Please agree to the terms'
		},
		settings: {
			title: 'Settings',
			accountSettings: 'Account Settings',
			generalSettings: 'General Settings',
			aboutSection: 'About',
			nickname: 'Username',
			editNickname: 'Edit Username',
			nicknamePlaceholder: 'Enter username',
			avatar: 'Avatar',
			phone: 'Phone',
			changePassword: 'Change Password',
			notifications: 'Notifications',
			language: 'Language',
			currentLanguage: 'English',
			cache: 'Clear Cache',
			cacheClear: 'Cache cleared',
			cacheClearConfirm: 'Clear cache?',
			oldPassword: 'Old Password',
			newPassword: 'New Password',
			confirmPassword: 'Confirm Password',
			oldPasswordPlaceholder: 'Enter old password',
			newPasswordPlaceholder: 'Enter new password (min 6 chars)',
			confirmPasswordPlaceholder: 'Re-enter new password',
			passwordMismatch: 'Passwords do not match',
			passwordTooShort: 'Password must be at least 6 characters',
			passwordChanged: 'Password changed successfully',
			notificationEnabled: 'Notifications enabled',
			notificationDisabled: 'Notifications disabled',
			about: 'About Us',
			privacy: 'Privacy Policy',
			agreement: 'User Agreement',
			version: 'Version',
			logout: 'Logout',
		birthday: 'Birthday',
		editBirthday: 'Edit Birthday',
		birthdayPlaceholder: 'Select your birthday',
		birthdaySaveSuccess: 'Birthday updated',
		notSet: 'Not set'
		},
		language: {
			title: 'Language',
			zh: '中文',
			en: 'English',
			th: 'ภาษาไทย',
			switchSuccess: 'Language changed'
		},
		message: {
			title: 'Messages',
			noMessages: 'No messages',
			system: 'System',
			promotion: 'Promotions',
			order: 'Orders',
			markAllRead: 'Mark all read',
			allRead: 'All messages marked as read',
			markReadFailed: 'Failed to mark'
		},
		coupons: {
			title: 'Coupons',
			available: 'Available',
			used: 'Used',
			expired: 'Expired',
			receive: 'Get',
			received: 'Received',
			immediateUse: 'Use Now',
			noCoupons: 'No coupons',
			receiveSuccess: 'Coupon received',
			receiveFailed: 'Failed to receive'
		},
		address: {
			title: 'My Address',
			add: 'Add Address',
			edit: 'Edit',
			delete: 'Delete',
			default: 'Default',
			setDefault: 'Set as Default',
			contact: 'Name',
			contactPlaceholder: 'Recipient name',
			phone: 'Phone',
			phonePlaceholder: 'Phone number',
			address: 'Address',
			addressPlaceholder: 'Detailed address',
			pleaseSelectAddress: 'Select address',
			save: 'Save',
			deleteConfirm: 'Delete this address?',
			noAddress: 'No address',
			getLocation: 'Get Location',
			locating: 'Locating...',
			locationSuccess: 'Location found',
			locationFailed: 'Location failed',
			region: 'Region',
			selectRegion: 'Select region',
			province: 'Province',
			city: 'City',
			district: 'District',
			houseNumber: 'House No.',
			houseNumberPlaceholder: 'e.g., Bldg 8, Unit 2, Room 1201',
			label: 'Label',
			labelHome: 'Home',
			labelCompany: 'Company',
			labelSchool: 'School',
			labelOther: 'Other',
			remark: 'Remark',
			remarkPlaceholder: 'e.g., Leave at door',
			nameRequired: 'Please enter name',
			phoneRequired: 'Please enter phone',
			phoneInvalid: 'Invalid phone number',
			addressRequired: 'Please enter address',
			saveSuccess: 'Saved successfully',
			saveFailed: 'Save failed',
			deleteSuccess: 'Deleted successfully',
			deleteFailed: 'Delete failed',
			setDefaultSuccess: 'Set as default',
			setDefaultFailed: 'Failed to set default',
			confirmBack: 'Unsaved changes. Go back?'
		},
		points: {
			title: 'My Points',
			currentPoints: 'Current Points',
			history: 'Points History',
			earn: 'Earned',
			spend: 'Spent',
			noHistory: 'No history'
		},
		mall: {
			title: 'Mall',
			categories: 'Categories',
			hot: 'Hot',
			new: 'New',
			all: 'All'
		},
		newProducts: {
			title: 'New Arrivals',
			explore: 'Explore Now'
		},
		hotProducts: {
			title: 'Best Sellers',
			subtitle: 'Popular picks'
		},
		pointsMall: {
			title: 'Points Mall',
			exchange: 'Redeem',
			myPoints: 'My Points',
			exchangeSuccess: 'Redeemed successfully',
			exchangeFailed: 'Redemption failed',
			pointsNotEnough: 'Not enough points'
		},
		agreement: {
			terms: 'Terms of Service',
			privacy: 'Privacy Policy',
			about: 'About Us'
		},
		footprint: {
			title: 'My Footprints',
			products: 'Products',
			stores: 'Stores',
			searches: 'Searches',
			noProducts: 'No product browsing history',
			noStores: 'No store browsing history',
			noSearches: 'No search history',
			goBrowse: 'Browse Now',
			confirmClear: 'Clear current records?',
			clearSuccess: 'Cleared successfully'
		},
		member: {
			normal: 'Normal',
			platinum: 'Platinum',
			normalMember: 'Normal Member',
			platinumMember: 'Platinum Member',
			platinumBenefit: 'Birthday gift for Platinum',
			consumption: 'Spent',
			upgrade: 'Upgrade',
			upgradeTip: 'Keep spending to upgrade to Platinum',
			balance: 'Balance',
			points: 'Points',
			newUserPack: 'New User Pack',
			pointsExchange: 'Points Redeem',
			balanceExchange: 'Balance Redeem',
			exchange: 'Redeem',
			exchangeConfirm: 'Confirm Redeem',
			exchangeSuccess: 'Redeemed successfully',
			exchangeFor: 'for',
			use: 'Use',
			pointsNotEnough: 'Not enough points',
			balanceDetail: 'Balance Details'
		},
		upgrade: {
			congratulations: 'Congratulations',
			becomePlatinum: 'You have been upgraded to Platinum',
			from: 'From',
			to: 'To',
			enjoyNow: 'Enjoy Now',
			benefitBirthday: 'Birthday Special Gift',
			benefitDiscount: 'Exclusive Discount',
			benefitPriority: 'Priority Booking'
		}
	},
	// 泰语
	th: {
		common: {
			confirm: 'ยืนยัน',
			cancel: 'ยกเลิก',
			back: 'กลับ',
			loading: 'กำลังโหลด...',
			success: 'สำเร็จ',
			fail: 'ล้มเหลว',
			pleaseSelect: 'กรุณาเลือก',
			noData: 'ไม่มีข้อมูล',
			networkError: 'ข้อผิดพลาดของเครือข่าย กรุณาลองอีกครั้ง',
			loginExpired: 'การเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
			clear: 'ล้าง'
		},
		nav: {
			home: 'หน้าแรก',
			order: 'คำสั่งซื้อ',
			mine: 'ของฉัน'
		},
		index: {
			storeLocation: 'ที่ตั้งร้าน',
			switchStore: 'เปลี่ยนร้าน',
			dineIn: 'ทานที่ร้าน',
			dineInDesc: 'รับคูปองล่วงหน้า',
			mall: 'ห้าง',
			mallDesc: 'อาหารและเครื่องดื่มเพิ่มเติม',
			memberLevel: 'สมาชิก',
			coupons: 'คูปอง',
			points: 'คะแนน',
			newProducts: 'สินค้าใหม่',
			newProductsDesc: 'สำรวจตอนนี้',
			hotList: 'ขายดี',
			hotListDesc: 'ยอดนิยม',
			pointsMall: 'แลกคะแนน',
			pointsMallDesc: 'แลกรางวัล'
		},
		storeSelect: {
			title: 'เลือกร้าน',
			currentLocation: 'ตำแหน่งปัจจุบัน',
			locating: 'กำลังระบุตำแหน่ง...',
			refresh: 'รีเฟรช',
			nearbyStores: 'ร้านใกล้เคียง',
			storeCount: '{count} ร้าน',
			open: 'เปิด',
			closed: 'ปิด',
			confirmSelect: 'ยืนยัน',
			pleaseSelectStore: 'กรุณาเลือกร้าน',
			selected: 'เลือกแล้ว',
			noStores: 'ไม่มีร้านใกล้เคียง',
			noCoords: 'ไม่มีพิกัดร้านนี้',
			dblclickHint: 'ดับเบิลคลิกเพื่อดูบนแผนที่',
			loadFailed: 'โหลดร้านไม่สำเร็จ',
			searchPlaceholder: 'ค้นหาที่อยู่',
			gpsMode: 'GPS',
			pickMode: 'เลือกจากแผนที่',
			businessTypes: {
				hotpot: 'หม้อไฟ',
				malaTang: 'มาลาทั่ง',
				beverage: 'เครื่องดื่ม',
				barbecue: 'บาร์บีคิว',
				hostel: 'ที่พัก',
				hostelHotpot: 'หม้อไฟที่พัก',
				hostelCoffee: 'กาแฟที่พัก'
			},
		},
		hostel: {
			rooms: 'ห้องพัก',
			checkIn: 'เช็คอิน',
			checkOut: 'เช็คเอาท์',
			selectDate: 'เลือก',
			nights: ' คืน',
			noRooms: 'ไม่มีห้องว่าง',
			full: 'เต็ม',
			person: ' คน',
			beds: ' เตียง',
			perNight: ' คืน',
			book: 'จอง',
			roomFull: 'ห้องเต็ม'
		},
		dinein: {
			rating: 'คะแนน',
			businessHours: 'เวลาทำการ',
			distance: 'ระยะทาง',
			bikeTime: 'จักรยาน',
			walkTime: 'เดิน',
			categories: {
				discount: 'โปรโมชั่น',
				group: 'กรุ๊ป',
				dishes: 'เมนู'
			},
			newCustomerOffer: 'โปรโมชั่นลูกค้าใหม่',
			newCustomerDesc: 'ลด 10 บาท เมื่อซื้อครบ 50 · ทานที่ร้านเท่านั้น',
			addToCart: 'เพิ่มลงตะกร้าแล้ว',
			checkout: 'ชำระเงิน',
			shareSuccess: 'คัดลอกลิงก์แล้ว',
			shareFail: 'คัดลอกไม่สำเร็จ กรุณาลองอีกครั้ง',
			shareFailed: 'แชร์ไม่สำเร็จ กรุณาลองอีกครั้ง',
			welcome: 'ยินดีต้อนรับ!'
		},
		productDetail: {
			specs: 'ตัวเลือก',
			quantity: 'จำนวน',
			addToCart: 'เพิ่มลงตะกร้า',
			buyNow: 'ซื้อเลย',
			hot: 'ขายดี',
			new: 'ใหม่',
			recommend: 'แนะนำ',
			selectSpecs: 'เลือกตัวเลือก',
			confirm: 'ยืนยัน',
			specLabels: {
				temperature: 'อุณหภูมิ',
				sugar: 'ระดับความหวาน',
				size: 'ขนาด',
				spice_level: 'ระดับความเผ็ด'
			},
			specOptions: {
				hot: 'ร้อน',
				ice: 'เย็น',
				full: 'หวานปกติ',
				half: 'หวานครึ่ง',
				little: 'หวานน้อย',
				none: 'ไม่หวาน',
				small: 'เล็ก',
				medium: 'กลาง',
				large: 'ใหญ่',
				mild: 'เผ็ดน้อย',
				medium_spice: 'เผ็ดปานกลาง',
				hot_spice: 'เผ็ด',
				extra_hot: 'เผ็ดมาก'
			}
		},
		cart: {
			title: 'ตะกร้า',
			empty: 'ตะกร้าว่างเปล่า',
			goShopping: 'เลือกซื้อสินค้า',
			total: 'รวม',
			settle: 'ชำระเงิน',
			selected: 'เลือกแล้ว'
		},
		checkout: {
			title: 'ยืนยันคำสั่งซื้อ',
			dineIn: 'ทานที่ร้าน',
			takeaway: 'กลับบ้าน',
			subtotal: 'ราคาสินค้า',
			deliveryFee: 'ค่าจัดส่ง',
			packFee: 'ค่าบรรจุภัณฑ์',
			discount: 'ส่วนลด',
			total: 'ยอดรวม',
			submitOrder: 'สั่งซื้อ',
			selectCoupon: 'เลือกคูปอง',
			noCoupon: 'ไม่มีคูปอง',
			remark: 'หมายเหตุ',
			remarkPlaceholder: 'เพิ่มหมายเหตุ',
			tableNumber: 'หมายเลขโต๊ะ',
			pleaseSelectTable: 'เลือกโต๊ะ'
		},
		payment: {
			title: 'ชำระเงิน',
			waiting: 'รอชำระเงิน',
			success: 'ชำระเงินสำเร็จ',
			failed: 'ชำระเงินไม่สำเร็จ',
			orderTotal: 'ยอดรวม',
			payNow: 'ชำระเลย',
			payAgain: 'ลองอีกครั้ง',
			viewOrder: 'ดูคำสั่งซื้อ',
			backHome: 'กลับหน้าแรก',
			payMethods: {
				wechat: 'WeChat Pay',
				alipay: 'Alipay',
				cash: 'เงินสด'
			}
		},
		order: {
			title: 'คำสั่งซื้อของฉัน',
			all: 'ทั้งหมด',
			pending: 'รอชำระเงิน',
			preparing: 'กำลังทำ',
			ready: 'พร้อมรับ',
			completed: 'เสร็จสิ้น',
			cancelled: 'ยกเลิกแล้ว',
			orderNumber: 'หมายเลขคำสั่งซื้อ',
			orderTime: 'เวลาสั่งซื้อ',
			cancelOrder: 'ยกเลิก',
			reorder: 'สั่งอีกครั้ง',
			cancelSuccess: 'ยกเลิกคำสั่งซื้อแล้ว',
			noOrders: 'ไม่มีคำสั่งซื้อ'
		},
		orderDetail: {
			title: 'รายละเอียดคำสั่งซื้อ',
			orderInfo: 'ข้อมูลคำสั่งซื้อ',
			storeInfo: 'ข้อมูลร้าน',
			paymentInfo: 'ข้อมูลการชำระเงิน',
			orderStatus: 'สถานะ',
			productList: 'รายการสินค้า'
		},
		mine: {
			title: 'ของฉัน',
			memberCenter: 'ศูนย์สมาชิก',
			myCoupons: 'คูปองของฉัน',
			myPoints: 'คะแนนของฉัน',
			myAddress: 'ที่อยู่ของฉัน',
			language: 'ภาษา',
			settings: 'การตั้งค่า',
			feedback: 'ความคิดเห็น',
			aboutUs: 'เกี่ยวกับเรา',
			logout: 'ออกจากระบบ',
			logoutConfirm: 'คุณต้องการออกจากระบบหรือไม่?',
			myFeatures: 'ฟีเจอร์ของฉัน',
			footprint: 'ประวัติ',
			invoice: 'ใบเสร็จ',
			specialCoupon: 'คูปองพิเศษ',
			coupon: 'คูปอง',
			couponCondition: 'ขั้นต่ำ 20 บาท',
			receiveNow: 'รับเลย',
			recommendedStores: 'ร้านแนะนำ',
			enterStore: 'เข้าร้าน',
			monthlySales: 'ขายต่อเดือน',
			score: 'คะแนน'
		},
		login: {
			title: 'เข้าสู่ระบบ',
			notLoggedIn: 'ยังไม่ได้เข้าสู่ระบบ',
			clickToLogin: 'แตะเพื่อเข้าสู่ระบบ',
			phonePlaceholder: 'หมายเลขโทรศัพท์',
			codePlaceholder: 'รหัสยืนยัน',
			getCode: 'รับรหัส',
			resend: 'ส่งอีกครั้ง ({seconds}วินาที)',
			login: 'เข้าสู่ระบบ',
			phoneRequired: 'กรุณากรอกหมายเลขโทรศัพท์',
			phoneInvalid: 'หมายเลขโทรศัพท์ไม่ถูกต้อง',
			codeRequired: 'กรุณากรอกรหัสยืนยัน',
			loginSuccess: 'เข้าสู่ระบบสำเร็จ',
			loginFailed: 'เข้าสู่ระบบไม่สำเร็จ',
			passwordLogin: 'รหัสผ่าน',
			codeLogin: 'รหัสยืนยัน',
			passwordPlaceholder: 'รหัสผ่าน',
			agreementPrefix: 'ฉันยอมรับ',
			terms: 'เงื่อนไขการให้บริการ',
			and: 'และ',
			privacy: 'นโยบายความเป็นส่วนตัว',
			agreementRequired: 'กรุณายอมรับเงื่อนไข'
		},
		settings: {
			title: 'การตั้งค่า',
			accountSettings: 'การตั้งค่าบัญชี',
			generalSettings: 'การตั้งค่าทั่วไป',
			aboutSection: 'เกี่ยวกับ',
			nickname: 'ชื่อผู้ใช้',
			editNickname: 'แก้ไขชื่อผู้ใช้',
			nicknamePlaceholder: 'กรุณากรอกชื่อผู้ใช้',
			avatar: 'รูปโปรไฟล์',
			phone: 'หมายเลขโทรศัพท์',
			changePassword: 'เปลี่ยนรหัสผ่าน',
			notifications: 'การแจ้งเตือน',
			language: 'ภาษา',
			currentLanguage: 'ภาษาไทย',
			cache: 'ล้างแคช',
			cacheClear: 'ล้างแคชแล้ว',
			cacheClearConfirm: 'ล้างแคช?',
			oldPassword: 'รหัสผ่านเดิม',
			newPassword: 'รหัสผ่านใหม่',
			confirmPassword: 'ยืนยันรหัสผ่าน',
			oldPasswordPlaceholder: 'กรุณากรอกรหัสผ่านเดิม',
			newPasswordPlaceholder: 'กรุณากรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัว)',
			confirmPasswordPlaceholder: 'กรุณากรอกรหัสผ่านใหม่อีกครั้ง',
			passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
			passwordTooShort: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
			passwordChanged: 'เปลี่ยนรหัสผ่านสำเร็จ',
			notificationEnabled: 'เปิดการแจ้งเตือนแล้ว',
			notificationDisabled: 'ปิดการแจ้งเตือนแล้ว',
			about: 'เกี่ยวกับเรา',
			privacy: 'นโยบายความเป็นส่วนตัว',
			agreement: 'ข้อตกลงผู้ใช้',
			version: 'เวอร์ชัน',
			logout: 'ออกจากระบบ',
		birthday: 'วันเกิด',
		editBirthday: 'แก้ไขวันเกิด',
		birthdayPlaceholder: 'เลือกวันเกิด',
		birthdaySaveSuccess: 'อัปเดตวันเกิดแล้ว',
		notSet: 'ยังไม่ได้ตั้งค่า'
		},
		language: {
			title: 'การตั้งค่าภาษา',
			zh: '中文',
			en: 'English',
			th: 'ภาษาไทย',
			switchSuccess: 'เปลี่ยนภาษาสำเร็จ'
		},
		message: {
			title: 'ข้อความ',
			noMessages: 'ไม่มีข้อความ',
			system: 'ระบบ',
			promotion: 'โปรโมชั่น',
			order: 'คำสั่งซื้อ',
			markAllRead: 'อ่านทั้งหมดแล้ว',
			allRead: 'ทำเครื่องหมายอ่านแล้วทั้งหมด',
			markReadFailed: 'ทำเครื่องหมายล้มเหลว'
		},
		coupons: {
			title: 'คูปอง',
			available: 'ใช้ได้',
			used: 'ใช้แล้ว',
			expired: 'หมดอายุ',
			receive: 'รับ',
			received: 'รับแล้ว',
			immediateUse: 'ใช้เลย',
			noCoupons: 'ไม่มีคูปอง',
			receiveSuccess: 'รับคูปองสำเร็จ',
			receiveFailed: 'รับคูปองไม่สำเร็จ'
		},
		address: {
			title: 'ที่อยู่ของฉัน',
			add: 'เพิ่มที่อยู่',
			edit: 'แก้ไข',
			delete: 'ลบ',
			default: 'ค่าเริ่มต้น',
			setDefault: 'ตั้งเป็นค่าเริ่มต้น',
			contact: 'ชื่อ',
			contactPlaceholder: 'ชื่อผู้รับ',
			phone: 'โทรศัพท์',
			phonePlaceholder: 'หมายเลขโทรศัพท์',
			address: 'ที่อยู่',
			addressPlaceholder: 'ที่อยู่โดยละเอียด',
			pleaseSelectAddress: 'เลือกที่อยู่',
			save: 'บันทึก',
			deleteConfirm: 'ลบที่อยู่นี้?',
			noAddress: 'ไม่มีที่อยู่',
			getLocation: 'รับตำแหน่ง',
			locating: 'กำลังระบุตำแหน่ง...',
			locationSuccess: 'ระบุตำแหน่งสำเร็จ',
			locationFailed: 'ระบุตำแหน่งไม่สำเร็จ',
			region: 'ภูมิภาค',
			selectRegion: 'เลือกภูมิภาค',
			province: 'จังหวัด',
			city: 'อำเภอ/เขต',
			district: 'ตำบล/แขวง',
			houseNumber: 'หมายเลขบ้าน',
			houseNumberPlaceholder: 'เช่น อาคาร 8 ห้อง 1201',
			label: 'ป้ายกำกับ',
			labelHome: 'บ้าน',
			labelCompany: 'บริษัท',
			labelSchool: 'โรงเรียน',
			labelOther: 'อื่นๆ',
			remark: 'หมายเหตุ',
			remarkPlaceholder: 'เช่น วางไว้หน้าประตู',
			nameRequired: 'กรุณากรอกชื่อ',
			phoneRequired: 'กรุณากรอกเบอร์โทร',
			phoneInvalid: 'หมายเลขโทรศัพท์ไม่ถูกต้อง',
			addressRequired: 'กรุณากรอกที่อยู่',
			saveSuccess: 'บันทึกสำเร็จ',
			saveFailed: 'บันทึกไม่สำเร็จ',
			deleteSuccess: 'ลบสำเร็จ',
			deleteFailed: 'ลบไม่สำเร็จ',
			setDefaultSuccess: 'ตั้งค่าสำเร็จ',
			setDefaultFailed: 'ตั้งค่าไม่สำเร็จ',
			confirmBack: 'ยังไม่ได้บันทึก ย้อนกลับ?'
		},
		points: {
			title: 'คะแนนของฉัน',
			currentPoints: 'คะแนนปัจจุบัน',
			history: 'ประวัติคะแนน',
			earn: 'ได้รับ',
			spend: 'ใช้',
			noHistory: 'ไม่มีประวัติ'
		},
		mall: {
			title: 'ห้าง',
			categories: 'หมวดหมู่',
			hot: 'ขายดี',
			new: 'ใหม่',
			all: 'ทั้งหมด'
		},
		newProducts: {
			title: 'สินค้าใหม่',
			explore: 'สำรวจตอนนี้'
		},
		hotProducts: {
			title: 'ขายดี',
			subtitle: 'ยอดนิยม'
		},
		pointsMall: {
			title: 'แลกคะแนน',
			exchange: 'แลก',
			myPoints: 'คะแนนของฉัน',
			exchangeSuccess: 'แลกสำเร็จ',
			exchangeFailed: 'แลกไม่สำเร็จ',
			pointsNotEnough: 'คะแนนไม่พอ'
		},
		agreement: {
			terms: 'เงื่อนไขการให้บริการ',
			privacy: 'นโยบายความเป็นส่วนตัว',
			about: 'เกี่ยวกับเรา'
		},
		footprint: {
			title: 'ประวัติการเข้าชม',
			products: 'สินค้า',
			stores: 'ร้านค้า',
			searches: 'ค้นหา',
			noProducts: 'ไม่มีประวัติการดูสินค้า',
			noStores: 'ไม่มีประวัติการดูร้านค้า',
			noSearches: 'ไม่มีประวัติการค้นหา',
			goBrowse: 'เลือกซื้อเลย',
			confirmClear: 'ล้างประวัติทั้งหมด?',
			clearSuccess: 'ล้างสำเร็จ'
		},
		member: {
			normal: 'ทั่วไป',
			platinum: 'แพลทินัม',
			normalMember: 'สมาชิกทั่วไป',
			platinumMember: 'สมาชิกแพลทินัม',
			platinumBenefit: 'ของขวัญวันเกิดสำหรับแพลทินัม',
			consumption: 'ใช้จ่าย',
			upgrade: 'อัปเกรด',
			upgradeTip: 'ใช้จ่ายต่อเพื่ออัปเกรดเป็นแพลทินัม',
			balance: 'ยอดเงิน',
			points: 'คะแนน',
			newUserPack: 'แพ็คใหม่',
			pointsExchange: 'แลกคะแนน',
			balanceExchange: 'แลกเงิน',
			exchange: 'แลก',
			exchangeConfirm: 'ยืนยันการแลก',
			exchangeSuccess: 'แลกสำเร็จ',
			exchangeFor: 'เพื่อ',
			use: 'ใช้',
			pointsNotEnough: 'คะแนนไม่พอ',
			balanceDetail: 'รายละเอียดยอดเงิน'
		},
		upgrade: {
			congratulations: 'ยินดีด้วย',
			becomePlatinum: 'คุณได้อัปเกรดเป็นสมาชิกแพลทินัม',
			from: 'จากระดับ',
			to: 'สู่ระดับ',
			enjoyNow: 'เพลิดเพลินเลย',
			benefitBirthday: 'ของขวัญวันเกิดพิเศษ',
			benefitDiscount: 'ส่วนลดพิเศษ',
			benefitPriority: 'สิทธิพิเศษจองล่วงหน้า'
		}
	}
}

const LANGUAGE_KEY = 'siamfeast_language'

const i18n = {
	state: {
		language: 'zh',
		messages: messages
	},

	/**
	 * 初始化语言
	 */
	init() {
		try {
			const savedLang = uni.getStorageSync(LANGUAGE_KEY)
			if (savedLang && messages[savedLang]) {
				this.state.language = savedLang
			}
		} catch (e) {
			console.error('i18n init error:', e)
		}
	},

	/**
	 * 获取当前语言
	 * @returns {string}
	 */
	getLanguage() {
		return this.state.language
	},

	/**
	 * 设置语言
	 * @param {string} lang - zh | en | th
	 */
	setLanguage(lang) {
		if (messages[lang]) {
			this.state.language = lang
			try {
				uni.setStorageSync(LANGUAGE_KEY, lang)
			} catch (e) {
				console.error('setLanguage error:', e)
			}
		}
	},

	/**
	 * 获取翻译文本
	 * @param {string} key - 点分隔的键名，如 'index.dineIn'
	 * @param {object} params - 替换参数，如 { count: 5 }
	 * @returns {string}
	 */
	t(key, params = {}) {
		const keys = key.split('.')
		let value = messages[this.state.language]

		for (const k of keys) {
			if (value && typeof value === 'object') {
				value = value[k]
			} else {
				return key
			}
		}

		if (typeof value !== 'string') {
			return key
		}

		// 替换参数
		let result = value
		Object.keys(params).forEach(paramKey => {
			result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey])
		})

		return result
	},

	/**
	 * 获取所有语言列表
	 * @returns {Array}
	 */
	getLanguages() {
		return [
			{ code: 'zh', name: '中文', nativeName: '中文' },
			{ code: 'en', name: 'English', nativeName: 'English' },
			{ code: 'th', name: 'Thai', nativeName: 'ภาษาไทย' }
		]
	}
}

// 初始化
i18n.init()

export default i18n
