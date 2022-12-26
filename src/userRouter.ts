import { Router } from './Router';
import { getUsers } from './controller/User/getUsersAction';
import { createUser } from './controller/User/createUserAction';
import { deleteUser } from './controller/User/deleteUser';

const userRouter = new Router();

userRouter.get('/api/users', getUsers);

userRouter.post('/api/users', createUser);

userRouter.delete('/api/users/:id', deleteUser);

export { userRouter };
