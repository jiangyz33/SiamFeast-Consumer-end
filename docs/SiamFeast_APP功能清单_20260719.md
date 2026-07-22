# SiamFeast C 端 APP 功能清单

> 项目:SiamFeast(泰国餐饮 APP)
> 平台:Android(APP-PLUS)+ H5 + 微信小程序(降级)
> 技术栈:UniApp + Vue 3 + Vite
> 版本:1.0.9(versionCode 109)
> 文档日期:2026-07-19

---

## 模块总览

| # | 模块 | 主要页面 | 关键功能 |
|---|---|---|---|
| 1 | 用户认证 | login/, sms/, settings/ | 邮箱/密码/Google 登录 |
| 2 | 首页 | index/ | 轮播图、推荐商品、附近门店 |
| 3 | 门店 | store-select/, dinein/, dinein-stores/, hostel/ | 堂食/外带门店列表 |
| 4 | 商品 | products/, product-detail/, hot-products/, new-products/ | 商品浏览、详情、热销、新品 |
| 5 | 购物车与下单 | checkout/, payment-success/ | 下单流程、金币抵扣 |
| 6 | 订单管理 | order/, order-detail/ | 订单列表、详情、再来一单 |
| 7 | 会员中心 | member/, member-code/ | 等级、消费进度、会员码 |
| 8 | 金币/积分 | points-mall/, mall/, exchange-success/ | 金币兑换、积分商城 |
| 9 | 优惠券 | coupons/, claim-coupons/ | 我的优惠券、领券中心 |
| 10 | 消息中心 | message/ | 系统消息、未读数 |
| 11 | 个人设置 | settings/, address/, agreement/ | 资料编辑、协议、地址 |
| 12 | 推广分享 | referral/, share-modal/ | 邀请码、分享 |
| 13 | 国际化 | i18n/ | 中英泰三语 |
| 14 | 公共组件 | components/ | TabBar、按钮、地图等 |
| 15 | 启动与升级 | splash/, upgrade-animation/ | 启动页、版本升级 |

---

## 1. 用户认证模块

### 1.1 登录页(`/pages/login/index`)
- **邮箱 + 密码登录**(主推):E.164 手机号 + 密码,自动加国家码
- **Google 登录**:HBuilderX 内置 OAuth SDK,需要自定义基座
- **邮箱验证码登录**:跳转到 verify 页
- **短信验证码登录**(暂隐藏):跳转到 sms 页,等后端配 Twilio
- **去注册**:跳转到 register 页
- **国家码选择**:13 个国家(泰/中/港/澳/台/新/马/美/越/柬/老/缅/印尼)
- **协议勾选**:必须勾选隐私政策 + 用户协议才能登录

### 1.2 短信验证码登录页(`/pages/login/sms`)
- 国家码选择
- 手机号输入
- **60 秒倒计时**的发送验证码按钮
- 6 位验证码输入
- **登录即注册**:首次登录自动创建账号,跳到完善信息页

### 1.3 邮箱验证码登录页(`/pages/login/verify`)
- 手机号 + 邮箱输入
- 后端发码到邮箱
- 验证通过后登录/注册

### 1.4 工具函数
- `utils/oauth.js` - HBuilderX 内置 OAuth 封装(Google/Facebook)
- `utils/sms.js` - 后端自建 SMS 服务封装

---

## 2. 首页模块(`/pages/index/index`)

### 2.1 主要内容
- **轮播图(Banner)**:点击可看大图详情(支持多图 swiper)
- **门店切换**:显示当前门店,可切换
- **分类入口**:堂食、外带、新品、热销
- **会员信息卡**:等级、消费进度
- **新品尝鲜** + **热销榜单** 商品列表
- **底部 TabBar**:首页、订单、会员、消息、设置

### 2.2 关键交互
- 未登录自动跳登录页
- Banner 点击弹窗显示 detail_images
- 切换语言后多语言刷新(langVersion 触发)
- 进入页面自动加载会员数据 + 未读消息数

---

## 3. 门店模块

### 3.1 门店选择(`/pages/store-select/index`)
- 定位附近门店(基于经纬度)
- 门店列表(堂食 / 外带分类)
- 营业时间、距离、地址

### 3.2 堂食门店(`/pages/dinein-stores/index`)
- 仅显示堂食门店
- 扫码点餐入口
- 显示堂食专属优惠

