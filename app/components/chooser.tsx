import React, { useContext, useState } from 'react';

import { backgrounds } from '../../types/data/backgrounds';
import { icons } from '../../types/data/icons';
import { MessageAction } from '../../types/MessageAction';
import { ChooserContext, ChooserMode } from '../providers/ChooserProvider';
import { WSContext } from '../providers/WSProvider';

export const Chooser = (): JSX.Element | null => {
  const { chooserMode, setChooserMode } = useContext(ChooserContext);
  const { sendMessage } = useContext(WSContext);

  const [bgPreview, setBGPreview] = useState(0);

  const chooseIcon = (img: number) => () => {
    setChooserMode(ChooserMode.NONE);
    sendMessage(JSON.stringify({ action: MessageAction.ADD_ICON, icon: { img, x: 400, y: 400 } }));
  };

  const chooseBG = () => {
    setChooserMode(ChooserMode.NONE);
    sendMessage(JSON.stringify({ action: MessageAction.CHANGE_BACKGROUND, bg: bgPreview }));
  };

  const goBack = () => setBGPreview(Math.max(bgPreview - 1, 0));
  const goFwd = () => setBGPreview(Math.min(bgPreview + 1, backgrounds.length - 1));
  switch (chooserMode) {
    case ChooserMode.BACKGROUND:
      return (
        <div className="container chooser">
          <i className="arrow left" data-testid="arrow-left" onClick={goBack}></i>
          <img className="background" src={backgrounds[bgPreview].path} onClick={chooseBG} />
          <i className="arrow right" data-testid="arrow-right" onClick={goFwd}></i>
        </div>
      );
    case ChooserMode.ICON:
      return (
        <div className="container chooser icons">
          {icons.map((icon, index) => (
            <img className="icon" key={index} onMouseDown={chooseIcon(index)} src={icon.path} />
          ))}
        </div>
      );
    case ChooserMode.INSTRUCTIONS:
      return (
        <div className="container chooser">
          <ul>
            <li>Select a background</li>
            <li>Click icons to add them</li>
            <li>Drag icons to your liking</li>
            <li>Right click to dismiss an icon</li>
          </ul>
        </div>
      );
    default:
      return null;
  }
};
