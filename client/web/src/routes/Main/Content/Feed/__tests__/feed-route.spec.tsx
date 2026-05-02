import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { FeedPage } from '..';

jest.mock('tailchat-shared', () => {
  const actual = jest.requireActual('tailchat-shared');

  return {
    ...actual,
    listFeedPosts: jest.fn().mockResolvedValue([]),
    showErrorToasts: jest.fn(),
  };
});

describe('caixun feed route', () => {
  test('renders feed heading and composer', () => {
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('动态').length).toBeGreaterThan(0);
    expect(
      screen.getByPlaceholderText('分享今天的市场观察或活动预告')
    ).toBeTruthy();
  });
});
