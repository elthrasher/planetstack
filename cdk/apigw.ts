import { CfnAccount } from '@aws-cdk/aws-apigateway';
import { CfnModel, CfnRoute, CfnStage, WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2';
import { LambdaWebSocketIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { RemovalPolicy, Stack } from '@aws-cdk/core';

import { MessageAction } from '../types/MessageAction';
import { lambdaFunctions } from './lambda';
import { getModels } from './models';

export const stageName = 'dev';

const addRoute = (handler: LambdaFunction, action: MessageAction, model: CfnModel, webSocketApi: WebSocketApi) => {
  const route = webSocketApi.addRoute(action, {
    integration: new LambdaWebSocketIntegration({ handler }),
  });
  const rt = route.node.defaultChild as CfnRoute;

  rt.modelSelectionExpression = '$request.body.action';
  rt.requestModels = { [action]: model.name };
};

const getStageAndLogs = (scope: Stack, webSocketApi: WebSocketApi): WebSocketStage => {
  const stage = new WebSocketStage(scope, 'DevStage', {
    autoDeploy: true,
    stageName,
    webSocketApi,
  });
  const log = new LogGroup(scope, 'WebSocketAPILogs', {
    removalPolicy: RemovalPolicy.DESTROY,
    retention: RetentionDays.ONE_WEEK,
  });
  const cs = stage.node.defaultChild as CfnStage;
  cs.accessLogSettings = {
    destinationArn: log.logGroupArn,
    format: `$context.identity.sourceIp - - [$context.requestTime] "$context.httpMethod $context.routeKey $context.protocol" $context.status $context.responseLength $context.requestId`,
  };
  cs.defaultRouteSettings = {
    dataTraceEnabled: true,
    detailedMetricsEnabled: true,
    loggingLevel: 'INFO',
  };

  const cwRole = new Role(scope, 'CWRole', {
    assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')],
  });

  new CfnAccount(scope, 'Account', {
    cloudWatchRoleArn: cwRole.roleArn,
  });
  return stage;
};

export const getApiGateway = (scope: Stack, fns: lambdaFunctions): [WebSocketApi, WebSocketStage] => {
  const webSocketApi = new WebSocketApi(scope, 'WebSocketApi', {
    connectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.onConnect }) },
    disconnectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.onDisconnect }) },
  });

  const { addModel, changeBgModel, deleteModel, getStateModel, moveModel } = getModels(scope, webSocketApi);

  addRoute(fns.addIcon, MessageAction.ADD_ICON, addModel, webSocketApi);

  addRoute(fns.changeBackground, MessageAction.CHANGE_BACKGROUND, changeBgModel, webSocketApi);

  addRoute(fns.deleteIcon, MessageAction.DELETE_ICON, deleteModel, webSocketApi);

  addRoute(fns.moveIcon, MessageAction.MOVE_ICON, moveModel, webSocketApi);

  addRoute(fns.getState, MessageAction.GET_STATE, getStateModel, webSocketApi);

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

  return [webSocketApi, getStageAndLogs(scope, webSocketApi)];
};
