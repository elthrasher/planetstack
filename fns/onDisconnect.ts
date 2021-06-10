import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { User } from '../repositories/users';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const cid = event.requestContext.connectionId;
  await User.delete({ cid });
  return { body: 'Disconnected', statusCode: 200 };
};
