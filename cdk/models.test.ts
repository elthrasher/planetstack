import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { getModels } from './models';

describe('models', () => {
  test('models', () => {
    const app = new App();
    const stack = new Stack(app);
    getModels(stack, new WebSocketApi(stack, 'testApi'));
    const cfn = Template.fromStack(stack).toJSON();

    expect(cfn).toMatchSnapshot();
  });
});
