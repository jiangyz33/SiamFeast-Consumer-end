# SiamFeast C 端接口文档

> 版本：v1.0 / 2026-05-10 | Base URL：`/api/v1` | consumer-api 端口：8082

---

## 通用约定

### 认证

公开接口无需认证。消费者接口需在 Header 携带：

```
Authorization: Bearer <access_token>
```

### 分页

列表接口统一支持 `page`（默认 1）和 `page_size`（默认 20），返回格式：

```json
{
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
}
```

### 错误响应

```json
{"code": "ERROR_CODE", "message": "错误描述", "detail": "可选详情"}
```

---

## 一、认证（Auth）

### 1.1 临时登录

```
POST /auth/temp-login
```

无需 token。

请求体：

```json
{"phone": "+6612345678", "password": "123456"}
```

响应 `200`：

```json
{
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 12960000,
    "role": "consumer",
    "user_id": 550,
    "user": {"id": 550, "nickname": "User_5678", "phone": "+6612345678", "avatar_url": null}
}
```

### 1.2 开发者登录（仅 dev 环境）

```
POST /auth/dev-login
```

请求体：

```json
{"phone": "+6612345678"}
```

响应同 1.1。

### 1.3 短信验证码

```
POST /auth/sms-code
```

请求体：

```json
{"phone": "+6612345678"}
```

响应 `200`：

```json
{"message": "sent"}
```

### 1.4 短信登录

```
POST /auth/sms-login
```

请求体：

```json
{"phone": "+6612345678", "code": "123456"}
```

响应同 1.1。

### 1.5 刷新 Token

```
POST /auth/refresh
```

请求体：

```json
{"refresh_token": "eyJ..."}
```

响应：

```json
{"access_token": "eyJ...", "token_type": "bearer", "expires_in": 12960000}
```

---

## 二、门店浏览（Store）

### 2.1 附近门店

```
GET /stores/nearby?lat=13.7563&lng=100.5018&radius=5&page=1&page_size=20
```

公开，无需 token。

响应 `200`（分页）：

```json
{
    "items": [
        {
            "id": 1,
            "name": "曼谷金汤火锅·麻辣烫店",
            "name_en": "Bangkok Golden Soup",
            "address": "123 Sukhumvit Rd",
            "phone": "+6621234567",
            "latitude": 13.7563,
            "longitude": 100.5018,
            "logo_url": "https://...",
            "cover_url": "https://...",
            "business_types": ["SEAFOOD_NOODLE", "MALA_TANG"],
            "is_active": true,
            "distance": 1.2
        }
    ],
    "total": 5, "page": 1, "page_size": 20, "total_pages": 1
}
```

### 2.2 门店详情

```
GET /public/stores/:id
```

公开。

响应 `200`：

```json
{
    "id": 1,
    "name": "曼谷金汤火锅·麻辣烫店",
    "name_en": "Bangkok Golden Soup",
    "description": "...",
    "description_en": "...",
    "address": "123 Sukhumvit Rd",
    "phone": "+6621234567",
    "latitude": 13.7563,
    "longitude": 100.5018,
    "logo_url": "https://...",
    "cover_url": "https://...",
    "business_types": ["SEAFOOD_NOODLE", "MALA_TANG"],
    "opening_hours": "10:00-22:00",
    "is_active": true,
    "rating": 4.5,
    "tags": ["火锅", "麻辣烫"]
}
```

### 2.3 门店列表（认证后）

```
GET /stores?page=1&page_size=20
```

需 consumer token。返回同 2.1 格式。

### 2.4 门店可配送性检查

```
GET /stores/:store_id/serviceability?lat=13.7563&lng=100.5018
```

公开。

响应 `200`：

```json
{"deliverable": true, "estimated_minutes": 30}
```

### 2.5 门店菜单

```
GET /stores/:store_id/menu
```

公开。

响应 `200`：

```json
{
    "store": {"id": 1, "name": "..."},
    "categories": [
        {
            "id": 1,
            "name": "招牌推荐",
            "name_en": "Signature",
            "items": [
                {
                    "id": 3007,
                    "name": "曼谷金汤 招牌套餐",
                    "name_en": "Demo Item 1",
                    "price": 97,
                    "image_url": "https://...",
                    "is_available": true,
                    "description": "..."
                }
            ]
        }
    ]
}
```

