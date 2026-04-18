/**
 * API 统一入口
 *
 * 使用方式：
 * 1. 设置 USE_MOCK = true 使用模拟数据（开发阶段）
 * 2. 设置 USE_MOCK = false 连接真实后端
 *
 * 示例：
 * ```js
 * import { authApi, storeApi, menuApi, orderApi, paymentApi } from '@/api/index.js'
 *
 * // 登录
 * const res = await authApi.loginByCode(phone, code)
 *
 * // 获取门店列表
 * const stores = await storeApi.getStores()
 *
 * // 获取菜品
 * const items = await menuApi.getMenuItems({ store_id: 1 })
 *
 * // 创建订单
 * const order = await orderApi.createOrder(orderData)
 * ```
 */

// 导出配置
export * from './config.js'

// 导出请求工具
export * from './request.js'

// 导出模块化 API
export { authApi, storeApi, menuApi, orderApi, paymentApi, bannerApi, productsApi, locationApi, hostelApi } from './services/index.js'

// 导出常用方法（兼容旧代码）
export * from './services/auth.js'
export * from './services/store.js'
export * from './services/menu.js'
export * from './services/order.js'
export * from './services/payment.js'
export * from './services/banner.js'
export * from './services/products.js'
export * from './services/member.js'
export * from './services/coupon.js'
export * from './services/notification.js'
export * from './services/address.js'
export * from './services/password.js'
export * from './services/favorite.js'
export * from './services/campaign.js'
export * from './services/delivery.js'
export * from './services/location.js'
export * from './services/hostel.js'

// 默认导出
import { authApi, storeApi, menuApi, orderApi, paymentApi, bannerApi, productsApi, locationApi, hostelApi } from './services/index.js'

export default {
	auth: authApi,
	store: storeApi,
	menu: menuApi,
	order: orderApi,
	payment: paymentApi,
	banner: bannerApi,
	products: productsApi,
	location: locationApi,
	hostel: hostelApi
}
