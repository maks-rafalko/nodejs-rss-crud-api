import { Request } from '../../Request';
import { Response } from '../../Response';
import { HandlerFn } from '../../Router';

const users: object[] = [{ name: 'Ivan' }, { name: 'Nick' }];

const getUsers: HandlerFn = (_: Request, response: Response): void => {
    response.json(users);
};

export { getUsers };
