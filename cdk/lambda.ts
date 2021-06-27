import { Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Duration, Stack } from '@aws-cdk/core';

const functionNames = [
  'addIcon',
  'authorizer',
  'changeBackground',
  'deleteIcon',
  'getState',
  'moveIcon',
  'onConnect',
  'onDisconnect',
] as const;

export type lambdaFunctions = {
  [key in typeof functionNames[number]]: LambdaFunction;
};

// Same props for all functions. This is probably fine for demonstration purposes,
// but we could find exceptions in a real-world scenario.
const lambdaProps = {
  bundling: {
    externalModules: [],
  },
  runtime: Runtime.NODEJS_14_X,
  timeout: Duration.minutes(1),
};

export const getFunctions = (scope: Stack): lambdaFunctions => {
  return functionNames.reduce(
    (prev, fn) => ({
      ...prev,
      [fn]: new NodejsFunction(scope, `${fn}Function`, {
        ...lambdaProps,
        entry: `${__dirname}/../fns/${fn}.ts`,
      }),
    }),
    {} as lambdaFunctions,
  );
};
