# HBuilderX 强制移除权限操作文档

> 项目:SiamFeast
> 日期:2026-07-19
> 目的:解决 Google Play 上架被拒 - 移除 DCloud SDK 注入的媒体权限
> 配合插件:`uni-chooseSystemImage`(已导入)

---

## 一、问题背景

DCloud 5+ Runtime SDK(PandoraEntry)在云打包时**强制注入**以下权限:

- `READ_MEDIA_IMAGES`
- `READ_MEDIA_VIDEO`
- `READ_EXTERNAL_STORAGE`
- `WRITE_EXTERNAL_STORAGE`
- `READ_MEDIA_VISUAL_USER_SELECTED`
- `READ_PHONE_STATE`

**这些权限无法通过 manifest.json 普通方式移除**:
- ❌ `permissions` 数组加 `tools:node="remove"` → HBuilderX 不识别 namespace
- ❌ `excludePermissions` 字段用双标签格式 → HBuilderX 报错"格式不正确"
- ❌ `nativeResources/android/AndroidManifest.xml` → HBuilderX 不合并

**正确方法**:用 `excludePermissions` 字段,**严格使用单标签自闭合格式** `<uses-permission ... />`。

---

## 二、操作步骤

### Step 1:打开 manifest.json 源码视图

HBuilderX 打开项目根目录的 `manifest.json` → 点顶部 tab 切换到 **"源码视图"**。

### Step 2:找到 android 配置节点

定位到:
```
app-plus → distribute → android
```

### Step 3:在 permissions 数组同级,新增 excludePermissions 数组

⚠️ **格式必须严格按下面的写法,否则 HBuilderX 报"格式不正确"**:

```json
"android" : {
    "minSdkVersion" : 21,
    "targetSdkVersion" : 35,
    "permissions" : [
        "<uses-permission android:name=\"android.permission.INTERNET\"/>",
        "<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\"/>",
        "<uses-permission android:name=\"android.permission.VIBRATE\"/>",
        "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\"/>",
        "<uses-feature android:name=\"android.hardware.camera.autofocus\"/>",
        "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
        "<uses-permission android:name=\"android.permission.CAMERA\"/>",
        "<uses-permission android:name=\"android.permission.CHANGE_WIFI_STATE\"/>",
        "<uses-permission android:name=\"android.permission.WAKE_LOCK\"/>",
        "<uses-feature android:name=\"android.hardware.camera\"/>",
        "<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>",
        "<uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\"/>",
        "<uses-permission android:name=\"com.google.android.gms.permission.AD_ID\"/>"
    ],
    "excludePermissions" : [
        "<uses-permission android:name=\"android.permission.READ_MEDIA_IMAGES\"/>",
        "<uses-permission android:name=\"android.permission.READ_MEDIA_VIDEO\"/>",
        "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>",
        "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>",
        "<uses-permission android:name=\"android.permission.READ_MEDIA_VISUAL_USER_SELECTED\"/>",
        "<uses-permission android:name=\"android.permission.READ_PHONE_STATE\"/>"
    ]
},
```

### ⚠️ 关键格式要求(容易踩坑)

| 格式 | 是否正确 | 说明 |
|---|---|---|
| `<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>` | ✅ **正确** | **单标签自闭合**(HBuilderX 要求的格式) |
| `<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"></uses-permission>` | ❌ 错误 | 双标签格式会报"格式不正确" |
| `<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" tools:node="remove"/>` | ❌ 错误 | 在 permissions 数组里加 tools:node 无效 |
| 缺少 `<uses-permission` 前缀 | ❌ 错误 | 必须完整 XML 标签 |
| 缺少 `/>` 结尾 | ❌ 错误 | 必须自闭合 |

### ⚠️ 重复权限陷阱(HBuilderX 报"与额外添加的权限存在重复数据")

**同一个权限不能同时出现在 `permissions` 和 `excludePermissions` 数组里**。

