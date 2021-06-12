import { SynthUtils } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/core';
import { getApiGateway } from './apigw';
import { getFunctions } from './lambda';
import { getWebsite } from './website';

describe('web components', () => {
  test('return website', () => {
    const app = new App();
    const stack = new Stack(app, 'ApiTestStack', { env: { account: '123456789', region: 'us-east-1' } });
    getWebsite(stack, getApiGateway(stack, getFunctions(stack))[0]);
    const cfn = SynthUtils.toCloudFormation(stack);
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
        case 'Custom::CDKBucketDeployment':
          matchObject.Resources[res] = {
            Properties: {
              SourceBucketNames: expect.any(Array),
              SourceObjectKeys: expect.any(Object),
            },
          };
          break;
        default:
          break;
      }
    });

    expect(cfn).toMatchSnapshot(matchObject);
  });
});
