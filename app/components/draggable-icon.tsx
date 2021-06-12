import React, { MouseEvent, useContext, useMemo, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import { icons } from '../../types/data/icons';
import { IconModel } from '../../types/icon';
import { MessageAction } from '../../types/MessageAction';
import { WSContext } from '../providers/WSProvider';

export const DraggableIcon = ({ icon, id }: { icon: IconModel; id: string }): JSX.Element => {
  const { sendJsonMessage } = useContext(WSContext);
  // Track local state for dragging, but update if we get a new message
  const [pos, setPos] = useState({ x: icon.x, y: icon.y });
  useMemo(() => setPos({ x: icon.x, y: icon.y }), [icon]);
  const handleContextMenu = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    sendJsonMessage({ action: MessageAction.DELETE_ICON, id });
  };
  const handleStop = (_e: DraggableEvent, d: DraggableData) => {
    setPos({ x: d.x, y: d.y });
    sendJsonMessage({ action: MessageAction.MOVE_ICON, id, img: icon.img, x: d.x, y: d.y });
  };
  return (
    <Draggable position={pos} onStop={handleStop}>
      <img className="thing" onContextMenu={handleContextMenu} src={icons[icon.img].path} />
    </Draggable>
  );
};
