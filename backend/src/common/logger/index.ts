import pino from 'pino';
import { config } from '@/server/config';

// Create logger instance
export const logger = pino({
  level: config.logging.level,
  transport:
    config.nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: config.nodeEnv,
  },
});

// Export child logger factory
export function createLogger(context: string) {
  return logger.child({ context });
}
