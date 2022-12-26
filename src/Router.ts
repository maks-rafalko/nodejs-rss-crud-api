import { assertNonNullish } from './asserts';
import { Response } from './Response';
import { Request } from './Request';
import { pathToRegExp } from './pathToRegex';

enum HttpMethod {
    Get = 'GET',
    Post = 'POST',
    Put = 'PUT',
    Delete = 'DELETE',
}

type HandlerFn = (request: Request, response: Response) => void;

type Endpoint = Record<string, HandlerFn>;

type Endpoints = Record<string, Endpoint>;

type MatchedRouteResult = { handler: HandlerFn, placeholderValues: Record<string, string> | undefined } | null;

class Router {
    private readonly endpoints: Endpoints = {};

    constructor() {
        this.endpoints = {};
    }

    public request(method: string, path: string, handler: HandlerFn) {
        const regExp = pathToRegExp(path);

        if (!this.endpoints[regExp]) {
            this.endpoints[regExp] = {};
        }

        const endpoint = this.endpoints[regExp];

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

    public delete(path: string, handler: HandlerFn) {
        this.request(HttpMethod.Delete, path, handler);
    }

    public getEndpoints(): Endpoints {
        return this.endpoints;
    }

    public matchPath(method: string, path: string): MatchedRouteResult {
        const endpoints = this.getEndpoints();
        const regexMatchesPaths = Object.keys(endpoints);

        for (const regexMatchesPath of regexMatchesPaths) {
            const regex = new RegExp(regexMatchesPath);
            const matches = regex.exec(path);

            if (!matches) {
                continue;
            }

            const endpoint = endpoints[regexMatchesPath];
            assertNonNullish(endpoint, 'Endpoint must not be nullish.');

            const handler = endpoint[method];
            assertNonNullish(handler, 'Handler must not be nullish.');

            return {
                handler,
                placeholderValues: matches.groups,
            };
        }

        return null;
    }
}

export { Router, HandlerFn };
