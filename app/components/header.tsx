import React, { useContext } from 'react';

import { ChooserContext, ChooserMode } from '../providers/ChooserProvider';

export const Header = (): JSX.Element => {
  const { chooserMode, setChooserMode } = useContext(ChooserContext);
  const toggleChooser = (mode: ChooserMode) => () => setChooserMode(chooserMode === mode ? ChooserMode.NONE : mode);
  return (
    <div className="container header">
      <button onClick={toggleChooser(ChooserMode.BACKGROUND)}>background</button>
      <button onClick={toggleChooser(ChooserMode.ICON)}>add icon</button>
      <button onClick={toggleChooser(ChooserMode.INSTRUCTIONS)}>instructions</button>
    </div>
  );
};
