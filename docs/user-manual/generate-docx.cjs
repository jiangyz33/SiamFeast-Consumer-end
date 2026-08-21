/**
 * SiamFeast 用户手册 Word 文档生成脚本
 *
 * 读取 Markdown 源文件和截图，生成带有封面、目录、正文、页眉页脚的 .docx 文件。
 * 使用 docx-js (v9.7.1) + image-size (v2.0.2)。
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { imageSize } = require("image-size");

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  AlignmentType,
  HeadingLevel,
  WidthType,
  BorderStyle,
  ShadingType,
  TableOfContents,
  SectionType,
  TableLayoutType,
  LevelFormat,
  NumberFormat,
  HeightRule,
} = require("docx");

// ─────────────────────────────────────────────────────────────
// 路径与配置
// ─────────────────────────────────────────────────────────────

// 命令行参数：--lang=th 生成泰语版，默认中文版
const LANG = (process.argv.find((a) => a.startsWith("--lang=")) || "--lang=zh").split("=")[1];

const ROOT = "D:/project/SiamFeast/docs/user-manual";
const SHOTS_DIR = path.join(ROOT, "screenshots");

// 语言配置：不同语言用不同的源文件、输出文件名、封面文案、字体
const LANG_CONFIG = {
  zh: {
    mdPath: path.join(ROOT, "用户手册.md"),
    outPath: path.join(ROOT, "SiamFeast用户手册.docx"),
    coverTitle: "SiamFeast 用户手册",
    coverSubtitle: "暹罗盛宴 · 终端用户使用指南",
    coverVersion: "版本 v1.0.11",
    coverDate: "更新日期：2026-08-11",
    coverAudience: "适用对象：终端用户（食客）",
    tocTitle: "目  录",
    tocHint: "（提示：目录页码生成后，请在 Word 中右键点击目录区域并选择「更新域」以刷新页码。）",
    headerText: "SiamFeast 用户手册",
    figPrefix: "图：",
    fontBody: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    fontHeading: { ascii: "Calibri", eastAsia: "SimHei" },
  },
  th: {
    mdPath: path.join(ROOT, "คู่มือผู้ใช้.md"),
    outPath: path.join(ROOT, "SiamFeastคู่มือผู้ใช้.docx"),
    coverTitle: "SiamFeast คู่มือผู้ใช้",
    coverSubtitle: "暹罗盛宴 · คู่มือการใช้งานสำหรับผู้ใช้",
    coverVersion: "เวอร์ชัน v1.0.11",
    coverDate: "อัปเดต: 2026-08-11",
    coverAudience: "เหมาะสำหรับ: ผู้ใช้งาน (ลูกค้า)",
    tocTitle: "สารบัญ",
    tocHint: "（คำแนะนำ: หลังสร้างสารบัญแล้ว โปรดคลิกขวาที่สารบัญใน Word แล้วเลือก「อัปเดตฟิลด์」เพื่อรีเฟรชเลขหน้า）",
    headerText: "SiamFeast คู่มือผู้ใช้",
    figPrefix: "รูปภาพ: ",
    fontBody: { ascii: "Calibri", eastAsia: "Tahoma" },   // Tahoma 对泰语兼容性好
    fontHeading: { ascii: "Calibri", eastAsia: "Tahoma" },
  },
};

const LC = LANG_CONFIG[LANG] || LANG_CONFIG.zh;
const MD_PATH = LC.mdPath;
const OUT_PATH = LC.outPath;

// SiamFeast 品牌色板
const COLOR = {
  primary: "1A1A1A", // 深黑 标题
  body: "333333", // 正文
  secondary: "666666", // 次要文字
  accent: "F2B131", // 品牌黄
  accentDark: "C2890F", // 深一点的黄（用于文字）
  tableHeaderBg: "FFF8E7", // 浅黄表头背景
  tableInner: "D0D0D0", // 表格内部分隔线
  tableOuter: "B0B0B0", // 表格外部边框
  quoteBg: "F7F7F7", // 引用块背景
  quoteBorder: "CCCCCC", // 引用块左边框
  codeBg: "F0F0F0", // 代码背景
};

// 字体配置（从语言配置读取）
const FONT_BODY = LC.fontBody;
const FONT_HEADING = LC.fontHeading;
const FONT_CODE = { ascii: "Courier New", eastAsia: "Courier New" };

// 尺寸（half-points）
const SIZE_BODY = 22; // 11pt
const SIZE_CAPTION = 18; // 9pt 图注
const SIZE_CODE = 20; // 10pt
const SIZE_TABLE = 20; // 10pt 表格文字略小

// 图片显示宽度（px）—— 缩小到 300 让页面更紧凑、图注更贴近图片
const IMAGE_WIDTH = 300;

// ─────────────────────────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────────────────────────

/**
 * 安全文本（防止 undefined / null 进入文档）
 */
