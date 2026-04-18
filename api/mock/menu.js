/**
 * 模拟数据 - 菜单相关
 */

// 模拟分类数据
export const mockCategories = [
	{ id: 3, store_id: 1, name: '泰式火锅', name_en: 'Thai Hotpot', name_th: 'หม้อไฟไทย', sort_order: 1, is_active: true },
	{ id: 4, store_id: 1, name: '泰式饮品', name_en: 'Thai Beverages', name_th: 'เครื่องดื่มไทย', sort_order: 2, is_active: true },
	{ id: 5, store_id: 1, name: '泰式甜品', name_en: 'Thai Desserts', name_th: 'ของหวานไทย', sort_order: 3, is_active: true }
]

// 模拟菜品数据
export const mockMenuItems = [
	// 泰式火锅分类
	{
		id: 1,
		store_id: 1,
		category_id: 3,
		name: '冬阴功火锅',
		name_en: 'Tom Yum Hotpot',
		name_th: 'หม้อไฟต้มยำ',
		description: '酸辣开胃，泰式经典汤底，搭配新鲜食材',
		description_en: 'Sour and spicy, classic Thai soup base with fresh ingredients',
		image_url: '/static/logo.png',
		price: 68.00,
		original_price: 88.00,
		business_type: 'HOTPOT',
		specs_config: {
			spice_level: ['mild', 'medium_spice', 'hot_spice', 'extra_hot']
		},
		stock: 50,
		is_sold_out: false,
		is_active: true,
		sort_order: 1,
		tags: ['人气', '招牌'],
		category: 'hotpot',
		sales_count: 1520, repeat_customers: 900, weekly_sales: 190
	},
	{
		id: 2,
		store_id: 1,
		category_id: 3,
		name: '绿咖喱火锅',
		name_en: 'Green Curry Hotpot',
		name_th: 'หม้อไฟแกงเขียวหวาน',
		description: '浓郁绿咖喱汤底，搭配嫩滑鸡肉',
		description_en: 'Rich green curry soup base with tender chicken',
		image_url: '/static/logo.png',
		price: 72.00,
		original_price: 92.00,
		business_type: 'HOTPOT',
		specs_config: {
			spice_level: ['mild', 'medium_spice', 'hot_spice']
		},
		stock: 30,
		is_sold_out: false,
		is_active: true,
		sort_order: 2,
		tags: ['推荐'],
		category: 'hotpot',
		sales_count: 980, repeat_customers: 620, weekly_sales: 130
	},
	{
		id: 3,
		store_id: 1,
		category_id: 3,
		name: '椰香鸡汤锅',
		name_en: 'Coconut Chicken Soup',
		name_th: 'ต้มข่าไก่',
		description: '香浓椰奶炖鸡汤，鲜美滋补',
		description_en: 'Creamy coconut chicken soup, nourishing and delicious',
		image_url: '/static/logo.png',
		price: 58.00,
		original_price: null,
		business_type: 'HOTPOT',
		specs_config: {},
		stock: 25,
		is_sold_out: false,
		is_active: true,
		sort_order: 3,
		tags: ['新品'],
		category: 'hotpot',
		sales_count: 650, repeat_customers: 400, weekly_sales: 85
	},
	{
		id: 4,
		store_id: 1,
		category_id: 3,
		name: '泰式麻辣香锅',
		name_en: 'Thai Spicy Dry Pot',
		name_th: 'หม้อแห้งเผ็ดไทย',
		description: '泰式风味干锅，香辣过瘾',
		description_en: 'Thai style dry pot, spicy and aromatic',
		image_url: '/static/logo.png',
		price: 52.00,
		original_price: 65.00,
		business_type: 'HOTPOT',
		specs_config: {
			spice_level: ['mild', 'medium_spice', 'hot_spice', 'extra_hot']
		},
		stock: 35,
		is_sold_out: false,
		is_active: true,
		sort_order: 4,
		tags: ['人气'],
		category: 'hotpot',
		sales_count: 870, repeat_customers: 550, weekly_sales: 110
	},
	// 泰式饮品分类
	{
		id: 5,
		store_id: 1,
		category_id: 4,
		name: '泰式奶茶',
		name_en: 'Thai Milk Tea',
		name_th: 'ชาไทย',
		description: '正宗泰式风味，浓郁香甜',
		description_en: 'Authentic Thai flavor, rich and sweet',
		image_url: '/static/logo.png',
		price: 16.00,
		original_price: 22.00,
		business_type: 'BEVERAGE',
		specs_config: {
			temperature: ['hot', 'ice'],
			sugar: ['full', 'half', 'little', 'none'],
			size: ['small', 'medium', 'large']
		},
		stock: 100,
		is_sold_out: false,
		is_active: true,
		sort_order: 1,
		tags: ['热销', '招牌'],
		category: 'beverages',
		sales_count: 2100, repeat_customers: 1300, weekly_sales: 280
	},
	{
		id: 6,
		store_id: 1,
		category_id: 4,
		name: '泰式柠檬茶',
		name_en: 'Thai Lemon Tea',
		name_th: 'ชามะนาวไทย',
		description: '清新柠檬，解腻消暑',
		description_en: 'Fresh lemon, refreshing and thirst-quenching',
		image_url: '/static/logo.png',
		price: 14.00,
		original_price: null,
		business_type: 'BEVERAGE',
		specs_config: {
			temperature: ['ice'],
			sugar: ['full', 'half', 'little']
		},
		stock: 80,
		is_sold_out: false,
		is_active: true,
		sort_order: 2,
		tags: ['推荐'],
		category: 'beverages',
		sales_count: 1350, repeat_customers: 800, weekly_sales: 170
	},
	{
		id: 7,
		store_id: 1,
		category_id: 4,
		name: '椰子冰沙',
		name_en: 'Coconut Smoothie',
		name_th: 'ปั่นมะพร้าว',
		description: '新鲜椰肉打制，清凉解暑',
		description_en: 'Made from fresh coconut, cool and refreshing',
		image_url: '/static/logo.png',
		price: 18.00,
		original_price: null,
		business_type: 'BEVERAGE',
		specs_config: {
			sugar: ['full', 'half', 'little'],
			size: ['small', 'medium']
		},
		stock: 60,
		is_sold_out: false,
		is_active: true,
		sort_order: 3,
		tags: ['新品'],
		category: 'beverages',
		sales_count: 720, repeat_customers: 450, weekly_sales: 95
	},
	// 泰式甜品分类
	{
		id: 8,
		store_id: 1,
		category_id: 5,
		name: '芒果糯米饭',
		name_en: 'Mango Sticky Rice',
		name_th: 'ข้าวเหนียวมะม่วง',
		description: '香甜芒果，软糯椰香糯米',
		description_en: 'Sweet mango with coconut sticky rice',
		image_url: '/static/logo.png',
		price: 22.00,
		original_price: 28.00,
		business_type: 'DESSERT',
		specs_config: {},
		stock: 30,
		is_sold_out: false,
		is_active: true,
		sort_order: 1,
		tags: ['热销', '招牌'],
		category: 'desserts',
		sales_count: 1800, repeat_customers: 1100, weekly_sales: 230
	},
	{
		id: 9,
		store_id: 1,
		category_id: 5,
		name: '椰汁西米露',
		name_en: 'Coconut Sago',
		name_th: 'สาคูมะพร้าว',
		description: '清爽椰香，Q弹西米',
		description_en: 'Refreshing coconut milk with chewy sago',
		image_url: '/static/logo.png',
		price: 15.00,
		original_price: null,
		business_type: 'DESSERT',
		specs_config: {},
		stock: 40,
		is_sold_out: false,
		is_active: true,
		sort_order: 2,
		tags: ['推荐'],
		category: 'desserts',
		sales_count: 900, repeat_customers: 560, weekly_sales: 120
	},
	{
		id: 10,
		store_id: 1,
		category_id: 5,
		name: '泰式焦糖布丁',
		name_en: 'Thai Caramel Pudding',
		name_th: 'คัสตาร์ดคาราเมลไทย',
		description: '丝滑布丁，焦糖香甜',
		description_en: 'Silky smooth pudding with sweet caramel',
		image_url: '/static/logo.png',
		price: 18.00,
		original_price: null,
		business_type: 'DESSERT',
		specs_config: {},
		stock: 25,
		is_sold_out: false,
		is_active: true,
		sort_order: 3,
		tags: ['新品'],
		category: 'desserts',
		sales_count: 580, repeat_customers: 350, weekly_sales: 75
	}
]

