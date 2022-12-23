import { IncomingMessage } from 'node:http';
import { URLSearchParams } from 'url';

class Request extends IncomingMessage {
    private body: string | undefined;

    private queryParameters: URLSearchParams | null = null;

    public getBody(): string | undefined {
        return this.body;
    }

    public setBody(body: string | undefined): void {
        this.body = body;
    }

    public getJsonBody(): object {
        if (this.body) {
            return JSON.parse(this.body);
        }

        throw new Error('Body is not set and can not be parsed to JSON.');
    }

    public getQueryParameters(): URLSearchParams | null {
        return this.queryParameters;
    }

    public setQueryParameters(parameters: URLSearchParams) {
        this.queryParameters = parameters;
    }
}

export { Request };
