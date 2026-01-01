export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    const log = {
      time: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    // Log body ONLY for non-GET requests
    if (req.method !== 'GET' && Object.keys(req.body || {}).length) {
      log.body = req.body;
    }

    console.log('[API]', JSON.stringify(log, null, 2));
  });

  next();
};
