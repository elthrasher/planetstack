export const mockPostToConnection = jest.fn().mockReturnValue({ promise: () => Promise.resolve(true) });

export default class ApiGatewayManagementApi {
  postToConnection = mockPostToConnection;
}
