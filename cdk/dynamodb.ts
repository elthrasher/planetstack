import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { RemovalPolicy, Stack } from '@aws-cdk/core';

import { lambdaFunctions } from './lambda';

export const getTable = (stack: Stack, fns: lambdaFunctions): Table => {
  const table = new Table(stack, 'PlanetStackTable', {
    billingMode: BillingMode.PAY_PER_REQUEST,
    partitionKey: { name: 'pk', type: AttributeType.STRING },
    removalPolicy: RemovalPolicy.DESTROY,
    sortKey: { name: 'sk', type: AttributeType.STRING },
    tableName: `PlanetStackTable`,
    timeToLiveAttribute: 'exp',
  });
  table.grantReadWriteData(fns.addIcon);
  table.grantReadWriteData(fns.changeBackground);
  table.grantReadWriteData(fns.deleteIcon);
  table.grantReadData(fns.getState);
  table.grantReadWriteData(fns.moveIcon);
  table.grantWriteData(fns.onConnect);
  table.grantWriteData(fns.onDisconnect);

  return table;
};
