import { constants as httpConstants } from 'node:http2';
import { HandlerFn } from '../../../framework/Router';
import { Request } from '../../../framework/Request';
import { Response } from '../../../framework/Response';
import { userRepository } from '../userRepository';
import { assertValidUuid } from '../../../asserts';

const getUser: HandlerFn = (request: Request, response: Response): void => {
    const { id } = request.getPlaceholderValues();

    assertValidUuid(id);

    const user = userRepository.findById(id);

    if (!user) {
        response.json({ message: 'User not found.' }, httpConstants.HTTP_STATUS_NOT_FOUND);
        return;
    }

    response.json(JSON.stringify(user));
};

export { getUser };
