import UQRCode from 'uqrcodejs'

// 平台判断
const IS_H5 = (() => {
	try {
		// H5 环境有 window 和 document，没有 plus
		return typeof window !== 'undefined' && typeof document !== 'undefined' && typeof plus === 'undefined'
	} catch (e) {
		return false
	}
})()

const IS_APP = (() => {
	try {
		return typeof plus !== 'undefined'
	} catch (e) {
		return false
	}
})()

/**
 * Generate QR code image.
 * On H5 (Web): 浏览器原生 Canvas → toDataURL → base64
 * On App: uni canvas → temp file path
 * On 小程序/其他: 纯 JS PNG 编码 → base64（兜底）
 *
 * @param {string} data - QR content
 * @param {Object} options
 * @param {number} [options.size=200]
 * @param {string} [options.canvasId] - App 端必填
 * @param {Object} [options.componentInstance] - App 端必填（this）
 * @returns {Promise<string>} image URL (base64 or temp file path)
 */
export function generateQRImage(data, options = {}) {
	// H5（Web）优先：用浏览器原生 Canvas，最稳定
	if (IS_H5) {
		return generateQRByBrowserCanvas(data, options)
	}
	// App 端用 uni canvas
	if (IS_APP && options.canvasId) {
		return generateQRCanvas(data, options)
	}
	// 兜底（小程序等）：纯 JS PNG 编码
	return generateQRBase64(data, options)
}

/**
 * H5（Web）路径：用浏览器原生 Canvas API
 * 优点：浏览器原生 toDataURL，无需自实现 PNG 编码器，100% 兼容
 */
function generateQRByBrowserCanvas(data, options = {}) {
	const { size = 200, margin = 10, foregroundColor = '#333333', backgroundColor = '#FFFFFF' } = options
	return new Promise((resolve, reject) => {
		try {
			const qr = new UQRCode()
			qr.data = data
			qr.size = size
			qr.margin = margin
			qr.backgroundColor = backgroundColor
			qr.foregroundColor = foregroundColor
			qr.errorCorrectLevel = UQRCode.errorCorrectLevel.M
			qr.make()

			const modules = qr.getDrawModules()

			// 创建原生 canvas（2x 分辨率，retina 屏更清晰）
			const scale = (typeof window !== 'undefined' && window.devicePixelRatio > 1) ? 2 : 1
			const canvas = document.createElement('canvas')
			canvas.width = size * scale
			canvas.height = size * scale
			const ctx = canvas.getContext('2d')
			ctx.scale(scale, scale)

			// 背景
			ctx.fillStyle = backgroundColor
			ctx.fillRect(0, 0, size, size)

			// 模块
			for (let i = 0; i < modules.length; i++) {
				const m = modules[i]
				if (m.type !== 'area' && m.type !== 'tile') continue
				ctx.fillStyle = m.color
				ctx.fillRect(m.x, m.y, m.width, m.height)
			}

			// toDataURL 输出 PNG base64
			const dataUrl = canvas.toDataURL('image/png')
			resolve(dataUrl)
		} catch (e) {
			console.error('[qrcode] H5 canvas error:', e)
			// 兜底用纯 JS PNG 编码
			generateQRBase64(data, options).then(resolve).catch(reject)
		}
	})
}

/**
 * H5 path: pure JS PNG encoder (no canvas dependency)
 */
function generateQRBase64(data, options = {}) {
	const { size = 200, margin = 10, foregroundColor = '#333333', backgroundColor = '#FFFFFF' } = options

	const qr = new UQRCode()
	qr.data = data
	qr.size = size
	qr.margin = margin
	qr.backgroundColor = backgroundColor
	qr.foregroundColor = foregroundColor
	qr.errorCorrectLevel = UQRCode.errorCorrectLevel.M
	qr.make()

	const modules = qr.getDrawModules()
	return Promise.resolve(modulesToPngBase64(modules, size))
}

/**
 * App端 path: draw QR on <canvas>, export to temp file
 */
