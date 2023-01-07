import * as dotenv from 'dotenv';
import { assertNonNullish } from './framework/asserts';
import { NOT_MEANINGFUL_ARG_COUNT, parseCommandLineArguments } from './framework/commandParser';
import { parseIntRadix10 } from './framework/utils';
import { listenMultiNodeApplication } from './framework/multiNodeApplicationCreator';
import { listenSingleNodeApplication } from './framework/singleNodeApplicationCreator';

dotenv.config();

const meaningfulArgs = process.argv.slice(NOT_MEANINGFUL_ARG_COUNT);
const optionsWithValues = parseCommandLineArguments(meaningfulArgs);
const isMultiNodeMode = optionsWithValues.options['--multi-node'] ?? false;

assertNonNullish(process.env['API_PORT'], 'Port must be a number.');

const port = parseIntRadix10(process.env['API_PORT']);

if (isMultiNodeMode) {
    listenMultiNodeApplication(port);
} else {
    listenSingleNodeApplication(port);
}
