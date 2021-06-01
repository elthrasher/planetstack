import React, { createContext, ReactNode, useState } from 'react';
import useWebSocket from 'react-use-websocket';

const socketUrl = 'wss://jdnif5uxok.execute-api.us-east-1.amazonaws.com/dev';

export interface Thing {
  id: string;
  img: string;
  x: number;
  y: number;
}

export interface ThingContextModel {
  things: Thing[];
  addThing: (thing: Thing) => void;
  removeThing: (thing: Thing) => void;
}

export const ThingContext = createContext<ThingContextModel>({
  things: [],
  addThing: () => null,
  removeThing: () => null,
});

export const ThingProvider = ({ children }: { children: ReactNode }) => {
  const [things, setThings] = useState<Thing[]>([]);
  const addThing = (thing: Thing) => setThings([...things, thing]);
  const removeThing = (thing: Thing) => setThings(things.filter((t) => t !== thing));
  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState, getWebSocket } = useWebSocket(
    socketUrl,
    {
      onError: (e) => console.error(e),
      onOpen: () => console.log(),
      //Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: () => true,
    },
  );
  console.log(readyState);
  return <ThingContext.Provider value={{ things, addThing, removeThing }}>{children}</ThingContext.Provider>;
};
