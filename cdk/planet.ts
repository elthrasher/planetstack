import { App } from '@aws-cdk/core';
import { PlanetStack } from './planetstack';

const app = new App();

new PlanetStack(app, 'PlanetStack', {
  description: 'Planet Stack',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: 'planet-stack',
});
