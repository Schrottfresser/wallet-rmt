class HttpError extends TypeError {
    public status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'HttpError';
    }
}

export default HttpError;