### 3.3 堂食详情(`/pages/dinein/index`)
- 桌号扫码进入
- 当前桌号显示
- 堂食菜单(海鲜面、麻辣烫、火锅等)

### 3.4 外带/配送(`/pages/hostel/`)
- 暂未启用(预留)

### 3.5 地图组件
- `components/google-map.vue` - Google Maps 嵌入
- 显示门店位置标记
- 定位用户当前位置

---

## 4. 商品模块

### 4.1 全部商品(`/pages/products/index`)
- 分类筛选
- 排序(销量、价格、新品)
- 搜索(支持店名/商品名)

### 4.2 商品详情(`/pages/product-detail/index`)
- 商品图片轮播
- 描述、规格、价格
- 加入购物车
- 立即下单
- **金币抵扣预览**(调后端接口)

### 4.3 热销榜单(`/pages/hot-products/index`)
- 显示热销商品(后端按销量排序)
- 支持按门店筛选
- 商品搜索

### 4.4 新品上市(`/pages/new-products/index`)
- 显示最新上架商品
- 支持按门店筛选
- "新"标签

---

## 5. 购物车与下单模块

### 5.1 结算页(`/pages/checkout/index`)
- 订单商品列表
- 优惠券选择(堂食可用)
- **金币抵扣**(后端 A 算法,本地 cap = min(used_coins, balance))
- 配送方式(堂食/外带)
- 备注
- 总价计算
- 提交订单

### 5.2 支付成功(`/pages/payment-success/index`)
- 显示支付结果
- 订单号
- 跳转到订单详情
- 返回首页

---

## 6. 订单管理模块

### 6.1 订单列表(`/pages/order/index`)
- 状态筛选 Tab:
  - 全部
  - 待支付(PENDING_PAYMENT)
  - 已完成(COMPLETED)
  - 兑换订单(EXCHANGE)
- 订单卡片(状态、商品、价格)
- "再来一单"按钮(PAID/PREPARING/READY/COMPLETED 状态可点)
- 下拉刷新

### 6.2 订单详情(`/pages/order-detail/index`)
- 订单状态
- 商品列表
- 价格明细(商品总价、金币抵扣、优惠券、实付)
- 订单号、下单时间
- 配送信息
- **底部固定操作栏**:联系商家、再来一单
- 取消订单(仅待支付状态)

---

## 7. 会员中心模块

### 7.1 会员主页(`/pages/member/index`)
- 会员等级(REGULAR/SILVER/GOLD/PLATINUM/DIAMOND)
- **等级进度条**(已消费 / 下一等级阈值)
- 统计卡片:
  - 余额
  - 积分
  - 优惠券数
- 功能入口:
  - 我的订单
  - 优惠券
  - 地址管理(已隐藏,仅堂食)
  - 设置
- **会员码**(会员二维码)
- **等级升级动画**(升级时弹窗)

### 7.2 会员码(`/pages/member-code/index`)
- 显示会员二维码
- 门店扫码识别会员

---

## 8. 金币/积分模块

### 8.1 金币兑换(`/pages/mall/index`)
- 金币余额
- 兑换商品列表
- 兑换记录
- 金币 / 积分 Tab 切换

### 8.2 积分商城(`/pages/points-mall/index`)
- 积分余额
- 积分商品列表
- 兑换记录
- 金币 / 积分 Tab 切换

### 8.3 兑换成功(`/pages/exchange-success/index`)
- 显示兑换结果
- 兑换码/凭证
- 返回商城

---

## 9. 优惠券模块

### 9.1 我的优惠券(`/pages/coupons/index`)
- 状态 Tab:未使用、已使用、已过期
- 优惠券卡片(面值、门槛、有效期)
- 堂食 / 外带适用性
- 跳转到可用商品

### 9.2 领券中心(`/pages/claim-coupons/index`)
- 可领取的优惠券列表
- 一键领取
- 已领取状态

---

## 10. 消息中心模块(`/pages/message/index`)

- 消息列表(系统通知、订单通知、活动通知)
- 已读 / 未读
- 未读数显示(首页 TabBar 红点)
- 消息详情(支持图片、链接)
- 删除消息

---

## 11. 个人设置模块

