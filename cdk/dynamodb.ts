import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { RemovalPolicy, Stack } from '@aws-cdk/core';
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda';

export const getTable = (stack: Stack, fns: { [key: string]: LambdaFunction }): Table => {
  const t = new Table(stack, 'PlanetStackTable', {
    partitionKey: { name: 'pk', type: AttributeType.STRING },
    removalPolicy: RemovalPolicy.DESTROY,
    sortKey: { name: 'sk', type: AttributeType.STRING },
    tableName: `PlanetStackTable`,
    timeToLiveAttribute: 'exp',
  });
  t.grantWriteData(fns.connectFn);
  t.grantWriteData(fns.disconnectFn);

  return t;
};
