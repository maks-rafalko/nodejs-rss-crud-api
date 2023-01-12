import { validate as validateUuid } from 'uuid';
import { HttpBadRequestError } from './error/HttpBadRequestError';

function assertNonNullish<TValue>(value: TValue, message: string): asserts value is NonNullable<TValue> {
    if (value === null || value === undefined) {
        throw new Error(message);
    }
}

function assertValidUuid(value: any): asserts value is string {
    if (!validateUuid(value)) {
        throw new HttpBadRequestError('Invalid UUID.');
    }
}

export {
    assertNonNullish,
    assertValidUuid,
};
