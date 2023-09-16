const isProduction = process.env.NODE_ENV === 'production';

const logger = {
    log: (...args: any[]) => {
        if (!isProduction) {
            logger.log(...args);
        }
    },
    error: (...args: any[]) => {
        if (!isProduction) {
            logger.error(...args);
        }
    },
};

export default logger;