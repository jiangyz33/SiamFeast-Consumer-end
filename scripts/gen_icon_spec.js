const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, VerticalAlign, LevelFormat, PageNumber, PageBreak } = require('docx');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PROJECT = 'D:\\project\\SiamFeast';

// Brand colors
const BRAND = 'F2B131';
const GREY_TXT = '666666';
const HDR_FILL = 'FFF4D6';

const tableBorder = { style: BorderStyle.SINGLE, size: 4, color: 'E0E0E0' };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

// Convert SVG to PNG buffer at higher resolution for crisp rendering
async function svgToPng(svgPath, size = 80) {
  const svg = fs.readFileSync(svgPath);
  // Render at 2x for retina sharpness in Word
  return await sharp(svg, { density: 300 })
    .resize(size * 2, size * 2, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
}

// Load PNG/JPG directly
function loadRaster(imgPath, targetW, targetH) {
  if (!fs.existsSync(imgPath)) return null;
  return fs.readFileSync(imgPath);
}

// Build ImageRun (always PNG)
function imgRun(pngBuf, w, h) {
  return new ImageRun({
    type: 'png',
    data: pngBuf,
    transformation: { width: w, height: h }
  });
}

function hdr(text, width) {
  return new TableCell({
    borders: cellBorders,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: { fill: HDR_FILL, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 22, color: '000000', font: 'Microsoft YaHei' })]
    })]
  });
}

function cell(text, opts = {}) {
  const runs = Array.isArray(text) ? text : [new TextRun({
    text: String(text),
    size: 20,
    color: opts.color || '000000',
    font: 'Microsoft YaHei',
    bold: opts.bold || false
  })];
  return new TableCell({
    borders: cellBorders,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      spacing: { before: 60, after: 60 },
      children: runs
    })]
  });
}

function colorCell(hex) {
  return new TableCell({
    borders: cellBorders,
    width: { size: 2000, type: WidthType.DXA },
    shading: { fill: hex, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '#' + hex, size: 22, bold: true, color: 'FFFFFF', font: 'Consolas' })]
    })]
  });
}

function section(title, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text: title, font: 'Microsoft YaHei' })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({
      text, size: opts.size || 22,
      color: opts.color || '000000',
      bold: opts.bold || false,
      font: 'Microsoft YaHei'
    })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: 'Microsoft YaHei' })]
  });
}

// === Icon data ===
const ICONS_NAV = [
  ['home.svg', '首页（默认）', '24x24', '灰色 #828282', '底部导航默认态'],
  ['home-active.svg', '首页（激活）', '24x24', '品牌黄 #F2B131', '底部导航激活态'],
  ['order.svg', '订单（默认）', '24x24', '灰色 #828282', '底部导航默认态'],
  ['order-active.svg', '订单（激活）', '24x24', '品牌黄 #F2B131', '底部导航激活态'],
  ['user.svg', '我的（默认）', '24x24', '灰色 #828282', '底部导航默认态'],
  ['user-active.svg', '我的（激活）', '24x24', '品牌黄 #F2B131', '底部导航激活态'],
];

const ICONS_UI = [
  ['arrow-left.svg', '返回（左箭头）', '24x24', '黑色描边', '页面左上角返回按钮（使用最频繁）'],
  ['arrow-right.svg', '右箭头（指示进入）', '16x16', '灰色', '列表项右侧、卡片右箭头'],
  ['arrow-down.svg', '下箭头（展开/下拉）', '16x16', '灰色', '门店选择器下拉'],
  ['back.svg', '返回（备用样式）', '24x24', '黑色', '部分页面返回按钮'],
  ['close.svg', '关闭（X）', '20x20', '黑色', '弹窗关闭、商品删除'],
  ['check.svg', '对勾', '16x16', '品牌黄', 'checkbox 选中、成功状态'],
  ['add.svg', '加号（+）', '20x20', '黄/黑', '商品加购按钮'],
  ['delete.svg', '删除（垃圾桶）', '20x20', '红色', '地址/记录删除'],
  ['edit.svg', '编辑（铅笔）', '20x20', '黑色', '地址、信息编辑'],
  ['search.svg', '搜索（放大镜）', '20x20', '灰色', '搜索框'],
  ['share.svg', '分享', '20x20', '黑色', '门店、活动分享'],
  ['filter.svg', '筛选（漏斗）', '20x20', '黑色', '商品列表筛选'],
  ['refresh.svg', '刷新', '20x20', '黑色', '刷新数据'],
  ['more-categories.svg', '更多分类', '24x24', '黑色', '分类选择'],
  ['circle.svg', '圆点（占位/状态）', '8x8', '主题色', '状态指示'],
];

