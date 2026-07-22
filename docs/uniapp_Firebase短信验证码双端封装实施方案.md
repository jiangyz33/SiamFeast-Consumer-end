# uni-app Firebase 短信验证码双端封装实施方案

> 文档版本：1.0  
> 编写日期：2026-07-13  
> 适用项目：经典 uni-app（Vue 2 / Vue 3，App 平台）  
> 目标平台：Android / Google Play、iOS / App Store  
> Firebase 项目：建议 Android 与 iOS 使用同一个 Firebase Project

## 1. 实施结论

本项目不要在 App 中直接使用 Firebase Web SDK 的 `signInWithPhoneNumber`，也不要依赖 `manifest.json` 中不存在的 Firebase Phone Auth 开关。

正式方案为：

1. uni-app 页面负责手机号、验证码、倒计时和错误提示。
2. 新建一个双端 UTS 原生插件。
3. Android 端由 UTS 调用 Firebase Authentication Android SDK。
4. iOS 端由 UTS 调用 FirebaseAuth Apple SDK。
5. Firebase SDK 完成短信发送、验证码校验和应用真实性验证。
6. 客户端取得 Firebase ID Token 后提交给 Go 后端。
7. Go 后端只验证 Firebase ID Token，不接收和校验短信验证码。

整体流程：

```text
uni-app 验证码页面
        │
        ▼
双端 UTS 原生插件
  ├─ Android：Firebase Auth Android SDK
  └─ iOS：FirebaseAuth Apple SDK
        │
        ▼
Firebase 发送并校验短信验证码
        │
        ▼
Firebase ID Token
        │
        ▼
POST /api/v1/auth/firebase-login
        │
        ▼
Go 后端验证 Token，并返回业务 access_token / refresh_token
```

## 2. 工作职责划分

| 工作项 | 建议负责人 | 交付物 |
|---|---|---|
| 手机号登录页面 | uni-app 前端 | 手机号输入、验证码输入、倒计时、状态提示 |
| Android UTS 实现 | Android/移动端开发 | Firebase Kotlin SDK 封装 |
| iOS UTS 实现 | iOS/移动端开发 | Firebase Swift SDK 封装 |
| Firebase Console 配置 | 移动端或发布人员 | Android/iOS 应用、SHA、APNs、短信地区、测试号码 |
| Go 登录接口整改 | 后端开发 | 只信任已验证 Token 内的 UID、手机号和 Provider |
| Google Play 内测 | 发布人员 | AAB 内部测试版本 |
| TestFlight 内测 | 发布人员 | iOS TestFlight 版本 |

说明：这不是单纯的 Vue 页面工作。UTS 插件部分需要 Android Kotlin、iOS Swift 和移动端打包经验。

## 3. 实施前必须确认的参数

前端开始开发前，项目负责人需要提供以下正式参数：

```text
FIREBASE_PROJECT_ID       = Firebase 项目 ID
ANDROID_APPLICATION_ID    = Android 最终包名
IOS_BUNDLE_ID             = iOS 最终 Bundle ID
API_BASE_URL              = 正式后端 API 地址
ANDROID_UPLOAD_KEY        = Android 上传证书
IOS_TEAM_ID               = Apple Developer Team ID
IOS_APNS_KEY_ID           = APNs Auth Key ID
IOS_FIREBASE_ENCODED_ID   = Firebase iOS Encoded App ID
```

要求：

- Android 包名必须与 Firebase Android App 中登记的包名完全一致。
- iOS Bundle ID 区分大小写，必须与 Firebase iOS App 完全一致。
- 开发、自定义基座、TestFlight、Google Play 正式包不得随意更换包名。
- Android 与 iOS 应注册在同一个 Firebase Project 下，以共享 Firebase Authentication 用户库。

## 4. Firebase Console 配置

### 4.1 通用配置

在 Firebase Console 完成：

