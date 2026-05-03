import { render, screen } from '@testing-library/react';
import React from 'react';
import { GroupSpeakPolicyEditor } from '../GroupSpeakPolicyEditor';

describe('GroupSpeakPolicyEditor', () => {
  test('renders speak policy sections', () => {
    render(
      <GroupSpeakPolicyEditor
        roles={[{ _id: 'r1', name: '管理员', permissions: [] } as any]}
        value={{ enabled: true }}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('发言治理')).toBeTruthy();
    expect(screen.getByText('默认成员规则')).toBeTruthy();
    expect(screen.getByText('机器人规则')).toBeTruthy();
    expect(screen.getByText('管理员')).toBeTruthy();
    expect(screen.getByText('气泡背景色')).toBeTruthy();
    expect(screen.getByText('角色徽标')).toBeTruthy();
  });
});
