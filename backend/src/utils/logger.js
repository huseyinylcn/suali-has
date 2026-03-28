const winston = require('winston');
require('winston-daily-rotate-file');

// Log formatını belirleyelim: Zaman Damgası + JSON
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Hata varsa tüm yığın izini (stack trace) ekle
  winston.format.json()
);

const logger = winston.createLogger({
  level: 'info', // 'info' ve üstü (warn, error) kayıt edilir
  format: logFormat,
  transports: [
    // 1. Dosya Yönetimi: Her gün yeni bir dosya aç, 14 gün sonra eskileri sil
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // 14 günden eski logları sil (Disk dolmasın!)
      level: 'info'
    }),
    // 2. Hataları ayrı bir dosyada da tutalım ki bakması kolay olsun
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      level: 'error'
    })
  ],
});

// Geliştirme aşamasındaysak (Local), logları terminale de renkli bas
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

module.exports = logger;