1. 打开 Authentication。
2. 在 Sign-in method 中启用 Phone Provider。
3. 在 Settings 中配置 SMS Region Policy。
4. 明确允许业务所在国家或地区；新项目默认可能不允许任何地区。
5. 绑定 Cloud Billing 结算账号，启用短信计费能力。
6. 配置开发测试手机号和固定验证码。
7. 生产环境开启配额监控和费用告警。

建议先使用 Firebase 测试手机号完成开发，避免开发阶段重复发送真实短信和触发风控。

### 4.2 Android App

在同一 Firebase Project 中添加 Android App：

- Package name：填写 `ANDROID_APPLICATION_ID`。
- 下载 `google-services.json`。
- 添加调试证书 SHA-1、SHA-256。
- 添加正式上传证书 SHA-1、SHA-256。
- Google Play 创建应用并启用 Play App Signing 后，再添加“应用签名密钥证书”的 SHA-1、SHA-256。

注意：Google Play 最终分发的 APK 使用 Play App Signing 证书签名，不一定是本地上传证书。缺少 Play 签名证书指纹会导致商店安装包的 Phone Auth 失败。

### 4.3 iOS App

在同一 Firebase Project 中添加 iOS App：

- Bundle ID：填写 `IOS_BUNDLE_ID`。
- 下载 `GoogleService-Info.plist`。
- 在 Apple Developer 为 App ID 开启 Push Notifications。
- 创建或使用 APNs Authentication Key（`.p8`）。
- 在 Firebase Console 上传 APNs Key，并填写 Key ID 与 Team ID。
- 开启 iOS Background Modes：
  - Background fetch
  - Remote notifications
- 配置 Firebase Encoded App ID URL Scheme，供 reCAPTCHA 回跳 App。

## 5. 前端目录结构

建议在 uni-app 前端项目中新增：

```text
项目根目录/
├─ uni_modules/
│  └─ sf-firebase-phone-auth/
│     ├─ package.json
│     └─ utssdk/
│        ├─ interface.uts
│        ├─ unierror.uts
│        ├─ app-android/
│        │  ├─ config.json
│        │  └─ index.uts
│        └─ app-ios/
│           ├─ config.json
│           └─ index.uts
├─ nativeResources/
│  ├─ android/
│  │  └─ google-services.json
│  └─ ios/
│     ├─ Resources/
│     │  └─ GoogleService-Info.plist
│     ├─ info.plist
│     └─ UniApp.entitlements
├─ services/
│  └─ firebase-phone-auth.ts
└─ pages/
   └─ login/
      └─ sms.vue
```

如果现有项目已经接入 Firebase FCM，必须复用同一个 Firebase App 配置，不能放置两份互相冲突的 `google-services.json` 或重复引入不同版本的 Firebase SDK。

## 6. UTS 插件对外接口

### 6.1 接口目标

页面层只调用统一接口，不直接接触 Kotlin、Swift、Firebase SDK 或 reCAPTCHA 实现。

建议插件提供：

```text
startPhoneVerification()  开始验证并发送短信
confirmPhoneCode()        提交验证码并取得 ID Token
getCurrentIdToken()       获取当前 Firebase 用户的新 Token
signOut()                 退出 Firebase 会话
```

### 6.2 `interface.uts` 建议定义

以下为接口约定，开发人员可根据项目当前 HBuilderX/UTS 语法做小幅调整，但字段语义不得改变。

```ts
export type PhoneAuthEventType =
  | 'codeSent'
  | 'autoVerified'
  | 'autoRetrievalTimeout'

export type PhoneAuthEvent = {
  type: PhoneAuthEventType
  verificationId?: string
  idToken?: string
  phoneNumber?: string
}

export type PhoneAuthError = {
  errCode: number
  errMsg: string
  code: string
  nativeCode?: string
}

export type StartPhoneVerificationOptions = {
  phoneNumber: string
  timeoutSeconds?: number
  onEvent: (event: PhoneAuthEvent) => void
  fail?: (error: PhoneAuthError) => void
}

export type ConfirmPhoneCodeResult = {
  idToken: string
  uid: string
  phoneNumber: string
}

export type ConfirmPhoneCodeOptions = {
  verificationId: string
  code: string
  success?: (result: ConfirmPhoneCodeResult) => void
  fail?: (error: PhoneAuthError) => void
}

export type GetCurrentIdTokenOptions = {
  forceRefresh?: boolean
  success?: (result: ConfirmPhoneCodeResult) => void
  fail?: (error: PhoneAuthError) => void
}
```

