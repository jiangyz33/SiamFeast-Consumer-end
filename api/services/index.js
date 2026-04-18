/**
 * API 服务入口
 * 统一导出所有 API 服务
 */

import { authApi } from './auth.js'
import { storeApi } from './store.js'
import { menuApi } from './menu.js'
import { orderApi } from './order.js'
import { paymentApi } from './payment.js'
import memberApi from './member.js'
import couponApi from './coupon.js'
import addressApi from './address.js'
import bannerApi from './banner.js'
import productsApi from './products.js'
import passwordApi from './password.js'
import notificationApi from './notification.js'
import favoriteApi from './favorite.js'
import campaignApi from './campaign.js'
import deliveryApi from './delivery.js'
import { locationApi } from './location.js'
import { hostelApi } from './hostel.js'

// 导出模块化 API
export { authApi, storeApi, menuApi, orderApi, paymentApi }
export { default as memberApi } from './member.js'
export { default as couponApi } from './coupon.js'
export { default as addressApi } from './address.js'
export { default as bannerApi } from './banner.js'
export { default as productsApi } from './products.js'
export { default as passwordApi } from './password.js'
export { default as notificationApi } from './notification.js'
export { default as favoriteApi } from './favorite.js'
export { default as campaignApi } from './campaign.js'
export { default as deliveryApi } from './delivery.js'
export { locationApi } from './location.js'
export { hostelApi } from './hostel.js'

// 导出常用方法（兼容旧代码）
export * from './auth.js'
export * from './store.js'
export * from './menu.js'
export * from './order.js'
export * from './payment.js'
export * from './member.js'
export * from './coupon.js'
export * from './address.js'
export * from './banner.js'
export * from './products.js'
export * from './password.js'
export * from './notification.js'
export * from './favorite.js'
export * from './campaign.js'
export * from './delivery.js'
export * from './location.js'
export * from './hostel.js'

// 默认导出
export default {
	auth: authApi,
	store: storeApi,
	menu: menuApi,
	order: orderApi,
	payment: paymentApi,
	member: memberApi,
	coupon: couponApi,
	address: addressApi,
	banner: bannerApi,
	products: productsApi,
	password: passwordApi,
	notification: notificationApi,
	favorite: favoriteApi,
	campaign: campaignApi,
	delivery: deliveryApi,
	location: locationApi,
	hostel: hostelApi
}
