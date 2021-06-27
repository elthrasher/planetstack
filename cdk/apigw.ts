import { CfnAccount } from '@aws-cdk/aws-apigateway';
import {
  CfnApi,
  CfnAuthorizer,
  CfnModel,
  CfnRoute,
  CfnStage,
  WebSocketApi,
  WebSocketStage,
} from '@aws-cdk/aws-apigatewayv2';
import { LambdaWebSocketIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { Aspects, IAspect, IConstruct, RemovalPolicy, Stack } from '@aws-cdk/core';

import { MessageAction } from '../types/MessageAction';
import { lambdaFunctions } from './lambda';
import { getModels } from './models';

class AuthZAspect implements IAspect {
  constructor(private authorizer: CfnAuthorizer) {}
  public visit(node: IConstruct) {
    if (node instanceof CfnRoute && node.routeKey === '$connect') {
      node.authorizerId = this.authorizer.ref;
      node.authorizationType = 'CUSTOM';
    }
  }
}

export const stageName = 'dev';

/*
 * Utility function for adding a route with a model.
 * This is not supported in the L2 constuct so we must drop to
 * L1 (Cfn) by casting the `WebSocketRoute` to `CfnRoute` (`AWS::ApiGatewayV2::Route`)
 */
const addRoute = (handler: LambdaFunction, action: MessageAction, model: CfnModel, webSocketApi: WebSocketApi) => {
  const route = webSocketApi.addRoute(action, {
    integration: new LambdaWebSocketIntegration({ handler }),
  });
  const rt = route.node.defaultChild as CfnRoute;

  // Unfortunately it seems that if we add the models during resource creation, it causes a horrible API Gateway
  // bug where none of the endpoints work at all.
  // To enable model validation, deploy the stack, uncomment the following lines, then deploy again :P

  // rt.modelSelectionExpression = '$request.body.action';
  // rt.requestModels = { [action]: model.name };

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
   * CfnAccount isn't even available in the `@aws-cdk/aws-apigatewayv2` lib so we must import `@aws-cdk/aws-apigateway`
   * to create the CloudWatch role.
   */
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

  const authorizer = new CfnAuthorizer(scope, 'Authorizer', {
    apiId: webSocketApi.apiId,
    // authorizerCredentialsArn: `arn:aws:iam::${process.env.CDK_DEFAULT_ACCOUNT}:role/APIGatewayLambdaInvokeRole`,
    authorizerType: 'REQUEST',
    authorizerUri: Stack.of(scope).formatArn({
      account: 'lambda',
      resource: 'path',
      resourceName: `2015-03-31/functions/${fns.authorizer.functionArn}/invocations`,
      service: 'apigateway',
    }),
    // authorizerUri: `arn:aws:apigateway:${process.env.CDK_DEFAULT_REGION}:lambda:path/2015-03-31/functions/${fns.authorizer.functionArn}/invocations`,
    name: 'WebSocketApiAuthorizer',
  });

  fns.authorizer.addPermission('AuthZPermission', {
    principal: new ServicePrincipal('apigateway.amazonaws.com'),
    sourceArn: Stack.of(webSocketApi).formatArn({
      service: 'execute-api',
      resource: (webSocketApi.node.defaultChild as CfnApi).ref,
      resourceName: `authorizers/${authorizer.ref}`,
    }),
  });

  Aspects.of(webSocketApi).add(new AuthZAspect(authorizer));

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
