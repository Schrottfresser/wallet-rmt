import HttpError from "@server/errors/httpError.js";

class NotFoundError extends HttpError {
    constructor(message: string) {
        super(message, 404);
        this.name = "NotFoundError";
    }
}

export default NotFoundError;
