import { render } from '@testing-library/react';
import { Page } from './page';
import React from 'react';
import { WSContext } from '../providers/WSProvider';

describe('main page', () => {
  test('render the page', () => {
    const { container } = render(
      <WSContext.Provider
        value={{ gs: { bg: 0, icons: { 'abc-123': { img: 0, x: 400, y: 400 } } }, sendMessage: jest.fn() }}
      >
        <Page />
      </WSContext.Provider>,
    );
    expect(container).toMatchSnapshot();
  });
});
