import HttpError from '@server/error/httpError.js';

class NotFoundError extends HttpError {
    constructor(message: string) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

export default NotFoundError;
