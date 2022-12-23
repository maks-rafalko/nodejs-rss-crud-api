import http from 'node:http';
import { Router } from './Router';
import { Response } from './Response';

const userRouter = new Router();
const users = [{ name: 'Ivan' }, { name: 'Nick' }];

userRouter.get('/users', (_: http.IncomingMessage, response: Response): void => {
    response.json(users);
});

userRouter.post('/users', (_: http.IncomingMessage, response: Response): void => {
    // todo get it from the request body
    const newUser = { name: 'New User' };

    users.push(newUser);

    response.json(newUser);
});

export { userRouter };
