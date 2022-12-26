import { Request } from '../../Request';
import { Response } from '../../Response';
import { HandlerFn } from '../../Router';

const createUser: HandlerFn = (request: Request, response: Response): void => {
    const newUser = request.getJsonBody();

    // users.push(newUser);

    response.json(newUser);
};

export { createUser };