function safeText(value, placeholder) {
  if (value === undefined || value === null || value === "" ||
      String(value) === "NaN" || String(value) === "undefined") {
    return placeholder || "";
  }
  return String(value);
}

/**
 * 行内格式解析：把一行 Markdown 文本切成 TextRun 数组
 * 支持：**粗体**、`代码`、[文字](链接)（链接渲染为带下划线的蓝色文字）
 */
function parseInline(text, baseProps = {}) {
  const runs = [];
  // 正则同时匹配 **bold**、`code`、[text](url)
  const regex = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;

  const defaultRunProps = {
    size: SIZE_BODY,
    color: COLOR.body,
    font: FONT_BODY,
    ...baseProps,
  };

  while ((match = regex.exec(text)) !== null) {
    // 先把 match 之前的普通文本加入
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before) {
        runs.push(new TextRun({ ...defaultRunProps, text: before }));
      }
    }

    if (match[1]) {
      // **bold**
      runs.push(new TextRun({
        ...defaultRunProps,
        text: match[2],
        bold: true,
        color: COLOR.primary,
      }));
    } else if (match[3]) {
      // `code`
      runs.push(new TextRun({
        ...defaultRunProps,
        text: match[4],
        font: FONT_CODE,
        size: SIZE_CODE,
        color: COLOR.accentDark,
        shading: { type: ShadingType.CLEAR, fill: COLOR.codeBg },
      }));
    } else if (match[5]) {
      // [text](url) — 这里我们只渲染文字（带链接样式），不嵌入超链接以保持简单
      runs.push(new TextRun({
        ...defaultRunProps,
        text: match[6],
        color: "1155CC",
        underline: { type: "single" },
      }));
    }

    lastIndex = regex.lastIndex;
  }

  // 剩余的普通文本
  if (lastIndex < text.length) {
    const tail = text.slice(lastIndex);
    if (tail) {
      runs.push(new TextRun({ ...defaultRunProps, text: tail }));
    }
  }

  // 如果整行没匹配到任何格式，runs 可能为空
  if (runs.length === 0) {
    runs.push(new TextRun({ ...defaultRunProps, text: text }));
  }

  return runs;
}

/**
 * 读取图片并返回 ImageRun 所需的数据（含按比例缩放后的尺寸）
 * 读取失败返回 null。
 */
