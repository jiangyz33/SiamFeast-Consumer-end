# HBuilderX 云打包配置清单（SiamFeast）

> 用于 HBuilderX → 发行 → 原生 App-云打包 界面填写
> 项目包名：`com.nationalworld.siamfeast`
> Firebase 项目：`siamfeast-294c0`

---

## 一、Android 打包配置

### 1.1 基础配置（必填）

| 字段 | 填写内容 | 说明 |
|---|---|---|
| **Android 包名** | `com.nationalworld.siamfeast` | 与 Firebase Console + keystore 一致 |
| **打包类型** | `aab`（上架 Google Play）/ `apk`（内测）| Google Play 必须 AAB |
| **合并版本代码（versionCode）** | `102` | 当前 manifest.json 里的值，每次升级递增 |
| **应用版本名称（versionName）** | `1.0.2` | 用户可见版本号 |

### 1.2 证书配置（必填）

| 字段 | 填写内容 |
|---|---|
| **证书** | ✅ 使用自有证书 |
| **证书文件** | `D:\project\SiamFeast\keystore\siamfeast.keystore` |
| **证书密码** | `SiamFeast2026!` |
| **证书别名** | `siamfeast` |
| **别名密码** | `SiamFeast2026!` |

### 1.3 SDK 配置（关键）

| SDK | 是否启用 | 说明 |
|---|---|---|
| **Firebase** | ✅ 启用 | Phone Auth 必需（manifest.json 已配）|
| **Maps（地图）** | ✅ 启用 | 门店定位用 |
| **OAuth（社交登录）** | ✅ 启用 | Google/Facebook 登录 |
| **Push（消息推送）** | ❌ 禁用 | 暂未使用 FCM 推送 |
| **Payment（支付）** | ❌ 禁用 | 用第三方支付页面 |
| **Statictics（统计）** | ❌ 禁用 | 暂未集成 |
| **Geolocation（定位）** | ✅ 启用 | 附近门店定位 |
| **OAuth login（QQ/微信/微博）** | ❌ 禁用 | 海外应用不需要 |

### 1.4 权限配置

权限已通过 manifest.json 配置，**HBuilderX 云打包无需手动选**。但建议确认以下权限都已勾选：

- [x] ACCESS_NETWORK_STATE（网络状态）
- [x] ACCESS_FINE_LOCATION（精确定位）
- [x] ACCESS_COARSE_LOCATION（粗略定位）
- [x] CAMERA（相机）
- [x] READ_EXTERNAL_STORAGE（读存储）
- [x] WRITE_EXTERNAL_STORAGE（写存储）
- [x] VIBRATE（震动）
- [x] WAKE_LOCK（保持唤醒）

### 1.5 高级配置

| 字段 | 填写内容 |
|---|---|
| **minSdkVersion** | `21`（Android 5.0）|
| **targetSdkVersion** | `34`（Google Play 要求 33+）|
| **AndroidX** | ✅ 启用 |
| **MultiDex** | ✅ 启用（项目依赖多，避免 65K 方法数限制）|
| **混淆（ProGuard）** | ✅ 启用 |

---

## 二、iOS 打包配置

### 2.1 基础配置（必填）

| 字段 | 填写内容 |
|---|---|
| **Bundle ID** | `com.nationalworld.siamfeast`（与 Android 包名一致）|
| **打包类型** | `ipa`（TestFlight + App Store）|

### 2.2 证书配置（必填）

| 字段 | 填写内容 |
|---|---|
| **证书** | ✅ 使用自有证书 |
| **证书文件（.p12）** | 你的 iOS 开发/发布证书 `.p12` 文件 |
| **证书密码** | `.p12` 文件密码 |
| **描述文件（.mobileprovision）** | 对应的 Provisioning Profile 文件 |
| **证书类型** | 开发（Development）/ 发布（Distribution）|

> 如果还没有 iOS 开发者账号（$99/年），暂时跳过 iOS 打包。

### 2.3 SDK 配置

| SDK | 是否启用 |
|---|---|
| **Firebase** | ✅ |
| **Maps** | ✅ |
| **OAuth** | ✅（Apple 登录必须 iOS 启用）|
| **Push** | ✅（iOS 上 Phone Auth 需要 APNs）|

---

## 三、首次打包前的准备

