import { APIGatewayProxyEvent } from 'aws-lambda';

import { deleteFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { handler } from './onDisconnect';

describe('onDisconnect function', () => {
  test('Disconnect a user', async () => {
    const result = await handler({ requestContext: { connectionId: '123-abc' } } as APIGatewayProxyEvent);
    expect(result).toEqual({ body: 'Disconnected', statusCode: 200 });
    expect(deleteFn).toHaveBeenCalledWith({
      Key: {
        pk: 'USER',
        sk: 'USER#123-abc',
      },
      TableName: 'PlanetStackTable',
    });
  });
});
