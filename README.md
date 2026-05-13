# SiamFeast C端 (消费者端)

泰式餐饮民宿一体化平台的消费者端应用，基于 uni-app (Vue 3 + Vite) 构建，支持 H5 / 微信小程序 / App 多端发布。

## 功能模块

| 模块 | 说明 |
|------|------|
| 首页 | 门店选择、堂食/商城入口、新品/热销推荐、会员卡片 |
| 堂食点餐 | 分类菜单、购物车、规格选择、下单结算 |
| 商城 | 商品分类浏览、搜索、商品详情 |
| 拼团 | 拼团商品列表、拼团详情、参与拼团、分享链接 |
| 优惠专区 | 折扣商品浏览、优惠活动展示 |
| 订单 | 订单列表（多类型）、订单详情、再来一单 |
| 结算 | 堂食/外卖切换、地址选择、优惠券、金币抵扣、备注 |
| 民宿 | 客房浏览、日期选择、在线预订、入住人信息 |
| 会员中心 | 等级展示（普通/铂金）、消费进度、金币/积分/优惠券 |
| 积分商城 | 积分兑换优惠券、金币兑换 |
| 优惠券 | 我的优惠券（可用/已用/已过期/使用中）、领券中心 |
| 登录/注册 | 手机号验证码登录、密码登录、国家/地区选择 |
| 个人设置 | 用户名、头像、生日、语言切换、修改密码 |

## 技术栈

- **框架**: uni-app (Vue 3 Options API)
- **构建**: Vite
- **多语言**: 自研 i18n 方案，支持中文 / English / ภาษาไทย
- **地图**: Google Maps 组件（门店定位、地址选择）
- **图片**: MinIO 对象存储

## 项目结构

```
├── api/                  # API 接口层
│   ├── config.js         #   接口地址配置
│   ├── request.js        #   请求封装（统一拦截、错误处理）
│   └── services/         #   各业务模块 API
│       ├── auth.js       #   登录注册
│       ├── order.js      #   订单
│       ├── products.js   #   商品
│       ├── groupbuy.js   #   拼团
│       ├── hostel.js     #   民宿
│       ├── member.js     #   会员
│       ├── coupon.js     #   优惠券
│       ├── store.js      #   门店
│       ├── payment.js    #   支付
│       └── ...
├── components/           # 公共组件
│   └── google-map.vue    #   Google 地图组件
├── i18n/                 # 国际化
│   └── index.js          #   三语言文案（zh/en/th）
├── pages/                # 页面
│   ├── index/            #   首页
│   ├── dinein/           #   堂食点餐
│   ├── mall/             #   商城
│   ├── products/         #   商品列表
│   ├── product-detail/   #   商品详情
│   ├── checkout/         #   结算
│   ├── order/            #   订单列表
│   ├── order-detail/     #   订单详情
│   ├── group/            #   拼团列表
│   ├── group-detail/     #   拼团详情
│   ├── discount/         #   优惠专区
│   ├── hostel/           #   民宿预订
│   ├── member/           #   会员中心
│   ├── points-mall/      #   积分商城
│   ├── coupons/          #   优惠券列表
│   ├── login/            #   登录
│   ├── settings/         #   设置
│   └── ...
├── store/                # 状态管理
│   └── index.js          #   门店选择、用户信息
├── utils/                # 工具函数
│   └── index.js          #   URL处理、错误码映射、通用工具
├── static/               # 静态资源（图标、图片）
├── App.vue               # 应用入口
├── main.js               # 主入口
├── pages.json            # 页面路由配置
├── manifest.json         # 应用配置
├── uni.scss              # 全局样式变量
└── vite.config.js        # Vite 构建配置
```

## 开发

```bash
# 安装依赖
npm install

# 启动 H5 开发服务器
npm run dev:h5

# 构建生产版本
npm run build:h5
```

## 后端对接

后端 API 基地址在 `api/config.js` 中配置，支持开发/生产环境切换。所有接口通过 `api/request.js` 统一封装，自动处理 token、错误码国际化。
