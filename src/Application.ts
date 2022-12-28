import http from 'node:http';
import { constants as httpConstants } from 'node:http2';
import { assertNonNullish } from './asserts';
import { Router } from './framework/Router';
import { Response } from './framework/Response';
import { Request } from './framework/Request';
import { RouteNotMatchedError } from './error/RouteNotMatchedError';
import { ValidationError } from './error/ValidationError';
import { BadRequestError } from './error/BadRequestError';
import { PropertyValidationError } from './framework/validator/PropertyValidationError';

class Application {
    private routers: Router[] = [];

    public listen(port: number, baseUrl: string = 'http://localhost'): void {
        const server = this.createServer(baseUrl);

        server.listen(port);
    }

    public addRouter(router: Router): void {
        this.routers.push(router);
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
                            try {
                                const parsedBody = Buffer.concat(bodyChunks).toString();
                                request.setBody(parsedBody);

                                const { method, url } = request;
                                assertNonNullish(method, 'Method must not be nullish.');
                                assertNonNullish(url, 'URL must not be nullish.');

                                const parsedUrl = new URL(url, baseUrl);
                                request.setQueryParameters(parsedUrl.searchParams);

                                this.executeMatchedHandler(request, response, method, parsedUrl.pathname);
                            } catch (error) {
                                if (error instanceof RouteNotMatchedError) {
                                    response.json({ message: 'Not Found.' }, httpConstants.HTTP_STATUS_NOT_FOUND);
                                } else if (error instanceof ValidationError) {
                                    response.json({
                                        violations: error.getErrors().map((validationError: PropertyValidationError) => ({
                                            property: validationError.getProperty(),
                                            message: validationError.getMessage(),
                                        })),
                                    }, httpConstants.HTTP_STATUS_BAD_REQUEST);
                                } else if (error instanceof BadRequestError) {
                                    response.json({ message: error.message }, httpConstants.HTTP_STATUS_BAD_REQUEST);
                                } else if (error instanceof SyntaxError) {
                                    response.json({ message: 'Invalid JSON.' }, httpConstants.HTTP_STATUS_BAD_REQUEST);
                                } else {
                                    throw error;
                                }
                            }
                        });
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

export { Application };
