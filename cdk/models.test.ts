import { SynthUtils } from '@aws-cdk/assert';
import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2';
import { App, Stack } from '@aws-cdk/core';

import { getModels } from './models';

describe('models', () => {
  test('models', () => {
    const app = new App();
    const stack = new Stack(app);
    getModels(stack, new WebSocketApi(stack, 'testApi'));
    const cfn = SynthUtils.toCloudFormation(stack);

    expect(cfn).toMatchSnapshot();
  });
});
