# Banner 接口 Campaign 嵌套对象补全门店字段 — 后端工单

> 日期：2026-08-06
> 发件人：前端 jiangyz33
> 收件人：后端
> 优先级：P2（首页轮播图门店范围徽章显示错误）
> 关联接口：`GET /api/v1/banners?position=HOME`

---

## 1. 问题

首页轮播图的左上角有"全部门店"/"指定门店"徽章。当前 banner 嵌套的 `campaign` 对象**缺少门店相关字段**，导致前端无法判断活动适用范围，错误地兜底显示"全部门店"。

**实测**：campaign #22「折扣活动」实际只在 store 57/56 生效（`is_global=false, applicable_stores=[57,56]`），但 banner 显示"全部门店"。

---

## 2. 当前响应 vs 期望响应

### 2.1 当前 banner 嵌套的 campaign 对象（缺字段）

```json
{
  "id": 22,
  "name": "折扣活动",
  "name_en": "Discount Event",
  "name_th": "กิจกรรมลดราคา",
  "type": "DISCOUNT",
  "status": "ACTIVE",
  "start_date": "2026-07-05T...",
  "end_date": "2026-08-12T...",
  "rules": { "discount_percent": 20 },
  "description": "...",
  "description_en": "...",
  "description_th": "...",
  "image_url": "..."
}
```

❌ 缺失：`store_id` / `is_global` / `applicable_stores`

### 2.2 期望补全后的 campaign 对象

```json
{
  "id": 22,
  "name": "折扣活动",
  "type": "DISCOUNT",
  "status": "ACTIVE",
  "start_date": "...",
  "end_date": "...",
  "rules": { ... },
  "description": "...",
  "image_url": "...",

  "store_id": 57,                    // ← 新增：活动所属门店（单店活动时有值）
  "is_global": false,                 // ← 新增：是否全门店
  "applicable_stores": [57, 56]       // ← 新增：适用门店列表（is_global=false 时有值）
}
```

---

## 3. 需要补的字段（3 个）

| 字段 | 类型 | 说明 |
|---|---|---|
| `store_id` | number\|null | 活动归属门店（单店创建的活动通常有值；全局活动为 null）|
| `is_global` | bool | `true` = 全门店适用；`false` = 仅 `applicable_stores` 列出的门店 |
| `applicable_stores` | number[] | 适用门店 ID 列表（`is_global=false` 时有值；`is_global=true` 时可省略或返回空数组）|

### 字段来源

这些字段在 `campaigns` 表里**已经存在**（`/campaigns` 接口已返回），只是 banner 嵌套 campaign 对象的序列化路径**漏掉了**。

---

## 4. 影响范围

| 端 | 影响 |
|---|---|
| C 端首页轮播图 | 左上角徽章错误显示"全部门店"（已做前端兜底：缺字段时不显示徽章）|
| C 端活动详情弹窗 | 适用门店范围行不展示（`applicableScopeText` 找不到字段返回空）|

前端已做兜底处理（缺字段 → 不显示徽章 / 不显示范围行），但**补全字段后展示更准确**。

---

## 5. 前端展示逻辑（字段补全后即生效）

| `is_global` | `applicable_stores` | 前端展示 |
|---|---|---|
| `true` | — | "全部门店" |
| `false` | `[57, 56]` | "适用 2 家门店" |
| `false` | `[]` 或缺失 | "指定门店"（通用） |
| 缺失 | 缺失 | 不显示徽章（当前兜底行为）|

---

## 6. 验证用例

### 6.1 全门店活动

campaign #30「满减活动」（`is_global=true`）

```json
{
  "is_global": true,
  "applicable_stores": []
}
```

前端展示：✅ "全部门店"

### 6.2 指定门店活动

campaign #22「折扣活动」（`is_global=false, applicable_stores=[57,56]`）

```json
{
  "is_global": false,
  "applicable_stores": [57, 56]
}
```

前端展示：✅ "适用 2 家门店"

### 6.3 无门店关联的全局券活动

campaign #38「7折券赠送」（`is_global=true`）

```json
{
  "is_global": true,
  "applicable_stores": []
}
```

前端展示：✅ "全部门店"

---

## 7. 实现建议

banner 接口的 campaign 序列化路径（可能在 `internal/modules/infra/handler.go` 或 `repository.go` 里）补上 `store_id` / `is_global` / `applicable_stores` 三个字段。这些字段在 campaigns 表已有，只需要 JOIN 或 SELECT 时带上。
