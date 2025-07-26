import HttpError from "@server/errors/httpError.js";

class InternalServerError extends HttpError {
    constructor(message: string) {
        super(message, 500);
        this.name = "InternalServerError";
    }
}

export default InternalServerError;
