import React, { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, ScrollView } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { ServerCard } from './components/ServerCard';
import { useServerStore } from './store/server';
import {
  Button,
  PanningProvider,
  Text,
  View,
  ActionSheet,
  TextField,
  TouchableOpacity,
  Dialog,
} from 'react-native-ui-lib';
import { isValidUrl } from './lib/utils';
import { translate } from './lib/i18n';
import { getClientId } from './lib/notifications/getui';
import { useToast } from './hooks/useToast';

export const Entry: React.FC = React.memo(() => {
  const { serverList, selectServer, addServer, removeServer } =
    useServerStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState('');
  const [cid, setCid] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const { toastEl, showToast } = useToast();

  useEffect(() => {
    getClientId().then((cid) => {
      setCid(cid);
    });
  }, []);

  return (
    <View style={styles.root}>
      <ScrollView style={styles.main}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>財訊移动客户端</Text>
          <Text style={styles.title}>先选择工作区，再开始移动端体验</Text>
          <Text style={styles.description}>
            推荐优先使用默认工作区开始体验，进入后通过底部菜单查看消息、通讯录、发现和我的页面。
          </Text>
          <View style={styles.tipRow}>
            <Text style={styles.tip}>移动端入口</Text>
            <Text style={styles.tip}>支持添加自定义服务器</Text>
            <Text style={styles.tip}>底部菜单结构</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>可用工作区</Text>
          <Text style={styles.sectionDesc}>
            点击任一工作区即可进入，长按自定义服务器可删除。
          </Text>
        </View>

        {serverList.map((serverInfo, i) => {
          const isDefaultServer = i === 0;

          return (
            <ServerCard
              key={`${i}#${serverInfo.url}`}
              style={styles.item}
              name={serverInfo.name ?? serverInfo.url}
              url={serverInfo.url}
              version={serverInfo.version}
              badge={isDefaultServer ? '推荐' : '自定义'}
              subtitle={
                isDefaultServer
                  ? '建议从默认工作区开始体验移动端主路径'
                  : '你手动添加的服务器入口'
              }
              onPress={() => selectServer(serverInfo)}
              onLongPress={() => {
                if (!isDefaultServer) {
                  setSelectedServer(serverInfo.url);
                }
              }}
            />
          );
        })}

        <ServerCard
          name={translate('core.addServer')}
          subtitle="如果你有专属测试环境，也可以手动添加服务器。"
          badge="操作"
          onPress={() => setDialogVisible(true)}
        />

        <TouchableOpacity
          style={styles.guideToggle}
          onPress={() => setShowGuide((prev) => !prev)}
        >
          <Text style={styles.guideToggleText}>
            {showGuide ? '收起移动端使用建议' : '查看移动端使用建议'}
          </Text>
        </TouchableOpacity>
        {showGuide && (
          <View style={styles.supportPanel}>
            <Text style={styles.supportTitle}>移动端使用建议</Text>
            <Text style={styles.supportDesc}>
              推荐先在消息、通讯录、发现之间切换，确认窄屏浏览、底部菜单切换、刷新与恢复体验是否顺畅。
            </Text>
            <View style={styles.supportCard}>
              <Text style={styles.supportCardTitle}>建议查看项</Text>
              <Text style={styles.supportCardText}>1. 底部菜单切换是否顺畅</Text>
              <Text style={styles.supportCardText}>2. 动态浏览与详情滚动是否顺畅</Text>
              <Text style={styles.supportCardText}>3. 刷新、重试与恢复反馈是否明确</Text>
            </View>
            <View style={styles.supportCard}>
              <Text style={styles.supportCardTitle}>出现问题先做什么</Text>
              <Text style={styles.supportCardText}>1. 先刷新当前工作区</Text>
              <Text style={styles.supportCardText}>2. 再切换工作区确认是否为单环境问题</Text>
              <Text style={styles.supportCardText}>3. 必要时回到 Web 状态中心确认服务健康度</Text>
            </View>
            <View style={styles.supportActions}>
              <TouchableOpacity
                style={styles.supportActionBtn}
                onPress={() => {
                  Linking.openURL('https://tailchat.msgbyte.com/docs/intro');
                }}
              >
                <Text style={styles.supportActionText}>查看文档</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.supportActionBtn}
                onPress={() => {
                  Linking.openURL('https://tailchat.msgbyte.com/entry/trust');
                }}
              >
                <Text style={styles.supportActionText}>安全与合规</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.supportActionBtn}
                onPress={() => {
                  Linking.openURL('https://tailchat.msgbyte.com/downloads');
                }}
              >
                <Text style={styles.supportActionText}>下载说明</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ActionSheet
          visible={!!selectedServer}
          message={`${translate('core.selectedServer')}: ${selectedServer}`}
          onDismiss={() => setSelectedServer('')}
          destructiveButtonIndex={0}
          options={[
            {
              label: translate('core.deleteServer'),
              onPress: () => {
                removeServer(selectedServer);
              },
            },
          ]}
          showCancelButton={true}
        />

        <Dialog
          visible={dialogVisible}
          panDirection={PanningProvider.Directions.DOWN}
          onDismiss={() => setDialogVisible(false)}
        >
          <View backgroundColor="white" style={styles.dialog}>
            <Text>{translate('core.inputServerUrl')}:</Text>

            <TextField
              style={styles.textInput}
              migrate={true}
              inputMode="url"
              value={serverUrl}
              onChangeText={setServerUrl}
            />

            <Button
              label={translate('core.confirm')}
              disabled={loading}
              onPress={async () => {
                if (!isValidUrl(serverUrl)) {
                  Alert.alert(translate('core.invalidUrl'));
                  return;
                }

                setLoading(true);
                try {
                  await addServer(serverUrl);
                  setDialogVisible(false);
                } catch (e) {
                  Alert.alert(translate('core.addServerError'));
                }

                setLoading(false);
              }}
            />
          </View>
        </Dialog>
      </ScrollView>

      <View>
        <TouchableOpacity
          onPress={() => {
            Clipboard.setString(cid);
            showToast(translate('core.copySuccess'));
          }}
        >
          <Text grey40 center={true}>
            cid: {cid}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          当前版本建议先通过 Web 与默认工作区完成主链路体验，再进入移动端验证窄屏使用感受。
        </Text>
      </View>

      {toastEl}
    </View>
  );
});
Entry.displayName = 'Entry';

const styles = StyleSheet.create({
  root: {
    height: '100%',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  main: {
    flex: 1,
  },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  kicker: {
    color: '#94a3b8',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    lineHeight: 32,
  },
  description: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 22,
    marginTop: 10,
  },
  tipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  tip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#e2e8f0',
    fontSize: 11,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionDesc: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 20,
    color: '#64748b',
  },
  item: {
    marginBottom: 8,
  },
  dialog: {
    borderRadius: 8,
    padding: 10,
  },
  textInput: {
    fontSize: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  footerText: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    color: '#64748b',
  },
  supportPanel: {
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d7dee7',
  },
  guideToggle: {
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d7dee7',
  },
  guideToggleText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  supportDesc: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 20,
    color: '#64748b',
  },
  supportCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
  },
  supportCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  supportCardText: {
    fontSize: 12,
    lineHeight: 20,
    color: '#475569',
  },
  supportActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  supportActionBtn: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  supportActionText: {
    fontSize: 11,
    color: '#0b4a8b',
    fontWeight: '600',
  },
});