### 11.1 设置主页(`/pages/settings/index`)
- 头像上传(`chooseSystemMedia` 插件,Android 13+ 走 Photo Picker)
- 昵称编辑
- 性别、生日
- 邮箱、手机号
- 修改密码
- 通知设置(开关)
- 语言切换(中英泰)
- 关于我们
- 隐私政策、用户协议
- 退出登录

### 11.2 地址管理(`/pages/address/index`)
- **当前隐藏**(项目只做堂食,无外送)
- 预留页面

### 11.3 协议页(`/pages/agreement/index`)
- 隐私政策
- 用户协议
- 中英泰三语

---

## 12. 推广分享模块

### 12.1 推荐中心(`/pages/referral/index`)
- 我的邀请码
- 邀请记录
- 邀请奖励(返利明细)
- 分享按钮

### 12.2 分享组件(`components/share-modal.vue`)
- 分享到微信/QQ/复制链接
- **多语言分享文案**(根据当前语言)
- 生成分享链接(带 invite_code 参数)

---

## 13. 国际化模块

### 13.1 三语支持(`i18n/`)
- **简体中文**(zh)
- **英文**(en)
- **泰文**(th)

### 13.2 切换机制
- `i18n/index.js` - 全局 i18n 单例
- `langVersion` 状态触发响应式刷新(uni-app 兼容)
- 切换语言后所有页面文案实时刷新
- 设置页、登录页、首页都能切换语言

### 13.3 服务端兼容
- 请求头 `Accept-Language` 自动带当前语言
- 后端返回的错误消息支持 i18n
- 门店/商品名称多语言字段(`name_zh/name_en/name_th`)

---

## 14. 公共组件库(`components/`)

### 14.1 基础组件
- **CButton.vue** - 自定义按钮(支持 loading/disabled)
- **CInput.vue** - 自定义输入框(支持图标、验证)
- **CodeInput.vue** - 6 位验证码输入框

### 14.2 业务组件
- **CSocialButtons.vue** - 第三方登录按钮(Google/Facebook)
- **custom-tabbar.vue** - 自定义底部 TabBar(替换原生)
- **banner-detail-modal.vue** - 轮播图详情弹窗(多图 swiper)
- **language-modal.vue** - 语言切换弹窗
- **share-modal.vue** - 分享弹窗
- **upgrade-animation.vue** - 会员升级动画
- **google-map.vue** - Google Maps 地图组件

---

## 15. 启动与升级模块

### 15.1 启动页(`/pages/splash/index`)
- 应用启动时显示
- 加载用户数据
- 检查登录态
- 跳转到登录页或首页

### 15.2 启动配置
- `App.vue` - 应用生命周期(onLaunch/onShow/onHide)
- `manifest.json` splashscreen 配置
- 启动图:`static/images/06_banner_01.png`

### 15.3 升级流程
- 检测版本更新
- 显示升级动画
- 引导用户更新

---

## 16. 其他辅助模块

### 16.1 全局工具(`utils/`)
- `request.js` - 网络请求封装(支持 401 自动 refresh)
- `config.js` - API 配置(开发/生产环境自动判断)
- `share.js` - 分享链接解析
- `index.js` - 通用工具函数(格式化、验证等)
- `setPageTitle.js` - 动态设置页面标题
- `firebase.js` - Firebase 相关(已禁用,保留 stub)
- `oauth.js` - HBuilderX 内置 OAuth 封装
- `sms.js` - 后端自建 SMS 服务封装

### 16.2 API 服务(`api/services/`)
- `auth.js` - 认证(登录、注册、token 刷新)
- `user.js` - 用户信息
- `order.js` - 订单
- `product.js` - 商品
- `store.js` - 门店
- `coupon.js` - 优惠券
- `member.js` - 会员
- `notification.js` - 消息
- `referral.js` - 推广

### 16.3 状态管理(`store/`)
- `index.js` - 全局 store(单例对象)
- 状态:token、userInfo、currentStore、cart 等

---

## 17. 平台特性

### 17.1 Android(主推)
- 包名:`com.nationalworld.siamfeast`
- minSdk:21
- targetSdk:35
- 签名:自有 keystore(`siamfeast.keystore`)
- 第三方登录:HBuilderX 内置 OAuth(Google)
- 头像上传:Android 系统 Photo Picker(`uni-chooseSystemImage` 插件)
- Google Maps 嵌入
- 自定义调试基座(必须,因为用了 OAuth SDK)

