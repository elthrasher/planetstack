// See https://dev.to/elthrasher/mocking-aws-with-jest-and-typescript-199i
import { awsSdkPromiseResponse } from './awsSdkPromiseResponse';

export const mockPostToConnection = jest.fn().mockReturnValue({ promise: awsSdkPromiseResponse });

export default class ApiGatewayManagementApi {
  postToConnection = mockPostToConnection;
}
