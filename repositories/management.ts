import { APIGatewayProxyEvent } from 'aws-lambda';
import ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi';

import { UserModel } from '../types/user';
import { GameState } from './gamestate';
import { User } from './users';

const checkMessageSize = async (message: string): Promise<string> => {
  if (Buffer.byteLength(message) > 30000) {
    console.log('Size limit reached. Resetting game!');
    await GameState.put({ bg: 0, icons: {} });
    return JSON.stringify({ bg: 0, icons: {} });
  }
  return message;
};

const getMgmtApi = (event: APIGatewayProxyEvent): ApiGatewayManagementApi =>
  new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
  });

export const notifyClients = async (event: APIGatewayProxyEvent, message: string): Promise<void> => {
  const apigwManagementApi = getMgmtApi(event);
  message = await checkMessageSize(message);
  const cids = await User.query('USER', {}, { ProjectionExpression: 'cid' });

  const postCalls = cids.Items.filter((i: UserModel) => i.cid).map(async ({ cid }: { cid: string }) => {
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: cid, Data: message }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${cid}`);
        await User.delete({ cid });
      } else {
        throw e;
      }
    }
  });

  await Promise.all(postCalls);
};

export const postToConnection = async (event: APIGatewayProxyEvent, cid: string, message: string): Promise<void> => {
  await getMgmtApi(event)
    .postToConnection({
      ConnectionId: cid,
      Data: message,
    })
    .promise();
};
