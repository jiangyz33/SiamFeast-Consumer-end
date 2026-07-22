<template>
	<view class="settings-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('settings.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 账号设置 -->
			<view class="settings-section">
				<view class="section-title">
					<text class="title-text">{{ t('settings.accountSettings') }}</text>
				</view>
				<view class="settings-card">
						<view class="setting-item" @click="handleAvatarClick">
						<text class="setting-label">{{ t('settings.avatar') }}</text>
						<view class="setting-right">
							<image class="setting-avatar-preview" :src="fixMinioUrl(userInfo?.avatar_url) || '/static/images/04_default_avatar.png'" mode="aspectFill"></image>
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<view class="setting-item" @click="openNicknameModal">
						<text class="setting-label">{{ t('settings.nickname') }}</text>
						<view class="setting-right">
							<text class="setting-value">{{ userNickname }}</text>
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<view class="setting-item" @click="handleSettingClick('phone')">
						<text class="setting-label">{{ t('settings.phone') }}</text>
						<view class="setting-right">
							<text class="setting-value">{{ userInfo?.phone || '-' }}</text>
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<view class="setting-item" @click="openBirthdayModal">
						<text class="setting-label">{{ t('settings.birthday') }}</text>
						<view class="setting-right">
							<text class="setting-value">{{ userBirthday || i18n.t('settings.notSet') }}</text>
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<view class="setting-item" @click="openPasswordModal">
						<text class="setting-label">{{ t('settings.changePassword') }}</text>
						<view class="setting-right">
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
				</view>
			</view>

			<!-- 通用设置 -->
			<view class="settings-section">
				<view class="section-title">
					<text class="title-text">{{ t('settings.generalSettings') }}</text>
				</view>
				<view class="settings-card">
					<!-- #ifndef H5 -->
					<!-- APP 端独有：通知开关（H5 无原生推送） -->
					<view class="setting-item">
						<text class="setting-label">{{ t('settings.notifications') }}</text>
						<view class="setting-right">
							<switch :checked="notificationEnabled" @change="handleNotificationChange" color="#F2B131" />
						</view>
					</view>
					<!-- #endif -->
					<view class="setting-item" @click="handleSettingClick('language')">
						<text class="setting-label">{{ t('settings.language') }}</text>
						<view class="setting-right">
							<text class="setting-value">{{ t('settings.currentLanguage') }}</text>
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<!-- #ifndef H5 -->
					<!-- APP 端独有：清除缓存（H5 由浏览器管理） -->
					<view class="setting-item" @click="handleSettingClick('cache')">
						<text class="setting-label">{{ t('settings.cache') }}</text>
						<view class="setting-right">
							<text class="setting-value">12.5MB</text>
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<!-- #endif -->
				</view>
			</view>

			<!-- 关于 -->
			<view class="settings-section">
				<view class="section-title">
					<text class="title-text">{{ t('settings.aboutSection') }}</text>
				</view>
				<view class="settings-card">
					<view class="setting-item" @click="handleSettingClick('about')">
						<text class="setting-label">{{ t('settings.about') }}</text>
						<view class="setting-right">
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<view class="setting-item" @click="handleSettingClick('privacy')">
						<text class="setting-label">{{ t('settings.privacy') }}</text>
						<view class="setting-right">
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<view class="setting-item" @click="handleSettingClick('agreement')">
						<text class="setting-label">{{ t('settings.agreement') }}</text>
						<view class="setting-right">
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<view class="setting-item">
						<text class="setting-label">{{ t('settings.version') }}</text>
						<view class="setting-right">
							<text class="setting-value">v1.0.0</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 退出登录按钮 -->
			<view class="logout-section">
				<view class="logout-btn" @click="handleLogout">
					<text class="logout-text">{{ t('settings.logout') }}</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 昵称编辑弹窗 -->
		<view class="modal-mask" v-if="showNicknameModal" @click.self="showNicknameModal = false">
			<view class="modal-box">
				<text class="modal-box-title">{{ t('settings.editNickname') }}</text>
				<view class="modal-box-body">
					<input class="modal-input" v-model="nicknameInput"
						:placeholder="i18n.t('settings.nicknamePlaceholder')" maxlength="20" />
				</view>
				<view class="modal-box-footer">
					<view class="modal-box-btn" @click="showNicknameModal = false">
						<text class="modal-box-btn-text cancel-text">{{ t('common.cancel') }}</text>
					</view>
					<view class="modal-box-btn" @click="confirmNickname">
						<text class="modal-box-btn-text confirm-text">{{ t('common.confirm') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 出生日期弹窗 -->
		<view class="modal-mask" v-if="showBirthdayModal" @click.self="showBirthdayModal = false">
			<view class="modal-box birthday-modal">
				<text class="modal-box-title">{{ t('settings.birthday') }}</text>
				<view class="modal-box-body">
					<view class="date-picker-wrap">
						<picker-view class="date-picker" :value="datePickerValue" @change="onDatePickerChange">
							<picker-view-column>
								<view v-for="(y, i) in years" :key="i" class="picker-item">{{ y }}</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="(m, i) in months" :key="i" class="picker-item">{{ m }}</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="(d, i) in days" :key="i" class="picker-item">{{ d }}</view>
							</picker-view-column>
						</picker-view>
						<view class="picker-label-row">
							<text class="picker-label">年</text>
							<text class="picker-label">月</text>
							<text class="picker-label">日</text>
						</view>
					</view>
				</view>
				<view class="modal-box-footer">
					<view class="modal-box-btn" @click="showBirthdayModal = false">
						<text class="modal-box-btn-text cancel-text">{{ t('common.cancel') }}</text>
					</view>
					<view class="modal-box-btn" @click="confirmBirthday">
						<text class="modal-box-btn-text confirm-text">{{ t('common.confirm') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 修改密码弹窗 -->
		<view class="modal-mask" v-if="showPasswordModal" @click.self="showPasswordModal = false">
			<view class="modal-box">
				<text class="modal-box-title">{{ t('settings.changePassword') }}</text>
				<view class="modal-box-body">
					<input class="modal-input" type="password" v-model="passwordForm.oldPassword"
						:placeholder="i18n.t('settings.oldPasswordPlaceholder')" />
					<input class="modal-input" type="password" v-model="passwordForm.newPassword"
						:placeholder="i18n.t('settings.newPasswordPlaceholder')" />
					<input class="modal-input" type="password" v-model="passwordForm.confirmPassword"
						:placeholder="i18n.t('settings.confirmPasswordPlaceholder')" />
				</view>
				<view class="modal-box-footer">
					<view class="modal-box-btn" @click="showPasswordModal = false">
						<text class="modal-box-btn-text cancel-text">{{ t('common.cancel') }}</text>
					</view>
					<view class="modal-box-btn" @click="handleChangePassword">
						<text class="modal-box-btn-text confirm-text">{{ t('common.confirm') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 语言切换弹窗 -->
		<language-modal
			:visible="showLanguageModal"
			@close="showLanguageModal = false"
		></language-modal>
	</view>
</template>

<script>
import store from '@/store/index.js'
import { showToast, fixMinioUrl } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import { getUserInfo, updateUserInfo, uploadAvatar } from '@/api/services/auth.js'
import { unregisterPush } from '@/utils/push.js'
// #ifdef APP-PLUS
import { chooseSystemMedia } from '@/uni_modules/uni-chooseSystemImage'
// #endif
import { resetPassword } from '@/api/services/password.js'
import { toggleNotification, getNotificationSettings } from '@/api/services/notification.js'
import LanguageModal from '@/components/language-modal.vue'

export default {
	components: {
		LanguageModal
	},
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			notificationEnabled: true,
			showLanguageModal: false,
			userInfo: null,
			userBirthday: '',
			showNicknameModal: false,
			nicknameInput: '',
			showBirthdayModal: false,
			datePickerValue: [0, 0, 0],
			showPasswordModal: false,
			passwordForm: {
				oldPassword: '',
				newPassword: '',
				confirmPassword: ''
			}
		}
	},
	computed: {
		userNickname() {
			return this.userInfo?.nickname || i18n.t('mine.title')
		},
		years() {
			const now = new Date().getFullYear()
			const list = []
			for (let y = now; y >= 1920; y--) list.push(y)
			return list
		},
		months() {
			const list = []
			for (let m = 1; m <= 12; m++) list.push(m)
			return list
		},
		days() {
			const yi = this.datePickerValue[0] || 0
			const mi = this.datePickerValue[1] || 0
			const year = this.years[yi] || new Date().getFullYear()
			const month = this.months[mi] || 1
			const maxDay = new Date(year, month, 0).getDate()
			const list = []
			for (let d = 1; d <= maxDay; d++) list.push(d)
			return list
		}
	},
		onLoad() {
			this.initPage()
			this.userInfo = store.getUserInfo()
			this.userBirthday = this.userInfo?.birthday || ''
			this.loadNotificationSettings()
			this.loadLatestUserInfo()
		},
	created() {
		uni.$on('languageChanged', this.onLanguageChanged)
	},

	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
	},

	methods: {
		onLanguageChanged() {
			this.langVersion++
		},
		t(key, params) {
			void this.langVersion
			return i18n.t(key, params)
		},
		fixMinioUrl,
		async loadLatestUserInfo() {
			try {
				const res = await getUserInfo()
				if (res.code === 0 && res.data) {
					const data = res.data
					if (data.avatar_url) data.avatar_url = fixMinioUrl(data.avatar_url)
					this.userInfo = data
					store.setUserInfo(data)
					this.userBirthday = data.birthday || ''
				}
			} catch (e) {
				console.error('loadLatestUserInfo error:', e)
			}
		},
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20
			const navBarHeight = 44
			const tabBarHeight = 50
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - tabBarHeight - safeAreaBottom - this.statusBarHeight
		},

		goBack() {
			uni.navigateBack()
		},
			handleAvatarClick() {
				// #ifdef APP-PLUS
				// 用 DCloud 官方插件 chooseSystemMedia(Android 系统 Photo Picker)
				// 这个方案符合 Google Play 新政策,不需要 READ_MEDIA_IMAGES 权限
				chooseSystemMedia({
					count: 1,
					mediaType: ['image'],
					pageOrientation: 'portrait',
					success: async (e) => {
						const filePaths = e.filePaths || []
						if (!filePaths.length) return
						const filePath = filePaths[0]
						showToast(i18n.t("common.loading"))
						try {
							const uploadRes = await uploadAvatar(filePath)
							if (uploadRes.code === 0) {
								await this.loadLatestUserInfo()
								showToast(i18n.t("common.success"))
							} else {
								showToast(uploadRes.message || i18n.t("common.fail"))
							}
						} catch (err) {
							console.error("handleAvatarClick error:", err)
							showToast(i18n.t("common.fail"))
						}
					},
					fail: (e) => {
						// 2101001 = 用户取消,正常行为不报错
						if (e && e.errCode === 2101001) {
							console.log('[chooseSystemMedia] user cancelled')
							return
						}
						console.error("chooseSystemMedia fail:", e)
						// 兜底:插件失败时回退到 uni.chooseImage
						this._fallbackChooseImage()
					}
				})
				// #endif
				// #ifndef APP-PLUS
				// H5/小程序用 uni.chooseImage
				uni.chooseImage({
					count: 1,
					sizeType: ["compressed"],
					sourceType: ["album", "camera"],
					success: async (res) => {
						if (!res.tempFilePaths || !res.tempFilePaths.length) return
						const filePath = res.tempFilePaths[0]
						showToast(i18n.t("common.loading"))
						try {
							const uploadRes = await uploadAvatar(filePath)
							if (uploadRes.code === 0) {
								await this.loadLatestUserInfo()
								showToast(i18n.t("common.success"))
							} else {
								showToast(uploadRes.message || i18n.t("common.fail"))
							}
						} catch (e) {
							console.error("handleAvatarClick error:", e)
							showToast(i18n.t("common.fail"))
						}
					},
					fail: (e) => console.error("chooseImage fail:", e)
				})
				// #endif
			},

			// 插件失败时的兜底(用 uni.chooseImage)
			_fallbackChooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ["compressed"],
					sourceType: ["album", "camera"],
					success: async (res) => {
						if (!res.tempFilePaths || !res.tempFilePaths.length) return
						const filePath = res.tempFilePaths[0]
						showToast(i18n.t("common.loading"))
						try {
							const uploadRes = await uploadAvatar(filePath)
							if (uploadRes.code === 0) {
								await this.loadLatestUserInfo()
								showToast(i18n.t("common.success"))
							} else {
								showToast(uploadRes.message || i18n.t("common.fail"))
							}
						} catch (e) {
							console.error("handleAvatarClick error:", e)
							showToast(i18n.t("common.fail"))
						}
					},
					fail: (e) => console.error("chooseImage fallback fail:", e)
				})
			},

		async loadNotificationSettings() {
			try {
				const res = await getNotificationSettings()
				if (res.code === 0 && res.data) {
					this.notificationEnabled = res.data.enabled
				}
			} catch (e) {
				console.error('loadNotificationSettings error:', e)
			}
		},

		handleSettingClick(type) {
			if (type === 'cache') {
				uni.showModal({
					title: this.i18n.t('common.confirm'),
					content: this.i18n.t('settings.cacheClearConfirm'),
					confirmText: this.i18n.t('common.confirm'),
					cancelText: this.i18n.t('common.cancel'),
					success: (res) => {
						if (res.confirm) {
							showToast(this.i18n.t('settings.cacheClear'))
						}
					}
				})
			} else if (type === 'about') {
				uni.navigateTo({ url: '/pages/agreement/index?type=about' })
			} else if (type === 'privacy') {
				uni.navigateTo({ url: '/pages/agreement/index?type=privacy' })
			} else if (type === 'agreement') {
				uni.navigateTo({ url: '/pages/agreement/index?type=terms' })
			} else if (type === 'phone') {
				showToast(this.i18n.t('settings.phone'))
			} else if (type === 'language') {
				this.showLanguageModal = true
			}
		},

		// 昵称
		openNicknameModal() {
			this.nicknameInput = this.userInfo?.nickname || ''
			this.showNicknameModal = true
		},
		async confirmNickname() {
			const nickname = this.nicknameInput.trim()
			if (!nickname) return
			try {
				const res = await updateUserInfo({ nickname })
				if (res.code === 0) {
					if (this.userInfo) {
						this.userInfo.nickname = nickname
						store.setUserInfo(this.userInfo)
					}
					this.showNicknameModal = false
					showToast(this.i18n.t('common.success'))
				} else {
					showToast(res.message || this.i18n.t('common.fail'))
				}
			} catch (e) {
				console.error('updateNickname error:', e)
				showToast(this.i18n.t('common.fail'))
			}
		},

		// 生日
		openBirthdayModal() {
			if (this.userBirthday) {
				const parts = this.userBirthday.split('-')
				const y = parseInt(parts[0])
				const m = parseInt(parts[1])
				const d = parseInt(parts[2])
				const yi = this.years.indexOf(y)
				this.datePickerValue = [
					yi >= 0 ? yi : 0,
					m - 1,
					d - 1
				]
			} else {
				const now = new Date()
				const yi = this.years.indexOf(now.getFullYear())
				this.datePickerValue = [yi >= 0 ? yi : 0, now.getMonth(), now.getDate() - 1]
			}
			this.showBirthdayModal = true
		},
		onDatePickerChange(e) {
			this.datePickerValue = e.detail.value
		},
		async confirmBirthday() {
			const yi = this.datePickerValue[0] || 0
			const mi = this.datePickerValue[1] || 0
			const di = this.datePickerValue[2] || 0
			const year = this.years[yi]
			const month = this.months[mi]
			const day = this.days[di]
			if (!year || !month || !day) return
			const birthday = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
			try {
				const res = await updateUserInfo({ birthday })
				if (res.code === 0) {
					this.userBirthday = birthday
					if (this.userInfo) {
						this.userInfo.birthday = birthday
						store.setUserInfo(this.userInfo)
					}
					this.showBirthdayModal = false
					showToast(this.i18n.t('settings.birthdaySaveSuccess'))
				} else {
					showToast(res.message || this.i18n.t('common.fail'))
				}
			} catch (e) {
				console.error('updateBirthday error:', e)
				this.userBirthday = birthday
				if (this.userInfo) {
					this.userInfo.birthday = birthday
					store.setUserInfo(this.userInfo)
				}
				this.showBirthdayModal = false
				showToast(this.i18n.t('settings.birthdaySaveSuccess'))
			}
		},

		// 密码
		openPasswordModal() {
			this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
			this.showPasswordModal = true
		},
		async handleChangePassword() {
			const { oldPassword, newPassword, confirmPassword } = this.passwordForm
			if (!oldPassword || !newPassword || !confirmPassword) {
				return showToast(this.i18n.t('common.fail'))
			}
			if (newPassword.length < 6) {
				return showToast(this.i18n.t('settings.passwordTooShort'))
			}
			if (newPassword !== confirmPassword) {
				return showToast(this.i18n.t('settings.passwordMismatch'))
			}
			try {
				const res = await resetPassword({
					old_password: oldPassword,
					new_password: newPassword
				})
				console.log('[change-password] response:', JSON.stringify(res))
				if (res.code === 0) {
					this.showPasswordModal = false
					showToast(this.i18n.t('settings.passwordChanged'))
				} else {
					// 优先用后端返回的具体错误消息
					const msg = res.message || res.detail?.message || res.detail || this.i18n.t('common.fail')
					showToast(typeof msg === 'string' ? msg : this.i18n.t('common.fail'))
				}
			} catch (e) {
				console.error('[change-password] error:', e)
				// modal-mask z-index=1000 会盖住 toast，所以失败时先关 modal，再提示
				this.showPasswordModal = false
				const rawMsg = e?.message || e?.detail?.message || e?.detail
				const msg = (typeof rawMsg === 'string' && rawMsg) ? rawMsg : this.i18n.t('common.fail')
				setTimeout(() => showToast(msg), 100)
			}
		},

		async handleNotificationChange(e) {
			const enabled = e.detail.value
			try {
				const res = await toggleNotification(enabled)
				if (res.code === 0) {
					this.notificationEnabled = enabled
					showToast(enabled ? this.i18n.t('settings.notificationEnabled') : this.i18n.t('settings.notificationDisabled'))
				} else {
					this.notificationEnabled = !enabled
				}
			} catch (e) {
				console.error('handleNotificationChange error:', e)
				this.notificationEnabled = !enabled
			}
		},

		async handleLogout() {
			uni.showModal({
				title: this.i18n.t('common.confirm'),
				content: this.i18n.t('mine.logoutConfirm'),
				confirmText: this.i18n.t('common.confirm'),
				cancelText: this.i18n.t('common.cancel'),
				success: async (res) => {
					if (res.confirm) {
						// 先清后端的 push token 关联(避免注销后还收到推送)
						try { await unregisterPush() } catch (e) {}
						store.logout()
						uni.reLaunch({ url: '/pages/login/index' })
					}
				}
			})
		}
	}
}
</script>

