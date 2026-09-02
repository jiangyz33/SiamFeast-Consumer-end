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
					<!-- 邮箱（可选，可编辑） -->
					<view class="setting-item" @click="openEmailModal">
						<text class="setting-label">{{ t('settings.email') }}</text>
						<view class="setting-right">
							<text class="setting-value">{{ userEmail || i18n.t('settings.notSet') }}</text>
							<image class="arrow-icon" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
						</view>
					</view>
					<!-- 生日（自定义日期选择器，跟随 App 语言）-->
					<view class="setting-item" @click="showBirthdayPicker = true">
						<text class="setting-label">{{ t('settings.birthday') }}</text>
						<view class="setting-right">
							<text class="setting-value">{{ userBirthday ? userBirthday.slice(-5) : i18n.t('settings.notSet') }}</text>
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
				<!-- 删除账号（Google Play 合规：应用内账号删除入口，红色警示 + 两步确认） -->
				<view class="delete-account-btn" @click="handleDeleteAccount">
					<text class="delete-account-text">{{ t('settings.deleteAccount') }}</text>
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

		<!-- 邮箱编辑弹窗 -->
		<view class="modal-mask" v-if="showEmailModal" @click.self="showEmailModal = false">
			<view class="modal-box">
				<text class="modal-box-title">{{ t('settings.editEmail') }}</text>
				<view class="modal-box-body">
					<input class="modal-input" v-model="emailInput"
						:placeholder="i18n.t('settings.emailPlaceholder')"
						type="text"
						maxlength="100" />
					<text v-if="emailError" class="modal-field-error">{{ emailError }}</text>
				</view>
				<view class="modal-box-footer">
					<view class="modal-box-btn" @click="showEmailModal = false">
						<text class="modal-box-btn-text cancel-text">{{ t('common.cancel') }}</text>
					</view>
					<view class="modal-box-btn" @click="clearEmail" v-if="userEmail">
						<text class="modal-box-btn-text cancel-text">{{ t('common.clear') }}</text>
					</view>
					<view class="modal-box-btn" @click="confirmEmail">
						<text class="modal-box-btn-text confirm-text">{{ t('common.confirm') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 修改密码弹窗 -->
		<view class="modal-mask" v-if="showPasswordModal" @click.self="showPasswordModal = false">
			<view class="modal-box">
				<text class="modal-box-title">{{ hasPassword ? t('settings.changePassword') : t('settings.setPassword') }}</text>
				<view class="modal-box-body">
					<input class="modal-input" type="password" v-model="passwordForm.oldPassword" v-if="hasPassword"
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

		<!-- 测试生日弹窗 -->
		<birthday-modal
			:visible="showTestBirthdayModal"
			:rewardType="testBirthdayType"
			:rewardAmount="testBirthdayAmount"
			@close="closeTestBirthdayModal"
			@claimed="handleTestBirthdayClaimed"
		></birthday-modal>

		<!-- Test upgrade animation -->
		<upgrade-animation-dynamic
			:visible="showTestUpgradeModal"
			:tier="testUpgradeTier"
			@close="showTestUpgradeModal = false"
		></upgrade-animation-dynamic>

		<!-- 自定义日期选择弹窗（跟随 App 语言） -->
		<date-picker-modal
			:hide-year="true"
			:visible="showBirthdayPicker"
			:value="userBirthday"
			:min-date="minBirthdayDate"
			:max-date="maxBirthdayDate"
			@change="onBirthdayPickerChange"
			@close="showBirthdayPicker = false"
		/>
	</view>
</template>

<script>
import store from '@/store/index.js'
import { showToast, fixMinioUrl } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import { getUserInfo, updateUserInfo, uploadAvatar, deleteAccount, checkPhone } from '@/api/services/auth.js'
import { getMembershipTiers } from '@/api/services/member.js'
import { unregisterPush } from '@/utils/push.js'
import BirthdayModal from '@/components/birthday-modal.vue'
// #ifdef APP-PLUS
import { chooseSystemMedia } from '@/uni_modules/uni-chooseSystemImage'
// #endif
import { resetPassword } from '@/api/services/password.js'
import { toggleNotification, getNotificationSettings } from '@/api/services/notification.js'
import LanguageModal from '@/components/language-modal.vue'
import DatePickerModal from '@/components/date-picker-modal.vue'
import UpgradeAnimationDynamic from '@/components/upgrade-animation-dynamic.vue'

export default {
	components: {
		LanguageModal,
		BirthdayModal,
		DatePickerModal,
		UpgradeAnimationDynamic
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
			// 邮箱编辑
			showEmailModal: false,
			emailInput: '',
			emailError: '',
			showBirthdayModal: false,
			showBirthdayPicker: false,
			birthdayPickerValue: '',
			showPasswordModal: false,
			showTestEntry: false,  // 测试入口(上线前改 false)
			showTestUpgradeModal: false,  // 测试升级动画
			testUpgradeTierIndex: 1,     // 测试用档位下标（在 membershipTiers 中的位置）
			membershipTiers: [],          // 从后端拉的档位配置（测试入口也用真实数据）
			showTestBirthdayModal: false,
			testBirthdayType: 'COIN',
			testBirthdayAmount: 100,
			// 是否已设置密码（/users/me 不返回该字段，进页面时调 check-phone 补查）
			hasPwd: false,
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
		// 邮箱：后端返回字段可能是 email 或 email_address
		userEmail() {
			return (this.userInfo && (this.userInfo.email || this.userInfo.email_address)) || ''
		},
		// 是否已设置密码（决定修改密码弹窗显示"旧密码"输入框）
		hasPassword() {
			// /users/me 不返回 has_password，用 check-phone 接口补查（存 this.hasPwd）
			return !!(this.hasPwd || (this.userInfo && this.userInfo.has_password))
		},
		// 测试升级动画用的档位（直接从后端配置按 index 取，跟 member 页真实动画完全一致）
		testUpgradeTier() {
			if (!this.membershipTiers || this.membershipTiers.length === 0) return null
			const idx = Math.min(this.testUpgradeTierIndex, this.membershipTiers.length - 1)
			return this.membershipTiers[idx] || null
		},
		// 测试按钮上的档位名（按当前语言显示）
		testTierLabel() {
			const t = this.testUpgradeTier
			if (!t) return '加载中...'
			const lang = i18n.getLanguage()
			return t['name_' + lang] || t.name || t.code || ''
		},
		minBirthdayDate() {
			return '1920-01-01'
		},
		maxBirthdayDate() {
			const now = new Date()
			const y = now.getFullYear()
			const m = String(now.getMonth() + 1).padStart(2, '0')
			const d = String(now.getDate()).padStart(2, '0')
			return `${y}-${m}-${d}`
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
			this.loadMembershipTiers()   // 测试升级动画用（拉真实档位配置）
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
					// /users/me 不含 has_password，用 check-phone 补查（修改密码弹窗的旧密码框依赖它）
					if (data.phone) {
						checkPhone(data.phone).then(r => {
							if (r && r.code === 0 && r.data) this.hasPwd = !!r.data.has_password
						}).catch(() => {})
					}
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
				// 跳转到更改手机号页面
				uni.navigateTo({ url: '/pages/settings/change-phone' })
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

		// ============ 邮箱编辑 ============
		openEmailModal() {
			this.emailInput = this.userEmail
			this.emailError = ''
			this.showEmailModal = true
		},
		validateEmailInput() {
			const v = (this.emailInput || '').trim()
			if (!v) {
				this.emailError = ''
				return true
			}
			const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!re.test(v)) {
				this.emailError = this.i18n.t('login.emailInvalid')
				return false
			}
			this.emailError = ''
			return true
		},
		async confirmEmail() {
			const email = (this.emailInput || '').trim()
			// 格式校验（非空时）
			if (email && !this.validateEmailInput()) return
			try {
				// 空字符串表示"清除邮箱" → 传空串让后端清空（如果后端不支持，改回 undefined 不更新）
				const payload = email ? { email } : { email: '' }
				const res = await updateUserInfo(payload)
				if (res.code === 0) {
					if (this.userInfo) {
						this.userInfo.email = email
						store.setUserInfo(this.userInfo)
					}
					this.showEmailModal = false
					showToast(this.i18n.t('common.success'))
				} else {
					showToast(res.message || this.i18n.t('common.fail'))
				}
			} catch (e) {
				console.error('updateEmail error:', e)
				const code = e && (e.code || e.bizCode)
				// 邮箱已被占用 → 标红输入框提示
				if (code === 'ErrEmailAlreadyBound' || /already.*bound|already.*used/i.test(e.message || '')) {
					this.emailError = this.i18n.t('login.emailAlreadyBound')
					return
				}
				// 其他错误：request.js 已统一 toast，这里不重复弹
			}
		},
		async clearEmail() {
			this.emailInput = ''
			this.emailError = ''
			// 直接调用 confirmEmail，传空字符串清除
			await this.confirmEmail()
		},

		// 生日 - 自定义日期选择器（直接 emit 字符串）
		async onBirthdayPickerChange(date) {
			if (!date) return
			try {
				const res = await updateUserInfo({ birthday: date })
				if (res.code === 0) {
					this.userBirthday = date
					if (this.userInfo) {
						this.userInfo.birthday = date
						store.setUserInfo(this.userInfo)
					}
					showToast(this.i18n.t('settings.birthdaySaveSuccess'))
					// 改完生日后立即触发检查（用户改成"今天"时可立即弹窗领奖）
					// 强制绕过 30 秒节流：重置 lastBirthdayCheckAt
					const app = getApp()
					if (app && app.lastBirthdayCheckAt !== undefined) app.lastBirthdayCheckAt = 0
					if (app && app.checkBirthday) app.checkBirthday()
				} else {
					showToast(res.message || this.i18n.t('common.fail'))
				}
			} catch (e) {
				console.error('updateBirthday error:', e)
				this.userBirthday = date
				if (this.userInfo) {
					this.userInfo.birthday = date
					store.setUserInfo(this.userInfo)
				}
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
			// 已有密码必须填旧密码；无密码时跳过旧密码校验
			if (this.hasPassword && !oldPassword) {
				return showToast(this.i18n.t('settings.oldPasswordRequired'))
			}
			if (!newPassword || !confirmPassword) {
				return showToast(this.i18n.t('common.fail'))
			}
			if (newPassword.length < 6) {
				return showToast(this.i18n.t('settings.passwordTooShort'))
			}
			if (newPassword !== confirmPassword) {
				return showToast(this.i18n.t('settings.passwordMismatch'))
			}
			try {
				const payload = { new_password: newPassword }
				if (this.hasPassword) {
					payload.old_password = oldPassword
				}
				const res = await resetPassword(payload)
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

		// ============ 测试生日弹窗 ============
		testBirthdayModal() {
			this.showTestBirthdayModal = true
		},

		// 拉档位配置（测试入口用，跟 member 页同一接口）
		async loadMembershipTiers() {
			try {
				const res = await getMembershipTiers()
				if (res && res.code === 0 && res.data) {
					this.membershipTiers = (res.data.tiers || []).filter(t => t.is_active !== false)
					// 默认指向第 2 档（REGULAR 后的第一个，通常是 GOLD）
					if (this.membershipTiers.length > 1) this.testUpgradeTierIndex = 1
				}
			} catch (e) {
				console.warn('[settings] loadMembershipTiers failed:', e)
			}
		},

		// 测试升级动画：弹窗展示当前选中档位的动画
		testUpgradeAnimation() {
			if (!this.testUpgradeTier) {
				uni.showToast({ title: '档位配置加载中，请稍候', icon: 'none' })
				return
			}
			this.showTestUpgradeModal = true
		},

		// 循环切换测试档位（自动支持任意档位数：3 档、5 档、7 档都行）
		switchTestTier() {
			if (this.membershipTiers.length === 0) return
			// 跳过 REGULAR（sort=0），从第二档开始循环；如果没有 REGULAR 就从头循环
			const startIndex = this.membershipTiers[0] && this.membershipTiers[0].code === 'REGULAR' ? 1 : 0
			const candidates = this.membershipTiers.slice(startIndex)
			if (candidates.length === 0) return
			const currentIdxInCandidates = candidates.findIndex(t => t === this.testUpgradeTier)
			const nextIdx = (currentIdxInCandidates + 1) % candidates.length
			// testUpgradeTierIndex 是相对完整 membershipTiers 的下标
			this.testUpgradeTierIndex = startIndex + nextIdx
			const nextTier = candidates[nextIdx]
			const lang = i18n.getLanguage()
			const tierName = nextTier ? (nextTier['name_' + lang] || nextTier.name || nextTier.code) : ''
			uni.showToast({
				title: '已切换到 ' + tierName,
				icon: 'none',
				duration: 1000
			})
		},
		closeTestBirthdayModal() {
			this.showTestBirthdayModal = false
		},
		// 测试用:模拟领取成功
		handleTestBirthdayClaimed(data) {
			console.log('[test-birthday] claimed:', data)
			// 因为是测试,后端没真发,这里手动模拟一个成功响应
			// 实际场景这个 data 是后端返回的
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
		},

		/**
		 * 删除账号（Google Play 合规）：两步确认防误触
		 * 弹窗1 说明后果 → 弹窗2 最终确认 → 调接口 → 清本地 → 跳登录页
		 */
		handleDeleteAccount() {
			uni.showModal({
				title: this.i18n.t('settings.deleteAccount'),
				content: this.i18n.t('settings.deleteAccountWarning'),
				confirmText: this.i18n.t('settings.deleteAccountContinue'),
				cancelText: this.i18n.t('common.cancel'),
				confirmColor: '#D9534F',
				success: (res) => {
					if (!res.confirm) return
					// 第二步：最终确认
					uni.showModal({
						title: this.i18n.t('settings.deleteAccountFinalTitle'),
						content: this.i18n.t('settings.deleteAccountFinalConfirm'),
						confirmText: this.i18n.t('settings.deleteAccountConfirmBtn'),
						cancelText: this.i18n.t('common.cancel'),
						confirmColor: '#D9534F',
						success: (res2) => {
							if (res2.confirm) this.doDeleteAccount()
						}
					})
				}
			})
		},

		async doDeleteAccount() {
			this._deleting = true
			uni.showLoading({ title: this.i18n.t('common.loading'), mask: true })
			try {
				const res = await deleteAccount()
				uni.hideLoading()
				if (res && res.code === 0) {
					uni.showToast({ title: this.i18n.t('settings.deleteAccountDone'), icon: 'none' })
					// 清推送关联（后端删账号时也会清设备，双保险）
					try { await unregisterPush() } catch (e) {}
					// 清本地登录态（store.logout 同时发 logoutSuccess 停轮询）
					store.logout()
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/login/index' })
					}, 800)
				}
			} catch (e) {
				uni.hideLoading()
				const code = e && (e.code || e.bizCode)
				if (code === 'ACCOUNT_DELETE_ACTIVE_ORDERS') {
					// 有未完成订单：提示并可跳订单列表处理
					uni.showModal({
						title: this.i18n.t('settings.deleteAccountBlockedTitle'),
						content: this.i18n.t('settings.deleteAccountBlockedOrders'),
						confirmText: this.i18n.t('settings.goOrders'),
						cancelText: this.i18n.t('common.cancel'),
						success: (r) => {
							if (r.confirm) uni.navigateTo({ url: '/pages/order/index' })
						}
					})
				} else {
					const msg = (e && e.message) || this.i18n.t('settings.deleteAccountFailed')
					uni.showToast({ title: msg, icon: 'none' })
				}
			} finally {
				this._deleting = false
			}
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
	border-radius:  24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 删除账号（红色警示描边，弱于退出但足够醒目） */
.delete-account-btn {
	height: 44px;
	margin-top: 12px;
	background-color: transparent;
	border: 1px solid #F0C8C8;
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.delete-account-btn:active {
	opacity: 0.7;
}

.delete-account-text {
	font-size: 14px;
	color: #D9534F;
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

/* modal 内字段错误提示 */
.modal-field-error {
	display: block;
	font-size: 12px;
	color: #DA3300;
	margin-top: -4px;
	margin-bottom: 8px;
	padding-left: 4px;
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

/* 强制每列等宽 */
.date-picker /deep/ uni-picker-view-column {
	flex: 1;
}

.picker-item {
	height: 36px;
	line-height: 36px;
	text-align: center;
	font-size: 16px;
	color: #000000CC;
	display: flex;
	align-items: center;
	justify-content: center;
}

.picker-label-row {
	display: flex;
	flex-direction: row;
	padding: 6px 0 0;
}

.picker-label {
	flex: 1;
	text-align: center;
	font-size: 13px;
	color: #999;
}
</style>
