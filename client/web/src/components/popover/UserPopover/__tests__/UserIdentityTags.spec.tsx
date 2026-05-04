import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserIdentityTags } from '../UserIdentityTags';

describe('UserIdentityTags', () => {
  test('renders only visitor tag for temporary user', () => {
    render(<UserIdentityTags userInfo={{ temporary: true } as any} />);

    expect(screen.getByText('游客')).toBeTruthy();
  });

  test('renders nothing for normal user without business tags', () => {
    const { container } = render(
      <UserIdentityTags userInfo={{ temporary: false } as any} />
    );

    expect(container.textContent).toBe('');
  });
});
