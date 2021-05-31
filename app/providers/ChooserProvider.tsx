import React, { createContext, ReactNode, useState } from 'react';

export const backgrounds = [
  { path: 'assets/Alpine Planet 1280x720/1280x720 Alpine - Dry.png' },
  { path: 'assets/Alpine Planet 1280x720/1280x720 Alpine - Wet.png' },
  { path: 'assets/Desert Planet 1280x720/1280x720 Desert - Dry.png' },
  { path: 'assets/Desert Planet 1280x720/1280x720 Desert - Wet.png' },
  { path: 'assets/Ice Planet 1280x720/1280x720 Ice Planet - Dry.png' },
  { path: 'assets/Ice Planet 1280x720/1280x720 Ice Planet - Wet.png' },
  { path: 'assets/Ocean Planet 1280x720/1280x720 Ocean - Dry.png' },
  { path: 'assets/Ocean Planet 1280x720/1280x720 Ocean - Wet.png' },
  { path: 'assets/Poison Planet 1280x720/1280x720 Poison - Dry.png' },
  { path: 'assets/Poison Planet 1280x720/1280x720 Poison - Wet.png' },
  { path: 'assets/Radiated Planet 1280x720/1280x720 Radiated Planet - Dry.png' },
  { path: 'assets/Radiated Planet 1280x720/1280x720 Radiated Planet - Wet.png' },
  { path: 'assets/Red Planet 1280x720/1280x1280 Red Planet - Dry.png' },
  { path: 'assets/Red Planet 1280x720/1280x1280 Red Planet - Wet.png' },
  { path: 'assets/Rocky Planet 1280x720/1280x720 Rocky - Dry.png' },
  { path: 'assets/Rocky Planet 1280x720/1280x720 Rocky - Wet.png' },
  { path: 'assets/Tropical Planet 1280x720/1280x720 Tropical - Dry.png' },
  { path: 'assets/Tropical Planet 1280x720/1280x720 Tropical - Wet.png' },
  { path: 'assets/Volcanic Planet 1280x720/1280x720 Volcanic.png' },
];

export const icons = [
  { path: 'assets/RandomBuildings/B01.png' },
  { path: 'assets/RandomBuildings/B02.png' },
  { path: 'assets/RandomBuildings/B03.png' },
  { path: 'assets/RandomBuildings/B04.png' },
  { path: 'assets/RandomBuildings/B05.png' },
  { path: 'assets/RandomBuildings/B06.png' },
  { path: 'assets/RandomBuildings/B07.png' },
  { path: 'assets/RandomBuildings/B08.png' },
  { path: 'assets/RandomBuildings/B09.png' },
  { path: 'assets/RandomBuildings/B10.png' },
  { path: 'assets/RandomBuildings/B11.png' },
  { path: 'assets/RandomBuildings/B12.png' },
  { path: 'assets/RandomBuildings/B13.png' },
  { path: 'assets/RandomBuildings/B14.png' },
  { path: 'assets/RandomBuildings/B15.png' },
  { path: 'assets/RandomBuildings/B16.png' },
  { path: 'assets/RandomBuildings/B17.png' },
  { path: 'assets/RandomBuildings/B18.png' },
  { path: 'assets/RandomBuildings/B19.png' },
  { path: 'assets/RandomBuildings/B20.png' },
  { path: 'assets/RandomBuildings/B21.png' },
  { path: 'assets/RandomBuildings/B22.png' },
  { path: 'assets/RandomBuildings/B23.png' },
  { path: 'assets/RandomBuildings/B24.png' },
  { path: 'assets/RandomBuildings/B25.png' },
  { path: 'assets/RandomBuildings/B26.png' },
  { path: 'assets/DifferentTurrets/Turret01.png' },
  { path: 'assets/DifferentTurrets/Turret02.png' },
  { path: 'assets/DifferentTurrets/Turret03.png' },
  { path: 'assets/DifferentTurrets/Turret04.png' },
  { path: 'assets/DifferentTurrets/Turret05.png' },
  { path: 'assets/DifferentTurrets/Turret06.png' },
  { path: 'assets/DifferentTurrets/Turret07.png' },
  { path: 'assets/DifferentTurrets/Turret08.png' },
  { path: 'assets/DifferentTurrets/Turret09.png' },
  { path: 'assets/DifferentTurrets/Turret10.png' },
  { path: 'assets/Bullets/EnemyB01.png' },
  { path: 'assets/Bullets/EnemyB02.png' },
  { path: 'assets/Bullets/P02.png' },
  { path: 'assets/Bullets/P03.png' },
  { path: 'assets/Bullets/P04.png' },
  { path: 'assets/Bullets/P05.png' },
  { path: 'assets/MiniAsteroids/01.png' },
  { path: 'assets/MiniAsteroids/02.png' },
  { path: 'assets/MiniAsteroids/03.png' },
];

export enum ChooserMode {
  NONE,
  BACKGROUND,
  ICON,
}

export interface ChooserContextModel {
  background: number;
  chooserMode: ChooserMode;
  setBackground: (background: number) => void;
  setChooserMode: (chooserMode: ChooserMode) => void;
}

export const ChooserContext = createContext<ChooserContextModel>({
  background: 0,
  chooserMode: ChooserMode.NONE,
  setBackground: () => null,
  setChooserMode: () => null,
});

export const ChooserProvider = ({ children }: { children: ReactNode }) => {
  const [background, setBackground] = useState<number>(0);
  const [chooserMode, setChooserMode] = useState<ChooserMode>(ChooserMode.NONE);
  return (
    <ChooserContext.Provider value={{ background, chooserMode, setBackground, setChooserMode }}>
      {children}
    </ChooserContext.Provider>
  );
};
