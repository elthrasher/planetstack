import React, { createContext, ReactNode, useState } from 'react';

export interface Thing {
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
  return <ThingContext.Provider value={{ things, addThing, removeThing }}>{children}</ThingContext.Provider>;
};
