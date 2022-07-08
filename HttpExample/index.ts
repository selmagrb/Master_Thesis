import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios from "axios";

const appInsights = require('applicationinsights');

appInsights.setup("InstrumentationKey=3856f16c-d446-4a62-8479-1c788cc7dc07;IngestionEndpoint=https://germanywestcentral-0.in.applicationinsights.azure.com/;LiveEndpoint=https://germanywestcentral.livediagnostics.monitor.azure.com/")
    .start();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const externalApiUrl: string = "http://job-applicants-dummy-api.kupferwerk.net.s3.amazonaws.com/api/cars.json";

    const res = await axios.get(externalApiUrl);

    context.bindings.outputDocument = JSON.stringify({
        // create a random ID
        id: new Date().toISOString() + Math.random().toString().substr(2,8),
        name: "Test"
    });

    context.res = {
        headers: {
            "content-type": "application/json"
        },
        body: res.data
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