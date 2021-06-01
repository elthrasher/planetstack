import React, { useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { backgrounds, ChooserContext, ChooserMode, icons } from '../providers/ChooserProvider';
import { ThingContext } from '../providers/ThingProvider';

export const Chooser = () => {
  const { chooserMode, setBackground, setChooserMode } = useContext(ChooserContext);
  const { addThing } = useContext(ThingContext);

  const [bgPreview, setBGPreview] = useState(0);

  const chooseThing = (path: string) => {
    setChooserMode(ChooserMode.NONE);
    addThing({ id: uuidv4(), img: path, x: 400, y: 400 });
  };

  const chooseBG = () => {
    setChooserMode(ChooserMode.NONE);
    setBackground(bgPreview);
  };

  const goBack = () => setBGPreview(Math.max(bgPreview - 1, 0));
  const goFwd = () => setBGPreview(Math.min(bgPreview + 1, backgrounds.length - 1));
  switch (chooserMode) {
    case ChooserMode.BACKGROUND:
      return (
        <div className="container chooser">
          <i className="arrow left" onClick={goBack}></i>
          <img className="background" src={backgrounds[bgPreview].path} onClick={chooseBG} />
          <i className="arrow right" onClick={goFwd}></i>
        </div>
      );
    case ChooserMode.ICON:
      return (
        <div className="container chooser icons">
          {icons.map((icon) => (
            <img className="icon" key={icon.path} onMouseDown={() => chooseThing(icon.path)} src={icon.path} />
          ))}
        </div>
      );
  }
  return null;
};
