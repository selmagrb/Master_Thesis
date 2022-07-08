import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getReasonPhrase, getStatusCode, StatusCodes } from "http-status-codes";

const appInsights = require('applicationinsights');


appInsights.setup("InstrumentationKey=3856f16c-d446-4a62-8479-1c788cc7dc07;IngestionEndpoint=https://germanywestcentral-0.in.applicationinsights.azure.com/;LiveEndpoint=https://germanywestcentral.livediagnostics.monitor.azure.com/")
    .start();


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


// Default export wrapped with Application Insights FaaS context propagation
export default async function contextPropagatingHttpTrigger(context, req) {
    // Start an AI Correlation Context using the provided Function context
    const correlationContext = appInsights.startOperation(context, req);

    // Wrap the Function runtime with correlationContext
    return appInsights.wrapWithCorrelationContext(async () => {
        const startTime = Date.now(); // Start trackRequest timer

        // Run the Function
        const result = await httpTrigger(context, req);

        // Track Request on completion
        appInsights.defaultClient.trackRequest({
            name: context.req.method + " " + context.req.url,
            resultCode: context.res.status,
            success: true,
            url: req.url,
            time: new Date(startTime),
            duration: Date.now() - startTime,
            id: correlationContext.operation.parentId,
        });
        appInsights.defaultClient.flush();

        return result;
    }, correlationContext)();
};