### 2.6 位置解析

```
POST /locations/resolve
```

请求体：

```json
{"latitude": 13.7563, "longitude": 100.5018}
```

响应 `200`：

```json
{"address": "Sukhumvit Rd, Bangkok", "district": "Watthana", "province": "Bangkok"}
```

### 2.7 经营品类列表

```
GET /business-types
```

公开。

响应 `200`：

```json
[
    {"id": 1, "code": "SEAFOOD_NOODLE", "name": "海鲜面", "name_en": "Seafood Noodle", "icon_url": "...", "sort_order": 1, "is_active": true}
]
```

---

## 三、菜单/菜品浏览（Catalog）

### 3.1 全局分类列表

```
GET /public/categories
```

公开。

响应 `200`：

```json
[
    {"id": 1, "name": "火锅套餐", "name_en": "Hotpot Set", "image_url": "...", "business_type_code": "HOTPOT_BUFFET"}
]
```

### 3.2 分类详情

```
GET /public/categories/:id
```

公开。

响应 `200`：

```json
{
    "id": 1, "name": "火锅套餐", "name_en": "Hotpot Set",
    "description": "...", "image_url": "...",
    "items": [
        {"id": 3007, "name": "...", "price": 97, "image_url": "...", "is_available": true}
    ]
}
```

### 3.3 菜品列表

```
GET /public/menu-items?category_id=1&store_id=1&page=1&page_size=20
```

公开。

响应 `200`（分页）。

### 3.4 菜品详情

```
GET /public/menu-items/:id
```

公开。

响应 `200`：

```json
{
    "id": 3007,
    "name": "曼谷金汤 招牌套餐",
    "name_en": "Demo Item 1",
    "description": "...",
    "price": 97,
    "image_url": "https://...",
    "images": ["https://..."],
    "is_available": true,
    "store": {"id": 1, "name": "曼谷金汤火锅·麻辣烫店"},
    "category": {"id": 1, "name": "火锅套餐"}
}
```

### 3.5 商品搜索

```
GET /products/search?keyword=火锅&store_id=1&page=1&page_size=20
```

公开。

响应 `200`（分页），items 为菜品数组。

### 3.6 按分类筛选

```
GET /products/by-category?category_id=1&page=1&page_size=20
```

公开。

### 3.7 新品

```
GET /products/new?page=1&page_size=20
```

公开。

### 3.8 热门

```
GET /products/hot?page=1&page_size=20
```

公开。

---

## 四、统一搜索

### 4.1 综合搜索

```
GET /search?keyword=火锅&type=all&page=1&page_size=20
```

需 consumer token。

| 参数 | 说明 |
|------|------|
| keyword | 搜索关键词 |
| type | `all` / `stores` / `products`，默认 `all` |

响应 `200`：

```json
{
    "stores": [...],
    "products": [...],
    "total": 15
}
```

---

## 五、Banner 与通知

### 5.1 Banner 列表

```
GET /banners
```

公开。

响应 `200`：

```json
[
    {"id": 1, "title": "新店开业", "image_url": "https://...", "link_url": "...", "sort_order": 1, "is_active": true}
]
```

### 5.2 全局公告

```
GET /notices/global
```

公开。

响应 `200`：

```json
{"id": 1, "title": "系统公告", "content": "...", "type": "SYSTEM"}
```

---

## 六、订单（Order）

### 6.1 创建订单

```
POST /user-orders
```

需 consumer token。

请求体：

