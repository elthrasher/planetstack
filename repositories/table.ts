import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Table } from 'dynamodb-toolbox';

export const db = new DocumentClient();

export const tableName = 'PlanetStackTable';

export const PlanetStackTable = new Table({
  name: tableName,
  partitionKey: 'pk',
  sortKey: 'sk',
  DocumentClient: db,
});