### 17.2 iOS(预留)
- Bundle ID:`com.nationalworld.siamfeast`
- 需要 Apple Developer 账号($99/年)
- Apple 登录(iOS 必须)
- 未实际打包

### 17.3 H5(开发调试)
- 域名:h5.siamfeast.com(规划)
- 走 vite dev server + proxy
- 不支持 Google/Apple 原生登录
- 头像上传走浏览器 file input

### 17.4 微信小程序(降级支持)
- 代码兼容,未实际发布
- 不支持 OAuth/Maps

---

## 18. 后端依赖接口

### 18.1 已就绪
- `POST /auth/login` - 手机号密码登录
- `POST /auth/email-code` / `/auth/email-login` - 邮箱验证码登录
- `POST /auth/refresh` - token 刷新
- `POST /auth/google-login` - Google OAuth(openid 模式)
- `POST /auth/facebook-login` - Facebook OAuth(后端已就绪,前端暂未启用)
- `POST /auth/sms/send` / `/auth/sms/login` - 短信验证码(后端已就绪,前端暂未启用)
- `GET /users/me` - 用户信息
- `PATCH /users/me` - 更新资料
- `POST /uploads/avatar` - 头像上传
- `GET /stores` / `GET /stores/:id` - 门店
- `GET /products` / `GET /products/:id` - 商品
- `POST /orders` - 下单
- `GET /orders` / `GET /orders/:id` - 订单
- `POST /coupons/claim` - 领券
- `GET /coupons` - 我的优惠券
- `GET /notifications/unread-count` - 未读消息数
- `GET /referrals` - 推广记录
- `POST /referrals/bind` - 绑定邀请码
- `GET /mall/redeem-preview` - 金币抵扣预览
- `POST /mall/redeem` - 兑换商品

### 18.2 待配置
- ⬜ Twilio 短信凭证(运维提供)
- ⬜ Apple 登录后端接口(iOS 上架时启用)

---

## 19. 已知限制

### 19.1 Firebase 集成
- ❌ Firebase UTS 插件**未启用**(UTS 编译器 bug + 试用品限制)
- ❌ Firebase Phone Auth 不可用
- ✅ 改用后端自建 OAuth + SMS 方案

### 19.2 第三方登录
- ✅ Google 登录可用(HBuilderX 内置 OAuth,openid 模式)
- ❌ Facebook 登录暂隐藏(避免 Facebook SDK 注入媒体权限)
- ❌ Apple 登录待 iOS 上架时启用
- ❌ LINE 登录未集成(泰国用户主推但暂不做)

### 19.3 Google Play 政策
- ⚠️ DCloud SDK 强制注入 `READ_MEDIA_IMAGES` 等权限,无法通过 manifest.json 移除
- ✅ 代码用 `uni-chooseSystemImage` 走系统 Photo Picker(符合政策)
- 📋 上架需在 Google Play Console 填权限声明表单

---

## 20. 维护与扩展

### 20.1 添加新页面
1. 在 `pages/` 下新建目录
2. 在 `pages.json` 注册路由
3. 如需进入 TabBar,在 `pages.json` 的 tabBar 配置添加

### 20.2 添加新 API
1. 在 `api/services/` 对应文件加函数
2. 用 `import { post, get } from '@/api/request.js'` 调用
3. 返回结构统一 `{ code, message, data }`

### 20.3 添加新语言
1. 在 `i18n/locales/` 新建语言文件(如 `ja.js`)
2. 在 `i18n/index.js` 注册
3. 在 `pages/login/index.vue` 等切换组件添加选项

### 20.4 版本升级
1. `manifest.json` 更新 `versionName` + `versionCode`
2. git commit: `chore: bump version to X.X.X`
3. HBuilderX 云打包(用相同 keystore)
4. 上传 Google Play Console
5. 内部测试 → 正式发布

---

## 附录:技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| UniApp | 5.0 | 跨端框架 |
| Vue | 3.x | 视图层 |
| Vite | - | 构建工具 |
| HBuilderX | 4.x | IDE + 云打包 |
| i18n | 自研 | 国际化 |
| Store | 自研单例 | 状态管理 |
| Google Maps | JS API | 地图 |
| Twilio(待配) | - | 短信服务 |

---

**文档维护**:前端 jiangyz33
**最后更新**:2026-07-19
