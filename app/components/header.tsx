import React, { useContext } from 'react';
import { ChooserContext, ChooserMode } from '../providers/ChooserProvider';
import { Button } from './button';

export const Header = () => {
  const { chooserMode, setChooserMode } = useContext(ChooserContext);
  const toggleBG = () =>
    chooserMode === ChooserMode.BACKGROUND ? setChooserMode(ChooserMode.NONE) : setChooserMode(ChooserMode.BACKGROUND);
  const toggleAdd = () =>
    chooserMode === ChooserMode.ICON ? setChooserMode(ChooserMode.NONE) : setChooserMode(ChooserMode.ICON);
  return (
    <div className="container header">
      <Button onClick={toggleBG} text="background" />
      <Button onClick={toggleAdd} text="add icon" />
    </div>
  );
};
