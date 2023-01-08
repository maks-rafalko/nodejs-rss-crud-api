import { assertNonNullish } from '../asserts';
import { pathToRegExp } from '../pathToRegex';
import { HttpMethodNotAllowed } from '../error/HttpMethodNotAllowed';
import { HttpMethod } from './HttpMethodEnum';
import { ActionHandler } from './ActionHandler';

type Endpoint = Record<Partial<HttpMethod>, ActionHandler>;

type Endpoints = Record<string, Endpoint>;

type MatchedRouteResult = { handler: ActionHandler, placeholderValues: Record<string, string> | undefined } | null;

class Router {
    private readonly endpoints: Endpoints = {};

    constructor() {
        this.endpoints = {};
    }

    public get(path: string, handler: ActionHandler) {
        this.request(HttpMethod.Get, path, handler);
    }

    public post(path: string, handler: ActionHandler) {
        this.request(HttpMethod.Post, path, handler);
    }

    public delete(path: string, handler: ActionHandler) {
        this.request(HttpMethod.Delete, path, handler);
    }

    public put(path: string, handler: ActionHandler) {
        this.request(HttpMethod.Put, path, handler);
    }

    public getEndpoints(): Endpoints {
        return this.endpoints;
    }

    public matchPath(method: HttpMethod, path: string): MatchedRouteResult {
        const pathToMatch = path.replace(/\/$/, '');
        const endpoints = this.getEndpoints();
        const regexMatchesPaths = Object.keys(endpoints);

        for (const regexMatchesPath of regexMatchesPaths) {
            const regex = new RegExp(regexMatchesPath);
            const matches = regex.exec(pathToMatch);

            if (!matches) {
                continue;
            }

            const endpoint = endpoints[regexMatchesPath];
            assertNonNullish(endpoint, 'Endpoint must not be nullish.');

            const handler = endpoint[method];

            if (!handler) {
                throw new HttpMethodNotAllowed();
            }

            return {
                handler,
                placeholderValues: matches.groups,
            };
        }

        return null;
    }

    private request(method: HttpMethod, path: string, handler: ActionHandler) {
        const regExp = pathToRegExp(path);

        if (!this.endpoints[regExp]) {
            this.endpoints[regExp] = {} as Endpoint;
        }

        const endpoint = this.endpoints[regExp];

        assertNonNullish(endpoint, 'Endpoint must not be nullish.');

        if (Object.prototype.hasOwnProperty.call(endpoint, method)) {
            throw new Error(`Handler for ${method} ${path} has already been declared`);
        }

        endpoint[method] = handler;
    }
}

export { Router, ActionHandler };
