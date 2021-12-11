import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { CfnAccount } from 'aws-cdk-lib/aws-apigateway';
import { CfnModel, CfnRoute, CfnStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

import { MessageAction } from '../types/MessageAction';
import { getCfnAuthorizer } from './authorizer';
import { lambdaFunctions } from './lambda';
import { getModels } from './models';

export const stageName = 'dev';

/*
 * Utility function for adding a route with a model.
 * This is not supported in the L2 constuct so we must drop to
 * L1 (Cfn) by casting the `WebSocketRoute` to `CfnRoute` (`AWS::ApiGatewayV2::Route`)
 */
const addRoute = (handler: LambdaFunction, action: MessageAction, model: CfnModel, webSocketApi: WebSocketApi) => {
  const route = webSocketApi.addRoute(action, {
    integration: new WebSocketLambdaIntegration(`${action}Integration`, handler),
  });
  const rt = route.node.defaultChild as CfnRoute;

  rt.modelSelectionExpression = '$request.body.action';
  rt.requestModels = { [action]: model.name };

  rt.addDependsOn(model);
};

/*
 * Again, we need to extend the `WebSocketStage` construct by casting it to `CfnStage` (`AWS::ApiGatewayV2::Stage`).
 */
const getStageAndLogs = (scope: Stack, webSocketApi: WebSocketApi): WebSocketStage => {
  // Unlike RestApi, you don't get a default `prod` stage automatically.
  const stage = new WebSocketStage(scope, 'DevStage', {
    autoDeploy: true,
    stageName,
    webSocketApi,
  });
  // Manage the log group
  new LogGroup(scope, 'ExecutionLogs', {
    logGroupName: `/aws/apigateway/${webSocketApi.apiId}/${stageName}`,
    removalPolicy: RemovalPolicy.DESTROY,
    retention: RetentionDays.ONE_WEEK,
  });
  const log = new LogGroup(scope, 'AccessLogs', {
    removalPolicy: RemovalPolicy.DESTROY,
    retention: RetentionDays.ONE_WEEK,
  });
  const cfnStage = stage.node.defaultChild as CfnStage;
  cfnStage.accessLogSettings = {
    destinationArn: log.logGroupArn,
    format: `$context.identity.sourceIp - - [$context.requestTime] "$context.httpMethod $context.routeKey $context.protocol" $context.status $context.responseLength $context.requestId`,
  };
  cfnStage.defaultRouteSettings = {
    dataTraceEnabled: true,
    loggingLevel: 'INFO',
    throttlingBurstLimit: 500,
    throttlingRateLimit: 1000,
  };

  /*
   * This role is automatically created by the RestApi construct but not by WebSocketApi.
   * CfnAccount isn't even available in the `aws-cdk-lib/aws-apigatewayv2` lib so we must import `aws-cdk-lib/aws-apigateway`
   * to create the CloudWatch role.
   */
  const cwRole = new Role(scope, 'CWRole', {
    assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')],
  });

  const account = new CfnAccount(scope, 'Account', {
    cloudWatchRoleArn: cwRole.roleArn,
  });

  webSocketApi.node.addDependency(account);
  return stage;
};

export const getApiGateway = (scope: Stack, fns: lambdaFunctions): [WebSocketApi, WebSocketStage] => {
  const webSocketApi = new WebSocketApi(scope, 'WebSocketApi', {
    connectRouteOptions: { integration: new WebSocketLambdaIntegration('OnConnectIntegration', fns.onConnect) },
    disconnectRouteOptions: {
      integration: new WebSocketLambdaIntegration('OnDisconnectIntegration', fns.onDisconnect),
    },
  });

  const { addModel, changeBgModel, deleteModel, getStateModel, moveModel } = getModels(scope, webSocketApi);

  getCfnAuthorizer(scope, webSocketApi, fns.authorizer);

  addRoute(fns.addIcon, MessageAction.ADD_ICON, addModel, webSocketApi);

  addRoute(fns.changeBackground, MessageAction.CHANGE_BACKGROUND, changeBgModel, webSocketApi);

  addRoute(fns.deleteIcon, MessageAction.DELETE_ICON, deleteModel, webSocketApi);

  addRoute(fns.moveIcon, MessageAction.MOVE_ICON, moveModel, webSocketApi);

  addRoute(fns.getState, MessageAction.GET_STATE, getStateModel, webSocketApi);

  // These functions need to be able to manage websocket connections.
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
