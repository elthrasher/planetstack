export const awsSdkPromiseResponse = jest.fn().mockReturnValue(Promise.resolve(true));

export const deleteFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

const getFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

const queryFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

export const putFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

export const updateFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

export class DocumentClient {
  delete = deleteFn;
  get = getFn;
  put = putFn;
  query = queryFn;
  update = updateFn;
  options = {};
}
