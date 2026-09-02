/**
 * 生成三语对照 Excel（给甲方确认翻译）
 * Sheet1「i18n三语对照」：模块/键/中文/英文/泰文 + 甲方修改列（英文/泰文）
 * Sheet2「硬编码文字」：未接入翻译系统的界面文字
 * Sheet3「说明」：填写指引
 * 用法：node script/gen-i18n-excel.js
 * 输出：docs/SiamFeast三语文案对照表.xlsx
 */
const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const ROOT = path.resolve(__dirname, '..')
const i18nRowsAll = require(path.join(ROOT, 'docs/i18n-三语对照.json'))
const hardRowsAll = require(path.join(ROOT, 'docs/硬编码文字扫描.json'))
const OUT = path.join(ROOT, 'docs/SiamFeast三语文案对照表.xlsx')

// ── 剔除废弃模块（页面无入口或零引用，避免甲方误核）──
// hostel=民宿（无入口） vending=自助售卖机（入口为死分支） groupBuy=拼团（mall→group 链路不可达）
// cart/points=零引用的历史残留
// newProducts/hotProducts 保留：新人礼包页复用标题，点餐恢复后仍需
const EXCLUDE_MODULES = ['hostel', 'vending', 'groupBuy', 'cart', 'points']
const i18nRows = i18nRowsAll.filter(r => !EXCLUDE_MODULES.includes(r.module))

// 硬编码文字同步剔除废弃页面里的
const EXCLUDE_PATHS = ['pages/hostel/', 'pages/vending-machine/', 'pages/group/', 'pages/group-detail/']
const hardRows = hardRowsAll.filter(r => !EXCLUDE_PATHS.some(p => r.where.some(w => w.includes(p))))

const wb = XLSX.utils.book_new()

// ── Sheet1: i18n 三语对照 ──
const s1 = [['模块', '键', '当前中文', '当前英文', '当前泰文', '英文修改（甲方填）', '泰文修改（甲方填）', '备注']]
for (const r of i18nRows) {
	s1.push([r.module, r.key, r.zh, r.en, r.th, '', '', ''])
}
const ws1 = XLSX.utils.aoa_to_sheet(s1)
ws1['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 36 }, { wch: 36 }, { wch: 16 }]
// 冻结首行 + 自动筛选
ws1['!freeze'] = { xSplit: 0, ySplit: 1 }
ws1['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: s1.length - 1, c: 7 } }) }
XLSX.utils.book_append_sheet(wb, ws1, 'i18n三语对照')

// ── Sheet2: 硬编码文字（未接入翻译系统） ──
const s2 = [['界面文字（当前为中文硬编码）', '出现次数', '位置（最多3处）', '建议英文', '建议泰文', '备注']]
for (const r of hardRows) {
	s2.push([r.text, r.count, r.where.join(' | '), '', '', ''])
}
const ws2 = XLSX.utils.aoa_to_sheet(s2)
ws2['!cols'] = [{ wch: 40 }, { wch: 8 }, { wch: 50 }, { wch: 32 }, { wch: 32 }, { wch: 14 }]
XLSX.utils.book_append_sheet(wb, ws2, '硬编码文字')

// ── Sheet3: 说明 ──
const missEn = i18nRows.filter(r => r.en === '【缺失】').length
const missTh = i18nRows.filter(r => r.th === '【缺失】').length
const s3 = [
	['SiamFeast 三语文案对照表 — 甲方确认说明'],
	[''],
	['生成日期', new Date().toISOString().substring(0, 10)],
	[''],
	['Sheet1「i18n三语对照」', i18nRows.length + ' 条系统文案（走翻译系统，切换语言时生效）'],
	['  - 请核对「当前英文/当前泰文」列的翻译是否准确'],
	['  - 需要修改的在「英文修改/泰文修改」列填写正确译文，其余列不要动'],
	['  - 标记【缺失】的条目必须补填（当前该语言会显示中文兜底）', '英文缺失 ' + missEn + ' 条，泰文缺失 ' + missTh + ' 条'],
	[''],
	['Sheet2「硬编码文字」', hardRows.length + ' 条未接入翻译系统的界面文字（任何语言下都显示中文）'],
	['  - 请在「建议英文/建议泰文」列填写译文（开发将接入翻译系统）'],
	['  - 部分条目为代码表达式或测试数据（如 ${...}、"海鲜面"），无需填写'],
	[''],
	['回传方式', '直接修改本 Excel 后回传，开发按表批量更新系统']
]
const ws3 = XLSX.utils.aoa_to_sheet(s3)
ws3['!cols'] = [{ wch: 52 }, { wch: 56 }]
XLSX.utils.book_append_sheet(wb, ws3, '说明')

XLSX.writeFile(wb, OUT)
console.log('已生成: ' + OUT)
console.log('Sheet1 i18n: ' + i18nRows.length + ' 条 | Sheet2 硬编码: ' + hardRows.length + ' 条')
