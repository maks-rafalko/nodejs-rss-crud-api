import { ValidationRule } from '../../framework/validator';
import { Type } from '../../framework/validator/rules/Type';
import { ArrayItemRules } from '../../framework/validator/rules/ArrayItemRules';
import { IsRequired } from '../../framework/validator/rules/IsRequired';

type CreateUserDto = {
    username: string;
    age: number;
    hobbies: string[];
};

const validationRules: Record<keyof CreateUserDto, ValidationRule[]> = {
    username: [new IsRequired(), new Type('string')],
    age: [new IsRequired(), new Type('number')],
    hobbies: [
        new IsRequired(),
        new ArrayItemRules([
            new Type('string'),
        ]),
    ],
};

export { CreateUserDto, validationRules };
