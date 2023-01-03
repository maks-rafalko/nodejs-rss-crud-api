import { PropertyValidationError } from '../validator/PropertyValidationError';

class ValidationError extends Error {
    private readonly errors: PropertyValidationError[];

    constructor(errors: PropertyValidationError[]) {
        super('Validation error happened.');
        this.name = 'ValidationError';

        this.errors = errors;
    }

    public getErrors(): PropertyValidationError[] {
        return this.errors;
    }
}

export { ValidationError };
