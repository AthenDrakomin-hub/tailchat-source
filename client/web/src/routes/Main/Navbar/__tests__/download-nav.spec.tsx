import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DownloadNav } from '../DownloadNav';

describe('caixun download navbar entry', () => {
  test('contains client downloads as a first-level entry', () => {
    const { container } = render(
      <MemoryRouter>
        <DownloadNav />
      </MemoryRouter>
    );

    expect(container.querySelector('[data-tc-role="navbar-downloads"]')).toBeTruthy();
  });
});