### 3.1 确认 manifest.json

| 文件 | 必填字段 | 当前状态 |
|---|---|---|
| `manifest.json` | `appid` | ✅ `__UNI__D871704` |
| `manifest.json` | `versionName` | ✅ `1.0.2` |
| `manifest.json` | `versionCode` | ✅ `102` |
| `manifest.json` | Android 权限 | ✅ 已精简 |
| `manifest.json` | `modules.Firebase` | ✅ 已启用 |

### 3.2 确认资源文件

| 文件 | 位置 | 说明 |
|---|---|---|
| **keystore** | `D:\project\SiamFeast\keystore\siamfeast.keystore` | Android 签名 |
| **google-services.json** | `D:\project\SiamFeast\static\firebase\` | Firebase 配置 |
| **应用图标** | `static/images/02_Icon-App.png` | manifest.json 引用 |
| **启动图** | `static/images/06_banner_01.png` | manifest.json 引用 |

### 3.3 确认生产环境配置

| 文件 | 配置项 | 当前值 |
|---|---|---|
| `api/config.js` | `FORCE_DEV` | `false` ✅ |
| `utils/share.js` | `FORCE_LOCAL` | `false` ✅ |
| `index.html` | Google Maps API | ✅ |

---

## 四、云打包操作流程

### 4.1 HBuilderX 中

1. **打开项目**：HBuilderX → 文件 → 打开目录 → 选 `D:\project\SiamFeast`
2. **菜单**：发行 → 原生 App-云打包
3. **Android 配置**：按上述第一章填写
4. **iOS 配置**：按上述第二章填写（如有 iOS 证书）
5. **点「打包」** → 等待 5-15 分钟（HBuilderX 云端构建）

### 4.2 构建产物

| 类型 | 文件 | 位置 |
|---|---|---|
| Android 测试 | `siamfeast-v1.0.2-102.apk` | `unpackage/release/` |
| Android 上架 | `siamfeast-v1.0.2-102.aab` | `unpackage/release/` |
| iOS | `siamfeast-v1.0.2-102.ipa` | `unpackage/release/` |

---

## 五、打包后验证清单

### 5.1 APK 验证（直接安装）

| 验证项 | 期望 |
|---|---|
| APK 安装到 Android 手机 | 成功 |
| 启动 APP | 进入登录页（无 token 时）|
| 切换语言 | 中英泰三语生效 |
| 邮箱登录 | 成功 |
| 短信验证码登录 | 进入页面（需测试号码）|
| 门店列表 | 显示附近门店 |
| 下单流程 | 走通 |
| 金币/积分 | 显示正确 |

### 5.2 AAB 验证（上传 Google Play）

| 验证项 | 期望 |
|---|---|
| 上传到 Internal Testing | 成功 |
| 用户通过 Play Store 安装 | 成功 |
| Play Integrity | 验证通过 |
| 短信验证码登录 | Play Integrity 模式正常 |

---

## 六、打包常见问题

### Q1：打包失败，提示 "缺少 google-services.json"

**原因**：HBuilderX 找不到 Firebase 配置文件。

**解决**：
- 确认文件路径：`D:\project\SiamFeast\static\firebase\google-services.json`
- 或在 manifest.json 中配置 nativeResources 路径（UTS 插件方案）

### Q2：签名不匹配，Google Play 拒绝

**原因**：上传证书 SHA-1 与 Google Play 注册的不一致。

**解决**：
- 确认 keystore 是同一个（`siamfeast.keystore`）
- SHA-1：`00:44:F9:03:0D:A3:87:E6:58:E2:17:69:6D:09:B0:FE:7C:96:52:41`
- 启用 Play App Signing（让 Google 管理最终签名）

### Q3：Firebase Phone Auth 报 "App not authorized"

**原因**：包名或 SHA 指纹没配对。

**解决**：
1. Firebase Console → 项目设置 → 应用 → 确认包名 `com.nationalworld.siamfeast`
2. 确认 SHA-1 + SHA-256 都已配置
3. 重新下载 `google-services.json` 覆盖到 `static/firebase/`

### Q4：打包后启动白屏

**原因**：可能 HBuilderX 标准基座不含 UTS 插件依赖。

**解决**：
- **必须用「自定义调试基座」**（HBuilderX → 运行 → 运行到手机或模拟器 → 制作自定义调试基座）
- 或直接打 Release APK 测试

### Q5：打包后 APP 闪退

**原因**：可能是权限或签名问题。

**解决**：
1. 查看手机 logcat：`adb logcat | grep SiamFeast`
2. 确认 Android 权限都已在 manifest.json 配置
3. 确认 minSdkVersion = 21

### Q6：UTS 插件未生效

**原因**：HBuilderX 没正确识别 `uni_modules/sf-firebase-auth`。

**解决**：
1. 确认插件目录结构：
   ```
   uni_modules/sf-firebase-auth/
   ├─ package.json
   ├─ utssdk/
   │  ├─ app-android/
   │  │  ├─ config.json
   │  │  └─ index.uts
   │  └─ app-ios/
   │     ├─ config.json
   │     └─ index.uts
   ```
2. HBuilderX 重启
3. 重新打包（云打包会自动包含 UTS 插件）

---

## 七、版本升级清单

每次升级版本时：

| 项 | 操作 |
|---|---|
| manifest.json | `versionCode` 递增 +1（如 102 → 103）|
| manifest.json | `versionName` 更新（如 1.0.2 → 1.0.3）|
| git commit | `chore: bump version to 1.0.3` |
| HBuilderX 打包 | 用相同 keystore 签名 |
| Google Play | 上传新 AAB 到 Internal Testing |
| 测试 | 通过后发布到 Production |

---

## 八、关键信息速查卡

```
项目：SiamFeast
包名：com.nationalworld.siamfeast
appid：__UNI__D871704

