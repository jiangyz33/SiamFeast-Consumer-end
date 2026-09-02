/**
 * 扫描散落在业务代码里的硬编码中文（非 i18n 渠道的界面文字）
 * 用法：node script/scan-hardcoded-text.js
 * 输出：docs/硬编码文字扫描.json
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const OUT = path.resolve(ROOT, 'docs/硬编码文字扫描.json')

// 扫描范围：页面/组件/工具（排除 i18n 本体、mock、node_modules、docs）
const SCAN_DIRS = ['pages', 'components', 'utils']
const SKIP = [/node_modules/, /api[\\/]mock/, /uni_modules/]

function walk(dir, files) {
	for (const name of fs.readdirSync(dir)) {
		const p = path.join(dir, name)
		const stat = fs.statSync(p)
		if (stat.isDirectory()) {
			if (SKIP.some(r => r.test(p))) continue
			walk(p, files)
		} else if (/\.(vue|js)$/.test(name)) {
			files.push(p)
		}
	}
}

const files = []
for (const d of SCAN_DIRS) walk(path.join(ROOT, d), files)
files.push(path.join(ROOT, 'App.vue'))

// 中文字符 + 常见 UI 语境（字符串字面量 / 模板文本）
const CJK = /[\u4e00-\u9fff]/
const results = []

for (const f of files) {
	const rel = path.relative(ROOT, f).replace(/\\/g, '/')
	const lines = fs.readFileSync(f, 'utf-8').split('\n')
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		// 跳过纯注释行
		if (/^\s*(\/\/|\/\*|\*)/.test(line)) continue
		if (!CJK.test(line)) continue

		// 提取字符串字面量里的中文（'...' / "..." / `...`）与模板插值
		const strings = []
		const re = /(['"`])((?:\\.|(?!\1).)*[\u4e00-\u9fff](?:\\.|(?!\1).)*)\1/g
		let m
		while ((m = re.exec(line)) !== null) strings.push(m[2])
		// 模板裸文本（>中文<）
		const tmpl = line.match(/>([^<>]*[\u4e00-\u9fff][^<>]*)</)
		if (tmpl) strings.push(tmpl[1].trim())

		for (const s of strings) {
			// 过滤：纯符号/数字占位、太短无意义（单字如"份"保留）
			const text = s.trim()
			if (!text || text.length > 120) continue
			results.push({ file: rel, line: i + 1, text })
		}
	}
}

// 去重聚合（同文字多处出现合并计数）
const byText = {}
for (const r of results) {
	if (!byText[r.text]) byText[r.text] = { text: r.text, count: 0, where: [] }
	byText[r.text].count++
	if (byText[r.text].where.length < 3) byText[r.text].where.push(r.file + ':' + r.line)
}
const rows = Object.values(byText).sort((a, b) => b.count - a.count)

fs.writeFileSync(OUT, JSON.stringify(rows, null, 1), 'utf-8')
console.log('硬编码中文文字：' + rows.length + ' 处（去重后）')
console.log('涉及文件数：' + new Set(results.map(r => r.file)).size)
console.log('=== 出现最多的样例 ===')
rows.slice(0, 8).forEach(r => console.log(`[${r.count}次] ${r.text.substring(0, 40)} ← ${r.where[0]}`))
