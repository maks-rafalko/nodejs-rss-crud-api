import * as dotenv from 'dotenv';
import { assertNonNullish } from './asserts';
import { NOT_MEANINGFUL_ARG_COUNT, parseCommandLineArguments } from './framework/commandParser';
import { parseIntRadix10 } from './utils';
import { createApplication, createMultiNodeApplication } from './applicationCreator';

dotenv.config();

const meaningfulArgs = process.argv.slice(NOT_MEANINGFUL_ARG_COUNT);
const optionsWithValues = parseCommandLineArguments(meaningfulArgs);
const isMultiNode = optionsWithValues.options['--multi-node'] ?? false;

assertNonNullish(process.env['PUBLISHING_PORT'], 'Port must be a number.');

const port = parseIntRadix10(process.env['PUBLISHING_PORT']);

// todo add dev/prod error handling

if (isMultiNode) {
    createMultiNodeApplication(port);
} else {
    createApplication().listen(port);
}
