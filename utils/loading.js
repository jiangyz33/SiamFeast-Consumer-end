/**
 * 全局顶部加载条 (NProgress 风格)
 * 参考：美团 APP 页面切换时顶部的金色进度条
 */

let loadingBarEl = null
let timer = null
let currentWidth = 0
let isStarted = false

const BAR_HEIGHT = '3px'
const COLOR = '#F2B131' // 主题金色
const TRICKLE_SPEED = 200 // 自增间隔 ms

function createElement() {
	if (loadingBarEl) return loadingBarEl

	const bar = document.createElement('div')
	bar.id = 'global-loading-bar'

	const inner = document.createElement('div')
	inner.id = 'global-loading-bar-inner'

	bar.appendChild(inner)
	document.body.appendChild(bar)

	loadingBarEl = bar
	return bar
}

function applyStyle() {
	if (!loadingBarEl) return
	const inner = loadingBarEl.querySelector('#global-loading-bar-inner')
	if (!inner) return

	inner.style.width = currentWidth + '%'
	inner.style.transition = 'width 0.2s ease'
}

function trickle() {
	if (!isStarted) return
	if (currentWidth >= 98) {
		// 接近完成时放慢
		currentWidth += (100 - currentWidth) * 0.02
	} else if (currentWidth >= 80) {
		currentWidth += 0.5
	} else if (currentWidth >= 60) {
		currentWidth += 1
	} else {
		currentWidth += 2
	}
	currentWidth = Math.min(currentWidth, 99)
	applyStyle()
}

function startTrickle() {
	stopTrickle()
	timer = setInterval(trickle, TRICKLE_SPEED)
}

function stopTrickle() {
	if (timer) {
		clearInterval(timer)
		timer = null
	}
}

/**
 * 开始加载动画
 */
export function startLoading() {
	if (isStarted) return
	isStarted = true
	currentWidth = 0

	const bar = createElement()
	const inner = bar.querySelector('#global-loading-bar-inner')

	// 重置
	inner.style.transition = 'none'
	inner.style.width = '0%'

	// 显示
	bar.style.display = 'block'
	bar.offsetHeight // force reflow

	// 启动动画
	inner.style.transition = 'width 0.3s ease'
	currentWidth = 10
	inner.style.width = '10%'

	startTrickle()
}

/**
 * 完成加载动画
 */
export function finishLoading() {
	if (!isStarted) return
	isStarted = false
	stopTrickle()

	currentWidth = 100

	if (!loadingBarEl) return
	const inner = loadingBarEl.querySelector('#global-loading-bar-inner')
	if (!inner) return

	inner.style.transition = 'width 0.15s ease'
	inner.style.width = '100%'

	// 动画结束后隐藏
	setTimeout(() => {
		if (loadingBarEl) {
			const i = loadingBarEl.querySelector('#global-loading-bar-inner')
			if (i) {
				i.style.transition = 'opacity 0.2s ease'
				i.style.opacity = '0'
			}
		}
		setTimeout(() => {
			if (loadingBarEl) {
				loadingBarEl.style.display = 'none'
				const i = loadingBarEl.querySelector('#global-loading-bar-inner')
				if (i) {
					i.style.opacity = '1'
					i.style.width = '0%'
					i.style.transition = 'none'
				}
			}
			currentWidth = 0
		}, 250)
	}, 200)
}

/**
 * 仅注入加载条的 CSS（在 app 初始化时调用）
 */
export function injectLoadingBarCSS() {
	if (document.getElementById('global-loading-bar-style')) return

	const style = document.createElement('style')
	style.id = 'global-loading-bar-style'
	style.textContent = `
		#global-loading-bar {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: ${BAR_HEIGHT};
			z-index: 99999;
			display: none;
			pointer-events: none;
		}
		#global-loading-bar-inner {
			height: 100%;
			width: 0%;
			background: ${COLOR};
			box-shadow: 0 0 8px rgba(242, 177, 49, 0.4);
		}
	`
	document.head.appendChild(style)
}
