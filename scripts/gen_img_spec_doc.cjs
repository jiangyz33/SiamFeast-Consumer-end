const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel } = require("docx");
const fs = require("fs");
const path = require("path");

function makeHeaderCell(text) {
    return new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
            children: [new TextRun({ text, bold: true, size: 22, font: "Microsoft YaHei", color: "FFFFFF" })],
            spacing: { before: 60, after: 60 },
            alignment: AlignmentType.CENTER,
        })],
        shading: { fill: "F2B131" },
        verticalAlign: "center",
    });
}

function makeCell(text, width) {
    return new TableCell({
        width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
        children: [new Paragraph({
            children: [new TextRun({ text, size: 20, font: "Microsoft YaHei", color: "333333" })],
            spacing: { before: 60, after: 60 },
        })],
        verticalAlign: "center",
    });
}

function makeRow(cells, isHeader) {
    return new TableRow({
        children: cells.map(t => isHeader ? makeHeaderCell(t) : makeCell(t)),
    });
}

function makeBullet(text) {
    return new Paragraph({
        children: [new TextRun({ text: "  • " + text, size: 22, font: "Microsoft YaHei" })],
        spacing: { after: 80 },
        indent: { left: 480 },
    });
}

function makeInfoRow(label, value) {
    return new Paragraph({
        children: [
            new TextRun({ text: label, bold: true, size: 22, font: "Microsoft YaHei" }),
            new TextRun({ text: value, size: 22, font: "Microsoft YaHei" }),
        ],
        spacing: { after: 100 },
    });
}

function makeSubTitle(text) {
    return new Paragraph({
        children: [new TextRun({ text, bold: true, size: 28, font: "Microsoft YaHei", color: "333333" })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 200 },
    });
}

