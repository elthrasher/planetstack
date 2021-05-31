import './App.scss';

import React from 'react';

import { Page } from './components/page';
import { ChooserProvider } from './providers/ChooserProvider';
import { ThingProvider } from './providers/ThingProvider';

const App = (): JSX.Element => (
  <ThingProvider>
    <ChooserProvider>
      <Page />
    </ChooserProvider>
  </ThingProvider>
);

export default App;
