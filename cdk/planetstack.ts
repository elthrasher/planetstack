import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { getApiGateway } from './apigw';
import { getTable } from './dynamodb';
import { getFunctions } from './lambda';
import { getWebsite } from './website';

export class PlanetStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fns = getFunctions(this);

    const [apigw, stage] = getApiGateway(this, fns);

    const webUrl = getWebsite(this, apigw);

    getTable(this, fns);

    new CfnOutput(this, 'webUrl', { value: webUrl });
    new CfnOutput(this, 'wsUrl', { value: `${apigw.apiEndpoint}/${stage.stageName}` });
  }
}
