import React, { useContext } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import { Thing, ThingContext } from '../providers/ThingProvider';

export const DraggableThing = ({ thing }: { thing: Thing }) => {
  const { removeThing } = useContext(ThingContext);
  const handleDoubleClick = () => removeThing(thing);
  const handleStop = (e: DraggableEvent, d: DraggableData) => {
    console.log(e);
    console.log(d);
  };
  return (
    <Draggable defaultPosition={thing} onStop={handleStop}>
      <img className="thing" onDoubleClick={handleDoubleClick} src={thing.img} />
    </Draggable>
  );
};