function buildImageData(relativePath, displayWidth = IMAGE_WIDTH) {
  const fullPath = path.join(ROOT, relativePath);
  try {
    if (!fs.existsSync(fullPath)) {
      console.warn(`[warn] 图片不存在，跳过: ${relativePath}`);
      return null;
    }
    const buf = fs.readFileSync(fullPath);
    const dim = imageSize(buf);
    const ratio = dim.height / dim.width;
    const displayHeight = Math.round(displayWidth * ratio);
    return {
      data: buf,
      transformation: { width: displayWidth, height: displayHeight },
      type: "png",
    };
  } catch (err) {
    console.warn(`[warn] 读取图片失败 ${relativePath}: ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Markdown 块级解析器
// ─────────────────────────────────────────────────────────────

/**
 * 把 Markdown 文本解析成 docx children 数组（Paragraph/Table）。
 *
 * 处理：
 *  - # / ## / ### / #### 标题
 *  - ![](path) 图片
 *  - | 表格 |
 *  - > 引用块
 *  - - / * / 1. 列表
 *  - --- 水平线
 *  - 普通段落
 */
function parseMarkdown(mdText) {
  const lines = mdText.split(/\r?\n/);
  const children = [];
  let i = 0;

  // 列表编号计数器（每个列表块重置）
  let listCounter = 0;

  while (i < lines.length) {
    let line = lines[i];

    // 跳过空行（但重置列表计数器）
    if (/^\s*$/.test(line)) {
      listCounter = 0;
      i++;
      continue;
    }

    // ── 水平线 ---
    if (/^-{3,}\s*$/.test(line.trim()) || /^_{3,}\s*$/.test(line.trim()) || /^\*{3,}\s*$/.test(line.trim())) {
      // 不输出可见分隔线（避免章节之间的视觉噪音），只跳过
      i++;
      continue;
    }

    // ── 标题 # ## ### ####
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];

      // 跳过文档开头的目录标题（因为我们会用独立 TOC section）
      // 兼容中文"目录"、英文"Table of Contents"、泰语"สารบัญ"
      if (/目录|Table of Contents|TOC|สารบัญ/i.test(text)) {
        i++;
        // 同时跳过目录下方所有列表项（形如 "1. [...]"），直到遇到下一个 ## 标题或分隔线
        while (i < lines.length) {
          const nl = lines[i];
          if (/^\s*$/.test(nl)) { i++; continue; }
          if (/^-{3,}\s*$/.test(nl.trim())) { i++; break; }
          if (/^#{1,6}\s/.test(nl)) break;
          // 目录列表项（数字. / 包含 [text](#anchor) 的行）
          if (/^\s*\d+\.\s/.test(nl) || /^\s*-\s/.test(nl) || /\[.*\]\(#.*\)/.test(nl)) {
            i++;
            continue;
          }
          break;
        }
        continue;
      }

      // 根据级别映射到 docx heading level
      // Markdown 里的 ## → HEADING_1（大章节）
      //            ### → HEADING_2
      //            #### → HEADING_3
      let headingLevel;
      if (level <= 1) headingLevel = null; // 文档顶部的 # SiamFeast 标题跳过（封面已有）
      else if (level === 2) headingLevel = HeadingLevel.HEADING_1;
      else if (level === 3) headingLevel = HeadingLevel.HEADING_2;
      else headingLevel = HeadingLevel.HEADING_3;

      if (headingLevel === null) {
        i++;
        continue;
      }

      children.push(new Paragraph({
        heading: headingLevel,
        children: parseInline(text, {
          font: FONT_HEADING,
          color: COLOR.primary,
          bold: true,
        }),
      }));
      i++;
      continue;
    }

    // ── 图片 ![alt](path)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const relPath = imgMatch[2];
      const imgData = buildImageData(relPath);

      if (imgData) {
        // 图片段落 —— keepNext 让图片和紧随的图注保持在同一页
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 40 },
          keepNext: true,   // 关键：与下一段（图注）绑定不分页
          keepLines: true,  // 图片本身不跨页
          children: [new ImageRun(imgData)],
        }));
        // 图注（灰色小字）—— keepLines 保证图注自身不被拆分
        if (alt && alt.trim()) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            keepLines: true,
            children: [new TextRun({
              text: `${LC.figPrefix}${alt.trim()}`,
              size: SIZE_CAPTION,
              color: COLOR.secondary,
              font: FONT_BODY,
              italics: true,
            })],
          }));
        } else {
          // 没有图注时，用一个空的 keepLines 段落吸收 keepNext 绑定
          children.push(new Paragraph({
            spacing: { before: 0, after: 100 },
            keepLines: true,
            children: [],
          }));
        }
      } else {
        // 图片读取失败，用一个占位段落提示
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 },
          children: [new TextRun({
            text: `[图片占位：${alt || relPath}]`,
            size: SIZE_CAPTION,
            color: COLOR.secondary,
            italics: true,
            font: FONT_BODY,
          })],
        }));
      }
      i++;
      continue;
    }

    // ── 表格（连续的 | 开头行）
    if (/^\s*\|/.test(line)) {
      const tableLines = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      const table = buildTable(tableLines);
      if (table) children.push(table);
      continue;
    }

    // ── 引用块 > （连续的 > 行合并为一个引用段落）
    if (/^\s*>\s?/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      const quoteText = quoteLines.join(" ").trim();
      if (quoteText) {
        children.push(buildQuoteParagraph(quoteText));
      }
      continue;
    }

    // ── 无序列表 - / * / •
    if (/^\s*[-*•]\s+/.test(line)) {
      const itemText = line.replace(/^\s*[-*•]\s+/, "").trim();
      children.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 40, after: 40, line: 300 },
        children: parseInline(itemText),
      }));
      i++;
      continue;
    }

    // ── 有序列表 1. 2. ...
    const olMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (olMatch) {
      const num = parseInt(olMatch[1], 10);
      const itemText = olMatch[2].trim();
      // 用手动数字前缀实现有序列表（避免 numbering reference 复杂性）
      children.push(new Paragraph({
        spacing: { before: 40, after: 40, line: 300 },
        indent: { left: 480, hanging: 240 },
        children: [
          new TextRun({
            text: `${num}. `,
            size: SIZE_BODY,
            color: COLOR.body,
            font: FONT_BODY,
            bold: true,
          }),
          ...parseInline(itemText),
        ],
      }));
      i++;
      continue;
    }

    // ── 普通段落（合并连续的非空、非特殊行）
    const paraLines = [line];
    let j = i + 1;
    while (j < lines.length) {
      const nl = lines[j];
      if (/^\s*$/.test(nl)) break;
      if (/^(#{1,6})\s/.test(nl)) break;
      if (/^!\[/.test(nl.trim())) break;
      if (/^\s*\|/.test(nl)) break;
      if (/^\s*>\s?/.test(nl)) break;
      if (/^\s*[-*•]\s+/.test(nl)) break;
      if (/^\s*\d+\.\s+/.test(nl)) break;
      if (/^-{3,}\s*$/.test(nl.trim())) break;
      paraLines.push(nl);
      j++;
    }
    const paraText = paraLines.join(" ").trim();
    if (paraText) {
      children.push(new Paragraph({
        spacing: { before: 80, after: 120, line: 312 },
        children: parseInline(paraText),
      }));
    }
    i = j;
  }

  return children;
}

/**
 * 构建引用段落：浅灰背景 + 左边框
 */
function buildQuoteParagraph(text) {
  return new Paragraph({
    spacing: { before: 100, after: 100, line: 300 },
    indent: { left: 240, right: 120 },
    shading: { type: ShadingType.CLEAR, fill: COLOR.quoteBg },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: COLOR.accent, space: 10 },
    },
    children: parseInline(text, {
      color: COLOR.body,
      italics: false,
    }),
  });
}

/**
 * 构建 docx Table（Horizontal-Only 风格）
 * 输入是 Markdown 表格的所有行（含表头和分隔行）
 */
function buildTable(tableLines) {
  if (tableLines.length < 2) return null;

  // 解析所有行成单元格数组
  const parsedRows = tableLines.map((ln) => {
    let cleaned = ln.trim();
    // 去掉首尾的 |
    if (cleaned.startsWith("|")) cleaned = cleaned.slice(1);
    if (cleaned.endsWith("|")) cleaned = cleaned.slice(0, -1);
    return cleaned.split("|").map((c) => c.trim());
  });

  // 第二行是分隔线（|---|---|），跳过它
  // 找到分隔行的索引
  let separatorIdx = -1;
  for (let k = 0; k < parsedRows.length; k++) {
    if (parsedRows[k].every((c) => /^[-:]+$/.test(c) || c === "")) {
      separatorIdx = k;
      break;
    }
  }

  let headerCells = [];
  let dataRows = [];

  if (separatorIdx >= 0) {
    headerCells = parsedRows[separatorIdx - 1] || parsedRows[0];
    dataRows = parsedRows.slice(separatorIdx + 1);
  } else {
    // 没有分隔行，第一行作为表头
    headerCells = parsedRows[0];
    dataRows = parsedRows.slice(1);
  }

  if (headerCells.length === 0) return null;

  const colCount = headerCells.length;

  // 列宽：等分（百分比）
  const colWidthPct = Math.floor(100 / colCount);

  const buildCell = (text, isHeader) => {
    const runProps = isHeader
      ? { bold: true, color: COLOR.primary, size: SIZE_TABLE, font: FONT_BODY }
      : { color: COLOR.body, size: SIZE_TABLE, font: FONT_BODY };

    return new TableCell({
      children: [new Paragraph({
        spacing: { before: 40, after: 40, line: 280 },
        children: parseInline(text, runProps),
      })],
      shading: isHeader
        ? { type: ShadingType.CLEAR, fill: COLOR.tableHeaderBg }
        : undefined,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      width: { size: colWidthPct, type: WidthType.PERCENTAGE },
    });
  };

  const rows = [];

  // 表头行
  rows.push(new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headerCells.map((c) => buildCell(c, true)),
  }));

  // 数据行
  for (const row of dataRows) {
    // 补齐列数
    const cells = [];
    for (let k = 0; k < colCount; k++) {
      cells.push(buildCell(row[k] || "", false));
    }
    rows.push(new TableRow({
      cantSplit: true,
      children: cells,
    }));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR.accent },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.accent },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: COLOR.tableInner },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows,
  });
}

// ─────────────────────────────────────────────────────────────
// 封面构建
// ─────────────────────────────────────────────────────────────

/**
 * 简洁封面：白底 + 顶部品牌黄色色条 + 居中标题 + 副标题 + 版本信息
 * 使用 16838 高度的外层 wrapper 表，margin: 0
 */
function buildCover() {
  const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
  const allNoBorders = {
    top: NB, bottom: NB, left: NB, right: NB,
    insideHorizontal: NB, insideVertical: NB,
  };

  const children = [];

  // 1. 顶部品牌黄色色条（高度约 1500 twips）
  const topStrip = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 1400, rule: HeightRule.EXACT },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: COLOR.accent },
        borders: noBorders,
        margins: { left: 0, right: 0 },
        children: [new Paragraph({ children: [] })],
      })],
    })],
  });
  children.push(topStrip);

  // 2. 顶部留白
  children.push(new Paragraph({ spacing: { before: 3200 } }));

  // 3. 英文 label（字间距加宽）
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({
      text: "S I A M F E A S T",
      size: 24,
      color: COLOR.accentDark,
      font: { ascii: "Calibri" },
      characterSpacing: 60,
      bold: true,
    })],
  }));

  // 4. 主标题（合并为单行，44pt 以内避免溢出）
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600, line: 1000, lineRule: "atLeast" },
    children: [new TextRun({
      text: LC.coverTitle,
      size: 88, // 44pt
      bold: true,
      color: COLOR.primary,
      font: { ascii: "Calibri", eastAsia: LC.fontHeading.eastAsia },
    })],
  }));

  // 5. 副标题（带上下细线）
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    indent: { left: 2000, right: 2000 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR.accent, space: 12 },
    },
    children: [],
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({
      text: LC.coverSubtitle,
      size: 28,
      color: COLOR.secondary,
      font: { ascii: "Calibri", eastAsia: LC.fontBody.eastAsia },
    })],
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 200 },
    indent: { left: 2000, right: 2000 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.accent, space: 12 },
    },
    children: [],
  }));

  // 6. 底部留白（推到底部）
  children.push(new Paragraph({ spacing: { before: 4200 } }));

  // 7. 版本信息块
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({
      text: LC.coverVersion,
      size: 26,
      color: COLOR.primary,
      bold: true,
      font: { ascii: "Calibri", eastAsia: LC.fontBody.eastAsia },
    })],
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({
      text: LC.coverDate,
      size: 22,
      color: COLOR.secondary,
      font: { ascii: "Calibri", eastAsia: LC.fontBody.eastAsia },
    })],
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({
      text: LC.coverAudience,
      size: 22,
      color: COLOR.secondary,
      font: { ascii: "Calibri", eastAsia: LC.fontBody.eastAsia },
    })],
  }));

  // 8. 底部品牌黄色色条（呼应顶部）
  const bottomStrip = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 600, rule: HeightRule.EXACT },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: COLOR.accent },
        borders: noBorders,
        margins: { left: 0, right: 0 },
        children: [new Paragraph({ children: [] })],
      })],
    })],
  });
  children.push(bottomStrip);

  // 外层 16838 wrapper（白色背景，无边框）
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: HeightRule.EXACT },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
        borders: noBorders,
        verticalAlign: "top",
        margins: { left: 0, right: 0 },
        children,
      })],
    })],
  })];
}

// ─────────────────────────────────────────────────────────────
// 目录构建
// ─────────────────────────────────────────────────────────────

function buildToc() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
      children: [new TextRun({
        text: LC.tocTitle,
        size: 44,
        bold: true,
        color: COLOR.primary,
        font: { ascii: "Calibri", eastAsia: LC.fontHeading.eastAsia },
        characterSpacing: 40,
      })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({
        text: LC.tocHint,
        size: 18,
        color: COLOR.secondary,
        italics: true,
        font: FONT_BODY,
      })],
    }),
    new TableOfContents(LC.tocTitle, {
      hyperlink: true,
      headingStyleRange: "1-3",
      stylesWithLevels: [
        { styleName: "Heading 1", level: 1 },
        { styleName: "Heading 2", level: 2 },
        { styleName: "Heading 3", level: 3 },
      ],
    }),
  ];
}

// ─────────────────────────────────────────────────────────────
// 主流程
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`▶ 语言版本: ${LANG === "th" ? "ภาษาไทย" : "中文"}`);
  console.log(`▶ 源文件: ${MD_PATH}`);
  console.log("▶ 读取 Markdown 源文件...");
  const md = fs.readFileSync(MD_PATH, "utf-8");

  console.log("▶ 解析 Markdown，构建正文 children...");
  const bodyChildren = parseMarkdown(md);
  console.log(`  正文元素数量: ${bodyChildren.length}`);

  console.log("▶ 构建封面...");
  const coverChildren = buildCover();

  console.log("▶ 构建目录...");
  const tocChildren = buildToc();

  console.log("▶ 组装 Document...");
  const doc = new Document({
    creator: "SiamFeast",
    title: LC.coverTitle,
    description: LC.coverSubtitle,
    styles: {
      default: {
        document: {
          run: {
            font: FONT_BODY,
            size: SIZE_BODY,
            color: COLOR.body,
          },
          paragraph: {
            spacing: { line: 312 },
          },
        },
        heading1: {
          run: {
            font: FONT_HEADING,
            size: 36, // 18pt
            bold: true,
            color: COLOR.primary,
          },
          paragraph: {
            spacing: { before: 480, after: 200, line: 360 },
          },
        },
        heading2: {
          run: {
            font: FONT_HEADING,
            size: 30, // 15pt
            bold: true,
            color: COLOR.primary,
          },
          paragraph: {
            spacing: { before: 320, after: 160, line: 340 },
          },
        },
        heading3: {
          run: {
            font: FONT_HEADING,
            size: 26, // 13pt
            bold: true,
            color: COLOR.primary,
          },
          paragraph: {
            spacing: { before: 240, after: 120, line: 320 },
          },
        },
      },
    },
    sections: [
      // ── Section 1: 封面（margin 0，无页眉页脚） ──
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
          },
        },
        children: coverChildren,
      },
      // ── Section 2: 目录（独立 section，无页眉，有罗马页码） ──
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                children: [PageNumber.CURRENT],
                size: 18,
                color: COLOR.secondary,
                font: FONT_BODY,
              })],
            })],
          }),
        },
        children: tocChildren,
      },
      // ── Section 3: 正文（阿拉伯数字页码，从 1 开始，有页眉页脚） ──
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({
                text: LC.headerText,
                size: 18,
                color: COLOR.secondary,
                font: FONT_BODY,
              })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                children: [PageNumber.CURRENT],
                size: 18,
                color: COLOR.secondary,
                font: FONT_BODY,
              })],
            })],
          }),
        },
        children: bodyChildren,
      },
    ],
  });

  console.log("▶ 生成 docx buffer...");
  const buffer = await Packer.toBuffer(doc);

  console.log(`▶ 写入文件: ${OUT_PATH}`);
  fs.writeFileSync(OUT_PATH, buffer);

  const stat = fs.statSync(OUT_PATH);
  console.log(`✅ 生成成功！文件大小: ${(stat.size / 1024).toFixed(1)} KB (${stat.size} bytes)`);
}

main().catch((err) => {
  console.error("❌ 生成失败:", err);
  process.exit(1);
});
