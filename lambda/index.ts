import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import DynamoDB = require('aws-sdk/clients/dynamodb');

// import AWS XRay
const AWSXRay = require('aws-xray-sdk-core');

// Get DynamoDB table name and AWS region
const TABLE_NAME = process.env.TABLE_NAME || '';
const AWS_REGION = process.env.AWS_REGION || '';

// Connect to DynamoDB
const ddb_client = new DynamoDB.DocumentClient({ region: AWS_REGION });
AWSXRay.captureAWSClient((ddb_client as any).service);

// Lambda handler
export async function Handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    
    console.log(event.requestContext);

    // Get timestamp and client IP
    const timest = Math.floor(Date.now() / 1000);
    const client_ip = event.requestContext.http.sourceIp;
    const api_path = event.requestContext.http.path;

    // Build DynamoDB parameters
    const params = {
        TableName: TABLE_NAME,
        Item: {
            timest: timest.toString(),
            client_ip: client_ip,
            api_path: api_path,
            full_event: event
        }
    };

    // Insert item to DynamoDB
    const ddb_put = await ddb_client.put(params).promise();
    console.log('wrote ddb record ' + timest.toString() + ' ' + ddb_put);

    // Return 200 OK to client
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'hello lambda ' + timest + ' ' + client_ip + ' ' + api_path})
    };
};
