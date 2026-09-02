<template>
	<view v-if="visible" class="dpm-mask" @click="handleMaskClick">
		<view class="dpm-sheet" @click.stop>
			<view class="dpm-header">
				<text class="dpm-cancel" @click="handleCancel">{{ t('common.cancel') }}</text>
				<text class="dpm-title">{{ title || t('settings.datePickerTitle') }}</text>
				<text class="dpm-confirm" @click="handleConfirm">{{ t('common.confirm') }}</text>
			</view>
			<view class="dpm-indicator">
				<text v-if="!hideYear" class="dpm-ind-suffix">{{ t('settings.year') }}</text>
				<text class="dpm-ind-suffix">{{ t('settings.month') }}</text>
				<text class="dpm-ind-suffix">{{ t('settings.day') }}</text>
			</view>
			<picker-view
				class="dpm-pview"
				:value="pickerValue"
				:indicator-style="indicatorStyle"
				@change="onPickerChange"
			>
				<picker-view-column v-if="!hideYear" class="dpm-pcol">
					<view class="dpm-cell" v-for="(y, i) in yearList" :key="'y' + i">
						<text class="dpm-cell-text">{{ y }}</text>
					</view>
				</picker-view-column>
				<picker-view-column class="dpm-pcol">
					<view class="dpm-cell" v-for="(m, i) in monthList" :key="'m' + i">
						<text class="dpm-cell-text">{{ format2(m) }}</text>
					</view>
				</picker-view-column>
				<picker-view-column class="dpm-pcol">
					<view class="dpm-cell" v-for="(d, i) in dayList" :key="'d' + i">
						<text class="dpm-cell-text">{{ format2(d) }}</text>
					</view>
				</picker-view-column>
			</picker-view>
		</view>
	</view>
</template>

<script>
import i18n from '@/i18n/index.js'

const MIN_YEAR = 1900

export default {
	name: 'DatePickerModal',
	props: {
		visible: { type: Boolean, default: false },
		value: { type: String, default: '' },          // YYYY-MM-DD
		minDate: { type: String, default: `${MIN_YEAR}-01-01` },
		maxDate: { type: String, default: '' },         // 默认今天
		title: { type: String, default: '' },
		// 隐藏年份选择（生日场景：只选月/日，年固定 2000 提交，后端仍收 YYYY-MM-DD）
		hideYear: { type: Boolean, default: false }
	},
	data() {
		return {
			langVersion: 0,
			indicatorStyle: 'height: 56px;',
			// 三列当前选中的索引（驱动 picker-view 的 value）
			yIdx: 0,
			mIdx: 0,
			dIdx: 0,
			innerYear: 2000,
			innerMonth: 1
		}
	},
	computed: {
		maxYearNum() {
			if (this.maxDate) return Number(String(this.maxDate).slice(0, 4)) || new Date().getFullYear()
			return new Date().getFullYear()
		},
		yearList() {
			const arr = []
			for (let y = MIN_YEAR; y <= this.maxYearNum; y++) arr.push(y)
			return arr
		},
		monthList() {
			return Array.from({ length: 12 }, (_, i) => i + 1)
		},
		daysInMonth() {
			return new Date(this.innerYear, this.innerMonth, 0).getDate()
		},
		dayList() {
			return Array.from({ length: this.daysInMonth }, (_, i) => i + 1)
		},
		pickerValue() {
			// hideYear 时列只剩 月/日，索引数组必须同步去首项，否则首列错位
			return this.hideYear ? [this.mIdx, this.dIdx] : [this.yIdx, this.mIdx, this.dIdx]
		}
	},
	watch: {
		visible: {
			immediate: true,
			handler(val) {
				if (val) this.syncFromValue()
			}
		},
		value() {
			if (this.visible) this.syncFromValue()
		}
	},
	methods: {
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		format2(n) { return String(n).padStart(2, '0') },
		syncFromValue() {
			const v = this.value || ''
			let y = 2000, m = 1, d = 1
			if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
				y = Number(v.slice(0, 4))
				m = Number(v.slice(5, 7))
				d = Number(v.slice(8, 10))
			} else {
				const now = new Date()
				y = now.getFullYear() - 18
				m = now.getMonth() + 1
				d = now.getDate()
			}
			y = Math.min(Math.max(y, MIN_YEAR), this.maxYearNum)
			m = Math.min(Math.max(m, 1), 12)
			this.innerYear = y
			this.innerMonth = m
			const maxDay = new Date(y, m, 0).getDate()
			d = Math.min(Math.max(d, 1), maxDay)

			this.yIdx = Math.max(0, this.yearList.indexOf(y))
			this.mIdx = m - 1
			this.dIdx = d - 1
		},
		onPickerChange(e) {
			const vals = (e && e.detail && e.detail.value) || []
			// hideYear 两列（月/日）；完整三列（年/月/日）
			const ny = this.hideYear ? this.yIdx : Number(vals[0])
			const nm = Number(vals[this.hideYear ? 0 : 1])
			const nd = Number(vals[this.hideYear ? 1 : 2])
			// 月份/年份变化 → 钳制日期
			if (ny === this.yIdx && nm === this.mIdx) {
				// 只是日期变化
				this.dIdx = nd
				return
			}
			this.yIdx = ny
			this.mIdx = nm
			this.innerYear = this.yearList[ny] || this.innerYear
			this.innerMonth = this.monthList[nm] || this.innerMonth
			// 等下一帧 dayList 更新后再钳制 dIdx
			this.$nextTick(() => {
				const maxIdx = this.dayList.length - 1
				if (this.dIdx > maxIdx) this.dIdx = maxIdx
				if (typeof nd === 'number' && nd >= 0 && nd <= maxIdx) this.dIdx = nd
			})
		},
		handleConfirm() {
			const y = this.hideYear ? 2000 : this.yearList[this.yIdx]
			const m = this.monthList[this.mIdx]
			const d = this.dayList[this.dIdx]
			if (!y || !m || !d) return
			const v = `${y}-${this.format2(m)}-${this.format2(d)}`
			this.$emit('input', v)
			this.$emit('change', v)
			this.$emit('close')
		},
		handleCancel() { this.$emit('close') },
		handleMaskClick() { this.$emit('close') }
	}
}
</script>

<style scoped>
.dpm-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 9999;
	display: flex;
	align-items: flex-end;
}
.dpm-sheet {
	width: 100%;
	background-color: #FFFFFF;
	border-radius: 24rpx 24rpx 0 0;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
}
.dpm-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 32rpx;
	border-bottom: 2rpx solid #F0F0F0;
}
.dpm-cancel {
	font-size: 28rpx;
	color: #828282;
}
.dpm-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1A1A1A;
}
.dpm-confirm {
	font-size: 28rpx;
	color: #F2B131;
	font-weight: 600;
}
.dpm-indicator {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 16rpx 24rpx 0;
}
.dpm-ind-suffix {
	flex: 1;
	text-align: center;
	font-size: 24rpx;
	color: #BDBDBD;
}
.dpm-pview {
	width: 100%;
	height: 320rpx;
	margin-top: 8rpx;
}
.dpm-pcol {
	flex: 1;
}
.dpm-cell {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 56px;
}
.dpm-cell-text {
	font-size: 32rpx;
	color: #1A1A1A;
	font-weight: 500;
}
</style>
