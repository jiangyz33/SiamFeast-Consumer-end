/**
 * 模拟数据 - 地址相关
 */

// 模拟地址列表
export const mockAddresses = [
    {
        id: 1,
        user_id: 1,
        name: '张三',
        phone: '13812345678',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '四惠远洋天地二期8号楼2单元1201室',
        houseNumber: '1201室',
        label: 'home',
        isDefault: true,
        remark: '放在门口',
        latitude: 39.9042,
        longitude: 116.4631,
        created_at: '2024-01-01T00:00:00'
    },
    {
        id: 2,
        user_id: 1,
        name: '李四',
        phone: '13987654321',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        detail: '中关村软件园A座',
        houseNumber: '1001室',
        label: 'work',
        isDefault: false,
        remark: '前台收件',
        latitude: 39.9812,
        longitude: 116.3102,
        created_at: '2024-01-02T00:00:00'
    }
]

// 模拟地区数据
export const mockRegions = [
    {
        name: '北京市',
        children: [
            {
                name: '北京市',
                children: [
                    { name: '朝阳区' },
                    { name: '海淀区' },
                    { name: '东城区' },
                    { name: '西城区' },
                    { name: '丰台区' },
                    { name: '石景山区' }
                ]
            }
        ]
    },
    {
        name: '上海市',
        children: [
            {
                name: '上海市',
                children: [
                    { name: '黄浦区' },
                    { name: '徐汇区' },
                    { name: '静安区' },
                    { name: '浦东新区' }
                ]
            }
        ]
    }
]

/**
 * 获取地址列表
 * @param {Number} userId
 * @returns {Promise}
 */
export function mockGetAddressList(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 0,
                message: 'success',
                data: mockAddresses
            })
        }, 300)
    })
}

/**
 * 获取地址详情
 * @param {Number} addressId
 * @returns {Promise}
 */
export function mockGetAddress(addressId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const address = mockAddresses.find(a => a.id === parseInt(addressId))
            if (address) {
                resolve({
                    code: 0,
                    message: 'success',
                    data: address
                })
            } else {
                reject({
                    code: 40204,
                    message: '地址不存在'
                })
            }
        }, 300)
    })
}

/**
 * 新增地址
 * @param {Object} addressData
 * @returns {Promise}
 */
export function mockCreateAddress(addressData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newAddress = {
                id: mockAddresses.length + 1,
                ...addressData,
                created_at: new Date().toISOString()
            }
            mockAddresses.push(newAddress)
            resolve({
                code: 0,
                message: 'success',
                data: newAddress
            })
        }, 300)
    })
}

/**
 * 更新地址
 * @param {Number} addressId
 * @param {Object} addressData
 * @returns {Promise}
 */
export function mockUpdateAddress(addressId, addressData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockAddresses.findIndex(a => a.id === parseInt(addressId))
            if (index > -1) {
                mockAddresses[index] = {
                    ...mockAddresses[index],
                    ...addressData
                }
                resolve({
                    code: 0,
                    message: 'success',
                    data: mockAddresses[index]
                })
            } else {
                reject({
                    code: 40204,
                    message: '地址不存在'
                })
            }
        }, 300)
    })
}

/**
 * 删除地址
 * @param {Number} addressId
 * @returns {Promise}
 */
export function mockDeleteAddress(addressId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockAddresses.findIndex(a => a.id === parseInt(addressId))
            if (index > -1) {
                mockAddresses.splice(index, 1)
                resolve({
                    code: 0,
                    message: 'success'
                })
            } else {
                reject({
                    code: 40204,
                    message: '地址不存在'
                })
            }
        }, 300)
    })
}

/**
 * 设为默认地址
 * @param {Number} addressId
 * @returns {Promise}
 */
export function mockSetDefaultAddress(addressId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const address = mockAddresses.find(a => a.id === parseInt(addressId))
            if (address) {
                // 先取消所有默认
                mockAddresses.forEach(a => a.isDefault = false)
                // 设置新的默认
                address.isDefault = true
                resolve({
                    code: 0,
                    message: 'success'
                })
            } else {
                reject({
                    code: 40204,
                    message: '地址不存在'
                })
            }
        }, 300)
    })
}

export default {
    mockAddresses,
    mockRegions,
    mockGetAddressList,
    mockGetAddress,
    mockCreateAddress,
    mockUpdateAddress,
    mockDeleteAddress,
    mockSetDefaultAddress
}
