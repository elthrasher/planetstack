import { APIGatewayProxyEvent } from 'aws-lambda';

import { awsSdkPromiseResponse } from '../__mocks__/aws-sdk/clients/awsSdkPromiseResponse';
import { updateFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { MessageAction } from '../types/MessageAction';
import { handler } from './changeBackground';

describe('changeBackground function', () => {
  test('Background changed', async () => {
    const icon = { img: 0, x: 400, y: 400 };
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Attributes: { bg: 1, icon: { 'abc-123': icon } } }));
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [{ cid: '111' }, { cid: '222' }] }));
    const result = await handler({
      body: JSON.stringify({ action: MessageAction.CHANGE_BACKGROUND, bg: 1 }),
      requestContext: { connectionId: '123-abc' },
    } as APIGatewayProxyEvent);
    expect(result).toEqual({ body: 'OK', statusCode: 200 });
    expect(updateFn).toHaveBeenCalledWith({
      ExpressionAttributeNames: {
        '#_ct': '_ct',
        '#_et': '_et',
        '#_md': '_md',
        '#bg': 'bg',
      },
      ExpressionAttributeValues: {
        ':_ct': expect.any(String),
        ':_et': 'GameState',
        ':_md': expect.any(String),
        ':bg': 1,
      },
      Key: {
        pk: 'GS',
        sk: 'GS',
      },
      ReturnValues: 'ALL_NEW',
      TableName: 'PlanetStackTable',
      UpdateExpression: 'SET #bg = :bg, #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et)',
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
