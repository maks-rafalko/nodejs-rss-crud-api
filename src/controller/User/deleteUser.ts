import { constants as httpConstants } from 'node:http2';
import { HandlerFn } from '../../Router';
import { Request } from '../../Request';
import { Response } from '../../Response';

const deleteUser: HandlerFn = (_request: Request, response: Response): void => {
    response.statusCode = httpConstants.HTTP_STATUS_NO_CONTENT;
    response.end();
};

export { deleteUser };