/**
 * 模拟获取分类列表
 */
export function mockGetCategories(storeId) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const categories = mockCategories.filter(c => c.store_id === parseInt(storeId))
			resolve({
				code: 0,
				message: 'success',
				data: categories
			})
		}, 200)
	})
}

/**
 * 模拟获取菜品列表
 */
export function mockGetMenuItems(params = {}) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let items = [...mockMenuItems]

			// 门店筛选
			if (params.store_id) {
				items = items.filter(item => item.store_id === parseInt(params.store_id))
			}

			// 分类筛选
			if (params.category_id) {
				items = items.filter(item => item.category_id === parseInt(params.category_id))
			}

			// 业态筛选
			if (params.business_type) {
				items = items.filter(item => item.business_type === params.business_type)
			}

			// 仅启用的
			if (params.is_active_only) {
				items = items.filter(item => item.is_active && !item.is_sold_out)
			}

			// 搜索
			if (params.search) {
				const keyword = params.search.toLowerCase()
				items = items.filter(item =>
					item.name.toLowerCase().includes(keyword) ||
					item.name_en.toLowerCase().includes(keyword)
				)
			}

			resolve({
				code: 0,
				message: 'success',
				data: items
			})
		}, 300)
	})
}

/**
 * 模拟获取菜品详情
 */
export function mockGetMenuItem(itemId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const item = mockMenuItems.find(i => i.id === parseInt(itemId))
			if (item) {
				resolve({
					code: 0,
					message: 'success',
					data: {
						...item,
						repeat_customers: item.repeat_customers || Math.floor((item.sales_count || 500) * 0.6),
						weekly_sales: item.weekly_sales || Math.floor((item.sales_count || 500) * 0.12)
					}
				})
			} else {
				reject({
					code: 40302,
					message: '菜品不存在'
				})
			}
		}, 200)
	})
}

export default {
	mockCategories,
	mockMenuItems,
	mockGetCategories,
	mockGetMenuItems,
	mockGetMenuItem
}