```json
{
    "store_id": 1,
    "order_type": "DINE_IN",
    "order_source": "QR_SCAN",
    "table_number": "A1",
    "coins_to_use": 100,
    "coupon_id": 42,
    "remark": "少辣",
    "extra_data": {},
    "items": [
        {"item_id": 3007, "quantity": 2, "unit_price": 97}
    ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| store_id | int64 | 是 | 门店 ID |
| order_type | string | 否 | 默认 DINE_IN |
| order_source | string | 否 | DINE_IN_CASHIER / QR_SCAN / DELIVERY |
| table_number | string | 否 | 桌号 |
| coins_to_use | int | 否 | 使用金币数量 |
| coupon_id | int64 | 否 | 优惠券 ID |
| remark | string | 否 | 备注 |
| items | array | 是 | 菜品列表，至少 1 项 |

响应 `201`：

```json
{"order_id": 13693, "message": "created"}
```

### 6.2 我的订单列表

```
GET /user-orders?status=PAID&page=1&page_size=20
```

需 consumer token。

| 参数 | 说明 |
|------|------|
| status | 可选，筛选状态 |

响应 `200`（分页）：

```json
{
    "items": [
        {
            "id": 13693,
            "store_id": 1,
            "store_name": "曼谷金汤火锅·麻辣烫店",
            "order_no": "ORD20260509...",
            "order_type": "DINE_IN",
            "order_source": "QR_SCAN",
            "subtotal": 194.00,
            "total_amount": 119.80,
            "discount_amount": 74.20,
            "coin_deduct_amount": 0,
            "coins_used": 0,
            "status": "PAID",
            "table_number": "A1",
            "pickup_code": "1234",
            "remark": "少辣",
            "created_at": "2026-05-09T18:00:00Z",
            "updated_at": "2026-05-09T18:01:00Z",
            "items": [
                {
                    "item_id": 3007,
                    "item_name": "曼谷金汤 招牌套餐",
                    "quantity": 2,
                    "unit_price": 97,
                    "subtotal": 194.00
                }
            ]
        }
    ],
    "total": 10, "page": 1, "page_size": 20, "total_pages": 1
}
```

### 6.3 订单详情

```
GET /user-orders/:order_id
```

需 consumer token。返回单条订单，格式同 6.2 中的 items 元素。

### 6.4 取消订单

```
POST /user-orders/:order_id/cancel
```

需 consumer token。无请求体。

响应 `200`：

```json
{"order_id": 13693, "status": "CANCELLED"}
```

---

## 七、支付（Payment）

### 7.1 确认支付

```
POST /payments/confirm
```

需 consumer token。

请求体：

```json
{"order_id": 13693, "payment_method": "cash_pos"}
```

响应 `200`：

```json
{"id": 1, "order_id": 13693, "status": "COMPLETED", "message": "confirmed"}
```

### 7.2 支付详情

```
GET /payments/order/:order_id
```

需 consumer token。

响应 `200`：

```json
{
    "id": 1,
    "order_id": 13693,
    "store_id": 1,
    "amount": 119.80,
    "method": "cash_pos",
    "status": "COMPLETED",
    "payment_state": "PAID",
    "paid": true,
    "transaction_id": "TXN123",
    "refund_amount": 0,
    "created_at": "2026-05-09T18:01:00Z",
    "updated_at": "2026-05-09T18:01:00Z"
}
```

### 7.3 退款

```
POST /payments/:payment_id/refund
```

需 consumer token。

请求体：

```json
{"reason": "不想要了"}
```

响应 `200`：

```json
{"id": 1, "status": "REFUNDED", "message": "refunded"}
```

---

## 八、优惠券（Coupon）

### 8.1 我的优惠券列表

```
GET /coupons?status=ACTIVE&page=1&page_size=20
```

需 consumer token。

响应 `200`（分页）：

```json
{
    "items": [
        {
            "id": 42,
            "coupon_type": "PERCENTAGE",
            "discount_value": 20,
            "min_order_amount": 100,
            "status": "ACTIVE",
            "expire_at": "2026-12-31T23:59:59Z",
            "coupon": {
                "name": "新人8折券",
                "name_en": "New User 20% Off",
                "description": "..."
            }
        }
    ],
    "total": 3, "page": 1, "page_size": 20, "total_pages": 1
}
```

### 8.2 领取优惠券

```
POST /coupons/claim
```

需 consumer token。

请求体：

```json
{"coupon_id": 10}
```

响应 `200`：

```json
{"id": 42, "message": "claimed"}
```

### 8.3 新人礼包

```
GET /coupons/newbie-pack
```

需 consumer token。

响应 `200`：

```json
[
    {"id": 10, "name": "新人8折券", "name_en": "New User 20% Off", "coupon_type": "PERCENTAGE", "discount_value": 20}
]
```

### 8.4 可领券列表

```
GET /campaigns/coupons?page=1&page_size=20
```

需 consumer token。

响应 `200`（分页）：返回当前可领取的优惠券模板列表。

---

## 九、拼团（Group Buy）

### 9.1 拼团商品列表

```
GET /group-buy/products?store_id=1&page=1&page_size=20
```

需 consumer token。

| 参数 | 说明 |
|------|------|
| store_id | 可选，门店 ID |
| page | 默认 1 |
| page_size | 默认 20 |

仅返回进行中的拼团。

响应 `200`（分页）：

```json
{
    "items": [
        {
            "id": 1,
            "store_id": 1,
            "menu_item_id": 3007,
            "original_price": 97,
            "group_price": 59.9,
            "discount_rate": 0.62,
            "total_quota": 100,
            "sold_count": 2,
            "max_per_user": 2,
            "start_at": "2026-05-01T00:00:00Z",
            "end_at": "2026-12-31T23:59:59Z",
            "share_code": "GB202605090010001",
            "is_active": true,
            "sort_order": 1,
            "created_at": "...",
            "updated_at": "...",
            "name": "曼谷金汤 招牌套餐",
            "name_en": "Demo Item 1",
            "image_url": "https://..."
        }
    ],
    "total": 1, "page": 1, "page_size": 20, "total_pages": 1
}
```

### 9.2 拼团商品详情

```
GET /group-buy/products/:id
```

需 consumer token。

响应 `200`（同 9.1 单条，额外包含 `store_name`）：

```json
{
    "id": 1, "...": "...",
    "name": "曼谷金汤 招牌套餐",
    "store_name": "曼谷金汤火锅·麻辣烫店",
    "image_url": "https://..."
}
```

### 9.3 分享码查询

```
GET /group-buy/share/:share_code
```

需 consumer token。响应同 9.2。

### 9.4 创建拼团订单

```
POST /group-buy/orders
```

需 consumer token。

请求体：

```json
{"group_buy_item_id": 1, "quantity": 2}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| group_buy_item_id | int64 | 是 | 拼团商品 ID |
| quantity | int | 是 | >= 1，受 max_per_user 约束 |

