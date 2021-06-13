import { APIGatewayProxyEvent } from 'aws-lambda';

import { awsSdkPromiseResponse } from '../__mocks__/aws-sdk/clients/awsSdkPromiseResponse';
import { updateFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { MessageAction } from '../types/MessageAction';
import { handler } from './moveIcon';

describe('moveIcon function', () => {
  test('Icon moved', async () => {
    const icon = { img: 0, x: 400, y: 400 };
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Attributes: { bg: 0, icon: { 'abc-123': icon } } }));
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [{ cid: '111' }, { cid: '222' }] }));
    const result = await handler({
      body: JSON.stringify({ action: MessageAction.MOVE_ICON, icon: { id: 'abc-123', img: 0, x: 499, y: 499 } }),
      requestContext: { connectionId: '123-abc' },
    } as APIGatewayProxyEvent);
    expect(result).toEqual({ body: 'OK', statusCode: 200 });
    expect(updateFn).toHaveBeenCalledWith({
      ExpressionAttributeNames: {
        '#_ct': '_ct',
        '#_et': '_et',
        '#_md': '_md',
        '#bg': 'bg',
        '#icons': 'icons',
        '#icons_abc-123': 'abc-123',
      },
      ExpressionAttributeValues: {
        ':_ct': expect.any(String),
        ':_et': 'GameState',
        ':_md': expect.any(String),
        ':bg': 0,
        ':icons_abc-123': {
          img: 0,
          x: 499,
          y: 499,
        },
      },
      Key: {
        pk: 'GS',
        sk: 'GS',
      },
      ReturnValues: 'ALL_NEW',
      TableName: 'PlanetStackTable',
      UpdateExpression:
        'SET #bg = if_not_exists(#bg,:bg), #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et), #icons.#icons_abc-123 = :icons_abc-123',
    });
  });
  test('missing body', async () => {
    try {
      await handler({
        requestContext: { connectionId: '123-abc' },
      } as APIGatewayProxyEvent);
    } catch (e) {
      expect(e.message).toBe('Missing event body!');
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
      expect(e.message).toBe('An error has occurred!');
    }
  });
});