const ICONS_BIZ_LOCATION = [
  ['location.svg', '定位（地图针）', '20x20', '黑色', '门店定位、地址选择'],
  ['my-location.svg', '我的位置', '24x24', '品牌黄', '地图定位按钮'],
  ['marker.svg', '地图标记', '24x24', '品牌黄', '地图门店标记'],
];

const ICONS_BIZ_CART = [
  ['cart.svg', '购物车', '24x24', '黑色', '堂食点餐页购物车'],
  ['coin.svg', '金币', '20x20', '黄底白字', '金币显示、抵扣'],
  ['points.svg', '积分', '20x20', '主题色', '积分显示'],
  ['coupon.svg', '优惠券', '20x20', '主题色', '领券中心、下单抵扣'],
  ['wallet.svg', '钱包', '24x24', '黑色', '余额/钱包入口'],
  ['invoice.svg', '发票', '24x24', '黑色', '开发票'],
];

const ICONS_BIZ_PROFILE = [
  ['message.svg', '消息（信封）', '24x24', '黑色', '消息中心'],
  ['settings.svg', '设置（齿轮）', '24x24', '黑色', '我的-设置入口'],
  ['clock.svg', '时钟（营业时间）', '16x16', '灰色', '门店详情'],
  ['global.svg', '语言（地球）', '24x24', '黑色', '语言切换'],
  ['headset.svg', '客服（耳机）', '24x24', '黑色', '联系客服'],
  ['invite.svg', '邀请好友', '24x24', '黑色', '邀请返利'],
  ['member.svg', '会员（VIP 王冠）', '24x24', '主题色', '会员中心'],
];

const ICONS_BIZ_FOOD = [
  ['truck.svg', '外卖配送车', '20x20', '黑色', '外卖相关'],
  ['takeout.svg', '外卖（打包盒）', '24x24', '黑色', '外卖标识'],
  ['dine-in.svg', '堂食（餐具）', '24x24', '黑色', '堂食标识'],
  ['mall.svg', '商城', '24x24', '黑色', '商城入口'],
  ['points-mall.svg', '积分商城', '24x24', '主题色', '积分商城入口'],
  ['newbie-gift.svg', '新人礼物', '24x24', '主题色', '新人优惠'],
  ['new-product.svg', '新品（NEW）', '20x20', '主题色', '新品标识'],
  ['hot-rank.svg', '热销（火焰）', '20x20', '红色', '热销榜'],
  ['rank.svg', '排行（奖杯）', '20x20', '主题色', '排行榜'],
  ['star.svg', '星（评分）', '16x16', '黄色', '门店评分'],
  ['cat-all.svg', '全部分类', '20x20', '黑色', '分类筛选'],
  ['volume.svg', '音量（喇叭）', '20x20', '黑色', '通知/提醒'],
  ['refund.svg', '退款', '24x24', '黑色', '退款流程'],
  ['heart.svg', '收藏（心形）', '20x20', '红色', '收藏功能'],
  ['favorite.svg', '收藏（已收）', '20x20', '红色', '已收藏状态'],
];

const ICONS_SOCIAL = [
  ['google.svg', 'Google 登录', '24x24', 'Google 品牌色', '登录页社交登录（当前已隐藏）'],
  ['facebook.svg', 'Facebook 登录', '24x24', 'Facebook 品牌蓝', '登录页社交登录（当前已隐藏）'],
];

const IMAGES_BRAND = [
  ['01_brand Logo.png', '品牌 Logo', '建议 1024x1024', '品牌色', '启动相关、品牌露出', 80],
  ['02_Icon-App.png', 'APP 图标', '1024x1024 px', '品牌色', 'APP 桌面图标（必填）', 80],
  ['03_splash.png', '启动图（PNG）', '1242x2688 px', '品牌色', 'APP 冷启动展示', 100],
  ['04_default_avatar.png', '默认头像', '圆形 200x200', '灰色', '用户未上传头像时显示', 80],
  ['06_banner_01.png', '首页 Banner 1', '750x340 px', '品牌设计', '首页顶部轮播（共 5 张）', 140],
  ['06_banner_02.png', '首页 Banner 2', '750x340 px', '品牌设计', '首页顶部轮播', 140],
  ['06_banner_03.png', '首页 Banner 3', '750x340 px', '品牌设计', '首页顶部轮播', 140],
  ['06_banner_04.png', '首页 Banner 4', '750x340 px', '品牌设计', '首页顶部轮播', 140],
  ['06_banner_05.png', '首页 Banner 5', '750x340 px', '品牌设计', '首页顶部轮播', 140],
];

