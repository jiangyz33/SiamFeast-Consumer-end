/**
 * Google Play 商店详情文案（泰文版）- Word 文档生成
 * - 简短描述（≤80 字符）
 * - 完整描述（≤4000 字符）
 */
const fs = require('fs')
const {
	Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
	Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
	ShadingType, LevelFormat, PageBreak
} = require('docx')

const FONT = 'Tahoma'  // 泰文兼容字体

const children = [
	// ========== 标题 ==========
	new Paragraph({
		heading: HeadingLevel.TITLE,
		alignment: AlignmentType.CENTER,
		children: [new TextRun({ text: 'Google Play Store Details (ภาษาไทย)', font: FONT })]
	}),
	new Paragraph({
		alignment: AlignmentType.CENTER,
		spacing: { after: 360 },
		children: [new TextRun({ text: 'SiamFeast · 2026-07', color: '666666', size: 22, font: FONT })]
	}),

	// ========== 一、应用名称 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '一、ชื่อแอป (App Name)', font: FONT })]
	}),
	new Paragraph({
		spacing: { after: 240 },
		children: [new TextRun({ text: 'SiamFeast สยามเฟสต์', size: 28, bold: true, font: FONT })]
	}),

	// ========== 二、简短描述 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '二、คำอธิบายแบบสั้น (Short Description)', font: FONT })]
	}),
	new Paragraph({
		spacing: { after: 120 },
		children: [new TextRun({ text: 'จำกัด 80 ตัวอักษร', italics: true, color: '666666', size: 20, font: FONT })]
	}),

	// 高亮显示简短描述
	new Paragraph({
		spacing: { before: 120, after: 240 },
		shading: { type: ShadingType.CLEAR, fill: 'FFF8E1' },
		border: { left: { style: BorderStyle.SINGLE, size: 24, color: 'F2B131' } },
		children: [new TextRun({
			text: 'สั่งอาหารไทยอร่อย ทานที่ร้าน จัดส่ง คะแนนสะสม คูปอง พร้อมข้อเสนอพิเศษทุกวัน',
			size: 24,
			bold: true,
			font: FONT
		})]
	}),
	new Paragraph({
		spacing: { after: 360 },
		children: [new TextRun({ text: 'จำนวนตัวอักษร: 79', italics: true, color: '999999', size: 20, font: FONT })]
	}),

	new Paragraph({ children: [new PageBreak()] }),

	// ========== 三、完整描述 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '三、คำอธิบายแบบเต็ม (Full Description)', font: FONT })]
	}),
	new Paragraph({
		spacing: { after: 240 },
		children: [new TextRun({ text: 'จำกัด 4000 ตัวอักษร · ความยาวประมาณ 3500 ตัวอักษร', italics: true, color: '666666', size: 20, font: FONT })]
	}),

	// 完整描述（分多段，每段一个 Paragraph）
	...buildFullDescription(),

	new Paragraph({ children: [new PageBreak()] }),

	// ========== 四、应用类别 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '四、หมวดหมู่แอป (App Category)', font: FONT })]
	}),

	buildTable([
		['字段 (Field)', '值 (Value)'],
		['ประเภทแอป (App type)', 'แอป (App)'],
		['หมวดหมู่ (Category)', 'อาหารและเครื่องดื่ม (Food & Drink)'],
		['เนื้อหา (Content rating)', 'ทุกคน (Everyone)'],
		['มีโฆษณา (Contains ads)', 'ไม่ (No)'],
		['มีการซื้อในแอป (In-app purchases)', 'ใช่ (Yes - เหรียญและคะแนน)'],
		['กลุ่มเป้าหมาย (Target audience)', 'ผู้ใหญ่ 18+ (Adults 18+)']
	]),

	new Paragraph({ spacing: { after: 240 }, children: [] }),

	// ========== 五、应用截图建议 ==========
	new Paragraph({
		heading: HeadingLevel.HEADING_1,
		children: [new TextRun({ text: '五、ภาพหน้าจอแอป (App Screenshots)', font: FONT })]
	}),

	new Paragraph({
		spacing: { after: 120 },
		children: [new TextRun({ text: 'ต้องการอย่างน้อย 2 ภาพ (แนะนำ 5-8 ภาพ)', font: FONT })]
	}),

	buildTable([
		['ลำดับ (Order)', 'หน้าจอ (Screen)', 'คำอธิบาย (Description)'],
		['1', 'หน้าแรก (Home)', 'แสดงแบนเนอร์โปรโมชั่น + ร้านใกล้คุณ'],
		['2', 'รายการอาหาร (Menu)', 'เมนูสัญญาณณีย์ของร้าน'],
		['3', 'คำสั่งซื้อ (Orders)', 'รายการคำสั่งซื้อและสถานะการจัดส่ง'],
		['4', 'คลังคะแนน (Points Mall)', 'สินค้าแลกคะแนนและรางวัล'],
		['5', 'บัญชีของฉัน (Profile)', 'ระดับสมาชิก คะแนนสะสม เหรียญทอง'],
		['6', 'คูปอง (Coupons)', 'คูปองส่วนลดและข้อเสนอพิเศษ'],
		['7', 'การชำระเงิน (Checkout)', 'หน้ายืนยันคำสั่งซื้อ'],
		['8', 'รายละเอียดคำสั่งซื้อ (Order Detail)', 'ใบเสร็จและรายละเอียดคำสั่งซื้อ']
	])
]


