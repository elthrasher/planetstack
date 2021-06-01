import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { User } from '../repository/users';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await User.delete({ pk: event.requestContext.connectionId });
  return { body: 'Disconnected', statusCode: 200 };
};
