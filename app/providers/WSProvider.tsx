// State management for connecting to the websocket api.
// Each time the client gets a message, the gamestate will be updated.
// Calls `sendJsonMessage` to send updates to the backend.
// All messaging is one-way.
import React, { createContext, ReactNode, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { GameStateModel } from '../../types/gamestate';
import { MessageModel } from '../../types/message';
import { MessageAction } from '../../types/MessageAction';

// UI code expects to find `config.json` containing the `socketUrl` and `stageName` parameters for use in connecting to the backend API.
// These are automatically set in the deployment process.
/* istanbul ignore next */
const getSocketUrl = async () => {
  const response = await fetch('./config.json');
  const config = await response.json();
  return `${config.socketUrl}/${config.stageName}`;
};

const defaultGs: GameStateModel = { bg: 0, icons: {} };

export interface WSContextModel {
  gs: GameStateModel;
  sendMessage: <T extends MessageModel>(message: T) => void;
}

export const WSContext = createContext<WSContextModel>({
  gs: defaultGs,
  sendMessage: () => null,
});

export const WSProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [gs, setGs] = useState(defaultGs);
  /* istanbul ignore next */
  const { sendJsonMessage } = useWebSocket(getSocketUrl, {
    onOpen: () => sendJsonMessage({ action: MessageAction.GET_STATE }),
    onError: (e) => console.error(e),
    onMessage: (message: MessageEvent<string>) => {
      try {
        const jsonMessage = JSON.parse(message.data);
        if (jsonMessage.message) {
          // indicates an error from the server. Error handling is just to log it to the console.
          // This error must be captured or it will cause display problems.
          console.error('An error has occurred: ', jsonMessage);
        } else {
          setGs(jsonMessage);
        }
      } catch (e) {
        // Unlikely event we get an unparsable response.
        console.error('Unable to parse JSON: ', e);
      }
    },
    share: true,
    shouldReconnect: () => true,
  });
  const sendMessage = <T extends MessageModel>(message: T) => sendJsonMessage(message);
  return <WSContext.Provider value={{ gs, sendMessage }}>{children}</WSContext.Provider>;
};
