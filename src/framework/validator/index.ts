import { ValidationError } from '../error/ValidationError';
import { PropertyValidationError } from './PropertyValidationError';

interface ValidationRule {
    validateProperty: (propertyName: string, propertyValue: any) => PropertyValidationError[];
}

const validateProperty = (
    propertyName: string,
    propertyValue: any,
    propertyValidationRules: ValidationRule[],
): PropertyValidationError[] => {
    let errors: PropertyValidationError[] = [];

    for (const validationRule of propertyValidationRules) {
        const ruleErrors = validationRule.validateProperty(propertyName, propertyValue);

        if (ruleErrors.length > 0) {
            errors = errors.concat(ruleErrors);
            // stop after finding the first error
            break;
        }
    }

    return errors;
};

function checkModelHasNoExtraKeys(model: Record<string, any>, validationSchema: Record<string, ValidationRule[]>): void {
    const modelKeys = Object.keys(model);
    const validationSchemaKeys = Object.keys(validationSchema);
    const extraKeys = modelKeys.filter((key) => !validationSchemaKeys.includes(key));

    if (extraKeys.length > 0) {
        throw new ValidationError(
            [new PropertyValidationError('__root__', `Model has extra keys: ${extraKeys.join(', ')}.`)],
        );
    }
}

function validateModel<TClass extends Record<string, any>>(
    model: Record<string, any>,
    validationSchema: Record<string, ValidationRule[]>,
): asserts model is TClass {
    checkModelHasNoExtraKeys(model, validationSchema);

    let errors: PropertyValidationError[] = [];

    for (const [property, propertyValidationRules] of Object.entries(validationSchema)) {
        const propertyErrors = validateProperty(property, model[property], propertyValidationRules);

        if (propertyErrors.length > 0) {
            errors = errors.concat(propertyErrors);
        }
    }

    if (errors.length > 0) {
        throw new ValidationError(errors);
    }
}

export { validateModel, ValidationRule };
