<template>
	<view class="tier-icon-wrap" :class="`tier-icon-level-${sortIndex}`">
		<!-- 第 0 档（最低档/普通）：用户轮廓 -->
		<svg v-if="sortIndex === 0" class="tier-svg" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
		</svg>
		<!-- 第 1 档（金卡级别）：五角星 -->
		<svg v-else-if="sortIndex === 1" class="tier-svg" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.1 1.13-6.58L2.45 8.94l6.6-.96L12 2z"/>
		</svg>
		<!-- 第 2 档（VIP 级别）：精致皇冠（5 个尖） -->
		<svg v-else-if="sortIndex === 2" class="tier-svg" viewBox="0 0 32 24" fill="currentColor">
			<path d="M2 6 L7 12 L12 4 L16 9 L20 4 L25 12 L30 6 L28 20 L4 20 Z M4 22 L28 22 L28 23.5 L4 23.5 Z"/>
			<circle cx="2" cy="6" r="1.5"/>
			<circle cx="30" cy="6" r="1.5"/>
			<circle cx="16" cy="2" r="1.2"/>
		</svg>
		<!-- 第 3 档（钻石级别）：六角钻 -->
		<svg v-else-if="sortIndex === 3" class="tier-svg" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2 L22 9 L18 22 L6 22 L2 9 Z M12 6 L8 10 L12 18 L16 10 Z"/>
		</svg>
		<!-- 第 4+ 档（最高级）：金色皇冠（更精致） -->
		<svg v-else class="tier-svg" viewBox="0 0 32 24" fill="currentColor">
			<path d="M2 6 L7 12 L12 4 L16 9 L20 4 L25 12 L30 6 L28 20 L4 20 Z M4 22 L28 22 L28 23.5 L4 23.5 Z"/>
			<circle cx="2" cy="6" r="1.5"/>
			<circle cx="30" cy="6" r="1.5"/>
			<circle cx="16" cy="2" r="1.5"/>
		</svg>
	</view>
</template>

<script>
export default {
	name: 'TierIcon',
	props: {
		tierCode: { type: String, default: '' },
		sortIndex: { type: Number, default: 0 }
	}
}
</script>

<style scoped>
.tier-icon-wrap {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.4);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tier-svg {
	width: 22px;
	height: 22px;
	display: block;
}

/* 第 0 档（最低）：浅灰 */
.tier-icon-level-0 {
	color: #6B6B6B;
	background-color: rgba(255, 255, 255, 0.5);
}

/* 第 1 档（金卡级别）：金色 */
.tier-icon-level-1 {
	color: #C9892D;
	background-color: rgba(255, 255, 255, 0.6);
	box-shadow: 0 2px 8px rgba(201, 137, 45, 0.3);
}

/* 第 2 档（VIP 级别）：深金棕 + 金边光晕 */
.tier-icon-level-2 {
	color: #FFD700;
	background: linear-gradient(135deg, #5D3A10 0%, #8B5E2A 100%);
	box-shadow: 0 2px 12px rgba(255, 215, 0, 0.4);
	border: 1.5px solid rgba(255, 215, 0, 0.5);
}
.tier-icon-level-2 .tier-svg {
	width: 24px;
	height: 24px;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

/* 第 3 档（钻石级别）：银钻 */
.tier-icon-level-3 {
	color: #FFFFFF;
	background: linear-gradient(135deg, #78909C 0%, #37474F 100%);
	box-shadow: 0 2px 12px rgba(176, 190, 197, 0.5);
	border: 1.5px solid rgba(255, 255, 255, 0.4);
}

/* 第 4+ 档（黑钻级别）：金色配黑钻 */
.tier-icon-level-4 {
	color: #FFD700;
	background: linear-gradient(135deg, #212121 0%, #424242 100%);
	box-shadow: 0 2px 12px rgba(255, 215, 0, 0.5);
	border: 1.5px solid rgba(255, 215, 0, 0.6);
}
</style>
