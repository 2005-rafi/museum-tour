const winston = require('winston');
const path = require('path');
const http = require('http');
const https = require('https');
const Transport = require('winston-transport');

// Sensitive data masking
const SENSITIVE_KEYS = ['password', 'currentPassword', 'newPassword', 'confirmPassword', 'token', 'refreshToken', 'accessToken', 'authorization', 'cookie', 'creditCard'];

const maskValue = (value) => {
  if (typeof value !== 'string') return '***';
  if (value.length <= 4) return '***';
  return value.substring(0, 2) + '***' + value.substring(value.length - 2);
};

const maskSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const masked = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(masked)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      masked[key] = maskValue(masked[key]);
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  return masked;
};

const sensitiveDataMasker = winston.format((info) => {
  if (info.meta) info.meta = maskSensitiveData(info.meta);
  if (info.body) info.body = maskSensitiveData(info.body);
  if (info.headers) info.headers = maskSensitiveData(info.headers);
  return info;
});

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  sensitiveDataMasker(),
  winston.format.json()
);

// Custom lightweight Elasticsearch transport (avoids heavy @elastic/elasticsearch dep)
class ElasticsearchHttpTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.url = new URL(opts.url);
    this.indexPrefix = opts.indexPrefix || 'museum-logs';
    this.protocol = this.url.protocol === 'https:' ? https : http;
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    const date = new Date().toISOString().split('T')[0];
    const index = `${this.indexPrefix}-${date}`;
    const body = JSON.stringify({
      '@timestamp': info.timestamp || new Date().toISOString(),
      level: info.level,
      message: info.message,
      service: info.service,
      traceId: info.traceId,
      ...info,
    });

    const req = this.protocol.request({
      hostname: this.url.hostname,
      port: this.url.port,
      path: `/${index}/_doc`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      res.resume();
      callback();
    });
    req.on('error', () => callback());
    req.write(body);
    req.end();
  }
}

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, traceId, ...meta }) => {
        const trace = traceId ? ` [${traceId}]` : '';
        const msg = typeof message === 'string' ? message : JSON.stringify(message);
        const extra = Object.keys(meta).length > 1
          ? ` ${JSON.stringify(meta)}`
          : '';
        return `${timestamp} ${level}:${trace} ${msg}${extra}`;
      })
    ),
  }),
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
  }),
];

// Conditionally add Elasticsearch transport
if (process.env.ELASTICSEARCH_URL) {
  transports.push(new ElasticsearchHttpTransport({
    url: process.env.ELASTICSEARCH_URL,
    indexPrefix: 'museum-logs',
    level: 'info',
  }));
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'museum-platform' },
  transports,
});

logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