Firebase 项目：siamfeast-294c0
Firebase API Key：AIzaSyBNCVlae_saIhURSNbJfSLBXP69b43Lg1Q

keystore 路径：D:\project\SiamFeast\keystore\siamfeast.keystore
keystore 密码：SiamFeast2026!
别名：siamfeast

SHA-1：00:44:F9:03:0D:A3:87:E6:58:E2:17:69:6D:09:B0:FE:7C:96:52:41
SHA-256：C8:6E:E1:D6:FE:E1:0F:25:89:6D:67:5B:3F:88:CD:9A:7F:25:3A:1D:AB:01:6F:C3:72:44:C9:21:30:83:1E:AC

公司主体：National World Group Co., Ltd.
联系邮箱：yijiamala888999@gmail.com
```

---

## 九、关联文档

- `docs/google-play/` — 上架 Google Play 文档（隐私政策 + 详情文案 + 数据安全）
- `keystore/README.md` — keystore 信息
- `docs/Firebase集成打包指南.md` — Firebase 集成详细步骤
- `docs/uniapp_Firebase短信验证码双端封装实施方案.md` — UTS 插件方案

---

## 十、打包清单（截图说明）

HBuilderX 云打包界面截图对应字段（按顺序填）：

1. **Android 软件包名称** → `com.nationalworld.siamfeast`
2. **Android 打包类型** → 选 `apk` 或 `aab`
3. **证书** → 选「使用自有证书」单选框
4. **证书文件** → 浏览选 `keystore/siamfeast.keystore`
5. **证书密码** → `SiamFeast2026!`
6. **证书别名** → `siamfeast`
7. **别名密码** → `SiamFeast2026!`
8. **打包类型** → 勾选「apk 安装包」或「aab 上架包」（按需）
9. **混淆** → 勾选
10. **高级配置** → minSdkVersion=21, targetSdkVersion=34
11. **点「打包」**

iOS 部分（如有证书）类似流程，但选 `.p12` 和 `.mobileprovision`。

---

## 十一、紧急情况

### keystore 丢失

**情况**：keystore 文件丢失或密码忘记。

**应对**：
- 如果启用了 Google Play App Signing → 可以恢复（联系 Google Play 支持）
- 如果没启用 → **应用无法升级，必须重新创建应用**

**预防**：keystore 必须备份到多个安全位置（云盘 + U盘 + 1Password）

### 证书泄露

**情况**：keystore 文件或密码被泄露。

**应对**：
1. 立即重新生成 keystore
2. 用新 keystore 打包上传新版本
3. 旧 keystore 签名的应用继续工作，但新版本无法用旧 keystore 签
4. 在 Firebase Console 重置 SHA 指纹

**预防**：keystore 不进 git，密码不在源码里