<style scoped>
.settings-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #FFFFFF;
}

.nav-bar {
	height: 44px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	border-bottom: 1px solid #F3F3F3;
}

.nav-back {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-back:active {
	opacity: 0.6;
}

.back-icon {
	width: 24px;
	height: 24px;
}

.nav-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}

.nav-right {
	width: 32px;
}

.content-scroll {
	flex: 1;
}

.settings-section {
	padding-top: 10px;
}

.section-title {
	padding: 10px 16px;
}

.title-text {
	font-size: 12px;
	color: #00000099;
}

.settings-card {
	background-color: #FFFFFF;
	margin: 0 16px;
	border-radius: 12px;
	overflow: hidden;
}

.setting-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 14px 16px;
	border-bottom: 1px solid #F5F5F5;
}

.setting-item:last-child {
	border-bottom: none;
}

.setting-item:active {
	background-color: #FAFAFA;
}

.setting-label {
	font-size: 15px;
	color: #000000CC;
}

.setting-right {
	display: flex;
	align-items: center;
	gap: 8px;
}

.setting-value {
	font-size: 14px;
	color: #00000066;
}

.arrow-icon {
	width: 16px;
	height: 16px;
	opacity: 0.4;
}
.setting-avatar-preview {
	width: 32px;
	height: 32px;
	border-radius: 50%;
}

