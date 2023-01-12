import { ValidationRule } from '../index';
import { PropertyValidationError } from '../PropertyValidationError';

class Type implements ValidationRule {
    private readonly type: string;

    constructor(type: string) {
        this.type = type;
    }

    validateProperty(propertyName: string, propertyValue: any): PropertyValidationError[] {
        if (typeof propertyValue !== this.type) {
            return [new PropertyValidationError(propertyName, `Property ${propertyName} must be of type ${this.type}.`)];
        }

        return [];
    }
}

export { Type };
