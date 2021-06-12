import { act, renderHook } from '@testing-library/react-hooks';
import React, { ReactNode, useContext } from 'react';

import { WSContext, WSProvider } from './WSProvider';

const sendJsonMessage = jest.fn();

jest.mock('react-use-websocket', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    sendJsonMessage,
  })),
}));

describe('WSProvider', () => {
  test('Send a message', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <WSProvider>{children}</WSProvider>;
    const { result } = renderHook(() => useContext(WSContext), { wrapper });
    act(() => {
      result.current.sendJsonMessage({ message: 'blah' });
    });
    expect(sendJsonMessage).toHaveBeenCalledWith({ message: 'blah' });
  });
});
