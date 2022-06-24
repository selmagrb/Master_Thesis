import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios from "axios";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const externalApiUrl: string = "http://job-applicants-dummy-api.kupferwerk.net.s3.amazonaws.com/api/cars.json";

    const res = await axios.get(externalApiUrl);

    context.res = {
        headers: {
            "content-type": "application/json"
        },
        body: res.data
    };

};

export default httpTrigger;