响应 `201`：

```json
{"order_id": 13693, "status": "PENDING_PAYMENT", "message": "created"}
```

错误码：`GROUP_BUY_NOT_FOUND` / `GROUP_BUY_NOT_ACTIVE` / `GROUP_BUY_EXPIRED` / `GROUP_BUY_SOLD_OUT` / `GROUP_BUY_LIMIT_EXCEEDED`

---

## 十、民宿预订（Hostel）

### 10.1 搜索可用门店

```
GET /hostel/stores/available?check_in=2026-06-01&check_out=2026-06-03&guests=2&page=1&page_size=20
```

需 consumer token。

响应 `200`（分页）：门店列表。

### 10.2 查询可用房间

```
GET /hostel/rooms/available?store_id=1&check_in=2026-06-01&check_out=2026-06-03&guests=2
```

需 consumer token。

响应 `200`：

```json
[
    {
        "id": 1,
        "store_id": 1,
        "room_type": "DELUXE",
        "name": "豪华双人间",
        "name_en": "Deluxe Double",
        "capacity": 2,
        "price_per_night": 1500,
        "status": "AVAILABLE",
        "amenities": ["WiFi", "空调"],
        "images": ["https://..."]
    }
]
```

### 10.3 创建预订

```
POST /hostel/bookings
```

需 consumer token。

请求体：

```json
{
    "store_id": 1,
    "room_id": 1,
    "check_in": "2026-06-01",
    "check_out": "2026-06-03",
    "guests": 2,
    "guest_name": "张三",
    "guest_phone": "+6612345678",
    "special_requests": "需要加床"
}
```

响应 `201`：

```json
{"id": 1, "message": "created"}
```

### 10.4 查询预订详情

```
GET /hostel/bookings/:id
```

需 consumer token。

响应 `200`：

```json
{
    "id": 1,
    "store_id": 1,
    "room_id": 1,
    "room_type": "DELUXE",
    "room_name": "豪华双人间",
    "check_in": "2026-06-01T14:00:00Z",
    "check_out": "2026-06-03T12:00:00Z",
    "guests": 2,
    "status": "RESERVED",
    "payment_status": "PAID",
    "total_amount": 3000.00,
    "nights": 2,
    "created_at": "...",
    "updated_at": "..."
}
```

### 10.5 取消预订

```
POST /hostel/bookings/:id/cancel
```

需 consumer token。无请求体。

响应 `200`：

```json
{"id": 1, "status": "CANCELLED", "message": "cancelled"}
```

### 10.6 续住

