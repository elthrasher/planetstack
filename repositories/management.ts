import { APIGatewayProxyEvent } from 'aws-lambda';
import ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi';

import { UserModel } from '../types/user';
import { GameState } from './gamestate';
import { User } from './users';

// Max item size for DynamoDB is 400kb.
// Here we're checking to see is the game state larger than 30k.
// Since the game state is simple (icon id + position coordinates), a 30k game state would be quite large already.
// Too many icons could cause render issues, so we just unceremoniously reset the game if we hit the limit.
const checkMessageSize = async (message: string): Promise<string> => {
  if (Buffer.byteLength(message) > 30000) {
    console.log('Size limit reached. Resetting game!');
    await GameState.put({ bg: 0, icons: {} });
    return JSON.stringify({ bg: 0, icons: {} });
  }
  return message;
};

// Configure management API.
const getMgmtApi = (event: APIGatewayProxyEvent): ApiGatewayManagementApi =>
  new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
  });

// Unfortunately there is no "send to all connected clients" feature.
// Instead we fetch our list of clients from the DynamoDB table and post the update to each of them.
// All users are being stored in the same DynamoDB partition, so this could create a hot partition at massive scale.
// Additionally, even with connection reuse and `Promise.all`, we could hit a scaling limit with all the http traffic.
// A solution to this problem might be to establish "servers" with a limited number of users.
// Limits haven't been explored for this app, but it would probably be fine to have hundreds of users at least.
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
