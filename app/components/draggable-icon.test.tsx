import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { MessageAction } from '../../types/MessageAction';
import { WSContext } from '../providers/WSProvider';
import { DraggableIcon } from './draggable-icon';

const sendJsonMessage = jest.fn();

// Thanks https://github.com/testing-library/user-event/issues/440
const fireMouseEvent = function (type: string, elem: EventTarget, centerX: number, centerY: number) {
  act(() => {
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(type, true, true, window, 1, 1, 1, centerX, centerY, false, false, false, false, 0, elem);
    elem.dispatchEvent(evt);
  });
};

describe('draggable icon component', () => {
  test('Move from 400x400 to 499x499', () => {
    const { container, getByRole } = render(<DraggableIcon icon={{ img: 0, x: 400, y: 400 }} id={'abc-123'} />);
    expect(container).toMatchSnapshot();
    const img = getByRole('img');
    expect(img).toHaveClass('thing');
    fireMouseEvent('mousemove', img, 401, 401);
    fireMouseEvent('mouseenter', img, 401, 401);
    fireMouseEvent('mouseover', img, 401, 401);
    fireMouseEvent('mousedown', img, 401, 401);

    fireMouseEvent('drag', img, 401, 401);
    fireMouseEvent('mousemove', img, 401, 401);
    fireMouseEvent('drag', img, 500, 500);
    fireMouseEvent('mousemove', img, 500, 500);
    fireMouseEvent('drop', img, 500, 500);
    fireMouseEvent('dragend', img, 500, 500);
    fireMouseEvent('mouseup', img, 500, 500);
    expect(container).toMatchSnapshot();
    expect(img).toHaveAttribute('style', 'transform: translate(499px,499px);');
  });
  test('Remove the component', () => {
    const { container, getByRole } = render(
      <WSContext.Provider value={{ gs: { bg: 0, icons: {} }, sendJsonMessage }}>
        <DraggableIcon icon={{ img: 0, x: 400, y: 400 }} id={'abc-123'} />
      </WSContext.Provider>,
    );
    expect(container).toMatchSnapshot();
    const img = getByRole('img');
    expect(img).toHaveClass('thing');
    fireEvent.contextMenu(img);
    expect(sendJsonMessage).toHaveBeenCalledWith({ action: MessageAction.DELETE_ICON, id: 'abc-123' });
  });
});