如果你之前在 `permissions` 数组里加过 `tools:node="remove"` 的项:

```json
"permissions" : [
    ...,
    "<uses-permission android:name=\"android.permission.READ_MEDIA_IMAGES\" tools:node=\"remove\"/>"  // ❌ 错误
]
```

**必须把这些 `tools:node="remove"` 项全部从 `permissions` 数组里删除**,只保留在 `excludePermissions` 里:

```json
"permissions" : [
    "<uses-permission android:name=\"android.permission.INTERNET\"/>",
    "<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\"/>",
    ... (只保留实际要用的权限,不要带 tools:node="remove")
],
"excludePermissions" : [
    "<uses-permission android:name=\"android.permission.READ_MEDIA_IMAGES\"/>",
    ...
]
```

### ⚠️ JSON 引号转义陷阱(最常见的报错原因)

在 manifest.json 的 JSON 字符串里,XML 属性的**双引号必须用反斜杠转义**:

- ✅ 正确:`"<uses-permission android:name=\"android.permission.READ_MEDIA_IMAGES\"/>"`
- ❌ 错误:`"<uses-permission android:name=\\\"android.permission.READ_MEDIA_IMAGES\\\"/>"`(转义过度,变成 `\\\"`)
- ❌ 错误:`"<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>"`(没转义,JSON 解析失败)

**正确做法**:每对双引号前面**只有一个反斜杠** `\`,不是两个 `\\`。

如果你用 HBuilderX 可视化界面填,它会自动处理转义;如果你手动改源码,必须自己确保转义正确。

### Step 4:保存(Ctrl + S)

保存后,**HBuilderX 顶部不应该再报"格式不正确"错误**。

如果还报错,检查:
- JSON 语法(逗号、引号、括号)
- 是否正确使用了 `/>` 自闭合格式
- **是否与 permissions 数组有重复权限**(报"与额外添加的权限存在重复数据")
- **引号转义是否正确**(单反斜杠 `\` 而不是双反斜杠 `\\`)
- 字段名拼写:`excludePermissions`(注意大小写、复数 s)

### Step 5:重新云打包

HBuilderX → **发行 → 原生 App-云打包 → Android → AAB**

### Step 6:验证 AAB

打完后,用以下 Python 脚本验证 AAB 是否真的移除了权限:

```python
import zipfile
aab = r'D:/path/to/your.aab'
with zipfile.ZipFile(aab) as z:
    data = z.read('base/manifest/AndroidManifest.xml')

for p in ['READ_MEDIA_IMAGES', 'READ_MEDIA_VIDEO', 'READ_EXTERNAL_STORAGE',
          'WRITE_EXTERNAL_STORAGE', 'READ_MEDIA_VISUAL_USER_SELECTED', 'READ_PHONE_STATE']:
    full = f'android.permission.{p}'
    found = full.encode() in data
    print('STILL HAS' if found else 'CLEAN    ', full)
```

期望全部输出 `CLEAN`。

### Step 5:重新云打包

HBuilderX → **发行 → 原生 App-云打包 → Android → AAB**

### Step 6:验证 AAB

打完后,用以下 Python 脚本验证 AAB 是否真的移除了权限:

```python
import zipfile
aab = r'D:/path/to/your.aab'
with zipfile.ZipFile(aab) as z:
    data = z.read('base/manifest/AndroidManifest.xml')

for p in ['READ_MEDIA_IMAGES', 'READ_MEDIA_VIDEO', 'READ_EXTERNAL_STORAGE',
          'WRITE_EXTERNAL_STORAGE', 'READ_MEDIA_VISUAL_USER_SELECTED', 'READ_PHONE_STATE']:
    full = f'android.permission.{p}'
    found = full.encode() in data
    print('STILL HAS' if found else 'CLEAN    ', full)
