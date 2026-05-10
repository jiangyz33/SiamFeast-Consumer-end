/**
 * 发票服务
 */
import { USE_MOCK } from '../config.js'
import { get, post } from '../request.js'

/**
 * 创建发票
 * @param {Object} data 发票数据
 * @param {number} data.order_id 订单ID
 * @param {string} data.invoice_type 发票类型 (ELECTRONIC/PAPER)
 * @param {string} data.title_type 抬头类型 (PERSONAL/COMPANY)
 * @param {string} data.title 抬头
 * @param {string} [data.tax_number] 税号
 * @param {string} [data.email] 邮箱
 * @param {string} [data.remark] 备注
 * @returns {Promise}
 */
export function createInvoice(data) {
	return post('/invoices', data)
}

/**
 * 获取发票列表
 * @param {Object} params
 * @param {number} [params.page] 页码
 * @param {number} [params.page_size] 每页数量
 * @returns {Promise}
 */
export function getInvoices(params = {}) {
	return get('/invoices', params)
}

/**
 * 获取发票详情
 * @param {number} invoiceId 发票ID
 * @returns {Promise}
 */
export function getInvoiceDetail(invoiceId) {
	return get(`/invoices/${invoiceId}`)
}

/**
 * 取消发票
 * @param {number} invoiceId 发票ID
 * @param {Object} [data] 取消原因
 * @returns {Promise}
 */
export function cancelInvoice(invoiceId, data = {}) {
	return post(`/invoices/${invoiceId}/cancellations`, data)
}

export const invoiceApi = {
	createInvoice,
	getInvoices,
	getInvoiceDetail,
	cancelInvoice
}

export default invoiceApi