### 6.3 事件行为约定

| 事件 | Android | iOS | 页面行为 |
|---|---|---|---|
| `codeSent` | 支持 | 支持 | 保存 `verificationId`，显示验证码输入框 |
| `autoVerified` | 可能发生 | 通常不发生 | 直接用 `idToken` 调后端登录 |
| `autoRetrievalTimeout` | 可能发生 | 不适用 | 保留手工输入验证码流程 |

Android 可能先触发 `codeSent`，随后自动读取短信并触发 `autoVerified`，因此 `onEvent` 必须允许多次回调。

## 7. Android UTS 实现

### 7.1 Android 依赖

`uni_modules/sf-firebase-phone-auth/utssdk/app-android/config.json`：

```json
{
  "minSdkVersion": 23,
  "dependencies": [
    {
      "id": "firebase-bom",
      "source": "implementation platform('com.google.firebase:firebase-bom:34.15.0')"
    },
    {
      "id": "firebase-auth",
      "source": "implementation 'com.google.firebase:firebase-auth'"
    }
  ],
  "project": {
    "plugins": [
      "com.google.gms.google-services"
    ],
    "dependencies": [
      "com.google.gms:google-services:4.5.0"
    ]
  }
}
```

版本说明：以上为文档编写时的当前版本。正式项目应固定经过云打包和真机验证的版本，不要自动升级大版本。

### 7.2 Android 配置文件

放置：

```text
nativeResources/android/google-services.json
```

该文件的 `package_name` 必须与 Android 正式包名一致。

### 7.3 Android 实现流程

`startPhoneVerification()` 内部：

```text
校验 E.164 手机号
→ 获取当前 Activity
→ PhoneAuthOptions.newBuilder(FirebaseAuth.getInstance())
→ setPhoneNumber(phoneNumber)
→ setTimeout(60 seconds)
→ setActivity(currentActivity)
→ setCallbacks(callbacks)
→ PhoneAuthProvider.verifyPhoneNumber(options)
```

回调处理：

- `onCodeSent`
  - 返回 `codeSent` 事件和 `verificationId`。
  - `ForceResendingToken` 保存在插件原生内存中，不传给 JS。
- `onVerificationCompleted`
  - 调用 `FirebaseAuth.signInWithCredential()`。
  - 登录成功后调用 `getIdToken(true)`。
  - 返回 `autoVerified` 事件和 `idToken`。
- `onVerificationFailed`
  - 转换为统一错误码后返回页面。
- `onCodeAutoRetrievalTimeOut`
  - 返回 `autoRetrievalTimeout` 事件。

`confirmPhoneCode()` 内部：

```text
PhoneAuthProvider.getCredential(verificationId, code)
→ FirebaseAuth.signInWithCredential(credential)
→ FirebaseUser.getIdToken(true)
→ 返回 idToken、uid、phoneNumber
```

### 7.4 Android 注意事项

- 必须传入有效 Activity，否则 reCAPTCHA 回退会失败。
- 不申请 `READ_SMS`、`RECEIVE_SMS`、`SEND_SMS` 权限。
- Firebase 自动验证码能力不需要读取短信权限。
- 不把验证码、完整手机号、ID Token 写入日志。
- `verificationId` 需要在页面切后台或进程恢复时保留，但应设置较短有效期。
- 直接安装 APK 时可能进入 reCAPTCHA；从 Google Play 安装时通常优先使用 Play Integrity。
- 必须分别测试直接安装 APK 和 Google Play 内部测试安装包。

## 8. iOS UTS 实现

### 8.1 iOS 依赖

