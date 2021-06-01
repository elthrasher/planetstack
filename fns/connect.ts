import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { User } from '../repository/users';

const SECONDS_IN_AN_HOUR = 60 * 60;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  const expirationTime = secondsSinceEpoch + 24 * SECONDS_IN_AN_HOUR;
  await User.put({ pk: event.requestContext.connectionId, sk: 'USER', exp: expirationTime });
  return { body: 'Connected', statusCode: 200 };
};
