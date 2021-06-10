import { APIGatewayProxyEvent } from 'aws-lambda';

import { awsSdkPromiseResponse } from '../__mocks__/aws-sdk/clients/awsSdkPromiseResponse';
import { getFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { MessageAction } from '../types/MessageAction';
import { handler } from './getState';

describe('getState function', () => {
  test('Gamestate does not exist', async () => {
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({}));
    const result = await handler({
      requestContext: { connectionId: '123-abc' },
    } as APIGatewayProxyEvent);
    expect(result).toEqual({ body: 'OK', statusCode: 200 });
    expect(getFn).toHaveBeenCalledWith({
      Key: {
        pk: 'GS',
        sk: 'GS',
      },
      TableName: 'PlanetStackTable',
    });
  });
  test('Gamestate already exists', async () => {
    const icon = { img: 0, x: 400, y: 400 };
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Item: { bg: 0, icons: { 'abc-123': icon } } }));
    const result = await handler({
      requestContext: { connectionId: '123-abc' },
    } as APIGatewayProxyEvent);
    expect(result).toEqual({ body: 'OK', statusCode: 200 });
    expect(getFn).toHaveBeenCalledWith({
      Key: {
        pk: 'GS',
        sk: 'GS',
      },
      TableName: 'PlanetStackTable',
    });
  });
  test('catch errors', async () => {
    const icon = { img: 0, x: 400, y: 400 };
    awsSdkPromiseResponse.mockRejectedValueOnce(new Error('blah'));
    try {
      await handler({
        body: JSON.stringify({ action: MessageAction.ADD_ICON, icon }),
        requestContext: { connectionId: '123-abc' },
      } as APIGatewayProxyEvent);
    } catch (e) {
      expect(e.message).toBe('An error has occurred!');
    }
  });
});