/* 退出登录 */
.logout-section {
	padding: 30px 16px;
}

.logout-btn {
	height: 48px;
	background-color: #FFFFFF;
	border-radius: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.logout-btn:active {
	opacity: 0.8;
}

.logout-text {
	font-size: 15px;
	color: #DA3300;
	font-weight: 500;
}

.bottom-placeholder {
	height: 20px;
}

/* 通用弹窗 */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.45);
	display: flex;
	align-items: center;
	justify-content: center;
	/* z-index 必须 < 999（uni-toast 默认 z-index=999），否则 modal-mask 会盖住所有 toast */
	z-index: 99;
}

.modal-box {
	width: 300px;
	background-color: #FFFFFF;
	border-radius: 16px;
	overflow: hidden;
}

.modal-box-title {
	display: block;
	text-align: center;
	font-size: 17px;
	font-weight: 600;
	color: #000000CC;
	padding: 22px 20px 14px;
}

.modal-box-body {
	padding: 4px 20px 16px;
}

.modal-box-footer {
	display: flex;
	border-top: 1px solid #F0F0F0;
}

.modal-box-btn {
	flex: 1;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-box-btn:first-child {
	border-right: 1px solid #F0F0F0;
}

.modal-box-btn:active {
	background-color: #F5F5F5;
}

.modal-box-btn-text {
	font-size: 16px;
}

.cancel-text {
	color: #00000066;
}

.confirm-text {
	color: #F2B131;
	font-weight: 600;
}

/* 输入框 */
.modal-input {
	width: 100%;
	height: 44px;
	background-color: #F7F7F7;
	border-radius: 10px;
	padding: 0 14px;
	font-size: 15px;
	margin-bottom: 10px;
	box-sizing: border-box;
	border: 1px solid transparent;
	transition: border-color 0.2s;
}

.modal-input:last-child {
	margin-bottom: 0;
}

.modal-input:focus {
	border-color: #F2B131;
	background-color: #FFFFFF;
}

/* 日期选择器 */
.birthday-modal {
	width: 320px;
}

.date-picker-wrap {
	background-color: #F7F7F7;
	border-radius: 12px;
	padding: 8px 0;
}

.date-picker {
	height: 180px;
	width: 100%;
}

.picker-item {
	height: 36px;
	line-height: 36px;
	text-align: center;
	font-size: 16px;
	color: #000000CC;
}

.picker-label-row {
	display: flex;
	justify-content: space-around;
	padding: 6px 30px 0;
}

.picker-label {
	font-size: 12px;
	color: #00000066;
}
</style>