const IMAGES_BUSINESS = [
  ['05_conveyor_icon.png', '业态 - 传送火锅', '80x80 px', '主题色', '门店业态', 64],
  ['05_delivery_icon.png', '业态 - 配送', '80x80 px', '主题色', '门店业态', 64],
  ['05_malatang_icon.png', '业态 - 麻辣烫', '80x80 px', '主题色', '门店业态', 64],
  ['05_platform_icon.png', '业态 - 平台', '80x80 px', '主题色', '门店业态', 64],
];

const IMAGES_PLACEHOLDER = [
  ['avatar-placeholder.svg', '头像占位图', '100x100', '浅灰', '头像加载失败', 56],
  ['banner-placeholder.svg', 'Banner 占位图', '宽长方形', '浅灰', 'Banner 加载失败', 100],
  ['empty-order.svg', '空状态 - 无订单', '160x160 px', '浅灰', '订单页空状态', 64],
  ['empty-coupon.svg', '空状态 - 无优惠券', '160x160 px', '浅灰', '优惠券空状态', 64],
  ['empty-message.svg', '空状态 - 无消息', '160x160 px', '浅灰', '消息中心空状态', 64],
  ['empty-product.svg', '空状态 - 无商品', '160x160 px', '浅灰', '商品列表空状态', 64],
  ['empty-store.svg', '空状态 - 无门店', '160x160 px', '浅灰', '门店列表空状态', 64],
  ['empty-address.svg', '空状态 - 无地址', '160x160 px', '浅灰', '地址列表空状态', 64],
  ['empty-footprint.svg', '空状态 - 无足迹', '160x160 px', '浅灰', '足迹页空状态', 64],
  ['img-placeholder.svg', '通用图片占位图', '正方形', '浅灰', '商品/菜品图加载失败', 56],
  ['store-placeholder.svg', '门店 Logo 占位图', '正方形', '浅灰', '门店 Logo 缺失', 56],
  ['payment-success.svg', '支付成功图', '200x200 px', '主题绿', '支付成功页', 80],
];

// === Async helpers ===
async function buildIconRow(item, previewSize = 36) {
  const [file, name, size, color, usage] = item;
  const fullPath = path.join(PROJECT, 'static', 'icons', file);
  let previewChildren;
  if (fs.existsSync(fullPath)) {
    try {
      const png = await svgToPng(fullPath, previewSize);
      previewChildren = [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [imgRun(png, previewSize, previewSize)]
      })];
    } catch (e) {
      previewChildren = [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '(渲染失败)', size: 16, color: 'CC0000' })] })];
    }
  } else {
    previewChildren = [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '(缺失)', size: 16, color: 'CC0000' })] })];
  }
  return new TableRow({ children: [
    new TableCell({
      borders: cellBorders,
      width: { size: 1100, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      shading: { fill: 'FAFAFA', type: ShadingType.CLEAR },
      children: previewChildren
    }),
    cell([new TextRun({ text: file, size: 20, font: 'Consolas', color: '1A5276' })]),
    cell(name),
    cell(size, { align: AlignmentType.CENTER }),
    cell(usage)
  ]});
}

async function buildImageRow(item) {
  const [file, name, size, color, usage, previewSize] = item;
  const fullPath = path.join(PROJECT, 'static', 'images', file);
  let previewChildren;
  if (fs.existsSync(fullPath)) {
    try {
      let pngBuf;
      const ext = path.extname(file).toLowerCase();
      const targetW = previewSize;
      const targetH = file.includes('banner') ? Math.round(previewSize * 0.45)
                    : file.includes('splash') ? Math.round(previewSize * 2)
                    : previewSize;
      if (ext === '.svg') {
        pngBuf = await svgToPng(fullPath, Math.max(targetW, targetH));
      } else {
        // PNG/JPG — use sharp to resize
        pngBuf = await sharp(fullPath).resize(targetW * 2, targetH * 2, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        }).png().toBuffer();
      }
      previewChildren = [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [imgRun(pngBuf, targetW, targetH)]
      })];
    } catch (e) {
      previewChildren = [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '(渲染失败: ' + e.message + ')', size: 14, color: 'CC0000' })] })];
    }
  } else {
    previewChildren = [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '(缺失)', size: 16, color: 'CC0000' })] })];
  }
  return new TableRow({ children: [
    new TableCell({
      borders: cellBorders,
      width: { size: 1500, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
      children: previewChildren
    }),
    cell([new TextRun({ text: file, size: 20, font: 'Consolas', color: '1A5276' })]),
    cell(name),
    cell(size, { align: AlignmentType.CENTER }),
    cell(usage)
  ]});
}

