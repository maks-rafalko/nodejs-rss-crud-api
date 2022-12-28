import { constants as httpConstants } from 'node:http2';
import { HandlerFn } from '../../../framework/Router';
import { Request } from '../../../framework/Request';
import { Response } from '../../../framework/Response';
import { userRepository } from '../userRepository';
import { assertValidUuid } from '../../../asserts';

const deleteUser: HandlerFn = (request: Request, response: Response): void => {
    const { id } = request.getPlaceholderValues();

    assertValidUuid(id);

    if (!userRepository.findById(id)) {
        response.json({ message: 'User not found.' }, httpConstants.HTTP_STATUS_NOT_FOUND);
        return;
    }

    userRepository.delete(id);

    response.statusCode = httpConstants.HTTP_STATUS_NO_CONTENT;
    response.end();
};

export { deleteUser };
