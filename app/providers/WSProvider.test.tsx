import { act, renderHook } from '@testing-library/react-hooks';
import React, { ReactNode, useContext } from 'react';

import { WSContext, WSProvider } from './WSProvider';

const sendMessage = jest.fn();

jest.mock('react-use-websocket', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    sendMessage,
  })),
}));

describe('WSProvider', () => {
  test('Send a message', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <WSProvider>{children}</WSProvider>;
    const { result } = renderHook(() => useContext(WSContext), { wrapper });
    act(() => {
      result.current.sendMessage(JSON.stringify({ message: 'blah' }));
    });
    expect(sendMessage).toHaveBeenCalledWith(JSON.stringify({ message: 'blah' }));
  });
});
