import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockPostToConnection } from '../__mocks__/aws-sdk/clients/apigatewaymanagementapi';

import { awsSdkPromiseResponse } from '../__mocks__/aws-sdk/clients/awsSdkPromiseResponse';
import { deleteFn, putFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { notifyClients } from './management';

describe('API Gateway Management', () => {
  test('notify clients', async () => {
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [{ cid: '111' }, { cid: '222' }] }));
    await notifyClients(
      { requestContext: { domainName: 'fake-domain.com', stage: 'dev' } } as APIGatewayProxyEvent,
      JSON.stringify({}),
    );
    expect(mockPostToConnection).toHaveBeenCalledWith({
      ConnectionId: '111',
      Data: '{}',
    });
    expect(mockPostToConnection).toHaveBeenCalledWith({
      ConnectionId: '222',
      Data: '{}',
    });
  });
  test('buffer overrun - reset game', async () => {
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [{ cid: '111' }, { cid: '222' }] }));
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [{ bg: 0, icons: {} }] }));
    await notifyClients(
      { requestContext: { domainName: 'fake-domain.com', stage: 'dev' } } as APIGatewayProxyEvent,
      JSON.stringify({ longString: new Array(30000).join('x') }),
    );
    expect(putFn).toHaveBeenCalledWith({
      Item: {
        _ct: expect.any(String),
        _et: 'GameState',
        _md: expect.any(String),
        bg: 0,
        icons: {},
        pk: 'GS',
        sk: 'GS',
      },
      TableName: 'PlanetStackTable',
    });
  });
  test('stale connection', async () => {
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [{ cid: '111' }, { cid: '222' }] }));
    awsSdkPromiseResponse.mockRejectedValueOnce({ statusCode: 410 });
    await notifyClients(
      { requestContext: { domainName: 'fake-domain.com', stage: 'dev' } } as APIGatewayProxyEvent,
      JSON.stringify({}),
    );
    expect(mockPostToConnection).toHaveBeenCalledWith({
      ConnectionId: '111',
      Data: '{}',
    });
    expect(mockPostToConnection).toHaveBeenCalledWith({
      ConnectionId: '222',
      Data: '{}',
    });
    expect(deleteFn).toHaveBeenCalledWith({
      Key: {
        pk: 'USER',
        sk: 'USER#111',
      },
      TableName: 'PlanetStackTable',
    });
  });
  test('other errors', async () => {
    awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [{ cid: '111' }, { cid: '222' }] }));
    awsSdkPromiseResponse.mockRejectedValueOnce(new Error('blah'));
    try {
      await notifyClients(
        { requestContext: { domainName: 'fake-domain.com', stage: 'dev' } } as APIGatewayProxyEvent,
        JSON.stringify({}),
      );
    } catch (e) {
      expect(e.message).toBe('blah');
    }
  });
});
