import { awsSdkPromiseResponse } from './awsSdkPromiseResponse';

export const mockPostToConnection = jest.fn().mockReturnValue({ promise: awsSdkPromiseResponse });

export default class ApiGatewayManagementApi {
  postToConnection = mockPostToConnection;
}
