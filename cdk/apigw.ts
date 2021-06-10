import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2';
import { LambdaWebSocketIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Stack } from '@aws-cdk/core';

import { MessageAction } from '../types/MessageAction';
import { lambdaFunctions } from './lambda';

export const stageName = 'dev';

export const getApiGateway = (scope: Stack, fns: lambdaFunctions): [WebSocketApi, WebSocketStage] => {
  const webSocketApi = new WebSocketApi(scope, 'WebSocketApi', {
    connectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.onConnect }) },
    disconnectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.onDisconnect }) },
    // defaultRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.onMessage }) },
  });

  webSocketApi.addRoute(MessageAction.ADD_ICON, {
    integration: new LambdaWebSocketIntegration({ handler: fns.addIcon }),
  });

  webSocketApi.addRoute(MessageAction.CHANGE_BACKGROUND, {
    integration: new LambdaWebSocketIntegration({ handler: fns.changeBackground }),
  });

  webSocketApi.addRoute(MessageAction.DELETE_ICON, {
    integration: new LambdaWebSocketIntegration({ handler: fns.deleteIcon }),
  });

  webSocketApi.addRoute(MessageAction.GET_STATE, {
    integration: new LambdaWebSocketIntegration({ handler: fns.getState }),
  });

  webSocketApi.addRoute(MessageAction.MOVE_ICON, {
    integration: new LambdaWebSocketIntegration({ handler: fns.moveIcon }),
  });

  const stage = new WebSocketStage(scope, 'DevStage', {
    autoDeploy: true,
    stageName,
    webSocketApi,
  });

  [fns.addIcon, fns.changeBackground, fns.deleteIcon, fns.getState, fns.moveIcon].forEach((fn) =>
    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ['execute-api:ManageConnections'],
        resources: [
          `arn:aws:execute-api:${process.env.CDK_DEFAULT_REGION}:${process.env.CDK_DEFAULT_ACCOUNT}:${webSocketApi.apiId}/*`,
        ],
      }),
    ),
  );

  return [webSocketApi, stage];
};
