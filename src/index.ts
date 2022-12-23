import * as dotenv from 'dotenv';
import {assertNonNullish} from './asserts';
import Application from './Application';
import {userRouter} from './userRouter';

dotenv.config();

assertNonNullish(process.env['PUBLISHING_PORT'], 'Port must be a number.');

// todo add dev/prod error handling

const app = new Application();
app.addRouter(userRouter);
app.listen(parseInt(process.env['PUBLISHING_PORT']));