`uni_modules/sf-firebase-phone-auth/utssdk/app-ios/config.json`：

```json
{
  "deploymentTarget": "15.0",
  "dependencies-pods": [
    {
      "name": "FirebaseAuth",
      "version": "12.16.0"
    }
  ]
}
```

Firebase Apple SDK 12.x 最低支持 iOS 15。如果产品必须支持更低版本 iOS，需要由 iOS 开发人员选择并固定兼容的 Firebase 11.x 版本，同时重新执行全部测试。

### 8.2 iOS 配置文件

放置：

```text
nativeResources/ios/Resources/GoogleService-Info.plist
```

插件第一次调用前执行一次：

```swift
if FirebaseApp.app() == nil {
    FirebaseApp.configure()
}
```

### 8.3 iOS Info.plist

在项目原有 `nativeResources/ios/info.plist` 中合并，不能覆盖已有 URL Scheme：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeRole</key>
            <string>Editor</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>替换为_FIREBASE_ENCODED_APP_ID</string>
            </array>
        </dict>
    </array>

    <key>UIBackgroundModes</key>
    <array>
        <string>fetch</string>
        <string>remote-notification</string>
    </array>
</dict>
</plist>
```

如果项目已经配置 `CFBundleURLTypes` 或 `UIBackgroundModes`，必须合并数组内容，禁止整段替换。

### 8.4 iOS Push 与 APNs

Firebase Phone Auth 在 iOS 上优先通过静默 APNs 验证应用真实性，失败后回退到 reCAPTCHA。

必须完成：

1. Apple Developer 的 App ID 开启 Push Notifications。
2. 重新生成对应的开发和发布 Provisioning Profile。
3. Firebase Console 上传 APNs `.p8` Key。
4. 最终签名产物包含与 Profile 一致的 `aps-environment` entitlement。
5. 插件初始化后调用 `registerForRemoteNotifications()`。

静默 APNs 不需要向用户弹出通知授权提示。

默认不要设置：

```xml
<key>FirebaseAppDelegateProxyEnabled</key>
<false/>
```

即保持 Firebase App Delegate swizzling 默认开启。若现有推送插件强制关闭该能力，则必须由 iOS 开发人员手动转发 APNs Token、远程通知和 reCAPTCHA URL 回调，不能直接上线。

### 8.5 iOS 实现流程

`startPhoneVerification()`：

```text
FirebaseApp.configure（仅一次）
→ UIApplication.registerForRemoteNotifications
→ PhoneAuthProvider.provider().verifyPhoneNumber(phoneNumber)
→ 返回 verificationID
```

`confirmPhoneCode()`：

```text
PhoneAuthProvider.provider().credential(
    withVerificationID: verificationId,
    verificationCode: code
)
→ Auth.auth().signIn(with: credential)
→ user.getIDTokenForcingRefresh(true)
→ 返回 idToken、uid、phoneNumber
```

## 9. uni-app 调用层

### 9.1 统一 Service

新增 `services/firebase-phone-auth.ts`，职责为：

- 调用 UTS 插件。
- 规范化手机号为 E.164 格式。
- 保存短期 `verificationId`。
- 处理 Android 自动验证事件。
- 将 ID Token 提交后端。
- 统一转换页面错误提示。

调用示例：

```ts
import {
  startPhoneVerification,
  confirmPhoneCode
} from '@/uni_modules/sf-firebase-phone-auth'

export function sendFirebaseCode(phoneNumber: string, onEvent: Function) {
  startPhoneVerification({
    phoneNumber,
    timeoutSeconds: 60,
    onEvent: async (event) => {
      if (event.type === 'codeSent') {
        uni.setStorageSync('firebase_verification_id', event.verificationId)
      }

      if (event.type === 'autoVerified' && event.idToken) {
        await loginByFirebaseIdToken(event.idToken)
      }

      onEvent(event)
    },
    fail: (error) => {
      throw error
    }
  })
}

