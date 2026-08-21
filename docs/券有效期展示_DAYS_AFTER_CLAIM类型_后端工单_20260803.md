# 券模板 `end_date` 字段对 `DAYS_AFTER_CLAIM` 类型具有误导性 — 后端工单

> 日期：2026-08-03
> 发件人：前端 jiangyz33
> 收件人：后端
> 抄送：总控端
> 优先级：P2（C 端显示问题，非阻塞下单）
> 关联接口：
> - `GET /api/v1/campaigns/:id/claimable-coupons`（领券中心）
> - `GET /api/v1/coupons/newbie-pack`（新人礼包）
> - 其他返回券模板 `end_date` 字段的接口

---

## 1. 问题

### 1.1 现象

C 端领券中心和券详情对「菜品任选卷」（coupon.id=28）显示的有效期是 **2056-07-31**（30 年后），用户以为是"永久有效"。

### 1.2 数据实证

**用户领取后的实例（`user_coupons`）有效期是对的**：
- `expire_at` 全部正确：领取时间 + 30 天（如 08-02 领 → 09-01 过期）
- 实际有效期没问题，业务逻辑没坏

**问题在券模板（`coupons`）的 `end_date` 字段**：
- 「菜品任选卷」(id=28) 的 `end_date = 2056-07-31`（30 年后）
- C 端领券中心**把这个字段当作"有效期至"直接展示了**

### 1.3 根因

后端创建 `valid_type = DAYS_AFTER_CLAIM` 类型的券时，模板的 `start_date` / `end_date` **不是有效期，而是"可领取窗口"的占位**：

```go
// 后端创建代码（推测）
time.Now().AddDate(30, 0, 0)
```

`AddDate` 第一个参数是**年**，所以占位成了 30 年（估计本意是"相当于不限领取时间"）。

### 1.4 对比：总控端是对的

总控端 `Coupons.vue:369` 的 `validLabel`：
- 对 `DAYS_AFTER_CLAIM` 类型 → 显示「领取后 N 天有效」
- 仅对 `FIXED` 类型 → 显示起止日期

**总控端无需改动**。

---

## 2. 影响范围

| 端 | 影响 | 处理 |
|---|---|---|
| C 端领券中心 | ❌ 显示 2056-07-31 | 需修复（前端层面）|
| C 端新人礼包 | ❌ 可能受影响（同字段）| 需修复 |
| C 端"我的券"列表 | ✅ 用的是 `valid_end`（实例字段），不受影响 | — |
| 总控端券列表 | ✅ 已正确处理 | — |
| 后端领券链路 | ✅ 实际有效期计算正确 | — |

---

## 3. 修复建议

### 3.1 前端修复（C 端，主修复）

在领券中心、新人礼包、券详情等展示券模板的页面：

| `valid_type` | 展示规则 |
|---|---|
| `FIXED` | 显示 `start_date ~ end_date`（起止日期）|
| `DAYS_AFTER_CLAIM` | 显示「领取后 {valid_days} 天有效」（用 `valid_days` 字段，**不要**用 `end_date`）|

接口已返回 `valid_type` 和 `valid_days` 字段，前端直接判断即可，**无需后端改动**。

**伪代码**：
```js
function formatCouponValid(coupon) {
    if (coupon.valid_type === 'DAYS_AFTER_CLAIM') {
        return `领取后 ${coupon.valid_days} 天有效`
    }
    // FIXED 或其他类型 → 显示起止日期
    return `${coupon.start_date} ~ ${coupon.end_date}`
}
```

### 3.2 后端根治（可选，优先级低）

让 `DAYS_AFTER_CLAIM` 模板**不写误导性的 30 年 end_date**，或在接口返回时屏蔽该字段。

**风险**：`end_date` 同时被领取窗口校验用着（`now <= end_date` 才能领），改它需要回归整个领取链路。**建议先做前端修复，后端根治暂缓**。

可选方案：
1. 返回时区分 `claim_window_end`（领取窗口结束日，原 `end_date`）和 `valid_period_label`（展示文案）两个语义字段
2. 或在响应里加一个 `display_end_date` 字段，对 `DAYS_AFTER_CLAIM` 类型返回 null，前端按 null + valid_days 渲染

---

## 4. 验证用例

### 4.1 「菜品任选卷」(id=28, DAYS_AFTER_CLAIM=30 天)

| 接口 | 之前展示 | 修复后展示 |
|---|---|---|
| `/campaigns/:id/claimable-coupons` | 2056-07-31 | 领取后 30 天有效 |
| `/coupons/newbie-pack` | 2056-07-31 | 领取后 30 天有效 |
| 用户领取后（`/coupons` 我的券列表）| 2026-09-01（正确）| 2026-09-01（不变）|

### 4.2 FIXED 类型券（如某节日限定券）

| 之前展示 | 修复后展示 |
|---|---|
| 2026-08-15 ~ 2026-08-31 | 2026-08-15 ~ 2026-08-31（不变）|

---

## 5. 前端落点

| 文件 | 当前行为 | 改造点 |
|---|---|---|
| `components/campaign-detail-modal.vue` | 领券卡片剩余天数 | 加 valid_type 判断 |
| `pages/newbie-gift/index.vue` | `有效期{validity_days}天` | ✅ 已正确（用了相对天数）|
| `pages/coupons/index.vue` 我的券列表 | `valid_end`（实例字段）| ✅ 不需改 |
| 任何展示券模板 `end_date` 的地方 | 误导性 2056 | 加 valid_type 判断 |

---

## 联调要点

- `valid_type` 字段缺失或未知值 → 兜底用 `end_date`（维持原行为，避免破坏）
- `valid_days` 字段缺失 → 兜底用"领取后有效"
- 多语言：英文 `Valid for {n} days after claim` / 泰文 `ใช้ได้ {n} วันหลังรับ`

---

## 总结

| 项 | 责任方 | 优先级 |
|---|---|---|
| **主修复**：C 端按 valid_type 区分展示 | 前端 | P2（本次工单）|
| 根治：后端不返回误导性 end_date | 后端 | P3（暂缓）|
| 总控端 | — | ✅ 无需改动 |
