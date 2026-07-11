const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, VerticalAlign, LevelFormat, PageBreak } = require('docx');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PROJECT = 'D:\\project\\SiamFeast';
const BRAND = 'F2B131';
const GREY_TXT = '666282';
const HDR_FILL = 'FFF4D6';

const tableBorder = { style: BorderStyle.SINGLE, size: 4, color: 'E0E0E0' };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

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

async function svgToPng(svgPath, size = 80) {
  const svg = fs.readFileSync(svgPath);
  return await sharp(svg, { density: 300 })
    .resize(size * 2, size * 2, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
}

function imgRun(pngBuf, w, h) {
  return new ImageRun({ type: 'png', data: pngBuf, transformation: { width: w, height: h } });
}

// === Build mock preview cell using existing icons to demonstrate ===
async function buildMockupRow(label, iconFile, desc, size) {
  const fullPath = path.join(PROJECT, 'static', 'icons', iconFile);
  let previewChildren;
  if (fs.existsSync(fullPath)) {
    try {
      const png = await svgToPng(fullPath, size || 48);
      previewChildren = [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [imgRun(png, size || 48, size || 48)]
      })];
    } catch (e) {
      previewChildren = [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '(渲染失败)', size: 14, color: 'CC0000' })] })];
    }
  } else {
    previewChildren = [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '(缺失)', size: 14, color: 'CC0000' })] })];
  }
  return new TableRow({ children: [
    new TableCell({
      borders: cellBorders,
      width: { size: 1100, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      shading: { fill: 'FAFAFA', type: ShadingType.CLEAR },
      children: previewChildren
    }),
    cell(label, { bold: true }),
    cell(desc)
  ]});
}

