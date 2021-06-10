import './App.scss';

import React from 'react';

import { Page } from './components/page';
import { ChooserProvider } from './providers/ChooserProvider';
import { WSProvider } from './providers/WSProvider';

const App = (): JSX.Element => (
  <ChooserProvider>
    <WSProvider>
      <Page />
    </WSProvider>
  </ChooserProvider>
);

export default App;
