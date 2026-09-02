/**
 * 按甲方 Excel 批量回写 i18n/index.js —— v3 整块重写方案
 *
 * 背景：源码 en/th 块存在多处结构异常（empty 节重复定义、categories 节交错、
 * 缩进错位），逐行对齐方案不可靠。改为：
 *   1. 求值 messages 对象（真实生效结构）
 *   2. 把甲方修改应用到对象（en/th）
 *   3. 用稳定序列化器重写 en/th 两个语言块（zh 块保持原样不动，保留注释）
 *   4. 双重验证：a) 修改项逐条断言生效 b) 非修改项前后深比较不变
 *
 * 用法：node script/apply-i18n-fixes.js "<甲方Excel路径>"
 */
const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.resolve(ROOT, 'i18n/index.js')
const EXCEL = process.argv[2]
if (!EXCEL) { console.error('用法: node apply-i18n-fixes.js "<Excel路径>"'); process.exit(1) }

// ── 1. 读甲方修改 ──
const wb = XLSX.readFile(EXCEL)
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 })
const fixes = []
for (let i = 1; i < rows.length; i++) {
	const r = rows[i]
	if (!r[0] || !r[1]) continue
	const leafKey = String(r[1]).trim()
	if (/^\d+$/.test(leafKey)) continue
	const p = String(r[0]).trim() + '.' + leafKey
	const enNew = (r[5] || '').toString().trim()
	const thNew = (r[6] || '').toString().trim()
	if (enNew && enNew !== '【缺失】') fixes.push({ lang: 'en', path: p, newVal: enNew })
	if (thNew && thNew !== '【缺失】') fixes.push({ lang: 'th', path: p, newVal: thNew })
}
console.log('甲方修改：英文 ' + fixes.filter(f => f.lang === 'en').length + ' 条，泰文 ' + fixes.filter(f => f.lang === 'th').length + ' 条')

// ── 2. 求值 messages ──
const src = fs.readFileSync(SRC, 'utf-8')
const lines = src.split('\n')
const sm = src.indexOf('const messages = {')
if (sm === -1) throw new Error('未找到 const messages')
let depth = 0, endPos = -1
for (let i = sm + 'const messages ='.length - 1; i < src.length; i++) {
	if (src[i] === '{') depth++
	else if (src[i] === '}') { depth--; if (depth === 0) { endPos = i; break } }
}
const messages = new Function('return ' + src.substring(sm + 'const messages ='.length, endPos + 1))()
const before = JSON.parse(JSON.stringify(messages))  // 深拷贝基准

// ── 3. 应用修改到对象 ──
function setByPath(obj, p, val) {
	const segs = p.split('.')
	let cur = obj
	for (let i = 0; i < segs.length - 1; i++) {
		if (cur[segs[i]] === undefined || cur[segs[i]] === null || typeof cur[segs[i]] !== 'object') return false
		cur = cur[segs[i]]
	}
	const leaf = segs[segs.length - 1]
	if (typeof cur[leaf] !== 'string') return false
	cur[leaf] = val
	return true
}
const applied = [], skipped = []
for (const f of fixes) {
	if (setByPath(messages[f.lang], f.path, f.newVal)) applied.push(f)
	else skipped.push({ ...f, reason: '路径不存在或非字符串叶子' })
}
console.log(`应用到对象：${applied.length} 条，跳过 ${skipped.length} 条`)
if (skipped.length) console.log('跳过明细：', skipped.map(s => s.lang + ':' + s.path).slice(0, 10).join(', '))

// ── 4. 序列化并重写 en/th 块 ──
function esc(v) {
	return String(v)
		.replace(/\\/g, '\\\\')
		.replace(/'/g, "\\'")
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/\t/g, '\\t')
}
function serialize(obj, indent) {
	const t = '\t'.repeat(indent)
	const t2 = '\t'.repeat(indent + 1)
	const parts = []
	for (const [k, v] of Object.entries(obj)) {
		if (typeof v === 'string') {
			parts.push(`${t2}${k}: '${esc(v)}',`)
		} else if (Array.isArray(v)) {
			parts.push(`${t2}${k}: [${v.map(x => `'${esc(x)}'`).join(', ')}],`)
		} else if (v && typeof v === 'object') {
			const inner = serialize(v, indent + 1)
			parts.push(`${t2}${k}: {\n${inner}\n${t2}},`)
		}
	}
	return parts.join('\n')
}

