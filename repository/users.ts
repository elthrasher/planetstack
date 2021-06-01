import { Entity, Table } from 'dynamodb-toolbox';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const db = new DocumentClient();

const tableName = 'PlanetStackTable';

const PlanetStackTable = new Table({
  name: tableName,
  partitionKey: 'pk',
  sortKey: 'sk',
  DocumentClient: db,
});

export const User = new Entity({
  name: 'User',
  attributes: {
    pk: { partitionKey: true },
    sk: { sortKey: true },
    exp: { type: 'number' },
  },
  table: PlanetStackTable,
});