```

期望全部输出 `CLEAN`。

---

## 三、操作完成后上传 Google Play

1. 上传 AAB 到 Google Play Console
2. **应用内容 → 数据安全**:
   - 照片和视频:**选"否"**(因为 AAB 已无相关权限)
3. **应用内容 → 照片和视频访问**:
   - 如果 Google Play 还弹这个表单,说明 AAB 仍有权限
   - 如果不弹,说明权限移除成功 ✅
4. 提交审核

---

## 四、如果 excludePermissions 不生效

### 方案 A:用 HBuilderX 可视化界面

1. 双击 manifest.json(可视化界面)
2. 找 **"App 权限配置"** 标签
3. 找 **"强制移除的权限"** 输入框
4. 粘贴 6 个权限(单标签自闭合格式)

### 方案 B:升级 HBuilderX

下载最新版 HBuilderX:
- 正式版:https://www.dcloud.io/hbuilderx.html
- Alpha 版(功能最全):https://ask.dcloud.net.cn/article/131

### 方案 C:接受现状,填权限声明表单

如果以上都不行,**走 Google Play 权限声明表单**路径。

填这个理由:
```
Permission is auto-injected by DCloud PandoraEntry SDK framework, not requested by our app code. App uses Android system Photo Picker (via uni-chooseSystemMedia plugin) for avatar upload only. Cannot be removed from third-party SDK build.
```

---

## 五、当前 SiamFeast 项目状态

### 已就绪

- ✅ `uni-chooseSystemImage` 插件已导入
- ✅ `pages/settings/index.vue` 已改用 `chooseSystemMedia` API
- ✅ Facebook SDK 已移除(Facebook 相关权限已干净)
- ✅ manifest.json `permissions` 已清理(只保留必要权限)

### 待做

- ⬜ 在 manifest.json 加 `excludePermissions` 字段(本文档操作)
- ⬜ 重新打 AAB
- ⬜ 验证 AAB 权限是否真的被移除
- ⬜ 上传 Google Play

---

## 六、常见问题

### Q1:为什么我之前填的格式报错?

之前用的是 **双标签**:`<uses-permission ...></uses-permission>`

HBuilderX 要求的是 **单标签自闭合**:`<uses-permission ... />`

参考 HBuilderX 自己的 `permissions` 字段格式(都是自闭合的 `<uses-permission .../>`)。

### Q2:excludePermissions 字段在哪个版本支持?

- **uni-app x 项目**:从设计之初就支持
- **uni-app(老项目)**:HBuilderX 4.x 之后部分版本支持,建议升级到最新版

### Q3:如果 excludePermissions 完全不被识别?

可能你的 HBuilderX 版本太老或不支持这个字段。这种情况下,这些权限**无法从 AAB 移除**,只能:
- 走 Google Play 权限声明表单
- 或升级 HBuilderX 到最新版

### Q4:权限声明表单填什么?

**READ_MEDIA_IMAGES 字段**:
```
Permission auto-injected by DCloud PandoraEntry SDK, not used by app code. App uses Android system Photo Picker (uni-chooseSystemMedia plugin) for avatar upload only.
```

**READ_MEDIA_VIDEO 字段**:
```
Auto-injected by DCloud PandoraEntry SDK. App does not access videos. Cannot be removed from third-party SDK build.
```

---

## 七、参考文档

- [DCloud 官方文档 - Android 原生应用清单文件和资源](https://uniapp.dcloud.net.cn/tutorial/app-nativeresource-android.html)
- [DCloud 官方插件 - uni-chooseSystemMedia](https://ext.dcloud.net.cn/plugin?id=uni-chooseSystemImage)
- [Google Play - 照片和视频访问权限政策](https://support.google.com/googleplay/android-developer/answer/14115180)
- [manifest.json 应用配置 - uni-app 官方](https://uniapp.dcloud.net.cn/collocation/manifest.html)

---

## 八、操作完成后反馈

完成后,告诉前端 jiangyz33:
1. HBuilderX 是否还报"格式不正确"?
2. 重新打 AAB 后,AAB 路径(用于验证权限是否移除)
