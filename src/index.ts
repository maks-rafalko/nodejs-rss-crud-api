import * as dotenv from 'dotenv';
import { assertNonNullish } from './framework/asserts';
import { NOT_MEANINGFUL_ARG_COUNT, parseCommandLineArguments } from './framework/commandParser';
import { parseIntRadix10 } from './framework/utils';
import { createApplication, createMultiNodeApplication } from './framework/applicationCreator';

dotenv.config();

const meaningfulArgs = process.argv.slice(NOT_MEANINGFUL_ARG_COUNT);
const optionsWithValues = parseCommandLineArguments(meaningfulArgs);
const isMultiNode = optionsWithValues.options['--multi-node'] ?? false;

assertNonNullish(process.env['API_PORT'], 'Port must be a number.');

const port = parseIntRadix10(process.env['API_PORT']);

if (isMultiNode) {
    createMultiNodeApplication(port);
} else {
    createApplication().listen(port);
}
