import React, { useContext, useState } from 'react';

import { ChooserContext, backgrounds } from '../providers/ChooserProvider';
import { ThingContext } from '../providers/ThingProvider';
import { Chooser } from './chooser';
import { Header } from './header';
import { DraggableThing } from './draggable-thing';

export const Page = () => {
  const { background } = useContext(ChooserContext);
  const { things } = useContext(ThingContext);
  return (
    <div
      style={{
        backgroundImage: `url('${backgrounds[background].path}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        display: 'block',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Header />
      <Chooser />
      {things.map((thing, index) => (
        <DraggableThing key={index} thing={thing} />
      ))}
    </div>
  );
};
