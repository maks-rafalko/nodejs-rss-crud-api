import * as dotenv from 'dotenv';
import { assertNonNullish } from './asserts';
import { createApplication } from './Application';

const RADIX = 10;

dotenv.config();

assertNonNullish(process.env['PUBLISHING_PORT'], 'Port must be a number.');

// todo add dev/prod error handling

const app = createApplication();

app.listen(parseInt(process.env['PUBLISHING_PORT'], RADIX));
