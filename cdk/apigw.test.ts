import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { getApiGateway } from './apigw';
import { getFunctions } from './lambda';

describe('API Gateway', () => {
  test('returns a websocket api', () => {
    const app = new App();
    const stack = new Stack(app, 'ApiTestStack', { env: { account: '123456789', region: 'us-east-1' } });
    getApiGateway(stack, getFunctions(stack));
    const cfn = Template.fromStack(stack).toJSON();
    const resources = cfn.Resources;
    const matchObject: { Parameters: Record<string, unknown>; Resources: Record<string, unknown> } = {
      Parameters: expect.any(Object),
      Resources: {},
    };
    Object.keys(resources).forEach((res) => {
      switch (resources[res].Type) {
        case 'AWS::Lambda::Function':
          matchObject.Resources[res] = {
            Properties: { Code: expect.any(Object) },
          };
          break;
        default:
          break;
      }
    });

    expect(cfn).toMatchSnapshot(matchObject);
  });
});
