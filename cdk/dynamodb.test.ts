import { SynthUtils } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/aws-sns/node_modules/@aws-cdk/core';

import { getTable } from './dynamodb';
import { getFunctions } from './lambda';

describe('DynamoDB', () => {
  test('returns a table', () => {
    const app = new App();
    const stack = new Stack(app, 'ApiTestStack', { env: { account: '123456789', region: 'us-east-1' } });
    getTable(stack, getFunctions(stack));
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
        default:
          break;
      }
    });

    expect(cfn).toMatchSnapshot(matchObject);
  });
});
