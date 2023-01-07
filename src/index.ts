import * as dotenv from 'dotenv';
import { assertNonNullish } from './framework/asserts';
import { getOptionValueFromArgv } from './framework/commandLineParser';
import { parseIntRadix10 } from './framework/utils';
import { listenMultiNodeApplication } from './framework/multiNodeApplicationCreator';
import { listenSingleNodeApplication } from './framework/singleNodeApplicationCreator';

dotenv.config();

const isMultiNodeMode = getOptionValueFromArgv('--multi-node') ?? false;

assertNonNullish(process.env['API_PORT'], 'Port must be a number.');

const port = parseIntRadix10(process.env['API_PORT']);

if (isMultiNodeMode) {
    listenMultiNodeApplication(port);
} else {
    listenSingleNodeApplication(port);
}
