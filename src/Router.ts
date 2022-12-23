import { assertNonNullish } from './asserts';
import { Response } from './Response';
import { Request } from './Request';

enum HttpMethod {
    Get = 'GET',
    Post = 'POST',
    Put = 'PUT',
    Delete = 'DELETE',
}

type HandlerFn = (request: Request, response: Response) => void;

type Endpoint = Record<string, HandlerFn>;

type Endpoints = Record<string, Endpoint>;

class Router {
    private readonly endpoints: Endpoints = {};

    constructor() {
        this.endpoints = {};
    }

    public request(method: string, path: string, handler: HandlerFn) {
        if (!this.endpoints[path]) {
            this.endpoints[path] = {};
        }

        const endpoint = this.endpoints[path];

        assertNonNullish(endpoint, 'Endpoint must not be nullish.');

        if (Object.prototype.hasOwnProperty.call(endpoint, method)) {
            throw new Error(`Handler for ${method} ${path} has already been declared`);
        }

        endpoint[method] = handler;
    }

    public get(path: string, handler: HandlerFn) {
        this.request(HttpMethod.Get, path, handler);
    }

    public post(path: string, handler: HandlerFn) {
        this.request(HttpMethod.Post, path, handler);
    }

    public getEndpoints(): Endpoints {
        return this.endpoints;
    }
}

export { Router };
