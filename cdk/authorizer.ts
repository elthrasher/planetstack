import { CfnApi, CfnAuthorizer, CfnRoute, WebSocketApi } from '@aws-cdk/aws-apigatewayv2';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda';
import { Aspects, IAspect, IConstruct, Stack } from '@aws-cdk/core';

// WebSocketRoute doesn't allow us to attach an authorizer.
// This Aspect casts the WebSocketRoute with the routeKey of "$connect"
// to a CfnRoute that allows us to attach the authorizer.
class AuthZAspect implements IAspect {
  constructor(private authorizer: CfnAuthorizer) {}
  public visit(node: IConstruct) {
    if (node instanceof CfnRoute && node.routeKey === '$connect') {
      node.authorizerId = this.authorizer.ref;
      node.authorizationType = 'CUSTOM';
    }
  }
}

export const getCfnAuthorizer = (scope: Stack, webSocketApi: WebSocketApi, authFn: LambdaFunction): CfnAuthorizer => {
  const authorizer = new CfnAuthorizer(scope, 'Authorizer', {
    apiId: webSocketApi.apiId,
    authorizerType: 'REQUEST',
    authorizerUri: Stack.of(scope).formatArn({
      account: 'lambda',
      resource: 'path',
      resourceName: `2015-03-31/functions/${authFn.functionArn}/invocations`,
      service: 'apigateway',
    }),
    name: 'WebSocketApiAuthorizer',
  });

  authFn.addPermission('AuthZPermission', {
    principal: new ServicePrincipal('apigateway.amazonaws.com'),
    sourceArn: Stack.of(webSocketApi).formatArn({
      service: 'execute-api',
      resource: (webSocketApi.node.defaultChild as CfnApi).ref,
      resourceName: `authorizers/${authorizer.ref}`,
    }),
  });

  Aspects.of(webSocketApi).add(new AuthZAspect(authorizer));

  return authorizer;
};
