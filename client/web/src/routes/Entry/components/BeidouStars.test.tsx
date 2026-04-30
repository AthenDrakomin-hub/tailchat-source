import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import * as shared from 'tailchat-shared';
import { BeidouStars } from './BeidouStars';
import { openModal } from '@/components/Modal';

jest.mock('@/components/Modal', () => ({
  openModal: jest.fn(),
}));

describe('BeidouStars', () => {
  beforeEach(() => {
    (openModal as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not render polyline dashed connector', () => {
    jest
      .spyOn(shared, 'useGlobalConfigStore')
      .mockImplementation((selector: any) => selector({ beidouStarsCards: [] }));

    const { container } = render(<BeidouStars />);
    expect(container.querySelector('polyline')).toBeNull();
  });

  it('should use configured cards when provided', () => {
    const cards = Array.from({ length: 7 }).map((_, i) => ({
      id: `id-${i}`,
      name: `Name ${i}`,
      title: `Title ${i}`,
      bio: `Bio ${i}`,
      tags: [`t${i}`],
      avatar: `https://example.com/a${i}.png`,
      verifiedText: i === 0 ? '认证信息' : '',
      footerLeftText: 'FOOTER',
    }));

    jest
      .spyOn(shared, 'useGlobalConfigStore')
      .mockImplementation((selector: any) => selector({ beidouStarsCards: cards }));

    const { container } = render(<BeidouStars />);
    const nodes = container.querySelectorAll('.star-node');
    expect(nodes.length).toBeGreaterThanOrEqual(7);

    fireEvent.click(nodes[0]);
    expect(openModal).toHaveBeenCalledTimes(1);

    const reactNode = (openModal as jest.Mock).mock.calls[0][0];
    expect(reactNode.props.profile.name).toBe('Name 0');
    expect(reactNode.props.profile.avatar).toBe('https://example.com/a0.png');
    expect(reactNode.props.profile.verifiedText).toBe('认证信息');
    expect(reactNode.props.profile.footerLeftText).toBe('FOOTER');
  });
});
