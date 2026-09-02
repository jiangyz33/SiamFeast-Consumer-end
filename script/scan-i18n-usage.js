/**
 * 分析 i18n 模块的真实引用（静态 t('mod.key') 调用 + 字符串字面量中的 key 路径）
 * 用法：node script/scan-i18n-usage.js
 * 输出：按模块统计引用次数，标记未使用模块
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

// 1. 拿到 i18n 全部 key（复用 v2 求值）
const src = fs.readFileSync(path.join(ROOT, 'i18n/index.js'), 'utf-8')
const startMark = 'const messages = {'
const start = src.indexOf(startMark)
let depth = 0, end = -1
for (let i = start + startMark.length - 1; i < src.length; i++) {
	if (src[i] === '{') depth++
	else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break } }
}
const messages = new Function('return ' + src.substring(start + 'const messages ='.length, end + 1))()

function flatten(obj, prefix, out) {
	for (const [k, v] of Object.entries(obj)) {
		const p = prefix ? prefix + '.' + k : k
		if (typeof v === 'string') out[p] = v
		else if (v && typeof v === 'object') flatten(v, p, out)
	}
	return out
}
const allKeys = flatten(messages.zh, '', {})
const modules = [...new Set(Object.keys(allKeys).map(k => k.split('.')[0]))]

// 2. 扫业务代码中的引用
const SCAN_DIRS = ['pages', 'components', 'utils']
function walk(dir, files) {
	for (const name of fs.readdirSync(dir)) {
		const p = path.join(dir, name)
		if (fs.statSync(p).isDirectory()) walk(p, files)
		else if (/\.(vue|js)$/.test(name)) files.push(p)
	}
}
const files = []
for (const d of SCAN_DIRS) walk(path.join(ROOT, d), files)
files.push(path.join(ROOT, 'App.vue'))

const modRef = {}       // module → 次数
const keyRef = new Set() // 精确 key 引用
for (const f of files) {
	const text = fs.readFileSync(f, 'utf-8')
	// 所有字符串字面量
	const re = /(['"`])((?:\\.|(?!\1).){2,80})\1/g
	let m
	while ((m = re.exec(text)) !== null) {
		const s = m[2]
		// 完整 key（mod.key[.sub...]）
		const km = s.match(/^([a-zA-Z][a-zA-Z0-9_]*)\.([a-zA-Z][a-zA-Z0-9_.]*)$/)
		if (km && modules.includes(km[1])) {
			modRef[km[1]] = (modRef[km[1]] || 0) + 1
			if (allKeys[s] !== undefined) keyRef.add(s)
			else keyRef.add(km[1] + '.' + km[2].split('.')[0]) // 部分匹配（动态拼子键）
		}
	}
}

// 3. 输出报告
const report = modules.map(mod => ({
	module: mod,
	keys: Object.keys(allKeys).filter(k => k.startsWith(mod + '.')).length,
	refs: modRef[mod] || 0
})).sort((a, b) => a.refs - b.refs)

console.log('模块总数:', modules.length)
console.log('=== 未被引用（候选废弃）===')
report.filter(r => r.refs === 0).forEach(r => console.log(`  ${r.module}（${r.keys} 条）`))
console.log('=== 引用较少（1-3 次，需人工确认）===')
report.filter(r => r.refs > 0 && r.refs <= 3).forEach(r => console.log(`  ${r.module}: ${r.refs} 次（${r.keys} 条）`))
fs.writeFileSync(path.join(ROOT, 'docs/i18n-模块引用.json'), JSON.stringify(report, null, 1))
console.log('明细已存 docs/i18n-模块引用.json')
