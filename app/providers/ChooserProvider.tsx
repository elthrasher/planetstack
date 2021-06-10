import React, { createContext, ReactNode, useState } from 'react';

export enum ChooserMode {
  NONE,
  BACKGROUND,
  ICON,
  INSTRUCTIONS,
}

export interface ChooserContextModel {
  chooserMode: ChooserMode;
  setChooserMode: (chooserMode: ChooserMode) => void;
}

export const ChooserContext = createContext<ChooserContextModel>({
  chooserMode: ChooserMode.NONE,
  setChooserMode: /* istanbul ignore next */ () => null,
});

export const ChooserProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [chooserMode, setChooserMode] = useState<ChooserMode>(ChooserMode.NONE);

  return <ChooserContext.Provider value={{ chooserMode, setChooserMode }}>{children}</ChooserContext.Provider>;
};
