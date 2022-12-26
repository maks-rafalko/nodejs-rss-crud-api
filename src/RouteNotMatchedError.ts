class RouteNotMatchedError extends Error {
    constructor() {
        super('Route not matched.');
        this.name = 'RouteNotMatchedError';
    }
}

export { RouteNotMatchedError };
