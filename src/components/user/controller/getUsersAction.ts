import { Request } from '../../../framework/http/Request';
import { Response } from '../../../framework/http/Response';
import { ActionHandler } from '../../../framework/http/Router';
import { userRepository } from '../userRepository';

const getUsers: ActionHandler = async (_: Request, response: Response): Promise<void> => {
    const users = await userRepository.findAll();

    response.json(users);
};

export { getUsers };
