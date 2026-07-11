<template>
	<view class="address-page">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit"></image>
			</view>
			<text class="nav-title">{{ t('address.title') }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 内容区域 -->
		<scroll-view class="content-scroll" scroll-y :style="{ height: contentHeight + 'px' }">
			<!-- 地址列表 -->
			<view class="address-list">
				<view
					class="address-item"
					v-for="(item, index) in addressList"
					:key="item.id"
					:class="{ 'address-item-default': item.isDefault }"
					@click="handleSelectAddress(item)"
				>
					<view class="address-content">
						<view class="address-header">
							<text class="address-name">{{ item.name }}</text>
							<text class="address-phone">{{ item.phone }}</text>
							<view class="default-tag" v-if="item.isDefault">
								<text class="default-tag-text">{{ t('address.default') }}</text>
							</view>
						</view>
						<text class="address-detail">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
						<text class="address-remark" v-if="item.remark">{{ t('address.remark') }}: {{ item.remark }}</text>
					</view>
					<view class="address-actions">
						<view class="action-btn" @click.stop="handleSetDefault(item, index)">
							<image class="action-icon" :src="item.isDefault ? '/static/icons/check.svg' : '/static/icons/circle.svg'" mode="aspectFit"></image>
							<text class="action-text">{{ t('address.setDefault') }}</text>
						</view>
						<view class="action-btn" @click.stop="handleEditAddress(item)">
							<image class="action-icon" src="/static/icons/edit.svg" mode="aspectFit"></image>
							<text class="action-text">{{ t('address.edit') }}</text>
						</view>
						<view class="action-btn" @click.stop="handleDeleteAddress(item, index)">
							<image class="action-icon" src="/static/icons/delete.svg" mode="aspectFit"></image>
							<text class="action-text">{{ t('address.delete') }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="addressList.length === 0">
				<image class="empty-icon" src="/static/images/empty-address.svg" mode="aspectFit"></image>
				<text class="empty-title">{{ t('common.empty.address') }}</text>
				<text class="empty-desc">{{ t('common.empty.addressDesc') }}</text>
				<view class="empty-btn" @click="handleAddAddress">
					<text class="empty-btn-text">{{ t('address.add') }}</text>
				</view>
			</view>

			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>

		<!-- 底部添加按钮 -->
		<view class="bottom-bar">
			<view class="add-btn" @click="handleAddAddress">
				<image class="add-icon" src="/static/icons/add.svg" mode="aspectFit"></image>
				<text class="add-text">{{ t('address.add') }}</text>
			</view>
		</view>

		<!-- 新增/编辑地址弹窗 -->
		<view class="address-modal" v-if="showModal" @click="closeModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ isEdit ? i18n.t('address.edit') : i18n.t('address.add') }}</text>
					<view class="modal-close" @click="closeModal">
						<image class="close-icon" src="/static/icons/close.svg" mode="aspectFit"></image>
					</view>
				</view>

				<!-- 错误提示 -->
				<view class="error-banner" v-if="errorMsg">
					<text class="error-banner-text">{{ errorMsg }}</text>
				</view>

				<scroll-view class="modal-body" scroll-y>
					<view class="form-section">
						<!-- 定位按钮 -->
						<view class="location-btn" @click="handleGetLocation">
							<image class="location-icon" src="/static/icons/location.svg" mode="aspectFit"></image>
							<text class="location-text">{{ t('address.getLocation') }}</text>
							<text class="location-status" v-if="locating">{{ t('storeSelect.locating') }}</text>
						</view>

						<!-- 联系人 -->
						<view class="form-item">
							<text class="form-label">{{ t('address.contact') }}</text>
							<input class="form-input" v-model="formData.name" :placeholder="i18n.t('address.contactPlaceholder')" />
						</view>

						<!-- 手机号 -->
						<view class="form-item">
							<text class="form-label">{{ t('address.phone') }}</text>
							<input class="form-input" v-model="formData.phone" type="tel" :placeholder="i18n.t('login.phonePlaceholder')" />
						</view>

						<!-- 地区选择 -->
						<view class="form-item" @click="showRegionPicker = true">
							<text class="form-label">{{ t('address.region') }}</text>
							<view class="form-picker">
								<text class="picker-text" :class="{ 'placeholder': !formData.province }">
									{{ formData.province ? `${formData.province} ${formData.city} ${formData.district}` : i18n.t('address.selectRegion') }}
								</text>
								<image class="picker-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit"></image>
							</view>
						</view>

						<!-- 详细地址 -->
						<view class="form-item">
							<text class="form-label">{{ t('address.address') }}</text>
							<textarea class="form-textarea" v-model="formData.detail" :placeholder="i18n.t('address.addressPlaceholder')" />
						</view>

						<!-- 门牌号 -->
						<view class="form-item">
							<text class="form-label">{{ t('address.houseNumber') }}</text>
							<input class="form-input" v-model="formData.houseNumber" :placeholder="i18n.t('address.houseNumberPlaceholder')" />
						</view>

						<!-- 地址标签 -->
						<view class="form-item">
							<text class="form-label">{{ t('address.label') }}</text>
							<view class="label-list">
								<view
									class="label-item"
									v-for="(label, index) in addressLabels"
									:key="index"
									:class="{ 'label-active': formData.label === label.value }"
									@click="formData.label = label.value"
								>
									<text class="label-text">{{ label.name }}</text>
								</view>
							</view>
						</view>

						<!-- 备注 -->
						<view class="form-item">
							<text class="form-label">{{ t('address.remark') }}</text>
							<input class="form-input" v-model="formData.remark" :placeholder="i18n.t('address.remarkPlaceholder')" />
						</view>

						<!-- 设为默认 -->
						<view class="form-item default-setting">
							<text class="form-label">{{ t('address.setDefault') }}</text>
							<switch :checked="formData.isDefault" @change="formData.isDefault = $event.detail.value" color="#F2B131" />
						</view>
					</view>
				</scroll-view>

				<view class="modal-footer">
					<view class="save-btn" @click="handleSaveAddress">
						<text class="save-text">{{ t('address.save') }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 地区选择器 -->
		<view class="region-picker" v-if="showRegionPicker" @click="showRegionPicker = false">
			<view class="picker-content" @click.stop>
				<view class="picker-header">
					<text class="picker-title">{{ t('address.selectRegion') }}</text>
					<view class="picker-close" @click="showRegionPicker = false">
						<text class="close-text">✕</text>
					</view>
				</view>
				<scroll-view class="picker-body" scroll-y>
					<!-- 省份列表 -->
					<view v-if="pickerStep === 0">
						<view
							class="region-item"
							v-for="(province, index) in localizedRegions"
							:key="index"
							@click="selectProvince(province)"
						>
							<text class="region-text">{{ province.displayName }}</text>
						</view>
					</view>
					<!-- 城市列表 -->
					<view v-if="pickerStep === 1">
						<view
							class="region-item"
							v-for="(city, index) in selectedProvince.cities"
							:key="index"
							@click="selectCity(city)"
						>
							<text class="region-text">{{ city.displayName }}</text>
						</view>
					</view>
					<!-- 区县列表 -->
					<view v-if="pickerStep === 2">
						<view
							class="region-item"
							v-for="(district, index) in selectedCity.districts"
							:key="index"
							@click="selectDistrict(district)"
						>
							<text class="region-text">{{ district.displayName || district }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import { showToast } from '@/utils/index.js'
import i18n from '@/i18n/index.js'
import store from '@/store/index.js'
import {
	getAddressList,
	createAddress,
	updateAddress,
	deleteAddress,
	setDefaultAddress,
	getUserLocation
} from '@/api/services/address.js'

	// ข้อมูลพื้นที่ประเทศไทย
	const mockRegions = [
		{
			name: "กรุงเทพมหานคร",
			nameZh: "曼谷",
			nameEn: "Bangkok",
			cities: [
				{
					name: "กรุงเทพมหานคร",
					nameZh: "曼谷",
					nameEn: "Bangkok",
					districts: [
						{
							name: "วัฒนา",
							nameZh: "瓦塔纳",
							nameEn: "Watthana",
						},
						{
							name: "คลองเตย",
							nameZh: "空讪温",
							nameEn: "Khlong Toei",
						},
						{
							name: "สุขุมวิท",
							nameZh: "素坤威提",
							nameEn: "Sukhumvit",
						},
						{
							name: "สีลม",
							nameZh: "是隆",
							nameEn: "Silom",
						},
						{
							name: "สาทร",
							nameZh: "沙吞",
							nameEn: "Sathorn",
						},
						{
							name: "ทองหล่อ",
							nameZh: "通罗",
							nameEn: "Thong Lo",
						},
						{
							name: "เอกมัย",
							nameZh: "伊卡迈",
							nameEn: "Ekkamai",
						},
						{
							name: "พระโขนง",
							nameZh: "帕卡侬",
							nameEn: "Phra Khanong",
						},
						{
							name: "บางนา",
							nameZh: "拌讦",
							nameEn: "Bang Na",
						},
						{
							name: "ลาดพร้าว",
							nameZh: "达拍白",
							nameEn: "Lat Phrao",
						},
						{
							name: "ห้วยขวาง",
							nameZh: "汇权",
							nameEn: "Huai Khwang",
						},
						{
							name: "รัชดาภิเษก",
							nameZh: "拉恰达",
							nameEn: "Ratchadaphisek",
						},
						{
							name: "ดินแดง",
							nameZh: "丁丹",
							nameEn: "Din Daeng",
						},
						{
							name: "พญาไท",
							nameZh: "帕亚泰",
							nameEn: "Phaya Thai",
						},
						{
							name: "ปทุมวัน",
							nameZh: "巴吞宛",
							nameEn: "Pathum Wan",
						},
						{
							name: "บางรัก",
							nameZh: "挽拉",
							nameEn: "Bang Rak",
						},
						{
							name: "สัมพันธวงศ์",
							nameZh: "三攀他翁",
							nameEn: "Samphanthawong",
						},
						{
							name: "คลองสาน",
							nameZh: "空山",
							nameEn: "Khlong San",
						},
					],
				},
			],
		},
		{
			name: "ชลบุรี",
			nameZh: "春武里",
			nameEn: "Chonburi",
			cities: [
				{
					name: "พัทยา",
					nameZh: "芭提雅",
					nameEn: "Pattaya",
					districts: [
						{
							name: "เมืองพัทยา",
							nameZh: "芭提雅市区",
							nameEn: "Pattaya City",
						},
						{
							name: "นาเกลือ",
							nameZh: "那歌",
							nameEn: "Na Kluea",
						},
						{
							name: "หนองปรือ",
							nameZh: "农普如",
							nameEn: "Nong Prue",
						},
					],
				},
				{
					name: "ศรีราชา",
					nameZh: "是拉差",
					nameEn: "Sriracha",
					districts: [
						{
							name: "เมืองศรีราชา",
							nameZh: "是拉差市区",
							nameEn: "Sriracha City",
						},
						{
							name: "แหลมฉบัง",
							nameZh: "廉差邦",
							nameEn: "Laem Chabang",
						},
						{
							name: "บางละมุง",
							nameZh: "邦拉蒙",
							nameEn: "Bang Lamung",
						},
					],
				},
				{
					name: "ชลบุรี",
					nameZh: "春武里市",
					nameEn: "Chonburi City",
					districts: [
						{
							name: "เมืองชลบุรี",
							nameZh: "春武里市区",
							nameEn: "Chonburi City",
						},
						{
							name: "บ้านบึง",
							nameZh: "万本",
							nameEn: "Ban Bueng",
						},
						{
							name: "พนัสนิคม",
							nameZh: "帕那尼空",
							nameEn: "Phanat Nikhom",
						},
					],
				},
			],
		},
		{
			name: "เชียงใหม่",
			nameZh: "清迈",
			nameEn: "Chiang Mai",
			cities: [
				{
					name: "เชียงใหม่",
					nameZh: "清迈",
					nameEn: "Chiang Mai",
					districts: [
						{
							name: "เมืองเชียงใหม่",
							nameZh: "清迈市区",
							nameEn: "Chiang Mai City",
						},
						{
							name: "หางดง",
							nameZh: "航栋",
							nameEn: "Hang Dong",
						},
						{
							name: "สันทราย",
							nameZh: "三赛",
							nameEn: "San Sai",
						},
						{
							name: "สารภี",
							nameZh: "萨披",
							nameEn: "Saraphi",
						},
						{
							name: "ดอยสะเก็ด",
							nameZh: "得定",
							nameEn: "Doi Saket",
						},
						{
							name: "แม่ริม",
							nameZh: "梅林",
							nameEn: "Mae Rim",
						},
					],
				},
			],
		},
		{
			name: "ภูเก็ต",
			nameZh: "普吉",
			nameEn: "Phuket",
			cities: [
				{
					name: "ภูเก็ต",
					nameZh: "普吉",
					nameEn: "Phuket",
					districts: [
						{
							name: "เมืองภูเก็ต",
							nameZh: "普吉市区",
							nameEn: "Phuket City",
						},
						{
							name: "กะทู้",
							nameZh: "卡图",
							nameEn: "Kathu",
						},
						{
							name: "ถลาง",
							nameZh: "他兰",
							nameEn: "Thalang",
						},
						{
							name: "วิชิต",
							nameZh: "威奇提",
							nameEn: "Wichit",
						},
						{
							name: "ราไวย์",
							nameZh: "拉威艾",
							nameEn: "Rawai",
						},
						{
							name: "ป่าตอง",
							nameZh: "芭东海滩",
							nameEn: "Patong",
						},
					],
				},
			],
		},
		{
			name: "สมุทรปราการ",
			nameZh: "北榄",
			nameEn: "Samut Prakan",
			cities: [
				{
					name: "สมุทรปราการ",
					nameZh: "北榄",
					nameEn: "Samut Prakan",
					districts: [
						{
							name: "เมืองสมุทรปราการ",
							nameZh: "北榄市区",
							nameEn: "Samut Prakan City",
						},
						{
							name: "บางพลี",
							nameZh: "邦区",
							nameEn: "Bang Phli",
						},
						{
							name: "บางบ่อ",
							nameZh: "挽薄",
							nameEn: "Bang Bo",
						},
						{
							name: "พระประแดง",
							nameZh: "帕台",
							nameEn: "Phra Pradaeng",
						},
						{
							name: "พระสมุทร",
							nameZh: "帕赞府",
							nameEn: "Phra Samut",
						},
						{
							name: "บางเสาธง",
							nameZh: "万锦",
							nameEn: "Bang Sao Thong",
						},
					],
				},
			],
		},
		{
			name: "นนทบุรี",
			nameZh: "暖武里",
			nameEn: "Nonthaburi",
			cities: [
				{
					name: "นนทบุรี",
					nameZh: "暖武里",
					nameEn: "Nonthaburi",
					districts: [
						{
							name: "เมืองนนทบุรี",
							nameZh: "暖武里市区",
							nameEn: "Nonthaburi City",
						},
						{
							name: "ปากเกร็ด",
							nameZh: "帕克雷",
							nameEn: "Pak Kret",
						},
						{
							name: "บางบัวทอง",
							nameZh: "邦瑞",
							nameEn: "Bang Bua Thong",
						},
						{
							name: "บางใหญ่",
							nameZh: "万赞",
							nameEn: "Bang Yai",
						},
						{
							name: "ไทรน้อย",
							nameZh: "赛瑞奈",
							nameEn: "Sai Noi",
						},
					],
				},
			],
		},
		{
			name: "เชียงราย",
			nameZh: "清莱",
			nameEn: "Chiang Rai",
			cities: [
				{
					name: "เชียงราย",
					nameZh: "清莱",
					nameEn: "Chiang Rai",
					districts: [
						{
							name: "เมืองเชียงราย",
							nameZh: "清莱市区",
							nameEn: "Chiang Rai City",
						},
						{
							name: "แม่สาย",
							nameZh: "美塘",
							nameEn: "Mae Sai",
						},
						{
							name: "เชียงของ",
							nameZh: "景坎",
							nameEn: "Chiang Khong",
						},
						{
							name: "เวียงป่าเป้า",
							nameZh: "瑞莱",
							nameEn: "Wiang Pa Pao",
						},
						{
							name: "พาน",
							nameZh: "帕南",
							nameEn: "Phan",
						},
					],
				},
			],
		},
	]

export default {
	data() {
		return {
			langVersion: 0,
			i18n: i18n,
			statusBarHeight: 20,
			contentHeight: 500,
			selectMode: false,
			addressList: [],
			showModal: false,
				errorMsg: '',
			isEdit: false,
			editAddressId: null,
			locating: false,
			showRegionPicker: false,
			pickerStep: 0,
			regions: mockRegions,
			selectedProvince: {},
			selectedCity: {},
			formData: {
				name: '',
				phone: '',
				province: '',
				city: '',
				district: '',
				detail: '',
				houseNumber: '',
				label: '',
				remark: '',
				isDefault: false,
				latitude: null,
				longitude: null
			}
		}
	},
	computed: {
		localizedRegions() {
			return this.regions
		},
		addressLabels() {
			return [
				{ name: i18n.t('address.labelHome'), value: 'home' },
				{ name: i18n.t('address.labelCompany'), value: 'company' },
				{ name: i18n.t('address.labelSchool'), value: 'school' },
				{ name: i18n.t('address.labelOther'), value: 'other' }
			]
		}
	},
	onLoad(options) {
		if (options.select === 'true') {
			this.selectMode = true
		}
		this.initPage()
		this.localizeRegions()
		this.loadAddressList()
	},
	created() {
		uni.$on('languageChanged', this.onLanguageChanged)
		uni.$on('languageChanged', this.onLanguageChanged)
	},

	beforeDestroy() {
		uni.$off('languageChanged', this.onLanguageChanged)
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
		localizeRegions() {
			const lang = i18n.getLanguage()
			console.log('[address] localizeRegions, lang:', lang)
			const nameKey = lang === 'zh' ? 'nameZh' : (lang === 'en' ? 'nameEn' : 'name')
			this.regions = mockRegions.map(province => ({
				...province,
				displayName: province[nameKey] || province.name,
				cities: (province.cities || []).map(city => ({
					...city,
					displayName: city[nameKey] || city.name,
					districts: (city.districts || []).map(d => {
						if (typeof d === 'string') return { name: d, displayName: d }
						return { ...d, displayName: d[nameKey] || d.name }
					})
				}))
			}))
		},

		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 20

			const navBarHeight = 44
			const bottomBarHeight = 64
			const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0
			this.contentHeight = systemInfo.windowHeight - navBarHeight - bottomBarHeight - safeAreaBottom - this.statusBarHeight
		},

		async loadAddressList() {
			try {
				const res = await getAddressList()
				if (res.code === 0) {
					const data = res.data
				const rawList = Array.isArray(data) ? data : (data.items || [])
				this.addressList = rawList.map(addr => ({
					...addr,
					name: addr.contact_name || addr.name || '',
					phone: addr.contact_phone || addr.phone || '',
					detail: addr.address || addr.detail || '',
					isDefault: addr.is_default || addr.isDefault || false,
					houseNumber: addr.building || addr.houseNumber || ''
				}))
				}
			} catch (e) {
				console.error('loadAddressList error:', e)
			}
		},

		goBack() {
			uni.navigateBack()
		},

		handleSelectAddress(item) {
			if (this.selectMode) {
				const pages = getCurrentPages()
				const prevPage = pages[pages.length - 2]
				if (prevPage) {
					uni.$emit('addressSelected', item)
				}
				uni.navigateBack()
			}
		},

		async handleSetDefault(item, index) {
			try {
				const res = await setDefaultAddress(item.id)
				if (res.code === 0) {
					this.addressList.forEach(addr => addr.isDefault = false)
					this.addressList[index].isDefault = true
					showToast(this.i18n.t('address.setDefaultSuccess'))
				} else {
					showToast(this.i18n.t('address.setDefaultFailed'))
				}
			} catch (e) {
				console.error('handleSetDefault error:', e)
				showToast(this.i18n.t('address.setDefaultFailed'))
			}
		},

		handleEditAddress(item) {
			this.isEdit = true
			this.editAddressId = item.id
			this.formData = { ...item }
			this.showModal = true
				this.errorMsg = ''
		},

		handleDeleteAddress(item, index) {
			uni.showModal({
				title: this.i18n.t('common.confirm'),
				content: this.i18n.t('address.deleteConfirm'),
				confirmText: this.i18n.t('common.confirm'),
				cancelText: this.i18n.t('common.cancel'),
				success: async (res) => {
					if (res.confirm) {
						try {
							const result = await deleteAddress(item.id)
							if (result.code === 0) {
								this.addressList.splice(index, 1)
								showToast(this.i18n.t('address.deleteSuccess'))
							} else {
								showToast(this.i18n.t('address.deleteFailed'))
							}
						} catch (e) {
							console.error('handleDeleteAddress error:', e)
							showToast(this.i18n.t('address.deleteFailed'))
						}
					}
				}
			})
		},

		handleAddAddress() {
			this.isEdit = false
			this.editAddressId = null
			this.resetFormData()
			this.showModal = true
			this.errorMsg = ''
		},

		closeModal() {
			this.showModal = false
			this.errorMsg = ''
		},

		resetFormData() {
			this.formData = {
				name: '',
				phone: '',
				province: '',
				city: '',
				district: '',
				detail: '',
				houseNumber: '',
				label: '',
				remark: '',
				isDefault: false,
				latitude: null,
				longitude: null
			}
		},

		async handleGetLocation() {
			if (this.locating) return

			this.locating = true
			showToast(this.i18n.t('storeSelect.locating'))

			try {
				const res = await getUserLocation()
				if (res.code === 0 && res.data) {
					this.formData.province = res.data.province || ''
					this.formData.city = res.data.city || ''
					this.formData.district = res.data.district || ''
					this.formData.detail = res.data.address || ''
					this.formData.latitude = res.data.latitude
					this.formData.longitude = res.data.longitude
					showToast(this.i18n.t('address.locationSuccess'))
				}
			} catch (e) {
				console.error('handleGetLocation error:', e)
				showToast(this.i18n.t('address.locationFailed'))
			} finally {
				this.locating = false
			}
		},

		selectProvince(province) {
			this.selectedProvince = province
			this.formData.province = province.displayName || province.name
			this.pickerStep = 1
		},

		selectCity(city) {
			this.selectedCity = city
			this.formData.city = city.displayName || city.name
			this.pickerStep = 2
		},

		selectDistrict(district) {
			this.formData.district = district.displayName || district.name || district
			this.showRegionPicker = false
			this.pickerStep = 0
		},

		async handleSaveAddress() {
			if (!this.formData.name) {
				this.errorMsg = this.i18n.t('address.nameRequired')
				return
			}
			if (!this.formData.phone) {
				this.errorMsg = this.i18n.t('address.phoneRequired')
				return
			}
			const phone = this.formData.phone.replace(/[\s\-\*]/g, '')
			if (!/^(\+?\d{6,20}|\d{8,15})$/.test(phone)) {
				this.errorMsg = this.i18n.t('address.phoneInvalid')
				return
			}
			if (!this.formData.province || !this.formData.detail) {
				this.errorMsg = this.i18n.t('address.addressRequired')
				return
			}

			const addressData = { ...this.formData }

			try {
				let res
				if (this.isEdit) {
					res = await updateAddress(this.editAddressId, addressData)
				} else {
					if (addressData.isDefault) {
						// 新增默认地址时先取消已有默认
						this.addressList.forEach(addr => addr.isDefault = false)
					}
					if (this.addressList.length === 0) {
						addressData.isDefault = true
					}
					res = await createAddress(addressData)
				}

				if (res.code === 0) {
					this.errorMsg = ''
					this.showModal = false
					showToast(this.i18n.t('address.saveSuccess'))
					// 重新加载列表以获取服务端最新数据
					await this.loadAddressList()
				} else {
					this.errorMsg = res.message || this.i18n.t('address.saveFailed')
				}
			} catch (e) {
				console.error('handleSaveAddress error:', e)
				this.errorMsg = this.i18n.t('address.saveFailed')
			}
		}
	}
}
</script>

<style scoped>
.address-page {
	min-height: 100vh;
	background-color: #F3F3F3;
	display: flex;
	flex-direction: column;
}

.status-bar {
	width: 100%;
	background-color: #FFFFFF;
}

/* 导航栏 */
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

/* 内容区域 */
.content-scroll {
	flex: 1;
}

/* 地址列表 */
.address-list {
	padding: 10px 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.address-item {
	background-color: #FFFFFF;
	border-radius: 8px;
	padding: 16px;
}

.address-item-default {
	border: 1px solid #F2B131;
}

.address-content {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.address-header {
	display: flex;
	align-items: center;
	gap: 10px;
}

.address-name {
	font-size: 14px;
	font-weight: 500;
	color: #000000CC;
}

.address-phone {
	font-size: 14px;
	color: #00000099;
}

.default-tag {
	background-color: #F2B131;
	border-radius: 4px;
	padding: 2px 6px;
}

.default-tag-text {
	font-size: 10px;
	color: #FFFFFF;
}

.address-detail {
	font-size: 12px;
	color: #00000099;
	line-height: 1.5;
}

.address-remark {
	font-size: 11px;
	color: #00000066;
}

.address-actions {
	display: flex;
	justify-content: flex-start;
	gap: 20px;
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid #F3F3F3;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 4px;
}

.action-icon {
	width: 16px;
	height: 16px;
}

.action-text {
	font-size: 12px;
	color: #00000099;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 0;
}

.empty-icon {
	width: 80px;
	height: 80px;
	opacity: 0.5;
	margin-bottom: 16px;
}

.empty-text {
	font-size: 14px;
	color: #00000099;
	margin-bottom: 20px;
}

.empty-btn {
	background-color: #F2B131;
	border-radius: 20px;
	padding: 10px 24px;
}

.empty-btn-text {
	font-size: 14px;
	font-weight: 500;
	color: #FFFFFF;
}

/* 底部占位 */
.bottom-placeholder {
	height: 20px;
}

/* 底部添加按钮 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 64px;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 16px;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.add-btn {
	flex: 1;
	height: 44px;
	background-color: #F2B131;
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
}

.add-icon {
	width: 20px;
	height: 20px;
}

.add-text {
	font-size: 14px;
	font-weight: 500;
	color: #FFFFFF;
}

/* 地址弹窗 */
.address-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	z-index: 1000;
}

.modal-content {
	width: 100%;
	max-height: 85vh;
	background-color: #FFFFFF;
	border-radius: 16px 16px 0 0;
	display: flex;
	flex-direction: column;
}

.modal-header {
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	border-bottom: 1px solid #F3F3F3;
}

.modal-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}

.modal-close {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-icon {
	width: 20px;
	height: 20px;
}

.error-banner {
	margin: 0 16px;
	padding: 10px 12px;
	background-color: #FFF2F0;
	border: 1px solid #FFCCC7;
	border-radius: 8px;
	margin-top: 12px;
}

.error-banner-text {
	font-size: 13px;
	color: #FF4D4F;
}

.modal-body {
	flex: 1;
	overflow-y: auto;
}

.form-section {
	padding: 16px;
}

.location-btn {
	display: flex;
	align-items: center;
	gap: 8px;
	background-color: #FFF7E6;
	border-radius: 8px;
	padding: 12px 16px;
	margin-bottom: 16px;
}

.location-icon {
	width: 20px;
	height: 20px;
}

.location-text {
	flex: 1;
	font-size: 14px;
	font-weight: 500;
	color: #F2B131;
}

.location-status {
	font-size: 12px;
	color: #999999;
}

.form-item {
	margin-bottom: 16px;
}

.form-label {
	display: block;
	font-size: 12px;
	color: #00000099;
	margin-bottom: 8px;
}

.form-input {
	width: 100%;
	height: 44px;
	background-color: #F3F3F3;
	border-radius: 8px;
	padding: 0 12px;
	font-size: 14px;
	color: #000000CC;
}

.form-textarea {
	width: 100%;
	min-height: 80px;
	background-color: #F3F3F3;
	border-radius: 8px;
	padding: 12px;
	font-size: 14px;
	color: #000000CC;
}

.form-picker {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 44px;
	background-color: #F3F3F3;
	border-radius: 8px;
	padding: 0 12px;
}

.picker-text {
	flex: 1;
	font-size: 14px;
	color: #000000CC;
}

.picker-text.placeholder {
	color: #00000066;
}

.picker-arrow {
	width: 16px;
	height: 16px;
}

.label-list {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.label-item {
	padding: 6px 12px;
	background-color: #F3F3F3;
	border-radius: 16px;
}

.label-item.label-active {
	background-color: #F2B131;
}

.label-text {
	font-size: 12px;
	color: #000000CC;
}

.label-item.label-active .label-text {
	color: #FFFFFF;
}

.default-setting {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.modal-footer {
	padding: 16px;
	border-top: 1px solid #F3F3F3;
}

.save-btn {
	height: 44px;
	background-color: #F2B131;
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.save-text {
	font-size: 14px;
	font-weight: 500;
	color: #FFFFFF;
}

/* 地区选择器 */
.region-picker {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	z-index: 1001;
}

.picker-content {
	width: 100%;
	max-height: 50vh;
	background-color: #FFFFFF;
	border-radius: 16px 16px 0 0;
}

.picker-header {
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	border-bottom: 1px solid #F3F3F3;
}

.picker-title {
	font-size: 16px;
	font-weight: 700;
	color: #000000CC;
}

.picker-close {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-text {
	font-size: 20px;
	color: #00000099;
}

.picker-body {
	max-height: 40vh;
	overflow-y: auto;
}

.region-item {
	height: 44px;
	display: flex;
	align-items: center;
	padding: 0 16px;
	border-bottom: 1px solid #F3F3F3;
}

.region-text {
	font-size: 14px;
	color: #000000CC;
}
</style>
