/**
 * 全局错误处理中间件
 * 必须放在所有路由注册之后
 */

function errorHandler(err, req, res, next) {
  console.error('[Error]', err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? '服务器内部错误'
    : err.message || '未知错误';

  res.status(statusCode).json({
    code: -1,
    message,
    data: null,
  });
}

module.exports = errorHandler;