async function iconTable(iconList, previewSize = 36) {
  const rows = [new TableRow({ tableHeader: true, children: [
    hdr('预览', 1100),
    hdr('文件名', 2400),
    hdr('名称', 2000),
    hdr('尺寸', 1300),
    hdr('用途', 2560)
  ]})];
  for (const item of iconList) {
    rows.push(await buildIconRow(item, previewSize));
  }
  return new Table({
    columnWidths: [1100, 2400, 2000, 1300, 2560],
    rows
  });
}

async function imageTable(imageList) {
  const rows = [new TableRow({ tableHeader: true, children: [
    hdr('预览', 1500),
    hdr('文件名', 2700),
    hdr('名称', 1900),
    hdr('尺寸', 1700),
    hdr('用途', 1960)
  ]})];
  for (const item of imageList) {
    rows.push(await buildImageRow(item));
  }
  return new Table({
    columnWidths: [1500, 2700, 1900, 1700, 1960],
    rows
  });
}

// === Build document ===
async function build() {
  // Pre-build all tables (async)
  console.log('Building navigation icons table...');
  const navTable = await iconTable(ICONS_NAV, 48);
  console.log('Building UI icons table...');
  const uiTable = await iconTable(ICONS_UI, 36);
  console.log('Building location icons table...');
  const locTable = await iconTable(ICONS_BIZ_LOCATION, 36);
  console.log('Building cart icons table...');
  const cartTable = await iconTable(ICONS_BIZ_CART, 36);
  console.log('Building profile icons table...');
  const profTable = await iconTable(ICONS_BIZ_PROFILE, 36);
  console.log('Building food icons table...');
  const foodTable = await iconTable(ICONS_BIZ_FOOD, 36);
  console.log('Building social icons table...');
  const socialTable = await iconTable(ICONS_SOCIAL, 36);
  console.log('Building brand images table...');
  const brandTable = await imageTable(IMAGES_BRAND);
  console.log('Building business images table...');
  const bizImgTable = await imageTable(IMAGES_BUSINESS);
  console.log('Building placeholder images table...');
  const placeholderTable = await imageTable(IMAGES_PLACEHOLDER);
  console.log('All tables built, assembling document...');

  const doc = new Document({
    creator: 'SiamFeast Frontend',
    title: 'SiamFeast APP 图标与图片素材规范',
    description: 'Icon and image replacement specification with visual previews',
    styles: {
      default: { document: { run: { font: 'Microsoft YaHei', size: 22 } } },
      paragraphStyles: [
        { id: 'Title', name: 'Title', basedOn: 'Normal',
          run: { size: 44, bold: true, color: '000000', font: 'Microsoft YaHei' },
          paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, color: BRAND, font: 'Microsoft YaHei' },
          paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, color: '000000', font: 'Microsoft YaHei' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      ]
    },
    numbering: {
      config: [
        { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
      ]
    },
    sections: [{
      properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
      children: [
        // Title page
        new Paragraph({ heading: HeadingLevel.TITLE,
          children: [new TextRun({ text: 'SiamFeast APP', font: 'Microsoft YaHei' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
          children: [new TextRun({ text: '图标与图片素材规范', size: 36, bold: true, color: BRAND, font: 'Microsoft YaHei' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
          children: [new TextRun({ text: '— 设计师替换素材参考文档 —', size: 22, color: GREY_TXT, font: 'Microsoft YaHei', italics: true })] }),

        new Table({
          columnWidths: [2400, 6960],
          rows: [
            new TableRow({ children: [
              cell('项目', { bold: true, fill: HDR_FILL, width: 2400 }),
              cell('SiamFeast C 端 APP（UniApp + Vue）', { width: 6960 })
            ]}),
            new TableRow({ children: [
              cell('文档日期', { bold: true, fill: HDR_FILL }),
              cell('2026-06-30')
            ]}),
            new TableRow({ children: [
              cell('文档目的', { bold: true, fill: HDR_FILL }),
              cell('客户希望用自己的设计替换 APP 内所有图标和图片。本文档列出全部素材、实际预览图及设计要求。')
            ]}),
            new TableRow({ children: [
              cell('素材总数', { bold: true, fill: HDR_FILL }),
              cell('图标 SVG 约 50 个；图片素材约 25 个')
            ]}),
            new TableRow({ children: [
              cell('素材目录', { bold: true, fill: HDR_FILL }),
              cell('static/icons/（图标） + static/images/（图片）')
            ]}),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // Section 1: Design rules
        section('一、通用设计要求'),
        p('替换素材前请遵守以下统一规范（保证 APP 视觉一致性和兼容性）：', { bold: true }),

        section('1.1 图标规范（SVG 格式）', HeadingLevel.HEADING_2),
        bullet('格式：必须是 SVG（矢量图，任意缩放不模糊）'),
        bullet('画布尺寸：标准 24x24，小型 20x20，微型 16x16（见每张图要求）'),
        bullet('设计网格：留 2px 边距（实际图标内容居中，避免裁切）'),
        bullet('线宽：建议 2px（与现有图标风格统一）'),
        bullet('颜色：默认态用灰色 #828282；激活态用品牌黄 #F2B131；警示/删除用红色 #DA3300'),
        bullet('圆角：建议 stroke-linejoin: round（与图标主题匹配）'),
        bullet('字体：图标内若有文字（如金币 ¢ 符号），用 Arial Bold 12px，白色'),

        section('1.2 图片素材规范', HeadingLevel.HEADING_2),
        bullet('Banner 图：建议 750x340 px（比例约 2.2:1），PNG 或 JPG，单文件 ≤ 200 KB'),
        bullet('APP 图标（02_Icon-App.png）：1024x1024 px，PNG，圆角由系统处理'),
        bullet('启动图（03_splash.png）：建议 1242x2688 px（iPhone XS Max 尺寸），PNG，单文件 ≤ 500 KB'),
        bullet('业态图标（05_xxx.png）：建议 80x80 px，PNG 透明背景'),
        bullet('空状态插画：建议 160x160 px，SVG（首选）或 PNG 透明背景'),
        bullet('占位图：纯色（#F0F0F0）+ 简单图形，SVG 格式'),

        section('1.3 品牌色（如客户有自己的品牌色，告知前端一并替换）', HeadingLevel.HEADING_2),
        new Table({
          columnWidths: [2000, 3000, 4360],
          rows: [
            new TableRow({ tableHeader: true, children: [
              hdr('色值', 2000), hdr('颜色示例', 3000), hdr('用途', 4360)
            ]}),
            new TableRow({ children: [
              cell('#F2B131', { align: AlignmentType.CENTER, bold: true, font: 'Consolas' }),
              colorCell('F2B131'),
              cell('主品牌黄 — tabbar 激活态、按钮主色、强调元素')
            ]}),
            new TableRow({ children: [
              cell('#828282', { align: AlignmentType.CENTER, bold: true, font: 'Consolas' }),
              colorCell('828282'),
              cell('辅助灰 — tabbar 默认态、次要文字、图标默认色')
            ]}),
            new TableRow({ children: [
              cell('#DA3300', { align: AlignmentType.CENTER, bold: true, font: 'Consolas' }),
              colorCell('DA3300'),
              cell('警示红 — 价格、删除、错误提示')
            ]}),
            new TableRow({ children: [
              cell('#52C41A', { align: AlignmentType.CENTER, bold: true, font: 'Consolas' }),
              colorCell('52C41A'),
              cell('成功绿 — 支付成功、营业中徽章')
            ]}),
            new TableRow({ children: [
              cell('#1890FF', { align: AlignmentType.CENTER, bold: true, font: 'Consolas' }),
              colorCell('1890FF'),
              cell('信息蓝 — 部分状态指示')
            ]}),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // Section 2: Bottom nav
        section('二、底部导航图标（最高优先级）'),
        p('说明：底部导航是 APP 最核心的入口，需要 6 张图（3 个 tab × 2 种状态）。', { color: GREY_TXT }),
        p('⚠️ 必须同时提供「默认态」和「激活态」两种样式，激活态使用品牌黄。', { color: 'DA3300', bold: true }),
        navTable,

        new Paragraph({ children: [new PageBreak()] }),

        // Section 3: UI icons
        section('三、通用 UI 图标（按钮、操作类）'),
        p('说明：用于全 APP 各页面的通用交互按钮，可整体替换为统一风格。', { color: GREY_TXT }),
        uiTable,

        new Paragraph({ children: [new PageBreak()] }),

        // Section 4: Business icons
        section('四、业务功能图标（按场景分组）'),
        section('4.1 位置/地图类', HeadingLevel.HEADING_2),
        locTable,

        section('4.2 购物/优惠类', HeadingLevel.HEADING_2),
        cartTable,

        new Paragraph({ children: [new PageBreak()] }),

        section('4.3 个人中心类', HeadingLevel.HEADING_2),
        profTable,

        section('4.4 餐饮/商品类', HeadingLevel.HEADING_2),
        foodTable,

        new Paragraph({ children: [new PageBreak()] }),

        // Section 5: Social (hidden)
        section('五、社交登录图标（当前已隐藏）'),
        p('说明：当前登录页已隐藏社交登录入口，这两个图标暂时未被使用。如未来恢复需更新。', { color: GREY_TXT }),
        socialTable,

        new Paragraph({ children: [new PageBreak()] }),

        // Section 6: Brand images
        section('六、品牌图片素材（重要）'),
        p('说明：品牌相关的核心图片素材，需要设计师按品牌调性设计。', { color: GREY_TXT }),
        brandTable,

        new Paragraph({ children: [new PageBreak()] }),

        // Section 7: Business icons (PNG)
        section('七、业态图标（PNG）'),
        p('说明：用于门店业态分类的图标。', { color: GREY_TXT }),
        bizImgTable,

        new Paragraph({ children: [new PageBreak()] }),

        // Section 8: Placeholder
        section('八、占位图与空状态插画'),
        p('说明：数据为空或加载失败时显示。建议用扁平插画风格，浅灰色调，可带品牌黄点缀。', { color: GREY_TXT }),
        placeholderTable,

        new Paragraph({ children: [new PageBreak()] }),

        // Section 9: Delivery
        section('九、交付要求'),
        section('9.1 文件命名（关键）', HeadingLevel.HEADING_2),
        p('⚠️ 必须严格保持现有文件名不变（直接覆盖），否则前端代码引用会失效：', { color: 'DA3300', bold: true }),
        bullet('保持文件名 100% 一致（区分大小写）'),
        bullet('如新增图标，文件名用小写英文 + 短横线，如 new-icon-name.svg'),
        bullet('图标放 static/icons/ 目录；图片放 static/images/ 目录'),

        section('9.2 文件格式与压缩', HeadingLevel.HEADING_2),
        bullet('SVG 图标：使用 SVGO 或在线工具（svgomg）压缩，去掉冗余 metadata'),
        bullet('PNG 图片：用 TinyPNG 压缩，单文件 ≤ 500 KB'),
        bullet('JPG 图片：质量 80% 以上，单文件 ≤ 300 KB'),
        bullet('禁止使用：BMP、GIF、TIFF、WebP（兼容性问题）'),

        section('9.3 配色一致性', HeadingLevel.HEADING_2),
        bullet('主品牌色统一使用 #F2B131（若客户有自己的品牌色，告知前端一并替换）'),
        bullet('次要色（灰/红/绿）建议保持当前色值，避免破坏整体视觉'),
        bullet('深色背景上的图标使用白色或半透明白色'),

        section('9.4 测试要求', HeadingLevel.HEADING_2),
        bullet('替换后请在 Android 真机 + iOS 真机各测一遍（SVG 渲染可能有差异）'),
        bullet('检查不同尺寸下是否清晰（特别是 16x16 的小图标）'),
        bullet('检查激活态/默认态切换是否正常（如 tabbar 点击高亮）'),

        new Paragraph({ children: [new PageBreak()] }),

        // Section 10: Priority
        section('十、替换优先级（建议按此顺序替换）'),
        new Table({
          columnWidths: [1000, 5180, 3180],
          rows: [
            new TableRow({ tableHeader: true, children: [
              hdr('优先级', 1000), hdr('内容', 5180), hdr('原因', 3180)
            ]}),
            new TableRow({ children: [
              cell('P0', { align: AlignmentType.CENTER, bold: true, color: 'DA3300' }),
              cell('02_Icon-App.png（APP 图标）'),
              cell('用户第一眼看到的品牌识别')
            ]}),
            new TableRow({ children: [
              cell('P0', { align: AlignmentType.CENTER, bold: true, color: 'DA3300' }),
              cell('03_splash.png（启动图）'),
              cell('冷启动第一印象')
            ]}),
            new TableRow({ children: [
              cell('P0', { align: AlignmentType.CENTER, bold: true, color: 'DA3300' }),
              cell('底部导航图标 6 张（home/order/user × 2 状态）'),
              cell('全 APP 最常用的图标，最高可见度')
            ]}),
            new TableRow({ children: [
              cell('P0', { align: AlignmentType.CENTER, bold: true, color: 'DA3300' }),
              cell('06_banner_01~05.png（首页 banner）'),
              cell('首页主视觉')
            ]}),
            new TableRow({ children: [
              cell('P1', { align: AlignmentType.CENTER, bold: true, color: BRAND }),
              cell('01_brand Logo.png（品牌 Logo）'),
              cell('品牌 Logo')
            ]}),
            new TableRow({ children: [
              cell('P1', { align: AlignmentType.CENTER, bold: true, color: BRAND }),
              cell('04_default_avatar.png（默认头像）'),
              cell('新用户首次进入就显示')
            ]}),
            new TableRow({ children: [
              cell('P2', { align: AlignmentType.CENTER, bold: true }),
              cell('业务功能图标（金币/优惠券/积分等）'),
              cell('辅助功能图标')
            ]}),
            new TableRow({ children: [
              cell('P2', { align: AlignmentType.CENTER, bold: true }),
              cell('空状态插画'),
              cell('仅在无数据时显示，可见度低')
            ]}),
            new TableRow({ children: [
              cell('P3', { align: AlignmentType.CENTER, bold: true, color: GREY_TXT }),
              cell('通用 UI 图标（箭头/对勾等）'),
              cell('功能性图标，建议保持简洁')
            ]}),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // Section 11: File list
        section('十一、完整文件清单'),
        section('11.1 图标目录（static/icons/）', HeadingLevel.HEADING_2),
        p('共约 50 个 SVG 文件：', { color: GREY_TXT }),
        ...fs.readdirSync(path.join(PROJECT, 'static', 'icons'))
          .filter(f => f.endsWith('.svg'))
          .sort()
          .map(f => bullet(f)),

        section('11.2 图片目录（static/images/）', HeadingLevel.HEADING_2),
        p('共约 25 个文件（PNG/JPG/SVG）：', { color: GREY_TXT }),
        ...fs.readdirSync(path.join(PROJECT, 'static', 'images'))
          .sort()
          .map(f => bullet(f)),

        new Paragraph({ children: [new PageBreak()] }),

        // Section 12: Workflow
        section('十二、交付流程'),
        bullet('1. 设计师按本文档要求产出素材 → 命名严格匹配现有文件名'),
        bullet('2. 把新文件直接覆盖到 static/icons/ 和 static/images/ 目录'),
        bullet('3. 前端重新打包 APP → 真机测试'),
        bullet('4. 如有新需求（如改品牌主色、增减图标），告知前端一并修改'),

        section('附：联系与协作', HeadingLevel.HEADING_2),
        bullet('前端联系人：jiangyz33'),
        bullet('查看实际素材：打开项目目录 D:\\project\\SiamFeast\\static\\ 即可看到 icons/ 和 images/ 子目录'),
        bullet('预览 SVG：用浏览器直接打开 .svg 文件即可查看实际效果'),

        new Paragraph({ spacing: { before: 400 },
          children: [new TextRun({
            text: '— 文档结束 —',
            size: 20, color: GREY_TXT, italics: true, font: 'Microsoft YaHei'
          })], alignment: AlignmentType.CENTER }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const out = 'D:\\project\\SiamFeast\\docs\\SiamFeast_APP图标与图片素材规范.docx';
  fs.writeFileSync(out, buffer);
  console.log('✅ 文档已生成:', out);
  console.log('   大小:', (buffer.length / 1024).toFixed(1), 'KB');
}

build().catch(e => {
  console.error('FAIL:', e.message);
  console.error(e.stack);
  process.exit(1);
});
