import { act, renderHook } from '@testing-library/react-hooks';
import React, { ReactNode, useContext } from 'react';

import { ChooserContext, ChooserMode, ChooserProvider } from './ChooserProvider';

describe('ChooserProvider', () => {
  test('Update the chooser mode', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <ChooserProvider>{children}</ChooserProvider>;
    const { result } = renderHook(() => useContext(ChooserContext), { wrapper });
    act(() => {
      result.current.setChooserMode(ChooserMode.BACKGROUND);
    });
    expect(result.current.chooserMode).toBe(ChooserMode.BACKGROUND);
  });
});
