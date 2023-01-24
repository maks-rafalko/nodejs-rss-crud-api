class RouteNotMatchedError extends Error {
    constructor(message = 'Route not matched.') {
        super(message);
        this.name = 'RouteNotMatchedError';
    }
}

export { RouteNotMatchedError };
