import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { EventBanner } from '../components/EventBanner';
import { TrustLinks } from '../components/TrustLinks';
import { AboutView } from '../AboutView';
import { LegalView } from '../LegalView';
import { TrustView } from '../TrustView';

describe('caixun entry trust surface', () => {
  test('shows the brand banner and trust links', () => {
    render(
      <MemoryRouter>
        <EventBanner />
        <TrustLinks />
      </MemoryRouter>
    );

    expect(screen.getByText('品牌资讯')).toBeTruthy();
    expect(screen.getByRole('link', { name: '關於我們' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '安全與合規' })).toBeTruthy();
  });

  test('renders formal about, legal and trust pages', () => {
    render(
      <MemoryRouter initialEntries={['/entry/privacy']}>
        <Routes>
          <Route path="/entry/about" element={<AboutView />} />
          <Route path="/entry/:type" element={<LegalView />} />
          <Route path="/entry/trust" element={<TrustView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('隱私政策')).toBeTruthy();
    expect(screen.getByText(/日本東京區域數據節點/)).toBeTruthy();
  });
});
