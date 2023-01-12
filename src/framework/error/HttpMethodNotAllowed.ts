class HttpMethodNotAllowed extends Error {
    constructor(message = 'Method is not allowed.') {
        super(message);
        this.name = 'HttpMethodNotAllowed';
    }
}

export { HttpMethodNotAllowed };
