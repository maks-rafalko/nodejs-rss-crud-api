import { EventEmitter } from 'node:events';
import http from 'node:http';
import { assertNonNullish } from './asserts';
import { Router } from './Router';
import { Response } from './Response';

class Application {
    private readonly emitter;

    constructor() {
        this.emitter = new EventEmitter();
    }

    public listen(port: number): void {
        const server = this.createServer();

        server.listen(port);
    }

    public addRouter(router: Router): void {
        const endpoints = router.getEndpoints();

        Object.keys(endpoints).forEach((path) => {
            const endpoint = endpoints[path];
            assertNonNullish(endpoint, 'Endpoint must not be nullish.');

            Object.keys(endpoint).forEach((method) => {
                const handler = endpoint[method];
                assertNonNullish(handler, 'Handler must not be nullish.');

                this.emitter.on(`${method}:${path}`, handler);
            });
        });
    }

    private createServer(): http.Server {
        return http
            .createServer(
                {
                    ServerResponse: Response,
                },
                (request, response) => {
                    const { method, url } = request;

                    assertNonNullish(method, 'Method must not be nullish.');
                    assertNonNullish(url, 'URL must not be nullish.');

                    const isHandled = this.emitter.emit(`${method}:${url}`, request, response);

                    if (!isHandled) {
                        // todo add 404 status code
                        response.end();
                    }
                },
            );
    }
}

export { Application };
