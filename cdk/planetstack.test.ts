import { SynthUtils } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';

import { PlanetStack } from './planetstack';

describe('rest api', () => {
  test('rest api', () => {
    const app = new App();
    const stack = new PlanetStack(app, 'PlanetStack', { env: { account: '123456789', region: 'us-east-1' } });
    const cfn = SynthUtils.toCloudFormation(stack);
    const resources = cfn.Resources;
    const matchObject: { Parameters: Record<string, unknown>; Resources: Record<string, unknown> } = {
      Parameters: expect.any(Object),
      Resources: {},
    };
    Object.keys(resources).forEach((res) => {
      switch (resources[res].Type) {
        case 'AWS::IAM::Policy':
          if (res.startsWith('CustomCDKBucketDeployment')) {
            matchObject.Resources[res] = {
              Properties: {
                PolicyDocument: {
                  Statement: expect.any(Array),
                },
              },
            };
          }
          break;
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
