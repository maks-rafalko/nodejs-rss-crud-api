import { constants as httpConstants } from 'node:http2';
import { HandlerFn } from '../../../framework/Router';
import { Request } from '../../../framework/Request';
import { Response } from '../../../framework/Response';
import { userRepository } from '../userRepository';
import { assertValidUuid } from '../../../asserts';

const deleteUser: HandlerFn = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.getPlaceholderValues();

    assertValidUuid(id);

    const user = await userRepository.findById(id);

    if (!user) {
        response.json({ message: 'User not found.' }, httpConstants.HTTP_STATUS_NOT_FOUND);
        return;
    }

    await userRepository.delete(id);

    response.statusCode = httpConstants.HTTP_STATUS_NO_CONTENT;
    response.end();
};

export { deleteUser };
