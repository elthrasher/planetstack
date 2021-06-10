import { render } from '@testing-library/react';
import React from 'react';

import { ChooserContext, ChooserMode } from '../providers/ChooserProvider';
import { Header } from './header';

const setChooserMode = jest.fn();

describe('header component', () => {
  test.each`
    oldMode                     | click | newMode
    ${ChooserMode.BACKGROUND}   | ${0}  | ${ChooserMode.NONE}
    ${ChooserMode.BACKGROUND}   | ${1}  | ${ChooserMode.ICON}
    ${ChooserMode.BACKGROUND}   | ${2}  | ${ChooserMode.INSTRUCTIONS}
    ${ChooserMode.ICON}         | ${0}  | ${ChooserMode.BACKGROUND}
    ${ChooserMode.ICON}         | ${1}  | ${ChooserMode.NONE}
    ${ChooserMode.ICON}         | ${2}  | ${ChooserMode.INSTRUCTIONS}
    ${ChooserMode.INSTRUCTIONS} | ${0}  | ${ChooserMode.BACKGROUND}
    ${ChooserMode.INSTRUCTIONS} | ${1}  | ${ChooserMode.ICON}
    ${ChooserMode.INSTRUCTIONS} | ${2}  | ${ChooserMode.NONE}
    ${ChooserMode.NONE}         | ${0}  | ${ChooserMode.BACKGROUND}
    ${ChooserMode.NONE}         | ${1}  | ${ChooserMode.ICON}
    ${ChooserMode.NONE}         | ${2}  | ${ChooserMode.INSTRUCTIONS}
  `('blah', ({ oldMode, click, newMode }) => {
    const { getAllByRole } = render(
      <ChooserContext.Provider value={{ chooserMode: oldMode, setChooserMode }}>
        <Header />
      </ChooserContext.Provider>,
    );
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(3);
    buttons[click].click();
    expect(setChooserMode).toHaveBeenCalledWith(newMode);
  });
});
