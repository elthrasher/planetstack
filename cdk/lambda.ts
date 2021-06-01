import { Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Stack } from '@aws-cdk/core';

export const getFunctions = (scope: Stack): { [name: string]: LambdaFunction } => {
  const connectFn = new NodejsFunction(scope, 'ConnectFunction', {
    entry: `${__dirname}/../fns/connect.ts`,
    runtime: Runtime.NODEJS_14_X,
  });
  const disconnectFn = new NodejsFunction(scope, 'DisconnectFunction', {
    entry: `${__dirname}/../fns/disconnect.ts`,
    runtime: Runtime.NODEJS_14_X,
  });
  return { connectFn, disconnectFn };
};
