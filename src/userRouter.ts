import { Router } from './Router';
import { Response } from './Response';
import { Request } from './Request';

const userRouter = new Router();
const users: object[] = [{ name: 'Ivan' }, { name: 'Nick' }];

userRouter.get('/users', (_: Request, response: Response): void => {
    response.json(users);
});

userRouter.post('/users', (request: Request, response: Response): void => {
    const newUser = request.getJsonBody();

    users.push(newUser);

    response.json(newUser);
});

export { userRouter };
