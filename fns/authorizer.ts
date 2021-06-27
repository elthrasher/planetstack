import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from 'aws-lambda';

const generatePolicy = (methodArn: string): APIGatewayAuthorizerResult => {
  return {
    principalId: 'token',
    policyDocument: {
      Statement: [
        {
          Action: ['execute-api:Invoke'],
          Effect: 'Allow',
          Resource: methodArn,
        },
      ],
      Version: '2012-10-17',
    },
  };
};

// This authorizer doesn't do anything other than log the event, which isn't a great security plan!
// You probably want to decode a jwt from cognito or a 3rd party like auth0.
// Check out https://github.com/aws-samples/websocket-api-cognito-auth-sample for an example of how to do this.
export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log('Received event: ', event);
  return generatePolicy(event.methodArn);
};
