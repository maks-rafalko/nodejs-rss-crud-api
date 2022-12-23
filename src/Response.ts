import { ServerResponse, IncomingMessage } from 'node:http';
import { constants as httpConstants } from 'node:http2';

export class Response<Request extends IncomingMessage = IncomingMessage> extends ServerResponse<Request> {
    public json(data: object, statusCode: number = httpConstants.HTTP_STATUS_OK): void {
        this.writeHead(statusCode, {
            'Content-Type': 'application/json',
        });

        this.end(JSON.stringify(data));
    }
}

export default Response;