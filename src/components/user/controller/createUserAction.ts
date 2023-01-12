import { constants as httpConstants } from 'node:http2';
import { Request } from '../../../framework/http/Request';
import { Response } from '../../../framework/http/Response';
import { ActionHandler } from '../../../framework/http/Router';
import { userRepository } from '../userRepository';
import { validateModel } from '../../../framework/validator';
import { User } from '../userEntity';
import { CreateUserDto, validationRules } from '../userDto';

const createUser: ActionHandler = async (request: Request, response: Response): Promise<void> => {
    const newUserDto = request.getJsonBody();

    validateModel<CreateUserDto>(newUserDto, validationRules);

    const user = User.fromDto(newUserDto);
    await userRepository.create(user);

    response.json(user, httpConstants.HTTP_STATUS_CREATED);
};

export { createUser };
