/**
 * @fileoverview Logger centralizado basado en Pino.
 *
 * En producción emite JSON por stdout (ingestable por cualquier aggregator).
 * En desarrollo puede añadirse pino-pretty: LOG_PRETTY=true npm run dev
 */
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';
const usePretty = isDev && process.env.LOG_PRETTY === 'true';

const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    ...(usePretty && {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:HH:MM:ss' }
        }
    })
});

export default logger;
