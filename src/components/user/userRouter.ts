import { Router } from '../../framework/Router';
import { getUsers } from './controller/getUsersAction';
import { createUser } from './controller/createUserAction';
import { deleteUser } from './controller/deleteUserAction';
import { getUser } from './controller/getUserAction';
import { updateUser } from './controller/updateUserAction';

const userRouter = new Router();

userRouter.get('/api/users/:id', getUser);
userRouter.get('/api/users', getUsers);
userRouter.post('/api/users', createUser);
userRouter.delete('/api/users/:id', deleteUser);
userRouter.put('/api/users/:id', updateUser);

export { userRouter };
