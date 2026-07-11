<template>
	<view v-if="visible" class="banner-detail-mask" @click="handleMaskClick">
		<view class="banner-detail-container" @click.stop>
			<!-- 关闭按钮 -->
			<view class="close-btn" @click="handleClose">
				<text class="close-text">×</text>
			</view>

			<!-- 多图 swiper -->
			<swiper
				v-if="displayImages.length > 0"
				class="detail-swiper"
				:indicator-dots="displayImages.length > 1"
				indicator-color="rgba(255,255,255,0.4)"
				indicator-active-color="#FFFFFF"
				:autoplay="false"
				:circular="false"
				@change="onSwiperChange"
			>
				<swiper-item v-for="(img, idx) in displayImages" :key="idx">
					<!-- 图片加载失败时的占位 -->
					<view v-if="failedImages[idx]" class="detail-image-fallback">
						<text class="fallback-text">!</text>
					</view>
					<!-- 正常图片 -->
					<image
						v-else
						class="detail-image"
						:src="img"
						mode="widthFix"
						@error="onImageError(idx)"
					></image>
				</swiper-item>
			</swiper>

			<!-- 加载占位 -->
			<view v-else class="loading-placeholder">
				<text class="loading-text">...</text>
			</view>

			<!-- 图片计数（多图时显示） -->
			<view v-if="displayImages.length > 1" class="image-counter">
				<text class="counter-text">{{ currentIndex + 1 }} / {{ displayImages.length }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'BannerDetailModal',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		// 接收图片数组（字符串 URL 数组）
		images: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			currentIndex: 0,
			// 记录加载失败的图片索引（key=idx, value=true）
			failedImages: {}
		}
	},
	computed: {
		// 限制最多 10 张，避免超长数组导致渲染卡顿（按文档第 4 节边界处理）
		displayImages() {
			return (this.images || []).slice(0, 10)
		}
	},
	watch: {
		visible(val) {
			// 弹窗打开时重置索引和失败记录
			if (val) {
				this.currentIndex = 0
				this.failedImages = {}
			}
		}
	},
	methods: {
		handleMaskClick() {
			this.handleClose()
		},
		handleClose() {
			this.$emit('close')
		},
		onSwiperChange(e) {
			if (e.detail && typeof e.detail.current === 'number') {
				this.currentIndex = e.detail.current
			}
		},
		// 单张图加载失败时记录，模板根据这个切换占位图
		onImageError(idx) {
			this.$set(this.failedImages, idx, true)
		}
	}
}
</script>

<style scoped>
.banner-detail-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.85);
	z-index: 99;
	display: flex;
	align-items: center;
	justify-content: center;
}

.banner-detail-container {
	position: relative;
	max-width: 90vw;
	max-height: 90vh;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-btn {
	position: absolute;
	top: -40px;
	right: 0;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
}

.close-text {
	font-size: 24px;
	color: #FFFFFF;
	line-height: 1;
	margin-top: -4px;
}

.detail-swiper {
	width: 80vw;
	max-width: 400px;
	height: 75vh;
	border-radius: 8px;
	overflow: hidden;
	background-color: #000;
}

.detail-image {
	width: 100%;
	/* 竖屏图 9:16，按宽度自适应高度 */
}

/* 单张图加载失败的占位 */
.detail-image-fallback {
	width: 100%;
	height: 70vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #1a1a1a;
	border-radius: 8px;
}

.fallback-text {
	color: #666;
	font-size: 32px;
	font-weight: 700;
}

.loading-placeholder {
	width: 80vw;
	max-width: 400px;
	height: 70vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #1a1a1a;
	border-radius: 8px;
}

.loading-text {
	color: #FFFFFF;
	font-size: 14px;
}

.image-counter {
	position: absolute;
	bottom: 12px;
	left: 50%;
	transform: translateX(-50%);
	padding: 4px 12px;
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 12px;
	z-index: 2;
}

.counter-text {
	color: #FFFFFF;
	font-size: 12px;
}
</style>
