import { Application } from './Application';
import { userRouter } from '../components/user/userRouter';

const createSingleNodeApplication = (): Application => {
    const app = new Application();

    app.addRouter(userRouter);

    return app;
};

const listenSingleNodeApplication = (port: number): void => {
    createSingleNodeApplication().listen(port);
};

export { createSingleNodeApplication, listenSingleNodeApplication };
