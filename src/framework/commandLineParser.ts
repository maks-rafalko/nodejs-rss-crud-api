import { assertNonNullish } from './asserts';

const NOT_MEANINGFUL_ARG_COUNT = 2;

type ParsedCommandLine = {
    arguments: string[],
    options: Record<string, string | boolean>
};

/**
 * Examples of `meaningfulArguments`:
 *   ['some path/dir', --option', 'John', '--username=Nick', '--EOL']
 *
 * Example of returned parsed object:
 *  {
 *      options: {
 *          '--option': 'John',
 *          '--username': 'Nick',
 *          '--EOL': true,
 *      },
 *      arguments: ['some path/dir'],
 *  }
 */
const parseCommandLineArguments = (meaningfulArguments: string[]) => {
    const parsedCommandLine: ParsedCommandLine = {
        arguments: [],
        options: {},
    };
    let previousOption = null;

    for (const currentArgument of meaningfulArguments) {
        if (currentArgument.startsWith('--')) {
            const isOptionWithEqualSignSyntax = currentArgument.includes('=');

            if (isOptionWithEqualSignSyntax) {
                const parts = currentArgument.split('=');
                assertNonNullish(parts[0], 'part[0] name must not be nullish.');
                assertNonNullish(parts[1], 'part[0] name must not be nullish.');

                parsedCommandLine.options[parts[0]] = parts[1];

                continue;
            }

            if (previousOption !== null) {
                parsedCommandLine.options[previousOption] = true;
            }

            previousOption = currentArgument;
        } else if (previousOption !== null) {
            parsedCommandLine.options[previousOption] = currentArgument;
            previousOption = null;
        } else {
            parsedCommandLine.arguments.push(currentArgument);
        }
    }

    if (previousOption !== null) {
        parsedCommandLine.options[previousOption] = true;
    }

    return parsedCommandLine;
};

const getOptionValueFromArgv = (optionName: string): string | boolean | undefined => {
    const meaningfulArgs = process.argv.slice(NOT_MEANINGFUL_ARG_COUNT);
    const optionsWithValues = parseCommandLineArguments(meaningfulArgs);

    return optionsWithValues.options[optionName];
};

export { getOptionValueFromArgv };
