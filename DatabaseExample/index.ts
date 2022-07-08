import { AzureFunction, Context, HttpRequest } from "@azure/functions"
const appInsights = require('applicationinsights');

appInsights.setup("InstrumentationKey=3856f16c-d446-4a62-8479-1c788cc7dc07;IngestionEndpoint=https://germanywestcentral-0.in.applicationinsights.azure.com/;LiveEndpoint=https://germanywestcentral.livediagnostics.monitor.azure.com/")
    .start();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
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