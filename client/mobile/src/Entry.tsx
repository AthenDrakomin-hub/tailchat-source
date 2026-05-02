import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, ScrollView } from 'react-native';
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
          <Text style={styles.title}>先选择工作区，再开始移动端内测体验</Text>
          <Text style={styles.description}>
            当前移动端已进入客户端入口完善阶段，适合内部测试用户随时查看动态、群讨论和消息流。推荐优先使用默认工作区开始体验。
          </Text>
          <View style={styles.tipRow}>
            <Text style={styles.tip}>移动端内测</Text>
            <Text style={styles.tip}>支持添加自定义服务器</Text>
            <Text style={styles.tip}>后续继续推进商城上架准备</Text>
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
});
