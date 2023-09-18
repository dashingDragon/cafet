const isProduction = process.env.NODE_ENV === 'production';

const logger = {
    log: (...args: any[]) => {
        if (!isProduction) {
            console.log(...args);
        }
    },
    error: (...args: any[]) => {
        if (!isProduction) {
            console.error(...args);
        }
    },
};

export default logger;