import { constants as httpConstants } from 'node:http2';
import { ActionHandler } from '../../../framework/http/Router';
import { Request } from '../../../framework/http/Request';
import { Response } from '../../../framework/http/Response';
import { userRepository } from '../userRepository';
import { assertValidUuid } from '../../../framework/asserts';
import { USER_NOT_FOUND } from '../exceptionMessages';

const getUser: ActionHandler = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.getPlaceholderValues();

    assertValidUuid(id);

    const user = await userRepository.findById(id);

    if (!user) {
        response.json({ message: USER_NOT_FOUND }, httpConstants.HTTP_STATUS_NOT_FOUND);
        return;
    }

    response.json(JSON.stringify(user));
};

export { getUser };