// 定位 en/th 块的行范围
function blockRangeOf(lang) {
	const openRe = new RegExp('^\\t' + lang + ':\\s*\\{')
	for (let i = 0; i < lines.length; i++) {
		if (openRe.test(lines[i])) {
			for (let j = i + 1; j < lines.length; j++) {
				if (/^\t\}/.test(lines[j])) return { start: i, end: j }
			}
		}
	}
	throw new Error(lang + ' 块未找到')
}
const enR = blockRangeOf('en')
const thR = blockRangeOf('th')

// 重写（从后往前替换避免行号位移）
const newLines = [...lines]
for (const [range, lang] of [[thR, 'th'], [enR, 'en']]) {
	const body = serialize(messages[lang], 2)
	const header = lines[range.start]   // 保留原块头行（含注释可能的行内内容）
	newLines.splice(range.start + 1, range.end - range.start - 1, body)
}
fs.writeFileSync(SRC, newLines.join('\n'), 'utf-8')
console.log('en/th 块已重写')

// ── 5. 双重验证 ──
// 5a. 语法可求值
const checkSrc = fs.readFileSync(SRC, 'utf-8')
const csm = checkSrc.indexOf('const messages = {')
let cd = 0, ce = -1
for (let i = csm + 'const messages ='.length - 1; i < checkSrc.length; i++) {
	if (checkSrc[i] === '{') cd++
	else if (checkSrc[i] === '}') { cd--; if (cd === 0) { ce = i; break } }
}
const after = new Function('return ' + checkSrc.substring(csm + 'const messages ='.length, ce + 1))()

function getByPath(obj, p) {
	let cur = obj
	for (const seg of p.split('.')) { if (cur == null) return undefined; cur = cur[seg] }
	return cur
}

// 5b. 修改项逐条断言
const failures = []
for (const f of applied) {
	if (getByPath(after[f.lang], f.path) !== f.newVal) failures.push({ ...f, kind: '未生效' })
}
// 5c. 非修改项不变（全叶子对比；修改项路径集合）
const fixSet = new Set(fixes.map(f => f.lang + '|' + f.path))
function allLeaves(obj, prefix, lang, out) {
	for (const [k, v] of Object.entries(obj)) {
		if (/^\d+$/.test(k)) continue
		const p = prefix ? prefix + '.' + k : k
		if (typeof v === 'string') out.push([lang, p, v])
		else if (v && typeof v === 'object') allLeaves(v, p, lang, out)
	}
	return out
}
const beforeLeaves = [...allLeaves(before.en, '', 'en', []), ...allLeaves(before.th, '', 'th', [])]
const afterLeaves = [...allLeaves(after.en, '', 'en', []), ...allLeaves(after.th, '', 'th', [])]
const bMap = new Map(beforeLeaves.map(([l, p, v]) => [l + '|' + p, v]))
const aMap = new Map(afterLeaves.map(([l, p, v]) => [l + '|' + p, v]))
const unexpected = []
for (const [k, v] of aMap) {
	if (!fixSet.has(k) && bMap.get(k) !== v) unexpected.push({ key: k, before: bMap.get(k), after: v })
}
const lost = [...bMap.keys()].filter(k => !aMap.has(k))

console.log(`验证：修改生效 ${applied.length - failures.length}/${applied.length}`)
console.log(`非修改项意外变化：${unexpected.length} 条 | 丢失：${lost.length} 条`)
if (failures.length || unexpected.length || lost.length) {
	fs.writeFileSync(path.join(ROOT, 'docs/i18n-回写验证失败.json'), JSON.stringify({ failures, unexpected, lost }, null, 1))
	console.error('验证未通过，明细见 docs/i18n-回写验证失败.json')
	process.exit(1)
}
console.log('全部验证通过 ✓（无未修复项、无意外变化、无丢失）')
