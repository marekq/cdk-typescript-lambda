import { Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { CfnOutput, Construct, Duration, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';

export class CdkTypescriptLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    const ddbtable = new Table(this, 'CdkTypescriptTable', {
      partitionKey: { name: 'timest', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    // Create TypeScript Lambda
    const lambda = new NodejsFunction(this, "CdkTypescriptLambda", {
      runtime: Runtime.NODEJS_14_X,
      memorySize: 256,
      timeout: Duration.seconds(3),
      handler: 'Handler',
      entry: `${__dirname}/../lambda/index.ts`,
      bundling: {
        minify: true,
        nodeModules: [ 'aws-xray-sdk-core' ]
      },
      tracing: Tracing.ACTIVE,
      awsSdkConnectionReuse: true,
      environment: {
       'TABLE_NAME': ddbtable.tableName 
      }
    });

    // Create HTTP API Gateway
    const apigw = new HttpApi(this, 'CdkTypescriptApi', {
      createDefaultStage: true,
      defaultIntegration: new LambdaProxyIntegration({
        handler: lambda
      })
    });

    // Grant Lambda read/write permissions to DynamoDB table
    ddbtable.grantReadWriteData(lambda);

    // Print API Gateway URL
    new CfnOutput(this, 'API URL', { value: apigw.url ?? 'deployment error' });

  };
};
