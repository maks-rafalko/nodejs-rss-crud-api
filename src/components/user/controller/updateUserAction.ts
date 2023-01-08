import { constants as httpConstants } from 'node:http2';
import { Request } from '../../../framework/http/Request';
import { Response } from '../../../framework/http/Response';
import { ActionHandler } from '../../../framework/http/Router';
import { userRepository } from '../userRepository';
import { validateModel } from '../../../framework/validator';
import { UpdateUserDto, validationRules } from '../userDto';
import { assertValidUuid } from '../../../framework/asserts';
import { USER_NOT_FOUND } from '../exceptionMessages';

const updateUser: ActionHandler = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.getPlaceholderValues();

    assertValidUuid(id);

    const user = await userRepository.findById(id);

    if (!user) {
        response.json({ message: USER_NOT_FOUND }, httpConstants.HTTP_STATUS_NOT_FOUND);
        return;
    }
    const updatedUserDto = request.getJsonBody();

    validateModel<UpdateUserDto>(updatedUserDto, validationRules);

    const updatedUser = await userRepository.update(id, updatedUserDto);

    response.json(updatedUser, httpConstants.HTTP_STATUS_OK);
};

export { updateUser };
