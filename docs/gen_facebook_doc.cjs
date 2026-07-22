/**
 * 生成 Facebook 开发者配置 Word 文档
 */
const fs = require('fs')
const {
	Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
	Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
	ShadingType, LevelFormat, PageBreak
} = require('docx')

const FONT = 'Microsoft YaHei'

const children = [
	// ========== 标题 ==========
	new Paragraph({
		heading: HeadingLevel.TITLE,
		alignment: AlignmentType.CENTER,
		children: [new TextRun({ text: 'Facebook 开发者配置信息', font: FONT })]
	}),
	new Paragraph({
		alignment: AlignmentType.CENTER,
		spacing: { after: 360 },
		children: [new TextRun({ text: 'SiamFeast 项目  ·  2026-07', color: '666666', size: 22, font: FONT })]
	}),

	// ========== 一、Android 平台配置 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '一、Android 平台配置（填入 Facebook 后台）', font: FONT })]
	}),
	new Paragraph({
		spacing: { after: 120 },
		children: [new TextRun({ text: '路径：Facebook 后台 → 设置 → 基本 → 添加平台 → Android', size: 22, italics: true, color: '666666', font: FONT })]
	}),

	// 表格
	buildTable([
		['字段', '填写值'],
		['Google Play 包名', 'com.nationalworld.siamfeast'],
		['类名（主 Activity）', 'io.dcloud.PandoraEntry'],
		['密钥散列（SHA-1 Base64）', 'AET5Aw2jh+ZY4hdpbQmw/nyWUkE='],
		['密钥散列（SHA-256 Base64）', 'yG7h1v7hDyWJbWdbP4jNmn8lOh2rAW/DckTJITCDHqw=']
	]),

	new Paragraph({ spacing: { after: 120 }, children: [] }),

	// 提示
	buildCallout('提示：密钥散列必须配置，否则 Facebook 登录会报错「无效的密钥散列」。SHA-1 和 SHA-256 两个都填上更稳。'),

	new Paragraph({ children: [new PageBreak()] }),

	// ========== 二、keystore 信息 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '二、Android 签名证书（keystore）信息', font: FONT })]
	}),

	buildTable([
		['字段', '值'],
		['keystore 文件路径', 'D:\\project\\SiamFeast\\keystore\\siamfeast.keystore'],
		['keystore 密码', 'SiamFeast2026!'],
		['证书别名', 'siamfeast'],
		['别名密码', 'SiamFeast2026!'],
		['SHA-1（冒号分隔）', '00:44:F9:03:0D:A3:87:E6:58:E2:17:69:6D:09:B0:FE:7C:96:52:41'],
		['SHA-256（冒号分隔）', 'C8:6E:E1:D6:FE:E1:0F:25:89:6D:67:5B:3F:88:CD:9A:7F:25:3A:1D:AB:01:6F:C3:72:44:C9:21:30:83:1E:AC'],
		['SHA-1（纯 hex）', '0044F9030DA387E658E217696D09B0FE7C965241'],
		['SHA-256（纯 hex）', 'C86EE1D6FEE10F25896D675B3F88CD9A7F253A1DAB016FC37244C92130831EAC'],
		['有效期', '36500 天（2026-2126）'],
		['密钥算法', 'RSA 2048 位']
	]),

	new Paragraph({ spacing: { after: 240 }, children: [] }),

	// ========== 三、生成密钥散列的命令 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '三、生成密钥散列的命令（备用）', font: FONT })]
	}),
	new Paragraph({
		spacing: { after: 120 },
		children: [new TextRun({ text: '如果以后更换 keystore，用以下命令重新生成密钥散列：', font: FONT })]
	}),

	// 方法 1
	new Paragraph({
		spacing: { before: 120, after: 60 },
		children: [new TextRun({ text: '方法 1：直接从 keystore 生成（推荐，一条命令）', bold: true, font: FONT })]
	}),
	buildCodeBlock('keytool -exportcert -alias siamfeast -keystore D:\\project\\SiamFeast\\keystore\\siamfeast.keystore | openssl sha1 -binary | openssl base64'),
	new Paragraph({
		spacing: { before: 60, after: 240 },
		children: [
			new TextRun({ text: '输入密码：', font: FONT }),
			new TextRun({ text: 'SiamFeast2026!', bold: true, color: 'C00000', font: FONT })
		]
	}),

	// 方法 2
	new Paragraph({
		spacing: { before: 120, after: 60 },
		children: [new TextRun({ text: '方法 2：已知 SHA-1 转 Base64', bold: true, font: FONT })]
	}),
	buildCodeBlock('echo -n "0044F9030DA387E658E217696D09B0FE7C965241" | xxd -r -p | base64'),

	new Paragraph({ children: [new PageBreak()] }),

	// ========== 四、Facebook 应用 ID / Secret ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '四、Facebook 应用 ID 和密钥', font: FONT })]
	}),
	new Paragraph({
		spacing: { after: 240 },
		children: [new TextRun({ text: '在 Facebook 后台「设置 → 基本」页面顶部能看到，填完 Android 平台信息后获取：', font: FONT })]
	}),

	buildTable([
		['字段', '说明', '获取后填到哪'],
		['App ID', '15 位数字（形如 1234567890123456）', '前端 manifest.json 的 Facebook OAuth 配置'],
		['App Secret', '32 位字符串', '⚠️ 仅后端使用，加密发给后端，不要放前端'],
		['Client Token', '约 32 位字符串', '前端 SDK 初始化用']
	]),

	new Paragraph({ spacing: { after: 240 }, children: [] }),

	buildCallout('⚠️ 安全警告：App Secret 是敏感信息，严禁提交到 git、放在前端代码或日志里。只通过加密渠道（如 1Password、企业 IM）发给后端。'),

	new Paragraph({ children: [new PageBreak()] }),

	// ========== 五、公司主体信息 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '五、应用主体信息（填 Facebook 应用详情）', font: FONT })]
	}),

	buildTable([
		['字段', '值'],
		['应用名称', 'SiamFeast'],
		['显示名称', 'SiamFeast 暹罗盛宴'],
		['联系邮箱', 'yijiamala888999@gmail.com'],
		['隐私政策 URL', 'https://h5.siamfeast.com/privacy-policy.html'],
		['用户协议 URL', 'https://h5.siamfeast.com/terms.html'],
		['应用图标', '512×512 PNG'],
		['应用类别', '美食餐饮（Food & Drink）'],
		['公司主体', 'National World Group Co., Ltd.'],
		['公司地址', '368/66 PATIO WATCHARAPOL - RAMINDRA, WATCHARAPOL RD, THA RAENG, BANG KHEN, BANGKOK 10220'],
		['公司电话', '+66 98 591 3247'],
		['联系人', 'National World'],
		['联系人电话', '+66 83 010 6391']
	]),

	new Paragraph({ spacing: { after: 240 }, children: [] }),

	// ========== 六、前后端对接 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '六、前后端对接说明', font: FONT })]
	}),

	// 前端
	new Paragraph({
		heading: HeadingLevel.HEADING_2,
		children: [new TextRun({ text: '6.1 前端（C 端 APP）', font: FONT })]
	}),
	buildBulletList([
		'在 manifest.json → App 模块配置 → OAuth → 勾选「Facebook」',
		'填入 Facebook App ID',
		'打包 APK 后，调用 Facebook SDK 弹出登录授权页',
		'用户授权后拿到 Facebook Access Token',
		'调后端 /auth/firebase-login（provider=facebook）传 token'
	]),

	// 后端
	new Paragraph({
		heading: HeadingLevel.HEADING_2,
		children: [new TextRun({ text: '6.2 后端', font: FONT })]
	}),
	buildBulletList([
		'接收前端传来的 Firebase ID Token（provider=facebook）',
		'用 Firebase Admin SDK 验证 token',
		'从 token 提取 uid、email、display_name',
		'查 users 表 → 不存在则创建新用户',
		'签发自家 JWT 返回给前端'
	]),

	// 流程图
	new Paragraph({
		heading: HeadingLevel.HEADING_2,
		children: [new TextRun({ text: '6.3 登录流程', font: FONT })]
	}),
	buildCodeBlock([
		'用户点「Facebook 登录」',
		'   ↓',
		'前端调 Facebook SDK 弹出授权页',
		'   ↓',
		'用户点「继续」',
		'   ↓',
		'Facebook 返回 Access Token',
		'   ↓',
		'前端用 Firebase SDK signInWithCredential(FacebookAuthProvider.credential(token))',
		'   ↓',
		'Firebase 返回 Firebase ID Token',
		'   ↓',
		'前端 POST /api/v1/auth/firebase-login',
		'   body: { provider: "facebook", id_token: "<Firebase ID Token>" }',
		'   ↓',
		'后端验证 ID Token + get-or-create 用户 + 签自家 JWT',
		'   ↓',
		'前端存 JWT → 跳转首页'
	].join('\n')),

	new Paragraph({ children: [new PageBreak()] }),

	// ========== 七、测试 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '七、测试与上线', font: FONT })]
	}),

	new Paragraph({
		heading: HeadingLevel.HEADING_2,
		children: [new TextRun({ text: '7.1 开发期（测试模式）', font: FONT })]
	}),
	buildBulletList([
		'Facebook 后台 → 应用评审 → 测试 → 添加测试用户邮箱',
		'只有测试用户能用 Facebook 登录',
		'不消耗 Facebook 审核配额'
	]),

	new Paragraph({
		heading: HeadingLevel.HEADING_2,
		children: [new TextRun({ text: '7.2 上线（正式发布）', font: FONT })]
	}),
	buildBulletList([
		'Facebook 后台 → 应用评审 → 权限和功能 → 申请 public_profile + email 高级访问权',
		'审核约 1-3 个工作日',
		'审核通过后所有用户都能用 Facebook 登录',
		'切换应用状态：「开发中」→「正式」'
	]),

	// 关键信息卡
	new Paragraph({
		heading: HeadingLevel.HEADING_2,
		children: [new TextRun({ text: '7.3 关键速查', font: FONT })]
	}),
	buildCallout([
		'Facebook Android 平台配置：',
		'  Google Play 包名: com.nationalworld.siamfeast',
		'  类名: io.dcloud.PandoraEntry',
		'  密钥散列 (SHA-1 Base64): AET5Aw2jh+ZY4hdpbQmw/nyWUkE=',
		'  密钥散列 (SHA-256 Base64): yG7h1v7hDyWJbWdbP4jNmn8lOh2rAW/DckTJITCDHqw=',
		'',
		'keystore:',
		'  路径: D:\\project\\SiamFeast\\keystore\\siamfeast.keystore',
		'  密码: SiamFeast2026!',
		'  别名: siamfeast',
		'  SHA-1: 00:44:F9:03:0D:A3:87:E6:58:E2:17:69:6D:09:B0:FE:7C:96:52:41',
		'  SHA-256: C8:6E:E1:D6:FE:E1:0F:25:89:6D:67:5B:3F:88:CD:9A:7F:25:3A:1D:AB:01:6F:C3:72:44:C9:21:30:83:1E:AC'
	].join('\n'))
]


