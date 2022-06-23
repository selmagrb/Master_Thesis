import { AzureFunction, Context, HttpRequest } from "@azure/functions"

/**
 * This function should either trigger a 200 Success or 400 Bad Request depending on the error flag in the request params.
 * @param context 
 * @param req {error: boolean}
 */
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const error = req.query.error === 'true' ?? false;
    context.log(`[Incoming Request] Request to Error Function with Parameters: {error: ${error}}`);

    context.res = {
       status: error ? 400 : 200,
        body: error ? 'Bad Request' : 'OK'
    };



};

export default httpTrigger;