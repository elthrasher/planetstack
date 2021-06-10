import { IconModel } from './icon';

export type GameStateModel = {
  bg: number;
  icons: { [ksuid: string]: IconModel };
};