export function verifyFirebaseCode(code: string) {
  const verificationId = uni.getStorageSync('firebase_verification_id')

  return new Promise((resolve, reject) => {
    confirmPhoneCode({
      verificationId,
      code,
      success: async (result) => {
        try {
          const loginResult = await loginByFirebaseIdToken(result.idToken)
          resolve(loginResult)
        } catch (error) {
          reject(error)
        }
      },
      fail: reject
    })
  })
}
```

该代码为调用层结构示例，最终函数名以 `interface.uts` 实际导出为准。

### 9.2 页面状态

`pages/login/sms.vue` 至少维护：

```text
phoneNumber
verificationCode
verificationId
sending
verifying
countdown
errorMessage
```

页面要求：

- 国家码与手机号分开输入或使用可靠的国际手机号组件。
- 发送前转换为 E.164，例如泰国 `+66812345678`。
- 发送成功后开始 60 秒倒计时。
- 防止按钮重复点击。
- 验证中禁止重复提交。
- Android 自动验证成功时直接进入登录完成流程。
- 页面销毁时停止倒计时，不输出敏感日志。

## 10. Go 后端接口契约

### 10.1 目标请求

前端只提交 Firebase ID Token：

```http
POST /api/v1/auth/firebase-login
Content-Type: application/json
```

```json
{
  "id_token": "<Firebase ID Token>"
}
```

### 10.2 目标响应

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "expires_in": 259200,
  "role": "consumer",
  "user_id": 10001,
  "is_new_user": false,
  "user": {
    "id": 10001,
    "nickname": "User_5678",
    "phone": "+66812345678",
    "avatar_url": null
  }
}
```

### 10.3 后端发布前置项（P0）

后端必须：

- 使用 Firebase Admin SDK 验证 ID Token。
- 从 Token 读取 `uid`、`phone_number`、`firebase.sign_in_provider`。
- Phone 登录要求 Token 的真实 Provider 为 `phone`。
- Phone 登录要求 Token 内存在 `phone_number`。
- 禁止使用客户端提交的手机号作为备用身份。
- 已有账号绑定了不同 Firebase UID 时禁止直接覆盖。
- 给 `users.firebase_uid` 增加唯一约束或唯一部分索引。
- 增加 Provider 伪造、手机号冒领、重复绑定和正常登录测试。

当前后端接口仍要求客户端提交 `provider`，并允许手机号备用字段。该逻辑必须在正式联调前整改；前端不得依赖这些不安全字段。

## 11. 统一错误码

UTS 插件需要把两端原生错误转换为统一业务码，同时保留 `nativeCode` 供脱敏排障。

| 统一错误码 | 页面提示 | 常见原因 |
|---|---|---|
| `PHONE_AUTH_INVALID_PHONE` | 手机号格式不正确 | 非 E.164、国家码错误 |
| `PHONE_AUTH_TOO_MANY_REQUESTS` | 请求过于频繁，请稍后重试 | Firebase 风控或频率限制 |
| `PHONE_AUTH_QUOTA_EXCEEDED` | 验证服务暂不可用 | 计费、配额或地区策略 |
| `PHONE_AUTH_INVALID_CODE` | 验证码错误 | 用户输入错误 |
| `PHONE_AUTH_SESSION_EXPIRED` | 验证码已过期，请重新获取 | verificationId/code 过期 |
| `PHONE_AUTH_APP_NOT_AUTHORIZED` | 当前安装包未获授权 | 包名、Bundle ID、SHA、APNs 配置错误 |
| `PHONE_AUTH_RECAPTCHA_FAILED` | 安全验证失败，请重试 | Activity/URL Scheme/API Key 配置错误 |
| `PHONE_AUTH_NETWORK_ERROR` | 网络连接失败 | 无法访问 Firebase 服务 |
| `PHONE_AUTH_CANCELLED` | 已取消验证 | 用户关闭 reCAPTCHA |
| `PHONE_AUTH_UNKNOWN` | 验证失败，请稍后重试 | 未识别的原生错误 |

日志只能记录：