function makeSamplePlaceholder(label, sublabel) {
    return [
        new Paragraph({
            children: [new TextRun({ text: label, italics: true, size: 22, font: "Microsoft YaHei", color: "888888" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 40 },
        }),
        new Paragraph({
            children: [new TextRun({ text: sublabel, size: 18, font: "Microsoft YaHei", color: "999999" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
        new Paragraph({
            children: [new TextRun({ text: " ", size: 10 })],
            spacing: { after: 0 },
        }),
    ];
}

const doc = new Document({
    sections: [{
        properties: {
            page: {
                margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
                size: { width: 11906, height: 16838 }, // A4
            }
        },
        children: [
            // ===== Title =====
            new Paragraph({
                children: [new TextRun({ text: "SiamFeast 图片尺寸规范", bold: true, size: 40, font: "Microsoft YaHei", color: "333333" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            }),
            new Paragraph({
                children: [new TextRun({ text: "本文档说明 App 启动屏和首页轮播图的尺寸要求，供设计师参考。", size: 22, font: "Microsoft YaHei", color: "666666" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
            }),

            // ===== 1. Splash Screen =====
            makeSubTitle("1. 启动屏（Splash Screen）"),
            makeInfoRow("文件路径：", "static/images/03_splash.png"),
            makeInfoRow("配置位置：", "manifest.json → app-plus.distribute.splashscreen"),
            new Paragraph({ children: [new TextRun({ text: " ", size: 10 })], spacing: { after: 100 } }),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    makeRow(["平台", "推荐尺寸（宽 x 高）", "格式", "说明"], true),
                    makeRow(["Android", "1080 x 1920 px", "PNG", "建议 .9.png 九宫格图片适配所有屏幕"], false),
                    makeRow(["iPhone（通用）", "1242 x 2688 px", "PNG", "对应 portrait-896h@3x"], false),
                    makeRow(["iPad Pro", "2048 x 2732 px", "PNG", "对应 portrait-1366h@2x"], false),
                ],
            }),

            new Paragraph({
                children: [new TextRun({ text: "注意事项：", bold: true, size: 22, font: "Microsoft YaHei" })],
                spacing: { before: 200, after: 80 },
            }),
            makeBullet("必须为竖屏尺寸（宽 < 高）"),
            makeBullet("格式必须为 PNG，不支持 JPG（Android aapt2 编译会报错）"),
            makeBullet("文件不宜过大，建议控制在 3MB 以内"),
            makeBullet("如果只提供一张图，建议用 1080 x 1920 px，Android/iOS 都会自动缩放"),

            new Paragraph({
                children: [new TextRun({ text: "当前状态：", bold: true, size: 22, font: "Microsoft YaHei", color: "CC0000" })],
                spacing: { before: 200, after: 40 },
            }),
            new Paragraph({
                children: [new TextRun({ text: "现有图片尺寸：2688 x 1242 px（横屏，需要替换为竖屏图片）", size: 22, font: "Microsoft YaHei", color: "CC0000" })],
                spacing: { after: 100 },
            }),

            // Splash sample placeholder
            ...makeSamplePlaceholder(
                "【启动屏样例图位置 — 请在此处插入实际图片】",
                "推荐尺寸：1080 x 1920 px（竖屏）"
            ),

            // ===== 2. Banner =====
            makeSubTitle("2. 首页轮播图（Banner）"),
            makeInfoRow("图片来源：", "后端 API getHomeBanners() 返回 image_url"),
            makeInfoRow("本地占位图：", "static/images/banner-placeholder.svg"),
            new Paragraph({ children: [new TextRun({ text: " ", size: 10 })], spacing: { after: 100 } }),

            new Paragraph({
                children: [new TextRun({ text: "显示区域信息：", bold: true, size: 22, font: "Microsoft YaHei" })],
                spacing: { after: 80 },
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    makeRow(["属性", "值"], true),
                    makeRow(["显示区域宽度", "100%（屏幕宽度，约 375px @2x）"], false),
                    makeRow(["显示区域高度", "200px（CSS 固定高度）"], false),
                    makeRow(["实际显示区域", "约 750 x 400 pt（@2x 屏幕）"], false),
                    makeRow(["渲染模式", "aspectFill（等比裁剪填满）"], false),
                    makeRow(["圆角", "12px"], false),
                ],
            }),

            new Paragraph({
                children: [new TextRun({ text: "推荐上传尺寸：", bold: true, size: 22, font: "Microsoft YaHei" })],
                spacing: { before: 200, after: 80 },
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    makeRow(["尺寸", "适用场景"], true),
                    makeRow(["750 x 400 px", "标准尺寸，正好匹配显示区域"], false),
                    makeRow(["1080 x 576 px", "高清尺寸，在 @3x 屏幕上更清晰"], false),
                    makeRow(["1200 x 640 px", "最高清，适配所有设备"], false),
                ],
            }),

            new Paragraph({
                children: [new TextRun({ text: "注意事项：", bold: true, size: 22, font: "Microsoft YaHei" })],
                spacing: { before: 200, after: 80 },
            }),
            makeBullet("宽高比建议保持约 1.875:1（接近 16:9）"),
            makeBullet("aspectFill 模式会裁剪溢出部分，重要内容放在中间区域"),
            makeBullet("支持 PNG / JPG / WebP 格式"),
            makeBullet("单张图片建议不超过 500KB，保证加载速度"),

            // Banner sample placeholder
            ...makeSamplePlaceholder(
                "【轮播图样例图位置 — 请在此处插入实际图片】",
                "推荐尺寸：1080 x 576 px（宽高比 1.875:1）"
            ),

            // ===== 3. Other =====
            makeSubTitle("3. 其他图片尺寸参考"),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    makeRow(["用途", "文件", "推荐尺寸", "格式"], true),
                    makeRow(["App 图标", "02_Icon-App.png", "1024 x 1024 px", "PNG"], false),
                    makeRow(["默认头像", "04_default_avatar.png", "200 x 200 px", "PNG"], false),
                    makeRow(["品牌 Logo", "01_brand Logo.png", "按需", "PNG"], false),
                ],
            }),
        ]
    }]
});

const outputPath = path.join("D:", "project", "SiamFeast", "docs", "SiamFeast图片尺寸规范.docx");
Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outputPath, buffer);
    console.log("Word document created successfully:", outputPath);
}).catch(err => {
    console.error("Error:", err);
});
