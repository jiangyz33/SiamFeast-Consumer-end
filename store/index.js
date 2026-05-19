/**
 * 用户状态管理
 */

const TOKEN_KEY = 'siamfeast_token'
const USER_INFO_KEY = 'siamfeast_userInfo'
const LOGIN_TYPE_KEY = 'siamfeast_loginType'
const CURRENT_STORE_KEY = 'siamfeast_currentStore'
const CART_KEY = 'siamfeast_cart'

const store = {
	state: {
		token: '',
		userInfo: null,
		loginType: 'register', // register（首次登录）, password（密码登录）
		isLoggedIn: false,
		currentStore: null // 当前选中的门店
	},

	/**
	 * 初始化状态
	 */
	init() {
		try {
			const token = uni.getStorageSync(TOKEN_KEY)
			const userInfo = uni.getStorageSync(USER_INFO_KEY)
			const loginType = uni.getStorageSync(LOGIN_TYPE_KEY) || 'register'

			if (token) {
				this.state.token = token
				this.state.isLoggedIn = true
			}

			if (userInfo) {
				this.state.userInfo = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
			}

			this.state.loginType = loginType
		} catch (e) {
			console.error('store init error:', e)
		}
	},

	/**
	 * 设置Token
	 * @param {string} token
	 */
	setToken(token) {
		this.state.token = token
		this.state.isLoggedIn = !!token
		try {
			uni.setStorageSync(TOKEN_KEY, token)
		} catch (e) {
			console.error('setToken error:', e)
		}
	},

	/**
	 * 获取Token
	 * @returns {string}
	 */
	getToken() {
		return this.state.token || uni.getStorageSync(TOKEN_KEY) || ''
	},

	/**
	 * 设置用户信息
	 * @param {Object} userInfo
	 */
	setUserInfo(userInfo) {
		this.state.userInfo = userInfo
		try {
			uni.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo))
		} catch (e) {
			console.error('setUserInfo error:', e)
		}
	},

	/**
	 * 获取用户信息
	 * @returns {Object|null}
	 */
	getUserInfo() {
		if (this.state.userInfo) {
			return this.state.userInfo
		}
		try {
			const userInfo = uni.getStorageSync(USER_INFO_KEY)
			return userInfo ? (typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo) : null
		} catch (e) {
			console.error('getUserInfo error:', e)
			return null
		}
	},

	/**
	 * 设置登录类型
	 * @param {string} type - register | password
	 */
	setLoginType(type) {
		this.state.loginType = type
		try {
			uni.setStorageSync(LOGIN_TYPE_KEY, type)
		} catch (e) {
			console.error('setLoginType error:', e)
		}
	},

	/**
	 * 获取登录类型
	 * @returns {string}
	 */
	getLoginType() {
		return this.state.loginType || uni.getStorageSync(LOGIN_TYPE_KEY) || 'register'
	},

	/**
	 * 检查是否登录
	 * @returns {boolean}
	 */
	isLoggedIn() {
		return !!(this.state.token || uni.getStorageSync(TOKEN_KEY))
	},

	/**
	 * 退出登录
	 */
	logout() {
		this.state.token = ''
		this.state.userInfo = null
		this.state.isLoggedIn = false

		try {
			uni.removeStorageSync(TOKEN_KEY)
			uni.removeStorageSync(USER_INFO_KEY)
		} catch (e) {
			console.error('logout error:', e)
		}
	},

	/**
	 * 检查是否首次登录（新用户）
	 * @returns {boolean}
	 */
	isFirstLogin() {
		return this.getLoginType() === 'register'
	},

	/**
	 * 设置当前门店
	 * @param {Object} storeInfo
	 */
	setCurrentStore(storeInfo) {
		this.state.currentStore = storeInfo
		try {
			uni.setStorageSync(CURRENT_STORE_KEY, JSON.stringify(storeInfo))
		} catch (e) {
			console.error('setCurrentStore error:', e)
		}
	},

	/**
	 * 获取当前门店
	 * @returns {Object|null}
	 */
	getCurrentStore() {
		if (this.state.currentStore) {
			return this.state.currentStore
		}
		try {
			const storeInfo = uni.getStorageSync(CURRENT_STORE_KEY)
			return storeInfo ? (typeof storeInfo === 'string' ? JSON.parse(storeInfo) : storeInfo) : null
		} catch (e) {
			console.error('getCurrentStore error:', e)
			return null
		}
	},

	/**
	 * 清除当前门店
	 */
	clearCurrentStore() {
		this.state.currentStore = null
		try {
			uni.removeStorageSync(CURRENT_STORE_KEY)
		} catch (e) {
			console.error('clearCurrentStore error:', e)
		}
		},

		getCart(storeId) {
			try {
				const raw = uni.getStorageSync(CART_KEY)
				const all = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {}
				if (storeId) return all[storeId] || []
				return all
			} catch (e) {
				return storeId ? [] : {}
			}
		},

		addToCart(storeId, item) {
			if (!storeId) { console.error("addToCart: storeId is null"); return }
			try {
				const all = this.getCart()
				const cart = all[storeId] || []
				const specsKey = item.specs ? JSON.stringify(item.specs) : ''
				const existIdx = cart.findIndex(ci => ci.id === item.id && JSON.stringify(ci.specs || {}) === specsKey)
				if (existIdx >= 0) {
					cart[existIdx].quantity += (item.quantity || 1)
				} else {
					cart.push({ ...item, quantity: item.quantity || 1 })
				}
				all[storeId] = cart
				uni.setStorageSync(CART_KEY, JSON.stringify(all))
			} catch (e) {
				console.error('addToCart error:', e)
			}
		},

		clearCart(storeId) {
			try {
				const all = this.getCart()
				delete all[storeId]
				uni.setStorageSync(CART_KEY, JSON.stringify(all))
			} catch (e) {
				console.error('clearCart error:', e)
			}
		}
	}
export default store
