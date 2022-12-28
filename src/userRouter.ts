import { Router } from './framework/Router';
import { getUsers } from './components/user/controller/getUsersAction';
import { createUser } from './components/user/controller/createUserAction';
import { deleteUser } from './components/user/controller/deleteUserAction';
import { getUser } from './components/user/controller/getUserAction';

const userRouter = new Router();

userRouter.get('/api/users/:id', getUser);
userRouter.get('/api/users', getUsers);
userRouter.post('/api/users', createUser);
userRouter.delete('/api/users/:id', deleteUser);

export { userRouter };
