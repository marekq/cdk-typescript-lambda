import { Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';

export class CdkTypescriptLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, "CdkTypescriptLambda", {
      runtime: Runtime.NODEJS_14_X,
      memorySize: 256,
      timeout: Duration.seconds(3),
      handler: 'Handler',
      entry: `${__dirname}/../lambda/index.ts`,
      bundling: {
        minify: true
      },
      tracing: Tracing.ACTIVE,
    });

    // Create API Gateway
    const apigw = new HttpApi(this, 'CdkTypescriptApi', {
      createDefaultStage: true,
      defaultIntegration: new LambdaProxyIntegration({
        handler: lambda
      })
    });
  }
}
