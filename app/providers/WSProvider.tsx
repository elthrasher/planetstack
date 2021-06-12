import React, { createContext, ReactNode, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { SendJsonMessage } from 'react-use-websocket/dist/lib/types';

import { GameStateModel } from '../../types/gamestate';
import { MessageAction } from '../../types/MessageAction';

/* istanbul ignore next */
const getSocketUrl = async () => {
  const response = await fetch('./config.json');
  const config = await response.json();
  return `${config.socketUrl}/${config.stageName}`;
};

const defaultGs: GameStateModel = { bg: 0, icons: {} };

export interface WSContextModel {
  gs: GameStateModel;
  sendJsonMessage: SendJsonMessage;
}

export const WSContext = createContext<WSContextModel>({
  gs: defaultGs,
  sendJsonMessage: () => null,
});

export const WSProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [gs, setGs] = useState(defaultGs);
  /* istanbul ignore next */
  const { sendJsonMessage } = useWebSocket(getSocketUrl, {
    onOpen: () => sendJsonMessage({ action: MessageAction.GET_STATE }),
    onError: (e) => console.error(e),
    onMessage: (message: MessageEvent<string>) => setGs(JSON.parse(message.data)),
    share: true,
    shouldReconnect: () => true,
  });
  return <WSContext.Provider value={{ gs, sendJsonMessage }}>{children}</WSContext.Provider>;
};
