import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FeedNav } from '../FeedNav';

describe('caixun main navbar', () => {
  test('contains feed as a first-level entry', () => {
    const { container } = render(
      <MemoryRouter>
        <FeedNav />
      </MemoryRouter>
    );

    expect(container.querySelector('[data-tc-role="navbar-feed"]')).toBeTruthy();
  });
});
