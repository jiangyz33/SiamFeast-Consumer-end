'use strict'

const crypto = require('crypto')

const APP_ID = '__UNI__D871704'
const MAX_BODY_BYTES = 64 * 1024
const MAX_BATCH_CIDS = 500
const SIGNATURE_TOLERANCE_SECONDS = 300

const uniPush = uniCloud.getPushManager({ appId: APP_ID })
const db = uniCloud.database()
const dbCmd = db.command

function httpResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json;charset=utf-8',
      'cache-control': 'no-store'
    },
    body: JSON.stringify(data)
  }
}

function getHeader(event, name) {
  const headers = event && event.headers ? event.headers : {}
  const lower = name.toLowerCase()
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) {
      return String(headers[key] || '').trim()
    }
  }
  return ''
}

function getRawBody(event) {
  if (!event || !Object.prototype.hasOwnProperty.call(event, 'body')) {
    return JSON.stringify(event || {})
  }

  if (event.isBase64Encoded === true && typeof event.body === 'string') {
    return Buffer.from(event.body, 'base64').toString('utf8')
  }

  if (typeof event.body === 'string') {
    return event.body
  }

  return JSON.stringify(event.body || {})
}

function safeHexEqual(expected, actual) {
  if (!/^[a-f0-9]{64}$/i.test(actual)) return false
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(actual, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

async function claimOnce(id, expiresAt) {
  const digest = crypto.createHash('sha256').update(id).digest('hex')
  try {
    // _id 天然唯一,可用于原子抢占。需要定时清理 expires_at 已过期记录。
    await db.collection('sf-push-request-guards').add({
      _id: digest,
      expires_at: expiresAt,
      created_at: Date.now()
    })
    return true
  } catch (error) {
    // 按当前云服务商的"主键重复"错误码精确判断
    if (/duplicate|already exists|重复/i.test(String(error && error.message))) {
      return false
    }
    throw error
  }
}

async function verifySignature(event, rawBody) {
  const expectedKeyId = String(process.env.SF_PUSH_GATEWAY_KEY_ID || '')
  const secret = String(process.env.SF_PUSH_GATEWAY_SECRET || '')

  // 测试阶段未配置密钥时,跳过签名校验(返回占位 keyId)
  // 生产环境必须配置 KEY_ID 和 SECRET,否则签名校验失效
  if (!expectedKeyId || !secret) {
    return 'test-mode'
  }

  const keyId = getHeader(event, 'X-SF-Key-Id')
  const timestamp = getHeader(event, 'X-SF-Timestamp')
  const nonce = getHeader(event, 'X-SF-Nonce')
  const signature = getHeader(event, 'X-SF-Signature')

  const unixSeconds = Number(timestamp)
  const nowSeconds = Math.floor(Date.now() / 1000)
  if (keyId !== expectedKeyId ||
      !Number.isInteger(unixSeconds) ||
      Math.abs(nowSeconds - unixSeconds) > SIGNATURE_TOLERANCE_SECONDS ||
      !/^[a-f0-9]{16,128}$/i.test(nonce)) {
    throw Object.assign(new Error('invalid signature metadata'), {
      statusCode: 401,
      code: 'PUSH_SIGNATURE_INVALID'
    })
  }

  const canonical = `${timestamp}\n${nonce}\n${rawBody}`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(canonical)
    .digest('hex')

  if (!safeHexEqual(expected, signature)) {
    throw Object.assign(new Error('signature mismatch'), {
      statusCode: 401,
      code: 'PUSH_SIGNATURE_INVALID'
    })
  }

  if (!await claimOnce(`nonce:${keyId}:${nonce}`, Date.now() + 10 * 60 * 1000)) {
    throw Object.assign(new Error('replayed nonce'), {
      statusCode: 409,
      code: 'PUSH_REPLAYED_REQUEST'
    })
  }

  return keyId
}

function validateMessage(body) {
  const title = String(body.title || '').trim()
  const content = String(body.content || '').trim()

  if (!title || title.length > 100) {
    throw Object.assign(new Error('invalid title'), {
      statusCode: 400,
      code: 'PUSH_TITLE_INVALID'
    })
  }
  if (!content || content.length > 1000) {
    throw Object.assign(new Error('invalid content'), {
      statusCode: 400,
      code: 'PUSH_CONTENT_INVALID'
    })
  }
  if (Buffer.byteLength(JSON.stringify(body.payload || {}), 'utf8') > 3 * 1024) {
    throw Object.assign(new Error('payload too large'), {
      statusCode: 413,
      code: 'PUSH_PAYLOAD_TOO_LARGE'
    })
  }

  return { title, content, payload: body.payload || {} }
}

function providerTaskId(result) {
  if (!result || !result.data) return null
  return result.data.taskid || result.data.$taskid || null
}

exports.main = async (event) => {
  const startedAt = Date.now()
  let requestId = ''
  let mode = ''

  try {
    const rawBody = getRawBody(event)
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
      return httpResponse(413, {
        code: 'PUSH_REQUEST_TOO_LARGE',
        message: '请求体过大'
      })
    }

    const keyId = await verifySignature(event, rawBody)
    const body = JSON.parse(rawBody)
    const message = validateMessage(body)

    requestId = String(body.request_id || '').trim()
    mode = String(body.mode || '').trim().toLowerCase()
    if (!mode && body.push_clientid) mode = 'single'

    let pushRequest
    if (mode === 'single') {
      const cid = String(body.push_clientid || '').trim()
      if (!cid) {
        return httpResponse(400, {
          code: 'PUSH_CLIENT_ID_REQUIRED',
          message: 'push_clientid不能为空'
        })
      }
      pushRequest = { ...message, push_clientid: cid }
    } else if (mode === 'batch') {
      const cids = Array.isArray(body.push_clientids)
        ? [...new Set(body.push_clientids.map(String).map(v => v.trim()).filter(Boolean))]
        : []
      if (!cids.length || cids.length > MAX_BATCH_CIDS) {
        return httpResponse(400, {
          code: 'PUSH_BATCH_INVALID',
          message: `push_clientids数量必须在1到${MAX_BATCH_CIDS}之间`
        })
      }
      pushRequest = { ...message, push_clientid: cids }
    } else if (mode === 'all') {
      const allowAll = String(process.env.SF_PUSH_ALLOW_ALL || '').toLowerCase() === 'true'
      const allowedKeys = String(process.env.SF_PUSH_ALL_KEY_IDS || '')
        .split(',').map(v => v.trim()).filter(Boolean)

      if (!allowAll || !allowedKeys.includes(keyId)) {
        return httpResponse(403, {
          code: 'PUSH_ALL_FORBIDDEN',
          message: '全量推送未启用或当前密钥无权限'
        })
      }
      if (!requestId) {
        return httpResponse(400, {
          code: 'PUSH_REQUEST_ID_REQUIRED',
          message: '全量推送必须提供request_id'
        })
      }
      if (!await claimOnce(`all:${requestId}`, Date.now() + 24 * 60 * 60 * 1000)) {
        return httpResponse(409, {
          code: 'PUSH_DUPLICATE_REQUEST',
          message: '该全量推送request_id已经执行'
        })
      }

      // 不传任何目标字段即为原生全量广播
      pushRequest = {
        ...message,
        platform: Array.isArray(body.platform)
          ? body.platform
          : ['app-ios', 'app-android'],
        force_notification: true
      }
    } else {
      return httpResponse(400, {
        code: 'PUSH_MODE_INVALID',
        message: 'mode只允许single、batch或all'
      })
    }

    const result = await uniPush.sendMessage(pushRequest)
    if (!result || ![0, '0'].includes(result.errCode)) {
      console.error('[sf-push-gateway] provider rejected', {
        requestId,
        mode,
        errCode: result && result.errCode,
        elapsedMs: Date.now() - startedAt
      })
      return httpResponse(502, {
        code: 'PUSH_PROVIDER_FAILED',
        message: result && result.errMsg ? result.errMsg : 'UniPush调用失败'
      })
    }

    console.log('[sf-push-gateway] accepted', {
      requestId,
      mode,
      taskId: providerTaskId(result),
      elapsedMs: Date.now() - startedAt
    })
    return httpResponse(200, {
      code: 0,
      message: 'success',
      data: {
        request_id: requestId || null,
        mode,
        task_id: providerTaskId(result)
      }
    })
  } catch (error) {
    const statusCode = Number(error && error.statusCode) || 500
    const code = error && error.code ? error.code : 'PUSH_INTERNAL_ERROR'
    console.error('[sf-push-gateway] failed', {
      requestId,
      mode,
      code,
      message: error && error.message,
      elapsedMs: Date.now() - startedAt
    })
    return httpResponse(statusCode, {
      code,
      message: statusCode === 500 ? '推送网关内部错误' : error.message
    })
  }
}
