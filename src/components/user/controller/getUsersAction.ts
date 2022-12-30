import { Request } from '../../../framework/Request';
import { Response } from '../../../framework/Response';
import { HandlerFn } from '../../../framework/Router';
import { userRepository } from '../userRepository';

const getUsers: HandlerFn = async (_: Request, response: Response): Promise<void> => {
    const users = await userRepository.findAll();

    response.json(users);
};

export { getUsers };
