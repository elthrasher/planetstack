import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { GameState } from '../repositories/gamestate';
import { postToConnection } from '../repositories/management';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const cid = event.requestContext.connectionId;
    const gs = await GameState.get({});
    if (!gs.Item) {
      await GameState.put({ bg: 0, icons: {} });
    }
    if (cid && gs.Item) {
      await postToConnection(event, cid, JSON.stringify(gs.Item));
    }
    return { body: 'OK', statusCode: 200 };
  } catch (e) {
    console.error(e);
    throw new Error('An error has occurred!');
  }
};