function buildFullDescription() {
	const paragraphs = [
		'ยินดีต้อนรับสู่ SiamFeast สยามเฟสต์',

		'SiamFeast คือแพลตฟอร์มอาหารท้องถิ่นไทยชั้นนำ ที่รวมเอาการสั่งอาหารทานที่ร้าน การจัดส่ง การแลกคะแนน และข้อเสนอพิเศษไว้ในแอปเดียว ไม่ว่าคุณจะอยู่ที่ไหน ก็สามารถเพลิดเพลินกับอาหารไทยอร่อยได้ทุกเมื่อ',

		'【คุณสมบัติหลัก】',

		'🍜 สั่งอาหารทานที่ร้าน (Dine-in Ordering)',
		'สแกน QR Code ในร้านหรือเลือกร้านที่ชื่นชอบ เรียกดูเมนูและสั่งอาหารออนไลน์ได้ทันที ไม่ต้องรอพนักงาน รองรับการสั่งอาหารหลายคนและรวมบิลได้สะดวก เหมาะสำหรับการทานเพื่อน ครอบครัว หรือทีมงาน',

		'🛵 จัดส่งถึงที่ (Food Delivery)',
		'ค้นหาร้านอาหารในบริเวณใกล้เคียง เลือกเมนูเด็ดประจำร้าน และติดตามสถานะการจัดส่งแบบเรียลไทม์ รู้ทันทีว่าอาหารจะมาถึงเมื่อไหร่',

		'🎁 คลังคะแนน (Points Mall)',
		'สะสมเหรียญทองและคะแนนทุกครั้งที่สั่งซื้อ แล้วแลกรับคูปองกาแฟ ขวดน้ำร้อน แก้วเก็บความเย็น และของรางวัลอื่นๆ มากมาย ยิ่งสั่งเยอะ ยิ่งได้เยอะ',

		'🎫 ศูนย์คูปอง (Coupons Center)',
		'รับคูปองส่วนลดสำหรับผู้ใช้ใหม่ คูปองลดราคา และโปรโมชั่นเทศกาลต่างๆ ตลอดทั้งปี เช่น ลด 50% วันเกิด ส่วนลดวันหยุดยาว และข้อเสนอพิเศษสำหรับสมาชิก',

		'🏆 ระดับสมาชิก (Membership Tiers)',
		'เริ่มต้นจากสมาชิกทั่วไป และอัปเกรดเป็นสมาชิกแพลทินัมเพื่อรับสิทธิพิเศษมากมาย เช่น ของขวัญวันเกิด ส่วนลดพิเศษ การจองล่วงหน้า และการบริการที่ดีกว่า',

		'👨‍👩‍👧 รางวัลเชิญเพื่อน (Referral Rewards)',
		'เชิญเพื่อนสมัครสมาชิกเพื่อรับเหรียญทองรางวัล เพื่อนของคุณจะได้รับส่วนลดเพิ่มในคำสั่งซื้อแรก ยิ่งเชิญเยอะ ยิ่งรับรางวัลเยอะ',

		'【จุดเด่นของแอป】',

		'🌍 รองรับ 3 ภาษา',
		'สลับภาษาได้ทันทีระหว่าง ภาษาไทย 中文 (จีน) English (อังกฤษ) เหมาะสำหรับผู้ใช้ทั้งคนไทยและชาวต่างชาติที่อาศัยหรือท่องเที่ยวในประเทศไทย',

		'📍 ครอบคลุมหลายเมือง',
		'รองรับร้านอาหารในเขตกรุงเทพมหานคร พัทยา ภูเก็ต เชียงใหม่ และเมืองท่องเที่ยวยอดนิยมอื่นๆ ทั่วประเทศไทย',

		'🔒 การชำระเงินปลอดภัย',
		'รองรับหลายวิธีการชำระเงิน ทั้งบัตรเครดิต PayPal และเงินสด พร้อมระบบเข้ารหัสที่ได้มาตรฐานสากล คุณมั่นใจได้ว่าข้อมูลของคุณปลอดภัย',

		'⏱️ การติดตามคำสั่งซื้อแบบเรียลไทม์',
		'ติดตามสถานะคำสั่งซื้อตั้งแต่ยืนยัน ร้านเตรียมอาหาร จนถึงจัดส่งถึงมือคุณ พร้อมการแจ้งเตือนทุกขั้นตอน',

		'🎨 ดีไซน์ที่ใช้งานง่าย',
		'อินเทอร์เฟซที่สวยงามและใช้งานง่าย ออกแบบมาเพื่อประสบการณ์การใช้งานที่ดีที่สุด ทั้งบนมือถือและแท็บเล็ต',

		'🔔 แจ้งเตือนข้อเสนอพิเศษ',
		'รับการแจ้งเตือนเมื่อมีโปรโมชั่นใหม่ คูปองใหม่ หรือคำสั่งซื้ออัปเดต ไม่พลาดทุกข้อเสนอที่คุณสนใจ',

		'【ประเภทร้านอาหาร】',

		'SiamFeast รองรับร้านอาหารหลากหลายประเภท ได้แก่',

		'• ร้านก๋วยเตี๋ยวทะเล (Seafood Noodles) - ก๋วยเตี๋ยวทะเลสดใหม่ รสชาติดั้งเดิม',
		'• ร้านหม่าล่าทัง (Mala Tang) - หม่าล่าร้อนแรง เลือกเครื่องเคียงได้ตามใจ',
		'• ร้านบุฟเฟ่ต์หม้อไฟ (Hotpot Buffet) - หม้อไฟบุฟเฟ่ต์ไม่อั้น วัตถุดิบคุณภาพ',
		'• ร้านเครื่องดื่ม (Beverages) - ชา กาแฟ นม และเครื่องดื่มสด',
		'• ร้านอาหารทะเล (Seafood) - อาหารทะเลสด ร้านริมทะเล',
		'• ร้านของหวาน (Desserts) - ขนมหวานและของหวานไทย-จีน',

		'【วิธีใช้งาน】',

		'1. ดาวน์โหลดและติดตั้งแอป SiamFeast',
		'2. สมัครสมาชิกด้วยอีเมลหรือหมายเลขโทรศัพท์',
		'3. เลือกภาษาที่ต้องการ (ไทย / จีน / อังกฤษ)',
		'4. เปิดตำแหน่งที่ตั้งเพื่อค้นหาร้านใกล้คุณ',
		'5. เลือกร้านอาหารและเมนูที่ต้องการ',
		'6. เพิ่มลงตะกร้าและยืนยันคำสั่งซื้อ',
		'7. เลือกวิธีการชำระเงิน',
		'8. ติดตามสถานะคำสั่งซื้อจนถึงได้รับอาหาร',
		'9. รับคะแนนและเหรียญทองหลังสั่งซื้อ',
		'10. แลกคะแนนเป็นของรางวัลในคลังคะแนน',

		'【เหตุผลที่ควรเลือก SiamFeast】',

		'✓ ระบบสั่งอาหารที่รวดเร็วและสะดวก',
		'✓ ร้านอาหารคัดสรรคุณภาพดี',
		'✓ ระบบสมาชิกที่ให้รางวัลกลับคุณทุกครั้ง',
		'✓ โปรโมชั่นและส่วนลดตลอดทั้งปี',
		'✓ รองรับหลายภาษาสำหรับผู้ใช้ทุกกลุ่ม',
		'✓ บริการลูกค้าที่พร้อมช่วยเหลือ',

		'【ติดต่อเรา】',

		'หากมีคำถามหรือข้อเสนอแนะ สามารถติดต่อเราได้ที่',
		'📧 อีเมล: support@siamfeast.com',
		'📞 โทร: +66-98-591-3247',
		'🌐 เว็บไซต์: https://h5.siamfeast.com',
		'📍 ที่อยู่: 368/66 ถนนวัชรพล-รามอินทรา แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ 10220',

		'ดาวน์โหลด SiamFeast วันนี้ แล้วเริ่มต้นการเดินทางอาหารไทยที่อร่อยที่สุดของคุณ',

		'ขอบคุณที่เลือก SiamFeast สยามเฟสต์'
	]

	return paragraphs.map(text => new Paragraph({
		spacing: { after: 120 },
		children: [new TextRun({ text, size: 22, font: FONT })]
	}))
}


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
				paragraph: { spacing: { before: 360, after: 180 } } }
		]
	},
	sections: [{
		properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
		children: children
	}]
})

Packer.toBuffer(doc).then(buf => {
	const out = 'D:/project/SiamFeast/docs/GooglePlay泰文文案.docx'
	fs.writeFileSync(out, buf)
	console.log('✓ 已生成:', out)
})
