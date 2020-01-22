export default class LoggerRequiredException extends Error {
    constructor(message, statusCode, originalError = null) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.displayable = true;
        this.originalError = originalError;
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(message).stack;
        }
        this.stack = new Error().stack;
    }
}
