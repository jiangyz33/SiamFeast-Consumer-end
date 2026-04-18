/**
 * 模拟数据入口
 * 统一导出所有模拟数据
 */

import { mockStores, mockGetStores, mockGetStore } from './store.js'
import { mockCategories, mockMenuItems, mockGetCategories, mockGetMenuItems, mockGetMenuItem } from './menu.js'
import { mockOrders, ORDER_STATUS_MAP, mockGetUserOrders, mockGetOrderDetail, mockCreateOrder, mockCancelOrder } from './order.js'
import {
	mockUsers,
	mockCodes,
	mockSendCode,
	mockLoginByCode,
	mockLoginByPassword,
	mockRegister,
	mockGetUserInfo,
	mockUpdateUserInfo,
	mockCheckUserExist,
	mockGetCoinBalance
} from './auth.js'
import {
	mockCoupons,
	mockGetMyCoupons,
	mockGetAvailableCoupons,
	mockReceiveCoupon,
	mockGetNewbiePack,
	mockReceiveNewbiePack
} from './coupon.js'
import {
	mockGetMemberInfo,
	mockGetMemberProgress,
	mockGetMemberBalance,
	mockGetMemberPoints,
	mockGetPointsBenefits,
	mockGetBalanceBenefits,
	mockExchangeBenefit
} from './member.js'
import {
	mockGetMessages,
	mockGetUnreadCount,
	mockMarkAsRead,
	mockMarkAllAsRead
} from './message.js'
import {
	mockGetFavorites,
	mockCheckFavorite,
	mockAddFavorite,
	mockRemoveFavorite
} from './favorite.js'
import {
	mockGetActiveCampaigns,
	mockGetCampaign
} from './campaign.js'
import {
	mockDeliveries,
	mockGetOrderDelivery
} from './delivery.js'
import {
	mockGetNearbyStores,
	mockResolvePlace,
	mockGetStoreServiceability
} from './location.js'

export default {
	// 门店
	mockStores,
	mockGetStores,
	mockGetStore,

	// 菜单
	mockCategories,
	mockMenuItems,
	mockGetCategories,
	mockGetMenuItems,
	mockGetMenuItem,

	// 订单
	mockOrders,
	ORDER_STATUS_MAP,
	mockGetUserOrders,
	mockGetOrderDetail,
	mockCreateOrder,
	mockCancelOrder,

	// 认证
	mockUsers,
	mockCodes,
	mockSendCode,
	mockLoginByCode,
	mockLoginByPassword,
	mockRegister,
	mockGetUserInfo,
	mockUpdateUserInfo,
	mockCheckUserExist,
	mockGetCoinBalance,

	// 优惠券
	mockCoupons,
	mockGetMyCoupons,
	mockGetAvailableCoupons,
	mockReceiveCoupon,
	mockGetNewbiePack,
	mockReceiveNewbiePack,

	// 会员
	mockGetMemberInfo,
	mockGetMemberProgress,
	mockGetMemberBalance,
	mockGetMemberPoints,
	mockGetPointsBenefits,
	mockGetBalanceBenefits,
	mockExchangeBenefit,

	// 消息
	mockGetMessages,
	mockGetUnreadCount,
	mockMarkAsRead,
	mockMarkAllAsRead,

	// 收藏
	mockGetFavorites,
	mockCheckFavorite,
	mockAddFavorite,
	mockRemoveFavorite,

	// 活动
	mockGetActiveCampaigns,
	mockGetCampaign,

	// 配送
	mockDeliveries,
	mockGetOrderDelivery,

	// 定位
	mockGetNearbyStores,
	mockResolvePlace,
	mockGetStoreServiceability
}
