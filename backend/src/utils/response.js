/**
 * 统一响应格式工具
 */

/**
 * 成功响应
 * @param {object} res - Express response 对象
 * @param {*} data - 响应数据
 * @param {string} message - 提示信息
 * @param {number} statusCode - HTTP 状态码（默认 200）
 */
function success(res, data = null, message = 'success', statusCode = 200) {
  return res.status(statusCode).json({
    code: 0,
    message,
    data,
  });
}

/**
 * 失败响应
 * @param {object} res - Express response 对象
 * @param {string} message - 错误信息
 * @param {number} statusCode - HTTP 状态码（默认 400）
 * @param {number} code - 业务错误码（默认 -1）
 */
function error(res, message = 'error', statusCode = 400, code = -1) {
  return res.status(statusCode).json({
    code,
    message,
    data: null,
  });
}

module.exports = { success, error };
