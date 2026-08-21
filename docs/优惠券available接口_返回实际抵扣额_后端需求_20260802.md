# `/coupons/available` 接口新增 `expected_discount` 字段 — 后端需求

> 日期：2026-08-02
> 发件人：前端 jiangyz33
> 收件人：后端
> 优先级：P1（提升下单体验，不阻塞但建议本周内排期）
> 关联：`2026-08-02_PERCENT券抵扣修复回执.md`（PERCENT 券修复已上线，本需求是体验优化）

---

## 1. 背景

PERCENT 券修复已上线（`calculator.go` 增加 `*maxDiscount > 0` 兜底），但**"防折上折"规则仍生效**：

> `order/service.go:564-567`：当订单已经匹配到活动折扣时（如全店开业 9% 折扣），PERCENT 券会被静默清零。

这导致当前端用户进入结算页时，**`/coupons/available` 仍把 PERCENT 券列为可用**，但用户选了之后 `/orders/preview` 才返回 `coupon_discount=0`。流程上是：

1. 用户打开券选择器 → 看到"2 张可用"，包含 7 折 PERCENT 券
2. 选中 7 折券 → preview 返回 0
3. 前端把该券标灰"不可用本单"
4. 用户重新打开选择器 → 看到标灰 → 改选其他券或不使用

这是**二次反馈**，用户感知差。期望：**进入选择器时只看到真正能用的券**。

## 2. 需求

`GET /api/v1/coupons/available` 返回的每张券对象上，新增 `expected_discount` 字段，表示**该券在当前请求上下文下若被使用，能抵扣多少铢**。

### 2.1 响应示例

```jsonc
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 185,                    // user_coupons.id（沿用现状）
        "type": "PERCENT",
        "value": 30,
        "name": "新人7折卷",
        "min_spend": 0,
        "expected_discount": 0        // ← 新增。开业活动期被清零 → 0
      },
      {
        "id": 52,
        "type": "FIXED",
        "value": 3,
        "name": "30-3优惠卷",
        "min_spend": 30,
        "expected_discount": 3
      },
      {
        "id": 184,
        "type": "ITEM",
        "value": 1,
        "name": "菜品任选卷",
        "expected_discount": 0        // ITEM 券不参与下单，直接 0 或不返回
      }
    ]
  }
}
```

### 2.2 字段语义

| 字段 | 类型 | 说明 |
|---|---|---|
| `expected_discount` | number（铢，浮点） | 在当前请求上下文（`store_id` + `order_amount` + `order_type`）下，该券若被使用，能抵扣多少。**未参与抵扣的券返回 0**，不要省略字段。|

### 2.3 计算规则（必须复用现有 settlement calculator）

`expected_discount` 必须**等价于**对每张券分别调一次 `/orders/preview` 得到的 `coupon_discount` 值。建议：

- **同进程调用** `internal/pkg/settlement/calculator.go` 的 `CalculateCouponDiscount`，**不要**走 N 次 HTTP。
- 必须**包含**以下规则的判定（与下单路径一致）：
  - **防折上折**（`order/service.go:564-567`）：订单已匹配活动折扣时，PERCENT/PERCENTAGE 券返回 0。
  - **金额门槛**：`min_spend > order_amount` 时返回 0。
  - **max_discount 封顶**（本次修复点）：`max_discount > 0` 时按封顶值，`max_discount ≤ 0` 或 NULL 视为无上限。
  - **分类排除**（`exclude_from_discount`）：PERCENT 券只作用于非排除分类商品，按规则计算。
- ITEM 券：不参与下单抵扣，返回 0（或前端会主动过滤，但请统一返回 0）。

### 2.4 性能要求

- 当前 `/coupons/available` 已经在按订单上下文过滤，**新增 `expected_discount` 不应显著增加响应时间**。
- N 张券 = N 次同进程计算（每次一个 `CalculateCouponDiscount` 调用），不是 N 次数据库查询或 HTTP。
- 若性能有顾虑，可在内部把"门店活动折扣"计算一次复用，避免每张券重复算活动部分。

## 3. 兼容性

- **字段名**：`expected_discount`（snake_case，与现有字段风格一致）。
- **老版本前端**：忽略未知字段，不影响行为。
- **后端未上线时**：前端已做向后兼容 —— 字段未返回时不过滤，回退到当前"选中后由 preview 判定"的兜底路径。

## 4. 前端验证用例

请求：`GET /api/v1/coupons/available?store_id=55&order_amount=10150&order_type=DINE_IN`

| user_coupon.id | type | value | 场景 | 期望 `expected_discount` |
|---|---|---|---|---|
| 185 | PERCENT | 30 | 无活动 | 3045 |
| 185 | PERCENT | 30 | **开业活动 9% 生效** | **0**（防折上折清零）|
| 52 | FIXED | 3 | 任意 | 3 |
| 52 | FIXED | 3 | order_amount=20, min_spend=30 | 0（不满足门槛）|
| 184 | ITEM | 1 | 任意 | 0 |
| 21 | PERCENT | 20 | 无活动 + max_discount=50 + 折前 1000 | 200 |
| 22 | PERCENT | 30 | 无活动 + max_discount=0（旧脏数据） | 3045（修复后兜底视为无上限）|

## 5. 复测账号

- 持券人：user 105（持 `user_coupon.id=185` → coupon 22「新人7折卷」PERCENT=30）
- 其他 PERCENT 持券人：user 201/202/203/204/205、121、122、110、111、112
- 反馈文档原说的 user 120 **没有 PERCENT 券**，请改用 user 105


## 6. 前端落点（已就绪，等后端字段）

`pages/checkout/index.vue` 加载券列表时已写入过滤逻辑：

```js
this.availableCoupons = couponItems.map(c => ({
    // ...原字段
    expectedDiscount: c.expected_discount !== undefined
        ? Number(c.expected_discount) || 0
        : null   // 未返回 → 不过滤
})).filter(c => {
    if (String(c.type).toUpperCase() === 'ITEM') return false
    if (!(c.amount > 0 && (!c.minSpend || this.productTotal >= c.minSpend))) return false
    // 后端返回了 expected_discount 时，剔除本单不可用的券
    if (c.expectedDiscount !== null && c.expectedDiscount <= 0) return false
    return true
})
```

字段一上线，前端选择器立即只展示真正可用的券，无需再发版。

---

## 联调要点

- 字段缺失或类型错误 → 前端按"未返回"处理（不剔除任何券），不会报错。
- 字段返回字符串数字（`"3045"`）→ 前端 `Number()` 兜底，OK。
- 如果后端实现成本高，可先返回 `expected_discount = 0` 占位（让所有券被过滤），但**不建议**，等于禁用了券功能。建议按本文档完整实现。