```
POST /hostel/bookings/:id/extensions
```

需 consumer token。

请求体：

```json
{"check_out": "2026-06-05"}
```

响应 `200`：

```json
{"id": 1, "message": "extended"}
```

### 10.7 评价

```
POST /hostel/reviews
```

需 consumer token。

请求体：

```json
{"booking_id": 1, "rating": 5, "comment": "非常好"}
```

响应 `201`：

```json
{"id": 1, "message": "created"}
```

---

## 十一、民宿火锅（Hotpot）

### 11.1 查看火锅菜单

```
GET /hotpot/menu?store_id=1
```

需 consumer token。

响应 `200`：菜单分类 + 菜品列表。

### 11.2 查询可用桌台

```
GET /hotpot/tables/available?store_id=1
```

需 consumer token。

响应 `200`：

```json
[
    {"table_number": "A1", "capacity": 4, "status": "AVAILABLE"}
]
```

### 11.3 自助火锅下单

```
POST /hotpot/orders
```

需 consumer token。

请求体：

```json
{
    "store_id": 1,
    "table_number": "A1",
    "order_type": "BUFFET",
    "guests": 4,
    "items": [{"item_id": 3007, "quantity": 2}]
}
```

响应 `201`：

```json
{"order_id": 13700, "message": "created"}
```

### 11.4 计件火锅下单

```
POST /hotpot/orders/piecewise
```

需 consumer token。请求体同 11.3，`order_type` 改为 `PIECEWISE`。

---

## 十二、商城（Mall）

### 12.1 商城商品列表

```
GET /mall/products?category_id=1&page=1&page_size=20
```

需 consumer token。

响应 `200`（分页）：

```json
{
    "items": [
        {
            "id": 1,
            "name": "泰式奶茶套装",
            "name_en": "Thai Tea Set",
            "description": "...",
            "price": 299,
            "image_url": "https://...",
            "images": ["https://..."],
            "is_active": true,
            "stock": 50,
            "category": {"id": 1, "name": "饮品套装"}
        }
    ],
    "total": 10, "page": 1, "page_size": 20, "total_pages": 1
}
```

### 12.2 商品详情

```
GET /mall/products/:id
```

需 consumer token。响应同 12.1 单条。

### 12.3 创建商城订单

```
POST /mall/orders
```

需 consumer token。

请求体：

```json
{
    "products": [
        {"product_id": 1, "quantity": 2}
    ],
    "shipping_address": {"name": "张三", "phone": "+6612345678", "address": "123 Sukhumvit Rd"}
}
```

响应 `201`：

```json
{"order_id": 13701, "message": "created"}
```

### 12.4 我的商城订单

```
GET /mall/my-orders?status=PAID&page=1&page_size=20
```

需 consumer token。响应 `200`（分页）。

### 12.5 取消商城订单

```
POST /mall/my-orders/:id/cancel
```

需 consumer token。无请求体。

响应 `200`：

```json
{"id": 13701, "status": "CANCELLED", "message": "cancelled"}
```

---

## 十三、会员与积分

### 13.1 我的资料

```
GET /me/profile
```

需 consumer token。

响应 `200`：

```json
{
    "id": 550,
    "nickname": "User_5678",
    "phone": "+6612345678",
    "avatar_url": "https://...",
    "email": null,
    "created_at": "2026-05-01T00:00:00Z"
}
```

### 13.2 更新资料

```
PATCH /me/profile
```

请求体：

```json
{"nickname": "新昵称", "avatar_url": "https://..."}
```

响应 `200`：

```json
{"id": 550, "message": "updated"}
```

### 13.3 积分余额

```
GET /me/points
```

需 consumer token。

响应 `200`：

```json
{"balance": 1500, "total_earned": 5000, "total_spent": 3500}
```

### 13.4 积分记录

```
GET /me/point-transactions?page=1&page_size=20
```

需 consumer token。

响应 `200`（分页）：

```json
{
    "items": [
        {
            "id": 1,
            "type": "ORDER_REWARD",
            "amount": 100,
            "description": "订单奖励",
            "created_at": "2026-05-09T18:00:00Z"
        }
    ],
    "total": 5, "page": 1, "page_size": 20, "total_pages": 1
}
```

### 13.5 金币余额

```
GET /me/coins
```

需 consumer token。

响应 `200`：

