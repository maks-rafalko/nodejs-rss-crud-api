class HttpBadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'HttpBadRequestError';
    }
}

export { HttpBadRequestError };
