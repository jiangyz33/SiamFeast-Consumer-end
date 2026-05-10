/**
 * 民宿/客房相关 API
 */
import { get, post, put, del } from '../request.js'

// ===================== 房型 =====================

/**
 * 获取房型列表
 * @param {number} storeId 门店ID
 * @returns {Promise}
 */
export function getRoomTypes(storeId) {
	return get('/pricing/room-types', { store_id: storeId })
}

/**
 * 获取房型详情
 * @param {number} typeId 房型ID
 * @returns {Promise}
 */
export function getRoomType(typeId) {
	return get(`/pricing/room-types/${typeId}`)
}

// ===================== 客房 =====================

/**
 * 获取客房列表
 * @param {number} storeId 门店ID
 * @returns {Promise}
 */
export function getRooms(storeId) {
	return get(`/hostels/rooms/${storeId}`)
}

/**
 * 获取可用客房
 * @param {number} storeId 门店ID
 * @param {Object} params 查询参数
 * @param {string} params.check_in_date 入住日期
 * @param {string} params.check_out_date 退房日期
 * @param {number} params.guest_count 入住人数
 * @returns {Promise}
 */
export function getAvailableRooms(storeId, params = {}) {
	const { check_in_date, check_out_date, ...rest } = params
	return get('/hostel/rooms/available', {
		store_id: storeId,
		check_in: check_in_date,
		check_out: check_out_date,
		...rest
	})
}

/**
 * 搜索有空房的民宿门店（携程模式）
 * @param {Object} params 查询参数
 * @param {string} params.check_in 入住日期（YYYY-MM-DD）
 * @param {string} params.check_out 退房日期（YYYY-MM-DD）
 * @param {number} [params.lat] 用户纬度
 * @param {number} [params.lng] 用户经度
 * @param {number} [params.radius] 搜索半径（米），默认50000
 * @param {string} [params.keyword] 门店名模糊搜索
 * @param {number} [params.page] 页码
 * @param {number} [params.page_size] 每页数量
 * @returns {Promise} 返回 { data: [{store_id, store_name, min_price, available_room_count, distance_km}], nights, total, radius, radius_label }
 */
export function searchAvailableHostelStores(params) {
	return get('/hostel/stores/available', params)
}

/**
 * 获取客房可用性
 * @param {number} roomId 客房ID
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getRoomAvailability(roomId, params = {}) {
	return get(`/hostels/rooms/${roomId}/availability`, params)
}

/**
 * 更新客房状态
 * @param {number} roomId 客房ID
 * @param {Object} data 状态数据
 * @returns {Promise}
 */
export function updateRoomStatus(roomId, data) {
	return put(`/hostels/rooms/${roomId}/status`, data)
}

// ===================== 日历定价 =====================

/**
 * 获取客房日历
 * @param {number} storeId 门店ID
 * @param {Object} params 查询参数 (year, month)
 * @returns {Promise}
 */
export function getRoomCalendar(storeId, params = {}) {
	return get(`/hostels/calendar/${storeId}`, params)
}

/**
 * 设置日历定价
 * @param {Object} data 定价数据
 * @returns {Promise}
 */
export function setPricingCalendar(data) {
	return post('/pricing/calendar', data)
}

// ===================== 预订 =====================

/**
 * 创建预订
 * @param {Object} data 预订数据
 * @param {number} data.store_id 门店ID
 * @param {number} data.room_id 客房ID
 * @param {string} data.order_source 订单来源
 * @param {Object} data.extra_data 额外数据 (check_in_date, check_out_date, guest_count, deposit_amount, guest_info)
 * @returns {Promise}
 */
export function createBooking(data) {
	return post('/hostel/bookings', data)
}

/**
 * 获取预订列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getBookings(params = {}) {
	return get('/hostel/bookings', params)
}

/**
 * 获取预订详情
 * @param {string} orderId 订单ID
 * @returns {Promise}
 */
export function getBooking(orderId) {
	return get(`/hostel/bookings/${orderId}`)
}

/**
 * 确认预订
 * @param {string} orderId 订单ID
 * @returns {Promise}
 */
export function confirmBooking(orderId) {
	return put(`/hostels/bookings/${orderId}/confirm`)
}

/**
 * 取消预订
 * @param {string} orderId 订单ID
 * @param {Object} data 取消原因
 * @returns {Promise}
 */
export function cancelBooking(orderId, data = {}) {
	return post(`/hostel/bookings/${orderId}/cancel`, data)
}

/**
 * 入住
 * @param {Object} data 入住数据
 * @param {string} data.order_id 订单ID
 * @param {Object} data.guest_info 客人信息
 * @returns {Promise}
 */
export function checkIn(data) {
	return post('/hostels/bookings/check-in', data)
}

/**
 * 退房
 * @param {Object} data 退房数据
 * @param {string} data.order_id 订单ID
 * @param {boolean} data.refund_deposit 是否退还押金
 * @returns {Promise}
 */
export function checkOut(data) {
	return post('/hostels/bookings/check-out', data)
}

/**
 * 完成订单
 * @param {string} orderId 订单ID
 * @returns {Promise}
 */
export function completeBooking(orderId) {
	return put(`/hostels/bookings/${orderId}/complete`)
}

// ===================== 入住码验证 =====================

/**
 * 验证入住码
 * @param {string} orderId 订单ID
 * @param {string} code 入住码
 * @returns {Promise}
 */
export function verifyCheckInCode(orderId, code) {
	return post(`/hostels/bookings/${orderId}/verify-check-in-code`, { code })
}

// ===================== 客房收费 =====================

/**
 * 获取客房收费列表
 * @param {string} orderId 订单ID
 * @returns {Promise}
 */
export function getRoomCharges(orderId) {
	return get(`/hostels/bookings/${orderId}/charges`)
}

/**
 * 添加客房收费
 * @param {string} orderId 订单ID
 * @param {Object} data 收费数据
 * @returns {Promise}
 */
export function addRoomCharge(orderId, data) {
	return post(`/hostels/bookings/${orderId}/charges`, data)
}

// ===================== 假日规则 =====================

/**
 * 获取假日规则
 * @param {number} storeId 门店ID
 * @returns {Promise}
 */
export function getHolidayRules(storeId) {
	return get('/pricing/holidays', { store_id: storeId })
}


/**
 * 续住
 * @param {string} bookingId 预订ID
 * @param {Object} data 续住数据
 * @param {string} data.new_check_out_date 新退房日期
 * @returns {Promise}
 */
export function extendBooking(bookingId, data) {
	return post(`/hostel/bookings/${bookingId}/extensions`, data)
}

/**
 * 创建评价
 * @param {Object} data 评价数据
 * @param {number} data.booking_id 预订ID
 * @param {number} data.rating 评分
 * @param {string} [data.comment] 评价内容
 * @returns {Promise}
 */
export function createReview(data) {
	return post('/hostel/reviews', data)
}

// 导出模块对象
export const hostelApi = {
	getRoomTypes,
	getRoomType,
	getRooms,
	getAvailableRooms,
	getRoomAvailability,
	updateRoomStatus,
	getRoomCalendar,
	setPricingCalendar,
	createBooking,
	getBookings,
	getBooking,
	confirmBooking,
	cancelBooking,
	checkIn,
	checkOut,
	completeBooking,
	verifyCheckInCode,
	getRoomCharges,
	addRoomCharge,
	getHolidayRules,
	searchAvailableHostelStores
}

export default hostelApi
