import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

export async function Handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    
    console.log(event);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'hello lambda' })
    }
}