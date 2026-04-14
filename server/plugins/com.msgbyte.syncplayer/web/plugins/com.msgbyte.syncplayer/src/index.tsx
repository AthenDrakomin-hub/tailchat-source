import { regGroupPanelTop } from '@capital/common';
import { SyncPlayerPanel } from './SyncPlayerPanel';

const PLUGIN_NAME = '视频演播室';

console.log(`[Plugin] ${PLUGIN_NAME} 正在加载`);

regGroupPanelTop({
  name: 'com.msgbyte.syncplayer.top',
  render: SyncPlayerPanel,
});
