/**
 * 解析 i18n/index.js → 展平为 [module, path, zh, en, th] 对照数据
 * v2：提取 const messages = {...} 用 JS 引擎求值（缩进错位不再影响路径）
 * 用法：node script/export-i18n-table.js
 * 输出：docs/i18n-三语对照.json
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.resolve(ROOT, 'i18n/index.js')
const OUT = path.resolve(ROOT, 'docs/i18n-三语对照.json')

const src = fs.readFileSync(SRC, 'utf-8')

// 1. 截取 const messages = { ... }（括号配对）
const startMark = 'const messages = {'
const start = src.indexOf(startMark)
if (start === -1) throw new Error('未找到 const messages')
let depth = 0, end = -1
for (let i = start + startMark.length - 1; i < src.length; i++) {
	if (src[i] === '{') depth++
	else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break } }
}
if (end === -1) throw new Error('messages 括号配对失败')
const objSrc = src.substring(start + 'const messages ='.length, end + 1)

// 2. 求值（messages 是纯数据对象，无外部依赖）
const messages = new Function('return ' + objSrc)()
if (!messages.zh || !messages.en || !messages.th) throw new Error('语言块缺失')

// 3. 展平（路径 a.b.c → 叶子字符串）
function flatten(obj, prefix, out) {
	for (const [k, v] of Object.entries(obj)) {
		const p = prefix ? prefix + '.' + k : k
		if (typeof v === 'string') out[p] = v
		else if (v && typeof v === 'object') flatten(v, p, out)
	}
	return out
}
const zh = flatten(messages.zh, '', {})
const en = flatten(messages.en, '', {})
const th = flatten(messages.th, '', {})

// 4. 以 zh 为基准生成行（保持文件顺序）
const rows = []
for (const [p, zhText] of Object.entries(zh)) {
	const dot = p.indexOf('.')
	rows.push({
		module: dot > -1 ? p.substring(0, dot) : p,
		key: dot > -1 ? p.substring(dot + 1) : p,
		zh: zhText,
		en: en[p] !== undefined ? en[p] : '【缺失】',
		th: th[p] !== undefined ? th[p] : '【缺失】'
	})
}
// en/th 独有 key（zh 缺失）
for (const p of new Set([...Object.keys(en), ...Object.keys(th)])) {
	if (zh[p] === undefined) {
		const dot = p.indexOf('.')
		rows.push({
			module: dot > -1 ? p.substring(0, dot) : p,
			key: dot > -1 ? p.substring(dot + 1) : p,
			zh: '【缺失】',
			en: en[p] !== undefined ? en[p] : '【缺失】',
			th: th[p] !== undefined ? th[p] : '【缺失】'
		})
	}
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 1), 'utf-8')
console.log('i18n 条目：' + rows.length + ' 条 | 模块：' + new Set(rows.map(r => r.module)).size + ' 个')
console.log('en 缺失：' + rows.filter(r => r.en === '【缺失】').length + ' 条')
console.log('th 缺失：' + rows.filter(r => r.th === '【缺失】').length + ' 条')
// 抽查之前的错位样本
const chk = rows.find(r => r.key === 'orderingDisabled')
console.log('抽查 error.orderingDisabled:', chk ? chk.en.substring(0, 40) : '未找到')
const chk2 = rows.find(r => r.key === 'bookingConfirm')
console.log('抽查 hostel.bookingConfirm en:', chk2 ? chk2.en : '未找到')