```text
平台、App 版本、统一错误码、nativeCode、Firebase SDK 版本、构建渠道
```

禁止记录：

```text
短信验证码、完整手机号、ID Token、refresh_token、APNs Key、服务账号 JSON
```

## 12. 打包与联调流程

### 12.1 Android

1. 使用最终包名创建 Firebase Android App。
2. 添加自定义基座签名证书 SHA-1/SHA-256。
3. 制作 Android 自定义调试基座。
4. 使用 Firebase 测试号码完成发送与验证。
5. 打 Release APK，验证 reCAPTCHA 回退。
6. 打 `GooglePlay(AAB)`。
7. 上传 Google Play Internal Testing。
8. 从 Play Store 内部测试链接安装应用。
9. 将 Play App Signing SHA-1/SHA-256 添加到 Firebase。
10. 再测试真实手机号和 Play Integrity 流程。

不能只测试本地 APK后直接发布。

### 12.2 iOS

1. 使用最终 Bundle ID 创建 Firebase iOS App。
2. 配置 Apple App ID Push Notifications。
3. 上传 APNs Key 到 Firebase。
4. 生成新的开发与发布 Provisioning Profile。
5. 制作 iOS 自定义调试基座或开发 IPA。
6. 在真实 iPhone 上测试静默 APNs。
7. 关闭“后台 App 刷新”，测试 reCAPTCHA 回退。
8. 打正式 IPA 并上传 TestFlight。
9. 从 TestFlight 安装并用真实号码测试。
10. 完成后再提交 App Store 审核。

标准运行基座无法包含新增加的 UTS 原生依赖，必须使用自定义基座或完整云打包。

## 13. 测试矩阵

| 编号 | 平台/渠道 | 测试场景 | 预期结果 |
|---|---|---|---|
| T01 | Android 自定义基座 | Firebase 测试号码 | 可发送、可验证、可换业务 Token |
| T02 | Android APK | reCAPTCHA 回退 | 浏览器验证后能返回 App |
| T03 | Google Play 内测 | Play Integrity | 无需异常跳转，可正常收码登录 |
| T04 | Android | 自动读取验证码 | 自动验证成功或正常回退手输 |
| T05 | iOS 真机 | 后台刷新开启 | 静默 APNs 验证成功 |
| T06 | iOS 真机 | 后台刷新关闭 | 自动进入 reCAPTCHA 并返回 App |
| T07 | TestFlight | 真实手机号 | 可收码、可登录、可刷新业务 Token |
| T08 | 双平台 | 同一手机号登录 | 命中同一 Firebase 用户和业务用户 |
| T09 | 双平台 | 错误验证码 | 返回统一错误，不创建业务用户 |
| T10 | 双平台 | 验证码过期 | 提示重新获取验证码 |
| T11 | 双平台 | 连续重复发送 | 前端倒计时和 Firebase 风控均生效 |
| T12 | 双平台 | 发送后杀进程再打开 | 可恢复会话或明确要求重新发送 |
| T13 | 双平台 | 弱网/断网 | 返回网络错误，页面可重试 |
| T14 | 后端 | 伪造 provider/phone | 必须拒绝，不得绑定他人账号 |
| T15 | 后端 | 无效或过期 ID Token | 返回 401 |

真实短信至少覆盖业务目标地区的两家以上运营商。

## 14. 验收标准

### 14.1 功能验收

- Android 与 iOS 使用同一套页面 API。
- 两端均能发送验证码、验证验证码并取得 Firebase ID Token。
- Android 自动验证和手工验证码两条路径都能工作。
- iOS 静默 APNs 与 reCAPTCHA 两条路径都能工作。
- 后端可用 Firebase ID Token 换取业务 Token。
- 同一手机号在两个平台登录时不会产生重复业务账号。

### 14.2 打包验收

- Android AAB 可上传 Google Play。
- 从 Google Play 内部测试安装后可正常登录。
- iOS IPA 可上传 TestFlight。
- 从 TestFlight 安装后可正常登录。
- Release 包不依赖开发开关、测试旁路或调试证书。

