import HttpError from "@server/error/httpError.js";

class UnauthorizedError extends HttpError {
    constructor(message: string) {
        super(message, 401);
        this.name = "Unauthorized";
    }
}

export default UnauthorizedError;
