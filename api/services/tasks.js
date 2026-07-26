/**
 * 任务系统 API
 * 后端接口:
 *   GET  /tasks              查任务列表(不分页)
 *   POST /tasks/:id/claim    领取任务奖励(传 task_id 不是 user_task.id)
 */
import { get, post } from '../request.js'

/**
 * 获取任务列表
 * 返回:items[] 含 user_task 字段(progress/status)+ task 字段(任务详情)
 */
export function getTasks() {
	return get('/tasks')
}

/**
 * 领取任务奖励
 * @param {number} taskId 任务 ID(注意:是 task_id,不是 user_task.id)
 * @returns {Promise<{reward_type, reward_amount, task_id}>}
 *
 * 错误码:
 *   TASK_NOT_CLAIMABLE  任务未完成或已领取(后端不存在 TASK_NOT_FOUND,统一返回此码)
 */
export function claimTask(taskId) {
	return post(`/tasks/${taskId}/claim`)
}

export const tasksApi = {
	getTasks,
	claimTask
}

export default tasksApi
