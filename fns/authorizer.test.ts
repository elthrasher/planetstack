import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';

import { handler } from './authorizer';

describe('Lambda Authorizer', () => {
  test('returns a policy', async () => {
    const response = await handler({ methodArn: 'someArn' } as APIGatewayRequestAuthorizerEvent);
    expect(response).toEqual({
      policyDocument: {
        Statement: [
          {
            Action: ['execute-api:Invoke'],
            Effect: 'Allow',
            Resource: 'someArn',
          },
        ],
        Version: '2012-10-17',
      },
      principalId: 'token',
    });
  });
});
