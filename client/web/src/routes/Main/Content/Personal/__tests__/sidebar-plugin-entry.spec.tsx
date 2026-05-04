import React from 'react';
import { render, screen } from '@testing-library/react';
import { PersonalSidebar } from '../Sidebar';

jest.mock('tailchat-shared', () => ({
  t: (value: string) => value,
  useDMConverseList: () => [],
  useUserInfo: () => ({ systemRole: 'teacher' }),
  useGlobalConfigStore: (selector: any) =>
    selector({
      disablePluginStore: false,
    }),
  useAppSelector: () => false,
}));

jest.mock('@/components/Modal', () => ({
  openModal: jest.fn(),
}));

jest.mock('@/components/modals/CreateDMConverse', () => ({
  CreateDMConverse: () => null,
}));

jest.mock('@/components/SectionHeader', () => ({
  SectionHeader: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/CommonSidebarWrapper', () => ({
  CommonSidebarWrapper: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('../SidebarDMItem', () => ({
  SidebarDMItem: () => null,
}));

jest.mock('../../SidebarItem', () => ({
  SidebarItem: ({ name }: any) => <div>{name}</div>,
}));

jest.mock('../../CustomSidebarItem', () => ({
  CustomSidebarItem: () => null,
}));

jest.mock('@/plugin/common', () => ({
  pluginCustomPanel: [],
}));

jest.mock('tailchat-design', () => ({
  Icon: () => null,
}));

describe('PersonalSidebar', () => {
  test('does not render plugin center entry', () => {
    render(<PersonalSidebar />);

    expect(screen.queryByText('插件中心')).toBeNull();
  });
});
