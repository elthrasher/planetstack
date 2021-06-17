import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { User } from '../repositories/users';

const SECONDS_IN_AN_HOUR = 60 * 60;

// Handle a new websocket connection and store it in DynamoDB.
// Connections automatically expire via TTL after 24 hours (which in practice means they may last up to 72 hours).
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const cid = event.requestContext.connectionId;
  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  const expirationTime = secondsSinceEpoch + 24 * SECONDS_IN_AN_HOUR;
  await User.put({ cid, exp: expirationTime });
  return { body: 'Connected', statusCode: 200 };
};
