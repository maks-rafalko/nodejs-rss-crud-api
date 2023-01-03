import { constants as httpConstants } from 'node:http2';
import { Request } from '../../../framework/Request';
import { Response } from '../../../framework/Response';
import { HandlerFn } from '../../../framework/Router';
import { userRepository } from '../userRepository';
import { validateModel } from '../../../framework/validator';
import { UpdateUserDto, validationRules } from '../userDto';
import { assertValidUuid } from '../../../asserts';

const updateUser: HandlerFn = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.getPlaceholderValues();

    assertValidUuid(id);

    const user = await userRepository.findById(id);

    if (!user) {
        response.json({ message: 'User not found.' }, httpConstants.HTTP_STATUS_NOT_FOUND);
        return;
    }
    const updatedUserDto = request.getJsonBody();

    validateModel<UpdateUserDto>(updatedUserDto, validationRules);

    const updatedUser = await userRepository.update(id, updatedUserDto);

    response.json(updatedUser, httpConstants.HTTP_STATUS_OK);
};

export { updateUser };
