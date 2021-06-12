import { CfnAccount } from '@aws-cdk/aws-apigateway';
import { CfnIntegration, CfnModel, CfnRoute, CfnStage, WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2';
import { LambdaWebSocketIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { RemovalPolicy, Stack } from '@aws-cdk/core';

import { MessageAction } from '../types/MessageAction';
import { lambdaFunctions } from './lambda';

export const stageName = 'dev';

export const getApiGateway = (scope: Stack, fns: lambdaFunctions): [WebSocketApi, WebSocketStage] => {
  const webSocketApi = new WebSocketApi(scope, 'WebSocketApi', {
    connectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.onConnect }) },
    disconnectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: fns.onDisconnect }) },
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

  const moveRoute = webSocketApi.addRoute(MessageAction.MOVE_ICON, {
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

  const moveModel = new CfnModel(scope, 'MoveModel', {
    apiId: webSocketApi.apiId,
    contentType: 'application/json',
    name: 'MoveModel',
    schema: {
      $schema: 'http://json-schema.org/draft-04/schema#',
      properties: {
        action: { type: 'string' },
        id: { type: 'string' },
        img: { type: 'number' },
        x: { type: 'number' },
        y: { type: 'number' },
      },
      required: ['action', 'id', 'img', 'x', 'y'],
      title: 'MoveSchema',
      type: 'object',
    },
  });

  const moveInt = new CfnIntegration(scope, 'MoveInt', {
    apiId: webSocketApi.apiId,
    integrationType: 'AWS_PROXY',
    integrationUri: Stack.of(scope).formatArn({
      account: 'lambda',
      resource: 'path/2015-03-31/functions',
      resourceName: `${fns.moveIcon.functionArn}/invocations`,
      service: 'apigateway',
    }),
  });

  const rt = moveRoute.node.defaultChild as CfnRoute;

  rt.modelSelectionExpression = '$request.body.action';
  rt.requestModels = { [MessageAction.MOVE_ICON]: moveModel.name };
  rt.target = `integrations/${moveInt.ref}`;

  fns.moveIcon.addPermission('MovePermission', {
    principal: new ServicePrincipal('apigateway.amazonaws.com'),
    scope,
    sourceArn: Stack.of(scope).formatArn({
      service: 'execute-api',
      resource: webSocketApi.apiId,
      resourceName: `*/*${MessageAction.MOVE_ICON}`,
    }),
  });

  return [webSocketApi, stage];
};
