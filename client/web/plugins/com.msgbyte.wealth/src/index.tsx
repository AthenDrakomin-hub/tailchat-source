import { regCustomPanel, Loadable } from '@capital/common';
import React from 'react';

const PLUGIN_NAME = 'AI 财富助手';

console.log(`Plugin ${PLUGIN_NAME} is loaded`);

regCustomPanel({
  position: 'personal',
  icon: 'mdi:chart-line',
  name: 'com.msgbyte.wealth/wealthPanel',
  label: 'AI 财富助手',
  render: Loadable(() => import('./WealthPanel')),
});
