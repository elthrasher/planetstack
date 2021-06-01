import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2';
import { LambdaWebSocketIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda';
import { Stack } from '@aws-cdk/core';

export const getApiGateway = (scope: Stack, fns: { [key: string]: LambdaFunction }): [WebSocketApi, WebSocketStage] => {
  const webSocketApi = new WebSocketApi(scope, 'WebSocketApi', {
    connectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.connectFn }) },
    disconnectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.disconnectFn }) },
    defaultRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.connectFn }) },
  });
  const stage = new WebSocketStage(scope, 'DevStage', {
    autoDeploy: true,
    stageName: 'dev',
    webSocketApi,
  });
  return [webSocketApi, stage];
};
