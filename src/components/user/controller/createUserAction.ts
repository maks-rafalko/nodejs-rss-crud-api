import { constants as httpConstants } from 'node:http2';
import { Request } from '../../../framework/Request';
import { Response } from '../../../framework/Response';
import { HandlerFn } from '../../../framework/Router';
import { userRepository } from '../userRepository';
import { validateEntity } from '../../../framework/validator';
import { User } from '../userEntity';
import { CreateUserDto, validationRules } from '../createUserDto';

const createUser: HandlerFn = (request: Request, response: Response): void => {
    const newUserDto = request.getJsonBody() as CreateUserDto;

    validateEntity(newUserDto, validationRules);

    const user = User.fromDto(newUserDto);
    userRepository.create(user);

    response.json(user, httpConstants.HTTP_STATUS_CREATED);
};

export { createUser };
