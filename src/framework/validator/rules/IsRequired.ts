import { ValidationRule } from '../index';
import { PropertyValidationError } from '../PropertyValidationError';

class IsRequired implements ValidationRule {
    // eslint-disable-next-line class-methods-use-this
    validateProperty(propertyName: string, propertyValue: any): PropertyValidationError[] {
        if (propertyValue === undefined || propertyValue === null) {
            return [new PropertyValidationError(propertyName, `Property ${propertyName} is required.`)];
        }

        return [];
    }
}

export { IsRequired };
