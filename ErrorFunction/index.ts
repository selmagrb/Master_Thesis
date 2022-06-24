import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getReasonPhrase, getStatusCode, StatusCodes } from "http-status-codes";

/** TODO / IDEA
 * We could use a number as parameter for the function and return the error depending on the number:
 * 400 -> Bad Request
 * 500 -> Internal Server Error
 * else -> 404 Not Found 
 */

/**
 * This function should either trigger a 200 Success or 400 Bad Request depending on the error flag in the request params.
 * @param context 
 * @param req {error: boolean}
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const status: number = parseInt(req.query.status, 10);
    context.log(`[Incoming Request] Request to Error Function with Parameters: {status: ${status}}`);

    if (!status) {
        context.res = {
            status: StatusCodes.BAD_REQUEST,
            body: getReasonPhrase(StatusCodes.BAD_REQUEST) + ' No status given.'
        };
        return;
    }

    let statusCode: StatusCodes;
    try {
        statusCode = StatusCodes[req.query.status];
    } catch (e) {
    }


    if (!statusCode) {
        context.res = {
            status: StatusCodes.NOT_FOUND,
            body: getReasonPhrase(StatusCodes.NOT_FOUND)
        };
        return;
    }

    context.res = {
        status: status,
        body: statusCode
    };

};

export default httpTrigger;