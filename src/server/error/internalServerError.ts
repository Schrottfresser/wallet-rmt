import HttpError from "@server/error/httpError.js";

class InternalServerError extends HttpError {
    constructor(message: string) {
        super(message, 500);
        this.name = "InternalServerError";
    }
}

export default InternalServerError;