### 14.3 安全验收

- App 中不存在 `firebase-service-account.json`。
- 客户端不保存服务账号私钥、APNs `.p8` 文件或后端密钥。
- 后端不信任客户端提交的手机号和 Provider。
- Firebase UID 不能覆盖绑定到其他用户。
- 日志中不存在验证码、完整手机号或 Token。
- `FIREBASE_DEV_BYPASS=false`。

## 15. 隐私与应用商店申报

上线前更新隐私政策并明确：

- 手机号用于登录和身份验证。
- 手机号会提交给 Firebase/Google 进行验证和反滥用处理。
- 可能产生短信费用。
- 用户可通过指定方式申请账号注销。

Google Play Data Safety 与 Apple App Privacy 中应按实际情况申报手机号、身份标识和第三方 Firebase SDK 数据处理行为。

## 16. 禁止事项

- 禁止在 uni-app App 构建中使用 Web `RecaptchaVerifier` 作为主方案。
- 禁止认为勾选 FCM 或 Google 登录模块就包含 Phone Auth。
- 禁止把 Firebase Service Account JSON 放入前端项目。
- 禁止把短信验证码提交 Go 后端进行 Firebase 校验。
- 禁止相信客户端传入的手机号、邮箱或 Provider 完成账号绑定。
- 禁止只测试 HBuilderX 标准基座。
- 禁止只测试本地 APK/开发 IPA 后直接发布。
- 禁止在没有 Play App Signing SHA 的情况下发布 Google Play。
- 禁止在没有 APNs 与 reCAPTCHA 回退测试的情况下提交 App Store。

## 17. 前端交付物

前端完成后需要提交：

```text
1. sf-firebase-phone-auth UTS 插件完整源码
2. Android config.json 和 index.uts
3. iOS config.json 和 index.uts
4. interface.uts 和统一错误码
5. services/firebase-phone-auth.ts
6. pages/login/sms.vue
7. Firebase 客户端配置文件放置说明
8. Android 自定义基座测试记录
9. Google Play Internal Testing 测试记录
10. iOS 真机 APNs/reCAPTCHA 测试记录
11. TestFlight 测试记录
12. 已知问题与 SDK 固定版本说明
```

## 18. 建议排期

以下为有 Android/iOS 原生经验开发人员的参考排期：

| 阶段 | 参考时间 |
|---|---:|
| Firebase Console 与证书准备 | 0.5～1 天 |
| 公共接口与 Android UTS 实现 | 1～1.5 天 |
| iOS UTS、APNs、reCAPTCHA 实现 | 1.5～2 天 |
| uni-app 页面与后端联调 | 1 天 |
| Play Internal/TestFlight 回归 | 1～2 天 |
| 合计 | 5～7.5 天 |

不包含 Apple/Google 商店人工审核等待时间。

## 19. 官方参考资料

- uni-app UTS 插件：<https://uniapp.dcloud.net.cn/plugin/uts-plugin.html>
- uni-app Android UTS 配置：<https://uniapp.dcloud.net.cn/plugin/uts-for-android.html>
- uni-app iOS UTS 配置：<https://uniapp.dcloud.net.cn/plugin/uts-for-ios>
- uni-app iOS 原生资源：<https://uniapp.dcloud.net.cn/tutorial/app-nativeresource-ios.html>
- Firebase Android Phone Auth：<https://firebase.google.com/docs/auth/android/phone-auth>
- Firebase iOS Phone Auth：<https://firebase.google.com/docs/auth/ios/phone-auth>
- Firebase Android 初始化：<https://firebase.google.com/docs/android/setup>
- Firebase Apple 初始化：<https://firebase.google.com/docs/ios/setup>
- Firebase ID Token 后端验证：<https://firebase.google.com/docs/auth/admin/verify-id-tokens>
- DCloud Google Play 打包：<https://uniapp.dcloud.net.cn/tutorial/android-gp.html>

