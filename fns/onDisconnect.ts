import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { User } from '../repositories/users';

// Delete the user connection on a disconnect request.
// The browser may issue this request before closing, before navigating away or if the connection times out.
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const cid = event.requestContext.connectionId;
  await User.delete({ cid });
  return { body: 'Disconnected', statusCode: 200 };
};
