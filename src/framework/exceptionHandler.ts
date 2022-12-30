import { constants as httpConstants } from 'node:http2';
import { Response } from './Response';
import { RouteNotMatchedError } from '../error/RouteNotMatchedError';
import { ValidationError } from '../error/ValidationError';
import { PropertyValidationError } from './validator/PropertyValidationError';
import { HttpBadRequestError } from '../error/HttpBadRequestError';
import { HttpMethodNotAllowed } from '../error/HttpMethodNotAllowed';

function handleException(error: Error, response: Response) {
    if (error instanceof RouteNotMatchedError) {
        response.json({ message: 'Not Found.' }, httpConstants.HTTP_STATUS_NOT_FOUND);
        return;
    }

    if (error instanceof ValidationError) {
        response.json({
            violations: error.getErrors().map((validationError: PropertyValidationError) => ({
                property: validationError.getProperty(),
                message: validationError.getMessage(),
            })),
        }, httpConstants.HTTP_STATUS_BAD_REQUEST);
        return;
    }

    if (error instanceof HttpBadRequestError) {
        response.json({ message: error.message }, httpConstants.HTTP_STATUS_BAD_REQUEST);
        return;
    }

    if (error instanceof HttpMethodNotAllowed) {
        response.json({ message: error.message }, httpConstants.HTTP_STATUS_METHOD_NOT_ALLOWED);
        return;
    }

    if (error instanceof SyntaxError) {
        response.json({ message: 'Invalid JSON.' }, httpConstants.HTTP_STATUS_BAD_REQUEST);
        return;
    }

    response.json({ message: 'Internal Server Error.' }, httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
}

export { handleException };
