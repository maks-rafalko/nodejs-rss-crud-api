import { ServerResponse, IncomingMessage } from 'node:http';
import { constants as httpConstants } from 'node:http2';

class Response<Request extends IncomingMessage = IncomingMessage> extends ServerResponse<Request> {
    public json(data: object | string, statusCode: number = httpConstants.HTTP_STATUS_OK): void {
        this.writeHead(statusCode, {
            'Content-Type': 'application/json',
        });

        const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

        this.end(jsonString);
    }
}

export { Response };
