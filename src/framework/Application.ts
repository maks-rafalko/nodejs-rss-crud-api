import http from 'node:http';
import { assertNonNullish } from './asserts';
import { Router } from './http/Router';
import { Response } from './http/Response';
import { Request } from './http/Request';
import { RouteNotMatchedError } from './error/RouteNotMatchedError';
import { handleException } from './exceptionHandler';
import { HttpMethod } from './http/HttpMethodEnum';

const resolveBody = async (request: Request): Promise<string> => {
    const bodyChunks: Uint8Array[] = [];

    for await (const chunk of request) {
        bodyChunks.push(chunk);
    }

    return Buffer.concat(bodyChunks).toString();
};

class Application {
    private routers: Router[] = [];

    public listen(port: number, baseUrl: string = 'http://localhost'): void {
        const server = this.createServer(baseUrl);

        server.listen(port);
    }

    public addRouter(router: Router): void {
        this.routers.push(router);
    }

    public createServer(baseUrl: string): http.Server {
        return http
            .createServer(
                {
                    IncomingMessage: Request,
                    ServerResponse: Response,
                },
                async (request: Request, response: Response) => {
                    try {
                        const rawBody = await resolveBody(request);
                        request.setBody(rawBody);

                        const { method, url } = request;
                        assertNonNullish(method, 'Method must not be nullish.');
                        assertNonNullish(url, 'URL must not be nullish.');

                        const parsedUrl = new URL(url, baseUrl);
                        request.setQueryParameters(parsedUrl.searchParams);

                        await this.executeMatchedHandler(request, response, method as HttpMethod, parsedUrl.pathname);
                    } catch (error) {
                        handleException(error as Error, response);
                    }
                },
            );
    }

    private async executeMatchedHandler(request: Request, response: Response, method: HttpMethod, path: string): Promise<void> {
        for (const router of this.routers) {
            const matchedUrl = router.matchPath(method, path);

            if (matchedUrl === null) {
                continue;
            }

            const { handler, placeholderValues } = matchedUrl;

            if (placeholderValues !== undefined) {
                request.setPlaceholderValues(placeholderValues);
            }

            // @ts-ignore: This is a valid call.
            await handler(request, response);
            return;
        }

        throw new RouteNotMatchedError();
    }
}

export { Application };
