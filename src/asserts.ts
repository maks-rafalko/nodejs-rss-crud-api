import { validate as validateUuid } from 'uuid';
import { BadRequestError } from './error/BadRequestError';

function assertNonNullish<TValue>(value: TValue, message: string): asserts value is NonNullable<TValue> {
    if (value === null || value === undefined) {
        throw new Error(message);
    }
}

function assertValidUuid(value: any): asserts value is string {
    if (!validateUuid(value)) {
        throw new BadRequestError('Invalid UUID.');
    }
}

export {
    assertNonNullish,
    assertValidUuid,
};