async function buildDoc() {
  console.log('Building store image spec supplement...');

  // Build mockup rows for category icons (using existing icons as samples)
  const categoryMockups = await Promise.all([
    buildMockupRow('招牌推荐', 'star.svg', '门店招牌菜分类，建议用星形/勋章类图标，品牌黄色'),
    buildMockupRow('拼盘精选', 'cat-all.svg', '拼盘/套餐类，建议用盘子/拼盘图标'),
    buildMockupRow('蔬菜丸滑', 'mall.svg', '蔬菜/丸子类，建议用相应食材图标'),
    buildMockupRow('汤底', 'hot-rank.svg', '汤底类，建议用锅/汤碗图标'),
    buildMockupRow('饮品甜品', 'points.svg', '饮品/甜品，建议用杯子/甜品图标')
  ]);

  const doc = new Document({
    creator: 'SiamFeast Frontend',
    title: '店铺图片素材需求（补充章节）',
    description: 'Supplement: Store image requirements',
    styles: {
      default: { document: { run: { font: 'Microsoft YaHei', size: 22 } } },
      paragraphStyles: [
        { id: 'Title', name: 'Title', basedOn: 'Normal',
          run: { size: 40, bold: true, color: '000000', font: 'Microsoft YaHei' },
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
        // Title
        new Paragraph({ heading: HeadingLevel.TITLE,
          children: [new TextRun({ text: '店铺图片素材需求', font: 'Microsoft YaHei' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
          children: [new TextRun({ text: '— 原文档补充章节，请粘接到主文档末尾 —', size: 22, color: GREY_TXT, italics: true, font: 'Microsoft YaHei' })] }),

        // Intro
        p('说明：店铺相关的图片素材由商家在总控端/门店端上传，不在 APP 打包文件里。但商家上传前需要遵守以下规格，否则显示会变形或模糊。', { bold: true }),
        p('本章节内容供商家/运营人员参考，建议作为「店铺入驻图片规范」分发给各门店。', { color: GREY_TXT }),

        // === Section 1: Store banner ===
        section('一、门店 Banner 图（顶部大图）'),

        p('用途：', { bold: true }),
        bullet('门店列表卡片背景图（用户浏览门店时第一眼看到）'),
        bullet('门店详情页（点进门店后）顶部大图'),

        p('规格要求：', { bold: true }),
        new Table({
          columnWidths: [2400, 6960],
          rows: [
            new TableRow({ children: [
              cell('建议尺寸', { bold: true, fill: HDR_FILL, width: 2400 }),
              cell('750 x 400 px（宽长方形，比例约 1.87:1）', { width: 6960 })
            ]}),
            new TableRow({ children: [
              cell('最小尺寸', { bold: true, fill: HDR_FILL }),
              cell('375 x 200 px（低于此尺寸会模糊）')
            ]}),
            new TableRow({ children: [
              cell('格式', { bold: true, fill: HDR_FILL }),
              cell('JPG（首选，体积小）或 PNG')
            ]}),
            new TableRow({ children: [
              cell('文件大小', { bold: true, fill: HDR_FILL }),
              cell('≤ 300 KB（用 TinyPNG 压缩）')
            ]}),
            new TableRow({ children: [
              cell('内容建议', { bold: true, fill: HDR_FILL }),
              cell('门店实景照、招牌菜品合影、或品牌主视觉图。避免大段纯色或文字（系统会叠加门店名/状态徽章）')
            ]}),
            new TableRow({ children: [
              cell('色调', { bold: true, fill: HDR_FILL }),
              cell('建议明亮、有食欲感；避免过暗（底部会叠加黑色渐变遮罩显示门店名）')
            ]}),
            new TableRow({ children: [
              cell('后端字段', { bold: true, fill: HDR_FILL }),
              cell([new TextRun({ text: 'background_image_url', font: 'Consolas', size: 20, color: '1A5276' }),
                    new TextRun({ text: ' 或 ', size: 20, font: 'Microsoft YaHei' }),
                    new TextRun({ text: 'banner_image', font: 'Consolas', size: 20, color: '1A5276' })])
            ]}),
          ]
        }),

        p(''),
        p('⚠️ 重要：Banner 图会被裁切为 1.87:1 显示。请确保主体内容居中，避免边缘重要元素被切掉。', { color: 'DA3300', bold: true }),

        // === Section 2: Store logo ===
        new Paragraph({ children: [new PageBreak()] }),
        section('二、门店 Logo（小图标）'),

        p('用途：', { bold: true }),
        bullet('门店列表卡片左上角圆形小图（72x72 px 显示）'),
        bullet('门店详情页头部圆形 Logo'),
        bullet('订单列表、订单详情、消息等位置的门店标识'),

        p('规格要求：', { bold: true }),
        new Table({
          columnWidths: [2400, 6960],
          rows: [
            new TableRow({ children: [
              cell('建议尺寸', { bold: true, fill: HDR_FILL, width: 2400 }),
              cell('240 x 240 px（正方形，1:1）', { width: 6960 })
            ]}),
            new TableRow({ children: [
              cell('最小尺寸', { bold: true, fill: HDR_FILL }),
              cell('120 x 120 px（低于此会模糊）')
            ]}),
            new TableRow({ children: [
              cell('格式', { bold: true, fill: HDR_FILL }),
              cell('PNG 透明背景（首选）/ JPG')
            ]}),
            new TableRow({ children: [
              cell('文件大小', { bold: true, fill: HDR_FILL }),
              cell('≤ 100 KB')
            ]}),
            new TableRow({ children: [
              cell('显示形状', { bold: true, fill: HDR_FILL }),
              cell('系统会自动裁切成圆形，所以 Logo 主体应居中，四周留 10% 边距')
            ]}),
            new TableRow({ children: [
              cell('内容建议', { bold: true, fill: HDR_FILL }),
              cell('品牌商标、简化图形、或代表字。避免细线条（圆形裁切后易丢失细节）')
            ]}),
            new TableRow({ children: [
              cell('背景', { bold: true, fill: HDR_FILL }),
              cell('透明（PNG）或纯色背景。避免与 APP 主题色（#F2B131）冲突的颜色')
            ]}),
            new TableRow({ children: [
              cell('后端字段', { bold: true, fill: HDR_FILL }),
              cell([new TextRun({ text: 'logo_url', font: 'Consolas', size: 20, color: '1A5276' }),
                    new TextRun({ text: ' 或 ', size: 20, font: 'Microsoft YaHei' }),
                    new TextRun({ text: 'logo', font: 'Consolas', size: 20, color: '1A5276' })])
            ]}),
          ]
        }),

        // === Section 3: Product images ===
        new Paragraph({ children: [new PageBreak()] }),
        section('三、菜品/商品图（每个菜品一张）'),

        p('用途：', { bold: true }),
        bullet('堂食点餐页商品列表（每行 56x56 px 缩略图）'),
        bullet('商品详情页大图（顶部全宽）'),
        bullet('订单详情、再来一单的菜品图'),
        bullet('首页新品/热销商品卡'),

        p('规格要求：', { bold: true }),
        new Table({
          columnWidths: [2400, 6960],
          rows: [
            new TableRow({ children: [
              cell('建议尺寸', { bold: true, fill: HDR_FILL, width: 2400 }),
              cell('600 x 600 px（正方形，1:1）', { width: 6960 })
            ]}),
            new TableRow({ children: [
              cell('最小尺寸', { bold: true, fill: HDR_FILL }),
              cell('200 x 200 px（低于此会模糊）')
            ]}),
            new TableRow({ children: [
              cell('格式', { bold: true, fill: HDR_FILL }),
              cell('JPG（首选，照片类）/ PNG（图标类）')
            ]}),
            new TableRow({ children: [
              cell('文件大小', { bold: true, fill: HDR_FILL }),
              cell('≤ 200 KB')
            ]}),
            new TableRow({ children: [
              cell('拍摄建议', { bold: true, fill: HDR_FILL }),
              cell('俯拍或 45° 角，光线充足，菜品占画面 70% 以上，背景干净（白盘/木桌）')
            ]}),
            new TableRow({ children: [
              cell('后端字段', { bold: true, fill: HDR_FILL }),
              cell([new TextRun({ text: 'image_url', font: 'Consolas', size: 20, color: '1A5276' })])
            ]}),
          ]
        }),

        p(''),
        p('💡 提示：菜品图直接影响用户下单决策，建议请专业美食摄影师拍摄，或用手机 + 自然光精心拍摄。', { color: BRAND, bold: true }),

        // === Section 4: Category icons ===
        new Paragraph({ children: [new PageBreak()] }),
        section('四、门店菜单分类图标（可选）'),

        p('用途：堂食点餐页顶部的分类切换 tab，每个分类配一个图标。', { color: GREY_TXT }),
        p('当前 APP 没有显示分类图标（只显示文字），但未来可能加。如果客户提供分类图标，前端可以一并加上。', { color: GREY_TXT }),

        p('常见分类（每个门店可自定义，以下是典型示例）：', { bold: true }),
        new Table({
          columnWidths: [1100, 2400, 5860],
          rows: [
            new TableRow({ tableHeader: true, children: [
              hdr('参考样式', 1100),
              hdr('分类名称', 2400),
              hdr('设计建议', 5860)
            ]}),
            ...categoryMockups
          ]
        }),

        p(''),
        p('规格：', { bold: true }),
        bullet('尺寸：48 x 48 px（设计稿） / 24 x 24 px（实际显示）'),
        bullet('格式：SVG（首选）或 PNG 透明背景'),
        bullet('颜色：建议单色，激活态用品牌黄 #F2B131，默认态用灰色 #828282'),
        bullet('风格：与 APP 整体图标风格统一（线性、2px 描边、圆角）'),

        // === Section 5: Upload checklist ===
        new Paragraph({ children: [new PageBreak()] }),
        section('五、店铺入驻图片上传清单'),

        p('商家入驻/编辑门店时，需要准备以下图片（最低要求）：', { bold: true, color: 'DA3300' }),

        new Table({
          columnWidths: [1000, 3000, 2200, 3160],
          rows: [
            new TableRow({ tableHeader: true, children: [
              hdr('必填', 1000),
              hdr('图片', 3000),
              hdr('尺寸', 2200),
              hdr('说明', 3160)
            ]}),
            new TableRow({ children: [
              cell('✓ 必填', { align: AlignmentType.CENTER, bold: true, color: 'DA3300' }),
              cell('门店 Banner（背景图）'),
              cell('750x400 px', { align: AlignmentType.CENTER }),
              cell('门店列表+详情页顶部的代表图')
            ]}),
            new TableRow({ children: [
              cell('✓ 必填', { align: AlignmentType.CENTER, bold: true, color: 'DA3300' }),
              cell('门店 Logo'),
              cell('240x240 px', { align: AlignmentType.CENTER }),
              cell('圆形小图，品牌标识')
            ]}),
            new TableRow({ children: [
              cell('✓ 必填', { align: AlignmentType.CENTER, bold: true, color: 'DA3300' }),
              cell('每个菜品图'),
              cell('600x600 px', { align: AlignmentType.CENTER }),
              cell('一个菜品一张图，必须拍实物')
            ]}),
            new TableRow({ children: [
              cell('○ 可选', { align: AlignmentType.CENTER, color: GREY_TXT }),
              cell('门店菜单分类图标'),
              cell('48x48 px', { align: AlignmentType.CENTER }),
              cell('每个分类一个小图标（如招牌/拼盘/汤底等）')
            ]}),
            new TableRow({ children: [
              cell('○ 可选', { align: AlignmentType.CENTER, color: GREY_TXT }),
              cell('门店营业资质照片'),
              cell('不限制'),
              cell('审核时可能需要，不入 APP 显示')
            ]}),
          ]
        }),

        p(''),
        p('提示：', { bold: true }),
        bullet('所有图片上传到总控端或门店端后台'),
        bullet('系统会自动转存到 MinIO（https://minio.siamfeast.com）'),
        bullet('上传后立即生效，无需 APP 重新打包'),
        bullet('如需修改，直接在后台重新上传覆盖即可'),

        // === Section 6: Common mistakes ===
        new Paragraph({ children: [new PageBreak()] }),
        section('六、常见问题与避免'),

        new Table({
          columnWidths: [3500, 5860],
          rows: [
            new TableRow({ tableHeader: true, children: [
              hdr('❌ 错误做法', 3500),
              hdr('✅ 正确做法', 5860)
            ]}),
            new TableRow({ children: [
              cell('用手机随手一拍，背景杂乱'),
              cell('俯拍 + 白盘 + 干净背景，菜品占主体')
            ]}),
            new TableRow({ children: [
              cell('Banner 图用竖图（9:16）'),
              cell('Banner 用宽图（1.87:1），主体居中')
            ]}),
            new TableRow({ children: [
              cell('Logo 用矩形，文字太多'),
              cell('Logo 用正方形，简化图形/单字，四周留白')
            ]}),
            new TableRow({ children: [
              cell('图片过大（> 2MB）'),
              cell('压缩到 300KB 以内，用 TinyPNG')
            ]}),
            new TableRow({ children: [
              cell('用 BMP/GIF/TIFF 格式'),
              cell('统一用 JPG 或 PNG')
            ]}),
            new TableRow({ children: [
              cell('Logo 背景是白色 + APP 显示在白底'),
              cell('Logo 用 PNG 透明背景，适应各种底色')
            ]}),
            new TableRow({ children: [
              cell('菜品图比例不一致（有的方有的长）'),
              cell('统一为 1:1 正方形，系统会按正方形显示')
            ]}),
          ]
        }),

        p(''),
        new Paragraph({ spacing: { before: 400 },
          children: [new TextRun({
            text: '— 补充章节结束 —',
            size: 20, color: GREY_TXT, italics: true, font: 'Microsoft YaHei'
          })], alignment: AlignmentType.CENTER }),
        new Paragraph({
          children: [new TextRun({
            text: '粘接到主文档「十二、交付流程」之后即可',
            size: 20, color: GREY_TXT, italics: true, font: 'Microsoft YaHei'
          })], alignment: AlignmentType.CENTER }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const out = 'D:\\project\\SiamFeast\\docs\\SiamFeast_APP素材规范_补充_店铺图片需求.docx';
  fs.writeFileSync(out, buffer);
  console.log('✅ 补充文档已生成:', out);
  console.log('   大小:', (buffer.length / 1024).toFixed(1), 'KB');
}

buildDoc().catch(e => {
  console.error('FAIL:', e.message);
  console.error(e.stack);
  process.exit(1);
});
