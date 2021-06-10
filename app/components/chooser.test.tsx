import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ChooserContext, ChooserMode } from '../providers/ChooserProvider';
import { Chooser } from './chooser';

const setChooser = jest.fn();

describe('Chooser component', () => {
  beforeEach(jest.resetAllMocks);

  test('No render when chooser mode is blank', () => {
    const { container } = render(
      <ChooserContext.Provider value={{ chooserMode: ChooserMode.NONE, setChooserMode: setChooser }}>
        <Chooser />
      </ChooserContext.Provider>,
    );
    expect(container).toMatchSnapshot();
  });

  test('Render the background chooser', () => {
    const { container } = render(
      <ChooserContext.Provider value={{ chooserMode: ChooserMode.BACKGROUND, setChooserMode: setChooser }}>
        <Chooser />
      </ChooserContext.Provider>,
    );
    expect(container).toMatchSnapshot();
    const leftArrow = screen.getByTestId('arrow-left');
    const rightArrow = screen.getByTestId('arrow-right');
    const img = screen.getByRole('img');
    expect(img).toHaveClass('background');
    img.click();
    expect(setChooser).toHaveBeenCalledTimes(1);
    const bg1 = img.getAttribute('src');
    // navigate forward
    rightArrow.click();
    const bg2 = img.getAttribute('src');
    // navigate back
    leftArrow.click();
    const bg3 = img.getAttribute('src');
    // 1st and 2nd images are different
    expect(bg1).not.toEqual(bg2);
    // 3rd image is the same
    expect(bg1).toEqual(bg3);
  });

  test('Render the icon chooser', () => {
    const { container } = render(
      <ChooserContext.Provider value={{ chooserMode: ChooserMode.ICON, setChooserMode: setChooser }}>
        <Chooser />
      </ChooserContext.Provider>,
    );
    expect(container).toMatchSnapshot();
    const imgs = screen.getAllByRole('img');
    expect(imgs.length).toBeGreaterThan(0);
    fireEvent.mouseDown(imgs[0]);
    expect(setChooser).toHaveBeenCalledTimes(1);
  });

  test('Render instructions', () => {
    const { container } = render(
      <ChooserContext.Provider value={{ chooserMode: ChooserMode.INSTRUCTIONS, setChooserMode: setChooser }}>
        <Chooser />
      </ChooserContext.Provider>,
    );
    expect(container).toHaveTextContent('Select a background');
    expect(container).toMatchSnapshot();
  });
});
