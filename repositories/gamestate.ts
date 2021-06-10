import { Entity } from 'dynamodb-toolbox';

import { GameStateModel } from '../types/gamestate';
import { IconModel } from '../types/icon';
import { PlanetStackTable } from './table';

export const GameState = new Entity<GameStateModel | { icons: { $set: { [id: string]: IconModel } } }>({
  name: 'GameState',
  attributes: {
    pk: { default: () => 'GS', hidden: true, partitionKey: true },
    sk: { default: () => 'GS', hidden: true, sortKey: true },
    bg: { default: () => 0, type: 'number' },
    icons: { type: 'map' },
  },
  table: PlanetStackTable,
});