function generateQRCanvas(data, options = {}) {
	const {
		size = 200,
		margin = 10,
		foregroundColor = '#333333',
		backgroundColor = '#FFFFFF',
		canvasId = 'qrCanvas',
		componentInstance = null
	} = options

	return new Promise((resolve, reject) => {
		try {
			const qr = new UQRCode()
			qr.data = data
			qr.size = size
			qr.margin = margin
			qr.backgroundColor = backgroundColor
			qr.foregroundColor = foregroundColor
			qr.errorCorrectLevel = UQRCode.errorCorrectLevel.M
			qr.make()

			const modules = qr.getDrawModules()
			const ctx = uni.createCanvasContext(canvasId, componentInstance)

			// clear & fill background
			ctx.setFillStyle(backgroundColor)
			ctx.fillRect(0, 0, size, size)

			// draw modules
			for (let i = 0; i < modules.length; i++) {
				const m = modules[i]
				if (m.type !== 'area' && m.type !== 'tile') continue
				ctx.setFillStyle(m.color)
				ctx.fillRect(m.x, m.y, m.width, m.height)
			}

			ctx.draw(false, () => {
				setTimeout(() => {
					uni.canvasToTempFilePath({
						canvasId: canvasId,
						width: size,
						height: size,
						destWidth: size * 2,
						destHeight: size * 2,
						success: (res) => {
							resolve(res.tempFilePath)
						},
						fail: (err) => {
							console.error('[qrcode] canvasToTempFilePath fail:', err)
							// fallback to base64
							generateQRBase64(data, options).then(resolve).catch(reject)
						}
					}, componentInstance)
				}, 500)
			})
		} catch (e) {
			console.error('[qrcode] canvas draw error:', e)
			generateQRBase64(data, options).then(resolve).catch(reject)
		}
	})
}

/**
 * Pure JS PNG encoder: QR modules → base64 data URI
 */
function modulesToPngBase64(modules, size) {
	const pixels = new Uint8Array(size * size * 4)

	for (let i = 0; i < pixels.length; i += 4) {
		pixels[i] = 255
		pixels[i + 1] = 255
		pixels[i + 2] = 255
		pixels[i + 3] = 255
	}

	for (let i = 0; i < modules.length; i++) {
		const m = modules[i]
		if (m.type !== 'area' && m.type !== 'tile') continue
		const rgb = hexToRgb(m.color)
		const x0 = Math.round(m.x)
		const y0 = Math.round(m.y)
		const x1 = Math.round(m.x + m.width)
		const y1 = Math.round(m.y + m.height)
		for (let y = y0; y < y1 && y < size; y++) {
			for (let x = x0; x < x1 && x < size; x++) {
				const idx = (y * size + x) * 4
				pixels[idx] = rgb.r
				pixels[idx + 1] = rgb.g
				pixels[idx + 2] = rgb.b
				pixels[idx + 3] = 255
			}
		}
	}

	return encodePng(pixels, size)
}

function hexToRgb(hex) {
	const h = hex.replace('#', '')
	return {
		r: parseInt(h.substring(0, 2), 16),
		g: parseInt(h.substring(2, 4), 16),
		b: parseInt(h.substring(4, 6), 16)
	}
}

/**
 * Minimal PNG encoder (RFC 2083) — raw RGBA pixels → base64
 */
function encodePng(pixels, size) {
	const raw = deflateRaw(filterAndPack(pixels, size))
	const chunks = []

	const ihdr = new Uint8Array(13)
	writeU32(ihdr, 0, size)
	writeU32(ihdr, 4, size)
	ihdr[8] = 8
	ihdr[9] = 2
	ihdr[10] = 0
	ihdr[11] = 0
	ihdr[12] = 0
	chunks.push(makeChunk(0x49484452, ihdr))

	chunks.push(makeChunk(0x49444154, raw))
	chunks.push(makeChunk(0x49454E44, new Uint8Array(0)))

	const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
	let totalLen = sig.length
	for (const c of chunks) totalLen += c.length

	const buf = new Uint8Array(totalLen)
	let offset = 0
	buf.set(sig, offset); offset += sig.length
	for (const c of chunks) {
		buf.set(c, offset); offset += c.length
	}

	return 'data:image/png;base64,' + uint8ToBase64(buf)
}

