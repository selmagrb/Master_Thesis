import { AzureFunction, Context } from "@azure/functions"

const appInsights = require('applicationinsights');

appInsights.setup("InstrumentationKey=3856f16c-d446-4a62-8479-1c788cc7dc07;IngestionEndpoint=https://germanywestcentral-0.in.applicationinsights.azure.com/;LiveEndpoint=https://germanywestcentral.livediagnostics.monitor.azure.com/")
    .start();

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('Timer function is running late!');
    }
    context.log('Timer trigger function ran!', timeStamp);   
};



// Default export wrapped with Application Insights FaaS context propagation
export default async function contextPropagatingHttpTrigger(context, req) {
    // Start an AI Correlation Context using the provided Function context
    const correlationContext = appInsights.startOperation(context, req);

    // Wrap the Function runtime with correlationContext
    return appInsights.wrapWithCorrelationContext(async () => {
        const startTime = Date.now(); // Start trackRequest timer

        // Run the Function
        const result = await timerTrigger(context, req);

        // Track Request on completion
        appInsights.defaultClient.trackRequest({
            name: "Cron Job Function",
            resultCode: 200,
            success: true,
            time: new Date(startTime),
            duration: Date.now() - startTime,
            id: correlationContext.operation.parentId,
        });
        appInsights.defaultClient.flush();

        return result;
    }, correlationContext)();
};
