import { ValidationRule } from '../index';
import { PropertyValidationError } from '../PropertyValidationError';

class ArrayItemRules implements ValidationRule {
    private readonly rules: ValidationRule[];

    constructor(rules: ValidationRule[]) {
        this.rules = rules;
    }

    validateProperty(propertyName: string, propertyValue: any): PropertyValidationError[] {
        if (!Array.isArray(propertyValue)) {
            return [new PropertyValidationError(propertyName, `Property ${propertyName} must be an array.`)];
        }

        let errors: PropertyValidationError[] = [];

        for (let i = 0; i < propertyValue.length; i += 1) {
            for (const rule of this.rules) {
                const ruleErrors = rule.validateProperty(`${propertyName}[${i}]`, propertyValue[i]);

                if (ruleErrors.length > 0) {
                    errors = errors.concat(ruleErrors);
                }
            }
        }

        return errors;
    }
}

export { ArrayItemRules };