function filterAndPack(pixels, size) {
	const rowBytes = size * 3
	const filtered = new Uint8Array((rowBytes + 1) * size)
	for (let y = 0; y < size; y++) {
		const rowOffset = y * (rowBytes + 1)
		filtered[rowOffset] = 0
		for (let x = 0; x < size; x++) {
			const srcIdx = (y * size + x) * 4
			const dstIdx = rowOffset + 1 + x * 3
			filtered[dstIdx] = pixels[srcIdx]
			filtered[dstIdx + 1] = pixels[srcIdx + 1]
			filtered[dstIdx + 2] = pixels[srcIdx + 2]
		}
	}
	return filtered
}

function deflateRaw(data) {
	const maxBlock = 65535
	const numBlocks = Math.ceil(data.length / maxBlock) || 1
	let outSize = 2
	for (let i = 0; i < numBlocks; i++) {
		const start = i * maxBlock
		const end = Math.min(start + maxBlock, data.length)
		outSize += 5 + (end - start)
	}
	outSize += 4

	const out = new Uint8Array(outSize)
	let pos = 0

	out[pos++] = 0x78
	out[pos++] = 0x01

	for (let i = 0; i < numBlocks; i++) {
		const start = i * maxBlock
		const end = Math.min(start + maxBlock, data.length)
		const len = end - start
		const isLast = (i === numBlocks - 1)

		out[pos++] = isLast ? 1 : 0
		out[pos++] = len & 0xFF
		out[pos++] = (len >> 8) & 0xFF
		out[pos++] = ~len & 0xFF
		out[pos++] = (~len >> 8) & 0xFF

		out.set(data.subarray(start, end), pos)
		pos += len
	}

	const adler = adler32(data)
	out[pos++] = (adler >> 24) & 0xFF
	out[pos++] = (adler >> 16) & 0xFF
	out[pos++] = (adler >> 8) & 0xFF
	out[pos++] = adler & 0xFF

	return out
}

function adler32(data) {
	let a = 1, b = 0
	for (let i = 0; i < data.length; i++) {
		a = (a + data[i]) % 65521
		b = (b + a) % 65521
	}
	return (b << 16) | a
}

function makeChunk(type, data) {
	const len = data.length
	const buf = new Uint8Array(12 + len)
	writeU32(buf, 0, len)
	buf[4] = (type >> 24) & 0xFF
	buf[5] = (type >> 16) & 0xFF
	buf[6] = (type >> 8) & 0xFF
	buf[7] = type & 0xFF
	buf.set(data, 8)
	const crc = crc32(buf, 4, 4 + len)
	writeU32(buf, 8 + len, crc)
	return buf
}

function writeU32(buf, offset, val) {
	buf[offset] = (val >> 24) & 0xFF
	buf[offset + 1] = (val >> 16) & 0xFF
	buf[offset + 2] = (val >> 8) & 0xFF
	buf[offset + 3] = val & 0xFF
}

const CRC_TABLE = (() => {
	const t = new Uint32Array(256)
	for (let n = 0; n < 256; n++) {
		let c = n
		for (let k = 0; k < 8; k++) {
			c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
		}
		t[n] = c
	}
	return t
})()

function crc32(buf, start, end) {
	let c = 0xFFFFFFFF
	for (let i = start; i < end; i++) {
		c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
	}
	return (c ^ 0xFFFFFFFF) >>> 0
}

function uint8ToBase64(buf) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	let result = ''
	const len = buf.length
	for (let i = 0; i < len; i += 3) {
		const b0 = buf[i]
		const b1 = i + 1 < len ? buf[i + 1] : 0
		const b2 = i + 2 < len ? buf[i + 2] : 0
		result += chars[b0 >> 2]
		result += chars[((b0 & 3) << 4) | (b1 >> 4)]
		result += i + 1 < len ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '='
		result += i + 2 < len ? chars[b2 & 63] : '='
	}
	return result
}
