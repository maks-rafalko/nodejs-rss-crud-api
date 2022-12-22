import * as http from 'node:http';
import * as dotenv from 'dotenv';
import { EventEmitter } from 'node:events';

dotenv.config();

const emitter = new EventEmitter();

// todo add dev/prod error handling
// todo add typescript config

type HandlerFn = (request: http.IncomingMessage, response: http.ServerResponse) => void;

type Endpoint = {
    [method: string]: HandlerFn
}

type Endpoints = {
    [path: string]: Endpoint;
}

class Router {
    private readonly endpoints: Endpoints = {};

    constructor() {
        this.endpoints = {};
    }

    public request(method: string, path: string, handler: HandlerFn) {
        if (!this.endpoints.hasOwnProperty(path)) {
            this.endpoints[path] = {};
        }

        const endpoint = this.endpoints[path]!;

        if (endpoint.hasOwnProperty(method)) {
            throw new Error(`Handler for ${method} ${path} has already been declared`);
        }

        endpoint[method] = handler;

        emitter.on(`${method}:${path}`, handler);
    }
}

const router = new Router();

// todo do not use magic strings
router.request('GET', '/users', (_: http.IncomingMessage, response: http.ServerResponse): void => {
    response.end(JSON.stringify([{name: 'Ivan'}, {name: 'Nick'}]))
});

http
    .createServer((request, response) => {
        response.writeHead(200, {
            'Content-Type': 'application/json',
        });

        const isHandled = emitter.emit(`${request.method}:${request.url}`, request, response);

        if (!isHandled) {
            // todo add 404 status code
            response.end()
        }
    })
    .listen(process.env['PUBLISHING_PORT']);