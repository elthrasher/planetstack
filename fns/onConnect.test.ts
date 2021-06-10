import { APIGatewayProxyEvent } from 'aws-lambda';

import { putFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { handler } from './onConnect';

describe('onConnect function', () => {
  test('Manage a connection and save the user', async () => {
    const result = await handler({ requestContext: { connectionId: '123-abc' } } as APIGatewayProxyEvent);
    expect(result).toEqual({ body: 'Connected', statusCode: 200 });
    expect(putFn).toHaveBeenCalledWith({
      Item: {
        _ct: expect.any(String),
        _et: 'User',
        _md: expect.any(String),
        cid: '123-abc',
        exp: expect.any(Number),
        pk: 'USER',
        sk: 'USER#123-abc',
      },
      TableName: 'PlanetStackTable',
    });
  });
});
