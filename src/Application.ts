import { EventEmitter } from 'node:events';
import http from 'node:http';
import { constants as httpConstants } from 'node:http2';
import { assertNonNullish } from './asserts';
import { Router } from './Router';
import { Response } from './Response';
import { Request } from './Request';

function getEventName(method: string, path: string): string {
    return `${method}:${path}`;
}

class Application {
    private readonly emitter;

    constructor() {
        this.emitter = new EventEmitter();
    }

    public listen(port: number, baseUrl: string = 'http://localhost'): void {
        const server = this.createServer(baseUrl);

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

                this.emitter.on(getEventName(method, path), handler);
            });
        });
    }

    private createServer(baseUrl: string): http.Server {
        return http
            .createServer(
                {
                    IncomingMessage: Request,
                    ServerResponse: Response,
                },
                (request: Request, response: Response) => {
                    const bodyChunks: Uint8Array[] = [];

                    request
                        .on('data', (chunk: Uint8Array) => {
                            bodyChunks.push(chunk);
                        })
                        .on('end', () => {
                            const { method, url } = request;
                            const parsedBody = Buffer.concat(bodyChunks).toString();
                            request.setBody(parsedBody);

                            assertNonNullish(method, 'Method must not be nullish.');
                            assertNonNullish(url, 'URL must not be nullish.');

                            const parsedUrl = new URL(url, baseUrl);
                            request.setQueryParameters(parsedUrl.searchParams);

                            const isHandled = this.emitter.emit(getEventName(method, parsedUrl.pathname), request, response);

                            if (!isHandled) {
                                response.statusCode = httpConstants.HTTP_STATUS_NOT_FOUND;
                                response.end();
                            }
                        });
                },
            );
    }
}

export { Application };
