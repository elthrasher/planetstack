import React, { useContext } from 'react';

import { backgrounds } from '../../types/data/backgrounds';
import { WSContext } from '../providers/WSProvider';
import { Chooser } from './chooser';
import { DraggableIcon } from './draggable-icon';
import { Header } from './header';

export const Page = (): JSX.Element => {
  const { gs } = useContext(WSContext);
  return (
    <div
      style={{
        backgroundImage: `url('${backgrounds[gs.bg].path}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        display: 'block',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Header />
      <Chooser />
      {Object.entries(gs.icons).map(([key, icon]) => (
        <DraggableIcon icon={icon} id={key} key={key} />
      ))}
    </div>
  );
};
