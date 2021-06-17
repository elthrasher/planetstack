import { Entity } from 'dynamodb-toolbox';

import { GameStateModel } from '../types/gamestate';
import { IconModel } from '../types/icon';
import { PlanetStackTable } from './table';

// The entire game state - background and icons - are stored as a single DynamoDB item.
// Icons are stored as a map keyed by the ksuid with the position and img properties.
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
