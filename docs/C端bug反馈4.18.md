# SiamFeast 后端 API 补充说明

---

## 1. 用户信息接口 - birthday 字段

> **状态：已修复** - 后端已支持 `birthday` 字段的读取和持久化（测试于 2026-04-17 通过）

### 接口现状

- `GET /api/v1/users/me` — 返回中已包含 `birthday` 字段（可为 `null`）
- `PUT /api/v1/users/me` — 已能正确持久化 `birthday`，格式 `YYYY-MM-DD`

### 验证结果

```
GET  /users/me              → birthday: null
PUT  /users/me {birthday:"1995-06-15"}  → birthday: "1995-06-15"
GET  /users/me (again)      → birthday: "1995-06-15"  ✓ 已持久化
```

### 字段规格

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `birthday` | `string` (nullable) | 否 | 出生日期，格式 `YYYY-MM-DD`，最大值为当天日期 |

### 前端实现位置

- 设置页面：`pages/settings/index.vue`，"手机号"与"修改密码"之间
- 日期选择：H5 使用原生 `<input type="date">`，最大日期限制为当天
- 本地缓存：`store.setUserInfo` 备份，即使 PUT 失败也不丢失
- 多语言：中文/英文/泰文翻译已完成

---

## 2. 优惠券接口

### 接口现状

| 接口 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 我的优惠券 | `GET /coupons/my` | 正常 | 返回用户已领取的优惠券，含嵌套 `template` 对象 |
| 可领取优惠券 | `GET /campaigns/coupons` | 正常 | 返回优惠券模板列表 |
| 领取优惠券 | `POST /coupons/receive` | 正常 | body: `{ template_id: number }` |
| 下单可用券 | `GET /coupons/available` | 正常 | 接受 `store_id`, `amount`, `order_type` 参数，返回可用优惠券 |

### 关键数据结构

**我的优惠券 (`/coupons/my`) 返回格式：**
```json
{
  "id": 7,
  "user_id": 13,
  "template_id": 3,
  "coupon_code": "CP62F3DE0A50E4",
  "status": "UNUSED",
  "valid_start": "2026-04-16T15:07:22",
  "valid_end": "2026-05-16T15:07:22",
  "template": {
    "name": "test",
    "coupon_type": "FULL_REDUCTION",
    "discount_type": "FIXED",
    "discount_value": 10.0,
    "min_order_amount": 50.0,
    "valid_days": 30,
    "coupon_tag": "DINE_IN",
    "description": "test",
    "applicable_categories": ["SEAFOOD_NOODLE", "HOTPOT_BUFFET"]
  }
}
```

**可领取券 (`/campaigns/coupons`) 返回格式：**
```json
{
  "id": 3,
  "name": "test",
  "discount_value": 10.0,
  "min_order_amount": 50.0,
  "coupon_tag": "DINE_IN",
  "valid_days": 30,
  "total_quantity": 100,
  "claimed_quantity": 1,
  "per_user_limit": 1,
  "is_newbie_pack": false
}
```

### `coupon_tag` 枚举值

| 值 | 含义 |
|----|------|
| `DINE_IN` | 仅限堂食 |
| `DELIVERY` | 仅限外卖 |
| `GENERAL` | 通用 |

---

## 3. 民宿模块

### 前端架构

民宿页面 `pages/hostel/index.vue` 采用 **1+N 动态 Tab** 设计：Tab 0 固定为客房，其余 Tab 从后端 `GET /menu/{storeId}/categories` 动态生成，与其他餐饮店使用相同的分类和商品接口。

```
民宿页面
├── Tab 0: 客房（固定，独立接口）
│   ├── 日期选择器（入住/退房，美团风格日历弹窗，6个月范围）
│   ├── 房间列表 GET /hostels/rooms/{storeId}
│   └── 预订 → /pages/hostel/booking → POST /hostels/bookings
│
└── Tab 1..N: 动态分类（从 GET /menu/{storeId}/categories 获取）
    ├── Tab 名称 = 分类名称（如"泰式菜"、"饮品"、"甜品"等）
    ├── 商品列表 = 按 category_id 过滤 GET /menu/{storeId}/items 的结果
    ├── 加入购物车（前端状态）
    └── 去结算 → /pages/checkout/index（通用结算页）
```

### 接口使用汇总

| 功能 | 接口 | 来源 |
|------|------|------|
| 店铺详情 | `GET /stores/{storeId}` | 通用门店接口 |
| 商品分类 | `GET /menu/{storeId}/categories` | 通用菜单接口 |
| 商品列表 | `GET /menu/{storeId}/items` | 通用菜单接口 |
| 客房列表 | `GET /hostels/rooms/{storeId}` | 民宿专用 |
| 创建预订 | `POST /hostels/bookings` | 民宿专用 |
| 商品下单 | 通用 checkout 页 → `POST /orders` | 通用订单接口 |