```json
{"balance": 500}
```

### 13.6 金币记录

```
GET /me/coin-transactions?page=1&page_size=20
```

需 consumer token。格式同 13.4。

### 13.7 会员卡

```
GET /me/membership
```

需 consumer token。

响应 `200`：

```json
{"tier": "REGULAR", "points": 1500, "benefits": ["..."]}
```

### 13.8 收藏列表

```
GET /me/favorites?type=store&page=1&page_size=20
```

需 consumer token。

| 参数 | 说明 |
|------|------|
| type | `store` / `product` |

响应 `200`（分页）。

### 13.9 添加收藏

```
POST /me/favorites
```

请求体：

```json
{"type": "store", "target_id": 1}
```

响应 `201`：

```json
{"id": 1, "message": "created"}
```

### 13.10 取消收藏

```
DELETE /me/favorites/:id
```

响应 `200`：

```json
{"id": 1, "message": "deleted"}
```

---

## 十四、通知

### 14.1 我的通知列表

```
GET /notifications?page=1&page_size=20
```

需 consumer token。

响应 `200`（分页）：

```json
{
    "items": [
        {
            "id": 1,
            "title": "订单已支付",
            "content": "您的订单 13693 已支付成功",
            "type": "ORDER",
            "is_read": false,
            "created_at": "2026-05-09T18:01:00Z"
        }
    ],
    "total": 5, "page": 1, "page_size": 20, "total_pages": 1
}
```

### 14.2 标记已读

```
PATCH /notifications/:id/read
```

响应 `200`：

```json
{"id": 1, "message": "updated"}
```

### 14.3 全部已读

```
POST /notifications/read-all
```

响应 `200`：

```json
{"message": "updated"}
```

### 14.4 未读数

```
GET /notifications/unread-count
```

响应 `200`：

```json
{"count": 3}
```

### 14.5 注册设备推送 Token

```
POST /devices/token
```

请求体：

```json
{"token": "FCM_TOKEN...", "platform": "android"}
```

响应 `200`：

```json
{"message": "registered"}
```

---

## 十五、推荐（Referral）

### 15.1 我的推荐码

```
GET /me/referral-code
```

需 consumer token。

响应 `200`：

```json
{"code": "REF550", "link": "https://app.siamfeast.com/ref/REF550"}
```

### 15.2 推荐记录

```
GET /me/referrals?page=1&page_size=20
```

需 consumer token。

响应 `200`（分页）：

```json
{
    "items": [
        {"referred_user": "User_9999", "reward": 50, "created_at": "..."}
    ],
    "total": 3, "page": 1, "page_size": 20, "total_pages": 1
}
```

---

## 十六、文件上传

### 16.1 获取预签名 URL

```
POST /uploads/presign
```

请求体：

```json
{"filename": "avatar.png", "content_type": "image/png"}
```

响应 `200`：

```json
{"upload_url": "https://minio.../...", "file_url": "https://minio.../avatar.png"}
```

### 16.2 确认上传

```
POST /uploads/confirm
```

请求体：

```json
{"file_url": "https://minio.../avatar.png"}
```

响应 `200`：

```json
{"message": "confirmed"}
```

---

## 十七、WebSocket

### 17.1 实时连接

```
GET /ws
```

需 consumer token（通过 query 或 header）。用于订单状态推送、通知等实时消息。

---

## 接口索引（按业务）

| 业务模块 | 接口数 | 认证 |
|----------|--------|------|
| 认证 Auth | 5 | 公开 |
| 门店 Store | 7 | 公开 + 认证 |
| 菜单 Catalog | 8 | 公开 |
| 搜索 Search | 1 | 认证 |
| Banner/通知 | 2 | 公开 |
| 订单 Order | 4 | 认证 |
| 支付 Payment | 3 | 认证 |
| 优惠券 Coupon | 4 | 认证 |
| 拼团 GroupBuy | 4 | 认证 |
| 民宿 Hostel | 7 | 认证 |
| 火锅 Hotpot | 4 | 认证 |
| 商城 Mall | 5 | 认证 |
| 会员/积分 | 10 | 认证 |
| 通知 | 5 | 认证 |
| 推荐 Referral | 2 | 认证 |
| 上传 Upload | 2 | 认证 |
| WebSocket | 1 | 认证 |
| **合计** | **~74** | |