// ========== 辅助函数 ==========

function buildTable(rows) {
	return new Table({
		width: { size: 100, type: WidthType.PERCENTAGE },
		rows: rows.map((row, idx) => new TableRow({
			children: row.map(cell => new TableCell({
				shading: idx === 0 ? { type: ShadingType.CLEAR, fill: 'F2B131' } : undefined,
				children: [new Paragraph({
					children: [new TextRun({
						text: cell,
						bold: idx === 0,
						color: idx === 0 ? 'FFFFFF' : '000000',
						font: FONT,
						size: 20
					})]
				})]
			}))
		}))
	})
}

function buildCodeBlock(text) {
	const lines = Array.isArray(text) ? text : [text]
	return lines.map(line => new Paragraph({
		spacing: { after: 0 },
		shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
		children: [new TextRun({
			text: line,
			font: 'Consolas',
			size: 20
		})]
	}))
}

function buildCallout(text) {
	const lines = Array.isArray(text) ? text : [text]
	return new Paragraph({
		spacing: { before: 120, after: 240 },
		shading: { type: ShadingType.CLEAR, fill: 'FFF8E1' },
		border: { left: { style: BorderStyle.SINGLE, size: 24, color: 'F2B131' } },
		children: lines.map((line, i) => new TextRun({
			text: line,
			break: i > 0 ? 1 : 0,
			font: FONT,
			size: 22
		}))
	})
}

function buildBulletList(items) {
	return new Paragraph({
		bullet: { level: 0 },
		spacing: { after: 60 },
		children: items.flatMap((item, idx) => [
			new TextRun({ text: item, font: FONT, size: 22, break: idx > 0 ? 1 : 0 })
		])
	})
}


// ========== 构建 & 保存 ==========
const doc = new Document({
	styles: {
		default: { document: { run: { font: FONT, size: 22 } } },
		paragraphStyles: [
			{ id: 'Title', name: 'Title', basedOn: 'Normal',
				run: { size: 48, bold: true, color: 'F2B131', font: FONT },
				paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
			{ id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
				run: { size: 32, bold: true, color: '3C3C3C', font: FONT },
				paragraph: { spacing: { before: 360, after: 180 } } },
			{ id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
				run: { size: 26, bold: true, color: '595959', font: FONT },
				paragraph: { spacing: { before: 240, after: 120 } } }
		]
	},
	sections: [{
		properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
		children: children
	}]
})

Packer.toBuffer(doc).then(buf => {
	const out = 'D:/project/SiamFeast/docs/Facebook开发者配置信息.docx'
	fs.writeFileSync(out, buf)
	console.log('✓ 已生成:', out)
})