### Tab 动态生成逻辑

1. 页面初始化时 `tabs` 仅包含 `[{ name: '客房', key: 'room' }]`
2. `loadMenuData()` 并行请求店铺详情、分类、商品列表
3. 分类接口返回后，动态追加 Tab：`tabs = [{客房}, ...categories.map(c => ({ name: c.name }))]`
4. `currentProducts` 计算属性根据 `activeTab - 1` 索引找到对应分类 ID，过滤 `allProducts`
5. 购物车浮窗仅在 `activeTab > 0`（非客房 Tab）且有商品时显示

### 预订流程（客房）

1. 用户选择入住/退房日期（美团风格日历弹窗，6个月范围）
2. 选择房间 → 点击"预订"
3. 跳转 `pages/hostel/booking` 预订确认页
4. 填写入住人信息（姓名、手机、证件号、入住人数）
5. 费用 = 房价 × 晚数 + 押金
6. 提交 → `POST /hostels/bookings`

**预订接口请求格式：**
```json
POST /hostels/bookings
{
  "store_id": 8,
  "room_id": 1,
  "order_source": "HOSTEL_ROOM_SERVICE",
  "extra_data": {
    "check_in_date": "2026-04-20",
    "check_out_date": "2026-04-22",
    "guest_count": 2,
    "deposit_amount": 0,
    "guest_info": {
      "name": "张三",
      "phone": "0881234567",
      "id_number": ""
    }
  }
}
```

### 页面路由

| 入口 | 目标 | 参数 |
|------|------|------|
| 商城民宿卡片 | `/pages/hostel/index` | `storeId`, `shopId` |
| 客房预订按钮 | `/pages/hostel/booking` | `roomId`, `roomName`, `roomPrice`, `checkIn`, `checkOut`, `nights`, `storeId`, `storeName`, `capacity` |
| 商品结算 | `/pages/checkout/index` | `storeId`, `order_type=dinein`, `cart_items` (JSON) |

### 民宿专用 API 文件

完整接口定义在 `api/services/hostel.js`，包含：
- 房型 CRUD：`GET /pricing/room-types`
- 客房管理：`GET /hostels/rooms/{storeId}`, `GET /hostels/rooms/{storeId}/available`
- 日历定价：`GET /hostels/calendar/{storeId}`, `POST /pricing/calendar`
- 预订管理：`POST /hostels/bookings`, `PUT /hostels/bookings/{id}/confirm|cancel|complete`
- 入住/退房：`POST /hostels/bookings/check-in`, `POST /hostels/bookings/check-out`
- 入住码验证：`POST /hostels/bookings/{id}/verify-check-in-code`
- 客房收费：`GET /hostels/bookings/{id}/charges`, `POST /hostels/bookings/{id}/charges`
- 假日规则：`GET /pricing/holidays`

---

## 4. 用户头像上传接口（2026-04-18）

> **状态：已实现** — 后端 `POST /uploads/avatar` 已上线（2026-04-18 验证通过）

### 接口信息

#### `POST /api/v1/uploads/avatar`

上传用户头像图片，上传成功后自动更新 `user.avatar_url`。

**请求格式**：`multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | `file` | 是 | 头像图片文件，支持 JPEG/PNG/WebP，最大 2MB |

**请求头**：需携带 `Authorization: Bearer <token>`

**权限**：`CurrentUser`（C端用户登录即可）

**成功响应**：

```json
{
  "code": 0,
  "message": "头像上传成功",
  "data": {
    "url": "http://106.12.91.224:9000/sf-uploads/USER_AVATAR/2026/04/137719475189.jpg"
  }
}
```

### 后端行为

1. 校验文件格式（JPEG/PNG/WebP）和大小（≤ 2MB）
2. 调用 `UploadService.upload_bytes` 上传至 MinIO，file_type 为 `USER_AVATAR`
3. **自动更新** `user.avatar_url` 为新文件 URL（无需前端再调 PUT /users/me）

### 存储规范

- 存储路径：`sf-uploads/USER_AVATAR/{YYYY}/{MM}/{随机文件名}.{ext}`
- 与店铺 logo 上传格式一致（参考 `STORE_LOGO` 路径）

### 前端调用流程

1. 用户点击头像 → `uni.chooseImage({ count: 1 })` 选择图片
2. 调用 `POST /uploads/avatar` 上传文件
3. 上传成功后调用 `GET /users/me` 获取最新用户信息（含新 avatar_url）
4. 更新本地缓存和三个页面显示（首页、会员页、设置页）

### 注意事项

- 本地开发环境返回的 MinIO URL 为 `localhost:9000`，部署到生产服务器后会自动使用正确的域名/IP

