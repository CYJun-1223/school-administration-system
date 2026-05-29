import { createLogger, format, transports } from 'winston';
import type { TransformableInfo } from 'logform';

const { colorize, combine, metadata, timestamp, printf } = format;

const {
  LOG_LEVEL = 'info',
  NODE_ENV,
} = process.env;

const IS_PRODUCTION = NODE_ENV === 'production';

const isLogLevel = (value: string): value is 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly' => {
  return ['error', 'warn', 'info', 'verbose', 'debug', 'silly'].includes(value);
};

const formatFieldValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
};

const developmentFormat = printf((info: TransformableInfo) => {
  const rawFields = info.metadata?.fields as Record<string, unknown> | undefined;
  const fields = rawFields
    ? Object.entries(rawFields)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${formatFieldValue(value)}`)
      .join(' ')
    : '';

  const message = `${info.timestamp}\t[${info.metadata?.filename ?? '-'}]\t${info.level}\t${info.message}${fields ? `\t${fields}` : ''}`;

  if (info.level === 'ERROR' || info.level === 'WARN') {
    return colorize({ level: true }).colorize(info.level.toLowerCase(), message);
  }

  return message;
});

const productionFormat = printf((info: TransformableInfo) => {
  const fields = info.metadata?.fields as Record<string, unknown> | undefined;

  return JSON.stringify({
    timestamp: info.timestamp,
    level: info.level,
    service: 'school-administration-system',
    component: info.metadata?.filename ?? '-',
    message: info.message,
    ...fields,
  });
});

const changeLevelToUpperCase = format((info: TransformableInfo) => {
  info.level = info.level.toUpperCase();

  return info;
});

const appLogger = createLogger({
  level: LOG_LEVEL,
  exitOnError: false,
  format: IS_PRODUCTION
    ? combine(timestamp(), metadata(), productionFormat)
    : combine(
      changeLevelToUpperCase(),
      metadata(),
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      developmentFormat,
    ),
  transports: [
    new transports.Console(),
  ],
});

type LogFields = Record<string, unknown>;

class Logger {
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  public error(message: string, fields: LogFields = {}): void {
    appLogger.error(message, { filename: this.filename, fields });
  }

  public warn(message: string, fields: LogFields = {}): void {
    appLogger.warn(message, { filename: this.filename, fields });
  }

  public info(message: string, fields: LogFields = {}): void {
    appLogger.info(message, { filename: this.filename, fields });
  }

  public verbose(message: string, fields: LogFields = {}): void {
    appLogger.verbose(message, { filename: this.filename, fields });
  }

  public debug(message: string, fields: LogFields = {}): void {
    appLogger.debug(message, { filename: this.filename, fields });
  }

  public silly(message: string, fields: LogFields = {}): void {
    appLogger.silly(message, { filename: this.filename, fields });
  }

  public log(level: string, message: string, fields: LogFields = {}): void {
    if (isLogLevel(level)) {
      appLogger.log(level, message, { filename: this.filename, fields });
      return;
    }

    appLogger.info(message, { filename: this.filename, fields });
  }
}

export default Logger;
