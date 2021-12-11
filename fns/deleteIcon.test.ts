import { APIGatewayProxyEvent } from 'aws-lambda';

import { awsSdkPromiseResponse } from '../__mocks__/aws-sdk/clients/awsSdkPromiseResponse';
import { updateFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { MessageAction } from '../types/MessageAction';
import { handler } from './deleteIcon';

describe('celeteIcon function', () => {
  test('Icon Deleted', async () => {
    const icon = { img: 0, x: 400, y: 400 };
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Attributes: { bg: 0, icon: { 'abc-123': icon } } }));
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [{ cid: '111' }, { cid: '222' }] }));
    const result = await handler({
      body: JSON.stringify({ action: MessageAction.DELETE_ICON, id: 'abc-123' }),
      requestContext: { connectionId: '123-abc' },
    } as APIGatewayProxyEvent);
    expect(result).toEqual({ body: 'OK', statusCode: 200 });
    expect(updateFn).toHaveBeenCalledWith({
      Key: {
        pk: 'GS',
        sk: 'GS',
      },
      ReturnValues: 'ALL_NEW',
      TableName: 'PlanetStackTable',
      UpdateExpression: 'REMOVE icons.abc-123',
    });
  });
  test('missing body', async () => {
    try {
      await handler({
        requestContext: { connectionId: '123-abc' },
      } as APIGatewayProxyEvent);
    } catch (e) {
      expect(e).toMatchObject({ message: 'Missing event body!' });
    }
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
      expect(e).toMatchObject({ message: 'An error has occurred!' });
    }
  });
});
