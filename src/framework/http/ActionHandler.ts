import { Request } from './Request';
import { Response } from './Response';

type ActionHandler = (request: Request, response: Response) => void;

export { ActionHandler };
