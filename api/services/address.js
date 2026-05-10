/**
 * 地址管理服务
 */
import { USE_MOCK } from '../config.js'
import { get, post, patch, del } from '../request.js'
import {
	mockGetAddressList,
	mockGetAddress,
	mockCreateAddress,
	mockUpdateAddress,
	mockDeleteAddress,
	mockSetDefaultAddress
} from '../mock/address.js'

/**
 * 获取地址列表
 * @returns {Promise}
 */
export function getAddressList() {
	if (USE_MOCK) {
		return mockGetAddressList()
	}
	return get('/addresses')
}

/**
 * 获取地址详情
 * @param {Number} addressId
 * @returns {Promise}
 */
export function getAddress(addressId) {
	if (USE_MOCK) {
		return mockGetAddress(addressId)
	}
	return get(`/addresses/${addressId}`)
}

/**
 * 新增地址
 * @param {Object} addressData
 * @returns {Promise}
 */
export function createAddress(addressData) {
	if (USE_MOCK) {
		return mockCreateAddress(addressData)
	}
	// 映射前端字段名为后端要求: name->contact_name, phone->contact_phone, detail->address
	const payload = {
		label: addressData.label || "home",
		contact_name: addressData.contact_name || addressData.name,
		contact_phone: addressData.contact_phone || addressData.phone,
		address: addressData.address || addressData.detail,
		province: addressData.province || null,
		city: addressData.city || null,
		district: addressData.district || null,
		building: addressData.building || addressData.houseNumber || null,
		latitude: addressData.latitude || null,
		longitude: addressData.longitude || null,
		is_default: addressData.is_default || addressData.isDefault || false,
		remark: addressData.remark || null
	}
	return post('/addresses', payload)
}

/**
 * 更新地址
 * @param {Number} addressId
 * @param {Object} addressData
 * @returns {Promise}
 */
export function updateAddress(addressId, addressData) {
	if (USE_MOCK) {
		return mockUpdateAddress(addressId, addressData)
	}
	const payload = {
		label: addressData.label || "home",
		contact_name: addressData.contact_name || addressData.name,
		contact_phone: addressData.contact_phone || addressData.phone,
		address: addressData.address || addressData.detail,
		province: addressData.province || null,
		city: addressData.city || null,
		district: addressData.district || null,
		building: addressData.building || addressData.houseNumber || null,
		latitude: addressData.latitude || null,
		longitude: addressData.longitude || null,
		is_default: addressData.is_default || addressData.isDefault || false,
		remark: addressData.remark || null
	}
	return patch(`/addresses/${addressId}`, payload)
}

/**
 * 删除地址
 * @param {Number} addressId
 * @returns {Promise}
 */
export function deleteAddress(addressId) {
	if (USE_MOCK) {
		return mockDeleteAddress(addressId)
	}
	return del(`/addresses/${addressId}`)
}

/**
 * 设为默认地址
 * @param {Number} addressId
 * @returns {Promise}
 */
export function setDefaultAddress(addressId) {
	if (USE_MOCK) {
		return mockSetDefaultAddress(addressId)
	}
	return patch(`/addresses/${addressId}/default`)
}

/**
 * 获取用户位置
 * @returns {Promise}
 */
export function getUserLocation() {
	if (USE_MOCK) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					code: 0,
					message: 'success',
					data: {
						latitude: 39.9042,
						longitude: 116.4631,
						province: '北京市',
						city: '北京市',
						district: '朝阳区',
						address: '四惠远洋天地二期'
					}
				})
			}, 500)
		})
	}
	return new Promise((resolve, reject) => {
		uni.getLocation({
			type: 'gcj02',
			success: (res) => {
				resolve({
					code: 0,
					message: 'success',
					data: {
						latitude: res.latitude,
						longitude: res.longitude
					}
				})
			},
			fail: () => {
				reject({ code: -1, message: '获取位置失败' })
			}
		})
	})
}

export const addressApi = {
	getAddressList,
	getAddress,
	createAddress,
	updateAddress,
	deleteAddress,
	setDefaultAddress,
	getUserLocation
}

export default addressApi
