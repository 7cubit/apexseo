import winston from 'winston';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'apexseo' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

// OpenTelemetry stub
export const initTelemetry = (serviceName: string) => {
    logger.info(`Initializing OpenTelemetry for ${serviceName}...`);
    // Stub for OTel SDK initialization
};
