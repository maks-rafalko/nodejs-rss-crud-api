import http from 'node:http';
import { assertNonNullish } from './asserts';
import { Router } from './framework/Router';
import { Response } from './framework/Response';
import { Request } from './framework/Request';
import { RouteNotMatchedError } from './error/RouteNotMatchedError';
import { userRouter } from './userRouter';
import { handleException } from './framework/exceptionHandler';

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

                        this.executeMatchedHandler(request, response, method, parsedUrl.pathname);
                    } catch (error) {
                        handleException(error as Error, response);
                    }
                },
            );
    }

    private executeMatchedHandler(request: Request, response: Response, method: string, path: string): void {
        for (const router of this.routers) {
            const matchedUrl = router.matchPath(method, path);

            if (matchedUrl === null) {
                continue;
            }

            const { handler, placeholderValues } = matchedUrl;

            if (placeholderValues !== undefined) {
                request.setPlaceholderValues(placeholderValues);
            }

            handler(request, response);

            return;
        }

        throw new RouteNotMatchedError();
    }
}

const resolveBody = async (request: Request): Promise<string> => {
    const bodyChunks: Uint8Array[] = [];

    for await (const chunk of request) {
        bodyChunks.push(chunk);
    }

    return Buffer.concat(bodyChunks).toString();
}

const createApplication = (): Application => {
    const app = new Application();

    app.addRouter(userRouter);

    return app;
};

export { createApplication };
