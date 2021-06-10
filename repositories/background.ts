import { Entity } from 'dynamodb-toolbox';

import { PlanetStackTable } from './table';

export const Background = new Entity({
  name: 'Background',
  attributes: {
    pk: { partitionKey: true },
    sk: { sortKey: true },
    path: { type: 'string' },
  },
  table: PlanetStackTable,
});
