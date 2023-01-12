import * as dotenv from 'dotenv';
import { assertNonNullish } from './framework/asserts';
import { getOptionValueFromArgv } from './framework/commandLineParser';
import { listenMultiNodeApplication } from './framework/multiNodeApplicationCreator';
import { listenSingleNodeApplication } from './framework/singleNodeApplicationCreator';
import { parseInt } from './framework/extended-functions-api/parseIntRadix10';

dotenv.config();

const isMultiNodeMode = getOptionValueFromArgv('--multi-node') ?? false;

assertNonNullish(process.env['API_PORT'], 'Port must be a number.');

const port = parseInt(process.env['API_PORT']);

if (isMultiNodeMode) {
    listenMultiNodeApplication(port);
} else {
    listenSingleNodeApplication(port);
}
