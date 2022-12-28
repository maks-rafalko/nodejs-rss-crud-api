import { Request } from '../../../framework/Request';
import { Response } from '../../../framework/Response';
import { HandlerFn } from '../../../framework/Router';
import { userRepository } from '../userRepository';

const getUsers: HandlerFn = (_: Request, response: Response): void => {
    const users = userRepository.findAll();

    response.json(users);
};

export { getUsers };
